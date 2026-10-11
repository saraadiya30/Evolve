// Pengali hunger per tick ($ctx.hunger dari $ctx.fed, angry, malnutrition, soul steeper). Dulu bagian dari fastLoopCore_s7.
import { global } from '../../core/vars.js';
import { traits } from '../../core/registries.js';

export function fastLoopHunger($ctx){
        // Resource Income
        $ctx.hunger = $ctx.fed ? 1 : 0.5;
        if (global.race['angry'] && $ctx.fed === false){
            $ctx.hunger -= traits.angry.vars()[0] / 100;
        }
        if (global.race['malnutrition'] && $ctx.fed === false){
            $ctx.hunger += traits.malnutrition.vars()[0] / 100;
        }
        if(global.portal['dish_soul_steeper'] && global.portal['dish_soul_steeper'].on){
            $ctx.hunger -= (0.03 + (global.race['malnutrition'] ? 0.01 : 0) + (global.race['angry'] ? -0.01 : 0)) * global.portal['dish_soul_steeper'].on;
        }
        $ctx.hunger = Math.max($ctx.hunger, 0);
}
