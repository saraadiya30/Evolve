import { global, p_on, callback_queue } from './vars.js';
import { clearPopper, popover } from './functions.js';
import { actions } from './actions_registry.js';
import { traits, fathomCheck } from './races.js';
import { highPopAdjust } from './prod.js';
import { workerScale } from './jobs.js';
import { govActive } from './governor.js';
import { callback_repeat } from './actions.js';
import { resQueue } from './actions_f9.js';
import { actionDesc } from './actions_f6.js';
import { sentience } from './actions_f8.js';

// Fungsi-fungsi dipindah dari actions.js (urutan sumber dipertahankan). actions.js tetap mengekspor ulang nama yang tadinya ter-ekspor.


export function resDragQueue(){
    let el = $('#resQueue .buildList')[0];
    Sortable.create(el,{
        onEnd(e){
            let order = global.r_queue.queue;
            order.splice(e.newDraggableIndex, 0, order.splice(e.oldDraggableIndex, 1)[0]);
            global.r_queue.queue = order;
            resQueue();
        }
    });
    attachQueuePopovers();
}

export function attachQueuePopovers(){
    for (let i=0; i<global.r_queue.queue.length; i++){
        let id = `rq${global.r_queue.queue[i].id}`;
        clearPopper(id);

        let c_action;
        let segments = global.r_queue.queue[i].id.split("-");
        c_action = actions[segments[0]][segments[1]];

        popover(id,function(){ return undefined; },{
            in: function(obj){
                actionDesc(obj.popper,c_action,global[segments[0]][segments[1]],false);
            },
            out: function(){
                clearPopper(id);
            },
            wide: c_action['wide']
        });
    }
}

export function bananaPerk(val){
    if (global.stats.achieve['banana'] && global.stats.achieve.banana.l >= 5){
        return val - 0.01;
    }
    return val;
}

export function bank_vault(){
    let vault = 1800;
    if (global.tech['vault'] >= 1){
        vault = (global.tech['vault'] + 1) * 7500;
    }
    else if (global.tech['banking'] >= 5){
        vault = 9000;
    }
    else if (global.tech['banking'] >= 3){
        vault = 4000;
    }
    if (global.race['paranoid']){
        vault *= 1 - (traits.paranoid.vars()[0] / 100);
    }
    if (global.race['hoarder']){
        vault *= 1 + (traits.hoarder.vars()[0] / 100);
    }
    let fathom = fathomCheck('dracnid');
    if (fathom > 0){
        vault *= 1 + (traits.hoarder.vars(1)[0] / 100 * fathom);
    }
    if (global.tech.banking >= 7){
        vault *= 1 + highPopAdjust(workerScale(global.civic.banker.workers,'banker') * 0.05);
    }
    if (global.tech.banking >= 8){
        vault += highPopAdjust(25 * global.resource[global.race.species].amount);
    }
    if (global.tech['stock_exchange']){
        vault *= 1 + (global.tech['stock_exchange'] * 0.1);
    }
    if (global.tech['world_control']){
        vault *= 1.25;
    }
    if (global.race['truepath']){
        vault *= 1.25;
    }
    if (global.blood['greed']){
        vault *= 1 + (global.blood.greed / 100);
    }
    if (global.stats.achieve['wheelbarrow']){
        vault *= 1 + (global.stats.achieve.wheelbarrow.l / 50);
    }
    if (global.race['inflation']){
        vault *= 1 + (global.race.inflation / 125);
    }
    if (global.tech['ai_core'] && global.tech.ai_core >= 4){
        let citadel = p_on['citadel'] || 0;
        vault *= 1 + (citadel / 100);
    }
    let rskVal = govActive('risktaker',0);
    if (rskVal){
        vault *= 1 + (rskVal / 100);
    }
    return vault;
}

export function start_cataclysm(){
    if (global.race['start_cataclysm']){
        delete global.race['start_cataclysm'];
        sentience();
    }
}

export function doCallbacks(){
    for (const [[c_action, func], args] of callback_queue){
        // If the function returns true, then it wants to be called again in the future
        if (c_action[func](...args)){
            callback_repeat.set([c_action, func], args);
        }
    }
    // Remove all registered callbacks, then reinsert any callbacks that want to be repeated
    callback_queue.clear();
    for (const [[c_action, func], args] of callback_repeat){
        callback_queue.set([c_action, func], args);
    }
    callback_repeat.clear();
}
