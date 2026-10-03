import { calcPrestige, randomKey, clearElement, vBind, popover } from '../functions/functions.js';
import { global, p_on, gal_on } from '../core/vars.js';
import { loc } from '../core/locale.js';
import { galaxyProjects, spaceProjects, interstellarProjects } from './space_registry.js';
import { traits, races } from '../races/races.js';
import { BLACKHOLE_STORAGE_BONUS_PER_LEVEL } from '../config/storage.js';
import { syndicate } from '../truepath/truepath.js';
import { setAction } from '../actions/actions.js';
import { gatewayArmada, structDefinitions } from './space.js';
import { armada } from './armada_adjusters_and_planet_generation.js';

// Fungsi-fungsi dipindah dari space.js (urutan sumber dipertahankan). space.js tetap mengekspor ulang nama yang tadinya ter-ekspor.


export function astrialProjection(){
    let gains = calcPrestige('ascend');
    let plasmidType = global.race.universe === 'antimatter' ? loc('resource_AntiPlasmid_plural_name') : loc('resource_Plasmid_plural_name');
    return `<div class="has-text-advanced">${loc('interstellar_ascension_trigger_effect2',[gains.plasmid,plasmidType])}</div><div class="has-text-advanced">${loc('interstellar_ascension_trigger_effect2',[gains.phage,loc('resource_Phage_name')])}</div><div class="has-text-advanced">${loc('interstellar_ascension_trigger_effect2',[gains.harmony,loc('resource_Harmony_name')])}</div><div>${loc('interstellar_ascension_trigger_effect3')}</div>`;
}

export function terraformProjection(){
    let gains = calcPrestige('terraform');
    let plasmidType = global.race.universe === 'antimatter' ? loc('resource_AntiPlasmid_plural_name') : loc('resource_Plasmid_plural_name');
    return `<div class="has-text-advanced">${loc('interstellar_ascension_trigger_effect2',[gains.plasmid,plasmidType])}</div><div class="has-text-advanced">${loc('interstellar_ascension_trigger_effect2',[gains.phage,loc('resource_Phage_name')])}</div><div class="has-text-advanced">${loc('interstellar_ascension_trigger_effect2',[gains.harmony,loc('resource_Harmony_name')])}</div><div>${loc('space_terraformer_effect3')}</div>`;
}

export function convertSpaceSector(part){
    let space = 'space';
    if (part.substr(0,4) === 'int_'){
        space = 'interstellar';
    }
    else if (part.substr(0,5) === 'prtl_'){
        space = 'portal';
    }
    else if (part.substr(0,4) === 'gxy_'){
        space = 'galaxy';
    }
    else if (part.substr(0,4) === 'tau_'){
        space = 'tauceti';
    }
    else if (part.substr(0,5) === 'eden_'){
        space = 'eden';
    }
    return space;
}

export function piracy(region,rating,raw,wiki){
    if (global.tech['piracy'] && !global.race['truepath']){
        let armada = 0;
        for (let i = gatewayArmada.length - 1; i >= 0; i--){
            let ship = gatewayArmada[i];
            if (!global.galaxy.defense[region].hasOwnProperty(ship)){
                global.galaxy.defense[region][ship] = 0;
            }
            let count = global.galaxy.defense[region][ship];
            armada += count * galaxyProjects.gxy_gateway[ship].ship.rating();
        }

        let pirate = 0;
        let pillage = 0.75;
        switch(region){
            case 'gxy_stargate':
                pirate = 0.1 * (global.race['instinct'] ? global.tech.piracy * 0.9 : global.tech.piracy);
                pillage = 0.5;
                break;
            case 'gxy_gateway':
                pirate = 0.1 * (global.race['instinct'] ? global.tech.piracy * 0.9 : global.tech.piracy);
                pillage = 1;
                break;
            case 'gxy_gorddon':
                pirate = global.race['instinct'] ? 720 : 800;
                break;
            case 'gxy_alien1':
                pirate = global.race['instinct'] ? 900 : 1000;
                break;
            case 'gxy_alien2':
                pirate = global.race['instinct'] ? 2250 : 2500;
                pillage = 1;
                break;
            case 'gxy_chthonian':
                pirate = global.race['instinct'] ? 7000 : 7500;
                pillage = 1;
                break;
        }

        if (global.race['chicken']){
            pirate *= 1 + (traits.chicken.vars()[1] / 100);
        }

        if (global.race['ocular_power'] && global.race['ocularPowerConfig'] && global.race.ocularPowerConfig.f){
            pirate *= 1 - (traits.ocular_power.vars()[1] / 500);
        }

        let num_def_plat_on = wiki ? (global.galaxy?.defense_platform?.on ?? 0) : p_on['defense_platform'];
        if (region === 'gxy_stargate' && num_def_plat_on){
            armada += num_def_plat_on * 20;
        }

        let num_starbase_on = wiki ? (global.galaxy?.starbase?.on ?? 0) : p_on['starbase'];
        if (region === 'gxy_gateway' && num_starbase_on){
            armada += num_starbase_on * 25;
        }

        let num_foothold_on = wiki ? (global.galaxy?.foothold?.on ?? 0) : p_on['foothold'];
        if (region === 'gxy_alien2' && num_foothold_on){
            armada += num_foothold_on * 50;
            let num_armed_miner_on = wiki ? global.galaxy.armed_miner.on : gal_on['armed_miner'];
            if (num_armed_miner_on){
                armada += num_armed_miner_on * galaxyProjects.gxy_alien2.armed_miner.ship.rating();
            }
        }

        if (region === 'gxy_chthonian'){
            let num_minelayer_on = wiki ? (global.galaxy?.minelayer?.on ?? 0) : gal_on['minelayer'];
            if (num_minelayer_on){
                armada += num_minelayer_on * galaxyProjects.gxy_chthonian.minelayer.ship.rating();
            }
            let num_raider_on = wiki ? (global.galaxy?.raider?.on ?? 0) : gal_on['raider'];
            if (num_raider_on){
                armada += num_raider_on * galaxyProjects.gxy_chthonian.raider.ship.rating();
            }
        }

        if (raw){
            return armada;
        }

        if (region !== 'gxy_stargate'){
            let patrol = armada > pirate ? pirate : armada;
            return ((1 - (pirate - patrol) / pirate) * pillage + (1 - pillage)) * (rating ? 1 : piracy('gxy_stargate',false,false,wiki));
        }
        else {
            let patrol = armada > pirate ? pirate : armada;
            return (1 - (pirate - patrol) / pirate) * pillage + (1 - pillage);
        }
    }
    else {
        return 1;
    }
}

export function xeno_race(){
    let skip = ['protoplasm',global.race.species];
    if (global.city.hasOwnProperty('surfaceDwellers')){
        skip.push(...global.city.surfaceDwellers);
    }
    if (!global.custom.hasOwnProperty('race0')){
        skip.push('custom');
    }
    if (!global.custom.hasOwnProperty('race1')){
        skip.push('hybrid');
    }
    
    let list = Object.keys(races).filter(function(r){ return !['demonic','eldritch'].includes(races[r].type) && !skip.includes(r) });
    let key1 = randomKey(list);
    global.galaxy['alien1'] = {
        id: list[key1]
    };
    skip.push(list[key1]);

    list = Object.keys(races).filter(function(r){ return !['angelic'].includes(races[r].type) && !skip.includes(r) });
    let key2 = randomKey(list);
    global.galaxy['alien2'] = {
        id: list[key2]
    };
}

export function gatewayStorage(){
    let multiplier = 1;
    if (global.race['pack_rat']){
        multiplier *= 1.05;
    }
    if (global.stats.achieve['blackhole']){
        multiplier *= 1 + global.stats.achieve.blackhole.l * BLACKHOLE_STORAGE_BONUS_PER_LEVEL;
    }
    multiplier *= global.tech['world_control'] ? 2 : 1;
    return multiplier;
}

export function incrementStruct(c_action,sector){
    let struct = c_action;
    if (typeof c_action === 'object'){
        struct = c_action.struct().p[0];
        sector = c_action.struct().p[1];
    }
    if (!sector){
        sector = 'space';
    }
    if (!global[sector][struct]){
        global[sector][struct] = typeof c_action === 'object' ? c_action.struct().d : structDefinitions[struct];
    }
    if (global.race['living_materials'] || global[sector][struct]['l_m']){
        global[sector][struct]['l_m'] = 0;
    }
    global[sector][struct].count++;
}

export function spaceTech(r,k){
    if (r && k){
        return spaceProjects[r][k];
    }
    return spaceProjects;
}

export function interstellarTech(){
    return interstellarProjects;
}

export function galaxyTech(){
    return galaxyProjects;
}

export function checkSpaceRequirements(era,region,action){
    switch (era){
        case 'space':
            return checkRequirements(spaceProjects,region,action);
        case 'interstellar':
            return checkRequirements(interstellarProjects,region,action);
        case 'galaxy':
            return checkRequirements(galaxyProjects,region,action);
    }
}

export function checkRequirements(action_set,region,action){
    let path = global.race['truepath'] ? 'truepath' : 'standard';
    if (action_set[region][action].hasOwnProperty('path') && !action_set[region][action].path.includes(path)){
        return false;
    }
    var isMet = true;
    Object.keys(action_set[region][action].reqs).forEach(function (req){
        if (!global.tech[req] || global.tech[req] < action_set[region][action].reqs[req]){
            isMet = false;
        }
    });
    if (isMet && action_set[region][action].hasOwnProperty('condition') && !action_set[region][action].condition()){
        isMet = false;
    }
    if (isMet && action_set[region][action].hasOwnProperty('not_trait')){
        for (let trait of action_set[region][action].not_trait){
            if (global.race[trait]){
                isMet = false;
            }
        }
    }
    if (isMet && action_set[region][action].grant && (global.tech[action_set[region][action].grant[0]] && global.tech[action_set[region][action].grant[0]] >= action_set[region][action].grant[1])){
        isMet = false;
    }
    return isMet;
}

export function renderSpace(){
    if (!global.settings.tabLoad && global.settings.civTabs !== 1){
        return;
    }
    space('inner');
    if (global.race['truepath']){
        space('outer');
    }
    deepSpace();
    galaxySpace();
}

function space(zone){
    if (!zone){
        zone = global.settings.spaceTabs === 5 ? 'outer' : 'inner';
    }
    if (!global.settings.tabLoad){
        if (global.settings.civTabs !== 1 || ![1,5].includes(global.settings.spaceTabs) || (global.settings.civTabs === 1 && (global.settings.spaceTabs === 1 && zone !== 'inner') || (global.settings.spaceTabs === 5 && zone !== 'outer'))){
            return;
        }
    }
    let parent = zone === 'inner' ? $('#space') : $('#outerSol');
    clearElement(parent);
    parent.append($(`<h2 class="is-sr-only">${loc(zone === 'inner' ? 'tab_space' : 'tab_outer_space')}</h2>`));
    if (!global.settings.showSpace){
        return false;
    }

    let regionOrder = [];
    Object.keys(spaceProjects).forEach(function (region){
        if (global.race['orbit_decayed'] || global.race['cataclysm']){
            if (region !== 'spc_home'){
                regionOrder.push(region);
                if (global.race['orbit_decayed'] && region === 'spc_red'){
                    regionOrder.push('spc_home');
                }
                else if (global.race['cataclysm'] && region === 'spc_moon'){
                    regionOrder.push('spc_home');
                }
            }
        }
        else {
            regionOrder.push(region);
        }
    });

    regionOrder.forEach(function (region){
        let show = region.replace("spc_","");
        if (global.settings.space[`${show}`]){
            if (global.race['truepath'] && spaceProjects[region].info.zone !== zone){
                return;
            }
            let name = typeof spaceProjects[region].info.name === 'string' ? spaceProjects[region].info.name : spaceProjects[region].info.name();
            let noHome = global.race['orbit_decayed'] || global.race['cataclysm'] ? true : false;

            if ((noHome && region !== 'spc_home') || !noHome){
                if (spaceProjects[region].info['support']){
                    let support = spaceProjects[region].info['support'];
                    if (!global.space[support].hasOwnProperty('support')){
                        global.space[support]['support'] = 0;
                        global.space[support]['s_max'] = 0;
                    }
                    parent.append(`<div id="${region}" class="space"><div id="sr${region}"><h3 class="name has-text-warning">${name}</h3> <span v-show="s_max">{{ support }}/{{ s_max }}</span></div></div>`);
                    vBind({
                        el: `#sr${region}`,
                        data: global.space[support]
                    });
                }
                else {
                    parent.append(`<div id="${region}" class="space"><div><h3 class="name has-text-warning">${name}</h3></div></div>`);
                }

                if (global.race['truepath'] && spaceProjects[region].info.hasOwnProperty('syndicate') && spaceProjects[region].info.syndicate() && global.tech['syndicate']){
                    $(`#${region}`).append(`<div id="${region}synd" v-show="${region}"></div>`);

                    $(`#${region}synd`).append(`<span class="syndThreat has-text-caution">${loc('space_syndicate')} <span class="has-text-danger" v-html="threat('${region}')"></span></span>`);
                    $(`#${region}synd`).append(`<span class="syndThreat has-text-caution">${loc('space_scan_effectiveness')} <span class="has-text-warning" v-html="scan('${region}')"></span></span>`);
                    $(`#${region}synd`).append(`<span v-show="overkill('${region}')" class="syndThreat has-text-caution">${loc('space_overkill')} <span class="has-text-warning" v-html="overkill('${region}')"></span></span>`);
                    vBind({
                        el: `#${region}synd`,
                        data: global.space.syndicate,
                        methods: {
                            threat(r){
                                if (global.space.hasOwnProperty('shipyard') && global.space.shipyard.hasOwnProperty('ships')){
                                    let synd = syndicate(r,true);
                                    if (synd.s >= 10){
                                        return synd.s >= 50 ? synd.r : Math.round(synd.r * synd.s * 0.02);
                                    }
                                }
                                return '???';
                            },
                            scan(r){
                                if (global.space.hasOwnProperty('shipyard') && global.space.shipyard.hasOwnProperty('ships')){
                                    let synd = syndicate(r,true);
                                    return +((synd.s + 25) / 1.25).toFixed(1) + '%';
                                }
                                return loc(`galaxy_piracy_none`);
                            },
                            overkill(r){
                                if (global.space.hasOwnProperty('shipyard') && global.space.shipyard.hasOwnProperty('ships')){
                                    let synd = syndicate(r,true);
                                    return synd.s >= 100 ? synd.o : 0;
                                }
                                return 0;
                            }
                        }
                    });

                    if (spaceProjects[region].info.hasOwnProperty('extra')){
                        spaceProjects[region].info.extra(region);
                    }
                }
            }

            popover(region, function(){
                    return typeof spaceProjects[region].info.desc === 'string' ? spaceProjects[region].info.desc : spaceProjects[region].info.desc();
                },
                {
                    elm: `#${region} h3.name`,
                    classes: `has-background-light has-text-dark`
                }
            );

            Object.keys(spaceProjects[region]).forEach(function (tech){
                if (tech !== 'info' && checkRequirements(spaceProjects,region,tech)){
                    let c_action = spaceProjects[region][tech];
                    setAction(c_action,zone === 'inner' ? 'space' : 'outerSol',tech);
                }
            });
        }
    });
}

export function deepSpace(){
    if (!global.settings.tabLoad && (global.settings.civTabs !== 1 || global.settings.spaceTabs !== 2)){
        return;
    }
    let parent = $('#interstellar');
    clearElement(parent);
    parent.append($(`<h2 class="is-sr-only">${loc('tab_interstellar')}</h2>`));
    if (!global.settings.showDeep){
        return false;
    }

    Object.keys(interstellarProjects).forEach(function (region){
        let show = region.replace("int_","");
        if (global.settings.space[`${show}`]){
            let name = typeof interstellarProjects[region].info.name === 'string' ? interstellarProjects[region].info.name : interstellarProjects[region].info.name();

            if (interstellarProjects[region].info['support']){
                let support = interstellarProjects[region].info['support'];
                if (!global.interstellar[support].hasOwnProperty('support')){
                    global.interstellar[support]['support'] = 0;
                    global.interstellar[support]['s_max'] = 0;
                }
                parent.append(`<div id="${region}" class="space"><div id="sr${region}"><h3 class="name has-text-warning">${name}</h3> <span v-show="s_max">{{ support }}/{{ s_max }}</span></div></div>`);
                vBind({
                    el: `#sr${region}`,
                    data: global.interstellar[support]
                });
            }
            else {
                parent.append(`<div id="${region}" class="space"><div><h3 class="name has-text-warning">${name}</h3></div></div>`);
            }

            popover(region, function(){
                    return typeof interstellarProjects[region].info.desc === 'string' ? interstellarProjects[region].info.desc : interstellarProjects[region].info.desc();
                },
                {
                    elm: `#${region} h3.name`,
                    classes: `has-background-light has-text-dark`
                }
            );

            Object.keys(interstellarProjects[region]).forEach(function (tech){
                if (tech !== 'info' && checkRequirements(interstellarProjects,region,tech)){
                    let c_action = interstellarProjects[region][tech];
                    setAction(c_action,'interstellar',tech);
                }
            });
        }
    });
}

export function galaxySpace(){
    if (!global.settings.tabLoad && (global.settings.civTabs !== 1 || global.settings.spaceTabs !== 3)){
        return;
    }
    let parent = $('#galaxy');
    clearElement(parent);
    parent.append($(`<h2 class="is-sr-only">${loc('tab_galactic')}</h2>`));
    if (!global.settings.showGalactic){
        return false;
    }

    armada(parent,'fleet');

    Object.keys(galaxyProjects).forEach(function (region){
        let show = region.replace("gxy_","");
        if (global.galaxy['defense'] && !global.galaxy.defense.hasOwnProperty(region)){
            global.galaxy.defense[region] = {};
        }
        if (global.settings.space[`${show}`]){
            let name = typeof galaxyProjects[region].info.name === 'string' ? galaxyProjects[region].info.name : galaxyProjects[region].info.name();

            let regionContent = $(`<div id="${region}" class="space"></div>`);
            parent.append(regionContent);
            let regionHeader = $(`<h3 class="name has-text-warning">${name}</h3>`);
            regionContent.append(regionHeader);

            if (global.tech['xeno'] && global.tech['xeno'] >= 3){
                regionContent.append(`<span class="regionControl has-text-${galaxyProjects[region].info.control().color}">{{ r.control().name }}</span>`);
            }

            let vData = {
                el: `#${region}`,
                data: {
                    r: galaxyProjects[region].info
                },
                methods: {
                    threat(r){
                        let scouts_req = global.race['infiltrator'] ? 1 : 2;
                        if (global.galaxy.defense[r].scout_ship >= scouts_req){
                            let pirates = (1 - piracy(r,true)) * 100;
                            pirates = (pirates < 1) ? Math.ceil(pirates) : Math.round(pirates);
                            if (pirates === 0){
                                return "has-text-success";
                            }
                            else if (pirates <= 20){
                                return "has-text-advanced";
                            }
                            else if (pirates <= 40){
                                return "has-text-info";
                            }
                            else if (pirates <= 60){
                                return "has-text-warning";
                            }
                            else if (pirates <= 80){
                                return "has-text-caution";
                            }
                            else {
                                return "has-text-danger";
                            }
                        }
                        return "has-text-danger";
                    }
                },
                filters: {
                    pirate(r){
                        let scouts_req = global.race['infiltrator'] ? 1 : 2;
                        if (global.galaxy.defense[r].scout_ship >= scouts_req){
                            let pirates = (1 - piracy(r,true)) * 100;
                            pirates = (pirates < 1) ? Math.ceil(pirates) : Math.round(pirates);
                            let adv_req = global.race['infiltrator'] ? 3 : 4;
                            if (global.galaxy.defense[r].scout_ship >= adv_req){
                                return `${pirates}%`;
                            }
                            else {
                                if (pirates === 0){
                                    return loc('galaxy_piracy_none');
                                }
                                else if (pirates <= 20){
                                    return loc('galaxy_piracy_vlow');
                                }
                                else if (pirates <= 40){
                                    return loc('galaxy_piracy_low');
                                }
                                else if (pirates <= 60){
                                    return loc('galaxy_piracy_avg');
                                }
                                else if (pirates <= 80){
                                    return loc('galaxy_piracy_high');
                                }
                                else {
                                    return loc('galaxy_piracy_vhigh');
                                }
                            }
                        }
                        return '???';
                    },
                    defense(r){
                        return piracy(r,true,true);
                    }
                }
            };

            if (galaxyProjects[region].info['support']){
                let support = galaxyProjects[region].info['support'];
                if (global.galaxy[support]){
                    if (!global.galaxy[support].hasOwnProperty('support')){
                        global.galaxy[support]['support'] = 0;
                        global.galaxy[support]['s_max'] = 0;
                    }
                    regionContent.append(`<span class="regionSupport" v-show="s.s_max">{{ s.support }}/{{ s.s_max%1 ? s.s_max.toFixed(2) : s.s_max }}</span>`);
                    vData.data['s'] = global.galaxy[support];
                }
            }

            if (global.tech['piracy']){
                regionContent.append(`<div><span class="has-text-caution pirate">${loc('galaxy_piracy_threat',[races[global.galaxy.alien2.id].name])}</span><span :class="threat('${region}')">{{ '${region}' | pirate }}</span><span class="sep">|</span><span class="has-text-warning">${loc('galaxy_armada')}</span>: <span class="has-text-success">{{ '${region}' | defense }}</span></div>`);
            }

            vBind(vData);

            popover(region, function(){
                    return typeof galaxyProjects[region].info.desc === 'string' ? galaxyProjects[region].info.desc : galaxyProjects[region].info.desc();
                },
                {
                    elm: `#${region} h3.name`,
                    classes: `has-background-light has-text-dark`
                }
            );

            popover(region, function(){
                    return loc('galaxy_control',[galaxyProjects[region].info.control().name,name]);
                },
                {
                    elm: `#${region} .regionControl`,
                    classes: `has-background-light has-text-dark`
                }
            );

            Object.keys(galaxyProjects[region]).forEach(function (tech){
                if (tech !== 'info' && checkRequirements(galaxyProjects,region,tech)){
                    let c_action = galaxyProjects[region][tech];
                    setAction(c_action,'galaxy',tech);
                }
            });
        }
    });
}
