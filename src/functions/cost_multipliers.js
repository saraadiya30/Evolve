import { global } from '../core/vars.js';
import { darkEffect } from './power_modifiers.js';
import { traits } from '../core/registries.js';
import { creepGeneReduction } from '../config/constants.js';
import { govActive } from '../governor/governor.js';
import { highPopAdjust } from './adjusters_basic.js';

export function costMultiplier(structure,offset,base,multiplier,cat){
    if (!cat){
        cat = 'city';
    }
    if (global.race.universe === 'micro'){
        multiplier -= darkEffect('micro',false);
    }

    if (global.race['small']){ multiplier -= traits.small.vars()[0]; }
    if (global.race['large']){ multiplier += traits.large.vars()[0]; }
    if (global.race['compact']){ multiplier -= traits.compact.vars()[0]; }
    if (global.race['tunneler'] && (structure === 'mine' || structure === 'coal_mine')){ multiplier -= traits.tunneler.vars()[0]; }
    if (global.tech['housing_reduction'] && (structure === 'basic_housing' || structure === 'cottage')){
        multiplier -= global.tech['housing_reduction'] * 0.02;
    }
    if (global.tech['housing_reduction'] && structure === 'captive_housing'){
        multiplier -= global.tech['housing_reduction'] * 0.01;
    }
    if (structure === 'basic_housing'){
        if (global.race['solitary']){
            multiplier -= traits.solitary.vars()[0];
        }
        if (global.race['pack_mentality']){
            multiplier += traits.pack_mentality.vars()[0];
        }
    }
    if (structure === 'cottage'){
        if (global.race['solitary']){
            multiplier += traits.solitary.vars()[1];
        }
        if (global.race['pack_mentality']){
            multiplier -= traits.pack_mentality.vars()[1];
        }
    }
    if (structure === 'apartment'){
        if (global.race['pack_mentality']){
            multiplier -= traits.pack_mentality.vars()[1];
        }
    }
    multiplier -= creepGeneReduction(global.genes['creep'], global.race['no_crispr']);
    let nqVal = govActive('noquestions',0);
    if (nqVal){
        multiplier -= nqVal;
    }
    if (multiplier < 1.000){
        multiplier = 1.000;
    }
    let count = structure === 'citizen' ? highPopAdjust(global['resource'][global.race.species].amount) : (global[cat][structure] ? global[cat][structure].count : 0);
    if (offset){
        count += offset;
    }
    return Math.round((multiplier ** count) * base);
}

export function spaceCostMultiplier(action,offset,base,multiplier,sector,c_min){
    if (!sector){
        sector = 'space';
    }
    c_min = c_min || 1.000;
    if (global.race.universe === 'micro'){
        multiplier -= darkEffect('micro',true);
    }
    multiplier -= creepGeneReduction(global.genes['creep'], global.race['no_crispr']);
    if (global.race['small']){ multiplier -= traits.small.vars()[1]; }
    if (global.race['compact']){ multiplier -= traits.compact.vars()[1]; }
    if (global.prestige.Harmony.count > 0 && global.stats.achieve[`ascended`]){
        multiplier -= harmonyEffect();
    }
    let nqVal = govActive('noquestions',0);
    if (nqVal){
        multiplier -= nqVal;
    }
    if (multiplier < c_min){
        multiplier = c_min;
    }
    let count = action === 'citizen' ? global['resource'][global.race.species].amount : (global[sector][action] ? global[sector][action].count : 0);
    if (offset && typeof offset === 'number'){
        count += offset;
    }
    return Math.round((multiplier ** count) * base);
}

export function harmonyEffect(){
    if (global.prestige.Harmony.count > 0 && global.stats.achieve[`ascended`]){
        let boost = 0;
        switch (global.race.universe){
            case 'heavy':
                if (global.stats.achieve.ascended.hasOwnProperty('h')){
                    boost = global.stats.achieve.ascended.h * global.prestige.Harmony.count;
                }
                break;
            case 'antimatter':
                if (global.stats.achieve.ascended.hasOwnProperty('a')){
                    boost = global.stats.achieve.ascended.a * global.prestige.Harmony.count;
                }
                break;
            case 'evil':
                if (global.stats.achieve.ascended.hasOwnProperty('e')){
                    boost = global.stats.achieve.ascended.e * global.prestige.Harmony.count;
                }
                break;
            case 'micro':
                if (global.stats.achieve.ascended.hasOwnProperty('m')){
                    boost = global.stats.achieve.ascended.m * global.prestige.Harmony.count;
                }
                break;
            case 'magic':
                if (global.stats.achieve.ascended.hasOwnProperty('mg')){
                    boost = global.stats.achieve.ascended.mg * global.prestige.Harmony.count;
                }
                break;
            default:
                if (global.stats.achieve.ascended.hasOwnProperty('l')){
                    boost = global.stats.achieve.ascended.l * global.prestige.Harmony.count;
                }
                break;
        }
        if (boost > 0){
            boost = (Math.log(50 + boost) - 3.912023005428146) * 0.01;
            return +(boost).toFixed(5);
        }
    }
    return 0;
}
