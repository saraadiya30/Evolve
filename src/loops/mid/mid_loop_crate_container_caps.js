// Batas Crates dan Containers dari farm, wharf, munitions depot, cargo yard, neutron miner, storage yard, garage, tp depot, dan warehouse. Dulu bagian dari midLoop_s2.
import { global, breakdown, p_on } from '../../core/vars.js';
import { actions } from '../../core/registries.js';
import { loc } from '../../core/locale.js';
import { spatialReasoning } from '../../resources/resources.js';

export function midLoopCrateContainerCaps($ctx){
        if (global.city['farm']){
            if (global.tech['farm']){
                let pop = global.city.farm.count * actions.city.farm.citizens();
                $ctx.caps[global.race.species] += pop;
                breakdown.c[global.race.species][loc('city_farm')] = pop + 'v';
            }
        }
        if (global.city['wharf']){
            let vol = global.tech['world_control'] ? 15 : 10;
            if (global.tech['particles'] && global.tech['particles'] >= 2){
                vol *= 2;
            }
            $ctx.caps['Crates'] += (global.city.wharf.count * vol);
            breakdown.c.Crates[loc('city_wharf')] = (global.city.wharf.count * vol) + 'v';
            $ctx.caps['Containers'] += (global.city.wharf.count * vol);
            breakdown.c.Containers[loc('city_wharf')] = (global.city.wharf.count * vol) + 'v';
        }
        if (global.space['munitions_depot']){
            let vol = 25;
            $ctx.caps['Crates'] += (global.space.munitions_depot.count * vol);
            breakdown.c.Crates[loc('tech_munitions_depot')] = (global.space.munitions_depot.count * vol) + 'v';
            $ctx.caps['Containers'] += (global.space.munitions_depot.count * vol);
            breakdown.c.Containers[loc('tech_munitions_depot')] = (global.space.munitions_depot.count * vol) + 'v';
        }
        if (global.interstellar['cargo_yard']){
            $ctx.caps['Crates'] += (global.interstellar.cargo_yard.count * 50);
            breakdown.c.Crates[loc('interstellar_cargo_yard_title')] = (global.interstellar.cargo_yard.count * 50) + 'v';
            $ctx.caps['Containers'] += (global.interstellar.cargo_yard.count * 50);
            breakdown.c.Containers[loc('interstellar_cargo_yard_title')] = (global.interstellar.cargo_yard.count * 50) + 'v';

            let gain = (global.interstellar.cargo_yard.count * spatialReasoning(200));
            $ctx.caps['Neutronium'] += gain;
            breakdown.c.Neutronium[loc('interstellar_cargo_yard_title')] = gain+'v';

            gain = (global.interstellar.cargo_yard.count * spatialReasoning(150));
            $ctx.caps['Infernite'] += gain;
            breakdown.c.Infernite[loc('interstellar_cargo_yard_title')] = gain+'v';
        }
        if (global.interstellar['neutron_miner'] && p_on['neutron_miner']){
            let gain = (p_on['neutron_miner'] * spatialReasoning(500));
            $ctx.caps['Neutronium'] += gain;
            breakdown.c.Neutronium[loc('interstellar_neutron_miner_title')] = gain+'v';
        }
        if (global.city['storage_yard']){
            let size = global.tech.container >= 3 ? 20 : 10;
            if (global.stats.achieve['pathfinder'] && global.stats.achieve.pathfinder.l >= 1){
                size += 10;
            }
            if (global.tech['world_control']){
                size += 10;
            }
            if (global.tech['particles'] && global.tech['particles'] >= 2){
                size *= 2;
            }
            $ctx.caps['Crates'] += (global.city['storage_yard'].count * size);
            breakdown.c.Crates[loc('city_storage_yard')] = (global.city['storage_yard'].count * size) + 'v';
        }
        if (global.space['garage']){
            let g_vol = global.tech['particles'] >= 4 ? 20 + global.tech['supercollider'] : 20;
            if (global.tech['world_control'] || global.race['cataclysm']){
                g_vol += 10;
            }
            $ctx.caps['Containers'] += (global.space.garage.count * g_vol);
            breakdown.c.Containers[loc('space_red_garage_title')] = (global.space.garage.count * g_vol) + 'v';
            if (global.race['cataclysm'] || global.race['orbit_decayed']){
                $ctx.caps['Crates'] += (global.space.garage.count * g_vol);
                breakdown.c.Crates[loc('space_red_garage_title')] = (global.space.garage.count * g_vol) + 'v';
            }
        }
        if (global.tech['tp_depot']){
            $ctx.caps['Containers'] += (global.tech.tp_depot * 50);
            breakdown.c.Containers[loc('galaxy_gateway_depot')] = (global.tech.tp_depot * 50) + 'v';
            $ctx.caps['Crates'] += (global.tech.tp_depot * 50);
            breakdown.c.Crates[loc('galaxy_gateway_depot')] = (global.tech.tp_depot * 50) + 'v';
        }
        if (global.city['warehouse']){
            let volume = global.tech['steel_container'] >= 2 ? 20 : 10;
            if (global.stats.achieve['pathfinder'] && global.stats.achieve.pathfinder.l >= 2){
                volume += 10;
            }
            if (global.tech['world_control']){
                volume += 10;
            }
            if (global.tech['particles'] && global.tech['particles'] >= 2){
                volume *= 2;
            }
            $ctx.caps['Containers'] += (global.city['warehouse'].count * volume);
            breakdown.c.Containers[loc('city_warehouse')] = (global.city['warehouse'].count * volume) + 'v';
        }
}
