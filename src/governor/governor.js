import { global } from '../core/vars.js';
import { vBind, clearElement } from '../functions/dom_helpers.js';
import { tagEvent } from '../functions/analytics.js';
import { calcQueueMax, calcRQueueMax } from '../functions/queues.js';
import { popover } from '../functions/popover.js';
import { hooks } from '../core/registries.js';
import { updateQueueNames } from '../actions/core/structure_ui.js';
import { drawTech } from '../actions/core/action_runner.js';
import { loc } from '../core/locale.js';
import { gmen } from './gov_men.js';
import { govActive } from './gov_active.js';
import { gov_traits } from '../core/registries.js';
import { gov_tasks } from '../core/registries.js';
import { drawnGovernOffice_s1, drawnGovernOffice_s2 } from '../sections/drawing/draw_govern_office_parts.js';
import { genGovernor } from './gov_utils.js';



export function govern(){
    if (global.genes['governor'] && global.tech['governor'] && global.race['governor'] && global.race.governor['g'] && global.race.governor['tasks']){
        let cnt = [0,1,2];
        if (global.genes.governor >= 2){
            cnt.push(cnt.length);
            if (govActive('organizer',0)){ cnt.push(cnt.length); }
        }
        if (govActive('organizer',0)){ cnt.push(cnt.length); }
        cnt.forEach(function(n){
            if (gov_tasks[global.race.governor.tasks[`t${n}`]] && gov_tasks[global.race.governor.tasks[`t${n}`]].req()){
                gov_tasks[global.race.governor.tasks[`t${n}`]].task();
            }
        });
    }
}

export function defineGovernor(){
    if (!global.settings.tabLoad && (global.settings.civTabs !== 2 || global.settings.govTabs !== 0)){
        return;
    }
    if (global.genes['governor'] && global.tech['governor']){
        clearElement($('#r_govern1'));
        if (global.race.hasOwnProperty('governor') && !global.race.governor.hasOwnProperty('candidates')){
            drawnGovernOffice();
        }
        else {
            appointGovernor();
        }
    }
}

export function dragSpyopList(gov){
    let el = $(`#spyopConfig${gov}`)[0];
    if (el){
        Sortable.create(el,{
            onEnd(e){
                let order = global.race.governor.config.spyop[gov];
                order.splice(e.newDraggableIndex, 0, order.splice(e.oldDraggableIndex, 1)[0]);
                global.race.governor.config.spyop[gov] = order;
                defineGovernor();
            }
        });
    }
}

export function drawnGovernOffice(){
    const $ctx = {};
    drawnGovernOffice_s1($ctx);

    drawnGovernOffice_s2($ctx);
}

function appointGovernor(){
    let govern = $(`<div id="candidates" class="governor candidates"></div>`);
    $('#r_govern1').append(govern);

    if (!global.race.hasOwnProperty('governor') || !global.race.governor.hasOwnProperty('candidates')){
        global.race['governor'] = {
            candidates: genGovernor(10)
        };
    }

    govern.append($(`<div class="appoint header"><span class="has-text-caution">${loc(`governor_candidate`)}</span><span class="has-text-caution">${loc(`governor_background`)}</span><span></span><div>`));
    for (let i=0; i<global.race.governor.candidates.length; i++){
        let gov = global.race.governor.candidates[i];
        if ((global.race['warlord'] && gov.bg === 'soldier') || !global.race['warlord']){
            govern.append($(`<div class="appoint ${gov.bg}"><span class="has-text-warning" role="heading" aria-level="3">${gov.t} ${gov.n}</span><span class="bg">${gmen[gov.bg].name}</span><span><button class="button" v-on:click="appoint(${i})">${loc(`governor_appoint`)}</button></span><div>`));
        }
    }

    vBind({
        el: '#candidates',
        data: global.race.governor,
        methods: {
            appoint(gi){
                if (global.genes['governor'] && global.tech['governor']){
                    let gov = global.race.governor.candidates[gi];
                    global.race.governor['g'] = gov;
                    delete global.race.governor.candidates;
                    global.race.governor['tasks'] = {
                        t0: 'none', t1: 'none', t2: 'none', t3: 'none', t4: 'none', t5: 'none'
                    };
                    updateQueueNames(true, ['city-amphitheatre', 'city-apartment']);
                    hooks.drawCity();
                    drawTech();
                    calcQueueMax();
                    calcRQueueMax();
                    defineGovernor();
                    tagEvent('governor',{
                        'appoint': global.race.governor.g.bg
                    });
                }
            }
        }
    });

    global.race.governor.candidates.forEach(function(gov){
        popover(`candidates-${gov.bg}`, function(){
            let desc = '';
            Object.keys(gmen[gov.bg].traits).forEach(function (t){
                desc += (gov_traits[t].hasOwnProperty('effect') ? gov_traits[t].effect() : '') + ' ';
            });
            return desc;
        },
        {
            elm: `#candidates .${gov.bg} .bg`,
        });
    });
}


export { gov_tasks };
