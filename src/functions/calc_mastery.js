// calc_mastery: perhitungan mastery. Modul daun, dipisah dari functions.js (grab-bag) supaya modul achievements tidak menyeretnya.
import { global } from '../core/vars.js';
import { masteryType } from './prestige_calc.js';

export const calc_mastery = (function(){
    let mastery;
    return function(recalc){
        if (mastery && !recalc){
            return mastery;
        }
        else if (global.genes['challenge'] && global.genes.challenge >= 2){
            mastery = masteryType(global.race.universe);
            return mastery;
        }
        return 0;
    }
})();
