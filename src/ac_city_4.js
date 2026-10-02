import { loc } from './locale.js';
import { global, sizeApproximation, support_on, p_on, gal_on } from './vars.js';
import { payCosts, drawCity, wardenLabel, powerOnNewStruct, dirt_adjust } from './actions.js';
import { incrementStruct, isStargateOn, piracy } from './space.js';
import { races, planetTraits, traits, fathomCheck } from './races.js';
import { costMultiplier, shrineBonusActive, getShrineBonus, powerCostMod, powerModifier, flib } from './functions.js';
import { jobScale, workerScale } from './jobs.js';
import { govActive } from './governor.js';
import { faithTempleCount, spatialReasoning } from './resources.js';
import { highPopAdjust } from './prod.js';

// Bagian dari actions_city (10 entri: banquet .. replicator), dipisah dari ac_city.js. Urutan entri sama persis.
export const actions_cityPart4 = {
        banquet: {
            id: 'city-banquet',
            title: loc('city_banquet'),
            desc: loc(`city_banquet_desc`),
            category: 'commercial',
            reqs: { banquet:1 },
            queue_complete(){ return global.stats.achieve['endless_hunger'] ? global.stats.achieve['endless_hunger'].l - global.city['banquet'].level : 0},
            no_multi: true,
            condition(){
                return global.stats.achieve['endless_hunger'] && global.stats.achieve['endless_hunger'].l >= 1 ? true : false;
            },
            cost: {
                Money(offset){
                    const level = (offset ? offset : 0) + (global.city['banquet'] ? global.city['banquet'].level : 0);
                    switch (level){
                        case 0:
                            return 45000;
                        case 1:
                            return 180000;
                        case 2:
                            return 2400000;
                        case 3:
                            return 30000000;
                        case 4:
                            return 140000000;
                        default:
                            return 0;
                    }
                },
                Food(offset){
                    const level = (offset ? offset : 0) + (global.city['banquet'] ? global.city['banquet'].level : 0);
                    return (() => {
                        switch (level){
                            case 0:
                                return 40000;
                            case 1:
                                return 124000;
                            case 2:
                                return 300000;
                            case 3:
                                return 720000;
                            case 4:
                                return 1200000;
                            default:
                                return 0;
                        }
                    })() * (global.race['artifical'] ? 0.25 : 1);
                },
                Brick(offset){ 
                    const level = (offset ? offset : 0) + (global.city['banquet'] ? global.city['banquet'].level : 0);
                    switch (level){
                        case 0:
                            return 1600;
                        case 1:
                            return 18000;
                        case 2:
                            return 75000;
                        default:
                            return 0;
                    }
                },
                Wrought_Iron(offset){
                    const level = (offset ? offset : 0) + (global.city['banquet'] ? global.city['banquet'].level : 0);
                    switch (level){
                        case 0:
                            return 0;
                        case 1:
                            return 26000;
                        case 2:
                            return 88000;
                        case 3:
                            return 144000;
                        case 4:
                            return 240000;
                        default:
                            return 0;
                    }
                },
                Iridium(offset){
                    const level = (offset ? offset : 0) + (global.city['banquet'] ? global.city['banquet'].level : 0);
                    switch (level){
                        case 2:
                            return 50000;
                        case 3:
                            return 270000;
                        case 4:
                            return 700000;
                        default:
                            return 0;
                    }
                },
                Aerogel(offset, wiki){
                    const level = (offset ? offset : 0) + (global.city['banquet'] ? global.city['banquet'].level : 0);
                    if(wiki ? wiki.truepath : global.race['truepath']){
                        return 0;
                    }
                    switch (level){
                        case 3:
                            return 40000;
                        case 4:
                            return 150000;
                        default:
                            return 0;
                    }
                },
                Quantium(offset, wiki){
                    const level = (offset ? offset : 0) + (global.city['banquet'] ? global.city['banquet'].level : 0);
                    if(wiki ? !wiki.truepath : !global.race['truepath']){
                        return 0;
                    }
                    switch (level){
                        case 3:
                            return 40000;
                        case 4:
                            return 150000;
                        default:
                            return 0;
                    }
                },
                Bolognium(offset){
                    const level = (offset ? offset : 0) || (global.city['banquet'] ? global.city['banquet'].level : 0);
                    switch (level){
                        case 4:
                            return 150000;
                        default:
                            return 0;
                    }
                }
            },
            effect(wiki){
                let strength = global.city['banquet'] ? global.city['banquet'].strength : 0;
                let level = (wiki?.count ?? 0) + (global.city['banquet'] ? global.city['banquet'].level : 0);
                let desc = `<div>Strength: <span class="has-text-caution">${strength}</span></div>`;
                desc += `<div>${loc(`city_banquet_effect1`, [sizeApproximation(((level >= 5 ? 1.02 : 1.022)**(strength) - 1) * 100)])}</div>`;
                if(level >= 1){
                    desc += `<div>${loc(`city_banquet_effect2`, [(strength**0.75).toFixed(2)])}</div>`;
                }
                if(level >= 2){
                    desc += `<div>${loc(`city_banquet_effect3`, [(strength**0.65).toFixed(2)])}</div>`;
                }
                if(level >= 3){
                    desc += `<div>${loc(`city_banquet_effect4`, [(strength**0.65).toFixed(2)])}</div>`;
                }
                if(level >= 4){
                    desc += `<div>${loc(`city_banquet_effect5`, [(strength**0.75).toFixed(2)])}</div>`;
                }
                return desc;
            },
            powered(){ return 0; },
            action(args){
                if (global.city['banquet'].level < global.stats.achieve['endless_hunger'].l && payCosts($(this)[0])){
                    incrementStruct('banquet','city');
                    global.city['banquet'].level++;
                    if(global.city['banquet'].level === 1){
                        global.city['banquet'].on = 1;
                    }
                    global.city['banquet'].count = 1; //banquet hall can be powered on once at most
                    drawCity();
                    return true;
                }
                return false;
            },
            count(){ return global.city['banquet'].level },
            struct(){
                return {
                    d: { count: 0, on: 0, strength: 0, level: 0 },
                    p: ['banquet','city']
                };
            },
            flair: loc('city_banquet_flair')
        },
        university: {
            id: 'city-university',
            title: loc('city_university'),
            desc(){
                let planet = races[global.race.species].home;
                return loc('city_university_desc',[planet]);
            },
            category: 'science',
            reqs: { science: 1 },
            not_trait: ['cataclysm','lone_survivor'],
            cost: {
                Money(offset){ return costMultiplier('university', offset, 900, 1.5) - 500; },
                Lumber(offset){ return costMultiplier('university', offset, 500, 1.36) - 200; },
                Stone(offset){ return costMultiplier('university', offset, 750, 1.36) - 350; },
                Crystal(offset){ return global.race.universe === 'magic' ? costMultiplier('university', offset, 5, 1.36) : 0; },
                Iron(offset){ return ((global.city['university'] ? global.city.university.count : 0) + (offset || 0)) >= 3 && global.city.ptrait.includes('unstable') ? costMultiplier('university', offset, 25, 1.36) : 0; }
            },
            effect(wiki){
                let gain = +($(this)[0].knowVal(wiki)).toFixed(0);
                return `<div>${loc('city_university_effect',[jobScale(1)])}</div><div>${loc('city_max_knowledge',[gain.toLocaleString()])}</div>`;
            },
            knowVal(wiki){
                let multiplier = 1;
                let base = global.tech['science'] && global.tech['science'] >= 8 ? 700 : 500;
                if (global.city.ptrait.includes('permafrost')){
                    base += planetTraits.permafrost.vars()[1];
                }
                if (global.tech['science'] >= 4){
                    multiplier += global.city.library.count * 0.02;
                }
                if (global.space['observatory'] && global.space.observatory.count > 0){
                    multiplier += (wiki ? global.space.observatory.on : support_on['observatory']) * 0.05;
                }
                if (global.portal['sensor_drone'] && global.tech['science'] >= 14){
                    multiplier += (wiki ? global.portal.sensor_drone.on : p_on['sensor_drone']) * 0.02;
                }
                if (global.race['hard_of_hearing']){
                    multiplier *= 1 - (traits.hard_of_hearing.vars()[0] / 100);
                }
                if (global.race['curious']){
                    multiplier *= 1 + (traits.curious.vars()[0] / 100 * global.resource[global.race.species].amount);
                }
                let fathom = fathomCheck('cath');
                if (fathom > 0){
                    multiplier *= 1 + (traits.curious.vars(3)[0] * fathom);
                }
                let sg_on = isStargateOn(wiki);
                let num_tech_scavs_on = sg_on ? (wiki ? (global.galaxy?.scavenger?.on ?? 0) : gal_on['scavenger']) : 0;
                if (num_tech_scavs_on > 0){
                    let pirate_alien2 = piracy('gxy_alien2', false, false, wiki);
                    let uni = num_tech_scavs_on * pirate_alien2 / 4;
                    multiplier *= 1 + uni;
                }
                let teachVal = govActive('teacher',0);
                if (teachVal){
                    multiplier *= 1 + (teachVal / 100);
                }
                let athVal = govActive('athleticism',2);
                if (athVal){
                    multiplier *= 1 - (athVal / 100);
                }
                if (shrineBonusActive()){
                    let shrineBonus = getShrineBonus('know');
                    multiplier *= shrineBonus.mult;
                }
                let gain = (base * multiplier);
                if (global.tech['supercollider']){
                    let ratio = global.tech['tp_particles'] || (global.tech['particles'] && global.tech.particles >= 3) ? 12.5: 25;
                    gain *= (global.tech['supercollider'] / ratio) + 1;
                }
                if (global.race['orbit_decayed']){
                    if (global.space['satellite']){
                        gain *= 1 + (global.space.satellite.count * 0.12);
                    }
                    if (global.tech['biotech'] && global.tech['biotech'] >= 1){
                        gain *= 2;
                    }
                }
                return gain;
            },
            action(args){
                if (payCosts($(this)[0])){
                    let gain = global.tech['science'] && global.tech['science'] >= 8 ? 700 : 500;
                    if (global.tech['science'] >= 4){
                        gain *= 1 + (global.city.library.count * 0.02);
                    }
                    if (global.tech['supercollider']){
                        let ratio = global.tech['particles'] && global.tech['particles'] >= 3 ? 12.5: 25;
                        gain *= (global.tech['supercollider'] / ratio) + 1;
                    }
                    global['resource']['Knowledge'].max += gain;
                    incrementStruct('university','city');
                    global.civic.professor.display = true;
                    global.civic.professor.max = jobScale(global.city.university.count);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['university','city']
                };
            }
        },
        library: {
            id: 'city-library',
            title: loc('city_library'),
            desc(){
                let planet = races[global.race.species].home;
                return loc('city_library_desc',[planet]);
            },
            category: 'science',
            reqs: { science: 2 },
            not_trait: ['cataclysm','lone_survivor'],
            cost: {
                Money(offset){ return costMultiplier('library', offset, 45, 1.2); },
                Crystal(offset){ return global.race.universe === 'magic' ? costMultiplier('library', offset, 2, 1.2) : 0; },
                Iron(offset){ return global.city.ptrait.includes('unstable') ? costMultiplier('library', offset, 4, 1.2) : 0; },
                Furs(offset){ return costMultiplier('library', offset, 22, 1.2); },
                Plywood(offset){ return costMultiplier('library', offset, 20, 1.2); },
                Brick(offset){ return costMultiplier('library', offset, 15, 1.2); }
            },
            effect(){
                let gain = 125;
                if (global.race['nearsighted']){
                    gain *= 1 - (traits.nearsighted.vars()[0] / 100);
                }
                if (global.race['studious']){
                    gain *= 1 + (traits.studious.vars()[1] / 100);
                }
                let fathom = fathomCheck('elven');
                if (fathom > 0){
                    gain *= 1 + (traits.studious.vars(1)[1] / 100 * fathom);
                }
                if (global.tech['science'] && global.tech['science'] >= 8){
                    gain *= 1.4;
                }
                if (global.tech['anthropology'] && global.tech['anthropology'] >= 2){
                    gain *= 1 + (faithTempleCount() * 0.05);
                }
                if (global.tech['science'] && global.tech['science'] >= 5){
                    let sci_val = workerScale(global.civic.scientist.workers,'scientist');
                    if (global.race['high_pop']){
                        sci_val = highPopAdjust(sci_val);
                    }
                    gain *= 1 + (sci_val * 0.12);
                }
                let teachVal = govActive('teacher',0);
                if (teachVal){
                    gain *= 1 + (teachVal / 100);
                }
                let athVal = govActive('athleticism',2);
                if (athVal){
                    gain *= 1 - (athVal / 100);
                }
                let muckVal1 = govActive('muckraker',1);
                if (muckVal1){
                    gain *= 1 + (muckVal1 / 100);
                }
                gain = +(gain).toFixed(0);
                let muckVal2 = govActive('muckraker',2);
                let know = muckVal2 ? (5 - muckVal2) : 5;
                if (global.race['autoignition']){
                    know -= traits.autoignition.vars()[0];
                    if (know < 0){
                        know = 0;
                    }
                }
                return `<div>${loc('city_max_knowledge',[gain.toLocaleString()])}</div><div>${loc('city_library_effect',[know])}</div>`;
            },
            action(args){
                if (payCosts($(this)[0])){
                    let gain = 125;
                    if (global.race['nearsighted']){
                        gain *= 1 - (traits.nearsighted.vars()[0] / 100);
                    }
                    if (global.tech['science'] && global.tech.science >= 8){
                        gain *= 1.4;
                    }
                    if (global.tech['anthropology'] && global.tech.anthropology >= 2){
                        gain *= 1 + (faithTempleCount() * 0.05);
                    }
                    if (global.tech['science'] && global.tech.science >= 5){
                        gain *= 1 + (workerScale(global.civic.scientist.workers,'scientist') * 0.12);
                    }
                    gain = +(gain).toFixed(1);
                    global['resource']['Knowledge'].max += gain;
                    incrementStruct('library','city');
                    if (global.tech['science'] && global.tech.science >= 3){
                        global.civic.professor.impact = 0.5 + (global.city.library.count * 0.01)
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['library','city']
                };
            },
            flair: loc('city_library_flair')
        },
        wardenclyffe: {
            id: 'city-wardenclyffe',
            title(){ return wardenLabel(); },
            desc: loc('city_wardenclyffe_desc'),
            category: 'science',
            reqs: { high_tech: 1 },
            not_trait: ['cataclysm','lone_survivor'],
            cost: {
                Money(offset){ return costMultiplier('wardenclyffe', offset, 5000, 1.22); },
                Knowledge(offset){ return costMultiplier('wardenclyffe', offset, global.race['logical'] ? (1000 - traits.logical.vars()[0]) : 1000, 1.22); },
                Crystal(offset){ return global.race.universe === 'magic' ? costMultiplier('wardenclyffe', offset, 100, 1.22) : 0; },
                Copper(offset){ return costMultiplier('wardenclyffe', offset, 500, 1.22); },
                Iron(offset){ return global.city.ptrait.includes('unstable') ? costMultiplier('wardenclyffe', offset, 75, 1.22) : 0; },
                Cement(offset){ return costMultiplier('wardenclyffe', offset, 350, 1.22); },
                Sheet_Metal(offset){ return costMultiplier('wardenclyffe', offset, 125, 1.2); },
                Nanite(offset){ return global.race['deconstructor'] ? costMultiplier('wardenclyffe', offset, 50, 1.18) : 0; },
            },
            effect(){
                let gain = 1000;
                if (global.city.ptrait.includes('magnetic')){
                    gain += planetTraits.magnetic.vars()[1];
                }
                if (global.tech['supercollider']){
                    let ratio = global.tech['particles'] && global.tech['particles'] >= 3 ? 12.5: 25;
                    gain *= (global.tech['supercollider'] / ratio) + 1;
                }
                if (global.space['satellite']){
                    gain *= 1 + (global.space.satellite.count * 0.04);
                }
                let athVal = govActive('athleticism',2);
                if (athVal){
                    gain *= 1 - (athVal / 100);
                }
                gain = +(gain).toFixed(0);

                let desc = `<div>${loc('city_wardenclyffe_effect1',[jobScale(1),global.civic.scientist ? global.civic.scientist.name : loc('job_scientist')])}</div><div>${loc('city_max_knowledge',[gain.toLocaleString()])}</div>`;
                if (global.city.powered){
                    let pgain = global.tech['science'] >= 7 ? 2500 : 2000;
                    if (global.city.ptrait.includes('magnetic')){
                        pgain += planetTraits.magnetic.vars()[1];
                    }
                    if (global.space['satellite']){
                        pgain *= 1 + (global.space.satellite.count * 0.04);
                    }
                    if (global.tech['supercollider']){
                        let ratio = global.tech['particles'] && global.tech['particles'] >= 3 ? 12.5: 25;
                        pgain *= (global.tech['supercollider'] / ratio) + 1;
                    }
                    let athVal = govActive('athleticism',2);
                    if (athVal){
                        pgain *= 1 - (athVal / 100);
                    }
                    pgain = +(pgain).toFixed(1);
                    if (global.tech.science >= 15){
                        desc = desc + `<div>${loc('city_wardenclyffe_effect4',[2])}</div>`;
                    }
                    if (global.race.universe === 'magic'){
                        let mana = spatialReasoning(8);
                        desc = desc + `<div>${loc('plus_max_resource',[mana,global.resource.Mana.name])}</div>`;
                    }
                    if (global.tech['broadcast']){
                        let morale = global.tech['broadcast'];
                        desc = desc + `<div class="has-text-caution">${loc('city_wardenclyffe_effect3',[$(this)[0].powered(),pgain.toLocaleString(),morale])}</div>`
                    }
                    else {
                        desc = desc + `<div class="has-text-caution">${loc('city_wardenclyffe_effect2',[$(this)[0].powered(),pgain.toLocaleString()])}</div>`;
                    }
                    if (global.race['artifical']){
                        desc = desc + `<div class="has-text-caution">${loc('city_transmitter_effect',[spatialReasoning(250)])}</div`;
                    }
                }
                return desc;
            },
            powered(){ return powerCostMod(2); },
            action(args){
                if (payCosts($(this)[0])){
                    let gain = 1000;
                    incrementStruct('wardenclyffe','city');
                    global.civic.scientist.display = true;
                    global.civic.scientist.max += jobScale(1);
                    if (powerOnNewStruct($(this)[0])){
                        gain = global.tech['science'] >= 7 ? 2500 : 2000;
                    }
                    if (global.tech['supercollider']){
                        let ratio = global.tech['particles'] && global.tech['particles'] >= 3 ? 12.5: 25;
                        gain *= (global.tech['supercollider'] / ratio) + 1;
                    }
                    global['resource']['Knowledge'].max += gain;
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['wardenclyffe','city']
                };
            },
            flair(){ return global.race.universe === 'magic' ? `<div>${loc('city_wizard_tower_flair')}</div>` :  (global.race['evil'] ? `<div>${loc('city_babel_flair')}</div>` : `<div>${loc('city_wardenclyffe_flair1')}</div><div>${loc('city_wardenclyffe_flair2')}</div>`); }
        },
        biolab: {
            id: 'city-biolab',
            title: loc('city_biolab'),
            desc: `<div>${loc('city_biolab_desc')}</div><div class="has-text-special">${loc('requires_power')}</div>`,
            category: 'science',
            reqs: { genetics: 1 },
            not_trait: ['cataclysm','lone_survivor'],
            cost: {
                Money(offset){ return costMultiplier('biolab', offset, 25000, 1.3); },
                Knowledge(offset){ return costMultiplier('biolab', offset, 5000, 1.3); },
                Copper(offset){ return costMultiplier('biolab', offset, 1250, 1.3); },
                Iron(offset){ return global.city.ptrait.includes('unstable') ? costMultiplier('biolab', offset, 160, 1.3) : 0; },
                Alloy(offset){ return costMultiplier('biolab', offset, 350, 1.3); }
            },
            effect(wiki){
                let gain = 3000;
                if (global.portal['sensor_drone'] && global.tech['science'] >= 14){
                    gain *= 1 + (wiki ? global.portal.sensor_drone.on : p_on['sensor_drone']) * 0.02;
                }
                if (global.tech['science'] >= 20){
                    gain *= 3;
                }
                if (global.tech['science'] >= 21){
                    gain *= 1.45;
                }
                if (global.tech['biotech'] >= 1){
                    gain *= 2.5;
                }
                if (global.race['elemental'] && traits.elemental.vars()[0] === 'frost'){
                    gain *= 1 + (traits.elemental.vars()[4] * global.resource[global.race.species].amount / 100);
                }
                gain = +(gain).toFixed(0);
                return `<span>${loc('city_max_knowledge',[gain.toLocaleString()])}</span>, <span class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</span>`;
            },
            powered(){ return powerCostMod(2); },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('biolab','city');
                    if (powerOnNewStruct($(this)[0])){
                        global.resource.Knowledge.max += 3000;
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['biolab','city']
                };
            }
        },
        coal_power: {
            id: 'city-coal_power',
            title(){
                return global.race['environmentalist'] ? loc('city_hydro_power') : loc(global.race.universe === 'magic' ? 'city_mana_engine' : 'city_coal_power');
            },
            desc(){
                return global.race['environmentalist']
                    ? `<div>${loc('city_hydro_power_desc')}</div>`
                    : `<div>${loc(global.race.universe === 'magic' ? 'city_mana_engine_desc' : 'city_coal_power_desc')}</div><div class="has-text-special">${loc('requires_res',[loc(global.race.universe === 'magic' ? 'resource_Mana_name' : 'resource_Coal_name')])}</div>`;
            },
            category: 'utility',
            reqs: { high_tech: 2 },
            not_trait: ['cataclysm','lone_survivor'],
            cost: {
                Money(offset){ return costMultiplier('coal_power', offset, 10000, dirt_adjust(1.22)); },
                Crystal(offset){ return global.race.universe === 'magic' ? costMultiplier('coal_power', offset, 125, dirt_adjust(1.22)) : 0; },
                Copper(offset){ return costMultiplier('coal_power', offset, 1800, dirt_adjust(1.22)) - 1000; },
                Iron(offset){ return global.city.ptrait.includes('unstable') ? costMultiplier('coal_power', offset, 175, dirt_adjust(1.22)) : 0; },
                Cement(offset){ return costMultiplier('coal_power', offset, 600, dirt_adjust(1.22)); },
                Steel(offset){ return costMultiplier('coal_power', offset, 2000, dirt_adjust(1.22)) - 1000; }
            },
            effect(){
                let consume = global.race.universe === 'magic' ? 0.05 : 0.35;
                let power = -($(this)[0].powered());
                return global.race['environmentalist'] ? `+${power}MW` : `<span>+${power}MW.</span> <span class="has-text-caution">${loc(global.race.universe === 'magic' ? 'city_mana_engine_effect' : 'city_coal_power_effect',[consume])}</span>`;
            },
            powered(wiki){
                let power = global.stats.achieve['dissipated'] && global.stats.achieve['dissipated'].l >= 1 ? -6 : -5;
                if (!wiki && global.race['environmentalist']){
                    power -= traits.environmentalist.vars()[0];
                }
                let dirt = govActive('dirty_jobs',1);
                if (dirt){ power -= dirt; }
                return powerModifier(power);
            },
            p_fuel(){
                if (global.race.universe === 'magic'){
                    return { r: 'Mana', a: global.race['environmentalist'] ? 0 : 0.05 };
                }
                else {
                    return { r: 'Coal', a: global.race['environmentalist'] ? 0 : 0.35 };
                }
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('coal_power','city');
                    global.city.coal_power.on++;
                    global.city.power += 5;
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['coal_power','city']
                };
            },
        },
        oil_power: {
            id: 'city-oil_power',
            title(){
                return global.race['environmentalist'] ? loc('city_wind_power') : loc('city_oil_power');
            },
            desc(){
                return global.race['environmentalist']
                    ? `<div>${loc('city_wind_power_desc')}</div>`
                    : `<div>${loc('city_oil_power_desc')}</div><div class="has-text-special">${loc('requires_res',[global.resource.Oil.name])}</div>`
            },
            category: 'utility',
            reqs: { oil: 3 },
            not_trait: ['cataclysm','lone_survivor'],
            cost: {
                Money(offset){ return costMultiplier('oil_power', offset, 50000, dirt_adjust(1.22)); },
                Copper(offset){ return costMultiplier('oil_power', offset, 6500, dirt_adjust(1.22)) + 1000; },
                Iron(offset){ return global.city.ptrait.includes('unstable') ? costMultiplier('oil_power', offset, 180, dirt_adjust(1.22)) : 0; },
                Aluminium(offset){ return costMultiplier('oil_power', offset, 12000, dirt_adjust(1.22)); },
                Cement(offset){ return costMultiplier('oil_power', offset, 5600, dirt_adjust(1.22)) + 1000; }
            },
            effect(){
                let consume = 0.65;
                let power = -($(this)[0].powered());
                return global.race['environmentalist'] ? `+${power}MW` : `<span>+${power}MW.</span> <span class="has-text-caution">${loc('city_oil_power_effect',[consume])}</span>`;
            },
            powered(wiki){
                let power = 0;
                if (global.stats.achieve['dissipated'] && global.stats.achieve['dissipated'].l >= 3){
                    power = global.stats.achieve['dissipated'].l >= 5 ? -8 : -7;
                }
                else {
                    power = -6;
                }
                if (!wiki && global.race['environmentalist']){
                    power -= traits.environmentalist.vars()[0];
                    if (global.city.calendar.wind === 1){
                        power -= 1;
                    }
                    else {
                        power += 1;
                    }
                }
                let dirt = govActive('dirty_jobs',1);
                if (dirt){ power -= dirt; }
                return powerModifier(power);
            },
            p_fuel(){ return { r: 'Oil', a: global.race['environmentalist'] ? 0 : 0.65 }; },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('oil_power','city');
                    global.city.oil_power.on++;
                    global.city.power += 6;
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['oil_power','city']
                };
            },
        },
        fission_power: {
            id: 'city-fission_power',
            title: loc('city_fission_power'),
            desc(){ return `<div>${loc('city_fission_power_desc')}</div><div class="has-text-special">${loc('requires_res',[global.resource.Uranium.name])}</div>`; },
            category: 'utility',
            reqs: { high_tech: 5 },
            not_trait: ['cataclysm','lone_survivor'],
            cost: {
                Money(offset){ return costMultiplier('fission_power', offset, 250000, 1.36); },
                Copper(offset){ return costMultiplier('fission_power', offset, 13500, 1.36); },
                Iron(offset){ return global.city.ptrait.includes('unstable') ? costMultiplier('fission_power', offset, 1750, 1.36) : 0; },
                Cement(offset){ return costMultiplier('fission_power', offset, 10800, 1.36); },
                Titanium(offset){ return costMultiplier('fission_power', offset, 7500, 1.36); }
            },
            effect(){
                let consume = 0.1;
                return `<span>+${-($(this)[0].powered())}MW.</span> <span class="has-text-caution">${loc('city_fission_power_effect',[consume])}</span>`;
            },
            powered(){ return powerModifier(global.tech['uranium'] >= 4 ? -18 : -14); },
            p_fuel(){ return { r: 'Uranium', a: 0.1 }; },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('fission_power','city');
                    global.city.fission_power.on++;
                    global.city.power += 14;
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['fission_power','city']
                };
            },
        },
        mass_driver: {
            id: 'city-mass_driver',
            title: loc('city_mass_driver'),
            desc: `<div>${loc('city_mass_driver_desc')}</div><div class="has-text-special">${loc('requires_power')}</div>`,
            category: 'utility',
            reqs: { mass: 1 },
            not_trait: ['cataclysm','lone_survivor'],
            cost: {
                Money(offset){ return costMultiplier('mass_driver', offset, 375000, 1.32); },
                Copper(offset){ return costMultiplier('mass_driver', offset, 33000, 1.32); },
                Iron(offset){ return costMultiplier('mass_driver', offset, 42500, 1.32); },
                Iridium(offset){ return costMultiplier('mass_driver', offset, 2200, 1.32); }
            },
            effect(){
                let exo = global.tech.mass >= 2 ? `<div>${loc('city_mass_driver_effect2',[1,global.civic.scientist.name])}</div>` : '';
                return `${exo}<span>${loc('city_mass_driver_effect',[global.race['truepath'] ? 6 : 5,flib('name')])}</span> <span class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</span>`;
            },
            powered(){
                let power = global.stats.achieve['dissipated'] && global.stats.achieve['dissipated'].l >= 4 ? 4 : 5;
                return powerCostMod(global.tech.mass >= 2 ? power - 1 : power);
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('mass_driver','city');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['mass_driver','city']
                };
            }
        },
        replicator: {
            id: 'city-replicator',
            title: loc('tech_replicator'),
            desc: loc('tech_replicator'),
            category: 'utility',
            reqs: { special_hack: 1 },
            cost: {},
            wiki: false,
            effect(){
                return 'fake structure';
            },
            powered(){
                return 1;
            },
            action(args){
                return false;
            }
        },
};
