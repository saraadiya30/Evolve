// Isi: setPlanet(), planetDesc(), buildPlanet(), powerOnNewStruct(), getStructNumActive(), planetGeology(), srDesc()
import { global, seededRandom, callback_queue, p_on, support_on, int_on, gal_on, spire_on, sizeApproximation } from '../../core/vars.js';
import { deepClone } from '../../core/object_utils.js';
import { popover, clearPopper } from '../../functions/popover.js';
import { clearElement } from '../../functions/dom_helpers.js';
import { adjustCosts } from '../../functions/cost_adjusters.js';
import { planetTraits, biomes } from '../../races/races.js';
import { loc } from '../../core/locale.js';
import { universeAffix } from '../../functions/universe_utils.js';
import { gridDefs } from '../../industry/power_grid.js';
import { gov_tasks } from '../../governor/governor.js';
import { isStargateOn } from '../../space/terraform_lab.js';
import { actions } from '../../core/registries.js';
import { drawEvolution } from './evolution_screen.js';
import { checkPowerRequirements } from '../challenge/challenge_rules.js';
import { checkAffordable } from '../core/action_costs.js';

// Fungsi-fungsi dipindah dari actions.js (urutan sumber dipertahankan). actions.js tetap mengekspor ulang nama yang tadinya ter-ekspor.


export function setPlanet(opt){
    let biome = 'grassland';
    let trait = [];
    let orbit = 365;
    let geology = {};
    let custom = false;

    if (global.stats.achieve['lamentis'] && global.stats.achieve.lamentis.l >= 4 && global.custom['planet'] && opt.custom && opt.custom.length > 0 && Math.floor(seededRandom(0,10)) === 0){
        custom = opt.custom[Math.floor(seededRandom(0,opt.custom.length))];
        let target = custom.split(':');

        if (global.custom.planet[target[0]] && global.custom.planet[target[0]][target[1]]){
            let p = deepClone(global.custom.planet[target[0]][target[1]]);
            biome = p.biome;
            trait = p.traitlist;
            orbit = p.orbit;
            geology = p.geology;
            trait.sort();
        }
        else {
            custom = false;
        }
    }
    if (!custom){
        biome = buildPlanet('biome',opt);
        trait = buildPlanet('trait',opt,{biome: biome});
        trait.sort();

        let max = Math.floor(seededRandom(0,3));
        let top = 30;
        if (global.stats.achieve['whitehole']){
            top += global.stats.achieve['whitehole'].l * 5;
            max += global.stats.achieve['whitehole'].l;
        }
        if (biome === 'eden'){
            top += 5;
        }

        for (let i=0; i<max; i++){
            switch (Math.floor(seededRandom(0,10))){
                case 0:
                    geology['Copper'] = ((Math.floor(seededRandom(0,top)) - 10) / 100);
                    break;
                case 1:
                    geology['Iron'] = ((Math.floor(seededRandom(0,top)) - 10) / 100);
                    break;
                case 2:
                    geology['Aluminium'] = ((Math.floor(seededRandom(0,top)) - 10) / 100);
                    break;
                case 3:
                    geology['Coal'] = ((Math.floor(seededRandom(0,top)) - 10) / 100);
                    break;
                case 4:
                    geology['Oil'] = ((Math.floor(seededRandom(0,top)) - 10) / 100);
                    break;
                case 5:
                    geology['Titanium'] = ((Math.floor(seededRandom(0,top)) - 10) / 100);
                    break;
                case 6:
                    geology['Uranium'] = ((Math.floor(seededRandom(0,top)) - 10) / 100);
                    break;
                case 7:
                    if (global.stats.achieve['whitehole']){
                        geology['Iridium'] = ((Math.floor(seededRandom(0,top)) - 10) / 100);
                    }
                    break;
                default:
                    break;
            }
        }
        switch (biome){
            case 'hellscape':
                orbit = 666;
                break;
            case 'eden':
                orbit = 777;
                break;
            default:
                {
                    let maxOrbit = 600;
                    if (trait.includes('elliptical')){
                        maxOrbit += 200;
                    }
                    if (trait.includes('kamikaze')){
                        maxOrbit += 100;
                    }
                    orbit = Math.floor(seededRandom(200,maxOrbit));
                }
                break;
        }
    }

    let num = Math.floor(seededRandom(0,10000));
    let id = biome+num;
    id = id.charAt(0).toUpperCase() + id.slice(1);

    let traits = '';
    trait.forEach(function(t){
        if (planetTraits.hasOwnProperty(t)){
            traits += `${planetTraits[t].label} `;
        }
    });

    let title = `${traits}${biomes[biome].label} ${num}`;
    let parent = $(`<div id="${id}" class="action"></div>`);
    let element = $(`<a class="button is-dark" v-on:click="action" role="link"><span class="aTitle">${title}</span></a>`);
    parent.append(element);

    $('#evolution').append(parent);

    let popper = false;
    let gecked = 0;
    popover(id,function(obj){
        popper = obj;
        planetDesc(obj,title,biome,orbit,trait,geology,gecked);
        return undefined;
    },{
        classes: `has-background-light has-text-dark`
    });

    $('#'+id).on('click',function(){
        if (global.stats.achieve['lamentis'] && global.stats.achieve.lamentis.l >= 5 && global.race.hasOwnProperty('geck') && global.race.geck > 0){
            Object.keys(geology).forEach(function (g){
                geology[g] += Math.floor(seededRandom(0,7)) / 100;
            });
            if (gecked > 0){
                let odds = 8 - gecked;
                if (odds < 1){ odds = 1; }
                if (Math.floor(seededRandom(0,odds)) === 0){
                    biome = buildPlanet('biome',opt);
                }
            }
            if (Math.floor(seededRandom(0,2)) === 0){
                let pT = buildPlanet('trait',opt,{biome: biome, cap: 1});
                if (pT.length > 0){
                    if (trait.includes(pT[0])){
                        let idx = trait.indexOf(pT[0]);
                        trait.splice(idx, 1);
                    }
                    else if (pT[0] !== undefined){
                        trait.push(pT[0]);
                    }
                    traits = '';
                    trait.forEach(function(t){
                        if (planetTraits.hasOwnProperty(t)){
                            traits += `${planetTraits[t].label} `;
                        }
                    });
                }
            }
            title = `${traits}${biomes[biome].label} ${num}`;
            $(`#${id} .aTitle`).html(title);
            gecked++;
            global.race.geck--;
            if (!global.race.hasOwnProperty('gecked')){
                global.race['gecked'] = 0;
            }
            global.race.gecked++;
            clearElement(popper.popper);
            planetDesc(popper,title,biome,orbit,trait,geology,gecked);
        }
        else {
            delete global.race['geck'];
            if (global.race['gecked']){
                global.stats.geck += global.race.gecked;
            }
            global.race['chose'] = id;
            global.city.biome = biome;
            global.city.calendar.orbit = orbit;
            global.city.geology = geology;
            global.city.ptrait = trait;
            if (gecked > 0){
                global.race['rejuvenated'] = true;
            }
            clearElement($('#evolution'));
            clearPopper();
            drawEvolution();
        }
    });

    return custom ? custom : (biome === 'eden' ? 'hellscape' : biome);
}

function planetDesc(obj,title,biome,orbit,trait,geology,gecked){
    obj.popper.append($(`<div>${loc('set_planet',[title,biomes[biome].label,orbit])}</div>`));
    obj.popper.append($(`<div>${biomes[biome].desc}</div>`));
    if (trait.length > 0){
        trait.forEach(function(t){
            obj.popper.append($(`<div>${planetTraits[t].desc}</div>`));
        });
    }

    let pg = planetGeology(geology);
    if (pg.length > 0){
        obj.popper.append($(`<div>${pg}</div>`));
    }
    if (gecked && gecked > 0){
        obj.popper.append($(`<div class="has-text-special">${loc(`rejuvenated`)}</div>`));
    }
    return undefined;
}

function buildPlanet(aspect,opt,args){
    args = args || {};
    if (aspect === 'biome'){
        let biome = 'grassland';
        let max_bound = !opt.hell && global.stats.portals >= 1 ? 7 : 6;
        let subbiome = Math.floor(seededRandom(0,3)) === 0 ? true : false;
        let uAffix = universeAffix();
        switch (Math.floor(seededRandom(0,max_bound))){
            case 0:
                {
                    let sb = subbiome && global.stats.achieve['biome_grassland'] && global.stats.achieve.biome_grassland[uAffix] && global.stats.achieve.biome_grassland[uAffix] > 0;
                    biome = sb ? 'savanna' : 'grassland';
                }
                break;
            case 1:
                {
                    let sb = subbiome && global.stats.achieve['biome_oceanic'] && global.stats.achieve.biome_oceanic[uAffix] && global.stats.achieve.biome_oceanic[uAffix] > 0;
                    biome = sb ? 'swamp' : 'oceanic';
                }
                break;
            case 2:
                {
                    let sb = subbiome && global.stats.achieve['biome_forest'] && global.stats.achieve.biome_forest[uAffix] && global.stats.achieve.biome_forest[uAffix] > 0;
                    biome = sb ? (Math.floor(seededRandom(0,2)) === 0 ? 'taiga' : 'swamp') : 'forest';
                }
                break;
            case 3:
                {
                    let sb = subbiome && global.stats.achieve['biome_desert'] && global.stats.achieve.biome_desert[uAffix] && global.stats.achieve.biome_desert[uAffix] > 0;
                    biome = sb ? 'ashland' : 'desert';
                }
                break;
            case 4:
                {
                    let sb = subbiome && global.stats.achieve['biome_volcanic'] && global.stats.achieve.biome_volcanic[uAffix] && global.stats.achieve.biome_volcanic[uAffix] > 0;
                    biome = sb ? 'ashland' : 'volcanic';
                }
                break;
            case 5:
                {
                    let sb = subbiome && global.stats.achieve['biome_tundra'] && global.stats.achieve.biome_tundra[uAffix] && global.stats.achieve.biome_tundra[uAffix] > 0;
                    biome = sb ? 'taiga' : 'tundra';
                }
                break;
            case 6:
                biome = global.race.universe === 'evil' ? 'eden' : 'hellscape';
                break;
            default:
                biome = 'grassland';
                break;
        }
        return biome;
    }
    else if (aspect === 'trait'){
        let trait = [];
        let cap = args['cap'] || 2;
        for (let i=0; i<cap; i++){
            let top = 18 + (9 * i);
            switch (Math.floor(seededRandom(0,top))){
                case 0:
                    if (!trait.includes('toxic')){
                        trait.push('toxic');
                    }
                    break;
                case 1:
                    if (!trait.includes('mellow')){
                        trait.push('mellow');
                    }
                    break;
                case 2:
                    if (!trait.includes('rage')){
                        trait.push('rage');
                    }
                    break;
                case 3:
                    if (!trait.includes('stormy')){
                        trait.push('stormy');
                    }
                    break;
                case 4:
                    if (!trait.includes('ozone')){
                        trait.push('ozone');
                    }
                    break;
                case 5:
                    if (!trait.includes('magnetic')){
                        trait.push('magnetic');
                    }
                    break;
                case 6:
                    if (!trait.includes('trashed')){
                        trait.push('trashed');
                    }
                    break;
                case 7:
                    if (!trait.includes('elliptical')){
                        trait.push('elliptical');
                    }
                    break;
                case 8:
                    if (!trait.includes('flare')){
                        trait.push('flare');
                    }
                    break;
                case 9:
                    if (!trait.includes('dense')){
                        trait.push('dense');
                    }
                    break;
                case 10:
                    if (!trait.includes('unstable')){
                        trait.push('unstable');
                    }
                    break;
                case 11:
                    if (!trait.includes('permafrost') && !['volcanic','ashland','hellscape'].includes(args['biome'])){
                        trait.push('permafrost');
                    }
                    break;
                case 12:
                    if (!trait.includes('retrograde')){
                        trait.push('retrograde');
                    }
                    break;
                case 13:
                    if (!trait.includes('kamikaze')){
                        trait.push('kamikaze');
                    }
                    break;
                default:
                    break;
            }
        }
        return trait;
    }
}

// Returns true when side effects associated with the new structure being powered on should occur. Can return false even when alwaysPowered is enabled.
export function powerOnNewStruct(c_action){
    let parts = c_action.id.split('-');
    if (!global.hasOwnProperty(parts[0]) || !global[parts[0]].hasOwnProperty(parts[1])){
        return false;
    }

    // Electricity: production is negative, consumption is positive
    let need_p = c_action.hasOwnProperty('powered') && c_action.powered() > 0;
    let can_p = !need_p;
    let gov_replicator = global.race.hasOwnProperty('governor') && global.race.governor.hasOwnProperty('tasks') && global.race.hasOwnProperty('replicator') && Object.values(global.race.governor.tasks).includes('replicate') && global.race.governor.config.replicate.pow.on && global.race.replicator.pow > 0;
    if (need_p && global.city.hasOwnProperty('powered') && checkPowerRequirements(c_action)){
        let power = global.city.power;
        if (gov_replicator){
            power += global.race.replicator.pow;
        }
        can_p = c_action.powered() <= power;
    }

    // Support: production is positive, consumption is negative
    let need_s = c_action.hasOwnProperty('s_type') && c_action.hasOwnProperty('support') && c_action.support() < 0;
    let can_s = !need_s;
    if (need_s){
        let grids = gridDefs();
        let s_r = grids[c_action.s_type].r;
        let s_rs = grids[c_action.s_type].rs;
        can_s = global[s_r][s_rs].support - c_action.support() <= global[s_r][s_rs].s_max;
    }

    if (can_p && can_s || global.settings.alwaysPower){
        global[parts[0]][parts[1]].on++;
        if (need_p){
            global.city.power -= c_action.powered();
            if (gov_replicator){
                gov_tasks.replicate.task();
            }
        }
        if (c_action['postPower']){
            callback_queue.set([c_action, 'postPower'], [true]);
        }
        return true;
    }
    return false;
}

// Return the powered/supported/enabled quantity of a struct.
// When called from the wiki, assume that "enough" support is available, because this information is not in the save.
// For structs that cannot be enabled, powered, or supported, always return 0.
export function getStructNumActive(c_action,wiki){
    let parts = c_action.id.split('-');
    if (!global.hasOwnProperty(parts[0]) || !global[parts[0]].hasOwnProperty(parts[1])){
        return 0;
    }

    // For all 3 struct types (switchable, powered, support), the "on" field is named in the same way
    let num_on = global[parts[0]][parts[1]].on;
    if (!num_on){ // This is also a null check
        return 0;
    }

    // Electricity: production is negative, consumption is positive
    if (c_action.hasOwnProperty('powered') && c_action.powered() > 0) {
        if (global.city.hasOwnProperty('powered') && checkPowerRequirements(c_action)){
            // The p_on struct is empty in the wiki view and right when the page has been reloaded
            if (p_on.hasOwnProperty(parts[1])){
                num_on = Math.min(num_on, p_on[parts[1]]);
            }
        }
        else {
            num_on = 0;
        }
    }

    // Support: production is positive, consumption is negative
    if (c_action.hasOwnProperty('s_type') && c_action.hasOwnProperty('support') && c_action.support() < 0){
        let found_support = false;
        if (support_on.hasOwnProperty(parts[1])){
            found_support = true;
            num_on = Math.min(num_on, support_on[parts[1]]);
        }
        if (int_on.hasOwnProperty(parts[1])){
            found_support = true;
            num_on = Math.min(num_on, int_on[parts[1]]);
        }
        if (gal_on.hasOwnProperty(parts[1])){
            found_support = true;
            num_on = isStargateOn(wiki) ? Math.min(num_on, gal_on[parts[1]]) : 0;
        }
        if (spire_on.hasOwnProperty(parts[1])){
            found_support = true;
            num_on = Math.min(num_on, spire_on[parts[1]]);
        }

        // The support_on structs are empty in the wiki view and right when the page has been reloaded
        // This means that the wiki can be wrong, but we can at least check "max" support
        if (!found_support) {
            let grids = gridDefs();
            let s_r = grids[c_action.s_type].r;
            if (s_r === 'galaxy' && !isStargateOn(wiki)){
                num_on = 0;
            }
            else {
                let s_rs = grids[c_action.s_type].rs;
                let max_s = Math.floor(global[s_r][s_rs].s_max / -c_action.support());
                num_on = Math.min(num_on, max_s);
            }
        }
    }

    return num_on;
}

export function planetGeology(geology){
    let geo_traits = ``;
    if (Object.keys(geology).length > 0){
        let good = ``;
        let bad = ``;
        let numShow = global.stats.achieve['miners_dream'] ? (global.stats.achieve['miners_dream'].l >= 4 ? global.stats.achieve['miners_dream'].l * 2 - 3 : global.stats.achieve['miners_dream'].l) : 0;
        if (global.stats.achieve['lamentis'] && global.stats.achieve.lamentis.l >= 0){ numShow++; }
        for (let key in geology){
            if (key !== 0){
                if (geology[key] > 0) {
                    let res_val = `<div class="has-text-advanced pGeo">${loc(`resource_${key}_name`)}`;
                    if (numShow > 0) {
                        res_val += `: <span class="has-text-success">+${Math.round((geology[key] + 1) * 100 - 100)}%</span>`;
                        numShow--;
                    }
                    else {
                        res_val += `: <span class="has-text-success">${loc('bonus')}</span>`;
                    }
                    res_val += `</div>`;
                    good = good + res_val;
                }
                else if (geology[key] < 0){
                    let res_val = `<div class="has-text-caution pGeo">${loc(`resource_${key}_name`)}`;
                    if (numShow > 0) {
                        res_val += `: <span class="has-text-danger">${Math.round((geology[key] + 1) * 100 - 100)}%</span>`;
                        numShow--;
                    }
                    else {
                        res_val += `: <span class="has-text-danger">${loc('malus')}</span>`;
                    }
                    res_val += `</div>`;
                    bad = bad + res_val
                }
            }
        }
        geo_traits = `<div class="pGeoList flexAround">${good}${bad}</div>`;
    }
    return geo_traits;
}

export function srDesc(c_action,old){
    let desc = typeof c_action.desc === 'string' ? c_action.desc : c_action.desc();
    desc = desc + '. ';
    if (c_action.cost && !old){
        if (checkAffordable(c_action)){
            desc = desc + loc('affordable') + '. ';
        }
        else {
            desc = desc + loc('not_affordable') + '. ';
        }
        desc = desc + 'Costs: ';
        let type = c_action.id.split('-')[0];
        let costs = type !== 'genes' && type !== 'blood' ? adjustCosts(c_action) : c_action.cost;
        Object.keys(costs).forEach(function (res){
            if (res === 'Custom'){
                let custom = costs[res]();
                desc = desc + custom.label;
            }
            else if (res === 'Structs'){
                let structs = costs[res]();
                Object.keys(structs).forEach(function (region){
                    Object.keys(structs[region]).forEach(function (struct){
                        let label = '';
                        const check_on = structs[region][struct].hasOwnProperty('on');
                        let num_on;
                        if (structs[region][struct].hasOwnProperty('s')){
                            let sector = structs[region][struct].s;
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
                        desc = desc + `${label}. `;

                        if (!global[region][struct]){
                            desc = desc + `${loc('insufficient')} ${label}. `;
                        }
                        else if (structs[region][struct].count > global[region][struct].count){
                            desc = desc + `${loc('insufficient')} ${label}. `;
                        }
                        else if (check_on && structs[region][struct].on > num_on){
                            desc = desc + `${loc('insufficient')} ${label} enabled. `;
                        }
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
                    desc = desc + `${label}: ${res_cost}. `;
                    if (global.prestige[res].count < res_cost){
                        desc = desc + `${loc('insufficient')} ${label}. `;
                    }
                }
            }
            else if (res === 'Supply'){
                let res_cost = costs[res]();
                if (res_cost > 0){
                    let label = loc(`resource_${res}_name`);
                    desc = desc + `${label}: ${res_cost}. `;
                    if (global.portal.purifier.supply < res_cost){
                        desc = desc + `${loc('insufficient')} ${label}. `;
                    }
                }
            }
            else if (res !== 'Morale' && res !== 'Army' && res !== 'Bool'){
                let res_cost = costs[res]();
                let f_res = res === 'Species' ? global.race.species : res;
                if (res_cost > 0){
                    let label = f_res === 'Money' ? '$' : global.resource[f_res].name+': ';
                    label = label.replace("_", " ");

                    let display_cost = sizeApproximation(res_cost,1);
                    desc = desc + `${label}${display_cost}. `;
                    if (global.resource[f_res].amount < res_cost){
                        desc = desc + `${loc('insufficient')} ${global.resource[f_res].name}. `;
                    }
                }
            }
        });
    }

    if (c_action.effect){
        let effect = typeof c_action.effect === 'string' ? c_action.effect : c_action.effect();
        if (effect){
            desc = desc + effect + '. ';
        }
    }
    if (c_action.flair){
        let flair = typeof c_action.flair === 'string' ? c_action.flair : c_action.flair();
        if (flair){
            desc = desc + flair + '.';
        }
    }

    return desc.replace("..",".");
}
