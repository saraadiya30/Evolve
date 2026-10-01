import { global, keyMultiplier, resizeGame } from '../core/vars.js';
import { actions } from '../core/registries.js';
import { govActive } from '../governor/governor.js';
import { clearElement, vBind } from './dom_helpers.js';
import { loc } from '../core/locale.js';
import { clearPopper, popover } from './popover.js';
import { shipCosts, TPShipDesc } from '../truepath/tau_ceti_shipyard.js';
import { mechCost } from '../portal/mech/mech_cost.js';
import { adjustCosts } from './cost_adjusters.js';
import { timeFormat } from './time_format.js';
import { arpaProjectCosts } from '../arpa/arpa_project_building.js';
import { deepClone } from '../core/object_utils.js';
import { mechDesc } from '../portal/mech/mech_lab.js';
import { actionDesc } from '../actions/core/action_costs.js';



export function removeFromQueue(build_ids){
    for (let i=global.queue.queue.length-1; i>=0; i--){
        if (build_ids.includes(global.queue.queue[i].id)){
            global.queue.queue.splice(i, 1);
        }
    }
}

export function removeFromRQueue(tech_trees){
    for (let i=global.r_queue.queue.length-1; i>=0; i--){
        if (tech_trees.includes(actions.tech[global.r_queue.queue[i].type].grant[0])){
            global.r_queue.queue.splice(i, 1);
        }
    }
}

export function calcQueueMax(){
    let max_queue = global.tech['queue'] >= 2 ? (global.tech['queue'] >= 3 ? 8 : 5) : 3;
    if (global.stats.feat['journeyman'] && global.stats.feat['journeyman'] >= 2 && global.stats.achieve['seeder'] && global.stats.achieve.seeder.l >= 2){
        let rank = Math.min(global.stats.achieve.seeder.l,global.stats.feat['journeyman']);
        max_queue += rank >= 4 ? 2 : 1;
    }
    if (global.genes['queue'] && global.genes['queue'] >= 2){
        max_queue *= 2;
    }
    let pragVal = govActive('pragmatist',0);
    if (pragVal){
        max_queue = Math.round(max_queue * (1 + (pragVal / 100)));
    }

    global.queue.max = max_queue;
}

export function calcRQueueMax(){
    let max_queue = 3;
    if (global.stats.feat['journeyman'] && global.stats.achieve['seeder'] && global.stats.achieve.seeder.l > 0){
        let rank = Math.min(global.stats.achieve.seeder.l,global.stats.feat['journeyman']);
        max_queue += rank >= 3 ? (rank >= 5 ? 3 : 2) : 1;
    }
    if (global.genes['queue'] && global.genes['queue'] >= 2){
        max_queue *= 2;
    }
    let theoryVal = govActive('theorist',0);
    if (theoryVal){
        max_queue = Math.round(max_queue * (1 + (theoryVal / 100)));
    }

    global.r_queue.max = max_queue;
}

export function buildQueue(){
    clearDragQueue();
    clearElement($('#buildQueue'));
    $('#buildQueue').append($(`
        <h2 class="has-text-success">${loc('building_queue')} ({{ | used_q }}/{{ max }})</h2>
        <span id="pausequeue" class="${global.queue.pause ? 'pause' : 'play'}" role="button" @click="pauseQueue()" :aria-label="pausedesc()"></span>
    `));

    if (global.settings.queuestyle) {
        $('#buildQueue').addClass(global.settings.queuestyle);

    }

    let queue = $(`<ul class="buildList"></ul>`);
    $('#buildQueue').append(queue);

    queue.append($(`<li v-for="(item, index) in queue"><a v-bind:id="setID(index)" class="has-text-warning queued" v-bind:class="{ 'qany': item.qa }" @click="remove(index)" role="link"><span v-bind:class="setData(index,'res')" v-bind="setData(index,'data')">{{ item.label }}{{ item.q | count }}</span> [<span v-bind:class="{ 'has-text-danger': item.cna, 'has-text-success': !item.cna }">{{ item.time | time }}{{ item.t_max | max_t(item.time) }}</span>]</a></li>`));

    try {
        vBind({
            el: '#buildQueue',
            data: global.queue,
            methods: {
                remove(index){
                    let keyMult = keyMultiplier();
                    for (let i=0; i< keyMult; i++){
                        if (global.queue.queue[index].q > 0){
                            global.queue.queue[index].q -= global.queue.queue[index].qs;
                        }
                        if (global.queue.queue[index].q <= 0){
                            clearPopper(`q${global.queue.queue[index].id}${index}`);
                            global.queue.queue.splice(index,1);
                            buildQueue();
                            break;
                        }
                    }
                },
                setID(index){
                    return `q${global.queue.queue[index].id}${index}`;
                },
                setData(index,prefix){
                    let c_action;
                    let segments = global.queue.queue[index].id.split("-");
                    if (segments[0].substring(0,4) === 'arpa'){
                        c_action = segments[0].substring(4);
                    }
                    else if (segments[0] === 'tp' && segments[1].substring(0,4) === 'ship'){
                        let raw = shipCosts(global.queue.queue[index].type);
                        let costs = {};
                        Object.keys(raw).forEach(function(res){
                            costs[res] = function(){ return raw[res]; }
                        });
                        c_action = { cost: costs };
                    }
                    else if (segments[0] === 'hell' && segments[1].substring(0,4) === 'mech'){
                        let costs = mechCost(global.queue.queue[index].type.size,global.queue.queue[index].type.infernal,true);
                        c_action = { cost: costs };
                    }
                    else if (segments[0] === 'city' || segments[0] === 'evolution' || segments[0] === 'starDock'){
                        c_action = actions[segments[0]][segments[1]];
                    }
                    else {
                        Object.keys(actions[segments[0]]).forEach(function (region){
                            if (actions[segments[0]][region].hasOwnProperty(segments[1])){
                                c_action = actions[segments[0]][region][segments[1]];
                            }
                        });
                    }

                    let final_costs = {};
                    if (c_action['cost']){
                        let costs = adjustCosts(c_action);
                        Object.keys(costs).forEach(function (res){
                            let cost = costs[res]();
                            if (cost > 0){
                                final_costs[`${prefix}-${res}`] = cost;
                            }
                        });
                    }

                    return final_costs;
                },
                pauseQueue(){
                    $(`#pausequeue`).removeClass('play');
                    $(`#pausequeue`).removeClass('pause');
                    if (global.queue.pause){
                        global.queue.pause = false;
                        $(`#pausequeue`).addClass('play');
                    }
                    else {
                        global.queue.pause = true;
                        $(`#pausequeue`).addClass('pause');
                    }
                },
                pausedesc(){
                    return global.queue.pause ? loc('queue_play') : loc('queue_pause');
                }
            },
            filters: {
                time(time){
                    return timeFormat(time);
                },
                count(q){
                    return q > 1 ? ` (${q})`: '';
                },
                max_t(max,time){
                    return time === max || time < 0 ? '' : ` / ${timeFormat(max)}`;
                },
                used_q(){
                    let used = 0;
                    for (let i=0; i<global.queue.queue.length; i++){
                        used += Math.ceil(global.queue.queue[i].q / global.queue.queue[i].qs);
                    }

                    return used;
                }
            }
        });
        dragQueue();
    }
    catch {
        global.queue.queue = [];
    }
}

export function clearDragQueue(){
    let el = $('#buildQueue .buildList')[0];
    if (el){
        let sort = Sortable.get(el);
        if (sort){
            sort.destroy();
        }
    }
}

export function dragQueue(){
    let el = $('#buildQueue .buildList')[0];
    Sortable.create(el,{
        onEnd(e){
            let order = global.queue.queue;
            order.splice(e.newDraggableIndex, 0, order.splice(e.oldDraggableIndex, 1)[0]);
            global.queue.queue = order;
            buildQueue();
            resizeGame();
        }
    });
    resizeGame();
    attachQueuePopovers();
}

export function attachQueuePopovers(){
    for (let i=0; i<global.queue.queue.length; i++){
        let id = `q${global.queue.queue[i].id}${i}`;
        let struct = decodeStructId(global.queue.queue[i].id);
        let isWide = struct.s[0].substring(0,4) !== 'arpa' && struct.a['wide'] ? true : false;

        popover(id,
            function(obj){
                let b_res = global.queue.queue[i].hasOwnProperty('bres') ? global.queue.queue[i].bres : false;
                if (struct.s[0].substring(0,4) === 'arpa'){
                    obj.popper.append(arpaProjectCosts(100,struct.a));
                }
                else if (struct.s[0].substring(0,2) === 'tp' && struct.s[1].substring(0,4) === 'ship'){
                    TPShipDesc(obj.popper,deepClone(global.queue.queue[i]));
                }
                else if (struct.s[0].substring(0,4) === 'hell' && struct.s[1].substring(0,4) === 'mech'){
                    mechDesc(obj.popper,deepClone(global.queue.queue[i]));
                }
                else {
                    actionDesc(obj.popper,struct.a,global[struct.s[0]][struct.s[1]],false,false,false,b_res);
                }
            },
            {
                wide: isWide,
                prop: {
                    modifiers: {
                        preventOverflow: { enabled: false },
                        hide: { enabled: false }
                    }
                }
            }
        );
    }
}

export function decodeStructId(id){
    let c_action;
    let segments = id.split("-");
    if (segments[0].substring(0,4) === 'arpa'){
        c_action = segments[0].substring(4);
    }
    else if (segments[0] === 'tp' && segments[1].substring(0,4) === 'ship'){
        c_action = 'ship';
    }
    else if (segments[0] === 'hell' && segments[1].substring(0,4) === 'mech'){
        c_action = 'mech';
    }
    else if (segments[0] === 'city' || segments[0] === 'evolution' || segments[0] === 'starDock'){
        c_action = actions[segments[0]][segments[1]];
    }
    else {
        Object.keys(actions[segments[0]]).forEach(function (region){
            if (actions[segments[0]][region].hasOwnProperty(segments[1])){
                c_action = actions[segments[0]][region][segments[1]];
            }
        });
    }
    return { s: segments, a: c_action };
}
