import { global, keyMultiplier, callback_queue, keyMap } from '../core/vars.js';
import { actions } from './actions_registry.js';
import { clearElement, trickOrTreat, clearPopper, buildQueue } from '../functions/functions.js';
import { loc } from '../core/locale.js';
import { gainGene, gainBlood } from '../arpa/arpa.js';
import { renderSpace } from '../space/space.js';
import { renderFortress } from '../portal/portal.js';
import { renderTauCeti } from '../truepath/truepath.js';
import { renderEdenic } from '../edenic/edenic.js';
import { checkTechPath, checkOldTech, checkTechQualifications, checkTechRequirements, gainTech, drawCity } from './actions_f3.js';
import { removeAction, checkAffordable, updateDesc } from './actions_f6.js';
import { resQueue } from './actions_f9.js';
import { drawEvolution } from './actions_f2.js';
import { setAction_s1, setAction_s2 } from '../sections/sec_setAction_1.js';

// Fungsi-fungsi dipindah dari actions.js (urutan sumber dipertahankan). actions.js tetap mengekspor ulang nama yang tadinya ter-ekspor.


export function drawTech(){
    if (!global.settings.tabLoad && global.settings.civTabs !== 3){
        return;
    }
    let techs = {};
    let old_techs = {};
    let new_techs = {};
    let tech_categories = [];
    let old_categories = [];
    let all_categories = [];

    ['primitive','civilized','discovery','industrialized','globalized','early_space','deep_space','interstellar','intergalactic'].forEach(function (era){
        new_techs[era] = [];
    });

    const tp_era = {
        interstellar: 'solar'
    };

    let preReq = {};
    Object.keys(actions.tech).forEach(function (tech_name){
        if (!checkTechPath(tech_name)){
            return;
        }
        removeAction(actions.tech[tech_name].id);

        let isOld = checkOldTech(tech_name);

        let action = actions.tech[tech_name];
        let category = 'category' in action ? action.category : 'research';

        if (!isOld && tech_categories.indexOf(category) === -1) {
            tech_categories.push(category);
        }
        if (isOld && old_categories.indexOf(category) === -1) {
            old_categories.push(category);
        }
        if (all_categories.indexOf(category) === -1) {
            all_categories.push(category);
        }

        if (isOld === true) {
            if (!(category in old_techs)){
                old_techs[category] = [];
            }

            old_techs[category].push(tech_name);
        }
        else {
            let c_action = actions['tech'][tech_name];
            if (!checkTechQualifications(c_action,tech_name)){
                return;
            }

            let techAvail = checkTechRequirements(tech_name,preReq);
            if (!techAvail){
                return;
            }

            if (!(category in techs)) {
                techs[category] = [];
            }

            let era = global.race['truepath'] && tp_era[c_action.era] ? tp_era[c_action.era] : c_action.era;

            if (!new_techs.hasOwnProperty(era)){
                new_techs[era] = [];
            }

            new_techs[era].push({ t: tech_name, p: techAvail === 'precog' ? true : false });
        }
    });

    clearElement($(`#tech`));
    Object.keys(new_techs).forEach(function (era){
        if (new_techs[era].length > 0){
            $(`#tech`).append(`<div><h3 class="name has-text-warning">${loc(`tech_era_${era}`)}</h3></div>`);

            new_techs[era].sort(function(a, b){
                if(actions.tech[a.t].cost.Knowledge == undefined){
                    return -1;
                }
                if(actions.tech[b.t].cost.Knowledge == undefined){
                    return 1;
                }
                if (actions.tech[a.t].cost.Omniscience != undefined && actions.tech[b.t].cost.Omniscience != undefined){
                    return actions.tech[a.t].cost.Omniscience() > actions.tech[b.t].cost.Omniscience() ? 1 : -1;
                }
                return actions.tech[a.t].cost.Knowledge() > actions.tech[b.t].cost.Knowledge() ? 1 : -1;
            });
            new_techs[era].forEach(function(tech){
                addAction('tech', tech.t, false, tech.p ? preReq : false);
            });
        }
    });

    all_categories.forEach(function(category){
        clearElement($(`#tech-dist-${category}`),true);
        clearElement($(`#tech-dist-old-${category}`),true);
    });

    old_categories.forEach(function(category){
        if(!(category in old_techs)){
            return;
        }

        $(`<div id="tech-dist-old-${category}" class="tech"></div>`)
            .appendTo('#oldTech')
            .append(`<div><h3 class="name has-text-warning">${loc(`tech_dist_${category}`)}</h3></div>`);

        let trick = trickOrTreat(4,12,false);
        if (trick.length > 0 && category === 'science'){
            $(`#tech-dist-old-science h3`).append(trick);
        }

        old_techs[category].forEach(function(tech_name) {
            addAction('tech', tech_name, true, false);
        });
    });
}

export function addAction(action,type,old,prediction){
    let c_action = actions[action][type];
    setAction(c_action,action,type,old,prediction)
}

export function setAction(c_action,action,type,old,prediction){
    const $ctx = {};
    $ctx.c_action = c_action;
    $ctx.action = action;
    $ctx.type = type;
    $ctx.old = old;
    $ctx.prediction = prediction;
    { const $r = setAction_s1($ctx); if ($r) return $r.$r; }

    setAction_s2($ctx);
}

export function runAction(c_action,action,type){
    if (c_action.id === 'spcdock-launch_ship'){
        c_action.action({isQueue: false});
    }
    else {
        switch (action){
            case 'tech':
                if (!(global.settings.qKey && keyMap.q) && checkTechRequirements(type,false) && c_action.action({isQueue: false})){
                    gainTech(type);
                    if (c_action['post']){
                        callback_queue.set([c_action, 'post'], []);
                    }
                }
                else {
                    if (!(c_action['no_queue'] && c_action['no_queue']()) && global.tech['r_queue']){
                        if (global.r_queue.queue.length < global.r_queue.max){
                            let queued = false;
                            for (let tech in global.r_queue.queue){
                                if (global.r_queue.queue[tech].id === c_action.id){
                                    queued = true;
                                    break;
                                }
                            }
                            if (!queued){
                                global.r_queue.queue.push({ id: c_action.id, action: action, type: type, label: typeof c_action.title === 'string' ? c_action.title : c_action.title(), cna: false, time: 0, bres: false, req: true });
                                resQueue();
                                drawTech();
                            }
                        }
                    }
                }
                break;
            case 'genes':
            case 'blood':
                if (c_action.action({isQueue: false})){
                    if (action === 'genes'){
                        gainGene(type);
                    }
                    else {
                        gainBlood(type);
                    }
                    if (c_action['post']){
                        callback_queue.set([c_action, 'post'], []);
                    }
                }
                break;
            default:
                {
                    let keyMult = c_action['no_multi'] ? 1 : keyMultiplier();
                    if (c_action['grant']){
                        keyMult = 1;
                    }
                    let grant = false;
                    let add_queue = false;
                    let loopNum = global.settings.qKey && keyMap.q ? 1 : keyMult;
                    for (let i=0; i<loopNum; i++){
                        let res = false;
                        if ((global.settings.qKey && keyMap.q) || (!(res = c_action.action({isQueue: false})))){
                            if (res !== 0 && global.tech['queue'] && (keyMult === 1 || (global.settings.qKey && keyMap.q))){
                                let used = 0;
                                let buid_max = c_action['queue_complete'] ? c_action.queue_complete() : Number.MAX_SAFE_INTEGER;
                                for (let j=0; j<global.queue.queue.length; j++){
                                    used += Math.ceil(global.queue.queue[j].q / global.queue.queue[j].qs);
                                    if (global.queue.queue[j].id === c_action.id) {
                                        buid_max -= global.queue.queue[j].q;
                                    }
                                }
                                if (used < global.queue.max && buid_max > 0){
                                    let repeat = global.settings.qKey ? keyMult : 1;
                                    if (repeat > global.queue.max - used){
                                        repeat = global.queue.max - used;
                                    }
                                    let q_size = c_action['queue_size'] ? c_action['queue_size'] : 1;
                                    if (c_action['region']){
                                        action = c_action.id.split("-")[0];
                                    }
                                    if (global.settings.q_merge !== 'merge_never'){
                                        if (global.queue.queue.length > 0 && global.queue.queue[global.queue.queue.length-1].id === c_action.id){
                                            global.queue.queue[global.queue.queue.length-1].q += Math.min(buid_max, q_size * repeat);
                                        }
                                        else {
                                            global.queue.queue.push({ id: c_action.id, action: action, type: type, label: typeof c_action.title === 'string' ? c_action.title : c_action.title(), cna: false, time: 0, q: Math.min(buid_max, q_size * repeat), qs: q_size, t_max: 0, bres: false });
                                        }
                                    }
                                    else {
                                        for (let k=0; k<repeat && buid_max > 0; k++){
                                            global.queue.queue.push({ id: c_action.id, action: action, type: type, label: typeof c_action.title === 'string' ? c_action.title : c_action.title(), cna: false, time: 0, q: Math.min(buid_max, q_size), qs: q_size, t_max: 0, bres: false });
                                            buid_max -= q_size;
                                        }
                                    }
                                    add_queue = true;
                                }
                            }
                            break;
                        }
                        else {
                            if (global.race['inflation'] && global.tech['primitive']){
                                if (!c_action.hasOwnProperty('inflation') || c_action.inflation){
                                    global.race.inflation++;
                                }
                            }
                        }
                        grant = true;
                    }
                    if (grant){
                        postBuild(c_action,action,type);
                        if (global.tech['queue'] && c_action['queue_complete']) {
                            let buid_max = c_action.queue_complete();
                            for (let i=0, j=0; j<global.queue.queue.length; i++, j++){
                                let item = global.queue.queue[j];
                                if (item.id === c_action.id) {
                                    if (buid_max < 1) {
                                        clearPopper(`q${item.id}${i}`);
                                        global.queue.queue.splice(j--,1);
                                        add_queue = true;
                                    }
                                    else if (item.q > buid_max) {
                                        item.q = buid_max;
                                        buid_max = 0;
                                    }
                                    else {
                                        buid_max -= item.q;
                                    }
                                }
                            }
                        }
                    }
                    if (add_queue){
                        buildQueue();
                    }
                    break;
                }
        }
    }
}

export function postBuild(c_action,action,type){
    if (!checkAffordable(c_action)){
        let id = c_action.id;
        $(`#${id}`).addClass('cna');
    }
    if (c_action['grant']){
        let tech = c_action.grant[0];
        if (!global.tech[tech] || global.tech[tech] < c_action.grant[1]){
            global.tech[tech] = c_action.grant[1];
        }
    }
    if (c_action['grant'] || c_action['refresh']){
        removeAction(c_action.id);
        if (global.race.species === 'protoplasm'){
            drawEvolution();
        }
        else {
            drawCity();
            drawTech();
            renderSpace();
            renderFortress();
            renderTauCeti();
            renderEdenic();
        }
    }
    if (c_action['post']){
        callback_queue.set([c_action, 'post'], []);
    }
    updateDesc(c_action,action,type);
}
