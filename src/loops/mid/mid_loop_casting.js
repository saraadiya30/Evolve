// Efek trait casting per siklus.
import { global } from '../../core/vars.js';
import { ritual_types } from '../../industry/industry.js';

export function midLoopCasting($ctx){
        if (global.race['casting']){
            let total = 0;
            ritual_types.forEach(function (spell){
                if (global.race.casting[spell]){
                    total += global.race.casting[spell];
                }
            });
            global.race.casting.total = total;
        }
}
