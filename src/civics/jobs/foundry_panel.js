import { clearElement, vBind } from '../../functions/dom_helpers.js';
import { eventActive } from '../../functions/event_dates.js';
import { popover } from '../../functions/popover.js';
import { global, keyMultiplier } from '../../core/vars.js';
import { loc } from '../../core/locale.js';
import { craftingRatio } from '../../resources/resources.js';
import { craftCost } from '../../resources/resource_tabs.js';
import { craftingPopover } from '../../resources/crate_assignment.js';
import { traits } from '../../core/registries.js';
import { fathomCheck } from '../../races/trait_logic/fathom_check.js';
import { craftsmanCap } from './job_definitions.js';

// Fungsi-fungsi dipindah dari jobs.js (urutan sumber dipertahankan). jobs.js tetap mengekspor ulang nama yang tadinya ter-ekspor.


export function loadFoundry(servants){
    clearElement($(servants ? '#skilledServants' : '#foundry'));
    if ((global.city['foundry'] && global.city['foundry'].count > 0) || global.race['cataclysm'] || global.race['orbit_decayed'] || global.tech['isolation'] || global.race['warlord']){
        let element = $(servants ? '#skilledServants' : '#foundry');
        let track = servants ? `{{ s.sused }} / {{ s.smax }}` : `{{ f.crafting }} / {{ c.max }}`;
        let foundry = $(`<div class="job"><div class="foundry job_label"><h3 class="has-text-warning">${loc(servants ? 'civics_skilled_servants' : 'craftsman_assigned')}</h3><span :class="level()">${track}</span></div></div>`);
        element.append(foundry);

        let summer = eventActive('summer');
        let list = ['Plywood','Brick','Wrought_Iron','Sheet_Metal','Mythril','Aerogel','Nanoweave'];
        if (!servants){
            list.push('Scarletite');
            list.push('Quantium');
        }
        if (summer && !servants){
            list.push('Thermite');
        }
        for (let i=0; i<list.length; i++){
            let res = list[i];
            if ((servants && !global.race.servants.sjobs.hasOwnProperty(res)) || (!servants && !global.city.foundry.hasOwnProperty(res))){
                if (servants){
                    global.race.servants.sjobs[res] = 0;
                }
                else {
                    global.city.foundry[res] = 0;
                }
            }
            if (global.resource[res].display || (summer && res === 'Thermite')){
                let name = global.resource[res].name;
                let resource = $(`<div class="job"></div>`);
                element.append(resource);

                let controls = $('<div class="controls"></div>');
                let job_label;
                if (res === 'Scarletite' && global.portal.hasOwnProperty('hell_forge')){
                    job_label = $(`<div id="craft${res}" class="job_label"><h3 class="has-text-danger">${name}</h3><span class="count">{{ f.${res} }} / {{ p.on | maxScar }}</span></div>`);
                }
                else if (res === 'Quantium' && (global.space.hasOwnProperty('zero_g_lab') || global.tauceti.hasOwnProperty('infectious_disease_lab'))){
                    job_label = $(`<div id="craft${res}" class="job_label"><h3 class="has-text-danger">${name}</h3><span class="count">{{ f.${res} }} / {{ e.on | maxQuantium }}</span></div>`);
                }
                else {
                    let tracker = servants ? `{{ s.sjobs.${res} }}` : `{{ f.${res} }}`;
                    let id = servants ? `scraft${res}` : `craft${res}`;
                    job_label = $(`<div id="${id}" class="job_label"><h3 class="has-text-danger">${name}</h3><span class="count">${tracker}</span></div>`);
                }

                resource.append(job_label);
                resource.append(controls);
                element.append(resource);

                let sub = $(`<span role="button" aria-label="remove ${global.resource[res].name} crafter" class="sub has-text-danger" @click="sub('${res}')"><span>&laquo;</span></span>`);
                let add = $(`<span role="button" aria-label="add ${global.resource[res].name} crafter" class="add has-text-success" @click="add('${res}')"><span>&raquo;</span></span>`);

                controls.append(sub);
                controls.append(add);
            }
        }

        let bindData = global.portal.hasOwnProperty('hell_forge') ? {
            c: global.civic.craftsman,
            p: global.portal.hell_forge,
        } : {
            c: global.civic.craftsman,
            e: global.space.hasOwnProperty('zero_g_lab') || global.tauceti.hasOwnProperty('infectious_disease_lab') ? (global.tech['isolation'] ? global.tauceti.infectious_disease_lab : global.space.zero_g_lab) : { count: 0, on: 0 },
        };
        if (servants){
            bindData['s'] = global.race.servants;
        }
        else {
            bindData['f'] = global.city.foundry;
        }

        vBind({
            el: servants ? '#skilledServants' : '#foundry',
            data: bindData,
            methods: {
                add(res){
                    let keyMult = keyMultiplier();
                    let tMax = -1;
                    if (res === 'Scarletite' || res === 'Quantium'){
                        tMax = craftsmanCap(res);
                    }
                    for (let i=0; i<keyMult; i++){
                        if (servants){
                            if (global.race.servants.sused < global.race.servants.smax){
                                global.race.servants.sjobs[res]++;
                                global.race.servants.sused++;
                            }
                            else {
                                break;
                            }
                        }
                        else {
                            if (global.city.foundry.crafting < global.civic.craftsman.max
                                && (global.civic[global.civic.d_job] && global.civic[global.civic.d_job].workers > 0)
                                && (tMax === -1 || tMax > global.city.foundry[res])
                            ){
                                global.civic.craftsman.workers++;
                                global.city.foundry.crafting++;
                                global.city.foundry[res]++;
                                global.civic[global.civic.d_job].workers--;
                            }
                            else {
                                break;
                            }
                        }
                    }
                },
                sub(res){
                    let keyMult = keyMultiplier();
                    for (let i=0; i<keyMult; i++){
                        if (servants){
                            if (global.race.servants.sjobs[res] > 0){
                                global.race.servants.sjobs[res]--;
                                global.race.servants.sused--;
                            }
                            else {
                                break;
                            }
                        }
                        else {
                            if (global.city.foundry[res] > 0){
                                global.city.foundry[res]--;
                                global.civic.craftsman.workers--;
                                global.city.foundry.crafting--;
                                global.civic[global.civic.d_job].workers++;
                            }
                            else {
                                break;
                            }
                        }
                    }
                },
                level(){
                    let workers = servants ? global.race.servants.sused : global.civic.craftsman.workers;
                    let max = servants ? global.race.servants.smax : global.civic.craftsman.max;
                    if (workers === 0){
                        return 'count has-text-danger';
                    }
                    else if (workers === max){
                        return 'count has-text-success';
                    }
                    else if (workers <= max / 3){
                        return 'count has-text-caution';
                    }
                    else if (workers <= max * 0.66){
                        return 'count has-text-warning';
                    }
                    else if (workers < max){
                        return 'count has-text-info';
                    }
                    else {
                        return 'count';
                    }
                }
            },
            filters: {
                maxScar(v){
                    return craftsmanCap('Scarletite');
                },
                maxQuantium(v){
                    return craftsmanCap('Quantium');
                }
            }
        });

        for (let i=0; i<list.length; i++){
            let res = list[i];
            if (global.resource[res].display || (summer && res === 'Thermite')){
                let extra = function(){
                    let total = $(`<div></div>`);
                    let name = global.resource[res].name;
                    let craft_total = craftingRatio(res,'auto');
                    let multiplier = craft_total.multiplier;
                    let speed = global.genes['crafty'] ? 2 : 1;
                    let final = +(global.resource[res].diff).toFixed(2);
                    let bonus = +(multiplier * 100).toFixed(0);

                    total.append($(`<div>${loc('craftsman_hover_bonus', [bonus.toLocaleString(), name])}</div>`));
                    total.append($(`<div>${loc('craftsman_hover_prod', [final.toLocaleString(), name])}</div>`));
                    let craft_cost = craftCost();
                    for (let i=0; i<craft_cost[res].length; i++){
                        let craftCost = 1;
                        if(global.race['resourceful']){
                            craftCost -= traits.resourceful.vars()[0] / 100
                        }
                        let fathom = fathomCheck('arraak');
                        if(fathom > 0){
                            craftCost -= traits.resourceful.vars(1)[0] / 100 * fathom;
                        }
                        let cost = +(craft_cost[res][i].a * global.city.foundry[res] * craftCost * speed / 140).toFixed(2);
                        total.append($(`<div>${loc('craftsman_hover_cost', [cost, global.resource[craft_cost[res][i].r].name])}<div>`));
                    }

                    return total;
                }

                let id = servants ? `scraft${res}` : `craft${res}`;
                craftingPopover(id,res,'auto',extra);
            }
        }

        if (servants){
            popover('servantFoundry', function(){
                    return loc('civics_skilled_servants_desc');
                },
                {
                    elm: `#skilledServants .foundry`,
                    classes: `has-background-light has-text-dark`
                }
            );
        }
        else {
            popover('craftsmenFoundry', function(){
                    return loc('job_craftsman_hover');
                },
                {
                    elm: `#foundry .foundry`,
                    classes: `has-background-light has-text-dark`
                }
            );
        }

        if (global.race['servants'] && !servants && global.race.servants.smax > 0){
            loadFoundry(true);
        }
    }
}
