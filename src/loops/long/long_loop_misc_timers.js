// Timer lain per detik: cLabels (gambar ulang kota), piracy, cheese, wish, dan archaeology hell.
import { global } from '../../core/vars.js';
import { renderSpace } from '../../space/space_requirements.js';
import { hooks, races } from '../../core/registries.js';
import { cLabels } from '../../actions/action_lists.js';
import { renderFortress } from '../../portal/hell/fortress_defense.js';
import { messageQueue } from '../../functions/message_log.js';
import { loc } from '../../core/locale.js';
import { highPopAdjust } from '../../functions/adjusters_basic.js';
import { workerScale } from '../../civics/jobs/worker_scale.js';

export function longLoopMiscTimers($ctx){
        if (global.settings['cLabels'] !== cLabels){
            hooks.drawCity();
        }

        if (global.tech['xeno'] && global.tech['xeno'] >= 5 && !global.tech['piracy']){
            if (Math.rand(0,5) === 0){
                global.tech['piracy'] = 1;
                messageQueue(loc('galaxy_piracy_msg',[races[global.galaxy.alien2.id].name]),'info',false,['progress']);
                renderSpace();
            }
        }

        if (global.race['cheese']){
            global.race.cheese--;
            if (global.race.cheese <= 0){
                delete global.race.cheese;
            }
        }

        if (global.tech['piracy']){
            if (global.tech.piracy < 1000){
                global.tech.piracy++;
            }
            else if (global.tech.xeno >= 8 && global.tech.piracy < 2500){
                global.tech.piracy++;
            }
            else if (global.tech['conflict'] && global.tech.piracy < 5000){
                global.tech.piracy++;
            }
        }

        if (global.race['wish'] && global.race['wishStats']){
            if (global.race.wishStats.minor > 0){
                global.race.wishStats.minor--;
            }
            if (global.race.wishStats.major > 0){
                global.race.wishStats.major--;
            }
            if (global.race.wishStats.bad > 0){
                global.race.wishStats.bad--;
            }
        }

        if (global.portal['archaeology'] && global.tech.hasOwnProperty('hell_ruins') && global.tech.hell_ruins >= 2 && !global.tech['hell_vault']){
            let sup = hooks.hellSupression('ruins');
            let value = 250000;
            if (global.race['high_pop']){
                value = highPopAdjust(value);
            }
            value = Math.round(value * sup.supress) * workerScale(global.civic.archaeologist.workers,'archaeologist') / 1000;

            if (Math.rand(0,10000) + 1 <= value){
                global.tech['hell_vault'] = 1;
                messageQueue(loc('portal_ruins_vault'),'info',false,['progress']);
                renderFortress();
            }
        }
}
