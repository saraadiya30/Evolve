// Batas dari struktur khusus: nanite factory, transmitter, pylon, dan captive housing. Dulu bagian dari midLoop_s2.
import { global, breakdown, p_on } from '../../core/vars.js';
import { loc } from '../../core/locale.js';
import { spatialReasoning } from '../../resources/resources.js';

export function midLoopSpecialStructureCaps($ctx){
        if (global.city['nanite_factory']){
            let gain = global.city.nanite_factory.count * spatialReasoning(2500);
            $ctx.caps['Nanite'] += gain;
            breakdown.c.Nanite[loc('city_nanite_factory')] = gain+'v';
        }
        if (p_on['transmitter'] && global.race['artifical']){
            let gain = p_on['transmitter'] * spatialReasoning(100);
            $ctx.caps['Food'] += gain;
            breakdown.c.Food[loc('city_transmitter')] = gain+'v';
        }
        if (global.city['pylon'] || global.space['pylon'] || global.tauceti['pylon']){
            let gain = 0;
            let name = 'city_pylon';
            if ((global.race['cataclysm'] || global.race['orbit_decayed']) && global.space['pylon']){
                gain = spatialReasoning(2) * global.space.pylon.count;
                name = 'space_red_pylon';
            }
            else if (global.tech['isolation'] && global.tauceti['pylon']){
                gain = spatialReasoning(2) * global.tauceti.pylon.count;;
                name = 'tau_home_pylon';
            }
            else if (global.city['pylon']){
                gain = spatialReasoning(5) * global.city.pylon.count;;
            }

            $ctx.caps['Mana'] += gain;
            breakdown.c.Mana[loc(name)] = gain+'v';
        }
        if (global.city['captive_housing']){
            let houses = global.city.captive_housing.count;
            global.city.captive_housing.raceCap = houses * (global.tech['unfathomable'] && global.tech.unfathomable >= 3 ? 3 : 2);
            global.city.captive_housing.cattleCap = houses * 5;
        }
}
