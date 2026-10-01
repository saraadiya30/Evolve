import { global, p_on } from '../core/vars.js';
import { darkEffect } from '../functions/power_modifiers.js';
import { getHalloween } from '../functions/event_dates.js';
import { loc } from '../core/locale.js';
import { highPopAdjust } from '../functions/adjusters_basic.js';
import { racialTrait } from '../races/trait_logic/racial_traits.js';
import { races, traits } from '../core/registries.js';
import { biomes } from '../races/races.js';
import { fathomCheck } from '../races/trait_logic/fathom_check.js';
import { planetName } from '../space/planet_generation.js';
import { hellSupression } from '../portal/mech/hellguard.js';
import { asphodelResist } from '../edenic/edenic.js';
import { actions } from '../core/registries.js';
import { templeCount } from '../actions/core/action_costs.js';
import { workerScale, jobName, teamsterCap, farmerValue } from './jobs/job_definitions.js';
import { jobScale } from './jobs/job_scale.js';
export { defineJobs, workerScale, setJobName, jobName, loadServants, teamsterCap, craftsmanCap, limitCraftsmen, farmerValue } from './jobs/job_definitions.js';
export { jobScale } from './jobs/job_scale.js';
export { loadFoundry } from './jobs/foundry_panel.js';

export const job_desc = {
    unemployed: function(servant){
        let desc = loc('job_unemployed_desc');
        if (global.civic.d_job === 'unemployed' && !servant){
            desc = desc + ' ' + loc('job_default',[loc('job_unemployed')]);
        }
        return desc;
    },
    hunter: function(servant){
        let desc = loc('job_hunter_desc',[global.resource.Food.name]);
        if (global.race['unfathomable']){
            desc = loc('job_eld_hunter_desc');
        }
        if (global.race['artifical']){
            desc = global.race['soul_eater'] ? loc('job_art_demon_hunter_desc',[global.resource.Furs.name, global.resource.Lumber.name]) : loc('job_art_hunter_desc',[global.resource.Furs.name]);
        }
        else if (global.race['soul_eater'] && global.race.species !== 'wendigo'){
            desc = loc(global.race['evil'] ? 'job_evil_hunter_desc' : 'job_not_evil_hunter_desc',[global.resource.Food.name,global.resource.Lumber.name,global.resource.Furs.name]);
        }
        if (global.civic.d_job === 'hunter' && !servant){
            desc = desc + ' ' + loc('job_default',[global.race['unfathomable'] ? loc('job_raider') : jobName('hunter')]);
        }
        return desc;
    },
    forager: function(servant){
        let desc = loc(`job_forager_desc`);
        if (global.civic.d_job === 'forager' && !servant){
            desc = desc + ' ' + loc('job_default',[jobName('forager')]);
        }
        return desc;
    },
    farmer: function(servant){
        let farmer = +farmerValue(true,servant).toFixed(2);
        let farmhand = +farmerValue(false,servant).toFixed(2);
        if (!servant){
            farmer = +workerScale(farmer,'farmer').toFixed(2);
            farmhand = +workerScale(farmhand,'farmer').toFixed(2);
        }
        let desc = global.race['high_pop'] && !servant
            ? loc('job_farmer_desc_hp',[farmer,global.resource.Food.name,jobScale(1),farmhand,jobScale(1) * global.city.farm.count])
            : loc('job_farmer_desc',[farmer,global.resource.Food.name,global.city.farm.count,farmhand]);
        if (global.civic.d_job === 'farmer' && !servant){
            desc = desc + ' ' + loc('job_default',[jobName('farmer')]);
        }
        return desc;
    },
    lumberjack: function(servant){
        let workers = servant && global.race['servants'] ? global.race.servants.jobs.lumberjack : global.civic.lumberjack.workers;
        let impact = global.civic.lumberjack.impact;
        if (!servant){
            workers = +workerScale(workers,'lumberjack').toFixed(2);
            impact = +workerScale(impact,'lumberjack').toFixed(2);
        }
        if (global.race['evil'] && (!global.race['soul_eater'] || global.race.species === 'wendigo')){
            let multiplier = 1;
            if (!servant){
                multiplier *= racialTrait(workers,'lumberjack');
            }
            let bone = +(impact * multiplier).toFixed(2);
            let flesh = +(impact / 4 * multiplier).toFixed(2);
            let desc = global.race.species === 'wendigo' ? loc('job_reclaimer_desc2',[bone]) : loc('job_reclaimer_desc',[bone,flesh]);
            if (global.civic.d_job === 'lumberjack' && !servant){
                desc = desc + ' ' + loc('job_default',[jobName('reclaimer')]);
            }
            return desc;
        }
        else {
            let multiplier = (global.tech['axe'] && global.tech['axe'] > 0 ? (global.tech['axe'] - 1) * 0.35 : 0) + 1;
            if (!servant){
                multiplier *= racialTrait(workers,'lumberjack');
            }
            if (global.city.biome === 'forest'){
                impact *= biomes.forest.vars()[0];
            }
            if (global.city.biome === 'savanna'){
                impact *= biomes.savanna.vars()[2];
            }
            if (global.city.biome === 'desert'){
                impact *= biomes.desert.vars()[2];
            }
            if (global.city.biome === 'swamp'){
                impact *= biomes.swamp.vars()[2];
            }
            if (global.city.biome === 'taiga'){
                impact *= biomes.taiga.vars()[0];
            }
            let gain = +(impact * multiplier).toFixed(2);
            let desc = loc('job_lumberjack_desc',[gain,global.resource.Lumber.name]);
            if (global.civic.d_job === 'lumberjack' && !servant){
                desc = desc + ' ' + loc('job_default',[jobName('lumberjack')]);
            }
            let hallowed = getHalloween();
            if (hallowed.active){
                desc = desc + ` <span class="has-text-special">${loc('events_halloween_lumberjack')}</span> `;
            }
            return desc;
        }
    },
    quarry_worker: function(servant){
        let workers = servant && global.race['servants'] ? global.race.servants.jobs.quarry_worker : global.civic.quarry_worker.workers;
        let impact = global.civic.quarry_worker.impact;
        if (!servant){
            workers = +workerScale(workers,'quarry_worker').toFixed(2);
            impact = +workerScale(impact,'quarry_worker').toFixed(2);
        }
        let multiplier = (global.tech['hammer'] && global.tech['hammer'] > 0 ? global.tech['hammer'] * 0.4 : 0) + 1;
        if (!servant){
            multiplier *= racialTrait(workers,'miner');
        }
        if (global.city.biome === 'desert'){
            multiplier *= biomes.desert.vars()[0];
        }
        if (global.city.biome === 'swamp'){
            multiplier *= biomes.swamp.vars()[3];
        }
        if (global.tech['explosives'] && global.tech['explosives'] >= 2){
            multiplier *= global.tech['explosives'] >= 3 ? 1.75 : 1.5;
        }
        let gain = +(impact * multiplier).toFixed(1);
        let desc = global.resource.Aluminium.display ? loc('job_quarry_worker_desc2',[gain, global.resource.Stone.name,global.resource.Aluminium.name]) : loc('job_quarry_worker_desc1',[gain,global.resource.Stone.name]);
        if (global.race['smoldering']){
            desc = desc + ' ' + loc('job_quarry_worker_smoldering',[global.resource.Chrysotile.name]);
        }
        if (global.civic.d_job === 'quarry_worker' && !servant){
            desc = desc + ' ' + loc('job_default',[jobName('quarry_worker')]);
        }
        return desc;
    },
    crystal_miner: function(servant){
        let workers = servant && global.race['servants'] ? global.race.servants.jobs.crystal_miner : global.civic.crystal_miner.workers;
        let impact = global.civic.crystal_miner.impact;
        let multiplier = 1;
        if (!servant){
            workers = +workerScale(workers,'crystal_miner').toFixed(2);
            impact = +workerScale(impact,'crystal_miner').toFixed(2);
            multiplier *= racialTrait(workers,'miner');
        }
        let gain = +(impact * multiplier).toFixed(2);
        let desc = loc('job_crystal_miner_desc',[gain,global.resource.Crystal.name]);
        if (global.civic.d_job === 'crystal_miner' && !servant){
            desc = desc + ' ' + loc('job_default',[jobName('crystal_miner')]);
        }
        return desc;
    },
    scavenger: function(servant){
        let scavenger = traits.scavenger.vars()[0];
        if (global.city.ptrait.includes('trashed') && global.race['scavenger']){
            scavenger *= 1 + (traits.scavenger.vars()[1] / 100);
        }
        if (global.race['high_pop'] && !servant){
            scavenger *= traits.high_pop.vars()[1] / 100;
        }
        if (!servant){
            scavenger = +workerScale(scavenger,'scavenger').toFixed(2);
        }
        let desc = loc('job_scavenger_desc',[races[global.race.species].home,scavenger]);
        if (global.civic.d_job === 'scavenger' && !servant){
            desc = desc + ' ' + loc('job_default',[jobName('scavenger')]);
        }
        return desc;
    },
    teamster: function(servant){
        let desc = loc('job_teamster_desc',[teamsterCap()]);
        if (global.civic.d_job === 'teamster' && !servant){
            desc = desc + ' ' + loc('job_default',[jobName('teamster')]);
        }
        return desc;
    },
    meditator: function(servant){
        let desc = loc('job_meditator_desc');
        if (global.civic.d_job === 'meditator' && !servant){
            desc = desc + ' ' + loc('job_default',[jobName('meditator')]);
        }
        return desc;
    },
    torturer: function(){
        return loc('job_torturer_desc');
    },
    miner: function(){
        if (global.race['warlord']){
            return loc('job_dig_demon_desc');
        }
        else if (global.tech['mining'] >= 3){
            return global.race['sappy'] && global.tech['alumina'] ? loc('job_miner_desc2_amber') : loc('job_miner_desc2');
        }
        else {
            return loc('job_miner_desc1');
        }
    },
    coal_miner: function(){
        if (global.tech['uranium']){
            return loc('job_coal_miner_desc2');
        }
        else {
            return loc('job_coal_miner_desc1');
        }
    },
    craftsman: function(){
        return loc('job_craftsman_desc');
    },
    cement_worker: function(){
        let unit_price = global.race['high_pop'] ? 3 / traits.high_pop.vars()[0] : 3;
        if (global.city.biome === 'ashland'){
            unit_price *= biomes.ashland.vars()[1];
        }
        unit_price = +workerScale(unit_price,'cement_worker').toFixed(2);
        let worker_impact = +workerScale(global.civic.cement_worker.impact,'cement_worker').toFixed(2);
        let impact = global.tech['cement'] >= 4 ? (global.tech.cement >= 7 ? 1.45 : 1.2) : 1;
        let cement_multiplier = racialTrait(global.civic.cement_worker.workers,'factory');
        let gain = worker_impact * impact * cement_multiplier;
        if (global.city.biome === 'ashland'){
            gain *= biomes.ashland.vars()[1];
        }
        gain = +(gain).toFixed(2);
        return global.race['sappy'] ? loc('job_cement_worker_amber_desc',[gain]) : loc('job_cement_worker_desc',[gain,unit_price]);
    },
    banker: function(){
        let interest = +workerScale(global.civic.banker.impact,'banker').toFixed(2) * 100;
        if (global.tech['banking'] >= 10){
            interest += 2 * global.tech['stock_exchange'];
        }
        if (global.race['truthful']){
            interest *= 1 - (traits.truthful.vars()[0] / 100);
        }
        if (global.civic.govern.type === 'republic'){
            interest *= 1.25;
        }
        if (global.race['high_pop']){
            interest *= traits.high_pop.vars()[1] / 100;
        }
        interest = +(interest).toFixed(0);
        if(global.race['fasting']){
            return loc('job_banker_desc_fasting');
        }
        return loc('job_banker_desc',[interest]);
    },
    entertainer: function(){
        let morale = global.tech['theatre'];
        if (global.race['musical']){
            morale += traits.musical.vars()[0];
        }
        if (global.race['emotionless']){
            morale *= 1 - (traits.emotionless.vars()[0] / 100);
        }
        if (global.race['high_pop']){
            morale *= traits.high_pop.vars()[1] / 100;
        }
        morale = +workerScale(morale,'entertainer').toFixed(2);
        let mcap = global.race['high_pop'] ? (traits.high_pop.vars()[1] / 100) : 1;
        mcap = +workerScale(mcap,'entertainer').toFixed(2);
        return global.tech['superstar'] ? loc('job_entertainer_desc2',[morale,mcap]) : loc('job_entertainer_desc',[+(morale).toFixed(2)]);
    },
    priest: function(){
        let desc = ``;
        if (global.civic.govern.type === 'theocracy' && global.genes['ancients'] && global.genes['ancients'] >= 2 && global.civic.priest.display){
            desc = loc('job_priest_desc2');
        }
        else {
            desc = global.race.universe === 'evil' ? loc('job_pofficer_desc') : loc('job_priest_desc');
        }
        if (global.tech['cleric']){
            desc = desc + ` ${loc('job_priest_desc3')}`;
        }
        return desc;
    },
    professor: function(){
        let professor = +workerScale(1,'professor');
        let impact = +(global.race['studious'] ? global.civic.professor.impact + traits.studious.vars()[0] : global.civic.professor.impact);
        let fathom = fathomCheck('elven');
        if (fathom > 0){
            impact += traits.studious.vars(1)[0] * fathom;
        }
        professor *= impact;
        professor *= global.race['pompous'] ? (1 - traits.pompous.vars()[0] / 100) : 1;
        professor *= racialTrait(global.civic.professor.workers,'science');
        if (global.tech['anthropology'] && global.tech['anthropology'] >= 3){
            professor *= 1 + (templeCount() * 0.05);
        }
        if (global.civic.govern.type === 'theocracy'){
            professor *= 0.75;
        }
        professor = +professor.toFixed(2);
        return loc('job_professor_desc',[professor]);
    },
    scientist: function(){
        let impact = +workerScale(global.civic.scientist.impact,'scientist').toFixed(2);
        impact *= racialTrait(global.civic.scientist.workers,'science');
        if (global.tech['science'] >= 6 && global.city['wardenclyffe']){
            impact *= 1 + (global.civic.professor.workers * global.city['wardenclyffe'].on * 0.01);
        }
        if (global.space['satellite']){
            impact *= 1 + (global.space.satellite.count * 0.01);
        }
        if (global.civic.govern.type === 'theocracy'){
            impact *= global.tech['high_tech'] && global.tech['high_tech'] >= 12 ? ( global.tech['high_tech'] >= 16 ? 0.75 : 0.6 ) : 0.5;
        }
        impact = +impact.toFixed(2);
        return global.race.universe === 'magic' ? loc('job_wizard_desc',[impact,+(0.025 * darkEffect('magic')).toFixed(4)]) : loc('job_scientist_desc',[impact]);
    },
    colonist(){
        return loc(global.race['truepath'] ? 'job_colonist_desc_tp' : 'job_colonist_desc',[planetName().red]);
    },
    titan_colonist(){
        return loc('job_colonist_desc_tp',[planetName().titan]);
    },
    space_miner(){
        return loc('job_space_miner_desc');
    },
    hell_surveyor(){
        return loc('job_hell_surveyor_desc');
    },
    archaeologist(){
        let value = highPopAdjust(250000);
        let sup = hellSupression('ruins');
        let know = Math.round(value * sup.supress);
        return loc('job_archaeologist_desc',[know.toLocaleString()]);
    },
    ghost_trapper(){
        let attact = global.blood['attract'] ? global.blood.attract * 5 : 0;
        let resist = asphodelResist();
        let ascend = 1;
        if (p_on['ascension_trigger'] && global.eden.hasOwnProperty('encampment') && global.eden.encampment.asc){
            let heatSink = actions.interstellar.int_sirius.ascension_trigger.heatSink();
            heatSink = heatSink < 0 ? Math.abs(heatSink) : 0;
            if (heatSink > 0){
                ascend = 1 + (heatSink / 12500);
            }
        }
        if (global.race['warlord'] && global.portal['mortuary'] && global.portal['corpse_pile']){
            let corpse = (global.portal?.corpse_pile?.count || 0) * (p_on['mortuary'] || 0);
            if (corpse > 0){
                ascend = 1 + corpse / 800;
            }
        }
        let min = Math.floor((150 + attact) * resist * ascend);
        let max = Math.floor((250 + attact) * resist * ascend);
        
        return loc('job_ghost_trapper_desc',[loc('portal_soul_forge_title'),global.resource.Soul_Gem.name,min,max]);
    },
    elysium_miner(){
        let desc = loc('job_elysium_miner_desc',[loc('eden_elysium_name')]);
        if (global.tech['elysium'] && global.tech.elysium >= 12){
            desc += ` ${loc('eden_restaurant_effect',[0.15,loc(`eden_restaurant_bd`)])}.`;
        }
        return desc;
    },
    pit_miner(){
        return loc('job_pit_miner_desc',[loc('tau_planet',[races[global.race.species].home])]);
    },
    crew(){
        return loc('job_crew_desc');
    }
}
