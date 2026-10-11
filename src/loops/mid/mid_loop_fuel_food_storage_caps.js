// Batas storage makanan dan bahan bakar dari silo, compost, soul well, smokehouse, oil well/depot, propellant depot, stasiun orbital, gas storage, transfer station, helium mine, dan pumpjack. Dulu bagian dari midLoop_s3.
import { global, breakdown, p_on } from '../../core/vars.js';
import { BHStorageMulti } from '../../actions/challenge/challenge_rules.js';
import { loc } from '../../core/locale.js';
import { spatialReasoning } from '../../resources/resources.js';
import { planetName } from '../../space/planet_name.js';

export function midLoopFuelFoodStorageCaps($ctx){
        if (global.city['silo']){
            let gain = BHStorageMulti(global.city['silo'].count * spatialReasoning(500));
            $ctx.caps['Food'] += gain;
            breakdown.c.Food[loc('city_silo')] = gain+'v';
        }
        if (global.city['compost']){
            let gain = BHStorageMulti(global.city['compost'].count * spatialReasoning(200));
            $ctx.caps['Food'] += gain;
            breakdown.c.Food[loc('city_compost_heap')] = gain+'v';
        }
        if (global.city['soul_well']){
            let gain = BHStorageMulti(global.city['soul_well'].count * spatialReasoning(500));
            $ctx.caps['Food'] += gain;
            breakdown.c.Food[loc('city_soul_well')] = gain+'v';
        }
        if (global.city['smokehouse']){
            let gain = BHStorageMulti(global.city['smokehouse'].count * spatialReasoning(100));
            $ctx.caps['Food'] += gain;
            breakdown.c.Food[loc('city_smokehouse')] = gain+'v';
        }
        if (global.city['oil_well']){
            let gain = (global.city['oil_well'].count * spatialReasoning(500));
            $ctx.caps['Oil'] += gain;
            breakdown.c.Oil[loc('city_oil_well')] = gain+'v';
        }
        if (global.city['oil_depot']){
            let gain = (global.city['oil_depot'].count * spatialReasoning(1000));
            gain *= global.tech['world_control'] ? 1.5 : 1;
            $ctx.caps['Oil'] += gain;
            breakdown.c.Oil[loc('city_oil_depot')] = gain+'v';
            if (global.tech['uranium'] >= 2){
                gain = (global.city['oil_depot'].count * spatialReasoning(250));
                gain *= global.tech['world_control'] ? 1.5 : 1;
                $ctx.caps['Uranium'] += gain;
                breakdown.c.Uranium[loc('city_oil_depot')] = gain+'v';
            }
            if (global.resource['Helium_3'].display){
                gain = (global.city['oil_depot'].count * spatialReasoning(400));
                gain *= global.tech['world_control'] ? 1.5 : 1;
                $ctx.caps['Helium_3'] += gain;
                breakdown.c.Helium_3[loc('city_oil_depot')] = gain+'v';
            }
        }
        if (global.space['propellant_depot']){
            let gain = (global.space['propellant_depot'].count * spatialReasoning(1250));
            gain *= global.tech['world_control'] ? 1.5 : 1;
            $ctx.caps['Oil'] += gain;
            breakdown.c.Oil[loc('space_home_propellant_depot_title')] = gain+'v';
            if (global.resource['Helium_3'].display){
                gain = (global.space['propellant_depot'].count * spatialReasoning(1000));
                gain *= global.tech['world_control'] ? 1.5 : 1;
                $ctx.caps['Helium_3'] += gain;
                breakdown.c.Helium_3[loc('space_home_propellant_depot_title')] = gain+'v';
            }
        }
        if (p_on['orbital_station']){
            let gain = (p_on['orbital_station'] * spatialReasoning(15000));
            $ctx.caps['Helium_3'] += gain;
            breakdown.c.Helium_3[loc('tau_home_orbital_station')] = gain+'v';
        }
        if (p_on['refueling_station']){
            let h_gain = (p_on['refueling_station'] * spatialReasoning(10000));
            $ctx.caps['Helium_3'] += h_gain;
            breakdown.c.Helium_3[loc('tau_gas_refueling_station_title')] = h_gain+'v';

            if (global.tech['tau_whale'] >= 2){
                let o_gain = (p_on['refueling_station'] * spatialReasoning(6500));
                $ctx.caps['Oil'] += o_gain;
                breakdown.c.Oil[loc('tau_gas_refueling_station_title')] = o_gain+'v';
            }
        }
        if (p_on['orbital_platform']){
            let gain = (p_on['orbital_platform'] * spatialReasoning(17500));
            $ctx.caps['Oil'] += gain;
            breakdown.c.Oil[loc('tau_red_orbital_platform')] = gain+'v';
        }
        if (global.space['gas_storage']){
            let gain = (global.space['gas_storage'].count * spatialReasoning(3500));
            gain *= global.tech['world_control'] ? 1.5 : 1;
            $ctx.caps['Oil'] += gain;
            breakdown.c.Oil[`${planetName().gas} ${loc('depot')}`] = gain+'v';

            gain = (global.space['gas_storage'].count * spatialReasoning(2500));
            gain *= global.tech['world_control'] ? 1.5 : 1;
            $ctx.caps['Helium_3'] += gain;
            breakdown.c.Helium_3[`${planetName().gas} ${loc('depot')}`] = gain+'v';

            gain = (global.space['gas_storage'].count * spatialReasoning(1000));
            gain *= global.tech['world_control'] ? 1.5 : 1;
            $ctx.caps['Uranium'] += gain;
            breakdown.c.Uranium[`${planetName().gas} ${loc('depot')}`] = gain+'v';
        }
        if (p_on['xfer_station']){
            let gain = (p_on['xfer_station'] * spatialReasoning(5000));
            $ctx.caps['Helium_3'] += gain;
            breakdown.c.Helium_3[loc('interstellar_xfer_station_title')] = gain+'v';

            gain = (p_on['xfer_station'] * spatialReasoning(4000));
            $ctx.caps['Oil'] += gain;
            breakdown.c.Oil[loc('interstellar_xfer_station_title')] = gain+'v';

            gain = (p_on['xfer_station'] * spatialReasoning(2500));
            $ctx.caps['Uranium'] += gain;
            breakdown.c.Uranium[loc('interstellar_xfer_station_title')] = gain+'v';

            if (global.resource.Deuterium.display){
                let deuterium_gain = p_on['xfer_station'] * spatialReasoning(2000);
                $ctx.caps['Deuterium'] += deuterium_gain;
                breakdown.c.Deuterium[loc('interstellar_xfer_station_title')] = deuterium_gain+'v';
            }
        }
        if (global.space['helium_mine']){
            let gain = (global.space['helium_mine'].count * spatialReasoning(100));
            $ctx.caps['Helium_3'] += gain;
            breakdown.c.Helium_3[loc('space_moon_helium_mine_title')] = gain+'v';
        }
        if (global.portal['pumpjack']){
            let gain = (global.portal.pumpjack.count * spatialReasoning(500));
            $ctx.caps['Oil'] += gain;
            breakdown.c.Oil[loc('portal_pumpjack_title')] = gain+'v';
        }
        if (global.portal['pumpjack']){
            let gain = (global.portal.pumpjack.count * spatialReasoning(250));
            $ctx.caps['Helium_3'] += gain;
            breakdown.c.Helium_3[loc('portal_pumpjack_title')] = gain+'v';
        }
}
