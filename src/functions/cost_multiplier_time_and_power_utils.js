import { global, p_on, quantum_level } from '../core/vars.js';
import { races, traits } from '../races/races.js';
import { loc } from '../core/locale.js';
import { govActive } from '../governor/governor.js';
import { highPopAdjust } from '../resources/prod.js';
import { arpaAdjustCosts } from '../arpa/arpa.js';
import { astrologySign, astroVal } from '../systems/seasons.js';
import { universeAffix } from '../achievements/achieve.js';
import { adjustCosts } from './prestige_and_cost_adjusters.js';
import { creepGeneReduction } from '../config/cost.js';

// Fungsi-fungsi dipindah dari functions.js (urutan sumber dipertahankan). functions.js tetap mengekspor ulang nama yang tadinya ter-ekspor.


export function genCivName(alt){
    let genus = global.race.maintype || races[global.race.species].type;
    switch (genus){
        case 'animal':
            genus = 'animalism';
            break;
        case 'small':
            genus = 'dwarfism';
            break;
        case 'giant':
            genus = 'gigantism';
            break;
        case 'avian':
        case 'reptilian':
            genus = 'eggshell';
            break;
        case 'fungi':
            genus = 'chitin';
            break;
        case 'insectoid':
            genus = 'athropods';
            break;
        case 'angelic':
            genus = 'celestial';
            break;
        case 'organism':
            genus = 'sentience';
            break;
    }

    const filler = alt ? [
        loc(`civics_gov_tp_name0`),
        loc(`civics_gov_tp_name1`),
        loc(`civics_gov_tp_name2`),
        loc(`civics_gov_tp_name3`),
        loc(`civics_gov_tp_name4`),
        loc(`civics_gov_tp_name5`),
        loc(`civics_gov_tp_name6`),
        loc(`civics_gov_tp_name7`),
        loc(`civics_gov_tp_name8`),
        loc(`civics_gov_tp_name9`),
    ] : [
        races[global.race.species].name,
        races[global.race.species].home,
        loc(`biome_${global.city.biome}_name`),
        loc(`evo_${genus}_title`),
        loc(`civics_gov_name0`),
        loc(`civics_gov_name1`),
        loc(`civics_gov_name2`),
        loc(`civics_gov_name3`),
        loc(`civics_gov_name4`),
        loc(`civics_gov_name5`),
        loc(`civics_gov_name6`),
        loc(`civics_gov_name7`),
        loc(`civics_gov_name8`),
        loc(`civics_gov_name9`),
        loc(`civics_gov_name10`),
        loc(`civics_gov_name11`),
    ];

    return {
        s0: Math.rand(0,14),
        s1: filler[Math.rand(0,filler.length)]
    };
}

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
    var count = structure === 'citizen' ? highPopAdjust(global['resource'][global.race.species].amount) : (global[cat][structure] ? global[cat][structure].count : 0);
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
    var count = action === 'citizen' ? global['resource'][global.race.species].amount : (global[sector][action] ? global[sector][action].count : 0);
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

export function timeCheck(c_action,track,detailed,reqMet){
    reqMet = typeof reqMet === 'undefined' ? true : reqMet;
    if (c_action.cost){
        let time = 0;
        let bottleneck = false;
        let offset = track && track.id[c_action.id] ? track.id[c_action.id] : false;
        let costs = c_action['doNotAdjustCost'] ? c_action.cost : adjustCosts(c_action,offset);
        let og_track_r = track ? {} : false;
        let og_track_rr = track ? {} : false;
        if (track){
            Object.keys(track.r).forEach(function (res){
                og_track_r[res] = track.r[res];
            });
            Object.keys(track.rr).forEach(function (res){
                og_track_rr[res] = track.rr[res];
            });
        }
        let hasTrash = false;
        if (global.interstellar.hasOwnProperty('mass_ejector') && global.genes['governor'] && global.tech['governor'] && global.race['governor'] && global.race.governor['g'] && global.race.governor['tasks']){
            Object.keys(global.race.governor.tasks).forEach(function (t){
                if (global.race.governor.tasks[t] === 'trash'){
                    hasTrash = true;
                }
            });
        }
        let shorted = {};
        Object.keys(costs).forEach(function (res){
            if (time >= 0 && !global.prestige.hasOwnProperty(res) && !['Morale','HellArmy','Structs','Bool','Army','Troops'].includes(res)){
                var testCost = offset ? Number(costs[res](offset)) : Number(costs[res]());
                if (testCost > 0){
                    let f_res = res === 'Species' ? global.race.species : res;
                    let res_have = res === 'Supply' ? global.portal.purifier.supply : Number(global.resource[f_res].amount);
                    let res_max = res === 'Supply' ? global.portal.purifier.sup_max : global.resource[f_res].max;
                    let res_diff = res === 'Supply' ? global.portal.purifier.diff : global.resource[f_res].diff;

                    if (hasTrash && global.interstellar.mass_ejector[res]){
                        res_diff += global.interstellar.mass_ejector[res];
                        if (global.race.governor.config.trash.hasOwnProperty(res)){
                            res_diff -= Math.min(global.race.governor.config.trash[res].v,global.interstellar.mass_ejector[res]);
                        }
                    }

                    if (track){
                        res_have += res_diff * (reqMet ? track.t.t : track.t.rt);
                        if (!track.r.hasOwnProperty(f_res)){ track.r[f_res] = 0; }
                        if (!track.rr.hasOwnProperty(f_res)){ track.rr[f_res] = 0; }
                        if (reqMet){
                            res_have -= Number(track.r[f_res]);
                            track.r[f_res] += testCost;
                            track.rr[f_res] += testCost;
                        }
                        else {
                            res_have -= Number(track.rr[f_res]);
                            track.rr[f_res] += testCost;
                        }
                        if (res_max >= 0 && res_have > res_max){
                            res_have = res_max;
                        }
                    }
                    if (testCost > res_have){
                        if (res_diff > 0){
                            let r_time = (testCost - res_have) / res_diff;
                            if (r_time > time){
                                bottleneck = f_res;
                                time = r_time;
                            }
                            shorted[f_res] = r_time;
                        }
                        else {
                            if (track){
                                track.r = og_track_r;
                                track.rr = og_track_rr;
                            }
                            time = -9999999;
                            shorted[f_res] = 99999999 - res_diff;
                            if ((shorted[bottleneck] && shorted[f_res] > shorted[bottleneck]) || !shorted[bottleneck]){
                                bottleneck = f_res;
                            }
                        }
                    }
                }
            }
        });
        if (track && time >= 0){
            if (typeof track.id[c_action.id] === "undefined"){
                track.id[c_action.id] = 1;
            }
            else {
                track.id[c_action.id]++;
            }
            if (reqMet){
                track.t.t += time;
            }
            track.t.rt += time;
        }
        return detailed ? { t: time, r: bottleneck, s: shorted } : time;
    }
    else {
        return 0;
    }
}

// This function returns the time to complete all remaining Arpa segments.
// Note: remain is a fraction between 0 and 1 representing the fraction of
// remaining arpa segments to be completed
export function arpaTimeCheck(project, remain, track, detailed){
    let offset = track && track.id[project.id] ? track.id[project.id] : false;
    let costs = arpaAdjustCosts(project.cost,offset);
    let allRemainingSegmentsTime = 0;
    let og_track_r = track ? {} : false;
    let og_track_rr = track ? {} : false;
    let bottleneck = false;
    if (track){
        Object.keys(track.r).forEach(function (res){
            og_track_r[res] = track.r[res];
        });
        Object.keys(track.rr).forEach(function (res){
            og_track_rr[res] = track.rr[res];
        });
    }
    let hasTrash = false;
    if (global.interstellar.hasOwnProperty('mass_ejector') && global.genes['governor'] && global.tech['governor'] && global.race['governor'] && global.race.governor['g'] && global.race.governor['tasks']){
        Object.keys(global.race.governor.tasks).forEach(function (t){
            if (global.race.governor.tasks[t] === 'trash'){
                hasTrash = true;
            }
        });
    }

    let shorted = {};
    Object.keys(costs).forEach(function (res){
        if (allRemainingSegmentsTime >= 0){
            let allRemainingSegmentsCost = Number(costs[res](offset)) * remain;
            if (allRemainingSegmentsCost > 0){
                let res_have = Number(global.resource[res].amount);
                let res_diff = global.resource[res].diff;

                if (track){
                    if (hasTrash && global.interstellar.mass_ejector[res]){
                        res_diff += global.interstellar.mass_ejector[res];
                        if (global.race.governor.config.trash.hasOwnProperty(res)){
                            res_diff -= Math.min(global.race.governor.config.trash[res].v,global.interstellar.mass_ejector[res]);
                        }
                    }

                    res_have += res_diff * track.t.t;
                    if (track.r[res]){
                        res_have -= Number(track.r[res]);
                        track.r[res] += allRemainingSegmentsCost;
                    }
                    else {
                        track.r[res] = allRemainingSegmentsCost;
                    }
                    if (track.rr[res]){
                        track.rr[res] += allRemainingSegmentsCost;
                    }
                    else {
                        track.rr[res] = allRemainingSegmentsCost;
                    }
                    if (global.resource[res].max >= 0 && res_have > global.resource[res].max){
                        res_have = global.resource[res].max;
                    }
                }

                if (allRemainingSegmentsCost > res_have){
                    if (res_diff > 0){
                        let r_time = (allRemainingSegmentsCost - res_have) / res_diff;
                        if (r_time > allRemainingSegmentsTime){
                            allRemainingSegmentsTime = r_time;
                            bottleneck = res;
                        }
                        shorted[res] = r_time;
                    }
                    else {
                        if (track){
                            track.r = og_track_r;
                            track.rr = og_track_rr;
                        }
                        allRemainingSegmentsTime = -9999999;
                        shorted[res] = 99999999 - res_diff;
                        if ((shorted[bottleneck] && shorted[res] > shorted[bottleneck]) || !shorted[bottleneck]){
                            bottleneck = res;
                        }
                    }
                }
            }
        }
    });
    if (track && allRemainingSegmentsTime >= 0){
        if (typeof track.id[project.id] === "undefined"){
            track.id[project.id] = 1;
        }
        else {
            track.id[project.id]++;
        }
        track.t.t += allRemainingSegmentsTime;
        track.t.rt += allRemainingSegmentsTime;
    }
    return detailed ? { t: allRemainingSegmentsTime, r: bottleneck, s: shorted } : allRemainingSegmentsTime;
}

export function clearElement(elm,remove){
    elm.find('.vb').each(function(){
        try {
            $(this)[0].__vue__.$destroy();
        }
        catch(e){}
    });
    if (remove){
        try {
            elm[0].__vue__.$destroy();
        }
        catch(e){}
        elm.remove();
    }
    else {
        elm.empty();
    }
}

export function vBind(bind,action){
    action = action || 'create';
    if ($(bind.el).length > 0 && typeof $(bind.el)[0].__vue__ !== "undefined"){
        try {
            if (action === 'update'){
                $(bind.el)[0].__vue__.$forceUpdate();
            }
            else {
                $(bind.el)[0].__vue__.$destroy();
            }
        }
        catch(e){}
    }
    if (action === 'create'){
        new Vue(bind);
        $(bind.el).addClass('vb');
    }
}

export function timeFormat(time){
    let formatted;
    if (time < 0){
        formatted = loc('time_never');
    }
    else {
        time = +(time.toFixed(0));
        const secs_per_min = 60;

        if (time < secs_per_min){
            formatted = `${time}s`;
        }
        else {
            const mins_per_hour = 60;
            const secs_per_hour = secs_per_min*mins_per_hour;
            const secs = time % secs_per_min;
            const mins = Math.floor(time / secs_per_min) % mins_per_hour;

            if (time < secs_per_hour){
                if (secs > 0){ formatted = `${mins}m ${secs}s`; }
                else { formatted = `${mins}m`; }
            }
            else {
                const hours_per_day = 24;
                const secs_per_day = secs_per_hour*hours_per_day;
                const hours = Math.floor(time / secs_per_hour) % hours_per_day;

                if (time < secs_per_day){
                    if (mins > 0){ formatted = `${hours}h ${mins}m`; }
                    else if (secs > 0){ formatted = `${hours}h ${secs}s`; }
                    else { formatted = `${hours}h`; }
                }
                else {
                    const days = Math.floor(time / secs_per_day);

                    if (hours > 0){ formatted = `${days}d ${hours}h`; }
                    else if (mins > 0){ formatted = `${days}d ${mins}m`; }
                    else if (secs > 0){ formatted = `${days}d ${secs}s`; }
                    else { formatted = `${days}d`; }
                }
            }
        }
    }
    return formatted;
}

export function powerModifier(energy){
    if (global.race.universe === 'antimatter'){
        energy *= darkEffect('antimatter');
        energy = +energy.toFixed(2);
    }
    if (astrologySign() === 'leo'){
        energy *= 1 + (astroVal('leo')[0] / 100);
        energy = +energy.toFixed(2);
    }
    return energy;
}

export function powerCostMod(energy){
    if (global.race['emfield']){
        return +(energy * 1.5).toFixed(2);
    }
    return energy;
}

export function calcQuantumLevel(load){
    if (global.tech['high_tech'] && global.tech['high_tech'] >= 11){
        let k_base = global.resource.Knowledge.max;
        let k_inc = 250000;
        let qbits = 0;
        while (k_base > k_inc){
            k_base -= k_inc;
            k_inc *= 1.1;
            qbits++;
        }
        qbits += +(k_base / k_inc).toFixed(2);
        if (global.interstellar['citadel']){
            let citadel = load ? global.interstellar.citadel.on : p_on['citadel']
            if (global.tech['high_tech'] && global.tech['high_tech'] >= 15 && citadel > 0){
                qbits *= 1 + (citadel * 0.05);
            }
        }
        if (global.space['ai_core2']){
            let core = load ? global.space.ai_core2.on : p_on['ai_core2']
            if (global.tech['titan_ai_core'] && core > 0){
                qbits *= 1.25;
            }
        }
        if (global.stats.achieve['obsolete'] && global.stats.achieve[`obsolete`].l >= 5 && global.prestige.AICore.count > 0){
            qbits *= 2 - (0.99 ** global.prestige.AICore.count);
        }
        if (global.race['linked']){
            let factor = traits.linked.vars()[0] / 100 * global.resource[global.race.species].amount;
            if (factor > traits.linked.vars()[1] / 100){
                factor -= traits.linked.vars()[1] / 100;
                factor = factor / (factor + 200 - traits.linked.vars()[1]);
                factor += traits.linked.vars()[1] / 100;
            }
            qbits *= 1 + factor;
        }
        return +(qbits).toFixed(3);
    }
    return 0;
}

export function get_qlevel(wiki){
    return wiki ? calcQuantumLevel(wiki) : quantum_level;
}

export function darkEffect(universe, flag, info, inputs){
    if (!inputs) { inputs = {}; }
    let dark = inputs.dark !== undefined ? inputs.dark : global.prestige.Dark.count;
    let harmony = inputs.harmony !== undefined ? inputs.harmony : global.prestige.Harmony.count;
    let sludge = inputs.sludge !== undefined ? inputs.sludge : (global.stats.achieve['extinct_sludge'] && global.stats.achieve.extinct_sludge[universeAffix(universe)]) ? global.stats.achieve.extinct_sludge[universeAffix(universe)] : 0;

    switch (universe){
        case 'standard':
            if (global.race.universe === 'standard' || info){
                if (harmony > 0){
                    dark *= 1 + (harmony * 0.001);
                }
                if (sludge){
                    dark *= 1 + (sludge * 0.03);
                }
                return 1 + (dark / 200);
            }
            return 0;

        case 'evil':
            if (global.race.universe === 'evil' || info){
                if (harmony > 0){
                    dark *= 1 + (harmony * 0.01);
                }
                if (sludge){
                    dark *= 1 + (sludge * 0.03);
                }
                return (1 + ((Math.log2(10 + dark) - 3.321928094887362) / (flag ? 10 : 5)));
            }
            return 1;

        case 'micro':
            if (global.race.universe === 'micro' || info){
                if (flag){
                    if (harmony > 0){
                        dark *= 1 + (harmony * 0.01);
                    }
                    dark = 0.01 + (Math.log(100 + dark) - 4.605170185988092) / 35;
                    if (sludge){
                        dark *= 1 + (sludge * 0.03);
                    }
                    if (dark > 0.04){
                        dark = 0.04;
                    }
                    return +(dark).toFixed(5);
                }
                else {
                    if (harmony > 0){
                        dark *= 1 + (harmony * 0.01);
                    }
                    dark = 0.02 + (Math.log(100 + dark) - 4.605170185988092) / 20;
                    if (sludge){
                        dark *= 1 + (sludge * 0.03);
                    }
                    if (dark > 0.06){
                        dark = 0.06;
                    }
                    return +(dark).toFixed(5);
                }
            }
            return 0;

        case 'heavy':
            if (global.race.universe === 'heavy' || info){
                if (harmony > 0){
                    dark *= 1 + (harmony * 0.01);
                }
                if (sludge){
                    dark *= 1 + (sludge * 0.03);
                }
                return 0.995 ** dark;
            }
            return 1;

        case 'antimatter':
            if (global.race.universe === 'antimatter' || info){
                if (harmony > 0){
                    dark *= 1 + (harmony * 0.01);
                }
                if (sludge){
                    dark *= 1 + (sludge * 0.03);
                }
                return 1 + (Math.log(50 + dark) - 3.912023005428146) / 5;
            }
            return 0;

        case 'magic':
            if (global.race.universe === 'magic' || info){
                if (harmony > 0){
                    dark *= 1 + (harmony * 0.01);
                }
                if (sludge){
                    dark *= 1 + (sludge * 0.03);
                }
                return 1 + (Math.log(50 + dark) - 3.912023005428146) / 3;
            }
            return 0;
    }

    return 0;
}
