import { global } from './vars.js';
import { universeLevel, alevel } from './achieve.js';
import { traits, races, fathomCheck } from './races.js';
import { jobScale } from './jobs.js';
import { govActive } from './governor.js';
import { govEffect } from './civics.js';
import { rebarAdjust, heavyAdjust, dictatorAdjust, lMatAdjust, nexusAdjust } from './functions_f4.js';

// Fungsi-fungsi dipindah dari functions.js (urutan sumber dipertahankan). functions.js tetap mengekspor ulang nama yang tadinya ter-ekspor.


export function masteryType(universe,detailed,unmodified){
    if (global.genes['challenge'] && global.genes.challenge >= 2){
        universe = universe || global.race.universe;
        let ua_level = universeLevel(universe);
        let m_rate = universe === 'standard' ? 0.25 : 0.15;
        let u_rate = global.genes.challenge >= 3 ? 0.15 : 0.1;
        if (global.genes.challenge >= 4 && universe !== 'standard'){
            m_rate += 0.05;
            u_rate -= 0.05;
        }

        let perk_rank = global.stats.feat['grandmaster'] && global.stats.achieve['corrupted'] && global.stats.achieve.corrupted.l > 0 ? Math.min(global.stats.achieve.corrupted.l,global.stats.feat['grandmaster']) : 0;
        if (perk_rank > 0){
            m_rate *= 1 + (perk_rank / 100);
            u_rate *= 1 + (perk_rank / 100);
        }

        if (! unmodified) {
            if (global.race['weak_mastery'] && universe === 'antimatter'){
                m_rate /= 10;
                u_rate /= 10;
            }
            if (global.race['nerfed']){
                m_rate /= universe === 'antimatter' ? 5 : 2;
                u_rate /= universe === 'antimatter' ? 5 : 2;
            }
            if (global.race['ooze']){
                m_rate *= 1 - (traits.ooze.vars()[2] / 100);
                u_rate *= 1 - (traits.ooze.vars()[2] / 100);
            }
            if (global.genes.challenge >= 5 && global.race.hasOwnProperty('mastery')){
                m_rate *= 1 + (traits.mastery.vars()[0] * global.race.mastery / 100);
                u_rate *= 1 + (traits.mastery.vars()[0] * global.race.mastery / 100);
            }
        }

        let m_mastery = ua_level.aLvl * m_rate;
        let u_mastery = 0;
        if (universe !== 'standard'){
            u_mastery = ua_level.uLvl * u_rate;
        }
        return detailed ? { g: m_mastery, u: u_mastery, m: m_mastery + u_mastery } : m_mastery + u_mastery;
    }
    return detailed ? { g: 0, u: 0, m:0 } : 0;
}

export function challenge_multiplier(value,type,decimals,inputs){
    decimals = decimals || 0;
    inputs = inputs || {};
    
    let challenge_level = inputs.genes;
    if (challenge_level === undefined){
        challenge_level = alevel() - 1;
        if (challenge_level > 4){
            challenge_level = 4;
        }
    }
    let universe = inputs.uni || global.race.universe;

    if (universe === 'micro'){ value = value * 0.25; }
    if (universe === 'antimatter'){ value = value * 1.1; }
    if (universe === 'heavy' && type !== 'mad'){
        switch (challenge_level){
            case 1:
                value = value * 1.1;
                break;
            case 2:
                value = value * 1.15;
                break;
            case 3:
                value = value * 1.2;
                break;
            case 4:
                value = value * 1.25;
                break;
            default:
                value = value * 1.05;
                break;
        }
    }
    if (inputs.tp !== undefined ? inputs.tp : global.race['truepath']){
        value = value * 1.1;
    }
    switch (challenge_level){
        case 1:
            return +(value * 1.05).toFixed(decimals);
        case 2:
            return +(value * 1.12).toFixed(decimals);
        case 3:
            return +(value * 1.25).toFixed(decimals);
        case 4:
            return +(value * 1.45).toFixed(decimals);
        default:
            return +(value).toFixed(decimals);
    }
}

export function getResetConstants(type, inputs){
    if (!inputs) { inputs = {}; }
    let rc = {
        pop_divisor: 999,
        k_inc: 1000000,
        k_mult: 100,
        phage_mult: 0,
        plasmid_cap: 150,
    }

    switch (type){
        case 'mad':
            rc.pop_divisor = 3;
            rc.k_inc = 100000;
            rc.k_mult = 1.1;
            rc.plasmid_cap = 150;
            if (inputs.synth === true || inputs.synth.val === true){
                rc.pop_divisor = 5;
                rc.k_inc = 125000;
                rc.plasmid_cap = 100;
            }
            break;
        case 'cataclysm':
        case 'bioseed':
            rc.pop_divisor = 3;
            rc.k_inc = 50000;
            rc.k_mult = 1.015;
            rc.phage_mult = 1;
            rc.plasmid_cap = 400;
            break;
        case 'ai':
            rc.pop_divisor = 2.5;
            rc.k_inc = 45000;
            rc.k_mult = 1.014;
            rc.phage_mult = 2;
            rc.plasmid_cap = 600;
            break;
        case 'vacuum':
        case 'bigbang':
            rc.pop_divisor = 2.2;
            rc.k_inc = 40000;
            rc.k_mult = 1.012;
            rc.phage_mult = 2.5;
            rc.plasmid_cap = 800;
            break;
        case 'ascend':
        case 'terraform':
            rc.pop_divisor = 1.15;
            rc.k_inc = 30000;
            rc.k_mult = 1.008;
            rc.phage_mult = 4;
            rc.plasmid_cap = 2000;
            break;
        case 'matrix':
            rc.pop_divisor = 1.5;
            rc.k_inc = 32000;
            rc.k_mult = 1.01;
            rc.phage_mult = 3.2;
            rc.plasmid_cap = 1800;
            break;
        case 'retired':
            rc.pop_divisor = 1.15;
            rc.k_inc = 32000;
            rc.k_mult = 1.006;
            rc.phage_mult = 3.2;
            rc.plasmid_cap = 1800;
            break;
        case 'eden':
            rc.pop_divisor = 1;
            rc.k_inc = 18000;
            rc.k_mult = 1.004;
            rc.phage_mult = 2.5;
            rc.plasmid_cap = 1800;
            break;
        default:
            rc.unknown = true;
            break;
    }
    return rc;
}

export function calcPrestige(type,inputs){
    let gains = {
        plasmid: 0,
        phage: 0,
        dark: 0,
        harmony: 0,
        artifact: 0,
        cores: 0,
        supercoiled: 0,
        pdebt: 0
    };

    if (!inputs) { inputs = {}; }
    if (inputs.synth === undefined) inputs.synth = races[global.race.species].type === 'synthetic';
    let challenge = inputs.genes;
    let universe = inputs.uni;
    universe = universe || global.race.universe;

    let pop = 0;
    if (inputs.cit === undefined){
        let garrisoned = global.civic.hasOwnProperty('garrison') ? global.civic.garrison.workers : 0;
        for (let i=0; i<3; i++){
            if (global.civic.foreign[`gov${i}`].occ){
                garrisoned += jobScale(global.civic.govern.type === 'federation' ? 15 : 20);
            }
        }
        if (global.race['high_pop']){
            pop = Math.round(global.resource[global.race.species].amount / traits.high_pop.vars()[0]) + Math.round(garrisoned / traits.high_pop.vars()[0]);
        }
        else {
            pop = global.resource[global.race.species].amount + garrisoned;
        }
    }
    else {
        if (inputs.high_pop){
            pop = Math.round(inputs.cit / traits.high_pop.vars(inputs.high_pop)[0]) + Math.round(inputs.sol / traits.high_pop.vars(inputs.high_pop)[0]);
        }
        else {
            pop = inputs.cit + inputs.sol;
        }
    }

    let rc = getResetConstants(type, inputs);
    let pop_divisor = rc.pop_divisor;
    let k_inc = rc.k_inc;
    let k_mult = rc.k_mult;
    let phage_mult = rc.phage_mult;
    let plasmid_cap = rc.plasmid_cap;

    if (challenge !== undefined){
        plasmid_cap = Math.floor(plasmid_cap * (1 + (challenge + (inputs.tp ? 1 : 0)) / 8));
    }
    else {
        plasmid_cap = Math.floor(plasmid_cap * (1 + (alevel() - (global.race['truepath'] ? 0 : 1)) / 8));
    }

    if (inputs.plas === undefined){
        let k_base = inputs.know !== undefined ? inputs.know : global.stats.know;
        let new_plasmid = Math.round(pop / pop_divisor);
        while (k_base > k_inc){
            new_plasmid++;
            k_base -= k_inc;
            k_inc *= k_mult;
        }

        if (global.race['cataclysm']){
            new_plasmid += 300;
        }
        else if (global.race['lone_survivor']){
            new_plasmid += 800;
        }

        gains.plasmid = challenge_multiplier(new_plasmid,type,false,inputs);

        if (!inputs.rawPlasmids && gains.plasmid > plasmid_cap){
            let overflow = gains.plasmid - plasmid_cap;
            gains.plasmid = plasmid_cap;
            overflow = Math.floor(overflow / (overflow + plasmid_cap) * plasmid_cap);
            gains.plasmid += overflow;
        }
    }
    else {
        gains.plasmid = inputs.plas;
    }
    gains.phage = gains.plasmid > 0 ? challenge_multiplier(Math.floor(Math.log2(gains.plasmid) * Math.E * phage_mult),type,false,inputs) : 0;

    if (type === 'bigbang'){
        let exotic = inputs.exotic;
        let mass = inputs.mass;
        if (exotic === undefined && global['interstellar'] && global.interstellar['stellar_engine']){
            exotic = global.interstellar.stellar_engine.exotic;
            mass = global.interstellar.stellar_engine.mass;
        }

        let new_dark = +(Math.log(1 + (exotic * 40))).toFixed(3);
        new_dark += +(Math.log2(mass - 7)/2.5).toFixed(3);
        new_dark = challenge_multiplier(new_dark,'bigbang',3,inputs);
        gains.dark = new_dark;
    }
    else if (type === 'vacuum'){
        let mana = inputs.mana !== undefined ? inputs.mana : global.resource.Mana.gen;
        let new_dark = +(Math.log2(mana)/5).toFixed(3);
        new_dark = challenge_multiplier(new_dark,'vacuum',3,inputs);
        gains.dark = new_dark;
    }


    if (['ascend','descend','terraform','apotheosis'].includes(type)){
        let pr_gain = 1;
        if (challenge === undefined){
            pr_gain = alevel();
            if (pr_gain > 5){
                pr_gain = 5;
            }
        }
        else {
            pr_gain = challenge + 1;
        }

        if (type === 'ascend' || type === 'terraform'){
            switch (universe){
                case 'micro':
                    pr_gain *= 0.25;
                    break;
                case 'heavy':
                    pr_gain *= 1.2;
                    break;
                case 'antimatter':
                    pr_gain *= 1.1;
                    break;
                default:
                    break;
            }
            gains.harmony = parseFloat(pr_gain.toFixed(2));
        }
        else if (type === 'descend'){
            let artifact = universe === 'micro' ? 1 : pr_gain;
            let spire = inputs.floor;
            if (spire !== undefined){
                spire++;
            }
            else {
                spire = global.portal.hasOwnProperty('spire') ? global.portal.spire.count : 0;
            }
            [50,100].forEach(function(x){
                if (spire > x){
                    artifact++;
                }
            });
            gains.artifact = artifact;
        }
        else if (type === 'apotheosis'){
            gains.plasmid = (256 >> 4) ** 4 - 65535; // why? because I want you to cry about it.
            if (universe === 'micro'){
                gains.supercoiled = pr_gain ** 2;
            }
            else {
                gains.supercoiled = pr_gain ** 3;
            }
            if (global.race['warlord']){
                gains.artifact = 5;
                gains.supercoiled = 64;
            }
        }
    }

    if (type === 'ai'){
        gains.cores = universe === 'micro' ? 2 : 5;
    }
    
    if (global.stats.pdebt > 0){
        gains.plasmid -= global.stats.pdebt;
        if (gains.plasmid < 0){
            gains.pdebt = Math.abs(gains.plasmid);
            gains.plasmid = 0;
        }
        else {
            gains.pdebt = 0;
        }
    }

    return gains;
}

export function adjustCosts(c_action, offset, wiki){
    let costs = c_action.cost || {};
    if ((costs['RNA'] || costs['DNA']) && global.genes['evolve']){
        var newCosts = {};
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
        var newCosts = {};
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
        var newCosts = {};
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
        var newCosts = {};
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
        var newCosts = {};
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
        var newCosts = {};
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
        var newCosts = {};
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
        var newCosts = {};
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
        var newCosts = {};
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
            var newCosts = {};
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
        var newCosts = {};
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
        var newCosts = {};
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
