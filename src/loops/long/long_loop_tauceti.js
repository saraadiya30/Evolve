// Progres truepath di Tau Ceti per detik.
import { global } from '../../core/vars.js';
import { renderSpace } from '../../space/space_requirements.js';
import { hooks, races } from '../../core/registries.js';
import { drawTech } from '../../actions/core/action_runner.js';
import { messageQueue } from '../../functions/message_log.js';
import { loc } from '../../core/locale.js';
import { govTitle } from '../../civics/military/gov_calc.js';

export function longLoopTauCeti($ctx){
        if (global.race['truepath'] && global.tech['tauceti'] && global.tech.tauceti === 3 && global.space.hasOwnProperty('jump_gate') && global.tauceti.hasOwnProperty('jump_gate') && global.space.jump_gate.count >= 100 && global.tauceti.jump_gate.count >= 100){
            global.tech.tauceti = 4;
            global.resource.Materials.display = false;
            global.resource.Bolognium.display = true;
            renderSpace();
            hooks.renderTauCeti();
            drawTech();
        }

        if (global.race['truepath'] && global.tech['tauceti'] && !global.race['lone_survivor']){
            if (global.tech.tauceti === 5 && !global.tech['plague'] && Math.rand(0,50) === 0){
                global.tech['plague'] = 1;
                messageQueue(loc('tau_plague',[govTitle(3)]),'info',false,['progress']);
            }
            else if (global.tech['plague'] && global.tech['tau_roid'] && global.tech['tau_whale']){
                if (global.tech.plague === 1 && (global.tech.tau_roid >= 4 || global.tech.tau_whale >= 2) && Math.rand(0,50) === 0){
                    global.tech.plague = 2;
                    global.race['quarantine'] = 1;
                    global.race['qDays'] = 0;
                    messageQueue(loc('tau_plague2',[govTitle(3)]),'info',false,['progress']);
                }
                else if (global.tech.plague === 2 && global.tech.tau_roid >= 5 && global.tech.tau_whale >= 2 && Math.rand(0,50) === 0){
                    global.tech.plague = 3;
                    global.race['quarantine'] = 2;
                    global.race['qDays'] = 0;
                    messageQueue(loc('tau_plague3',[govTitle(3),races[global.race.species].home]),'info',false,['progress']);
                }
                else if (global.tech['isolation']){
                    if (global.tech.plague < 5 && Math.rand(0,50) === 0){
                        global.tech.plague = 5;
                        delete global.race['quarantine'];
                        delete global.race['qDays'];
                        messageQueue(loc('tau_plague5b',[races[global.race.species].home]),'info',false,['progress']);
                        drawTech();
                    }
                }
                else if (global.tech.plague === 3 && global.tech['disease'] && global.tech.disease >= 2 && Math.rand(0,50) === 0){
                    global.tech.plague = 4;
                    global.race['quarantine'] = 3;
                    global.race['qDays'] = 0;
                    messageQueue(loc('tau_plague5a',[races[global.race.species].home]),'info',false,['progress']);
                }
                else if (global.tech.plague === 4 && global.tech['disease'] && global.tech.disease >= 3 && Math.rand(0,50) === 0){
                    global.tech.plague = 5;
                    global.race['quarantine'] = 4;
                    global.race['qDays'] = 0;
                    messageQueue(loc('tau_plague5a',[races[global.race.species].home]),'info',false,['progress']);
                }

                if (global.race['quarantine']){
                    if (!global.race.hasOwnProperty('qDays')){
                        global.race['qDays'] = 0;
                    }
                    global.race.qDays++;
                }
            }
        }
        else if (global.tech['tau_gas'] && global.tech.tau_gas >= 4 && !global.tech['plague'] && global.race['lone_survivor']){
            global.tech['plague'] = 5;
        }
}
