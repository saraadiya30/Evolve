import { global } from '../core/vars.js';
import { govEffect } from '../civics/civics.js';
import { traits } from '../core/registries.js';
import { govActive } from '../governor/governor.js';
import { fathomCheck } from '../races/trait_logic/fathom_check.js';

// Fungsi-fungsi dipindah dari functions.js (urutan sumber dipertahankan). functions.js tetap mengekspor ulang nama yang tadinya ter-ekspor.


export function dictatorAdjust(costs, offset, wiki){
    if (global.civic.govern.type === 'dictator'){
        let adjustRate = 1 - (govEffect.dictator()[2] / 100);
        let newCosts = {};
        Object.keys(costs).forEach(function (res){
            if (['Lumber','Stone','Furs','Copper','Iron','Aluminium','Cement','Coal'].includes(res)){
                newCosts[res] = function(){ return costs[res](offset, wiki) * adjustRate; }
            }
            else {
                newCosts[res] = function(){ return costs[res](offset, wiki); }
            }
        });
        return newCosts;
    }
    return costs;
}

export function lMatAdjust(costs, c_action, offset, wiki){
    if (global.race['living_materials']){
        let newCosts = {};
        let path = c_action.hasOwnProperty('struct') ? c_action.struct().p : false;
        Object.keys(costs).forEach(function (res){
            if (path && global[path[1]].hasOwnProperty(path[0]) && global[path[1]][path[0]].hasOwnProperty('l_m') 
                && (['Lumber','Furs','Plywood'].includes(res) || (res === 'Stone' && global.race['sappy']))){
                newCosts[res] = function(){ return Math.round(costs[res](offset, wiki) * traits.living_materials.vars()[0] ** (global[path[1]][path[0]].l_m / 25)); }
            }
            else {
                newCosts[res] = function(){ return costs[res](offset, wiki); }
            }
        });
        return newCosts;
    }
    return costs;
}

export function nexusAdjust(costs, c_action, offset, wiki){
    if(global.tech['nexus'] && global.race['witch_hunter'] && global.tech['roguemagic'] && global.tech.roguemagic >= 7){
        let newCosts = {};
        let adjustRate = 0.96 ** global.tech['nexus'];
        Object.keys(costs).forEach(function (res){
            if (['Mana'].includes(res)){
                newCosts[res] = function(){ return costs[res](offset, wiki) * adjustRate; }
            }
            else {
                newCosts[res] = function(){ return costs[res](offset, wiki); }
            }
        });
        return newCosts;
    }
    return costs;
}

export function popCost(p){
    if (global.race['high_pop']){
        p *= traits.high_pop.vars()[0];
    }
    return p;
}

export function heavyAdjust(costs, offset, wiki){
    if (global.race['heavy']){
        let newCosts = {};
        Object.keys(costs).forEach(function (res){
            if (res === 'Stone' || res === 'Cement' || res === 'Wrought_Iron'){
                newCosts[res] = function(){ return Math.round(costs[res](offset, wiki) * (1 + (traits.heavy.vars()[1] / 100))); }
            }
            else {
                newCosts[res] = function(){ return costs[res](offset, wiki); }
            }
        });
        return newCosts;
    }
    return costs;
}

export function rebarAdjust(costs, offset, wiki){
    if (costs['Cement'] && global.tech['cement'] && global.tech['cement'] >= 2){
        let discount = global.tech['cement'] >= 3 ? 0.8 : 0.9;
        let newCosts = {};
        Object.keys(costs).forEach(function (res){
            if (res === 'Cement'){
                newCosts[res] = function(){ return Math.round(costs[res](offset, wiki) * discount) || 0; }
            }
            else {
                newCosts[res] = function(){ return costs[res](offset, wiki); }
            }
        });
        return newCosts;
    }
    return costs;
}

export function adjustCosts(c_action, offset, wiki){
    let costs = c_action.cost || {};
    if ((costs['RNA'] || costs['DNA']) && global.genes['evolve']){
        let newCosts = {};
        Object.keys(costs).forEach(function (res){
            if (res === 'RNA' || res === 'DNA'){
                newCosts[res] = function(){ return Math.round(costs[res](offset, wiki) * 0.8); }
            }
        });
        return newCosts;
    }
    costs = bloatAdjust(costs, offset, wiki);
    costs = truthAdjust(costs, c_action, offset, wiki);
    costs = loneAdjust(costs, offset, wiki);
    costs = inflationAdjust(costs, offset, wiki);
    costs = technoAdjust(costs, offset, wiki);
    costs = flierAdjust(costs, offset, wiki);
    costs = kindlingAdjust(costs, offset, wiki);
    costs = smolderAdjust(costs, offset, wiki);
    costs = scienceAdjust(costs, offset, wiki);
    costs = rebarAdjust(costs, offset, wiki);
    costs = extraAdjust(costs, offset, wiki);
    costs = heavyAdjust(costs, offset, wiki);
    costs = dictatorAdjust(costs, offset, wiki);
    costs = lMatAdjust(costs, c_action, offset, wiki);
    costs = nexusAdjust(costs, c_action, offset, wiki);
    return craftAdjust(costs, offset, wiki);
}

export function bloatAdjust(costs, offset, wiki){
    if (global.race['bloated']){
        let adjustRate = 1 + (traits.bloated.vars()[0] / 100);
        let newCosts = {};
        Object.keys(costs).forEach(function (res){
            if (['Food','Lumber','Stone','Furs','Copper','Iron','Aluminium','Cement','Coal','Steel','Titanium','Alloy','Polymer','Iridium'].includes(res)){
                newCosts[res] = function(){ return costs[res](offset, wiki) * adjustRate; }
            }
            else {
                newCosts[res] = function(){ return costs[res](offset, wiki); }
            }
        });
        return newCosts;
    }
    return costs;
}

export function loneAdjust(costs, offset, wiki){
    if (global.race['lone_survivor']){
        let newCosts = {};
        Object.keys(costs).forEach(function (res){
            if (['Structs','Custom','Soul_Gem','Plasmid','Phage','Dark','Harmony','Blood_Stone','Artifact','Supercoiled','Corrupt_Gem','Codex','Demonic_Essence','Horseshoe'].includes(res)){
                newCosts[res] = function(){ return costs[res](offset, wiki); }
            }
            else if (['Knowledge'].includes(res)){
                newCosts[res] = function(){ return Math.round(costs[res](offset, wiki) * 0.5); }
            }
            else if (['Money'].includes(res)){
                newCosts[res] = function(){ return Math.round(costs[res](offset, wiki) * 0.22); }
            }
            else if (['Plywood','Brick','Wrought_Iron','Sheet_Metal','Mythril','Quantium'].includes(res)){
                newCosts[res] = function(){ return Math.round(costs[res](offset, wiki) * 0.14); }
            }
            else {
                newCosts[res] = function(){ return Math.round(costs[res](offset, wiki) * 0.28); }
            }
        });
        return newCosts;
    }
    return costs;
}

export function truthAdjust(costs, c_action, offset, wiki){
    if ((wiki ? wiki.truepath : global.race['truepath']) && (!c_action.hasOwnProperty('path') || !c_action.path.includes('truepath'))){
        let newCosts = {};
        Object.keys(costs).forEach(function (res){
            if (res === 'Money'){
                newCosts[res] = function(){ return Math.round(costs[res](offset, wiki) * 3); }
            }
            else if (['Structs','Knowledge','Custom','Soul_Gem','Plasmid','Phage','Dark','Harmony','Blood_Stone','Artifact','Supercoiled','Corrupt_Gem','Codex','Demonic_Essence','Horseshoe'].includes(res)){
                newCosts[res] = function(){ return costs[res](offset, wiki); }
            }
            else {
                newCosts[res] = function(){ return Math.round(costs[res](offset, wiki) * 2); }
            }
        });
        return newCosts;
    }
    return costs;
}

export function inflationAdjust(costs, offset, wiki){
    if (global.race['inflation']){
        let newCosts = {};
        Object.keys(costs).forEach(function (res){
            if (res === 'Money'){
                let rate = 1 + (global.race.inflation / 75);
                newCosts[res] = function(){ return Math.round(costs[res](offset, wiki) * rate); }
            }
            else {
                newCosts[res] = function(){ return costs[res](offset, wiki); }
            }
        });
        return newCosts;
    }
    return costs;
}

export function extraAdjust(costs, offset, wiki){
    let extraVal = govActive('extravagant',0);
    if (extraVal){
        let newCosts = {};
        Object.keys(costs).forEach(function (res){
            if (res === 'Money'){
                let waste = 1 + (extraVal / 100);
                newCosts[res] = function(){ return Math.round(costs[res](offset, wiki) * waste); }
            }
            else {
                newCosts[res] = function(){ return costs[res](offset, wiki); }
            }
        });
        return newCosts;
    }
    return costs;
}

export function technoAdjust(costs, offset, wiki){
    if (global.civic.govern.type === 'technocracy'){
        let adjust = 1 + (govEffect.technocracy()[1] / 100);
        let newCosts = {};
        Object.keys(costs).forEach(function (res){
            if (res === 'Knowledge'){
                let kAdjust = 1 - (govEffect.technocracy()[0] / 100);
                newCosts[res] = function(){ return Math.round(costs[res](offset, wiki) * kAdjust); }
            }
            else if (res === 'Money' || res === 'Structs' || res === 'Custom'){
                newCosts[res] = function(){ return costs[res](offset, wiki); }
            }
            else {
                newCosts[res] = function(){ return Math.round(costs[res](offset, wiki) * adjust); }
            }
        });
        return newCosts;
    }
    return costs;
}

export function scienceAdjust(costs, offset, wiki){
    let pragVal = govActive('pragmatist',1);
    let fathom = fathomCheck('gnome');
    if ((global.race['smart'] || global.race['dumb'] || pragVal || fathom > 0) && costs['Knowledge']){
        let newCosts = {};
        Object.keys(costs).forEach(function (res){
            if (res === 'Knowledge'){
                newCosts[res] = function(){
                    let cost = costs[res](offset, wiki);
                    if (global.race['smart']){
                        cost *= 1 - (traits.smart.vars()[0] / 100);
                    }
                    if (fathom > 0){
                        cost *= 1 - (traits.smart.vars(1)[0] / 100 * fathom);
                    }
                    if (global.race['dumb']){
                        cost *= 1 + (traits.dumb.vars()[0] / 100);
                    }
                    if (pragVal){
                        cost *= 1 + (pragVal / 100);
                    }
                    return Math.round(cost);
                }
            }
            else {
                newCosts[res] = function(){ return costs[res](offset, wiki); }
            }
        });
        return newCosts;
    }
    return costs;
}

export function smolderAdjust(costs, offset, wiki){
    if (global.race['smoldering']){
        let newCosts = {};
        Object.keys(costs).forEach(function (res){
            if (res === 'Lumber' || res === 'Plywood'){
                let adjustRate = res === 'Plywood' ? 2 : 1;
                newCosts['Chrysotile'] = function(){ return Math.round(costs[res](offset, wiki) * adjustRate) || 0; }
            }
            else if (['HellArmy','Army','Troops','Structs','Chrysotile','Knowledge','Custom','Soul_Gem','Plasmid','Phage','Dark','Harmony','Blood_Stone','Artifact','Supercoiled','Corrupt_Gem','Codex','Demonic_Essence','Horseshoe','Mana','Energy'].includes(res)){
                newCosts[res] = function(){ return costs[res](offset, wiki); }
            }
            else {
                newCosts[res] = function(){ return Math.round(costs[res](offset, wiki) * 0.9); }
            }
        });
        if (!newCosts.hasOwnProperty('Chrysotile') && costs.hasOwnProperty('Money') && global.tech['primitive'] && global.tech.primitive >= 3){
            newCosts['Chrysotile'] = function(){
                let money = costs['Money'](offset, wiki) || 0;
                return money > 0 ? Math.round(money / 50) : 0;
            }
        }
        return newCosts;
    }
    return costs;
}

export function kindlingAdjust(costs, offset, wiki){
    if ((global.race['kindling_kindred'] || global.race['iron_wood']) && (costs['Lumber'] || costs['Plywood'])){
        let newCosts = {};
        let adjustRate = 1 + (traits.kindling_kindred.vars()[0] / 100);
        Object.keys(costs).forEach(function (res){
            if (global.race['kindling_kindred'] && res !== 'Lumber' && res !== 'Plywood' && res !== 'Structs'){
                newCosts[res] = function(){ return Math.round(costs[res](offset, wiki) * adjustRate) || 0; }
            }
            else if (global.race['iron_wood'] && res !== 'Plywood'){
                newCosts[res] = function(){ return costs[res](offset, wiki); }
            }
            else if (res === 'Structs'){
                newCosts[res] = function(){ return costs[res](offset, wiki); }
            }
        });
        return newCosts;
    }
    else if (global.race['unfathomable'] && global.city['captive_housing']){
        let fathom = fathomCheck('entish');
        if (fathom > 0){
            let newCosts = {};
            let adjustRate = 1 - (0.4 * fathom);
            Object.keys(costs).forEach(function (res){
                if (res === 'Lumber' && res === 'Plywood'){
                    newCosts[res] = function(){ return Math.round(costs[res](offset, wiki) * adjustRate) || 0; }
                }
                else {
                    newCosts[res] = function(){ return costs[res](offset, wiki); }
                }
            });
            return newCosts;
        }
    }
    return costs;
}

export function flierAdjust(costs, offset, wiki){
    if (global.race['flier'] && (costs['Stone'] || costs['Cement'])){
        let newCosts = {};
        let adjustRate = 1 - (traits.flier.vars()[0] / 100);
        Object.keys(costs).forEach(function (res){
            if (res === 'Stone' && !costs['Cement']){
                newCosts[res] = function(){ return Math.round(costs[res](offset, wiki) * adjustRate) || 0; }
            }
            else if (res === 'Cement'){
                if (costs['Stone']){
                    newCosts['Stone'] = function(){ return Math.round((costs['Stone'](offset, wiki) * adjustRate) + (costs[res](offset, wiki) * 1.8 * adjustRate)) || 0; }
                }
                else {
                    newCosts['Stone'] = function(){ return Math.round(costs[res](offset, wiki) * 1.75 * adjustRate); }
                }
            }
            else {
                newCosts[res] = function(){ return costs[res](offset, wiki); }
            }
        });
        return newCosts;
    }
    return costs;
}

export function craftAdjust(costs, offset, wiki){
    let fathom = fathomCheck('pterodacti');
    if ((global.race['hollow_bones'] || fathom > 0) && (costs['Plywood'] || costs['Brick'] || costs['Wrought_Iron'] || costs['Sheet_Metal'] || costs['Mythril'] || costs['Aerogel'] || costs['Nanoweave'] || costs['Scarletite'] || costs['Quantium'])){
        let newCosts = {};
        Object.keys(costs).forEach(function (res){
            if (res === 'Plywood' || res === 'Brick' || res === 'Wrought_Iron' || res === 'Sheet_Metal' || res === 'Mythril' || res === 'Aerogel' || res === 'Nanoweave' || res === 'Scarletite' || res === 'Quantium'){
                newCosts[res] = function(){
                    let cost = costs[res](offset, wiki);
                    if (global.race['hollow_bones']){
                        cost *= 1 - (traits.hollow_bones.vars()[0] / 100);
                    }
                    if (fathom > 0){
                        cost *= 1 - (traits.hollow_bones.vars(3)[0] / 100 * fathom);
                    }
                    return Math.round(cost);
                }
            }
            else {
                newCosts[res] = function(){ return costs[res](offset, wiki); }
            }
        });
        return newCosts;
    }
    return costs;
}
