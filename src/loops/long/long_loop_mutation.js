// Mutasi populasi per detik.
import { global } from '../../core/vars.js';

export function longLoopMutation($ctx){
        if (global.race.mutation > 0){
            let total = 0;
            for (let i=0; i<global.race.mutation; i++){
                let mut_level = i + 1;
                let plasma = global.genes['plasma'] ? mut_level : 1;
                if (global.genes['plasma'] && plasma > 3){
                    if (global.genes['plasma'] >= 2){
                        plasma = plasma > 5 ? 5 : plasma;
                    }
                    else {
                        plasma = 3;
                    }
                }
                total += plasma;
            }
            global.race['p_mutation'] = total;
        }
}
