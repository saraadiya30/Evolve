// Pengali produksi Aether per tick ($ctx.aetherProdMult dan global_multiplier).
import { global, breakdown } from '../../core/vars.js';
import { loc } from '../../core/locale.js';

export function fastLoopAetherProduction($ctx){
        $ctx.aetherProdMult = 1;
        if (global.prestige.hasOwnProperty('Aether') && global.settings.aetherProd > 0){
            let draw = Math.min(global.settings.aetherProd, global.prestige.Aether.count);
            if (draw > 0){
                global.prestige.Aether.count -= draw;
                $ctx.aetherProdMult = 1 + (draw / 0.000000001);
                breakdown.p['Global'][loc('aether_prod_label')] = (($ctx.aetherProdMult - 1) * 100) + '%';
            }
        }
        $ctx.global_multiplier *= $ctx.aetherProdMult;
}
