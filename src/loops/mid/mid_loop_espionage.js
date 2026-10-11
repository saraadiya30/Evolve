// Spionase per siklus: loop seluruh pemerintah asing, peluang tertangkap, dan efek yeti. Dulu bagian dari midLoop_s6.
import { global, seededRandom } from '../../core/vars.js';
import { drawTech } from '../../actions/core/action_runner.js';
import { loc } from '../../core/locale.js';
import { fathomCheck } from '../../races/trait_logic/fathom_check.js';
import { messageQueue } from '../../functions/message_log.js';
import { checkControlling } from '../../civics/military/government_definitions.js';
import { govTitle } from '../../civics/military/gov_calc.js';
import { spyCaught } from '../long/long_loop.js';
import { astroVal } from '../../functions/astrology.js';

export function midLoopEspionage($ctx){
        let espEnd = global.race['truepath'] ? 5 : 3;
        let spyCatchMod = global.race['blurry'] ? 2 : 0;
        let yetiFathom = fathomCheck('yeti');
        if (yetiFathom >= 0.25){
            spyCatchMod += yetiFathom >= 0.5 ? 2 : 1;
        }
        for (let i=0; i<espEnd; i++){
            if (global.civic.foreign[`gov${i}`].trn > 0){
                global.civic.foreign[`gov${i}`].trn--;
                if (global.civic.foreign[`gov${i}`].trn === 0){
                    global.civic.foreign[`gov${i}`].spy++;
                }
            }
            if (global.civic.foreign[`gov${i}`].sab > 0){
                global.civic.foreign[`gov${i}`].sab--;
                if (global.civic.foreign[`gov${i}`].sab === 0){
                    switch (global.civic.foreign[`gov${i}`].act){
                        case 'influence':
                            if (Math.floor(seededRandom(0,4 + spyCatchMod)) === 0){
                                spyCaught(i);
                            }
                            else {
                                let covert = Math.floor(seededRandom(global.tech['spy'] >= 5 ? 2 : 1, global.tech['spy'] >= 5 ? 8 : 6));
                                if ($ctx.astroSign === 'scorpio'){
                                    covert += astroVal('scorpio')[1];
                                }
                                global.civic.foreign[`gov${i}`].hstl -= covert;
                                if (global.civic.foreign[`gov${i}`].hstl < 0){
                                    global.civic.foreign[`gov${i}`].hstl = 0;
                                }
                                messageQueue(loc('civics_spy_influence_success',[govTitle(i),covert]),'success',false,['spy']);
                            }
                            break;
                        case 'sabotage':
                            if (Math.floor(seededRandom(0,3 + spyCatchMod)) === 0){
                                spyCaught(i);
                            }
                            else {
                                let covert = Math.floor(seededRandom(global.tech['spy'] >= 5 ? 2 : 1, global.tech['spy'] >= 5 ? 8 : 6));
                                if ($ctx.astroSign === 'scorpio'){
                                    covert += astroVal('scorpio')[1];
                                }
                                global.civic.foreign[`gov${i}`].mil -= covert;
                                if (global.civic.foreign[`gov${i}`].mil < 50){
                                    global.civic.foreign[`gov${i}`].mil = 50;
                                }
                                messageQueue(loc('civics_spy_sabotage_success',[govTitle(i),covert]),'success',false,['spy']);
                            }
                            break;
                        case 'incite':
                            if (Math.floor(seededRandom(0,2 + Math.floor(spyCatchMod / 2))) === 0){
                                spyCaught(i);
                            }
                            else {
                                let covert = Math.floor(seededRandom(global.tech['spy'] >= 5 ? 2 : 1, global.tech['spy'] >= 5 ? 8 : 6));
                                if ($ctx.astroSign === 'scorpio'){
                                    covert += astroVal('scorpio')[1];
                                }
                                global.civic.foreign[`gov${i}`].unrest += covert;
                                if (global.civic.foreign[`gov${i}`].unrest > 100){
                                    global.civic.foreign[`gov${i}`].unrest = 100;
                                }
                                messageQueue(loc('civics_spy_incite_success',[govTitle(i),covert]),'success',false,['spy']);
                            }
                            break;
                        case 'annex':
                            if (i >= 3){ break; }
                            let drawTechs = !global.tech['gov_fed'] && !checkControlling();
                            global.civic.foreign[`gov${i}`].anx = true;
                            messageQueue(loc('civics_spy_annex_success',[govTitle(i)]),'success',false,['spy']);
                            if (drawTechs){
                                drawTech();
                            }
                            break;
                        case 'purchase':
                            if (i >= 3){ break; }
                            let drawTechsAlt = !global.tech['gov_fed'] && !checkControlling();
                            global.civic.foreign[`gov${i}`].buy = true;
                            messageQueue(loc('civics_spy_purchase_success',[govTitle(i)]),'success',false,['spy']);
                            if (drawTechsAlt){
                                drawTech();
                            }
                            break;
                    }
                }
            }
        }
}
