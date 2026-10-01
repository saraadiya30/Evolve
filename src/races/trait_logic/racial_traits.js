// Isi: setJType(), customRace(), racialTrait(), servantTrait(), randomMinorTrait(), checkPurgatory(), checkAltPurgatory(), setPurgatory(), getPurgatory(), purgeLumber(), releaseResource(), adjustFood(), traitCostMod()
import { races, traits } from '../../core/registries.js';
import { global, active_rituals, seededRandom, power_generated } from '../../core/vars.js';
import { govActive } from '../../governor/governor.js';
import { govEffect } from '../../civics/civics.js';
import { armyRating } from '../../civics/military/army_rating.js';
import { OCULAR_POWER_TELEKINESIS_BASE } from '../../config/constants.js';
import { jobScale } from '../../civics/jobs/job_scale.js';
import { loadFoundry } from '../../civics/jobs/foundry_panel.js';
import { teamster } from '../../resources/prod.js';
import { highPopAdjust } from '../../functions/adjusters_basic.js';
import { removeFromQueue, removeFromRQueue } from '../../functions/queues.js';
import { defineIndustry } from '../../industry/industry_smelter.js';
import { checkTechQualifications } from '../../actions/challenge/challenge_rules.js';
import { actions } from '../../core/registries.js';
import { loc } from '../../core/locale.js';
import { setResourceName } from '../../resources/special_resources.js';
import { planetTraits, biomes } from '../races.js';
import { fathomCheck } from './fathom_check.js';

// Fungsi-fungsi dipindah dari races.js (urutan sumber dipertahankan). races.js tetap mengekspor ulang nama yang tadinya ter-ekspor.


export function setJType(){
    races.junker.type = global.race.hasOwnProperty('jtype') ? global.race.jtype : 'humanoid';
    races.sludge.type = global.race.hasOwnProperty('jtype') ? global.race.jtype : 'humanoid';
    races.ultra_sludge.type = global.race.hasOwnProperty('jtype') ? global.race.jtype : 'humanoid';
}

export function customRace(hybrid){
    let slot = hybrid ? 'race1' : 'race0';
    if (global.hasOwnProperty('custom') && global.custom.hasOwnProperty(slot)){
        let trait = {};
        let ranks = global.custom[slot]?.ranks || {};
        for (let i=0; i<global.custom[slot].traits.length; i++){
            trait[global.custom[slot].traits[i]] = ranks[global.custom[slot].traits[i]] || 1;
        }

        let fanatic = global.custom[slot].hasOwnProperty('fanaticism') && global.custom[slot].fanaticism ? global.custom[slot].fanaticism : false;
        if (fanatic && !global.custom[slot].traits.includes(fanatic)){ fanatic = false; }
        if (!fanatic){
            fanatic = 'pathetic';
            for (let i=0; i<global.custom[slot].traits.length; i++){
                if (traits[global.custom[slot].traits[i]].val > traits[fanatic].val){
                    fanatic = global.custom[slot].traits[i];
                }
            }
        }

        let def = {
            name: global.custom[slot].name,
            desc: global.custom[slot].desc,
            type: global.custom[slot].genus,
            home: global.custom[slot].home,
            entity: global.custom[slot].entity,
            traits: trait,
            solar: {
                red: global.custom[slot].red,
                hell: global.custom[slot].hell,
                gas: global.custom[slot].gas,
                gas_moon: global.custom[slot].gas_moon,
                dwarf: global.custom[slot].dwarf,
            },
            fanaticism: fanatic,
            basic(){ return false; }
        };

        if (hybrid){
            def['hybrid'] = global.custom[slot].hybrid;
        }

        return def;
    }
    else {
        return {};
    }
}

/*
types: farmer, miner, lumberjack, science, factory, army, hunting, scavenger, forager
*/
export function racialTrait(workers,type){
    let modifier = 1;
    let theoryVal = govActive('theorist',1);
    if (theoryVal && (type === 'factory' || type === 'miner' || type === 'lumberjack')){
        modifier *= 1 - (theoryVal / 100);
    }
    let inspireVal = govActive('inspirational',0);
    if (inspireVal && (type === 'farmer' || type === 'factory' || type === 'miner' || type === 'lumberjack')){
        modifier *= 1 + (inspireVal / 100);
    }
    let dirtVal = govActive('dirty_jobs',2);
    if (dirtVal && type === 'miner'){
        modifier *= 1 + (dirtVal / 100);
    }
    if (global.race['rejuvenated'] && ['lumberjack','miner','factory'].includes(type)){
        modifier *= 1.1;
    }
    if (type === 'lumberjack' && global.race['evil'] && (global.race.universe === 'evil' || !global.race['soul_eater'])){
        if (global.race['living_tool']){
            modifier *= 1 + traits.living_tool.vars()[0] * (global.tech['science'] && global.tech.science > 0 ? global.tech.science * 0.3 : 0);
        }
        else {
            modifier *= 1 + ((global.tech['reclaimer'] - 1) * 0.4);
        }
    }
    if (global.race['powered'] && (type === 'factory' || type === 'miner' || type === 'lumberjack') ){
        modifier *= 1 + (traits.powered.vars()[1] / 100);
    }
    if (global.race['artifical'] && type === 'science'){
        modifier *= 1 + (traits.artifical.vars()[0] / 100);
    }
    if (global.race['hivemind'] && type !== 'farmer' && !global.race['lone_survivor']){
        let breakpoint = traits.hivemind.vars()[0];
        let scale = 0.05;
        if (global.race['high_pop'] && type !== 'army' && type !== 'hellArmy'){
            breakpoint *= traits.high_pop.vars()[0];
            scale = 0.5 / (traits.hivemind.vars()[0] * traits.high_pop.vars()[0]);
        }
        if (workers <= breakpoint){
            let start = 1 - (breakpoint * scale);
            modifier *= (workers * scale) + start;
        }
        else {
            let mod = type === 'army' || type === 'hellArmy' ? 0.99 : (global.race['high_pop'] ? 0.985 : 0.98);
            modifier *= 1 + (1 - (mod ** (workers - breakpoint)));
        }
    }
    let antidFathom = fathomCheck('antid');
    if (antidFathom > 0){
        let mod = type === 'army' || type === 'hellArmy' ? 0.99 : (global.race['high_pop'] ? 0.985 : 0.98);
        modifier *= 1 + (1 - (mod ** (workers * antidFathom / 4))) / 2;
    }
    if (global.race['cold_blooded'] && type !== 'army' && type !== 'hellArmy' && type !== 'factory' && type !== 'science'){
        switch(global.city.calendar.temp){
            case 0:
                modifier *= 1 - (traits.cold_blooded.vars()[0] / 100);
                break;
            case 2:
                modifier *= 1 + (traits.cold_blooded.vars()[1] / 100);
                break;
            default:
                modifier *= 1;
                break;
        }
        switch(global.city.calendar.weather){
            case 0:
                modifier *= 1 - (traits.cold_blooded.vars()[0] / 100);
                break;
            case 2:
                modifier *= 1 + (traits.cold_blooded.vars()[1] / 100);
                break;
            default:
                modifier *= 1;
                break;
        }
    }
    if (global.race['cannibalize'] && global.city['s_alter'] && global.city['s_alter'].count > 0){
        if (type === 'miner' && global.city.s_alter.mine > 0){
            modifier *= 1 + (traits.cannibalize.vars()[0] / 100);
        }
        if (type === 'lumberjack' && global.city.s_alter.harvest > 0){
            modifier *= 1 + (traits.cannibalize.vars()[0] / 100);
        }
        if ((type === 'army' || type === 'hellArmy') && global.city.s_alter.rage > 0){
            modifier *= 1 + (traits.cannibalize.vars()[0] / 100);
        }
        if (type === 'science' && global.city.s_alter.mind > 0){
            modifier *= 1 + (traits.cannibalize.vars()[0] / 100);
        }
    }
    let mantisFathom = fathomCheck('mantis');
    if (mantisFathom > 0){
        if (type === 'miner'){
            modifier *= 1 + (traits.cannibalize.vars(1)[0] / 100 * mantisFathom);
        }
        if (type === 'lumberjack'){
            modifier *= 1 + (traits.cannibalize.vars(1)[0] / 100 * mantisFathom);
        }
        if ((type === 'army' || type === 'hellArmy')){
            modifier *= 1 + (traits.cannibalize.vars(1)[0] / 100 * mantisFathom);
        }
        if (type === 'science'){
            modifier *= 1 + (traits.cannibalize.vars(1)[0] / 100 * mantisFathom);
        }
    }
    if (global.race['humpback'] && (type === 'miner' || type === 'lumberjack')){
        modifier *= 1 + (traits.humpback.vars()[1] / 100);
    }
    let kamelFathom = fathomCheck('kamel');
    if (kamelFathom > 0 && (type === 'miner' || type === 'lumberjack')){
        modifier *= 1 + (traits.humpback.vars(1)[1] / 100 * kamelFathom);
    }
    if (global.city.ptrait.includes('magnetic') && type === 'miner'){
        modifier *= planetTraits.magnetic.vars()[2];
    }
    if (global.race['weak'] && (type === 'miner' || type === 'lumberjack')){
        modifier *= 1 - (traits.weak.vars()[0] / 100);
    }
    if (global.race['hydrophilic'] && global.city.calendar.weather === 0 && global.city.calendar.temp > 0 && type !== 'factory'){
        modifier *= 0.75;
    }
    if (global.race['toxic'] && type === 'factory'){
        modifier *= 1 + (traits.toxic.vars()[2] / 100);
    }
    let shroomiFathom = fathomCheck('shroomi');
    if (shroomiFathom > 0 && type === 'factory'){
        modifier *= 1 + (traits.toxic.vars(1)[2] / 100 * shroomiFathom);
    }
    if (global.race['hardy'] && type === 'factory'){
        modifier *= 1 + (traits.hardy.vars()[0] * global.race['hardy'] / 100);
    }
    if (global.race['analytical'] && type === 'science'){
        modifier *= 1 + (traits.analytical.vars()[0] * global.race['analytical'] / 100);
    }
    if (global.race['ooze']){
        modifier *= 1 - (traits.ooze.vars()[0] / 100);
    }
    if (global.civic.govern.type === 'democracy'){
        modifier *= 1 - (govEffect.democracy()[1] / 100);
    }
    if (global.tech['cyber_worker'] && (type === 'lumberjack' || type === 'miner' || type === 'forager')){
        modifier *= 1.25;
    }
    if (global.race['ocular_power'] && global.race['ocularPowerConfig'] && global.race.ocularPowerConfig.t 
        && ['farmer','miner','lumberjack','scavenger','factory'].includes(type)){
        let labor = OCULAR_POWER_TELEKINESIS_BASE * (traits.ocular_power.vars()[1] / 100);
        modifier *= 1 + (labor / 100);
    }
    if (type === 'hunting'){
        if (global.race['tracker']){
            modifier *= 1 + (traits.tracker.vars()[0] / 100);
        }
        let wolvenFathom = fathomCheck('wolven');
        if (wolvenFathom > 0){
            modifier *= 1 + (traits.tracker.vars(1)[0] / 100 * wolvenFathom);
        }
        if (global.race['beast']){
            let rate = global.city.calendar.wind === 1 ? traits.beast.vars()[1] : traits.beast.vars()[0];
            modifier *= 1 + (rate / 100);
        }
        if (global.race['apex_predator']){
            modifier *= 1 + (traits.apex_predator.vars()[1] / 100);
        }
        let sharkinFathom = fathomCheck('sharkin');
        if (sharkinFathom > 0){
            modifier *= 1 + (traits.apex_predator.vars(1)[1] / 100 * sharkinFathom);
        }
        if (global.race['fiery']){
            modifier *= 1 + (traits.fiery.vars()[1] / 100);
        }
        let balorgFathom = fathomCheck('balorg');
        if (balorgFathom > 0){
            modifier *= 1 + (traits.fiery.vars(1)[1] / 100 * balorgFathom);
        }
        if (global.race['fragrant']){
            modifier *= 1 - (traits.fragrant.vars()[0] / 100);
        }
        if (global.city.ptrait.includes('rage')){
            modifier *= planetTraits.rage.vars()[1];
        }
        if (global.race['cunning']){
            modifier *= 1 + (traits.cunning.vars()[0] * global.race['cunning'] / 100);
        }
        if (global.city.biome === 'savanna'){
            modifier *= biomes.savanna.vars()[1];
        }
        if (global.race['dark_dweller'] && global.city.calendar.weather === 2){
            modifier *= 1 - traits.dark_dweller.vars()[0] / 100;
        }
        if(global.city.banquet && global.city.banquet.on && global.city.banquet.level >= 3){
            modifier *= 1 + (global.city.banquet.strength ** 0.65) / 100;
        }
    }
    if (global.race.universe === 'magic'){
        if (type === 'science'){
            modifier *= 0.6;
        }
        else if (type === 'army' || type === 'hellArmy'){
            modifier *= 0.75;
        }
        else {
            modifier *= 0.8;
        }
        if (global.race['witch_hunter']){
            modifier *= 0.75;
        }
        if (global.race.hasOwnProperty('casting') && active_rituals[type === 'hellArmy' ? 'army' : type]){
            let boost = active_rituals[type === 'hellArmy' ? 'army' : type];
            if (global.race['witch_hunter']){
                modifier *= 1 + (boost / (boost + 75) * 2.5);
            }
            else {
                modifier *= 1 + (boost / (boost + 75));
            }
        }
    }
    if ((global.race['living_tool'] || global.race['tusk']) && type === 'miner'){
        const balance = global.race['hivemind'] ? traits.hivemind.vars()[0] : 1;
        let tusk = global.race['tusk'] ? 1 + ((traits.tusk.vars()[0] / 100) * (armyRating(jobScale(balance),'army',0) / balance / 100)) : 1;
        let lt = global.race['living_tool'] ? 1 + traits.living_tool.vars()[0] * (global.tech['science'] && global.tech.science > 0 ? global.tech.science * 0.12 : 0) : 1;
        modifier *= lt > tusk ? lt : tusk;
    }
    if (global.race['warlord']){
        if (type === 'miner'){
            modifier *= 1.82;
        }
        else if (type === 'lumberjack'){
            modifier *= 1.3;
        }
        else if (type === 'science'){
            modifier *= 1.5;
        }
    }
    if (global.race['forager'] && type === 'forager'){
        modifier *= traits.forager.vars()[0] / 100;
    }
    if (global.race['high_pop']){
        modifier = highPopAdjust(modifier);
    }
    if (global.race['gravity_well'] && ['farmer', 'miner', 'lumberjack', 'factory', 'hunting', 'forager'].includes(type)){
        modifier = teamster(modifier);
    }
    return modifier;
}

/*
types: farmer, miner, lumberjack, science, factory, army, hunting, scavenger, forager
*/
export function servantTrait(workers,type){
    let modifier = 1;
    if (global.race['gravity_well'] && ['farmer', 'miner', 'lumberjack', 'factory', 'hunting', 'scavenger', 'forager'].includes(type)){
        modifier = teamster(modifier);
    }
    return modifier;
}

export function randomMinorTrait(ranks){
    let trait_list = [];
    Object.keys(traits).forEach(function (t){
        if (traits[t].type === 'minor' && !global.race[t]){
            trait_list.push(t);
        }
    });
    if (trait_list.length === 0){
        Object.keys(traits).forEach(function (t){
            if (traits[t].type === 'minor'){
                trait_list.push(t);
            }
        });
    }
    let trait = trait_list[Math.floor(seededRandom(0,trait_list.length))];
    if (global.race[trait]){
        global.race[trait] += ranks;
    }
    else {
        global.race[trait] = ranks;
    }
    return trait;
}

export function checkPurgatory(s,t,dv){
    if (global.race.purgatory[s].hasOwnProperty(t)){
        global[s][t] = global.race.purgatory[s][t];
        delete global.race.purgatory[s][t];
    }
    else if (dv){
        global[s][t] = dv;
    }
}

export function checkAltPurgatory(s,t,a,dv){
    if (global.race.purgatory[s].hasOwnProperty(t)){
        global[s][t] = global.race.purgatory[s][t];
        delete global.race.purgatory[s][t];
    }
    else if (global.race.purgatory[s].hasOwnProperty(a)) {
        global[s][t] = global.race.purgatory[s][a];
        delete global.race.purgatory[s][a];
    }
    else if (dv){
        global[s][t] = dv;
    }
}

export function setPurgatory(s,t){
    if (global[s].hasOwnProperty(t)){
        global.race.purgatory[s][t] = global[s][t];
        delete global[s][t];
    }
}

function getPurgatory(s,t){
    if (global.race.purgatory[s].hasOwnProperty(t)){
        return global.race.purgatory[s][t];
    }
}

export function purgeLumber(){
    releaseResource('Lumber');
    releaseResource('Plywood');
    removeFromQueue(['city-graveyard', 'city-lumber_yard', 'city-sawmill']);
    removeFromRQueue(['reclaimer', 'axe', 'saw']);
    setPurgatory('city','sawmill');
    setPurgatory('city','graveyard');
    setPurgatory('city','lumber_yard');
    setPurgatory('tech','axe');
    setPurgatory('tech','reclaimer');
    setPurgatory('tech','saw');
    global.civic.lumberjack.display = false;
    global.civic.lumberjack.workers = 0;
    global.civic.lumberjack.assigned = 0;
    if (global.civic.d_job === 'lumberjack') {
        global.civic.d_job = global.race['carnivore'] || global.race['soul_eater'] ? 'hunter' : 'unemployed';
    }
    if (global.race['casting']){
        global.race.casting.total -= global.race.casting.lumberjack;
        global.race.casting.lumberjack = 0;
        active_rituals.lumberjack = 0;
        defineIndustry();
    }
    if (global.city['s_alter']) {
        global.city.s_alter.harvest = 0;
    }
}

export function releaseResource(res) {
    global.resource[res].display = false;
    if (global.race['alchemy'] && global.race.alchemy.hasOwnProperty(res)){
        global.resource.Mana.diff += global.race.alchemy[res];
        global.race.alchemy[res] = 0;
    }
    if (global.interstellar['mass_ejector'] && global.interstellar.mass_ejector.hasOwnProperty(res)){
        global.interstellar.mass_ejector.total -= global.interstellar.mass_ejector[res];
        global.interstellar.mass_ejector[res] = 0;
    }
    if (global.city['nanite_factory'] && global.city.nanite_factory.hasOwnProperty(res)){
        global.city.nanite_factory[res] = 0;
    }
    if (global.portal['transport'] && global.portal.transport.cargo.hasOwnProperty(res)){
        global.portal.transport.cargo.used -= global.portal.transport.cargo[res];
        global.portal.transport.cargo[res] = 0;
    }
    if (global.tech['foundry'] && global.city.foundry.hasOwnProperty(res)){
        global.civic.craftsman.workers -= global.city.foundry[res];
        global.city.foundry.crafting -= global.city.foundry[res];
        global.city.foundry[res] = 0;
        loadFoundry();
    }
    if (global.resource[res].hasOwnProperty('trade')) {
        global.city.market.trade -= Math.abs(global.resource[res].trade);
        global.resource[res].trade = 0;
    }
    global.resource.Crates.amount += global.resource[res].crates;
    global.resource[res].crates = 0;
    global.resource.Containers.amount += global.resource[res].containers;
    global.resource[res].containers = 0;
}

export function adjustFood() {
    let farmersEnabled = checkTechQualifications(actions.tech.agriculture);
    let huntingEnabled = checkTechQualifications(actions.tech.smokehouse);
    let lumberEnabled = checkTechQualifications(actions.tech.reclaimer) || checkTechQualifications(actions.tech.stone_axe);
    let altLodge = checkTechQualifications(actions.tech.alt_lodge);
    let altMill = checkTechQualifications(actions.tech.wind_plant);
    let disabledCity = [], disabledTech = [];

    if (!global.race['artifical']) {
        ['agriculture','farm','hunting','s_lodge','wind_plant','compost','soul_eater'].forEach(function (tech){
            setPurgatory('tech',tech);
        });
        ['silo','farm','mill','windmill','smokehouse','lodge','compost','soul_well'].forEach(function (city){
            setPurgatory('city',city);
        });

        if (altLodge) {
            checkPurgatory('tech','s_lodge');
            let minAltLodge = (getPurgatory('tech','farm') >= 1 || getPurgatory('tech','hunting') >= 2) ? 1 : 0;
            if (minAltLodge > 0 && (!global.tech['s_lodge'] || global.tech['s_lodge'] < minAltLodge)) {
                global.tech['s_lodge'] = minAltLodge;
            }
            if (global.tech['s_lodge'] >= 1) {
                checkAltPurgatory('city','lodge','farm',{ count: 0 });
            }
        }

        if (huntingEnabled) {
            checkPurgatory('tech','hunting');
            let minHunting = (getPurgatory('tech','farm') >= 1 || getPurgatory('tech','s_lodge') >= 1) ? 2
                            : getPurgatory('tech','agriculture') >= 3 ? 1 : 0;
            if (minHunting > 0 && (!global.tech['hunting'] || global.tech['hunting'] < minHunting)) {
                global.tech['hunting'] = minHunting;
            }
            if (global.tech['hunting'] >= 1) {
                checkAltPurgatory('city','smokehouse','silo',{ count: 0 });
            }
            if (global.tech['hunting'] >= 2 && !altLodge) {
                checkAltPurgatory('city','lodge','farm',{ count: 0 });
            }
        }
        else {
            disabledTech.push('hunting');
            disabledCity.push('city-smokehouse');
            if (!altLodge) {
                disabledTech.push('city-lodge');
            }
        }

        if (farmersEnabled) {
            checkPurgatory('tech','farm');
            let minFarm = (getPurgatory('tech','hunting') >= 2 || getPurgatory('tech','s_lodge') >= 1) ? 1 : 0;
            if (minFarm > 0 && (!global.tech['farm'] || global.tech['farm'] < minFarm)) {
                global.tech['farm'] = minFarm;
            }
            checkPurgatory('tech','agriculture');
            let minAgriculture = getPurgatory('tech','hunting') >= 1 ? 3 :
                                 getPurgatory('tech','s_lodge') >= 1 ? 1 : 0;
            if (minAgriculture > 0 && (!global.tech['agriculture'] || global.tech['agriculture'] < minAgriculture)) {
                global.tech['agriculture'] = minAgriculture;
            }
            if (global.tech['agriculture'] >= 1) {
                checkAltPurgatory('city','farm','lodge',{ count: 0 });
            }
            if (global.tech['agriculture'] >= 3) {
                checkAltPurgatory('city','silo','smokehouse',{ count: 0 });
            }
            if (global.tech['agriculture'] >= 4 && !altMill) {
                checkAltPurgatory('city','mill','windmill',{ count: 0, on: 0 });
            }
        }
        else {
            disabledTech.push('agriculture', 'farm');
            disabledCity.push('city-farm', 'city-silo', 'city-mill');
        }

        if (global.race['soul_eater']) {
            checkPurgatory('tech','soul_eater');
            checkPurgatory('city','soul_well');
        }
        else {
            disabledCity.push('city-soul_well');
            disabledTech.push('soul_eater');
        }

        if (global.race['detritivore']) {
            checkPurgatory('tech','compost');
            checkPurgatory('city','compost');
        }
        else {
            disabledTech.push('compost');
            disabledCity.push('city-compost');
        }

        if (altMill) {
            checkPurgatory('tech','wind_plant');
            if (global.tech['wind_plant'] >= 1) {
                checkAltPurgatory('city','windmill','mill',{ count: 0, on: 0 });
            }
        }
        else {
            disabledTech.push('wind_plant');
            disabledCity.push('city-windmill');
            delete power_generated[loc('city_mill_title2')];
        }
    }

    let jobEnabled = [], jobDisabled = [];
    if (!global.race['orbit_decayed'] && farmersEnabled && global.tech['agriculture'] >= 1 && global.city['farm'].count > 0) {
        jobEnabled.push('farmer');
    }
    else {
        jobDisabled.push('farmer');
    }
    if ((global.race['carnivore'] && !global.race['herbivore']) || global.race['soul_eater'] || global.race['unfathomable']) {
        jobEnabled.push('hunter');
        jobDisabled.push('unemployed');
    }
    else {
        jobDisabled.push('hunter');
        jobEnabled.push('unemployed');
    }
    if (!global.race['orbit_decayed'] && lumberEnabled) {
        jobEnabled.push('lumberjack');
    }
    else {
        jobDisabled.push('lumberjack');
    }

    jobEnabled.forEach(function(job) {
        if (!global.civic[job].display) {
            global.civic[job].workers = 0;
            global.civic[job].display = true;
        }
    });
    jobDisabled.forEach(function(job) {
        if (global.civic[job].display) {
            if (global.civic.d_job === job) {
                global.civic.d_job = jobEnabled[0];
            }
            global.civic[jobEnabled[0]].workers += global.civic[job].workers;
            global.civic[job].workers = 0;
            global.civic[job].assigned = 0;
            global.civic[job].display = false;
        }
    });

    if (global.race['casting']){
        if (!farmersEnabled) {
            global.race.casting.total -= global.race.casting.farmer;
            global.race.casting.farmer = 0;
            active_rituals.farmer = 0;
        }
        defineIndustry();
    }

    removeFromQueue(disabledCity);
    removeFromRQueue(disabledTech);
    setResourceName('Food');
}

export function traitCostMod(t,val){
    if (!global.race[t]){
        return val;
    }
    switch (t){
        case 'stubborn':
        {
            val *= 1 + (traits.stubborn.vars()[0] / 100);
        }
        case 'untrustworthy':
        {
            val *= 1 + (traits.untrustworthy.vars()[0] / 100);
        }
    }
    return Math.round(val);
}
