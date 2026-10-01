// Kru dan bahan bakar kapal galaksi per tick: loop seluruh tipe kapal, konsumsi Helium-3/Deuterium Andromeda, dan penugasan crew.
import { global, breakdown, gal_on, p_on } from '../../core/vars.js';
import { modRes } from '../../functions/resource_mod.js';
import { loc } from '../../core/locale.js';
import { actions } from '../../core/registries.js';
import { int_fuel_adjust } from '../../space/planet_generation.js';
import { galaxy_ship_types } from '../../space/space.js';
import { shipCrewSize } from '../../truepath/ship_stats.js';

export function fastLoopGalaxyCrew($ctx){
        let crew_civ = 0;
        let crew_mil = 0;
        let total = 0;
        let andromeda_helium = 0;
        let andromeda_deuterium = 0;

        for (let j=0; j<galaxy_ship_types.length; j++){
            const area = galaxy_ship_types[j].area;
            const region = galaxy_ship_types[j].region;
            const req = galaxy_ship_types[j].hasOwnProperty('req') ? p_on[galaxy_ship_types[j].req] > 0 : true;
            const support_home = actions[area][region].info?.support;
            let used_support = 0;
            for (let i=0; i<galaxy_ship_types[j].ships.length; i++){
                const ship = galaxy_ship_types[j].ships[i];
                if (global[area][ship]){
                    let operating = 0;
                    if (global[area][ship].hasOwnProperty('on') && req && (p_on['s_gate'] || area !== 'galaxy')){
                        const id = actions[area][region][ship].id;
                        const num_on = global[area][ship].on;
                        operating = num_on;

                        // Support cost
                        const operating_cost = actions[area][region][ship].hasOwnProperty('support') ? -(actions[area][region][ship].support()) : 0;
                        if (operating_cost > 0){
                            const max_operating = Math.floor((global[area][support_home].s_max - used_support) / operating_cost);
                            operating = Math.min(operating, max_operating);
                        }

                        if (actions[area][region][ship].hasOwnProperty('ship')){
                            if (actions[area][region][ship].ship.civ && global[area][ship].hasOwnProperty('crew')){
                                // Civilian ships can only be crewed at a rate of 1 ship (per type) per fast tick
                                let civPerShip = actions[area][region][ship].ship.civ();
                                if (civPerShip > 0){
                                    if (global[area][ship].crew < 0){
                                        global[area][ship].crew = 0;
                                    }
                                    if (global[area][ship].crew < operating * civPerShip){
                                        if (total < global.resource[global.race.species].amount){
                                            if (global.civic[global.civic.d_job].workers >= civPerShip){
                                                global.civic[global.civic.d_job].workers -= civPerShip;
                                                global.civic.crew.workers += civPerShip;
                                                global[area][ship].crew += civPerShip;
                                            }
                                        }
                                    }
                                    else if (global[area][ship].crew > operating * civPerShip){
                                        global.civic[global.civic.d_job].workers += civPerShip;
                                        global.civic.crew.workers -= civPerShip;
                                        global[area][ship].crew -= civPerShip;
                                    }
                                    global.civic.crew.assigned = global.civic.crew.workers;
                                    crew_civ += global[area][ship].crew;
                                    total += global[area][ship].crew;
                                    operating = Math.min(operating, Math.floor(global[area][ship].crew / civPerShip));
                                }
                            }

                            if (actions[area][region][ship].ship.mil && global[area][ship].hasOwnProperty('mil')){
                                // All military ships can be crewed instantly
                                let milPerShip = actions[area][region][ship].ship.mil();
                                if (milPerShip > 0){
                                    if (global[area][ship].mil !== operating * milPerShip){
                                        global[area][ship].mil = operating * milPerShip;
                                    }
                                    if (global.civic.garrison.workers - global.portal.fortress.garrison < 0){
                                        let underflow = global.civic.garrison.workers - global.portal.fortress.garrison;
                                        global[area][ship].mil -= underflow;
                                    }
                                    if (crew_mil + global[area][ship].mil > global.civic.garrison.workers - global.portal.fortress.garrison){
                                        global[area][ship].mil = global.civic.garrison.workers - global.portal.fortress.garrison - crew_mil;
                                    }
                                    if (global[area][ship].mil < 0){
                                        global[area][ship].mil = 0;
                                    }
                                    crew_mil += global[area][ship].mil;
                                    operating = Math.min(operating, Math.floor(global[area][ship].mil / milPerShip));
                                }
                            }

                            if (actions[area][region][ship].ship.hasOwnProperty('helium')){
                                let increment = +int_fuel_adjust(actions[area][region][ship].ship.helium).toFixed(2);
                                let consume = operating * increment;
                                while (consume * $ctx.time_multiplier > global.resource.Helium_3.amount + (global.resource.Helium_3.diff > 0 ? global.resource.Helium_3.diff * $ctx.time_multiplier : 0) && operating > 0){
                                    consume -= increment;
                                    operating--;
                                }
                                modRes('Helium_3', -(consume * $ctx.time_multiplier));
                                andromeda_helium += consume;
                            }

                            if (actions[area][region][ship].ship.hasOwnProperty('deuterium')){
                                let increment = +int_fuel_adjust(actions[area][region][ship].ship.deuterium).toFixed(2);
                                let consume = operating * increment;
                                while (consume * $ctx.time_multiplier > global.resource.Deuterium.amount + (global.resource.Deuterium.diff > 0 ? global.resource.Deuterium.diff * $ctx.time_multiplier : 0) && operating > 0){
                                    consume -= increment;
                                    operating--;
                                }
                                modRes('Deuterium', -(consume * $ctx.time_multiplier));
                                andromeda_deuterium += consume;
                            }
                        }

                        if (operating < num_on){
                            $(`#${id} .on`).addClass('warn');
                            $(`#${id} .on`).prop('title',`ON ${operating}/${num_on}`);
                        }
                        else {
                            $(`#${id} .on`).removeClass('warn');
                            $(`#${id} .on`).prop('title',`ON`);
                        }

                        used_support += operating * operating_cost;
                    }
                    gal_on[ship] = operating;
                }
            }
            if (support_home && global?.[area]?.[support_home]?.hasOwnProperty('support')){
                global[area][support_home].support = used_support;
            }
        }

        breakdown.p.consume.Helium_3[loc('galaxy_fuel_consume')] = -(andromeda_helium);
        breakdown.p.consume.Deuterium[loc('galaxy_fuel_consume')] = -(andromeda_deuterium);

        global.civic.crew.workers = crew_civ;
        if (global.civic.garrison.hasOwnProperty('crew')){
            if (global.space.hasOwnProperty('shipyard') && global.space.shipyard.hasOwnProperty('ships')){
                global.space.shipyard.ships.forEach(function(ship){
                    if (ship.location !== 'spc_dwarf' || (ship.location === 'spc_dwarf' && ship.transit > 0)){
                        crew_mil += shipCrewSize(ship);
                    }
                });
            }
            global.civic.garrison.crew = crew_mil;
        }
        $ctx.crew_total = total; // dibaca fastLoopLaborAnomalies (dulu variabel lokal 'total' yang sama satu fungsi)
}
