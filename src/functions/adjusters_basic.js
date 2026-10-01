import { global } from '../core/vars.js';
import { traits } from '../core/registries.js';

export function highPopAdjust(v){
    if (global.race['high_pop']){
        v *= traits.high_pop.vars()[1] / 100;
    }
    return v;
}
