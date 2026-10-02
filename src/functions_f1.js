import { global, webWorker, atrack, message_filters, message_logs, keyMultiplier, resizeGame, tmp_vars } from './vars.js';
import { traits } from './races.js';
import { gridDefs } from './industry.js';
import { actions, actionDesc } from './actions.js';
import { govActive } from './governor.js';
import { loc } from './locale.js';
import { shipCosts, TPShipDesc } from './truepath.js';
import { mechCost, mechDesc } from './portal.js';
import { arpaProjectCosts } from './arpa.js';
import { stockFlags, lotBonus } from './stocks_core.js';
import { ATIME_CAP, tagDebug } from './functions.js';
import { eventActive, deepClone } from './functions_f5.js';
import { clearElement, vBind, timeFormat } from './functions_f2.js';
import { adjustCosts } from './functions_f3.js';
import { S } from './functions_f_state.js';

// Fungsi-fungsi dipindah dari functions.js (urutan sumber dipertahankan). functions.js tetap mengekspor ulang nama yang tadinya ter-ekspor.


export function popover(id,content,opts){
    if (!opts){ opts = {}; }
    if (!opts.hasOwnProperty('elm')){ opts['elm'] = '#'+id; }
    if (!opts.hasOwnProperty('bind')){ opts['bind'] = true; }
    if (!opts.hasOwnProperty('unbind')){ opts['unbind'] = true; }
    if (!opts.hasOwnProperty('placement')){ opts['placement'] = 'bottom'; }
    if (opts['bind']){
        $(opts.elm).on(opts['bind_mouse_enter'] ? 'mouseenter' : 'mouseover',function(){
            if (S.popperRef || $(`#popper`).length > 0){
                clearPopper();
            }
            let wide = opts['wide'] ? ' wide' : '';
            let classes = opts['classes'] ? opts['classes'] : `has-background-light has-text-dark pop-desc`;
            var popper = $(`<div id="popper" class="popper${wide} ${classes}" data-id="${id}"></div>`);
            if (opts['attach']){
                $(opts['attach']).append(popper);
            }
            else {
                $(`#main`).append(popper);
            }
            if (content){
                popper.append(typeof content === 'function' ? content({ this: this, popper: popper }) : content);
            }

            S.popperRef = Popper.createPopper(opts['self'] ? this : $(opts.elm)[0],
                document.querySelector(`#popper`),
                {
                    placement: opts['placement'],
                    modifiers: [
                        {
                            name: 'flip',
                            enabled: true,
                        },
                        {
                            name: 'offset',
                            options: {
                                offset: opts['offset'] ? opts['offset'] : [0, 0],
                            },
                        }
                    ],
                }
            );

            popper.show();
            if (opts.hasOwnProperty('in') && typeof opts['in'] === 'function'){
                opts['in']({ this: this, popper: popper, id: `popper` });
            }

            if (eventActive('firework') && global[global.race['cataclysm'] || global.race['orbit_decayed'] ? 'space' : 'city'].firework.on > 0){
                $(popper).append(`<span class="pyro"><span class="before"></span><span class="after"></span></span>`);
            }
        });
    }
    if (opts['unbind']){
        if ('ontouchstart' in document.documentElement && navigator.userAgent.match(/Mobi/ && global.settings.touch) ? true : false){
            $(opts.elm).on('touchend',function(e){
                clearPopper();
                if (opts.hasOwnProperty('out') && typeof opts['out'] === 'function'){
                    opts['out']({ this: this, popper: $(`#popper`), id: `popper`});
                }
            });
        }
        else {
            $(opts.elm).on(opts['bind_mouse_enter'] ? 'mouseleave' : 'mouseout',function(){
                clearPopper();
                if (opts.hasOwnProperty('out') && typeof opts['out'] === 'function'){
                    opts['out']({ this: this, popper: $(`#popper`), id: `popper`});
                }
            });
        }
    }
}

export function clearPopper(id){
    if (id && $(`#popper`).data('id') !== id){
        return;
    }
    $(`#popper`).hide();
    if (S.popperRef){
        S.popperRef.destroy();
        S.popperRef = false;
    }
    clearElement($(`#popper`),true);
}

export function gameLoop(act){
    switch(act){
        case 'stop':
            {
                if (webWorker.w){
                    webWorker.w.postMessage({ loop: 'clear' });
                }
                if (global.settings.at > 0){
                    global.settings.at = atrack.t;
                }
                webWorker.s = false;
            }
            break;
        case 'start':
            {
                addATime(Date.now());

                const timers = loopTimers();

                // Used to calculate resource increase.
                webWorker.mt = timers.webWorkerMainTimer;

                if (webWorker.w){
                    webWorker.w.postMessage({ loop: 'start', period: timers.mainTimer });
                }
                webWorker.s = true;
            }
            break;
        case 'period':
            {
                // Only the interval length changed (accelerated time ran out or kicked in) - reschedule the
                // existing timer in place instead of a stop+start round trip. Avoids tearing down the worker's
                // drift correction (and the brief stutter that comes with rebuilding it) for a plain speed change.
                const timers = loopTimers();
                webWorker.mt = timers.webWorkerMainTimer;
                if (webWorker.w && webWorker.s){
                    webWorker.w.postMessage({ loop: 'period', period: timers.mainTimer });
                }
            }
    }
}

// Computes the relative to default duration of a single loop (common for all three loop types).
// Note that these values are not tied to the time_multiplier from fastLoop - the relative speed of time in the game
// is controlled by loop lengths.
export function loopTimers(){
    // Here come any speed modifiers not related to accelerated time.
    let modifier = 1.0;
    if (global.race['slow']){
        modifier *= 1 + (traits.slow.vars()[0] / 100);
    }
    if (global.race['hyper']){
        modifier *= 1 - (traits.hyper.vars()[0] / 100);
    }

    // Main loop takes 250ms without any modifiers.
    const webWorkerMainTimer = Math.floor(250 * modifier);
    // Mid loop takes 1000ms without any modifiers.
    const baseMidTimer = webWorker.midRatio * webWorkerMainTimer;
    // Long loop (game day) takes 5000ms without any modifiers.
    const baseLongTimer = webWorker.longRatio * webWorkerMainTimer;
    // The constant by which the time is accelerated when atrack.t > 0.
    const timeAccelerationFactor = 2;

    const aTimeMultiplier = atrack.t > 0 ? 1 / timeAccelerationFactor : 1;
    return {
        webWorkerMainTimer,
        mainTimer: Math.ceil(webWorkerMainTimer * aTimeMultiplier),
        longTimer: Math.ceil(baseLongTimer * aTimeMultiplier),
        baseLongTimer,
        timeAccelerationFactor,
    };
}

// Adds accelerated time if enough time has passed since `global.stats.current`. Returns true if there was accelerated
// time added. If the parameter is true, it will only add the time if a threshold of 120s has been reached.
export function addATime(currentTimestamp){
    // The second case is used for the initialization of atrack.t.
    if (exceededATimeThreshold(currentTimestamp) || global.stats.hasOwnProperty('current') && global.settings.at > 0){
        let timeDiff = currentTimestamp - global.stats.current;
        // Removing any accelerated time if the value is larger than the cap.
        if (global.settings.at > ATIME_CAP){
            global.settings.at = 0;
        }
        // Accelerated time is added only if it is over the threshold.
        if (timeDiff >= 120000){
            const timers = loopTimers();
            const gameDayDuration = timers.baseLongTimer;
            // The number of days during which the time is accelerated (at) should take as long as 2 / 3 of paused time.
            // at * gameDayDuration / timeAccelerationFactor = 2 / 3 * timeDiff
            global.settings.at += Math.floor(2 / 3 * timeDiff * timers.timeAccelerationFactor / gameDayDuration);
        }
        // Accelerated time is capped at ATIME_CAP game days.
        if (global.settings.at > ATIME_CAP){
            global.settings.at = ATIME_CAP;
        }
        atrack.t = global.settings.at;
        // Updating the current date so that it won't be counted twice (e.g., when unpausing).
        global.stats.current = currentTimestamp;
    }
}

// Takes the current Date.now, returns whether the minimum threshold to count accelerated time has passed.
export function exceededATimeThreshold(currentTimestamp){
    return global.stats.hasOwnProperty('current') && currentTimestamp - global.stats.current >= 120000;
}

export function powerGrid(type,reset){
    let grids = gridDefs();

    let power_structs = [];
    switch (type){
        case 'power':
            power_structs = [
                'city:transmitter','prtl_ruins:arcology','city:apartment','eden_asphodel:rectory','eden_asphodel:corruptor','int_alpha:habitat','int_alpha:luxury_condo','spc_red:spaceport','spc_titan:titan_spaceport','spc_titan:electrolysis',
                'int_alpha:starport','eden_asphodel:encampment','spc_dwarf:shipyard','spc_titan:ai_core2','spc_eris:drone_control','spc_titan:ai_colonist','int_blackhole:s_gate','gxy_gateway:starbase','spc_triton:fob',
                'prtl_wasteland:demon_forge','prtl_wasteland:twisted_lab','spc_enceladus:operating_base','spc_enceladus:zero_g_lab','spc_titan:sam','gxy_gateway:ship_dock','prtl_ruins:hell_forge','int_neutron:stellar_forge','int_neutron:citadel',
                'prtl_badlands:mortuary','tau_home:orbital_station','tau_red:orbital_platform','tau_gas:refueling_station','tau_home:tau_farm','tau_gas:ore_refinery','tau_gas:whaling_station',
                'city:coal_mine','spc_moon:moon_base','spc_red:red_tower','spc_home:nav_beacon','int_proxima:xfer_station','gxy_stargate:telemetry_beacon','int_nebula:nexus','gxy_stargate:gateway_depot',
                'spc_dwarf:elerium_contain','spc_gas:gas_mining','spc_belt:space_station','spc_gas_moon:outpost','gxy_gorddon:embassy','gxy_gorddon:dormitory','gxy_alien1:resort','spc_gas_moon:oil_extractor',
                'prtl_wasteland:hell_factory','int_alpha:int_factory','city:factory','spc_red:red_factory','spc_dwarf:world_controller','prtl_fortress:turret','prtl_badlands:war_drone','city:wardenclyffe','city:biolab','city:mine',
                'city:rock_quarry','city:cement_plant','city:sawmill','city:mass_driver','int_neutron:neutron_miner','prtl_fortress:war_droid','prtl_pit:soul_forge','gxy_chthonian:excavator','prtl_pit:shadow_mine','prtl_pit:tavern',
                'int_blackhole:far_reach','prtl_badlands:sensor_drone','prtl_badlands:attractor','city:metal_refinery','gxy_stargate:gateway_station','gxy_alien1:vitreloy_plant','gxy_alien2:foothold',
                'gxy_gorddon:symposium','int_blackhole:mass_ejector','city:casino','spc_hell:spc_casino','tau_home:tauceti_casino','prtl_wasteland:hell_casino','prtl_fortress:repair_droid','gxy_stargate:defense_platform','prtl_ruins:guard_post',
                'prtl_lake:cooling_tower','prtl_lake:harbor','prtl_spire:purifier','prtl_ruins:archaeology','prtl_pit:gun_emplacement','prtl_gate:gate_turret','prtl_pit:soul_attractor',
                'prtl_gate:infernite_mine','int_sirius:ascension_trigger','spc_kuiper:orichalcum_mine','spc_kuiper:elerium_mine','spc_kuiper:uranium_mine','spc_kuiper:neutronium_mine','spc_dwarf:m_relay',
                'tau_home:tau_factory','tau_home:infectious_disease_lab','tau_home:alien_outpost','tau_gas:womling_station','spc_red:atmo_terraformer','tau_star:matrix','tau_home:tau_cultural_center',
                'eden_elysium:sacred_smelter','prtl_pit:soul_capacitor','prtl_lake:oven_complete','eden_elysium:elysanite_mine','eden_elysium:elerium_containment','eden_elysium:pillbox','eden_elysium:archive',
                'eden_elysium:restaurant','eden_elysium:eden_cement','eden_isle:spirit_battery','eden_isle:spirit_vacuum','city:replicator'
            ];
            break;
        case 'moon':
            power_structs = ['spc_moon:helium_mine','spc_moon:iridium_mine','spc_moon:observatory'];
            break;
        case 'red':
            power_structs = ['spc_red:living_quarters','spc_red:exotic_lab','spc_red:red_mine','spc_red:fabrication','spc_red:biodome','spc_red:vr_center'];
            break;
        case 'belt':
            power_structs = ['spc_belt:elerium_ship','spc_belt:iridium_ship','spc_belt:iron_ship'];
            break;
        case 'alpha':
            power_structs = ['int_alpha:fusion','int_alpha:mining_droid','int_alpha:processing','int_alpha:laboratory','int_alpha:g_factory','int_alpha:exchange','int_alpha:zoo'];
            break;
        case 'nebula':
            power_structs = ['int_nebula:harvester','int_nebula:elerium_prospector'];
            break;
        case 'gateway':
            power_structs = ['gxy_gateway:bolognium_ship','gxy_gateway:dreadnought','gxy_gateway:cruiser_ship','gxy_gateway:frigate_ship','gxy_gateway:corvette_ship','gxy_gateway:scout_ship'];
            break;
        case 'alien2':
            power_structs = ['gxy_alien2:armed_miner','gxy_alien2:ore_processor','gxy_alien2:scavenger'];
            break;
        case 'lake':
            power_structs = ['prtl_lake:bireme','prtl_lake:transport'];
            break;
        case 'spire':
            power_structs = ['prtl_spire:port','prtl_spire:base_camp','prtl_spire:mechbay'];
            break;
        case 'titan':
            power_structs = ['spc_titan:titan_quarters','spc_titan:titan_mine','spc_titan:g_factory','spc_titan:decoder'];
            break;
        case 'enceladus':
            power_structs = ['spc_enceladus:water_freighter','spc_enceladus:operating_base','spc_enceladus:zero_g_lab'];
            break;
        case 'eris':
            power_structs = ['spc_eris:shock_trooper','spc_eris:tank'];
            break;
        case 'tau_home':
            power_structs = ['tau_home:colony','tau_home:tau_factory','tau_home:mining_pit','tau_home:infectious_disease_lab'];
            break;
        case 'tau_red':
            power_structs = ['tau_red:womling_village','tau_red:womling_farm','tau_red:overseer','tau_red:womling_mine','tau_red:womling_fun','tau_red:womling_lab'];
            break;
        case 'tau_roid':
            power_structs = ['tau_roid:mining_ship','tau_roid:whaling_ship'];
            break;
        case 'asphodel':
            power_structs = ['eden_asphodel:soul_engine','eden_asphodel:bunker','eden_asphodel:asphodel_harvester','eden_asphodel:ectoplasm_processor','eden_asphodel:research_station','eden_asphodel:bliss_den'];
            break;
    }

    if (reset){
        grids[type].l.length = 0;
    }

    power_structs.forEach(function(struct){
        if (!grids[type].l.includes(struct)){
            grids[type].l.push(struct);
        }
    });

    if (grids[type].l.length > power_structs.length){
        grids[type].l.forEach(function(struct){
            if (!power_structs.includes(struct)){
                grids[type].l.splice(grids[type].l.indexOf(struct),1);
            }
        });
    }
}

export function initMessageQueue(filters){
    filters = filters || message_filters;
    filters.forEach(function (filter){
        message_logs[filter] = [];
        if (!global.settings.msgFilters[message_logs.view].vis){
            $(`#msgQueueFilter-${message_logs.view}`).removeClass('is-active').attr('aria-disabled', 'false');
            $(`#msgQueueFilter-${filter}`).addClass('is-active').attr('aria-disabled', 'true');
            message_logs.view = filter;
        }
    });
}

export function messageQueue(msg,color,dnr,tags,reload){
    tags = tags || [];
    if (!reload && !tags.includes('all')){
        tags.push('all');
    }

    color = color || 'warning';

    if (tags.includes(message_logs.view)){
        let new_message = $('<p class="has-text-'+color+'"></p>').text(msg);
        $('#msgQueueLog').prepend(new_message);
        if ($('#msgQueueLog').children().length > global.settings.msgFilters[message_logs.view].max){
            $('#msgQueueLog').children().last().remove();
        }
    }
    tags.forEach(function (tag){
        message_logs[tag].unshift({ msg: msg, color: color });
        if (message_logs[tag].length > global.settings.msgFilters[tag].max){
            message_logs[tag].pop();
        }
    });

    if (!dnr){
        tags.forEach(function (tag){
            if (global.lastMsg[tag]){
                global.lastMsg[tag].unshift({ m: msg, c: color });
                if (global.lastMsg[tag].length > global.settings.msgFilters[tag].save){
                    global.lastMsg[tag].splice(global.settings.msgFilters[tag].save);
                }
            }
        });
    }
}

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

export function tagEvent(event, data){
    try {
        data['debug_mode'] = tagDebug;
        gtag('event', event, data);
    } catch (err){}
}

export function resetResBuffer(){
    // During fastLoop, temporarily increase the maximum storage to avoid unfortunate cases where
    // storage cannot be maximized as a result of consuming a resource after it is produced.
    // The resource buffer is eliminated at the end of fastLoop.
    Object.keys(tmp_vars.resource).forEach(function (res) {
        let temp_max = global.resource[res].max;
        // Don't change infinite storage (-1) into finite storage
        if (temp_max > 0){
            temp_max += global.resource[res].amount;
        }
        tmp_vars.resource[res].temp_max = temp_max;
    });
}

export function modRes(res,val,notrack){
    if(res === 'Food' && global.race['fasting']){
        global.resource[res].amount = 0;
        return false;
    }
    // Stock portfolio bonus: only boosts income produced during the production loop (see fastLoop wrapper in main.js)
    if (val > 0 && !notrack && stockFlags.prod && global.stocks && global.stocks.market && global.stocks.market[res] && global.stocks.market[res].lots > 0){
        val *= lotBonus(global.stocks.market[res].lots);
    }
    let count = global.resource[res].amount + val;
    let success = true;
    let max = notrack ? global.resource[res].max : tmp_vars.resource[res].temp_max;
    if (count > max && max >= 0){
        count = max;
    }
    else if (count < 0){
        success = false;
        count = 0;
    }
    if (!Number.isNaN(count)){
        global.resource[res].amount = count;
        if (!notrack){
            global.resource[res].delta += val;
            if (res === 'Mana' && val > 0){
                global.resource[res].gen_d += val;
            }
            else if (val < 0 && max >= 0){
                tmp_vars.resource[res].temp_max = Math.max(0, tmp_vars.resource[res].temp_max + val);
            }
        }
    }
    return success;
}
