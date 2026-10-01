// tabLabel: label tab (nama + jumlah).
import { global } from './vars.js';
import { loc } from './locale.js';
import { races } from './registries.js';
import { flib } from '../functions/run_stats_helpers.js';

export function tabLabel(lbl){
    switch (lbl){
        case 'city':
            if (global.resource[global.race.species]){
                if (global.resource[global.race.species].amount <= 5){
                    return loc('tab_city1');
                }
                else if (global.resource[global.race.species].amount <= 20){
                    return loc('tab_city2');
                }
                else if (global.resource[global.race.species].amount <= 75){
                    return loc('tab_city3');
                }
                else if (global.resource[global.race.species].amount <= 250){
                    return loc('tab_city4');
                }
                else if (global.resource[global.race.species].amount <= 600){
                    return loc('tab_city5');
                }
                else if (global.resource[global.race.species].amount <= 1200){
                    return loc('tab_city6');
                }
                else if (global.resource[global.race.species].amount <= 2500){
                    return loc('tab_city7');
                }
                else {
                    return loc('tab_city8');
                }
            }
            else {
                return loc('tab_city1');
            }
        case 'local_space':
            return loc('sol_system',[global.race['truepath'] ? races[global.race.species].home : flib('name')]);
        case 'outer_local_space':
            return loc('outer_sol_system',[global.race['truepath'] ? races[global.race.species].home : flib('name')])
        case 'old':
            return loc('tab_old_res');
        case 'new':
            return loc('tab_new_res');
        case 'old_sr':
            return loc('tab_old_sr_res');
        case 'new_sr':
            return loc('tab_new_sr_res');
        case 'tab_mech':
            return global.race['warlord'] ? loc('tab_artificer')  : loc(lbl);
        default:
            return loc(lbl);
    }
}
