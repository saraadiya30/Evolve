import { global, sizeApproximation, keyMultiplier, breakdown, webWorker } from '../../core/vars.js';
import { astrologySign, astroVal } from '../../functions/astrology.js';
import { plasmidBonus } from '../../resources/resources.js';
import { faithTempleCount, faithBonus } from '../../resources/aether_alchemy.js';
import { loc } from '../../core/locale.js';
import { traits, races } from '../../core/registries.js';
import { fathomCheck } from '../../races/trait_logic/fathom_check.js';
import { planetTraits } from '../../races/races.js';
import { govEffect } from '../../civics/civics.js';
import { calc_mastery, calcPillar } from '../../functions/functions.js';
import { resetResBuffer, timeScale } from '../../functions/resource_mod.js';
import { eventActive } from '../../functions/event_dates.js';
import { easterEggBind, trickOrTreatBind } from '../../functions/icons_easter_eggs.js';
import { workerScale, jobName } from '../../civics/jobs/job_definitions.js';
import { jobScale } from '../../civics/jobs/job_scale.js';
import { highPopAdjust } from '../../functions/adjusters_basic.js';
import { govActive } from '../../governor/governor.js';
import { fastLoopCore_s1, fastLoopCore_s2, fastLoopCore_s3 } from './fast_loop_unlocks_weather.js';
import { fastLoopCore_s4, fastLoopCore_s5 } from './fast_loop_space_labor.js';
import { fastLoopCore_s6, fastLoopCore_s7 } from './fast_loop_citizens_food.js';
import { fastLoopCore_s8, fastLoopCore_s9 } from './cement_smelters_steel_graphene_vitreloy.js';
import { fastLoopCore_s10, fastLoopCore_s11 } from './lumber_stone_aluminium_water_copper_iron.js';
import { fastLoopCore_s12, fastLoopCore_s13 } from './fast_loop_mining_ores.js';
import { fastLoopCore_s14 } from './fast_loop_money_crafting.js';
import { actions } from '../../core/registries.js';
import { enableDebug, updateDebugData } from '../../core/debug.js';
import { set_firstRun } from '../../core/run_state.js';
import { diffCalc } from '../long/long_loop.js';
import { S_loops as S } from '../../core/registries.js';

// Fungsi-fungsi dipindah dari main.js (urutan sumber dipertahankan). main.js tetap mengekspor ulang nama yang tadinya ter-ekspor.


export function fastLoopCore(){
    const $ctx = {};
    let aetherMoneyGain = 0;
    if (global.prestige.hasOwnProperty('Aether')){
        let aetherRate;
        if (global.settings.aetherCustomRateOn){
            aetherRate = global.settings.aetherCustomRate || 0;
        }
        else {
            let plasmid = global.prestige.Plasmid.count || 1;
            let phage = global.prestige.Phage.count || 1;
            aetherRate = plasmid * phage;
        }
        global.prestige.Aether.count += aetherRate;
        if (global.settings.aetherPlasmidRate > 0){
            let convert = Math.min(global.settings.aetherPlasmidRate, Math.floor(global.prestige.Aether.count));
            if (convert > 0){
                global.prestige.Aether.count -= convert;
                global.prestige.Plasmid.count += convert * 1000;
            }
        }
        if (global.settings.aetherPhageRate > 0){
            let convert = Math.min(global.settings.aetherPhageRate, Math.floor(global.prestige.Aether.count));
            if (convert > 0){
                global.prestige.Aether.count -= convert;
                global.prestige.Phage.count += convert * 100;
            }
        }
        aetherMoneyGain = 0;
        let aetherMoneyRate = (global.settings.aetherMoneyRateCoef || 0) * (10 ** (global.settings.aetherMoneyRateExp || -12));
        if (aetherMoneyRate > 0){
            let convert = Math.min(aetherMoneyRate, global.prestige.Aether.count);
            if (convert > 0){
                global.prestige.Aether.count -= convert;
                aetherMoneyGain = convert * 1000000000000000;
                global.resource.Money.amount += aetherMoneyGain;
                global.resource.Money.delta += aetherMoneyGain;
            }
        }
    }
    
    if (!global.race['no_craft']){
        // keyMultiplier() dihitung sekali per tick (bukan per elemen), dan teks hanya ditulis kalau berubah (tulis DOM mubazir dilewati).
        const craftMult = keyMultiplier();
        $('.craft').each(function(e){
            const craftVal = $(this).data('val');
            if (typeof craftVal === 'number'){
                const craftText = sizeApproximation(craftVal * craftMult,1);
                if (this.innerHTML !== craftText){
                    $(this).html(craftText);
                }
            }
        });
    }

    $ctx.date = new Date();
    $ctx.astroSign = astrologySign();
    breakdown.p['Global'] = {};
    $ctx.global_multiplier = 1;
    let applyPlasmid = false;
    let pBonus = plasmidBonus('raw');
    if (global.prestige.Plasmid.count > 0 && ((global.race.universe !== 'antimatter') || (global.genes['bleed'] && global.race.universe === 'antimatter'))){
        breakdown.p['Global'][loc('resource_Plasmid_name')] = (pBonus[1] * 100) + '%';
        applyPlasmid = true;
    }
    if (global.prestige.AntiPlasmid.count > 0 && ((global.race.universe === 'antimatter') || (global.genes['bleed'] && global.genes['bleed'] >= 2 && global.race.universe !== 'antimatter'))){
        breakdown.p['Global'][loc('resource_AntiPlasmid_name')] = (pBonus[2] * 100) + '%';
        applyPlasmid = true;
    }
    if (applyPlasmid){
        $ctx.global_multiplier += pBonus[0];
    }
    if (global.prestige.Supercoiled.count > 0){
        let bonus = (global.prestige.Supercoiled.count / (global.prestige.Supercoiled.count + 5000));
        breakdown.p['Global'][loc('resource_Supercoiled_short')] = +(bonus * 100).toFixed(2) + '%';
        $ctx.global_multiplier *= (1 + bonus);
    }
    if (global.race['no_plasmid'] || global.race.universe === 'antimatter'){
        if (faithTempleCount()){
            let faith = faithBonus();
            breakdown.p['Global'][loc('faith')] = (faith * 100) + '%';
            $ctx.global_multiplier *= (1 + faith);
        }
    }
    if (global.race.universe === 'evil' && global.resource.Authority.display){
        if (global.resource.Authority.amount < 100){
            let malus = (100 - global.resource.Authority.amount) * 0.0035;
            breakdown.p['Global'][global.resource.Authority.name] = -(malus * 100).toFixed(2) + '%';
            $ctx.global_multiplier *= (1 - malus);
        }
        else if (global.resource.Authority.amount > 100){
            let bonus = (global.resource.Authority.amount - 100) * 0.0015;
            breakdown.p['Global'][global.resource.Authority.name] = +(bonus * 100).toFixed(2) + '%';
            $ctx.global_multiplier *= (1 + bonus);
        }
    }
    if (global.race['untapped']){
        if (global.race['untapped'] > 0){
            let untapped = +(global.race.untapped / (global.race.untapped + 20) / 10 + 0.00024).toFixed(4);
            breakdown.p['Global'][loc('trait_untapped_bd')] = `${untapped * 100}%`;
            $ctx.global_multiplier *= 1 + (untapped);
        }
    }
    if (global.race['rainbow_active'] && global.race['rainbow_active'] > 1){
        breakdown.p['Global'][loc('trait_rainbow_bd')] = `${traits.rainbow.vars()[0]}%`;
        $ctx.global_multiplier *= 1 + (traits.rainbow.vars()[0] / 100);
    }
    if (global.race['gloomy'] && global.city.calendar.weather <= 1){
        breakdown.p['Global'][loc('trait_gloomy_name')] = `${traits.gloomy.vars()[0]}%`;
        $ctx.global_multiplier *= 1 + (traits.gloomy.vars()[0] / 100);
    }
    if (global.race['floating'] && global.city.calendar.wind === 1){
        breakdown.p['Global'][loc('trait_floating_name')] = `-${traits.floating.vars()[0]}%`;
        $ctx.global_multiplier *= 1 - (traits.floating.vars()[0] / 100);
    }
    if (global.tech['world_control']){
        let bonus = 25;
        if (global.civic.govern.type === 'federation'){
            bonus = govEffect.federation()[2];
        }
        if (global.race['unified']){
            bonus += traits.unified.vars()[0];
        }
        if ($ctx.astroSign === 'taurus'){
            bonus += astroVal('taurus')[0];
        }
        breakdown.p['Global'][loc('tech_unification')] = `${bonus}%`;
        $ctx.global_multiplier *= 1 + (bonus / 100);
    }
    else {
        let occupy = 0;
        for (let i=0; i<3; i++){
            if (global.civic.foreign[`gov${i}`].occ || global.civic.foreign[`gov${i}`].anx || global.civic.foreign[`gov${i}`].buy){
                occupy += global.civic.govern.type === 'federation' ? (5 + govEffect.federation()[0]) : 5;
            }
        }
        if (occupy > 0){
            breakdown.p['Global'][loc('civics_garrison_occupy')] = `${occupy}%`;
            $ctx.global_multiplier *= 1 + (occupy / 100);
        }
    }
    if (global.genes['challenge'] && global.genes.challenge >= 2){
        let mastery = calc_mastery();
        breakdown.p['Global'][loc('mastery')] = mastery + '%';
        $ctx.global_multiplier *= 1 + (mastery / 100);
    }
    if (global['pillars']){
        let harmonic = calcPillar();
        breakdown.p['Global'][loc('harmonic')] = `${(harmonic[0] - 1) * 100}%`;
        $ctx.global_multiplier *= harmonic[0];
    }
    if (global.race['ascended']){
        breakdown.p['Global'][loc('achieve_ascended_name')] = `5%`;
        $ctx.global_multiplier *= 1.05;
    }
    if (global.race['corruption']){
        let corruption = global.race['corruption'] * 2;
        breakdown.p['Global'][loc('achieve_corrupted_name')] = `${corruption}%`;
        $ctx.global_multiplier *= 1 + (corruption / 100);
    }
    if (global.race['rejuvenated']){
        let decay = global.stats.days < 996 ? (1000 - global.stats.days) / 2000 : 0.02;
        breakdown.p['Global'][loc('rejuvenated')] = `${decay * 100}%`;
        $ctx.global_multiplier *= 1 + decay;
    }
    let octFathom = fathomCheck('octigoran');
    if (global.race['suction_grip'] || octFathom > 0){
        let bonus = 0;
        if (global.race['suction_grip']){
            bonus += traits.suction_grip.vars()[0];
        }
        if (octFathom > 0){
            bonus += +(traits.suction_grip.vars(1)[0] * octFathom).toFixed(2);
        }
        breakdown.p['Global'][loc('trait_suction_grip_bd')] = bonus+'%';
        $ctx.global_multiplier *= 1 + (bonus / 100);
    }

    let cyclopsFathom = fathomCheck('cyclops');
    if (global.race['intelligent'] || cyclopsFathom > 0){
        let bonus = 0;
        if (global.race['intelligent']){
            bonus += (workerScale(global.civic.scientist.workers,'scientist') * traits.intelligent.vars()[1]) + (workerScale(global.civic.professor.workers,'professor') * traits.intelligent.vars()[0]);
        }
        if (cyclopsFathom > 0){
            bonus += (workerScale(global.civic.scientist.workers,'scientist') * traits.intelligent.vars(1)[1] * cyclopsFathom) + (workerScale(global.civic.professor.workers,'professor') * traits.intelligent.vars(1)[0] * cyclopsFathom);
        }
        if (global.race['high_pop']){
            bonus = highPopAdjust(bonus);
        }
        breakdown.p['Global'][loc('trait_intelligent_bd')] = bonus+'%';
        $ctx.global_multiplier *= 1 + (bonus / 100);
    }
    if (global.race['slaver'] && global.city['slave_pen'] && global.city['slave_pen']){
        let bonus = (global.resource.Slave.amount * traits.slaver.vars()[0]);
        breakdown.p['Global'][loc('trait_slaver_bd')] = bonus+'%';
        $ctx.global_multiplier *= 1 + (bonus / 100);
    }
    if ((global.city.ptrait.includes('trashed') || global.race['scavenger'] || (global.race['servants'] && global.race.servants['force_scavenger'])) && global.civic['scavenger']){
        let scavenger = global.city.ptrait.includes('trashed') || global.race['scavenger'] ? workerScale(global.civic.scavenger.workers,'scavenger') : 0;
        if (global.race['servants']){ scavenger += jobScale(global.race.servants.jobs.scavenger); }
        if (scavenger > 0){
            let bonus = (scavenger * traits.scavenger.vars()[0]);
            if (global.city.ptrait.includes('trashed') && global.race['scavenger']){
                bonus *= 1 + (traits.scavenger.vars()[1] / 100);
            }
            if (global.city.ptrait.includes('trashed')){
                bonus *= planetTraits.trashed.vars()[1];
            }
            if (global.race['high_pop']){
                bonus = highPopAdjust(bonus);
            }
            breakdown.p['Global'][jobName('scavenger')] = bonus+'%';
            $ctx.global_multiplier *= 1 + (bonus / 100);
        }
    }
    if (global.race['unfathomable'] && global.city['surfaceDwellers'] && global.city['captive_housing']){
        let thralls = 0;
        let rank = global.stats.achieve['nightmare'] && global.stats.achieve.nightmare['mg'] ? global.stats.achieve.nightmare.mg : 0;
        if (global.city.hasOwnProperty('surfaceDwellers')){
            for (let i = 0; i < global.city.surfaceDwellers.length; i++){
                thralls += global.city.captive_housing[`race${i}`];
            }
            if (thralls > global.civic.torturer.workers * rank / 2){
                let unsupervised = thralls - (global.civic.torturer.workers * rank / 2);
                thralls -= Math.ceil(unsupervised / 3);
            }
        }
        if (thralls > 0){
            let bonus = (thralls * traits.unfathomable.vars()[2] * rank / 5);
            if (global.race['psychic']){
                bonus *= 1 + (traits.psychic.vars()[1] / 100);
            }
            breakdown.p['Global'][loc('trait_unfathomable_bd')] = bonus+'%';
            $ctx.global_multiplier *= 1 + (bonus / 100);
        }
    }
    if (global.city.ptrait.includes('mellow')){
        breakdown.p['Global'][loc('planet_mellow_bd')] = '-' + (100 - (planetTraits.mellow.vars()[2] * 100)) + '%';
        $ctx.global_multiplier *= planetTraits.mellow.vars()[2];
    }
    if (global.city.ptrait.includes('ozone') && global.city['sun']){
        let uv = global.city['sun'] * planetTraits.ozone.vars()[0];
        breakdown.p['Global'][loc('planet_ozone_bd')] = `-${uv}%`;
        $ctx.global_multiplier *= 1 - (uv / 100);
    }
    let phoenixFathom = fathomCheck('phoenix');
    if ((global.race['smoldering'] || phoenixFathom > 0) && global.city['hot']){
        let heat = 0;
        if (global.race['smoldering']){
            if (global.city['hot'] > 100){
                heat += 100 * traits.smoldering.vars()[1];
                heat += (global.city['hot'] - 100) * traits.smoldering.vars()[2];
            }
            else {
                heat += global.city['hot'] * traits.smoldering.vars()[1];
            }
        }
        if (phoenixFathom > 0){
            if (global.city['hot'] > 100){
                heat += 100 * traits.smoldering.vars(0.25)[1] * phoenixFathom;
                heat += (global.city['hot'] - 100) * traits.smoldering.vars(0.25)[2] * phoenixFathom;
            }
            else {
                heat += global.city['hot'] * traits.smoldering.vars(0.25)[1] * phoenixFathom;
            }
        }
        breakdown.p['Global'][loc('trait_smoldering_name')] = `${heat}%`;
        $ctx.global_multiplier *= 1 + (heat / 100);
    }
    if (global.race['heat_intolerance'] && global.city['hot']){
        let heat = Math.min(100, global.city['hot'] * traits.heat_intolerance.vars()[0]);
        breakdown.p['Global'][loc('hot')] = `-${heat}%`;
        $ctx.global_multiplier *= 1 - (heat / 100);
    }
    if (global.race['chilled'] && global.city['cold']){
        let cold = 0;
        if (global.city['cold'] > 100){
            cold += 100 * traits.chilled.vars()[1];
            cold += (global.city['cold'] - 100) * traits.chilled.vars()[2];
        }
        else {
            cold = global.city['cold'] * traits.chilled.vars()[1];
        }
        breakdown.p['Global'][loc('trait_chilled_name')] = `${cold}%`;
        $ctx.global_multiplier *= 1 + (cold / 100);
    }
    if (global.race['cold_intolerance'] && global.city['cold']){
        let cold = Math.min(100, global.city['cold'] * traits.cold_intolerance.vars()[0]);
        breakdown.p['Global'][loc('cold')] = `-${cold}%`;
        $ctx.global_multiplier *= 1 - (cold / 100);
    }
    if (global.civic.govern.type === 'anarchy' && global.resource[global.race.species].amount > jobScale(10)){
        let chaos = (global.resource[global.race.species].amount - jobScale(10)) * (global.race['high_pop'] ? (0.25 / traits.high_pop.vars()[0]) : 0.25);
        breakdown.p['Global'][loc('govern_anarchy')] = `-${chaos}%`;
        $ctx.global_multiplier *= 1 - (chaos / 100);
    }
    if (global.civic.govern['protest'] && global.civic.govern.protest > 0){
        breakdown.p['Global'][loc('event_protest')] = `-${30}%`;
        $ctx.global_multiplier *= 0.7;
    }
    if (global.civic.govern['scandal'] && global.civic.govern.scandal > 0){
        let muckVal = govActive('muckraker',0);
        if (muckVal){
            breakdown.p['Global'][loc('event_scandal')] = `-${muckVal}%`;
            $ctx.global_multiplier *= 1 - (muckVal / 100);
        }
    }
    let capyFathom = fathomCheck('capybara');
    if (capyFathom > 0 || (global.race['calm'] && global.city['meditation'] && global.resource.Zen.display)){
        let rawZen = global.resource.Zen.amount;
        if (capyFathom > 0){
            rawZen += Math.round(capyFathom * 500);
        }
        let zen = rawZen / (rawZen + 5000);
        breakdown.p['Global'][loc('trait_calm_bd')] = `+${(zen * 100).toFixed(2)}%`;
        $ctx.global_multiplier *= 1 + zen;
    }
    if (global.city['firestorm'] && global.city.firestorm > 0){
        global.city.firestorm--;
        breakdown.p['Global'][loc('event_flare_bd')] = `-${20}%`;
        $ctx.global_multiplier *= 0.8;
    }

    if (
        (races[global.race.species].type === 'aquatic' && !['swamp','oceanic'].includes(global.city.biome)) ||
        (races[global.race.species].type === 'fey' && !['forest','swamp','taiga'].includes(global.city.biome)) ||
        (races[global.race.species].type === 'heat' && !['ashland','volcanic'].includes(global.city.biome)) ||
        (races[global.race.species].type === 'polar' && !['tundra','taiga'].includes(global.city.biome)) ||
        (races[global.race.species].type === 'sand' && !['ashland','desert'].includes(global.city.biome)) ||
        (races[global.race.species].type === 'demonic' && global.city.biome !== 'hellscape') ||
        (races[global.race.species].type === 'angelic' && global.city.biome !== 'eden')
    ){
        if (!global.race['warlord']){
            let unsuited = 1;
            if (global.blood['unbound'] && global.blood.unbound >= 4){
                unsuited = global.race['rejuvenated'] ? 0.975 : 0.95;
            }
            else if (global.blood['unbound'] && global.blood.unbound >= 2){
                unsuited = global.race['rejuvenated'] ? 0.95 : 0.9;
            }
            else {
                unsuited = global.race['rejuvenated'] ? 0.9 : 0.8;
            }
        
            breakdown.p['Global'][loc('unsuited')] = `-${Math.round((1 - unsuited) * 100)}%`;
            $ctx.global_multiplier *= unsuited;
        }
    }

    if (global.race['hibernator'] && global.city.calendar.season === 3){
        $ctx.global_multiplier *= 1 - (traits.hibernator.vars()[1] / 100);
        breakdown.p['Global'][loc('morale_winter')] = `-${traits.hibernator.vars()[1]}%`;
    }

    if (global.race.universe === 'magic' && global.tech['syphon']){
        let entropy = global.tech.syphon / 8;
        breakdown.p['Global'][loc('arpa_syphon_damage')] = `-${entropy}%`;
        $ctx.global_multiplier *= 1 - (entropy / 100);
    }

    let resList = [
        'Money','Knowledge','Omniscience','Food','Lumber','Stone','Chrysotile','Crystal','Furs','Copper','Iron',
        'Cement','Coal','Oil','Uranium','Aluminium','Steel','Titanium','Alloy','Polymer','Iridium','Helium_3',
        'Water','Deuterium','Neutronium','Adamantite','Infernite','Elerium','Nano_Tube','Graphene','Stanene',
        'Bolognium','Vitreloy','Orichalcum','Asphodel_Powder','Elysanite','Unobtainium','Quantium',
        'Plywood','Brick','Wrought_Iron','Sheet_Metal','Mythril','Aerogel','Nanoweave','Scarletite',
        'Cipher','Nanite','Mana','Authority'
    ];

    breakdown.p['consume'] = {};
    resList.forEach(function(res){
        breakdown.p['consume'][res] = {};
        breakdown.p[res] = {};
    });
    if (aetherMoneyGain > 0){
        breakdown.p['Money'][loc('resource_Aether_name')] = aetherMoneyGain + 'v';
    }
    if(global.race['fasting']){
        breakdown.p['consume'][global.race.species] = {};
        breakdown.p[global.race.species] = {};
    }

    $ctx.time_multiplier = 0.25;
    resetResBuffer();

    if (global.race.species === 'protoplasm'){
        // Early Evolution Game

        // Gain RNA & DNA
        fastLoopCore_s1($ctx);
    }
    else {
        // Rest of game
        fastLoopCore_s2($ctx);
        fastLoopCore_s3($ctx);
        fastLoopCore_s4($ctx);
        fastLoopCore_s5($ctx);
        fastLoopCore_s6($ctx);
        fastLoopCore_s7($ctx);
        fastLoopCore_s8($ctx);
        fastLoopCore_s9($ctx);
        fastLoopCore_s10($ctx);
        fastLoopCore_s11($ctx);
        fastLoopCore_s12($ctx);
        fastLoopCore_s13($ctx);
        fastLoopCore_s14($ctx);
    }

    if (global.civic['garrison'] && global.civic.garrison.workers < global.civic.garrison.max){
        let rate = 2.5;
        if (global.race['high_pop']){
            rate *= traits.high_pop.vars()[2];
        }
        if (global.race['diverse']){
            rate /= 1 + (traits.diverse.vars()[0] / 100);
        }
        if (global.city['boot_camp']){
            let train = global.tech['boot_camp'] >= 2 ? 0.08 : 0.05;
            if (global.blood['lust']){
                train += global.blood.lust * 0.002;
            }
            let milVal = govActive('militant',0);
            if (milVal){
                train *= 1 + (milVal / 100);
            }
            rate *= 1 + ((global.race['orbit_decayed'] && global.space['space_barracks'] ? global.space.space_barracks.on : global.city.boot_camp.count) * train);
        }
        if (global.tech['celestial_warfare'] && global.tech.celestial_warfare >= 5 && global.eden['bunker']){
            let train = 0.1;
            if (global.blood['lust']){
                train += global.blood.lust * 0.002;
            }
            let milVal = govActive('militant',0);
            if (milVal){
                train *= 1 + (milVal / 100);
            }
            rate *= 1 + (global.eden.bunker.count * train);
        }
        if (global.race['beast']){
            rate *= 1 + (traits.beast.vars()[2] / 100);
        }
        global.civic.garrison.rate = rate * $ctx.time_multiplier;
        if (global.race['brute']){
            global.civic.garrison.rate += traits.brute.vars()[1] / 40 * $ctx.time_multiplier;
        }
        let fathom = fathomCheck('orc');
        if (fathom > 0){
            global.civic.garrison.rate += traits.brute.vars(1)[1] / 40 * fathom * $ctx.time_multiplier;
        }
        global.civic.garrison.progress += global.civic.garrison.rate;
        while (global.civic.garrison.progress >= 100){
            global.civic.garrison.progress -= 100;
            global.civic.garrison.workers++;

            if (global.portal['fortress'] && global.portal.fortress['assigned'] && global.portal.fortress.garrison < global.portal.fortress.assigned){
                global.portal.fortress.garrison++;
            };
        }
    }

    // carport repair
    if (global.portal['carport']){
        if (global.portal.carport.damaged > 0){
            if (!$('#portal-carport .count').hasClass('has-text-alert')){
                $('#portal-carport .count').addClass('has-text-alert');
            }
            global.portal.carport.repair++;
            if (global.portal.carport.repair >= actions.portal.prtl_fortress.carport.repair()){
                global.portal.carport.repair = 0;
                global.portal.carport.damaged--;
            }
            //limit carport damage to account for removing high population
            global.portal.carport.damaged = Math.min(global.portal.carport.damaged, jobScale(global.portal.carport.count));
        }
        else {
            if ($('#portal-carport .count').hasClass('has-text-alert')){
                $('#portal-carport .count').removeClass('has-text-alert');
            }
        }
    }

    // main resource delta tracking
    Object.keys(global.resource).forEach(function (res) {
        if (global.resource[res].amount > global.resource[res].max && global.resource[res].max >= 0){
            if (res === 'Money'){
                // Income thrown away by the storage cap this tick; the stock auto-balance needs it (see stockAutoTrade)
                S.moneyClampLost += global.resource[res].amount - global.resource[res].max;
            }
            global.resource[res].amount = global.resource[res].max;
        }
        if (global['resource'][res].rate > 0 || (global['resource'][res].rate === 0 && global['resource'][res].max === -1)){
            diffCalc(res,webWorker.mt * timeScale());
        }
    });
    if(global.race['fasting']){
        diffCalc(global.race.species,webWorker.mt * timeScale());
    }

    if (global.settings.expose){
        if (!window['evolve']){
            enableDebug();
        }
        updateDebugData();
    }

    let easter = eventActive('easter');
    if (easter.active){
        for ($ctx.i=1; $ctx.i<=18; $ctx.i++){
            if ($(`#egg${$ctx.i}`).length > 0 && !$(`#egg${$ctx.i}`).hasClass('binded')){
                easterEggBind($ctx.i);
                $(`#egg${$ctx.i}`).addClass('binded');
            }
        }
    }

    let halloween = eventActive('halloween');
    if (halloween.active){
        for ($ctx.i=1; $ctx.i<=8; $ctx.i++){
            if ($(`#treat${$ctx.i}`).length > 0 && !$(`#treat${$ctx.i}`).hasClass('binded')){
                trickOrTreatBind($ctx.i,false);
                $(`#treat${$ctx.i}`).addClass('binded');
            }
        }
        for ($ctx.i=1; $ctx.i<=8; $ctx.i++){
            if ($(`#trick${$ctx.i}`).length > 0 && !$(`#trick${$ctx.i}`).hasClass('binded')){
                trickOrTreatBind($ctx.i,true);
                $(`#trick${$ctx.i}`).addClass('binded');
            }
        }
    }

    set_firstRun(false);
}
