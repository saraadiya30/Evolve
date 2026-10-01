// Mass ejector (interstellar) dan transport/purifier (portal) per tick.
import { global, breakdown, gal_on, p_on } from '../../core/vars.js';
import { modRes } from '../../functions/resource_mod.js';
import { loc } from '../../core/locale.js';
import { supplyValue } from '../../resources/resources.js';
import { atomic_mass } from '../../resources/atomic_mass.js';
import { mechCollect } from '../../portal/mech/mechbay.js';

export function fastLoopMassEjectorTransport($ctx){
        if (global.interstellar['mass_ejector']){
            let total = 0;
            let mass = 0;
            let exotic = 0;
            Object.keys(global.interstellar.mass_ejector).forEach(function (res){
                if (atomic_mass[res]){
                    let ejected = global.interstellar.mass_ejector[res];
                    if (total + ejected > p_on['mass_ejector'] * 1000){
                        ejected = p_on['mass_ejector'] * 1000 - total;
                    }
                    total += ejected;

                    if (ejected > 0){
                        breakdown.p.consume[res][loc('interstellar_blackhole_name')] = -(ejected);
                    }

                    if (ejected * $ctx.time_multiplier > global.resource[res].amount){
                        ejected = global.resource[res].amount / $ctx.time_multiplier;
                    }
                    if (ejected < 0){
                        ejected = 0;
                    }

                    modRes(res, -($ctx.time_multiplier * ejected));
                    mass += ejected * atomic_mass[res];
                    if (global.race.universe !== 'magic' && (res === 'Elerium' || res === 'Infernite')){
                        exotic += ejected * atomic_mass[res];
                    }
                }
            });
            global.interstellar.mass_ejector.mass = mass;
            global.interstellar.mass_ejector.total = total;

            global.interstellar.stellar_engine.mass += mass / 10000000000 * $ctx.time_multiplier;
            global.interstellar.stellar_engine.exotic += exotic / 10000000000 * $ctx.time_multiplier;
        }

        if (global.portal['transport'] && global.portal['purifier']){
            let total = 0;
            let supply = 0;
            let bireme_rating = global.blood['spire'] && global.blood.spire >= 2 ? 0.8 : 0.85;
            let cargoSize = global.stats.achieve['what_is_best'] && global.stats.achieve.what_is_best.e >= 4 ? 8 : 5;
            Object.keys(global.portal.transport.cargo).forEach(function (res){
                if (supplyValue[res]){
                    let shipped = global.portal.transport.cargo[res];
                    if (total + shipped > gal_on['transport'] * cargoSize){
                        shipped = gal_on['transport'] * cargoSize - total;
                    }
                    total += shipped;

                    let volume = shipped * supplyValue[res].out;
                    while (volume * $ctx.time_multiplier > global.resource[res].amount && volume > 0){
                        volume -= supplyValue[res].out;
                        shipped--;
                    }
                    if (volume > 0){
                        breakdown.p.consume[res][loc('portal_transport_title')] = -(volume);
                    }

                    let bireme = 1 - (bireme_rating ** (gal_on['bireme'] || 0));

                    modRes(res, -($ctx.time_multiplier * volume));
                    supply += Number(shipped * supplyValue[res].in * $ctx.time_multiplier * bireme);
                }
            });
            if (global.tech['hell_lake'] && global.tech.hell_lake >= 7 && global.tech['railway']){
                supply *= 1 + (global.tech.railway / 100);
            }
            if (global.portal['mechbay']){
                for (let i = 0; i < global.portal.mechbay.active; i++) {
                    let mech = global.portal.mechbay.mechs[i];
                    if (mech.size === 'collector') {
                        supply += mechCollect(mech) * $ctx.time_multiplier;
                    }
                    else if (mech.size === 'minion' && mech.equip.includes('scavenger')){
                        supply += mechCollect(mech) * $ctx.time_multiplier;
                    }
                }
            }
            global.portal.purifier.supply += supply;
            global.portal.purifier.diff = supply / $ctx.time_multiplier;
            if (global.portal.purifier.supply > global.portal.purifier.sup_max){
                global.portal.purifier.supply = global.portal.purifier.sup_max;
            }
        }
}
