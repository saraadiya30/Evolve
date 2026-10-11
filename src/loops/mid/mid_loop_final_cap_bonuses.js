// Bonus batas akhir dari world controller, alien outpost, dan eden fortress. Dulu bagian dari midLoop_s5.
import { global, breakdown, support_on, p_on } from '../../core/vars.js';
import { loc } from '../../core/locale.js';

export function midLoopFinalCapBonuses($ctx){
        if (p_on['world_controller']){
            let boost = 0.25;
            if (global.interstellar['far_reach'] && p_on['far_reach'] > 0){
                boost += p_on['far_reach'] * 0.01;
            }
            if (global.tech.science >= 19){
                boost += 0.15;
            }
            let gain = Math.round($ctx.caps['Knowledge'] * boost);
            $ctx.caps['Knowledge'] += gain;
            breakdown.c.Knowledge[loc('space_dwarf_collider_title')] = gain+'v';
        }

        if (p_on['alien_outpost']){
            let iso = 0;
            if (global.tech['isolation']){
                iso = global.race['lone_survivor'] ? 3500000 : 6500000;
                $ctx.caps['Knowledge'] += iso;
            }
            let boost = 0.2;
            let gain = Math.round($ctx.caps['Knowledge'] * boost);
            $ctx.caps['Knowledge'] += gain;
            breakdown.c.Knowledge[loc('tech_alien_outpost')] = gain+iso+'v';
        }

        if (global.eden['fortress'] && global.tech.hasOwnProperty('celestial_warfare')){
            let warefare_bonus = global.tech.celestial_warfare * 10;
            if (warefare_bonus > 30){ warefare_bonus = 30; }
            global.eden.fortress.detector = 100 - warefare_bonus;
            if (support_on['bunker'] && global.tech.celestial_warfare >= 4){
                global.eden.fortress.detector -= support_on['bunker'] * 3;
                if (global.eden.fortress.detector < 0){ global.eden.fortress.detector = 0; }
            }
        }
}
