// Isi: challengeEffect(), templeEffect(), casino_vault(), casinoEarn(), casinoEffect(), evolveCosts(), setChallenge(), setScenario(), BHStorageMulti(), storageMultipler(), checkCityRequirements(), checkTechPath(), skipRequirement(), checkTechRequirements() +6
import { global } from '../../core/vars.js';
import { loc } from '../../core/locale.js';
import { calc_mastery } from '../../functions/calc_mastery.js';
import { adjustCosts } from '../../functions/cost_adjusters.js';
import { get_qlevel } from '../../functions/quantum_level.js';
import { clearElement } from '../../functions/dom_helpers.js';
import { popover } from '../../functions/popover.js';
import { crateValue, containerValue } from '../../resources/crate_value.js';
import { spatialReasoning } from '../../resources/resources.js';
import { faithBonus, templePlasmidBonus } from '../../resources/aether_alchemy.js';
import { actions, hooks } from '../../core/registries.js';
import { production } from '../../resources/prod.js';
import { highPopAdjust } from '../../functions/adjusters_basic.js';
import { workerScale } from '../../civics/jobs/worker_scale.js';
import { jobScale } from '../../civics/jobs/job_scale.js';
import { traits, races } from '../../core/registries.js';
import { fathomCheck } from '../../races/trait_logic/fathom_check.js';
import { govEffect } from '../../civics/gov_effect.js';
import { govActive } from '../../governor/gov_active.js';
import { challengeIcon } from '../../achievements/achievement_helpers.js';
import { BLACKHOLE_STORAGE_BONUS_PER_LEVEL } from '../../config/constants.js';
import { renderSpace } from '../../space/space_requirements.js';
import { renderFortress } from '../../portal/hell/fortress_defense.js';
import { renderEdenic } from '../../edenic/edenic_render.js';
import { challengeList, set_cLabels } from '../action_lists.js';
import { setChallengeScreen } from './challenge_screen.js';
import { addAction, drawTech } from '../core/action_runner.js';
import { removeAction } from '../core/action_costs.js';
import { checkCityRequirements } from './requirements.js';

// Fungsi-fungsi dipindah dari actions.js (urutan sumber dipertahankan). actions.js tetap mengekspor ulang nama yang tadinya ter-ekspor.


export function challengeEffect(c){
    switch (c){
        case 'nerfed':
            let nVal = global.race.universe === 'antimatter' ? [`20%`,`50%`,`50%`,`33%`] : [`50%`,`20%`,`50%`,`33%`];
            return loc(`evo_challenge_${c}_effect`,nVal);
        case 'badgenes':
            return loc(`evo_challenge_${c}_effect`,[1,2]);
        case 'orbit_decay':
        {
            if (calc_mastery() >= 100){
                return `<div>${loc('evo_challenge_orbit_decay_effect',[5000])}</div><div class="has-text-caution">${loc('evo_challenge_scenario_failwarn')}</div>`;
            }
            else {
                return `<div>${loc('evo_challenge_orbit_decay_effect',[5000])}</div><div class="has-text-caution">${loc('evo_challenge_scenario_failwarn')}</div><div class="has-text-danger">${loc('evo_challenge_scenario_warn')}</div>`;
            }
        }
        case 'junker':
        {
            return global.city.biome === 'hellscape' && global.race.universe !== 'evil' ? `<div>${loc('evo_challenge_junker_effect')}</div><div class="has-text-special">${loc('evo_warn_unwise')}</div>` : loc('evo_challenge_junker_effect');
        }
        case 'cataclysm':
        {
            if (calc_mastery() >= 50){
                return `<div>${loc('evo_challenge_cataclysm_effect')}</div><div class="has-text-caution">${loc('evo_challenge_cataclysm_warn')}</div>`;
            }
            else {
                return `<div>${loc('evo_challenge_cataclysm_effect')}</div><div class="has-text-danger">${loc('evo_challenge_scenario_warn')}</div>`;
            }   
        }
        case 'gravity_well':
        {
            let addedFlag = !global.race.hasOwnProperty('gravity_well');
            if (addedFlag){ global.race['gravity_well'] = 1; }

            // Check storage based on current challenge genes
            // Could be pessimistic: trait-related adjustments are unknown in protoplasm stage
            let crates = 36*40;         // 36 freight yards   (max with no CRISPR is usually 46)
            let containers = 36*40;     // 36 container ports (max with no CRISPR is usually 45)
            if (global.stats.achieve['pathfinder'] && global.stats.achieve.pathfinder.l >= 1){
                crates *= 1.5;
                if (global.stats.achieve.pathfinder.l >= 2){
                    containers *= 1.5;
                }
            }
            // 10 wharves (can build up to 13 even with no CRISPR)
            crates += 10*20;
            containers += 10*20;

            // max crate tech = 4
            if (global.tech['container']) {
                let real_tech = global.tech['container'];
                global.tech['container'] = 4;
                crates *= crateValue();
                global.tech['container'] = real_tech;
            }
            else {
                global.tech['container'] = 4;
                crates *= crateValue();
                delete global.tech['container'];
            }

            // max container tech = 3
            if (global.tech['steel_container']) {
                let real_tech = global.tech['steel_container'];
                global.tech['steel_container'] = 3;
                containers *= containerValue();
                global.tech['steel_container'] = real_tech;
            }
            else {
                global.tech['steel_container'] = 3;
                containers *= containerValue();
                delete global.tech['steel_container'];
            }

            let warehouses = 40; // no spatial reasoning required for 43 warehouses
            let coeff = 50;      // roughly same as all pre-space warehouses tech + 26 supercolliders

            let cement_name = global.race['flier'] ? 'Stone' : 'Cement';
            let max_cement = crates + containers + storageMultipler(warehouses * coeff * actions.city.shed.val(cement_name));
            let num_fuel_depot = 0; // max with no CRISPR is usually 20 fuel depots
            let offset = global.city?.oil_depot?.count ?? 0;
            while (true){
                let costs = adjustCosts(actions.city.oil_depot, num_fuel_depot - offset);
                let cement_cost = costs[cement_name](num_fuel_depot - offset);
                if (cement_cost > max_cement){ break; }
                num_fuel_depot++;
            }

            let max_derrick = max_cement + storageMultipler(warehouses * coeff * actions.city.shed.val('Steel'));
            let num_oil_derrick = 0; // max with no CRISPR is usually 16 oil derricks
            offset = global.city?.oil_well?.count ?? 0;
            while (true){
                let costs = adjustCosts(actions.city.oil_well, num_oil_derrick - offset);
                let cement_cost = costs[cement_name](num_oil_derrick - offset);
                let steel_cost = costs['Steel'](num_oil_derrick - offset);
                if (cement_cost + steel_cost > max_derrick){ break; }
                num_oil_derrick++;
            }

            let num_propellant_depot = 0; // with low dark energy it may be impossible to build even 1 propellant depot
            let unified = global.race['unified'] ? 1.5 : 1;
            let max_oil = spatialReasoning(1000*unified*num_fuel_depot + 500*num_oil_derrick + 1250*unified*num_propellant_depot);
            offset = global.space?.propellant_depot?.count ?? 0;
            while (true){
                let costs = adjustCosts(actions.space.spc_home.propellant_depot, num_propellant_depot - offset);
                let oil_cost = costs['Oil'](num_propellant_depot - offset);
                if (oil_cost > max_oil){ break; }
                num_propellant_depot++;
                max_oil = spatialReasoning(1000*unified*num_fuel_depot + 500*num_oil_derrick + 1250*unified*num_propellant_depot);
            }

            let costs = adjustCosts(actions.space.spc_moon.moon_mission);
            let oil_cost = costs['Oil']();
            let show_warning = max_oil < oil_cost;

            if (addedFlag){ delete global.race['gravity_well']; }
            if (show_warning){
                return `<div>${loc('evo_challenge_gravity_well_effect')}</div><div class="has-text-danger">${loc('evo_challenge_gravity_well_warn')}</div>`;
            }
            break;
        }
        case 'warlord':
        {
            if (global.prestige.Artifact === 0){
                return `<div>${loc('evo_challenge_warlord_effect')}</div><div class="has-text-danger">${loc('evo_challenge_warlord_warn',[1,loc(`resource_Artifact_name`)])}</div>`;
            }
            break;
        }
    }
    return loc(`evo_challenge_${c}_effect`);
}

export function templeEffect(){
    let desc;
    if (global.race.universe === 'antimatter' || global.race['no_plasmid']){
        let faith = faithBonus(100); // 1 temple portion of faith, multiplied by 100 for a percentage display

        faith = +(faith).toFixed(3);
        desc = `<div>${loc('city_temple_effect1',[faith])}</div>`;
        if (global.race.universe === 'antimatter'){
            let temple = 6;
            if (global.genes['ancients'] && global.genes['ancients'] >= 2 && global.civic.priest.display){
                let priest = global.genes['ancients'] >= 5 ? 0.12 : (global.genes['ancients'] >= 3 ? 0.1 : 0.08);
                if (global.race['high_pop']){
                    priest = highPopAdjust(priest);
                }
                temple += priest * workerScale(global.civic.priest.workers,'priest');
            }
            desc += `<div>${loc('city_temple_effect5',[temple.toFixed(2)])}</div>`;
        }
    }
    else {
        let plasmid = templePlasmidBonus(100); // 1 temple portion of plasmids bonus, multiplied by 100 for a percentage display

        plasmid = +(plasmid).toFixed(3);
        desc = `<div>${loc('city_temple_effect2',[plasmid])}</div>`;
    }
    if (global.tech['fanaticism'] && global.tech['fanaticism'] >= 3){
        desc = desc + `<div>${loc('city_temple_effect3')}</div>`;
    }
    if (global.tech['anthropology'] && global.tech['anthropology'] >= 4){
        desc = desc + `<div>${global.race['truepath'] ? loc('city_temple_effect_tp',[2,25]) : loc('city_temple_effect4')}</div>`;
    }
    return desc;
}

export function casino_vault(){
    let vault = global.tech['gambling'] >= 3 ? 60000 : 40000;
    if (global.tech['gambling'] >= 5){
        vault += global.tech['gambling'] >= 6 ? 240000 : 60000;
    }
    vault = spatialReasoning(vault);
    if (global.race['gambler']){
        vault *= 1 + (traits.gambler.vars()[0] * global.race['gambler'] / 100);
    }
    if (global.tech['world_control']){
        vault *= 1.25;
    }
    if (global.race['truepath']){
        vault *= 1.5;
    }
    if (global.tech['stock_exchange'] && global.tech['gambling'] >= 4){
        vault *= 1 + (global.tech['stock_exchange'] * 0.05);
    }
    if (global.race['inflation']){
        vault *= 1 + (global.race.inflation / 100);
    }
    if (global.tech['isolation']){
        vault *= 5.5;
    }
    if (global.race['warlord']){
        let absorb = global.race?.absorbed?.length || 1;
        vault *= 1 + (absorb / 10);
        if (global.portal['hell_casino'] && global.portal.hell_casino.rank > 1){
            let rank = global.portal.hell_casino.rank - 1;
            vault *= 1 + rank * 0.1;
        }
    }
    return vault;
}

export function casinoEarn(){
    let cash = Math.log2(1 + global.resource[global.race.species].amount) * 2.5;
    if (global.race['gambler']){
        cash *= 1 + (traits.gambler.vars()[0] * global.race['gambler'] / 100);
    }
    if (global.tech['gambling'] && global.tech['gambling'] >= 2){
        cash *= global.tech.gambling >= 5 ? 2 : 1.5;
        if (global.tech['stock_exchange'] && global.tech['gambling'] >= 4){
            cash *= 1 + (global.tech['stock_exchange'] * 0.01);
        }
    }
    if (global.civic.govern.type === 'corpocracy'){
        cash *= 1 + (govEffect.corpocracy()[0] / 100);
    }
    if (global.civic.govern.type === 'socialist'){
        cash *= 1 - (govEffect.socialist()[3] / 100);
    }
    if (global.race['inflation']){
        cash *= 1 + (global.race.inflation / 1250);
    }
    if (global.tech['isolation']){
        cash *= 1.25;
        if (global.tech['iso_gambling']){
            cash *= 1 + (workerScale(global.civic.banker.workers,'banker') * 0.05)
        }
    }
    if (global.race['warlord'] && global.race['befuddle']){
        cash *= 1 + (traits.befuddle.vars()[0] / 100);
    }
    cash *= production('psychic_cash');
    let racVal = govActive('racketeer', 1);
    if (racVal){
        cash *= 1 + (racVal / 100);
    }
    if (global.race['wish'] && global.race['wishStats'] && global.race.wishStats.casino){
        cash *= 1.35;
    }
    if (global.race['warlord'] && global.portal['hell_casino'] && global.portal.hell_casino.rank > 1){
        let rank = global.portal.hell_casino.rank - 1;
        cash *= 1 + rank * 0.36;
    }
    return cash;
}

export function casinoEffect(){
    let money = Math.round(casino_vault());

    let joy = (global.tech['theatre'] && !global.race['joyless']) ? `<div>${loc('plus_max_resource',[jobScale(global.race['warlord'] ? 3 : 1),loc(`job_entertainer`)])}</div>` : '';
    let banker = global.race['orbit_decayed'] || global.tech['isolation'] || global.race['warlord'] ? `<div>${loc('plus_max_resource',[jobScale(1),loc('banker_name')])}</div>` : '';
    let desc = `<div>${loc('plus_max_resource',[`\$${money.toLocaleString()}`,loc('resource_Money_name')])}</div>${joy}${banker}<div>${loc('city_max_morale',[1])}</div>`;
    let cash = +(casinoEarn()).toFixed(2);
    desc = desc + `<div>${loc('tech_casino_effect2',[cash])}</div>`;
    return desc;
}

export function evolveCosts(molecule,base,mult,offset){
    let count = (global.evolution.hasOwnProperty(molecule) ? global.evolution[molecule].count : 0) + (offset || 0);
    return count * mult + base;
}

export function setChallenge(challenge){
    if (global.race[challenge]){
        delete global.race[challenge];
        $(`#evolution-${challenge}`).removeClass('hl');
        if (challenge === 'sludge'){
            Object.keys(races).forEach(function(r){
                if (r !== 'junker' && r !== 'sludge' && r !== 'ultra_sludge'){
                    $(`#evolution-${r}`).removeClass('is-hidden');
                }
            });
        }
    }
    else {
        global.race[challenge] = 1;
        $(`#evolution-${challenge}`).addClass('hl');
        if (challenge === 'sludge' || challenge === 'ultra_sludge'){
            Object.keys(races).forEach(function(r){
                if (r !== 'junker' && r !== 'sludge' && r !== 'ultra_sludge'){
                    $(`#evolution-${r}`).addClass('is-hidden');
                }
            });
            if (global.race['junker']){
                delete global.race['junker'];
            }
            if (challenge !== 'sludge'){
                delete global.race['sludge'];
            }
            if (challenge !== 'ultra_sludge'){
                delete global.race['ultra_sludge'];
            }
        }
        if (challenge === 'orbit_decay'){
            delete global.race['cataclysm'];
            delete global.race['warlord'];
            if (global.race['lone_survivor']){
                delete global.race['lone_survivor'];
                ['nerfed','badgenes'].forEach(function(gene){
                    delete global.race[challengeList[gene]];
                });
            }
        }
    }
    setChallengeScreen();
    challengeIcon();
}

export function setScenario(scenario){
    if (!global.race['sludge']){
        Object.keys(races).forEach(function(r){
            if (r !== 'junker' && r !== 'sludge' && r !== 'ultra_sludge'){
                $(`#evolution-${r}`).removeClass('is-hidden');
            }
        });
    }
    if (global.race[scenario]){
        delete global.race[scenario];
        $(`#evolution-${scenario}`).removeClass('hl');
        ['nerfed','badgenes'].forEach(function(gene){
            delete global.race[challengeList[gene]];
        });
    }
    else {
        ['junker','cataclysm','banana','truepath','lone_survivor','fasting','warlord'].forEach(function(s){
            delete global.race[s];
            $(`#evolution-${s}`).removeClass('hl');
        });
        global.race[scenario] = 1;
        $(`#evolution-${scenario}`).addClass('hl');

        if (scenario === 'junker'){
            Object.keys(races).forEach(function(r){
                if (r !== 'junker' && r !== 'sludge' && r !== 'ultra_sludge'){
                    $(`#evolution-${r}`).addClass('is-hidden');
                }
            });
            if (global.race['sludge']){
                delete global.race['sludge'];
            }
            if (global.race['ultra_sludge']){
                delete global.race['ultra_sludge'];
            }
        }

        if (scenario === 'cataclysm' || scenario === 'lone_survivor' || scenario === 'warlord'){
            delete global.race['orbit_decay'];
        }

        if (scenario === 'truepath' || scenario === 'lone_survivor'){
            global.race['nerfed'] = 1;
            ['crispr','plasmid','mastery'].forEach(function(gene){
                delete global.race[challengeList[gene]];
            });
        }
        else {
            ['nerfed','badgenes'].forEach(function(gene){
                delete global.race[challengeList[gene]];
            });

            if (global.race.universe === 'antimatter'){
                global.race['weak_mastery'] = 1;
                if (!$(`#evolution-mastery`).hasClass('hl')){
                    $(`#evolution-mastery`).addClass('hl');
                }
            }
            else {
                global.race['no_plasmid'] = 1;
                if (!$(`#evolution-plasmid`).hasClass('hl')){
                    $(`#evolution-plasmid`).addClass('hl');
                }
            }
        }

        let genes = scenario === 'truepath' || scenario === 'lone_survivor' ? ['badgenes','trade','craft'] : ['crispr','trade','craft'];
        for (let i=0; i<genes.length; i++){
            global.race[challengeList[genes[i]]] = 1;
            if (!$(`#evolution-${genes[i]}`).hasClass('hl')){
                $(`#evolution-${genes[i]}`).addClass('hl');
            }
        }
    }
    setChallengeScreen();
    challengeIcon();
}

export function BHStorageMulti(val){
    if (global.stats.achieve['blackhole']){
        val *= 1 + global.stats.achieve.blackhole.l * BLACKHOLE_STORAGE_BONUS_PER_LEVEL;
    }
    return Math.round(val);
}

export function storageMultipler(scale = 1, wiki = false){
    let multiplier = ((global.tech['storage'] ?? 1) - 1) * 1.25 + 1;
    if (global.tech['storage'] >= 3){
        multiplier *= global.tech['storage'] >= 4 ? 3 : 1.5;
    }
    if (global.race['pack_rat']){
        multiplier *= 1 + (traits.pack_rat.vars()[1] / 100);
    }
    let fathom = fathomCheck('kobold');
    if (fathom > 0){
        multiplier *= 1 + (traits.pack_rat.vars(1)[1] / 100 * fathom);
    }
    if (global.tech['storage'] >= 6){
        multiplier *= 1 + (global.tech['supercollider'] / 1);
    }
    if (global.tech['tp_depot']){
        multiplier *= 1 + (global.tech['tp_depot'] / 20);
    }
    if (global.tech['shelving'] && global.tech.shelving >= 3){
        multiplier *= 1.5;
    }
    if (global.stats.achieve['blackhole']){
        multiplier *= 1 + global.stats.achieve.blackhole.l * BLACKHOLE_STORAGE_BONUS_PER_LEVEL;
    }
    multiplier *= global.tech['world_control'] ? 3 : 1;
    if (global.race['ascended']){
        multiplier *= 1.1;
    }
    if (global.blood['hoarder']){
        multiplier *= 1 + (global.blood['hoarder'] / 100);
    }
    if (global.tech['storage'] >= 7 && global.interstellar['cargo_yard']){
        multiplier *= 1 + ((global.interstellar['cargo_yard'].count * get_qlevel(wiki)) / 100);
    }
    return multiplier * scale;
}

export function registerTech(action){
    let tech = actions.tech[action].grant[0];
    if (!global.tech[tech]){
        global.tech[tech] = 0;
    }
    addAction('tech',action);
}

export function gainTech(action){
    let tech = actions.tech[action].grant[0];
    global.tech[tech] = actions.tech[action].grant[1];
    drawCity();
    drawTech();
    renderSpace();
    renderFortress();
    hooks.renderTauCeti();
    renderEdenic();
}

export function drawCity(){
    if (!global.settings.tabLoad && (global.settings.civTabs !== 1 || global.settings.spaceTabs !== 0)){
        return;
    }
    if (!global.settings.showCity){
        return;
    }
    let city_buildings = {};
    Object.keys(actions.city).forEach(function (city_name) {
        removeAction(actions.city[city_name].id);

        if(!checkCityRequirements(city_name))
            return;

        let action = actions.city[city_name];
        let category = 'category' in action ? action.category : 'utility';

        if(!(category in city_buildings)) {
            city_buildings[category] = [];
        }

        if (global.settings['cLabels']){
            city_buildings[category].push(city_name);
        }
        else {
            addAction('city', city_name);
        }
    });

    let city_categories =  [
        'outskirts',
        'residential',
        'commercial',
        'science',
        'military',
        'trade',
        'industrial',
        'utility'
    ];

    city_categories.forEach(function(category){
        clearElement($(`#city-dist-${category}`),true);
        if (global.settings['cLabels']){
            if(!(category in city_buildings))
                return;

            $(`<div id="city-dist-${category}" class="city"></div>`)
                .appendTo('#city')
                .append(`<div><h3 class="name has-text-warning">${loc(`city_dist_${category}`)}</h3></div>`);

            city_buildings[category].forEach(function(city_name) {
                addAction('city', city_name);
            });

            popover(`dist-${category}`, function(){
                return loc(`city_dist_${category}_desc`);
            },
            {
                elm: `#city-dist-${category} h3`,
                classes: `has-background-light has-text-dark`
            });
        }
    });

    set_cLabels(global.settings['cLabels']);
}
