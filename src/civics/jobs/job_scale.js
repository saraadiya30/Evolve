import { global } from '../../core/vars.js';
import { traits } from '../../core/registries.js';

export function jobScale(num){
    if (global.race['high_pop']){
        return num * traits.high_pop.vars()[0];
    }
    return num;
}
