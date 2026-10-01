// Efek morale (inspired, distracted, stimulated, motivated) dan pengurangan populasi saat melebihi batas.
import { global } from '../../core/vars.js';
import { loc } from '../../core/locale.js';
import { messageQueue } from '../../functions/message_log.js';

export function midLoopPopulationLoss($ctx){
        ['inspired','distracted','stimulated','motivated'].forEach(function(t){
            if (global.race[t]){
                global.race[t]--;
                if (global.race[t] <= 0){
                    delete global.race[t];
                }
            }
        });

        let pop_loss = global.resource[global.race.species].amount - $ctx.caps[global.race.species];
        if (pop_loss > 0){
            if (global.race['orbit_decayed'] && global.stats.days === global.race['orbit_decay']){
                messageQueue(loc('tragic_death',[pop_loss]),'danger');
            }
            else {
                messageQueue(loc(pop_loss === 1 ? 'abandon1' : 'abandon2',[pop_loss]),'danger');
                global.civic.homeless += pop_loss;
            }
        }
}
