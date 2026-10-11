// Batas storage dari shed, warehouse (interstellar, eden, portal), storehouse, repository, gateway depot, garage, dan harbor. Dulu bagian dari midLoop_s3.
import { global, breakdown, p_on } from '../../core/vars.js';
import { actions } from '../../core/registries.js';
import { storageMultipler } from '../../actions/challenge/challenge_rules.js';
import { loc } from '../../core/locale.js';
import { spatialReasoning } from '../../resources/resources.js';
import { gatewayStorage } from '../../space/space_requirements.js';
import { tpStorageMultiplier } from '../../truepath/support.js';

export function midLoopWarehouseCaps($ctx){
        if (global.city['shed']){
            let multiplier = storageMultipler();
            let label = global.tech['storage'] <= 2 ? loc('city_shed_title1') : (global.tech['storage'] >= 4 ? loc('city_shed_title3') : loc('city_shed_title2'));
            for (const res of actions.city.shed.res()){
                if (global.resource[res].display){
                    let gain = global.city.shed.count * spatialReasoning(actions.city.shed.val(res) * multiplier);
                    $ctx.caps[res] += gain;
                    breakdown.c[res][label] = gain+'v';
                }
            };
        }

        if (global.race['lone_survivor']){
            breakdown.c[global.race.species][loc('base')] = '1v';
            $ctx.caps[global.race.species] = 1;
        }

        if (global.interstellar['warehouse']){
            let multiplier = storageMultipler();
            let label = loc('interstellar_alpha_name');
            for (const res of actions.interstellar.int_alpha.warehouse.res()){
                if (global.resource[res].display){
                    let gain = global.interstellar.warehouse.count * spatialReasoning(actions.interstellar.int_alpha.warehouse.val(res) * multiplier);
                    $ctx.caps[res] += gain;
                    breakdown.c[res][label] = gain+'v';
                }
            };
        }

        if (global.eden['warehouse']){
            let multiplier = storageMultipler(global.race['warlord'] ? 1 : 0.2);
            if (global.race['warlord'] && global.eden['corruptor']){
                multiplier *= 1 + (p_on['corruptor'] || 0) * (global.tech.asphodel >= 12 ? (global.tech.asphodel >= 13 ? 0.16 : 0.12) : 0.08);
            }
            let label = loc('eden_asphodel_name');
            for (const res of actions.eden.eden_asphodel.warehouse.res()){
                if (global.resource[res].display){
                    let gain = global.eden.warehouse.count * spatialReasoning(actions.eden.eden_asphodel.warehouse.val(res) * multiplier);
                    $ctx.caps[res] += gain;
                    breakdown.c[res][label] = gain+'v';
                }
            };
        }

        if (global.portal['warehouse']){
            let multiplier = storageMultipler();
            if (global.race['warlord'] && global.eden['corruptor'] && global.tech.asphodel >= 12){
                multiplier *= 1 + (p_on['corruptor'] || 0) * (global.tech.asphodel >= 13 ? 0.16 : 0.12);
            }
            let label = global.tech['storage'] <= 2 ? loc('city_shed_title1') : (global.tech['storage'] >= 4 ? loc('city_shed_title3') : loc('city_shed_title2'));
            for (const res of actions.portal.prtl_wasteland.warehouse.res()){
                if (global.resource[res].display){
                    let gain = global.portal.warehouse.count * spatialReasoning(actions.portal.prtl_wasteland.warehouse.val(res) * multiplier);
                    $ctx.caps[res] += gain;
                    breakdown.c[res][label] = gain+'v';
                }
            };
            let cc_gain = global.portal.warehouse.count * (65 + global.portal.warehouse.rank * 35);
            $ctx.caps['Crates'] += cc_gain;
            breakdown.c['Crates'][label] = cc_gain+'v';
            $ctx.caps['Containers'] += cc_gain;
            breakdown.c['Containers'][label] = cc_gain+'v';
        }

        if (global.space['storehouse']){
            let multiplier = tpStorageMultiplier('storehouse',false);
            let h_multiplier = tpStorageMultiplier('storehouse',true);
            let label = loc('space_storehouse_title');
            for (const res of actions.space.spc_titan.storehouse.res()){
                if (global.resource[res].display){
                    let heavy = actions.space.spc_titan.storehouse.heavy(res);
                    let gain = global.space.storehouse.count * spatialReasoning(actions.space.spc_titan.storehouse.val(res) * (heavy ? h_multiplier : multiplier));
                    $ctx.caps[res] += gain;
                    breakdown.c[res][label] = gain+'v';
                }
            };
        }

        if (global.tauceti['repository']){
            let multiplier = tpStorageMultiplier('repository');
            let label = loc('tech_repository');
            for (const res of actions.tauceti.tau_home.repository.res()){
                if (global.resource[res].display){
                    let gain = global.tauceti.repository.count * spatialReasoning(actions.tauceti.tau_home.repository.val(res) * multiplier);
                    $ctx.caps[res] += gain;
                    breakdown.c[res][label] = gain+'v';
                }
            };
            if (global.tech['isolation']){
                let containers = 250;
                $ctx.caps['Containers'] += (global.tauceti.repository.count * containers);
                breakdown.c.Containers[loc('tech_repository')] = (global.tauceti.repository.count * containers) + 'v';
                $ctx.caps['Crates'] += (global.tauceti.repository.count * containers);
                breakdown.c.Crates[loc('tech_repository')] = (global.tauceti.repository.count * containers) + 'v';
            }
        }

        if (global.tech['isolation'] && p_on['tau_farm'] && global.race['artifical']){
            let gain = p_on['tau_farm'] * spatialReasoning(350);
            $ctx.caps['Food'] += gain;
            breakdown.c.Food[loc('tau_home_tau_farm')] = gain+'v';
        }

        if (global.galaxy['gateway_depot']){
            let containers = global.tech['world_control'] ? 150 : 100;
            $ctx.caps['Crates'] += (global.galaxy.gateway_depot.count * containers);
            breakdown.c.Crates[loc('galaxy_gateway_depot')] = (global.galaxy.gateway_depot.count * containers) + 'v';
            $ctx.caps['Containers'] += (global.galaxy.gateway_depot.count * containers);
            breakdown.c.Containers[loc('galaxy_gateway_depot')] = (global.galaxy.gateway_depot.count * containers) + 'v';

            let label = loc('galaxy_gateway_depot');
            let multiplier = gatewayStorage();

            if (global.resource.Uranium.display){
                let gain = (global.galaxy.gateway_depot.count * (spatialReasoning(3000 * multiplier)));
                $ctx.caps['Uranium'] += gain;
                breakdown.c.Uranium[label] = gain+'v';
            }

            if (global.resource.Nano_Tube.display){
                let gain = (global.galaxy.gateway_depot.count * (spatialReasoning(250000 * multiplier)));
                $ctx.caps['Nano_Tube'] += gain;
                breakdown.c.Nano_Tube[label] = gain+'v';
            }

            if (global.resource.Neutronium.display){
                let gain = (global.galaxy.gateway_depot.count * (spatialReasoning(9001 * multiplier)));
                $ctx.caps['Neutronium'] += gain;
                breakdown.c.Neutronium[label] = gain+'v';
            }

            if (global.resource.Infernite.display){
                let gain = (global.galaxy.gateway_depot.count * (spatialReasoning(6660 * multiplier)));
                $ctx.caps['Infernite'] += gain;
                breakdown.c.Infernite[label] = gain+'v';
            }

            if (global.resource.Elerium.display && p_on['gateway_depot'] && p_on['s_gate']){
                let gain = (p_on['gateway_depot'] * (spatialReasoning(200)));
                $ctx.caps['Elerium'] += gain;
                breakdown.c.Elerium[label] = gain+'v';
            }
        }

        if (global.resource.Infernite.display && global.portal['fortress'] && !global.race['warlord']){
            let gain = spatialReasoning(1000);
            $ctx.caps['Infernite'] += gain;
            breakdown.c.Infernite[loc('portal_fortress_name')] = gain+'v';
        }

        if (global.space['garage']){
            let multiplier = actions.space.spc_red.garage.multiplier(false);
            let h_multiplier = actions.space.spc_red.garage.multiplier(true);
            let label = loc('space_red_garage_title');
            for (const res of actions.space.spc_red.garage.res()){
                if (global.resource[res].display){
                    let heavy = actions.space.spc_red.garage.heavy(res);
                    let gain = global.space.garage.count * spatialReasoning(actions.space.spc_red.garage.val(res) * (heavy ? h_multiplier : multiplier));
                    $ctx.caps[res] += gain;
                    breakdown.c[res][label] = gain+'v';
                }
            };
        }

        if (global.portal['harbor'] && p_on['harbor']){
            let multiplier = 1;
            if (global.race['warlord'] && global.eden['corruptor'] && global.tech?.asphodel >= 12){
                multiplier *= 1 + (p_on['corruptor'] || 0) * (global.tech.asphodel >= 13 ? 0.12 : 0.1);
            }
            let label = loc('portal_harbor_title');
            for (const res of actions.portal.prtl_lake.harbor.res()){
                if (global.resource[res].display){
                    let gain = p_on['harbor'] * spatialReasoning(actions.portal.prtl_lake.harbor.val(res) * multiplier);
                    $ctx.caps[res] += gain;
                    breakdown.c[res][label] = gain+'v';
                }
            };
        }
}
