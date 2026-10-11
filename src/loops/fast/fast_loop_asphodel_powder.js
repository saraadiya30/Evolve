// Asphodel Powder per tick. Dulu bagian dari fastLoopCore_s14.
import { global, breakdown, p_on } from '../../core/vars.js';
import { modRes } from '../../functions/resource_mod.js';
import { loc } from '../../core/locale.js';
import { actions } from '../../core/registries.js';

export function fastLoopAsphodelPowder($ctx){
        if (global.resource.Asphodel_Powder.display){
            if (global.resource.Asphodel_Powder.amount > 0){
                let decay = +((global.resource.Asphodel_Powder.amount) * 0.0045).toFixed(3);

                let stabilize = 0.92;
                if (p_on['ascension_trigger'] && global.eden.hasOwnProperty('encampment') && global.eden.encampment.asc){
                    let heatSink = actions.interstellar.int_sirius.ascension_trigger.heatSink();
                    heatSink = heatSink < 0 ? Math.abs(heatSink) : 0;
                    if (heatSink > 0){
                        let coefficent = 0.08 * (1 + (heatSink / 17500));
                        stabilize = 1 - coefficent;
                    }
                }
                if (global.race['warlord'] && global.eden['corruptor'] && p_on['corruptor']){
                    stabilize -= 0.004 * p_on['corruptor'];
                }
                if (stabilize < 0.01){ stabilize = 0.01; }

                if (global.eden['stabilizer']){
                    decay *= stabilize ** global.eden.stabilizer.count;
                }
                modRes('Asphodel_Powder', -(decay * $ctx.time_multiplier));
                breakdown.p.consume.Asphodel_Powder[loc('evo_challenge_decay')] = -(decay);
            }
            else {
                delete breakdown.p.consume.Asphodel_Powder[loc('evo_challenge_decay')];
            }
        }
}
