// Timer trait ras per detik: blood thirst, gov3 truepath, dan pet.
import { global } from '../../core/vars.js';

export function longLoopRaceTimers($ctx){
        if (global.race['blood_thirst']){
            if (!global.race.hasOwnProperty('blood_thirst_count')){
                global.race['blood_thirst_count'] = 1;
            }
            if (global.race.blood_thirst_count > 1){
                global.race.blood_thirst_count--;
            }
        }

        if (global.race['truepath'] && global.civic.foreign.gov3.mil < 500){
            if (Math.rand(0, 50) === 0){
                global.civic.foreign.gov3.mil++;
            }
        }

        if (global.race['pet']){
            if (global.race.pet.event > 0){
                global.race.pet.event--;
            }
            if (global.race.pet.pet > 0){
                global.race.pet.pet--;
            }
            else if (global.race.pet.pet < 0){
                global.race.pet.pet++;
            }
        }
}
