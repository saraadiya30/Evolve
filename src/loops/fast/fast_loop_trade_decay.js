// Peluruhan rasio dagang untuk ras decay per tick. Dulu bagian dari fastLoopCore_s14.
import { global, breakdown } from '../../core/vars.js';
import { modRes } from '../../functions/resource_mod.js';
import { loc } from '../../core/locale.js';
import { tradeRatio } from '../../config/constants.js';

export function fastLoopTradeDecay($ctx){
        if (global.race['decay']){
            Object.keys(tradeRatio).forEach(function (res) {
                if (global.resource[res].amount > 50){
                    let decay = +((global.resource[res].amount - 50) * (0.001 * tradeRatio[res])).toFixed(3);
                    modRes(res, -(decay * $ctx.time_multiplier));
                    breakdown.p.consume[res][loc('evo_challenge_decay')] = -(decay);
                }
                else {
                    delete breakdown.p.consume[res][loc('evo_challenge_decay')];
                }
            });
        }
}
