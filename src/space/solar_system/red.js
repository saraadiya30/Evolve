import { loc } from '../../core/locale.js';
import { global, p_on, support_on, sizeApproximation, int_on } from '../../core/vars.js';
import { payCosts, initStruct, bank_vault, powerOnNewStruct, buildTemplate, structName, drawTech, actions, templeCount, templeEffect } from '../../actions/actions.js';
import { messageQueue, spaceCostMultiplier, powerCostMod, clearPopper, eventActive, darkEffect } from '../../functions/functions.js';
import { spatialReasoning, unlockContainers } from '../../resources/resources.js';
import { jobScale } from '../../civics/jobs.js';
import { govActive } from '../../governor/governor.js';
import { BLACKHOLE_STORAGE_BONUS_PER_LEVEL } from '../../config/storage.js';
import { production, highPopAdjust } from '../../resources/prod.js';
import { defineIndustry } from '../../industry/industry.js';
import { unlockAchieve } from '../../achievements/achieve.js';
import { races, traits } from '../../races/races.js';
import { spaceProjects } from '../space_registry.js';
import { planetName, fuel_adjust, incrementStruct, renderSpace, terraformProjection, terraformLab, house_adjust } from '../space.js';

// Region 'spc_red' dari spaceProjects (dipisah dari space.js). Isi sama persis; digabung via space_registry.js di space.js.
export const spaceProjects_spc_red = {
        info: {
            name(){
                return planetName().red;
            },
            desc(){
                return loc('space_red_info_desc',[planetName().red]);
            },
            support: 'spaceport',
            zone: 'inner',
            syndicate(){ return true; }
        },
        red_mission: {
            id: 'space-red_mission',
            title(){
                return loc('space_mission_title',[planetName().red]);
            },
            desc(){
                return loc('space_mission_desc',[planetName().red]);
            },
            reqs: { space: 3, space_explore: 3 },
            grant: ['space',4],
            queue_complete(){ return global.tech.space >= 4 ? 0 : 1; },
            cost: {
                Helium_3(offset,wiki){ return +fuel_adjust(4500,false,wiki).toFixed(0); }
            },
            effect(){
                return loc('space_red_mission_effect',[planetName().red]);
            },
            action(args){
                if (payCosts($(this)[0])){
                    messageQueue(loc('space_red_mission_action',[planetName().red]),'info',false,['progress']);
                    initStruct(spaceProjects.spc_red.living_quarters);
                    initStruct(spaceProjects.spc_red.garage);
                    initStruct(spaceProjects.spc_red.red_mine);
                    initStruct(spaceProjects.spc_red.fabrication);
                    return true;
                }
                return false;
            }
        },
        spaceport: {
            id: 'space-spaceport',
            title: loc('space_red_spaceport_title'),
            desc(){ return `<div>${loc('space_red_spaceport_desc')}</div><div class="has-text-special">${loc('requires_power_space',[global.resource.Food.name])}</div>`; },
            reqs: { space: 4 },
            cost: {
                Money(offset){ return spaceCostMultiplier('spaceport', offset, 47500, 1.32); },
                Iridium(offset){ return spaceCostMultiplier('spaceport', offset, 1750, 1.32); },
                Mythril(offset){ return spaceCostMultiplier('spaceport', offset, 25, 1.32); },
                Titanium(offset){ return spaceCostMultiplier('spaceport', offset, 22500, 1.32); }
            },
            effect(wiki){
                let helium = +(fuel_adjust($(this)[0].support_fuel().a,true,wiki)).toFixed(2);
                let bank = ``;
                if (global.race['cataclysm'] || global.race['orbit_decayed']){
                    let vault = spatialReasoning(bank_vault() * 4);
                    bank = `<div>${loc('plus_max_resource',[`\$${vault}`,loc('resource_Money_name')])}</div>`;
                }
                return `<div>${loc('space_red_spaceport_effect1',[planetName().red,$(this)[0].support()])}</div>${bank}<div class="has-text-caution">${loc('space_red_spaceport_effect2',[helium,$(this)[0].powered()])}</div><div class="has-text-caution">${loc('spend',[global.race['cataclysm'] || global.race['orbit_decayed'] ? 2 : 25,global.resource.Food.name])}</div>`;
            },
            support(){
                let support = global.race['cataclysm'] || global.race['orbit_decayed'] ? 4 : 3;
                if (global.stats.achieve['iron_will'] && global.stats.achieve.iron_will.l >= 4){ support++; }
                return support;
            },
            support_fuel(){ return { r: 'Helium_3', a: 1.25 }; },
            powered(){ return powerCostMod(5); },
            powerBalancer(){
                return [{ s: global.space.spaceport.s_max - global.space.spaceport.support }];
            },
            refresh: true,
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('spaceport');
                    powerOnNewStruct($(this)[0]);
                    if (!global.tech['mars']){
                        global.tech['mars'] = 1;
                    }
                    if (global.race['orbit_decay'] && global.race.orbit_decay > global.stats.days + 1000){
                        global.race.orbit_decay = global.stats.days + 1000;
                        messageQueue(loc('evo_challenge_orbit_decayed_accelerated',[global.race.orbit_decay - global.stats.days]),'info',false,['progress']);
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: {
                        count: 0,
                        on: 0,
                        support: 0,
                        s_max: 0
                    },
                    p: ['spaceport','space']
                };
            },
        },
        red_tower: {
            id: 'space-red_tower',
            title: loc('space_red_tower_title'),
            desc(){
                return `<div>${loc('space_red_tower_desc')}</div><div class="has-text-special">${loc('requires_power')}</div>`;
            },
            reqs: { mars: 3 },
            cost: {
                Money(offset){ return spaceCostMultiplier('red_tower', offset, 225000, 1.28); },
                Iron(offset){ return spaceCostMultiplier('red_tower', offset, 22000, 1.28); },
                Cement(offset){ return spaceCostMultiplier('red_tower', offset, 15000, 1.28); },
                Alloy(offset){ return spaceCostMultiplier('red_tower', offset, 8000, 1.28); },
            },
            effect(){
                return `<div>${loc('space_red_spaceport_effect1',[planetName().red, global.race['cataclysm'] || global.race['fasting'] ? 2 : 1])}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
            },
            powered(){ return powerCostMod(2); },
            powerBalancer(){
                return [{ s: global.space.spaceport.s_max - global.space.spaceport.support }];
            },
            support(){ return global.race['cataclysm'] || global.race['fasting'] ? 2 : 1; },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('red_tower');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['red_tower','space']
                };
            },
        },
        captive_housing: buildTemplate(`captive_housing`,'space'),
        terraformer: {
            id: 'space-terraformer',
            title: loc('space_terraformer'),
            desc(wiki){
                if (!global.space.hasOwnProperty('terraformer') || global.space.terraformer.count < 100 || wiki){
                    return `<div>${loc('space_terraformer')}</div><div class="has-text-special">${loc('requires_segments',[100])}</div>` + (global.space.hasOwnProperty('terraformer') && global.space.terraformer.count >= 100 ? `<div class="has-text-special">${loc('requires_power')}</div>` : ``);
                }
                else {
                    return `<div>${loc('space_terraformer')}</div>`;
                }
            },
            reqs: { terraforming: 1 },
            condition(){
                return global.space.terraformer.count >= 100 ? false : true;
            },
            queue_size: 5,
            queue_complete(){ return 100 - global.space.terraformer.count; },
            cost: {
                Money(offset){ return ((offset || 0) + (global.space.hasOwnProperty('terraformer') ? global.space.terraformer.count : 0)) < 100 ? (global.race['truepath'] ? 7500000 : 75000000) : 0; },
                Alloy(offset){ return ((offset || 0) + (global.space.hasOwnProperty('terraformer') ? global.space.terraformer.count : 0)) < 100 ? (global.race['truepath'] ? 250000 : 750000) : 0; },
                Neutronium(offset){ return ((offset || 0) + (global.space.hasOwnProperty('terraformer') ? global.space.terraformer.count : 0)) < 100 ? 125000 : 0; },
                Elerium(offset){ return ((offset || 0) + (global.space.hasOwnProperty('terraformer') ? global.space.terraformer.count : 0)) < 100 ? 1000 : 0; },
                Bolognium(offset){ return ((offset || 0) + (global.space.hasOwnProperty('terraformer') ? global.space.terraformer.count : 0)) < 100 ? (global.race['truepath'] ? 0 : 100000) : 0; },
                Orichalcum(offset){ return ((offset || 0) + (global.space.hasOwnProperty('terraformer') ? global.space.terraformer.count : 0)) < 100 ? (global.race['truepath'] ? 12000 : 250000) : 0; },
                Soul_Gem(offset){ return ((offset || 0) + (global.space.hasOwnProperty('terraformer') ? global.space.terraformer.count : 0)) < 100 ? (global.race['truepath'] ? 0 : 1) : 0; },
                Nanoweave(offset){ return ((offset || 0) + (global.space.hasOwnProperty('terraformer') ? global.space.terraformer.count : 0)) < 100 ? (global.race['truepath'] ? 0 : 75000) : 0; },
                Quantium(offset){ return ((offset || 0) + (global.space.hasOwnProperty('terraformer') ? global.space.terraformer.count : 0)) < 100 ? (global.race['truepath'] ? 75000 : 0) : 0; },
                Cipher(offset){ return ((offset || 0) + (global.space.hasOwnProperty('terraformer') ? global.space.terraformer.count : 0)) < 100 ? (global.race['truepath'] ? 1000 : 0) : 0; },
            },
            effect(wiki){
                let count = (wiki?.count ?? 0) + (global.space.hasOwnProperty('terraformer') ? global.space.terraformer.count : 0);
                if (count < 100){
                    let remain = 100 - count;
                    return `<div>${loc('space_terraformer_effect')}</div><div class="has-text-special">${loc('space_dwarf_collider_effect2',[remain])}</div>`;
                }
                else {
                    return spaceProjects.spc_red.atmo_terraformer.effect(wiki);
                }
            },
            action(args){
                if (payCosts($(this)[0])){
                    if (global.space.terraformer.count < 100){
                        incrementStruct('terraformer','space');
                        if (global.space.terraformer.count >= 100){
                            global.tech['terraforming'] = 2;
                            global.space['atmo_terraformer'] = { count: 1, on: 0 };
                            renderSpace();
                            clearPopper();
                        }
                        return true;
                    }
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['terraformer','space']
                };
            },
        },
        atmo_terraformer: {
            id: 'space-atmo_terraformer',
            title: loc('space_terraformer'),
            desc(){ return `<div>${loc('space_terraformer')}</div><div class="has-text-special">${loc('requires_power')}</div>`; },
            wiki: false,
            reqs: { terraforming: 2 },
            condition(){
                return global.space.terraformer.count >= 100 ? true : false;
            },
            queue_complete(){ return 0; },
            cost: {},
            powered(wiki){
                return powerCostMod((wiki ? wiki.truepath : global.race['truepath']) ? 500 : 5000);
            },
            postPower(o){
                if (o && p_on['atmo_terraformer']){
                    // Powered on and energized
                    global.tech.terraforming = 3;
                    renderSpace();
                }
                else {
                    if (global.tech.terraforming > 2){
                        // Disabled or lost power
                        global.tech.terraforming = 2;
                        renderSpace();
                    }
                    if (o){
                        // Not powered yet, check again soon
                        return true;
                    }
                }
            },
            effect(wiki){
                let reward = terraformProjection();
                let power = $(this)[0].powered(wiki);
                let power_label = power > 0 ? `<div class="has-text-caution">${loc('minus_power',[power])}</div>` : '';
                return `<div>${loc('space_terraformer_effect2')}</div>${reward}${power_label}`;
            },
            action(args){
                return false;
            }
        },
        terraform: {
            id: 'space-terraform',
            title: loc('space_terraform'),
            desc: loc('space_terraform'),
            reqs: { terraforming: 3 },
            queue_complete(){ return 0; },
            no_multi: true,
            cost: {},
            effect(){
                let reward = terraformProjection();
                return `<div>${loc('space_terraform_effect')}</div>${reward}`;
            },
            action(args){
                if (payCosts($(this)[0])){
                    terraformLab();
                    return true;
                }
                return false;
            }
        },
        assembly: buildTemplate(`assembly`,'space'),
        living_quarters: {
            id: 'space-living_quarters',
            title(){
                let halloween = eventActive('halloween');
                if (halloween.active){
                    return loc(`events_halloween_red_housing`);
                }
                return loc('space_red_living_quarters_title');
            },
            desc(){
                return `<div>${loc('space_red_living_quarters_desc')}</div><div class="has-text-special">${loc('space_support',[planetName().red])}</div>`;
            },
            reqs: { mars: 1 },
            cost: {
                Money(offset){ return spaceCostMultiplier('living_quarters', offset, house_adjust(38000), 1.28); },
                Steel(offset){ return spaceCostMultiplier('living_quarters', offset, house_adjust(15000), 1.28); },
                Polymer(offset){ return spaceCostMultiplier('living_quarters', offset, house_adjust(9500), 1.28); },
                Horseshoe(){ return global.race['hooved'] ? 2 : 0; }
            },
            effect(wiki){
                let gain = $(this)[0].citizens(wiki);
                let safe = ``;
                if (global.race['cataclysm'] || global.race['orbit_decayed']){
                    let vault = spatialReasoning(global.tech.home_safe >= 2 ? (global.tech.home_safe >= 3 ? '100000' : '50000') : '25000');
                    safe = `<div>${loc('plus_max_resource',[`\$${vault}`,loc('resource_Money_name')])}</div>`;
                }
                return `<div class="has-text-caution">${loc('space_used_support',[planetName().red])}</div>${safe}<div>${loc('plus_max_resource',[jobScale(1),global.race['truepath'] ? loc('job_colonist_tp',[planetName().red]) : loc('colonist')])}</div><div>${loc('plus_max_resource',[gain,loc('citizen')])}</div>`;
            },
            s_type: 'red',
            support(){ return -1; },
            powered(){ return 0; },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('living_quarters');
                    global.civic.colonist.display = true;
                    if (powerOnNewStruct($(this)[0])){
                        global.resource[global.race.species].max += jobScale(1);

                        let hiredMax = jobScale(1);
                        global.civic.colonist.max += hiredMax;

                        let hired = Math.min(hiredMax, global.civic[global.civic.d_job].workers);
                        global.civic[global.civic.d_job].workers -= hired;
                        global.civic.colonist.workers += hired;
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['living_quarters','space']
                };
            },
            citizens(wiki){
                let gain = global.race['cataclysm'] || global.race['orbit_decayed'] ? 2 : 1;
                let biodome_count = wiki ? (global.space?.biodome?.on ?? 0) : support_on['biodome'];
                if (biodome_count){
                    let pop = global.tech.mars >= 6 ? 0.1 : 0.05;
                    gain += pop * biodome_count;
                }
                return +(jobScale(gain)).toFixed(2);
            }
        },
        pylon: {
            id: 'space-pylon',
            title: loc('space_red_pylon'),
            desc: loc('space_red_pylon'),
            reqs: { magic: 2 },
            condition(){ return global.race['cataclysm'] || global.race['orbit_decayed'] ? true : false; },
            cost: {
                Money(offset){ return spaceCostMultiplier('pylon', offset, 10, 1.48); },
                Stone(offset){ return spaceCostMultiplier('pylon', offset, 12, 1.42); },
                Crystal(offset){ return spaceCostMultiplier('pylon', offset, 8, 1.42) - 3; }
            },
            effect(){
                let max = spatialReasoning(2);
                let mana = +(0.005 * darkEffect('magic')).toFixed(3);
                return `<div>${loc('gain',[mana,global.resource.Mana.name])}</div><div>${loc('plus_max_resource',[max,global.resource.Mana.name])}</div>`;
            },
            special(){ return global.tech['magic'] && global.tech.magic >= 3 ? true : false; },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct($(this)[0]);
                    global.resource.Mana.max += spatialReasoning(2);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['pylon','space']
                };
            }
        },
        vr_center: {
            id: 'space-vr_center',
            title: loc('space_red_vr_center_title'),
            desc(){
                return `<div>${loc('space_red_vr_center_desc')}</div><div class="has-text-special">${loc('space_support',[planetName().red])}</div>`;
            },
            reqs: { mars: 1, broadcast: 3 },
            cost: {
                Money(offset){ return spaceCostMultiplier('vr_center', offset, 380000, 1.25); },
                Copper(offset){ return spaceCostMultiplier('vr_center', offset, 55000, 1.25); },
                Stanene(offset){ return spaceCostMultiplier('vr_center', offset, 100000, 1.25); },
                Soul_Gem(offset){ return spaceCostMultiplier('vr_center', offset, 1, 1.25); }
            },
            effect(){
                let gasVal = govActive('gaslighter',1) || 0;
                let morale = gasVal + 1;
                if (global.race['orbit_decayed']){
                    morale += 2;
                }
                return `<div class="has-text-caution">${loc('space_used_support',[planetName().red])}</div><div>${loc('space_red_vr_center_effect1',[morale])}</div><div>${loc('space_red_vr_center_effect2',[2])}</div>`;
            },
            s_type: 'red',
            support(){ return -1; },
            powered(){ return 0; },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct($(this)[0]);
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['vr_center','space']
                };
            }
        },
        garage: {
            id: 'space-garage',
            title: loc('space_red_garage_title'),
            desc(){
                return `<div>${loc('space_red_garage_desc')}</div>`;
            },
            reqs: { mars: 1 },
            cost: {
                Money(offset){ return spaceCostMultiplier('garage', offset, 75000, 1.28); },
                Iron(offset){ return spaceCostMultiplier('garage', offset, 12000, 1.28); },
                Brick(offset){ return spaceCostMultiplier('garage', offset, 3000, 1.28); },
                Sheet_Metal(offset){ return spaceCostMultiplier('garage', offset, 1500, 1.28); }
            },
            wide: true,
            res(){
                let r_list = ['Copper','Iron','Cement','Steel','Titanium','Alloy','Nano_Tube','Neutronium','Infernite'];
                if (global.race['cataclysm'] || global.race['orbit_decayed']){
                    r_list.push('Polymer');
                    r_list.push('Coal');
                    r_list.push('Lumber');
                    r_list.push('Chrysotile');
                    r_list.push('Stone');
                    r_list.push('Furs');
                }
                return r_list;
            },
            heavy(res){
                return ['Copper','Iron','Steel','Titanium','Neutronium','Infernite'].includes(res) ? true : false;
            },
            val(res){
                switch (res){
                    case 'Copper':
                        return 6500;
                    case 'Iron':
                        return 5500;
                    case 'Cement':
                        return global.race['cataclysm'] ? 10500 : 6000;
                    case 'Steel':
                        return 4500;
                    case 'Titanium':
                        return 3500;
                    case 'Alloy':
                        return 2500;
                    case 'Nano_Tube':
                        return 25000;
                    case 'Neutronium':
                        return 125;
                    case 'Infernite':
                        return 75;
                    case 'Polymer':
                        return 2500;
                    case 'Coal':
                        return 1500;
                    case 'Lumber':
                        return 7500;
                    case 'Chrysotile':
                        return 7500;
                    case 'Stone':
                        return 7500;
                    case 'Furs':
                        return 2200;
                    default:
                        return 0;
                }
            },
            multiplier(h){
                let multiplier = global.tech['particles'] >= 4 ? 1 + (global.tech['supercollider'] / 20) : 1;
                if (global.tech['world_control'] || global.race['cataclysm'] || global.race['orbit_decayed']){
                    multiplier *= 2;
                }
                if (global.tech['shelving'] && global.tech.shelving >= 3){
                    multiplier *= 1.5;
                }
                multiplier *= global.stats.achieve['blackhole'] ? 1 + (global.stats.achieve.blackhole.l * BLACKHOLE_STORAGE_BONUS_PER_LEVEL) : 1;
                if (h){
                    return global.tech['shelving'] && global.tech.shelving >= 2 ? multiplier * 3 : multiplier;
                }
                return multiplier;
            },
            effect(){
                let multiplier = $(this)[0].multiplier(false);
                let h_multiplier = $(this)[0].multiplier(true);
                let containers = global.tech['particles'] >= 4 ? 20 + global.tech['supercollider'] : 20;
                if (global.tech['world_control'] || global.race['cataclysm'] || global.race['orbit_decayed']){
                    containers += 10;
                }
                let crate = global.race['cataclysm'] || global.race['orbit_decayed'] ? `<span>${loc('plus_max_resource',[containers,global.resource.Crates.name])}</span>` : ``;

                let desc = '<div class="aTable">';
                desc = desc + `<span>${loc('plus_max_resource',[containers,global.resource.Containers.name])}</span>${crate}`;
                for (const res of $(this)[0].res()){
                    if (global.resource[res].display){
                        let heavy = $(this)[0].heavy(res);
                        let val = sizeApproximation(+(spatialReasoning($(this)[0].val(res)) * (heavy ? h_multiplier : multiplier)).toFixed(0),1);
                        desc = desc + `<span>${loc('plus_max_resource',[val,global.resource[res].name])}</span>`;
                    }
                };
                desc = desc + '</div>';
                return desc;
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('garage');

                    let containers = global.tech['particles'] >= 4 ? 20 + global.tech['supercollider'] : 20;
                    if (global.tech['world_control'] || global.race['cataclysm'] || global.race['orbit_decayed']){
                        containers += 10;
                    }
                    global.resource.Containers.max += containers;
                    if (!global.resource.Containers.display){
                        unlockContainers();
                    }

                    let multiplier = $(this)[0].multiplier(false);
                    let h_multiplier = $(this)[0].multiplier(true);
                    for (const res of $(this)[0].res()){
                        if (global.resource[res].display){
                            let heavy = $(this)[0].heavy(res);
                            global.resource[res].max += (spatialReasoning($(this)[0].val(res)) * (heavy ? h_multiplier : multiplier));
                        }
                    };
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['garage','space']
                };
            },
        },
        red_mine: {
            id: 'space-red_mine',
            title(){ return structName('mine'); },
            desc(){
                return `<div>${loc('space_red_mine_desc')}</div><div class="has-text-special">${loc('space_support',[planetName().red])}</div>`;
            },
            reqs: { mars: 1 },
            cost: {
                Money(offset){ return spaceCostMultiplier('red_mine', offset, 50000, 1.32); },
                Lumber(offset){ return spaceCostMultiplier('red_mine', offset, 65000, 1.32); },
                Iron(offset){ return spaceCostMultiplier('red_mine', offset, 33000, 1.32); }
            },
            effect(){
                let cop_val = production('red_mine','copper');
                let tit_val = production('red_mine','titanium');
                let copper = +(cop_val.b).toFixed(3);
                let titanium = +(tit_val.b).toFixed(3);
                let rival = ``;
                if (global.race['truepath']){
                    if (global.civic.foreign.gov3.hstl < 10){
                        rival = `<div class="has-text-success">${loc('space_rival_ally',[+(cop_val.g * 100).toFixed(1)])}</div>`;
                    }
                    else if (global.civic.foreign.gov3.hstl > 60){
                        rival = `<div class="has-text-danger">${loc('space_rival_war',[+(cop_val.g * 100).toFixed(1)])}</div>`;
                    }
                }

                let decayed = global.race['orbit_decayed'] ? `<div>${loc('plus_max_resource',[jobScale(1),loc(`job_miner`)])}</div><div>${loc('plus_max_resource',[jobScale(1),loc(`job_coal_miner`)])}</div>` : '';
                let cat_stone = (global.race['cataclysm'] || global.race['orbit_decayed']) && !global.race['sappy'] ? `<div>${loc('space_red_mine_effect',[+(production('red_mine','stone')).toFixed(2),global.resource.Stone.name])}</div>` : ``;
                let cat_asbestos = (global.race['cataclysm'] || global.race['orbit_decayed']) && global.race['smoldering'] ? `<div>${loc('space_red_mine_effect',[+(production('red_mine','asbestos')).toFixed(2),global.resource.Chrysotile.name])}</div>` : ``;
                let cat_alum = global.race['cataclysm'] || global.race['orbit_decayed'] ? `<div>${loc('space_red_mine_effect',[+(production('red_mine','aluminium')).toFixed(2),global.resource.Aluminium.name])}</div>` : ``;
                return `<div class="has-text-caution">${loc('space_used_support',[planetName().red])}</div>${decayed}<div>${loc('space_red_mine_effect',[copper,global.resource.Copper.name])}</div><div>${loc('space_red_mine_effect',[titanium,global.resource.Titanium.name])}</div>${rival}${cat_asbestos}${cat_stone}${cat_alum}`;
            },
            s_type: 'red',
            support(){ return -1; },
            powered(){ return 0; },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('red_mine');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['red_mine','space']
                };
            },
        },
        fabrication: {
            id: 'space-fabrication',
            title: loc('space_red_fabrication_title'),
            desc(){
                return `<div>${loc('space_red_fabrication_desc')}</div><div class="has-text-special">${loc('space_support',[planetName().red])}</div>`;
            },
            reqs: { mars: 1 },
            cost: {
                Money(offset){ return spaceCostMultiplier('fabrication', offset, 90000, 1.32); },
                Copper(offset){ return spaceCostMultiplier('fabrication', offset, 25000, 1.32); },
                Cement(offset){ return spaceCostMultiplier('fabrication', offset, 12000, 1.32); },
                Wrought_Iron(offset){ return spaceCostMultiplier('fabrication', offset, 1200, 1.32); }
            },
            effect(){
                let c_worker = global.race['cataclysm'] && !global.race['flier'] ? `<div>${loc('plus_max_resource',[jobScale(1),loc(`job_cement_worker`)])}</div>` : ``;
                let fab = global.race['cataclysm'] || global.race['orbit_decayed'] ? 5 : 2;
                if (global.race['high_pop']){
                    fab = highPopAdjust(fab);
                }
                return `<div class="has-text-caution">${loc('space_used_support',[planetName().red])}</div><div>${loc('space_red_fabrication_effect1',[jobScale(1)])}</div>${c_worker}<div>${loc('space_red_fabrication_effect2',[fab])}</div>`;
            },
            s_type: 'red',
            support(){ return -1; },
            powered(){ return 0; },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('fabrication');
                    if (powerOnNewStruct($(this)[0])){
                        global.civic.craftsman.max += jobScale(1);
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['fabrication','space']
                };
            },
        },
        red_factory: {
            id: 'space-red_factory',
            title(){ return structName('factory'); },
            desc(){ return `<div>${loc('space_red_factory_desc')}</div><div class="has-text-special">${loc('requires_power_combo',[global.resource.Helium_3.name])}</div>`; },
            reqs: { mars: 4 },
            cost: {
                Money(offset){ return spaceCostMultiplier('red_factory', offset, 75000, 1.32); },
                Brick(offset){ return spaceCostMultiplier('red_factory', offset, 10000, 1.32); },
                Coal(offset){ return spaceCostMultiplier('red_factory', offset, 7500, 1.32); },
                Mythril(offset){ return spaceCostMultiplier('red_factory', offset, 50, 1.32); }
            },
            effect(wiki){
                let desc = `<div>${loc('space_red_factory_effect1')}</div>`;
                if (global.tech['foundry'] >= 7){
                    desc = desc + `<div>${loc('space_red_factory_effect2')}</div>`;
                }
                if (global.race['orbit_decayed'] && !global.race['flier']){
                    desc = desc + `<div>${loc('plus_max_resource',[jobScale(1),loc(`job_cement_worker`)])}</div>`;
                }
                let helium = +(fuel_adjust(1,true,wiki)).toFixed(2);
                desc = desc + `<div class="has-text-caution">${loc('space_red_factory_effect3',[helium,$(this)[0].powered()])}</div>`;
                return desc;
            },
            powered(){ return powerCostMod(3); },
            special: true,
            action(args){
                if (payCosts($(this)[0])){
                    global.space.red_factory.count++;
                    if (powerOnNewStruct($(this)[0])){
                        global.city.factory.Alloy++;
                    }
                    global.settings.showIndustry = true;
                    defineIndustry();
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['red_factory','space']
                };
            },
        },
        nanite_factory: buildTemplate(`nanite_factory`,'space'),
        biodome: {
            id: 'space-biodome',
            title(){
                if (global.race['artifical']){
                    return loc('space_red_signal_tower_title');
                }
                else {
                    return global.race['soul_eater'] ? loc('space_red_asphodel_title') : loc('space_red_biodome_title');
                }
            },
            desc(){
                let desc;
                if (global.race['artifical']){
                    desc = `<div>${loc('space_red_signal_tower_title')}</div>`;
                }
                else if (global.race['soul_eater']) {
                    desc = `<div>${loc('space_red_asphodel_desc')}</div>`;
                }
                else {
                    if (global.race['carnivore']){
                        desc = `<div>${loc('space_red_biodome_desc_carn')}</div>`;
                    }
                    else {
                        desc = `<div>${loc('space_red_biodome_desc',[planetName().red])}</div>`;
                    }
                }
                return `<div>${desc}</div><div class="has-text-special">${loc('space_support',[planetName().red])}</div>`;
            },
            reqs: { mars: 2 },
            cost: {
                Money(offset){ return spaceCostMultiplier('biodome', offset, 45000, 1.28); },
                Lumber(offset){ return spaceCostMultiplier('biodome', offset, 65000, 1.28); },
                Brick(offset){ return spaceCostMultiplier('biodome', offset, 1000, 1.28); },
                Nanite(offset){ return global.race['deconstructor'] ? spaceCostMultiplier('biodome', offset, 75, 1.28) : 0; },
            },
            effect(){
                let food = +(production('biodome','food')).toFixed(2);
                let cat_fd = global.race['cataclysm'] || global.race['orbit_decayed'] ? `<div>${loc('produce',[+(production('biodome','cat_food')).toFixed(2),global.resource.Food.name])}</div>` : ``;
                let cat_wd = (global.race['cataclysm'] || global.race['orbit_decayed']) && !global.race['kindling_kindred'] && !global.race['smoldering'] ? `<div>${loc('space_red_mine_effect',[+(production('biodome','lumber')).toFixed(2),global.resource.Lumber.name])}</div>` : ``;
                let pop = global.tech.mars >= 6 ? 0.1 : 0.05;
                let fLabel = global.race['artifical'] ? loc('city_transmitter_effect',[spatialReasoning(500)]) : loc('plus_max_resource',[spatialReasoning(100), global.resource.Food.name]);
                let sig_cap = global.race['artifical'] || global.race['orbit_decayed'] ? `<div>${fLabel}</div` : '';
                
                let desc = `<div class="has-text-caution">${loc('space_used_support',[planetName().red])}</div>${cat_fd}`;
                desc += `<div>${loc('space_red_biodome_effect',[food,global.resource.Food.name])}</div>`;
                desc += `<div>${loc('space_red_biodome_effect2',[+(jobScale(pop)).toFixed(2)])}</div>`;
                if (global.race.universe === 'evil'){
                    let soldier = global.race['grenadier'] ? 0.0375 : 0.075;
                    desc += `<div>${loc('space_red_biodome_effect_evil',[+(jobScale(soldier)).toFixed(3),loc('space_red_space_barracks_title')])}</div>`;
                }
                desc += `${cat_wd}${sig_cap}`;
                return desc;
            },
            s_type: 'red',
            support(){ return -1; },
            powered(){ return 0; },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('biodome');
                    if (!global.race['cataclysm']){
                        unlockAchieve('colonist');
                        if (global.race['joyless']){
                            unlockAchieve('joyless');
                            delete global.race['joyless'];
                            drawTech();
                        }
                    }
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['biodome','space']
                };
            },
            flair(){
                if (global.race['artifical']){
                    return loc('space_red_signal_tower_flair');
                }
                else {
                    return global.race['soul_eater'] ? loc('space_red_asphodel_flair') : (global.race['carnivore'] ? loc('space_red_biodome_flair_carn') : loc('space_red_biodome_flair'));
                }
            }
        },
        red_university: {
            id: 'space-red_university',
            title: loc('city_university'),
            desc(){
                return loc('city_university_desc',[planetName().red]);
            },
            reqs: { mars: 1 },
            trait: ['orbit_decayed'],
            cost: {
                Money(offset){ return spaceCostMultiplier('university', offset, 900, 1.5, 'city') - 500; },
                Lumber(offset){ return spaceCostMultiplier('university', offset, 500, 1.36, 'city') - 200; },
                Stone(offset){ return spaceCostMultiplier('university', offset, 750, 1.36, 'city') - 350; },
                Crystal(offset){ return global.race.universe === 'magic' ? spaceCostMultiplier('university', offset, 5, 1.36, 'city') : 0; },
            },
            wiki: false,
            effect(){
                return actions.city.university.effect();
            },
            action(args){
                if (payCosts($(this)[0])){
                    let gain = global.tech['science'] && global.tech['science'] >= 8 ? 700 : 500;
                    if (global.tech['supercollider']){
                        let ratio = global.tech['particles'] && global.tech['particles'] >= 3 ? 12.5: 25;
                        gain *= (global.tech['supercollider'] / ratio) + 1;
                    }
                    global['resource']['Knowledge'].max += gain;
                    global.city.university.count++;
                    global.space.red_university.count = global.city.university.count;
                    global.civic.professor.display = true;
                    global.civic.professor.max = jobScale(global.city.university.count);
                    return true;
                }
                return false;
            },
        },
        exotic_lab: {
            id: 'space-exotic_lab',
            title: loc('space_red_exotic_lab_title'),
            desc(){
                return `<div>${loc('space_red_exotic_lab_desc')}</div><div class="has-text-special">${loc('space_support',[planetName().red])}</div>`;
            },
            reqs: { mars: 5 },
            cost: {
                Money(offset){ return spaceCostMultiplier('exotic_lab', offset, 750000, 1.28); },
                Steel(offset){ return spaceCostMultiplier('exotic_lab', offset, 100000, 1.28); },
                Mythril(offset){ return spaceCostMultiplier('exotic_lab', offset, 1000, 1.28); },
                Elerium(offset){ return spaceCostMultiplier('exotic_lab', offset, 20, 1.28) - 4; }
            },
            effect(wiki){
                let sci = 500;
                if (global.tech['science'] >= 13 && global.interstellar['laboratory']){
                    let num_lab_on = wiki ? global.interstellar.laboratory.on : int_on['laboratory'];
                    sci += num_lab_on * 25;
                }
                if (global.tech['ancient_study'] && global.tech['ancient_study'] >= 2){
                    sci += templeCount(true) * 15;
                }
                let num_mass_driver_on = wiki ? (global.city?.mass_driver?.on ?? 0) : p_on['mass_driver'];
                if (global.tech.mass >= 2 && num_mass_driver_on > 0){
                    sci += highPopAdjust(num_mass_driver_on * global.civic.scientist.workers);
                }
                if (global.tech['science'] >= 21){
                    sci *= 1.45;
                }
                if (global.race['high_pop']){
                    sci = highPopAdjust(sci);
                }
                let elerium = spatialReasoning(10);

                let scientist = '';
                let lab = '';
                if (global.race['cataclysm'] || global.race['orbit_decayed']){
                    scientist = `<div>${loc('city_wardenclyffe_effect1',[jobScale(1), global.civic.scientist.name])}</div>`;
                    sci *= 1 + (wiki ? global.space.observatory.on : support_on['observatory']) * 0.25;
                    if (global.tech.science >= 15){
                        lab = `<div>${loc('city_wardenclyffe_effect4',[2])}</div>`;
                    }
                }
                return `<div class="has-text-caution">${loc('space_used_support',[planetName().red])}</div>${scientist}${lab}<div>${loc('space_red_exotic_lab_effect1',[+(sci).toFixed(0)])}</div><div>${loc('plus_max_resource',[elerium,global.resource.Elerium.name])}</div>`;
            },
            s_type: 'red',
            support(){ return -1; },
            powered(){ return 0; },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('exotic_lab');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['exotic_lab','space']
                };
            },
            flair(){
                return `<div>${loc('space_red_exotic_lab_flair1')}</div><div>${loc('space_red_exotic_lab_flair2')}</div>`;
            }
        },
        ziggurat: {
            id: 'space-ziggurat',
            title: loc('space_red_ziggurat_title'),
            desc(){
                let entity = global.race.old_gods !== 'none' ? races[global.race.old_gods.toLowerCase()].entity : races[global.race.species].entity;
                return `<div>${loc('space_red_ziggurat_desc',[entity])}</div>`;
            },
            reqs: { theology: 4 },
            cost: {
                Money(offset){ return spaceCostMultiplier('ziggurat', offset, 600000, 1.28); },
                Stone(offset){ return spaceCostMultiplier('ziggurat', offset, 250000, 1.28); },
                Aluminium(offset){ return spaceCostMultiplier('ziggurat', offset, 70000, 1.28); },
                Mythril(offset){ return spaceCostMultiplier('ziggurat', offset, 250, 1.28); }
            },
            effect(wiki){
                let bonus = global.tech['ancient_study'] ? 0.6 : 0.4;
                let num_exo_labs_on = wiki ? (global.space?.exotic_lab?.on ?? 0) : support_on['exotic_lab'];
                if (global.tech['ancient_deify'] && global.tech['ancient_deify'] >= 2 && num_exo_labs_on){
                    bonus += 0.01 * num_exo_labs_on;
                }
                if (global.civic.govern.type === 'theocracy' && global.genes['ancients'] && global.genes['ancients'] >= 2 && global.civic.priest.display){
                    let faith = 0.002;
                    if (global.race['high_pop']){
                        faith = highPopAdjust(faith);
                    }
                    bonus += faith * global.civic.priest.workers;
                }
                if (global.race['ooze']){
                    bonus *= 1 - (traits.ooze.vars()[1] / 100);
                }
                if (global.race['high_pop']){
                    bonus = highPopAdjust(bonus);
                }
                bonus = +(bonus).toFixed(2);
                let zvar = global.race['truepath'] ? [bonus,races[global.race.species].home] : [bonus];
                let desc = `<div>${loc(global.race['truepath'] ? 'space_red_ziggurat_effect_tp' : 'space_red_ziggurat_effect',zvar)}</div>`;
                if (global.tech['ancient_study'] && global.tech['ancient_study'] >= 2){
                    desc = desc + `<div>${loc('interstellar_laboratory_effect',[3])}</div>`;
                }
                if (global.race['cataclysm'] || global.race['orbit_decayed']){
                    desc = desc + templeEffect();
                }
                if (global.genes['ancients'] && global.genes['ancients'] >= 4){
                    desc = desc + `<div>${loc('plus_max_resource',[jobScale(1),global.civic?.priest?.name || loc(`job_priest`)])}</div>`;
                }
                return desc;
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('ziggurat');
                    if (global.genes['ancients'] && global.genes['ancients'] >= 4){
                        global.civic.priest.display = true;
                        global.civic.priest.max += jobScale(1);
                    }
                    if (global.race['cataclysm']){
                        unlockAchieve('iron_will',false,1);
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['ziggurat','space']
                };
            }
        },
        space_barracks: {
            id: 'space-space_barracks',
            title: loc('space_red_space_barracks_title'),
            desc(){
                return `<div>${loc('space_red_space_barracks_desc')}</div><div class="has-text-special">${loc('space_red_space_barracks_desc_req')}</div>`;
            },
            reqs: { marines: 1 },
            cost: {
                Money(offset){ return spaceCostMultiplier('space_barracks', offset, 350000, 1.28); },
                Alloy(offset){ return spaceCostMultiplier('space_barracks', offset, 65000, 1.28); },
                Iridium(offset){ return spaceCostMultiplier('space_barracks', offset, 22500, 1.28); },
                Wrought_Iron(offset){ return spaceCostMultiplier('space_barracks', offset, 12500, 1.28); },
                Horseshoe(){ return global.race['hooved'] ? 2 : 0; }
            },
            effect(wiki){
                let train = global.race['orbit_decayed'] ? actions.city.boot_camp.effect() : '';
                let oil = +fuel_adjust(2,true,wiki).toFixed(2);
                let soldiers = $(this)[0].soldiers(wiki);
                let food = global.race['cataclysm'] ? `` : `<div class="has-text-caution">${loc('space_red_space_barracks_effect3',[global.resource.Food.name])}</div>`;

                let desc = `<div>${loc('plus_max_soldiers',[soldiers])}</div>${train}`;
                if (global.race.universe === 'evil'){
                    desc += `<div>${loc('plus_max_resource',[global.race['cataclysm'] ? 2 : 1, global.resource.Authority.name])}</div>`;
                }
                desc += `<div class="has-text-caution">${loc('space_red_space_barracks_effect2',[oil])}</div>${food}`

                return desc;
            },
            powered(){ return 0; },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('space_barracks');
                    global.space['space_barracks'].on++;
                    return true;
                }
                return false;
            },
            soldiers(wiki){
                let soldiers = global.tech.marines >= 2 ? 4 : 2;
                if (global.race.universe === 'evil'){
                    if (!global.race['cataclysm'] && !global.race['orbit_decayed']){ soldiers--; }
                    let biodome_count = wiki ? (global.space?.biodome?.on ?? 0) : support_on['biodome'];
                    if (biodome_count){
                        soldiers += biodome_count * 0.075;
                    }
                }
                if (global.race['grenadier']){
                    soldiers /= 2;
                }
                return +(jobScale(soldiers)).toFixed(3);
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['space_barracks','space']
                };
            },
            flair(){
                return loc('space_red_space_barracks_flair');
            }
        },
        wonder_statue: {
            id: 'space-wonder_statue',
            title(){
                return loc('space_wonder_statue',[planetName().red]);
            },
            desc(){
                return loc('space_wonder_statue',[planetName().red]);
            },
            reqs: {},
            condition(){
                return global.race['wish'] && global.race['wishStats'] && global.space['wonder_statue'] ? true : false;
            },
            trait: ['wish'],
            wiki: false,
            queue_complete(){ return false; },
            effect(){
                return loc(`city_wonder_effect`,[5]);
            },
            action(args){
                return false;
            }
        },
        bonfire: buildTemplate(`bonfire`,'space'),
        horseshoe: buildTemplate(`horseshoe`,'space'),
    };
