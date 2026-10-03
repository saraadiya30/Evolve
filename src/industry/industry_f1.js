import { global } from '../core/vars.js';
import { clearElement } from '../functions/functions.js';
import { loc } from '../core/locale.js';
import { INFERNO_SMELTER_RATE } from '../config/smelter.js';
import { loadFactory, loadDroid, loadGraphene, loadNFactory } from './industry_f2.js';
import { loadPylon, loadQuarry, loadTMine, loadMiningShip, loadAlienSpaceStation, loadReplicator, loadMechStation } from './industry_f3.js';
import { loadSmelter_s1, loadSmelter_s2, loadSmelter_s3 } from '../sections/sec_loadSmelter_1.js';

// Fungsi-fungsi dipindah dari industry.js (urutan sumber dipertahankan). industry.js tetap mengekspor ulang nama yang tadinya ter-ekspor.


export function loadIndustry(industry,parent,bind){
    switch (industry){
        case 'smelter':
            loadSmelter(parent,bind);
            break;
        case 'factory':
            loadFactory(parent,bind);
            break;
        case 'droid':
            loadDroid(parent,bind);
            break;
        case 'graphene':
            loadGraphene(parent,bind);
            break;
        case 'pylon':
            loadPylon(parent,bind);
            break;
        case 'rock_quarry':
            loadQuarry(parent,bind);
            break;
        case 'titan_mine':
            loadTMine(parent,bind);
            break;
        case 'nanite_factory':
            loadNFactory(parent,bind);
            break;
        case 'mining_ship':
            loadMiningShip(parent,bind);
            break;
        case 'alien_space_station':
            loadAlienSpaceStation(parent,bind);
            break;
        case 'replicator':
            loadReplicator(parent,bind);
            break;
        case 'mech_station':
            loadMechStation(parent,bind);
            break;
    }
}

export function defineIndustry(){
    if (!global.settings.tabLoad && (global.settings.civTabs !== 2 || global.settings.govTabs !== 1)){
        return;
    }
    clearElement($('#industry'));

    if (smelterUnlocked()){
        var smelter = $(`<div id="iSmelter" class="industry"><h2 class="header has-text-advanced">${loc('city_smelter')}</h2></div>`);
        $(`#industry`).append(smelter);
        loadIndustry('smelter',smelter,'#iSmelter');
    }
    if ((global.city['factory'] && global.city.factory.count > 0) || (global.space['red_factory'] && global.space.red_factory.count > 0) || (global.tauceti['tau_factory'] && global.tauceti.tau_factory.count > 0) || (global.portal['hell_factory'] && global.portal.hell_factory.count > 0)){
        var factory = $(`<div id="iFactory" class="industry"><h2 class="header has-text-advanced">${loc('city_factory')}</h2></div>`);
        $(`#industry`).append(factory);
        loadIndustry('factory',factory,'#iFactory');
    }
    if (global.interstellar['mining_droid'] && global.interstellar.mining_droid.count > 0){
        var droid = $(`<div id="iDroid" class="industry"><h2 class="header has-text-advanced">${loc('interstellar_mining_droid_title')}</h2></div>`);
        $(`#industry`).append(droid);
        loadIndustry('droid',droid,'#iDroid');
    }
    if ((global.interstellar['g_factory'] && global.interstellar.g_factory.count > 0) || (global.portal['twisted_lab'] && global.portal.twisted_lab.count > 0)  || (global.space['g_factory'] && (global.space.g_factory.count > 0 || (global.tauceti['refueling_station'] && global.tauceti.refueling_station.count > 0)))){
        var graphene = $(`<div id="iGraphene" class="industry"><h2 class="header has-text-advanced">${global.race['warlord'] ? loc('portal_twisted_lab_title') : loc('interstellar_g_factory_title')}</h2></div>`);
        $(`#industry`).append(graphene);
        loadIndustry('graphene',graphene,'#iGraphene');
    }
    if (global.race['casting'] && (global.city['pylon'] || global.space['pylon'] || global.tauceti['pylon'])){
        var casting = $(`<div id="iPylon" class="industry"><h2 class="header has-text-advanced">${loc('city_pylon')}</h2></div>`);
        $(`#industry`).append(casting);
        loadIndustry('pylon',casting,'#iPylon');
    }
    if (global.race['smoldering'] && global.city['rock_quarry'] && !global.race['cataclysm'] && !global.race['orbit_decayed'] && !global.tech['isolation']){
        var ratio = $(`<div id="iQuarry" class="industry"><h2 class="header has-text-advanced">${loc('city_rock_quarry')}</h2></div>`);
        $(`#industry`).append(ratio);
        loadIndustry('rock_quarry',ratio,'#iQuarry');
    }
    if (global.space['titan_mine'] && global.space['titan_mine'].count > 0){
        var ratio = $(`<div id="iTMine" class="industry"><h2 class="header has-text-advanced">${loc('city_mine')}</h2></div>`);
        $(`#industry`).append(ratio);
        loadIndustry('titan_mine',ratio,'#iTMine');
    }
    if (global.tech['tau_roid'] && global.tech.tau_roid >= 4 && global.tauceti['mining_ship']){
        var mining_ship = $(`<div id="iMiningShip" class="industry"><h2 class="header has-text-advanced">${loc('tau_roid_mining_ship')}</h2></div>`);
        $(`#industry`).append(mining_ship);
        loadIndustry('mining_ship',mining_ship,'#iMiningShip');
    }
    if (global.tech['tau_gas2'] && global.tech.tau_gas2 === 6 && global.tauceti['alien_space_station'] && (!global.tech['alien_data'] || global.tech.alien_data < 6)){
        var alien_space_station = $(`<div id="iAlienSpaceStation" class="industry"><h2 class="header has-text-advanced">${loc('tau_gas2_alien_station')}</h2></div>`);
        $(`#industry`).append(alien_space_station);
        loadIndustry('alien_space_station',alien_space_station,'#iAlienSpaceStation');
    }
    if (global.race['deconstructor'] && global.city['nanite_factory']){
        var nanite = $(`<div id="iNFactory" class="industry"><h2 class="header has-text-advanced">${loc('city_nanite_factory')}</h2></div>`);
        $(`#industry`).append(nanite);
        loadIndustry('nanite_factory',nanite,'#iNFactory');
    }
    if (global.race['replicator'] && global.tech['replicator']){
        var replicator = $(`<div id="iReplicator" class="industry"><h2 class="header has-text-advanced">${global.race.universe === 'antimatter' ? loc('tech_antireplicator') : loc('tech_replicator')}</h2></div>`);
        $(`#industry`).append(replicator);
        loadIndustry('replicator',replicator,'#iReplicator');
    }
}

export function smelterFuelConfig(){
    let fuel = {
        d_fuel: 'Lumber',
        l_type: 'Lumber',
        l_cost: 3,
        // Discount coal cost for species that (usually) cannot burn lumber
        c_cost: (global.race['kindling_kindred'] || global.race['smoldering']) ? 0.15 : 0.25,
        // Oil bonus is free with Forge trait
        o_cost: global.race['forge'] ? 0 : 0.35,
    };

    if (global.race['evil']){
        if (global.race['soul_eater'] && global.race.species !== 'wendigo' && !global.race['artificial']){
            fuel.l_type = 'Food';
        }
        else {
            fuel.l_type = 'Furs';
            fuel.l_cost = 1;
        }
    }
    // Set default fuel to coal if it's not possible to burn lumber, souls, or flesh
    else if (global.race['kindling_kindred'] || global.race['smoldering']){
        fuel.d_fuel = 'Coal';
    }

    // Synthetics start with oil unlocked and always default to its use
    if (global.race['artificial']) {
        fuel.d_fuel = 'Oil';
    }

    return fuel;
}

export function loadSmelter(parent,bind){
    const $ctx = {};
    $ctx.parent = parent;
    $ctx.bind = bind;
    $ctx.tooltip = tooltip;
    $ctx.matText = matText;
    loadSmelter_s1($ctx);

    loadSmelter_s2($ctx);

    function tooltip(type){
        const fuel_config = smelterFuelConfig();
        switch(type){
            case 'wood':
                return loc('modal_build_wood',[global.resource[fuel_config.l_type].name, fuel_config.l_cost]);
            case 'coal':
                {
                    if (global.tech['uranium'] && global.tech['uranium'] >= 3){
                        return loc('modal_build_coal2',[fuel_config.c_cost,global.resource.Coal.name,global.resource.Uranium.name]);
                    }
                    else {
                        return loc('modal_build_coal1',[fuel_config.c_cost,global.resource.Coal.name]);
                    }
                }
            case 'oil':
                return global.race['forge'] ? loc('modal_build_forge') : loc('modal_build_oil',[fuel_config.o_cost,global.resource.Oil.name]);
            case 'star':
                return global.tech['irid_smelting'] ? loc('modal_build_star2',[global.resource.Titanium.name,global.resource.Iridium.name]) : loc('modal_build_star',[global.resource.Titanium.name]);
            case 'inferno':
                return loc('modal_build_inferno',[INFERNO_SMELTER_RATE.Coal,global.resource.Coal.name,INFERNO_SMELTER_RATE.Oil,global.resource.Oil.name,INFERNO_SMELTER_RATE.Infernite,global.resource.Infernite.name]);
        }
    }

    function matText(type){
        if (type === 'steel'){
            let boost = global.tech['smelting'] >= 4 ? 1.2 : 1;
            if (global.tech['smelting'] >= 5){
                boost *= 1.2;
            }
            if (global.tech['smelting'] >= 6){
                boost *= 1.2;
            }
            if (global.tech['smelting'] >= 7){
                boost *= 1.25;
            }
            if (global.race['pyrophobia']){
                boost *= 0.9;
            }
            return loc('modal_smelter_steel',[+(boost).toFixed(3),global.resource.Steel.name,global.resource.Coal.name,global.resource.Iron.name]);
        }
        else if (type === 'iridium'){
            let boost = global.tech['smelting'] >= 7 ? 6.25 : 5;
            if (global.race['pyrophobia']){
                boost *= 0.9;
            }
            return loc('modal_smelter_iron',[+(boost).toFixed(3),global.resource.Iridium.name]);
        }
        else {
            let boost = global.tech['smelting'] >= 3 ? (global.tech['smelting'] >= 7 ? 15 : 12) : 10;
            if (global.race['pyrophobia']){
                boost *= 0.9;
            }
            return loc('modal_smelter_iron',[+(boost).toFixed(3),global.resource.Iron.name]);
        }
    }

    loadSmelter_s3($ctx);
}

export function smelterUnlocked(){
    return global.city['smelter'] && (global.city.smelter.count > 0 || global.race['cataclysm'] || global.race['orbit_decayed'] || global.tech['isolation'] || global.race['warlord']);
}

export function addSmelter(num=1, product="Iron", fuel="Oil"){
    global.city.smelter.cap += num;
    global.city.smelter[product] += num; // ["Iron", "Steel", "Iridium"]
    global.city.smelter[fuel] += num; // ["Wood", "Coal", "Oil", "Star", "Inferno"]
    if (fuel === 'star') {
        global.city.smelter.StarCap += num;
    }
}
