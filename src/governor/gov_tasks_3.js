import { loc } from '../core/locale.js';
import { global } from '../core/vars.js';
import { decodeStructId, arpaTimeCheck, timeCheck } from '../functions/functions.js';
import { actions } from '../actions/actions.js';
import { shipCosts } from '../truepath/truepath.js';
import { mechCost } from '../portal/portal.js';
import { atomic_mass } from '../resources/resources.js';

// Bagian dari gov_tasks (1 entri: replicate .. replicate), dipisah dari governor.js. Urutan entri sama persis.
export const gov_tasksPart3 = {
    replicate: { // Replicator Scheduler
        name: loc(`gov_task_replicate`),
        req(){
            return global.tech['replicator'] && global.race['replicator'] ? true : false;
        },
        task(){
            if (global.race.governor.config.replicate.pow.on){
                let cap = global.race.governor.config.replicate.pow.cap;
                let buffer = global.race.governor.config.replicate.pow.buffer;
                if (global.city.power < buffer && global.race.replicator.pow > 0){
                    let drain = global.city.power < 0 ? Math.abs(global.city.power) + buffer : buffer - global.city.power;
                    global.race.replicator.pow -= drain;
                    if (global.race.replicator.pow < 0){
                        global.race.replicator.pow = 0;
                    }
                }
                else if (global.city.power > buffer && global.race.replicator.pow < cap){
                    global.race.replicator.pow += (global.city.power - buffer);
                    if (global.race.replicator.pow > cap){
                        global.race.replicator.pow = cap;
                    }
                }
                else if (global.race.replicator.pow > cap){
                    global.race.replicator.pow = cap;
                }
                global.race.replicator.pow = Math.floor(global.race.replicator.pow);
            }

            let rBal = false;
            let blacklist = ['Asphodel_Powder', 'Elysanite'];
            if(global.race['fasting']){
                blacklist.push('Food');
            }
            for (let idx = 0; global.race.governor.config.replicate.res.que && idx < global.queue.queue.length; idx++){
                let struct = decodeStructId(global.queue.queue[idx].id);
                let tc = false;
                if (global.queue.queue[idx].action === 'arpa'){
                    let remain = (100 - global.arpa[struct.a].complete) / 100;
                    let c_action = actions.arpa[struct.a];
                    tc = arpaTimeCheck(c_action,remain,false,true);
                }
                else if (global.queue.queue[idx].action === 'tp-ship'){
                    let raw = shipCosts(global.queue.queue[idx].type);
                    let costs = {};
                    Object.keys(raw).forEach(function(res){
                        costs[res] = function(){ return raw[res]; }
                    });
                    let c_action = { cost: costs };
                    tc = timeCheck(c_action,false,true);
                }
                else if (global.queue.queue[idx].action === 'hell-mech'){
                    let costs = mechCost(global.queue.queue[idx].type.size,global.queue.queue[idx].type.infernal,true);
                    let c_action = { cost: costs };
                    tc = timeCheck(c_action,false,true);
                }
                else {
                    tc = timeCheck(struct.a,false,true);
                }
                let resSorted = Object.keys(tc.s).sort(function(a,b){return tc.s[b]-tc.s[a]});
                for (let i=0; i<resSorted.length; i++){
                    if (global.resource[resSorted[i]] && global.resource[resSorted[i]].display && atomic_mass[resSorted[i]] && !blacklist.includes(resSorted[i])){
                        global.race.replicator.res = resSorted[i];
                        rBal = true;
                        break;
                    }
                }
                if (!global.settings.qAny || rBal){
                    break;
                }
            }

            if (!rBal){
                let resSorted = Object.keys(atomic_mass).sort(function(a,b){return global.resource[a].diff-global.resource[b].diff});
                delete resSorted['Asphodel_Powder']; delete resSorted['Elysanite'];
                resSorted = resSorted.filter(item => global.resource[item] && global.resource[item].display);

                if (global.race.governor.config.replicate.res.neg && resSorted[0] && global.resource[resSorted[0]].diff < 0 && ((global.resource[resSorted[0]].amount <= global.resource[resSorted[0]].max * 0.95) || global.resource[resSorted[0]].max === -1)){
                    global.race.replicator.res = resSorted[0];
                }
                else if (global.resource[global.race.replicator.res].max !== -1 && global.race.governor.config.replicate.res.cap && global.resource[global.race.replicator.res].amount >= global.resource[global.race.replicator.res].max){
                    let cappable = resSorted.filter(item => global.resource[item].max > 0);
                    for (let i=0; i<cappable.length; i++){
                        if (global.resource[cappable[i]].amount < global.resource[cappable[i]].max){
                            global.race.replicator.res = cappable[i];
                            rBal = true;
                            break;
                        }
                    }
                    if (!rBal){
                        let uncappable = resSorted.filter(item => global.resource[item].max === -1);
                        if (uncappable.length > 0){
                            global.race.replicator.res = uncappable[0];
                        }
                    }
                }
            }
        }
    },
};
