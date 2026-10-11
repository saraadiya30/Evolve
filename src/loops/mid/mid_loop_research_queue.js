// Antrean riset (r_queue), blokir buffer gen, dan sekuens ARPA otomatis. Dulu bagian dari midLoop_s7.
import { global } from '../../core/vars.js';
import { actions, hooks } from '../../core/registries.js';
import { checkAffordable } from '../../actions/core/action_costs.js';
import { checkTechRequirements, skipRequirement } from '../../actions/challenge/tech_requirements.js';
import { loc } from '../../core/locale.js';
import { messageQueue } from '../../functions/message_log.js';
import { clearPopper } from '../../functions/popover.js';
import { timeCheck } from '../../functions/time_format.js';
import { buildGene } from '../long/build_gene.js';

export function midLoopResearchQueue($ctx){
        let blockGeneBuffer = false;
        if (global.tech['r_queue'] && global.r_queue.display){
            let idx = -1;
            let c_action = false;
            let stop = false;
            let time = 0; let untime = 0;
            let spent = { t: {t:0,rt:0}, r: {}, rr: {}, id: {}};
            for (let i=0; i<global.r_queue.queue.length; i++){
                let struct = global.r_queue.queue[i];
                let t_action = actions[struct.action][struct.type];
                time = global.settings.qAny_res ? 0 : time;
                untime = global.settings.qAny_res ? 0 : untime;

                if (t_action['grant'] && global.tech[t_action.grant[0]] && global.tech[t_action.grant[0]] >= t_action.grant[1]){
                    global.r_queue.queue.splice(i,1);
                    clearPopper(`rq${c_action.id}`);
                    break;
                }
                else {
                    if (checkAffordable(t_action,true)){
                        global.r_queue.queue[i].cna = false;
                        let reqMet = checkTechRequirements(struct.type,false);
                        let t_time = global.settings.qAny_res ? timeCheck(t_action) : timeCheck(t_action, spent, false, reqMet);
                        if (t_time >= 0){
                            if (!stop && checkAffordable(t_action) && reqMet){
                                c_action = t_action;
                                idx = i;
                                if (global.settings.qAny_res){
                                    stop = true;
                                }
                            }
                            else {
                                if (reqMet){
                                    if (!stop && t_time <= 1){
                                        blockGeneBuffer = true;
                                    }
                                    time += t_time;
                                }
                                untime += t_time;
                            }
                            if (!global.settings.qAny_res && reqMet){
                                stop = true;
                            }
                            global.r_queue.queue[i]['time'] = reqMet ? time : untime;
                        }
                        else {
                            global.r_queue.queue[i]['time'] = t_time;
                        }
                        global.r_queue.queue[i]['req'] = reqMet ? true : false;
                    }
                    else {
                        global.r_queue.queue[i].cna = true;
                        global.r_queue.queue[i]['time'] = -1;
                    }
                }
                global.r_queue.queue[i].qa = global.settings.qAny_res ? true : false;
            }
            if (idx >= 0 && c_action && !global.r_queue.pause){
                if (c_action.action({isQueue: true})){
                    messageQueue(loc('research_success',[global.r_queue.queue[idx].label]),'success',false,['queue','research_queue']);
                    hooks.gainTech(global.r_queue.queue[idx].type);
                    if (c_action['post']) {
                        c_action.post();
                    }
                    global.r_queue.queue.splice(idx,1);
                    clearPopper(`rq${c_action.id}`);
                    hooks.resQueue();
                }
            }
            if (global.r_queue.queue.length > global.r_queue.max){
                global.r_queue.queue.splice(global.r_queue.max);
            }

            let q_techs = {}; let remove = [];
            checkTechRequirements('club',q_techs);
            for (let i=0; i<global.r_queue.queue.length; i++){
                Object.keys(actions.tech[global.r_queue.queue[i].type].reqs).forEach(function(req){
                    if (skipRequirement(req, global.tech[req] || 0)){ return; }
                    if (
                        (!global.tech[req] || global.tech[req] < actions.tech[global.r_queue.queue[i].type].reqs[req])
                        &&
                        (!q_techs[req] || (q_techs[req] && q_techs[req].v < actions.tech[global.r_queue.queue[i].type].reqs[req]))
                        ){
                        remove.push(i);
                    }
                });
            }
            if (remove.length > 0){
                for (let i=remove.length - 1; i>=0; i--){
                    global.r_queue.queue.splice(remove[i],1);
                }
            }
        }

        if (global.arpa.sequence && global.arpa.sequence['auto'] && global.tech['genetics'] && global.tech['genetics'] >= 8){
            buildGene(blockGeneBuffer);
        }
}
