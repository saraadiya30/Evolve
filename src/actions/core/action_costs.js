// Isi: actionDesc(), removeAction(), updateDesc(), payCosts(), checkAffordable(), templeCount(), checkMaxCosts(), checkCosts(), checkStructs(), conceal_adjust(), dirt_adjust(), challengeGeneHeader(), challengeActionHeader(), scenarioActionHeader() +2
import { clearElement, vBind } from '../../functions/dom_helpers.js';
import { timeCheck, timeFormat } from '../../functions/time_format.js';
import { adjustCosts } from '../../functions/cost_adjusters.js';
import { clearPopper } from '../../functions/popover.js';
import { global, sizeApproximation } from '../../core/vars.js';
import { loc } from '../../core/locale.js';
import { actions } from '../../core/registries.js';
import { garrisonSize, armyRating } from '../../civics/military/army_rating.js';
import { govActive } from '../../governor/governor.js';
import { runAction } from './action_runner.js';
import { getStructNumActive } from '../evolution/planet_setup.js';
import { exitSim } from '../evolution/simulation_ai.js';

// Fungsi-fungsi dipindah dari actions.js (urutan sumber dipertahankan). actions.js tetap mengekspor ulang nama yang tadinya ter-ekspor.


export function actionDesc(parent,c_action,obj,old,action,a_type,bres){
    clearElement(parent);
    let desc = typeof c_action.desc === 'string' ? c_action.desc : c_action.desc();
    bres = bres || false;
    
    let touch = false;
    if (action && a_type && 'ontouchstart' in document.documentElement && navigator.userAgent.match(/Mobi/) && global.settings.touch ? true : false){
        touch = $(`<a id="touchButton" class="button is-dark touchButton">${c_action.hasOwnProperty('touchlabel') ? c_action.touchlabel : loc('construct')}</a>`);
        parent.append(touch);

        $('#touchButton').on('touchstart', function(){
            runAction(c_action,action,a_type);
        });
    }

    parent.append($(`<div>${desc}</div>`));

    let type = c_action.id.split('-')[0];
    if (c_action['category'] && type === 'tech' && !old){
        parent.append($(`<div class="has-text-flair">${loc('tech_dist_category')}: ${loc(`tech_dist_${c_action.category}`)}</div>`));
    }

    let tc = timeCheck(c_action,false,true);
    if (c_action.cost && !old){
        let empty = true;
        let cost = $('<div class="costList"></div>');

        let costs = type !== 'genes' && type !== 'blood' ? adjustCosts(c_action) : c_action.cost;
        Object.keys(costs).forEach(function (res){
            if (res === 'Custom'){
                let custom = costs[res]();
                cost.append($(`<div>${custom.label}</div>`));
                empty = false;
            }
            else if (res === 'Structs'){
                let structs = costs[res]();
                Object.keys(structs).forEach(function (region){
                    Object.keys(structs[region]).forEach(function (struct){
                        let label = '';
                        const check_on = structs[region][struct].hasOwnProperty('on');
                        let num_on;
                        let res_cost = check_on ? structs[region][struct].on : structs[region][struct].count;
                        let color = 'has-text-dark';
                        let aria = '';

                        if (structs[region][struct].hasOwnProperty('s')){
                            const sector = structs[region][struct].s;
                            label = typeof actions[region][sector][struct].title === 'string' ? actions[region][sector][struct].title : actions[region][sector][struct].title();
                            if (check_on){
                                num_on = getStructNumActive(actions[region][sector][struct]);
                            }
                        }
                        else {
                            label = typeof actions[region][struct].title === 'string' ? actions[region][struct].title : actions[region][struct].title();
                            if (check_on){
                                num_on = getStructNumActive(actions[region][struct]);
                            }
                        }

                        if (!global[region][struct]){
                            color = 'has-text-danger';
                            aria = ' <span class="is-sr-only">(blocking resource)</span>';
                        }
                        else if (structs[region][struct].count > global[region][struct].count){
                            color = 'has-text-danger';
                            aria = ' <span class="is-sr-only">(blocking resource)</span>';
                        }
                        else if (check_on && structs[region][struct].on > num_on){
                            color = 'has-text-alert';
                        }

                        empty = false;
                        cost.append($(`<div class="${color}">${label}: ${res_cost}${aria}</div>`));
                    });
                });
            }
            else if (global.prestige.hasOwnProperty(res)){
                let res_cost = costs[res]();
                if (res_cost > 0){
                    if (res === 'Plasmid' && global.race.universe === 'antimatter'){
                        res = 'AntiPlasmid';
                    }
                    let label = loc(`resource_${res}_name`);
                    let color = 'has-text-dark';
                    let aria = '';
                    if (global.prestige[res].count < res_cost){
                        color = 'has-text-danger';
                        aria = ' <span class="is-sr-only">(blocking resource)</span>';
                    }
                    empty = false;
                    cost.append($(`<div class="${color} res-${res}" data-${res}="${res_cost}">${label}: ${res_cost}${aria}</div>`));
                }
            }
            else if (res === 'Supply'){
                let res_cost = costs[res]();
                if (res_cost > 0){
                    let label = loc(`resource_${res}_name`);
                    let color = 'has-text-dark';
                    let aria = '';
                    if (global.portal.purifier.supply < res_cost){
                        color = 'has-text-danger';
                        aria = ' <span class="is-sr-only">(blocking resource)</span>';
                    }
                    empty = false;
                    cost.append($(`<div class="${color} res-${res}" data-${res}="${res_cost}">${label}: ${res_cost}${aria}</div>`));
                }
            }
            else if (res !== 'Morale' && res !== 'Army' && res !== 'Bool'){
                let res_cost = costs[res]();
                if (res_cost > 0){
                    let aria = '';
                    let f_res = res === 'Species' ? global.race.species : res;
                    if (res === 'HellArmy'){
                        let label = loc('fortress_troops');
                        let color = 'has-text-dark';
                        if (global.portal.fortress.garrison - (global.portal.fortress.patrols * global.portal.fortress.patrol_size) < res_cost){
                            if (tc.r === f_res){
                                color = 'has-text-danger';
                                aria = ' <span class="is-sr-only">(blocking resource)</span>';
                            }
                            else {
                                color = 'has-text-alert';
                            }
                        }
                        empty = false;
                        cost.append($(`<div class="${color}" data-${res}="${res_cost}">${label}: ${res_cost}${aria}</div>`));
                    }
                    else if (res === 'Troops'){
                        let label = global.tech['world_control'] && !global.race['truepath'] ? loc('civics_garrison_peacekeepers') : loc('civics_garrison_soldiers');
                        let color = 'has-text-dark';
                        if (garrisonSize() < res_cost){
                            if (tc.r === f_res){
                                color = 'has-text-danger';
                                aria = ' <span class="is-sr-only">(blocking resource)</span>';
                            }
                            else {
                                color = 'has-text-alert';
                            }
                        }
                        empty = false;
                        cost.append($(`<div class="${color}" data-${res}="${res_cost}">${label}: ${res_cost}${aria}</div>`));
                    }
                    else {
                        let label = f_res === 'Money' ? '$' : global.resource[f_res].name+': ';
                        label = label.replace("_", " ");
                        let color = 'has-text-dark';
                        let aria = '';
                        if (global.resource[f_res].amount < res_cost){
                            if (tc.r === f_res){
                                color = 'has-text-danger';
                                aria = ' <span class="is-sr-only">(blocking resource)</span>';
                            }
                            else {
                                color = 'has-text-alert';
                            }
                            if (bres && bres !== res && tc.r === f_res){
                                color += ' grad-from-left';
                                aria = ' <span class="is-sr-only">(first blocking resource)</span>';
                            }
                            else if (bres && bres === res && tc.r !== f_res){
                                color += ' grad-from-left-warn';
                            }
                        }
                        else if (bres && bres === res){
                            color += ' grad-from-right';
                            aria = ' <span class="is-sr-only">(last blocking resource)</span>';
                        }
                        let display_cost = sizeApproximation(res_cost,1);
                        empty = false;
                        cost.append($(`<div class="${color} res-${res}" data-${f_res}="${res_cost}">${label}${display_cost}${aria}</div>`));
                    }
                }
            }
        });
        if (!empty){
            parent.append(cost);
        }
    }
    if (c_action.effect){
        let effect = typeof c_action.effect === 'string' ? c_action.effect : c_action.effect();
        if (effect){
            parent.append($(`<div>${effect}</div>`));
        }
    }
    if (c_action.flair){
        let flair = typeof c_action.flair === 'string' ? c_action.flair : c_action.flair();
        parent.append($(`<div class="flair has-text-flair">${flair}</div>`));
        parent.addClass('flair');
    }

    if (c_action['reqs']){
        let reqList = [];
        Object.keys(c_action.reqs).forEach(function(r){
            let req = $(`#${c_action.id}`).attr(`data-req-${r}`);
            if (req){
                reqList.push(typeof actions.tech[req].title === 'string' ? actions.tech[req].title : actions.tech[req].title());
            }
        });
        if (reqList.length > 0){
            let listing = reqList.join(', ');
            parent.append($(`<div class="has-text-caution">${loc('requires_tech',[listing])}</div>`));
        }
    }

    if (!old && c_action.id.substring(0,5) !== 'blood' && !checkAffordable(c_action) && checkAffordable(c_action,true)){
        if (typeof obj === 'string' && obj === 'notimer'){
            return;
        }
        if (obj && obj['time']){
            parent.append($(`<div id="popTimer" class="flair has-text-advanced">{{ time | timer }}</div>`));
            vBind({
                el: '#popTimer',
                data: obj,
                filters: {
                    timer(t){
                        return loc('action_ready',[t]);
                    }
                }
            });
        }
        else {
            let time = timeFormat(tc.t);
            parent.append($(`<div class="flair has-text-advanced">${loc('action_ready',[time])}</div>`));
        }
    }
    if (c_action.id === 'portal-spire' || (c_action.id === 'portal-waygate' && global.tech.waygate >= 2)){
        if (obj && obj['time']){
            parent.append($(`<div id="popTimer" class="flair has-text-advanced">{{ time | timer }}</div>`));
            vBind({
                el: '#popTimer',
                data: obj,
                filters: {
                    timer(t){
                        let time = !c_action.hasOwnProperty('mscan') || (c_action.hasOwnProperty('mscan') && c_action.mscan() > 0) ? t : '???';
                        return loc('floor_clearing',[time]);
                    }
                }
            });
        }
    }
    if(c_action.id === "portal-devilish_dish"){
        if (obj && obj['time']){
            parent.append($(`<div id="popTimer" class="flair has-text-advanced">{{ time | timer }}</div>`));
            vBind({
                el: '#popTimer',
                data: obj,
                filters: {
                    timer(t){
                        let time = !c_action.hasOwnProperty('mscan') || (c_action.hasOwnProperty('mscan') && c_action.mscan() > 0) ? t : '???';
                        return loc('action_done',[time]);
                    }
                }
            });
        }
    }
}

export function removeAction(id){
    clearElement($(`#${id}`),true);
    clearPopper(id);
}

export function updateDesc(c_action,category,action){
    let id = c_action.id;
    if (global[category] && global[category][action] && global[category][action]['count']){
        if(!c_action.hasOwnProperty('count')){
            $(`#${id} .count`).html(global[category][action].count);
        }
        if (global[category][action] && global[category][action].count > 0){
            $(`#${id} .count`).css('display','inline-block');
            $(`#${id} .special`).css('display','block');
            $(`#${id} .on`).css('display','block');
            $(`#${id} .off`).css('display','block');
        }
    }
    if ($('#popper').data('id') === id){
        actionDesc($('#popper'),c_action,global[category][action],false,category,action);
    }
}

export function payCosts(c_action, costs){
    costs = costs || adjustCosts(c_action);
    if (checkCosts(costs)){
        Object.keys(costs).forEach(function (res){
            if (global.prestige.hasOwnProperty(res)){
                let cost = costs[res]();
                if (res === 'Plasmid' && global.race.universe === 'antimatter'){
                    res = 'AntiPlasmid';
                }
                global.prestige[res].count -= cost;
            }
            else if (res === 'Supply'){
                let cost = costs[res]();
                global.portal.purifier.supply -= cost;
            }
            else if (res === 'Species'){
                let cost = costs[res]();
                global.resource[global.race.species].amount -= cost;
                // If the default job does not have enough workers, then the main game loop will deplete some other job
                global.civic[global.civic.d_job].workers = Math.max(0, global.civic[global.civic.d_job].workers - cost);
            }
            else if (res !== 'Morale' && res !== 'Army' && res !== 'HellArmy' && res !== 'Troops' && res !== 'Structs' && res !== 'Bool' && res !== 'Custom'){
                let cost = costs[res]();
                global.resource[res].amount -= cost;
                if (res === 'Knowledge'){
                    global.stats.know += cost;
                }
            }
        });
        return true;
    }
    return false;
}

export function checkAffordable(c_action,max,raw){
    if (c_action.cost){
        let cost = raw ? c_action.cost : adjustCosts(c_action);
        if (max){
            return checkMaxCosts(cost);
        }
        else {
            return checkCosts(cost);
        }
    }
    return true;
}

export function templeCount(zig){
    if (!zig && global.city['temple']){
        let count = global.city.temple.count;
        if (!global.race['cataclysm'] && !global.race['orbit_decayed'] && !global.race['lone_survivor'] && !global.race['warlord']){
            if (global.race['wish'] && global.race['wishStats'] && global.race.wishStats.temple){
                count++;
            }
            if (global.genes.hasOwnProperty('ancients') && global.genes.ancients >= 6){
                count++;
            }
        }
        return count;
    }
    else if (zig && global.space['ziggurat']){
        let count = global.space.ziggurat.count;
        if (!global.race['lone_survivor'] && !global.race['warlord']){
            if (global.race['wish'] && global.race['wishStats'] && global.race.wishStats.zigg){
                count++;
            }
            if (global.genes.hasOwnProperty('ancients') && global.genes.ancients >= 7){
                count++;
            }
        }
        return count;
    }
    return 0;
}
 

function checkMaxCosts(costs){
    let test = true;
    Object.keys(costs).forEach(function (res){
        if (res === 'Custom'){
            // Do Nothing
        }
        else if (res === 'Structs'){
            if (!checkStructs(costs[res]())){
                test = false;
                return;
            }
        }
        else if (global.prestige.hasOwnProperty(res)){
            let oRes = res;
            if (res === 'Plasmid' && global.race.universe === 'antimatter'){
                res = 'AntiPlasmid';
            }
            if (global.prestige[res].count < Number(costs[oRes]())){
                test = false;
                return;
            }
        }
        else if (res === 'Bool'){
            if (!costs[res]()){
                test = false;
                return;
            }
        }
        else if (res === 'Morale'){
            if (global.city.morale.current < Number(costs[res]())){
                test = false;
                return;
            }
        }
        else if (res === 'Army'){
            if (armyRating(global.civic.garrison.raid,'army') < Number(costs[res]())){
                test = false;
                return;
            }
        }
        else if (res === 'HellArmy'){
            if (typeof global.portal['fortress'] === 'undefined' || global.portal.fortress.garrison - (global.portal.fortress.patrols * global.portal.fortress.patrol_size) < Number(costs[res]())){
                test = false;
                return;
            }
        }
        else if (res === 'Troops'){
            if (garrisonSize() < Number(costs[res]())){
                test = false;
                return;
            }
        }
        else if (res === 'Supply'){
            if (!global.portal.hasOwnProperty('purifier') || global.portal.purifier.sup_max < Number(costs[res]())){
                test = false;
                return;
            }
        }
        else {
            let testCost = Number(costs[res]()) || 0;
            let f_res = res === 'Species' ? global.race.species : res;
            if ((!global.resource[f_res].display && testCost > 0) || (global.resource[f_res].max >= 0 && testCost > Number(global.resource[f_res].max) && Number(global.resource[f_res].max) !== -1)){
                test = false;
                return;
            }
        }
    });
    return test;
}

export function checkCosts(costs){
    let test = true;
    Object.keys(costs).forEach(function (res){
        if (res === 'Custom'){
            let custom = costs[res]();
            if (!custom.met){
                test = false;
                return;
            }
        }
        else if (res === 'Structs'){
            if (!checkStructs(costs[res]())){
                test = false;
                return;
            }
        }
        else if (global.prestige.hasOwnProperty(res)){
            let oRes = res;
            if (res === 'Plasmid' && global.race.universe === 'antimatter'){
                res = 'AntiPlasmid';
            }
            if (global.prestige[res].count < Number(costs[oRes]())){
                test = false;
                return;
            }
        }
        else if (res === 'Bool'){
            if (!costs[res]()){
                test = false;
                return;
            }
        }
        else if (res === 'Morale'){
            if (global.city.morale.current < Number(costs[res]())){
                test = false;
                return;
            }
        }
        else if (res === 'Army'){
            if (armyRating(global.civic.garrison.raid,'army') < Number(costs[res]())){
                test = false;
                return;
            }
        }
        else if (res === 'HellArmy'){
            if (typeof global.portal['fortress'] === 'undefined' || global.portal.fortress.garrison - (global.portal.fortress.patrols * global.portal.fortress.patrol_size) < Number(costs[res]())){
                test = false;
                return;
            }
        }
        else if (res === 'Troops'){
            if (garrisonSize() < Number(costs[res]())){
                test = false;
                return;
            }
        }
        else if (res === 'Supply'){
            if (!global.portal.hasOwnProperty('purifier') || global.portal.purifier.supply < Number(costs[res]())){
                test = false;
                return;
            }
        }
        else {
            let testCost = Number(costs[res]()) || 0;
            if (testCost === 0){
                return;
            }
            let f_res = res === 'Species' ? global.race.species : res;
            if (testCost > Number(global.resource[f_res].amount) || (global.resource[f_res].max >= 0 && testCost > global.resource[f_res].max)){
                test = false;
                return;
            }
        }
    });
    return test;
}

function checkStructs(structs){
    let test = true;
    Object.keys(structs).forEach(function (region){
        if (global.hasOwnProperty(region)){
            Object.keys(structs[region]).forEach(function (struct){
                if (global[region].hasOwnProperty(struct)){
                    if (global[region][struct].count < structs[region][struct].count){
                        test = false;
                        return;
                    }
                    if (structs[region][struct].hasOwnProperty('on')){
                        let num_on;
                        if (structs[region][struct].hasOwnProperty('s')){
                            const sector = structs[region][struct].s;
                            num_on = getStructNumActive(actions[region][sector][struct]);
                        } else {
                            num_on = getStructNumActive(actions[region][struct]);
                        }
                        if (num_on < structs[region][struct].on){
                            test = false;
                            return;
                        }
                    }
                }
                else {
                    test = false;
                    return;
                }
            });
        }
        else {
            test = false;
            return;
        }
    });
    return test;
}

export function conceal_adjust(mana){
    if (global.tech['nexus'] && global.tech['roguemagic'] && global.tech.roguemagic >= 7){
        mana *= 0.96 ** global.tech.nexus;
    }
    return mana;
}

export function dirt_adjust(creep){
    let dirtVal = govActive('dirty_jobs',0);
    if (dirtVal){
        creep -= dirtVal;
    }
    return creep;
}

export function challengeGeneHeader(){
    let challenge = $(`<div class="challenge"></div>`);
    $('#evolution').append(challenge);
    challenge.append($(`<div class="divider has-text-warning"><h2 class="has-text-danger">${loc('evo_challenge_genes')}</h2></div>`));
    challenge.append($(`<div class="has-text-advanced">${loc('evo_challenge_genes_desc')}</div>`));
    if (global.genes['challenge'] && global.genes['challenge'] >= 2){
        challenge.append($(`<div class="has-text-advanced">${loc('evo_challenge_genes_mastery')}</div>`));
    }
}

export function challengeActionHeader(){
    let challenge = $(`<div class="challenge"></div>`);
    $('#evolution').append(challenge);
    challenge.append($(`<div class="divider has-text-warning"><h2 class="has-text-danger">${loc('evo_challenge_run')}</h2></div>`));
    challenge.append($(`<div class="has-text-advanced">${loc('evo_challenge_run_desc')}</div>`));
}

export function scenarioActionHeader(){
    let challenge = $(`<div class="challenge"></div>`);
    $('#evolution').append(challenge);
    challenge.append($(`<div class="divider has-text-warning"><h2 class="has-text-danger">${loc('evo_scenario')}</h2></div>`));
    challenge.append($(`<div class="has-text-advanced">${loc('evo_scenario_desc')}</div>`));
}

export function exitSimulation(){
    let challenge = $(`<div id="simSection" class="challenge"></div>`);
    $('#evolution').append(challenge);
    challenge.append($(`<div class="divider has-text-warning"><h2 class="has-text-danger">${loc('evo_challenge_simulation')}</h2></div>`));
    challenge.append($(`<div class="has-text-advanced">${loc('evo_challenge_simulation_desc')}</div>`));
    challenge.append($(`<button class="button simButton" @click="exitsim()">${loc(`evo_challenge_end_sim`)}</button>`));

    vBind({
        el: '#simSection',
        data: {},
        methods: {
            exitsim(){
                exitSim();
            }
        }
    });
}

export function configSimulation(){
    let challenge = $(`<div id="simSection" class="challenge"></div>`);
    $('#evolution').append(challenge);
    challenge.append($(`<div class="divider has-text-warning"><h2 class="has-text-danger">${loc('evo_challenge_simulation')}</h2></div>`));
    challenge.append($(`<div class="has-text-advanced">${loc('evo_challenge_simulation_desc')}</div>`));

    let config = $($(`<div class="configList"></div>`));
    challenge.append(config);

    if (!global.race['simConfig']){
        global.race['simConfig'] = {};
    }
    ['Plasmid','AntiPlasmid','Phage','Dark','Harmony','AICore','Artifact','Blood_Stone'].forEach(function (res){
        global.race.simConfig[res] = global.race.simConfig[res] || 0;
        config.append($(`<div><span class="has-text-warning">${loc(`resource_${res}_name`)}</span><input type="number" min="0" class="input" v-model="${res}"></div>`));
    });

    vBind({
        el: '#simSection',
        data: global.race.simConfig
    });
}
