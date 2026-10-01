import { loc } from './locale.js';
import { global, p_on, support_on, gal_on, sizeApproximation } from './vars.js';
import { races, traits, traitCostMod } from './races.js';
import { payCosts, initStruct, powerOnNewStruct, bank_vault, storageMultipler } from './actions.js';
import { messageQueue, spaceCostMultiplier, powerCostMod, powerModifier, eventActive } from './functions.js';
import { defineIndustry } from './industry.js';
import { jobScale } from './jobs.js';
import { spatialReasoning } from './resources.js';
import { interstellarProjects } from './space_registry.js';
import { int_fuel_adjust, incrementStruct, isStargateOn, piracy } from './space.js';

// Region 'int_alpha' dari interstellarProjects (dipisah dari space.js). Isi sama persis; digabung via space_registry.js di space.js.
export const interstellarProjects_int_alpha = {
        info: {
            name: loc('interstellar_alpha_name'),
            desc(){ return global.tech['alpha'] ? loc('interstellar_alpha_desc2',[races[global.race.species].home]) : loc('interstellar_alpha_desc1',[races[global.race.species].home]); },
            support: 'starport'
        },
        alpha_mission: {
            id: 'interstellar-alpha_mission',
            title: loc('space_mission_title', [loc('interstellar_alpha_name')]),
            desc: loc('space_mission_desc', [loc('interstellar_alpha_name')]),
            reqs: { ftl: 2 },
            grant: ['alpha',1],
            queue_complete(){ return global.tech.alpha >= 1 ? 0 : 1; },
            cost: {
                Helium_3(){ return +int_fuel_adjust(40000).toFixed(0); }
            },
            effect: loc('interstellar_alpha_mission_effect'),
            action(args){
                if (payCosts($(this)[0])){
                    messageQueue(loc('interstellar_alpha_mission_result'),'info',false,['progress']);
                    initStruct(interstellarProjects.int_nebula.nexus);
                    initStruct(interstellarProjects.int_alpha.warehouse);
                    return true;
                }
                return false;
            }
        },
        starport: {
            id: 'interstellar-starport',
            title: loc('interstellar_alpha_starport_title'),
            desc(){ return `<div>${loc('interstellar_alpha_starport_desc')}</div><div class="has-text-special">${loc('requires_power_space',[global.resource.Food.name])}</div>`; },
            reqs: { alpha: 1 },
            cost: {
                Money(offset){ return spaceCostMultiplier('starport', offset, 1000000, 1.3, 'interstellar'); },
                Aluminium(offset){ return spaceCostMultiplier('starport', offset, 400000, 1.3, 'interstellar'); },
                Neutronium(offset){ return spaceCostMultiplier('starport', offset, 1000, 1.3, 'interstellar'); },
                Elerium(offset){ return spaceCostMultiplier('starport', offset, 100, 1.3, 'interstellar'); }
            },
            effect(){
                let helium = +(int_fuel_adjust(5)).toFixed(2);
                let food = 100;
                return `<div>${loc('interstellar_alpha_starport_effect1',[$(this)[0].support()])}</div><div class="has-text-caution">${loc('interstellar_alpha_starport_effect2',[helium,$(this)[0].powered()])}</div><div class="has-text-caution">${loc('interstellar_alpha_starport_effect3',[food,global.resource.Food.name])}</div>`;
            },
            support(){ return 5; },
            powered(){ return powerCostMod(10); },
            powerBalancer(){
                return [{ s: global.interstellar.starport.s_max - global.interstellar.starport.support }];
            },
            refresh: true,
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('starport','interstellar');
                    global.settings.space.proxima = true;
                    global.settings.space.nebula = true;
                    powerOnNewStruct($(this)[0]);
                    if (global.tech['alpha'] === 1){
                        global.tech['alpha'] = 2;
                        initStruct(interstellarProjects.int_alpha.mining_droid);
                    }
                    if (global.race['orbit_decay'] && global.race.orbit_decay > global.stats.days + 100){
                        global.race.orbit_decay = global.stats.days + 100;
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
                    p: ['starport','interstellar']
                };
            }
        },
        habitat: {
            id: 'interstellar-habitat',
            title: loc('interstellar_habitat_title'),
            desc: `<div>${loc('interstellar_habitat_desc')}</div><div class="has-text-special">${loc('requires_power')}</div>`,
            reqs: { alpha: 3 },
            cost: {
                Money(offset){ return spaceCostMultiplier('habitat', offset, 800000, 1.25, 'interstellar'); },
                Furs(offset){ return spaceCostMultiplier('habitat', offset, 38000, 1.25, 'interstellar'); },
                Adamantite(offset){ return (global.race['fasting'] && global.interstellar.habitat && global.interstellar.habitat.count < 5) ? 0 : spaceCostMultiplier('habitat', offset, 3200, 1.25, 'interstellar'); },
                Plywood(offset){ return spaceCostMultiplier('habitat', offset, 10000, 1.25, 'interstellar'); },
                Horseshoe(){ return global.race['hooved'] ? 1 : 0; }
            },
            effect(){
                let citizens = $(this)[0].citizens();
                return `<div>${loc('interstellar_alpha_starport_effect1',[$(this)[0].support()])}</div><div><span>${loc('plus_max_citizens',[citizens])}</span>, <span class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</span></div>`;
            },
            support(){ return 1; },
            powered(){ return powerCostMod(2); },
            powerBalancer(){
                return [{ s: global.interstellar.starport.s_max - global.interstellar.starport.support }];
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('habitat','interstellar');
                    if (powerOnNewStruct($(this)[0])){
                        global.resource[global.race.species].max += $(this)[0].citizens();
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['habitat','interstellar']
                };
            },
            citizens(){
                let pop = 1;
                if (global.race['high_pop']){
                    pop *= traits.high_pop.vars()[0];
                }
                return pop;
            }
        },
        mining_droid: {
            id: 'interstellar-mining_droid',
            title: loc('interstellar_mining_droid_title'),
            desc: `<div>${loc('interstellar_mining_droid_title')}</div><div class="has-text-special">${loc('space_support',[loc('interstellar_alpha_name')])}</div>`,
            reqs: { alpha: 2 },
            cost: {
                Money(offset){ return spaceCostMultiplier('mining_droid', offset, 650000, 1.28, 'interstellar'); },
                Steel(offset){ return spaceCostMultiplier('mining_droid', offset, 120000, 1.28, 'interstellar'); },
                Nano_Tube(offset){ return spaceCostMultiplier('mining_droid', offset, 75000, 1.28, 'interstellar'); },
                Elerium(offset){ return spaceCostMultiplier('mining_droid', offset, 50, 1.28, 'interstellar'); }
            },
            effect(){
                return `<div class="has-text-caution">${loc('space_used_support',[loc('interstellar_alpha_name')])}</div><div>${loc('interstellar_mining_droid_effect')}</div>`;
            },
            s_type: 'alpha',
            support(){ return -1; },
            powered(){ return 0; },
            special: true,
            refresh: true,
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('mining_droid','interstellar');
                    global.resource.Adamantite.display = true;
                    if (powerOnNewStruct($(this)[0])){
                        global.interstellar.mining_droid.adam++;
                    }
                    if (!global.tech['droids']){
                        global.tech['droids'] = 1;
                        initStruct(interstellarProjects.int_alpha.processing);
                    }
                    global.settings.showIndustry = true;
                    defineIndustry();
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, adam: 0, uran: 0, coal: 0, alum: 0 },
                    p: ['mining_droid','interstellar']
                };
            },
        },
        processing: {
            id: 'interstellar-processing',
            title: loc('interstellar_processing_title'),
            desc: `<div>${loc('interstellar_processing_title')}</div><div class="has-text-special">${loc('space_support',[loc('interstellar_alpha_name')])}</div>`,
            reqs: { droids: 1 },
            cost: {
                Money(offset){ return spaceCostMultiplier('processing', offset, 350000, 1.28, 'interstellar'); },
                Iron(offset){ return spaceCostMultiplier('processing', offset, 180000, 1.28, 'interstellar'); },
                Aluminium(offset){ return spaceCostMultiplier('processing', offset, 60000, 1.28, 'interstellar'); },
                Iridium(offset){ return spaceCostMultiplier('processing', offset, 5000, 1.28, 'interstellar'); }
            },
            effect(wiki){
                let bonus = 12;
                let num_citadels_on = wiki ? (global.interstellar?.citadel?.on ?? 0) : p_on['citadel'];
                if (global.tech['ai_core'] && global.tech['ai_core'] >= 2 && num_citadels_on > 0){
                    bonus += num_citadels_on * 2;
                }
                return `<div class="has-text-caution">${loc('space_used_support',[loc('interstellar_alpha_name')])}</div><div>${loc('interstellar_processing_effect',[bonus])}</div>`;
            },
            s_type: 'alpha',
            support(){ return -1; },
            powered(){ return 0; },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('processing','interstellar');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['processing','interstellar']
                };
            }
        },
        fusion: {
            id: 'interstellar-fusion',
            title: loc('interstellar_fusion_title'),
            desc(){ return `<div>${loc('interstellar_fusion_title')}</div><div class="has-text-special">${loc('requires_power_support_combo',[loc('interstellar_alpha_name'),global.resource.Deuterium.name])}</div>`; },
            reqs: { fusion: 1 },
            cost: {
                Money(offset){ return spaceCostMultiplier('fusion', offset, 990000, 1.28, 'interstellar'); },
                Iridium(offset){ return spaceCostMultiplier('fusion', offset, 44000, 1.28, 'interstellar'); },
                Infernite(offset){ return spaceCostMultiplier('fusion', offset, 350, 1.28, 'interstellar'); },
                Brick(offset){ return spaceCostMultiplier('fusion', offset, 18000, 1.28, 'interstellar'); }
            },
            effect(){
                let det = 1.25;
                return `<div class="has-text-caution">${loc('space_used_support',[loc('interstellar_alpha_name')])}</div><div><span>${loc('space_dwarf_reactor_effect1',[-($(this)[0].powered())])}</span>, <span class="has-text-caution">${loc('interstellar_fusion_effect',[det])}</span></div>`;
            },
            s_type: 'alpha',
            support(){ return -1; },
            powered(){ return powerModifier(-22); },
            p_fuel(){ return { r: 'Deuterium', a: 1.25 }; },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('fusion','interstellar');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['fusion','interstellar']
                };
            }
        },
        laboratory: {
            id: 'interstellar-laboratory',
            title(){ return global.race.universe === 'magic' ? loc('tech_sanctum') : loc('interstellar_laboratory_title'); },
            desc: `<div>${loc(global.race.universe === 'magic' ? 'tech_sanctum' : 'interstellar_laboratory_title')}</div><div class="has-text-special">${loc('space_support',[loc('interstellar_alpha_name')])}</div>`,
            reqs: { science: 12 },
            cost: {
                Money(offset){ return spaceCostMultiplier('laboratory', offset, 750000, 1.28, 'interstellar'); },
                Crystal(offset){ return global.race.universe === 'magic' ? spaceCostMultiplier('laboratory', offset, 1200, 1.28, 'interstellar') : 0; },
                Titanium(offset){ return spaceCostMultiplier('laboratory', offset, 120000, 1.28, 'interstellar'); },
                Alloy(offset){ return spaceCostMultiplier('laboratory', offset, 95000, 1.28, 'interstellar'); },
                Mythril(offset){ return spaceCostMultiplier('laboratory', offset, 8500, 1.28, 'interstellar'); }
            },
            effect(wiki){
                let know = 10000;
                if (global.tech.science >= 15){
                    let num_exo_labs_on = wiki ? global.space.exotic_lab.on : support_on['exotic_lab'];
                    know *= 1 + ((global.race['cataclysm'] || global.race['orbit_decayed'] ? num_exo_labs_on : global.city.wardenclyffe.count) * 0.02);
                }
                let sg_on = isStargateOn(wiki);
                let num_tech_scavs_on = sg_on ? (wiki ? (global.galaxy?.scavenger?.on ?? 0) : gal_on['scavenger']) : 0;
                if ((global.race['cataclysm'] || global.race['orbit_decayed']) && num_tech_scavs_on > 0){
                    know *= 1 + (num_tech_scavs_on * +(piracy('gxy_alien2',false,false,wiki) * 0.75).toFixed(1));
                }
                if (global.tech['science'] >= 21){
                    know *= 1.45;
                }
                know = Math.round(know);
                let sci = '';
                if (global.tech.science >= 16){
                    sci = `<div>${loc('city_wardenclyffe_effect1',[jobScale(1), global.civic.scientist.name])}</div>`;
                }
                let desc = `<div class="has-text-caution">${loc('space_used_support',[loc('interstellar_alpha_name')])}</div>${sci}<div>${loc('city_max_knowledge',[know])}</div>`;
                if (global.tech['science'] >= 13){
                    desc = desc + `<div>${loc('interstellar_laboratory_effect',[5])}</div>`;
                }
                if (global.race.universe === 'magic'){
                    let mana = spatialReasoning(12);
                    desc = desc + `<div>${loc('plus_max_resource',[mana,global.resource.Mana.name])}</div>`;
                }
                return desc;
            },
            s_type: 'alpha',
            support(){ return -1; },
            powered(){ return 0; },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('laboratory','interstellar');
                    if (powerOnNewStruct($(this)[0])){
                        global.resource.Knowledge.max += 10000;
                        if (global.tech.science >= 16){
                            global.civic.scientist.display = true;
                            global.civic.scientist.max += jobScale(1);
                        }
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['laboratory','interstellar']
                };
            }
        },
        exchange: {
            id: 'interstellar-exchange',
            title: loc('interstellar_exchange_title'),
            desc: `<div>${loc('interstellar_exchange_title')}</div><div class="has-text-special">${loc('space_support',[loc('interstellar_alpha_name')])}</div>`,
            reqs: { banking: 12 },
            cost: {
                Money(offset){ return spaceCostMultiplier('exchange', offset, traitCostMod('untrustworthy',680000), 1.28, 'interstellar'); },
                Stone(offset){ return spaceCostMultiplier('exchange', offset, traitCostMod('untrustworthy',115000), 1.28, 'interstellar'); },
                Adamantite(offset){ return spaceCostMultiplier('exchange', offset, traitCostMod('untrustworthy',55000), 1.28, 'interstellar'); },
                Graphene(offset){ return spaceCostMultiplier('exchange', offset, traitCostMod('untrustworthy',78000), 1.28, 'interstellar'); }
            },
            effect(wiki){
                let banks = global.race['cataclysm'] || global.race['orbit_decayed'] ? (wiki ? global.space.spaceport.on : p_on['spaceport']) : (global.city['bank'] ? global.city.bank.count : 0);
                let b_vault = global.race['cataclysm'] || global.race['orbit_decayed']  ? (bank_vault() * 4) : bank_vault();
                if (global.eden['eternal_bank']){ banks += global.eden.eternal_bank.count * 2; }
                let vault = spatialReasoning(global.city['bank'] ? b_vault * banks / 18 : 0);
                if (global.race['inflation']){
                    vault *= 2;
                }
                if (global.tech.banking >= 13){
                    if (global.galaxy['freighter']){
                        let num_freighter_on = wiki ? global.galaxy.freighter.on : gal_on['freighter'];
                        vault *= 1 + (num_freighter_on * 0.03);
                    }
                    if (global.galaxy['super_freighter']){
                        let num_super_freighter_on = wiki ? global.galaxy.super_freighter.on : gal_on['super_freighter'];
                        vault *= 1 + (num_super_freighter_on * 0.08);
                    }
                }
                vault = +(vault).toFixed(0);
                return `<div class="has-text-caution">${loc('space_used_support',[loc('interstellar_alpha_name')])}</div><div>${loc('plus_max_resource',[`\$${vault.toLocaleString()}`,loc('resource_Money_name')])}</div>`;
            },
            s_type: 'alpha',
            support(){ return -1; },
            powered(){ return 0; },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('exchange','interstellar');
                    if (powerOnNewStruct($(this)[0])){
                        global.resource.Money.max += +(spatialReasoning(450000)).toFixed(0);
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['exchange','interstellar']
                };
            },
        },
        g_factory: {
            id: 'interstellar-g_factory',
            title: loc('interstellar_g_factory_title'),
            desc: `<div>${loc('interstellar_g_factory_title')}</div><div class="has-text-special">${loc('space_support',[loc('interstellar_alpha_name')])}</div>`,
            reqs: { graphene: 1 },
            cost: {
                Money(offset){ return spaceCostMultiplier('g_factory', offset, 950000, 1.28, 'interstellar'); },
                Copper(offset){ return spaceCostMultiplier('g_factory', offset, 165000, 1.28, 'interstellar'); },
                Cement(offset){ return spaceCostMultiplier('g_factory', offset, 220000, 1.28, 'interstellar'); },
                Infernite(offset){ return spaceCostMultiplier('g_factory', offset, 750, 1.28, 'interstellar'); }
            },
            effect(){
                return `<div class="has-text-caution">${loc('space_used_support',[loc('interstellar_alpha_name')])}</div><div>${loc('interstellar_g_factory_effect')}</div>`;
            },
            s_type: 'alpha',
            support(){ return -1; },
            powered(){ return 0; },
            special: true,
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('g_factory','interstellar');
                    global.resource.Graphene.display = true;
                    if (powerOnNewStruct($(this)[0])){
                        if (global.race['kindling_kindred'] || global.race['smoldering']){
                            global.interstellar.g_factory.Oil++;
                        }
                        else {
                            global.interstellar.g_factory.Lumber++;
                        }
                    }
                    global.settings.showIndustry = true;
                    defineIndustry();
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0, Lumber: 0, Coal: 0, Oil: 0 },
                    p: ['g_factory','interstellar']
                };
            },
        },
        int_factory: {
            id: 'interstellar-int_factory',
            title: loc('interstellar_int_factory_title'),
            desc(){ return `<div>${loc('interstellar_int_factory_title')}</div><div class="has-text-special">${loc('requires_power_combo',[global.resource.Deuterium.name])}</div>`; },
            reqs: { alpha: 4 },
            cost: {
                Money(offset){ return spaceCostMultiplier('int_factory', offset, 25000000, 1.26, 'interstellar'); },
                Coal(offset){ return spaceCostMultiplier('int_factory', offset, 10000000, 1.26, 'interstellar'); },
                Brick(offset){ return spaceCostMultiplier('int_factory', offset, 750000, 1.26, 'interstellar'); },
                Bolognium(offset){ return spaceCostMultiplier('int_factory', offset, 50000, 1.26, 'interstellar'); }
            },
            effect(){
                let deuterium = +int_fuel_adjust(5).toFixed(2);
                return `<div>${loc('interstellar_int_factory_effect')}</div><div>${loc('city_crafted_mats',[10])}</div><div class="has-text-caution"><span>${loc('interstellar_fusion_effect',[deuterium])}</span> <span>${loc('minus_power',[$(this)[0].powered()])}</span></div>`;
            },
            powered(){ return powerCostMod(5); },
            special: true,
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('int_factory','interstellar');
                    if (powerOnNewStruct($(this)[0])){
                        global.city.factory.Alloy += 2;
                        defineIndustry();
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['int_factory','interstellar']
                };
            }
        },
        luxury_condo: {
            id: 'interstellar-luxury_condo',
            title(){
                let halloween = eventActive('halloween');
                if (halloween.active){
                    return loc(`events_halloween_condo`);
                }
                return loc('tech_luxury_condo');
            },
            desc: `<div>${loc('tech_luxury_condo')}</div><div class="has-text-special">${loc('requires_power')}</div>`,
            reqs: { alpha: 5 },
            cost: {
                Money(offset){ return spaceCostMultiplier('luxury_condo', offset, traitCostMod('untrustworthy',25000000), 1.25, 'interstellar'); },
                Neutronium(offset){ return spaceCostMultiplier('luxury_condo', offset, traitCostMod('untrustworthy',75000), 1.25, 'interstellar'); },
                Stanene(offset){ return spaceCostMultiplier('luxury_condo', offset, traitCostMod('untrustworthy',230000), 1.25, 'interstellar'); },
                Orichalcum(offset){ return spaceCostMultiplier('luxury_condo', offset, traitCostMod('untrustworthy',65000), 1.25, 'interstellar'); },
                Nanoweave(offset){ return spaceCostMultiplier('luxury_condo', offset, traitCostMod('untrustworthy',12500), 1.25, 'interstellar'); },
                Horseshoe(){ return global.race['hooved'] ? 2 : 0; }
            },
            effect(){
                let citizens = $(this)[0].citizens();
                let safe = spatialReasoning(750000);
                return `<div><span>${loc('plus_max_citizens',[citizens])}</span>, <span class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</span></div><div>${loc('plus_max_resource',[`\$${safe.toLocaleString()}`,loc('resource_Money_name')])}</div>`;
            },
            powered(){ return powerCostMod(3); },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('luxury_condo','interstellar');
                    if (powerOnNewStruct($(this)[0])){
                        global.resource[global.race.species].max += 2;
                    }
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['luxury_condo','interstellar']
                };
            },
            citizens(){
                let pop = 2;
                if (global.race['high_pop']){
                    pop *= traits.high_pop.vars()[0];
                }
                return pop;
            }
        },
        zoo: {
            id: 'interstellar-zoo',
            title: loc('tech_zoo'),
            desc(){ return `<div>${loc('tech_zoo')}</div><div class="has-text-special">${loc('requires_power_support_combo',[loc('interstellar_alpha_name'),global.resource.Food.name])}</div>`; },
            reqs: { zoo: 1 },
            cost: {
                Money(offset){ return spaceCostMultiplier('zoo', offset, 50000000, 1.24, 'interstellar'); },
                Polymer(offset){ return spaceCostMultiplier('zoo', offset, 6000000, 1.24, 'interstellar'); },
                Infernite(offset){ return spaceCostMultiplier('zoo', offset, 75000, 1.24, 'interstellar'); },
                Brick(offset){ return spaceCostMultiplier('zoo', offset, 2000000, 1.24, 'interstellar'); },
            },
            effect(){
                let morale = 5;
                let max = 2;
                let food = 12000;
                return `<div class="has-text-caution">${loc('space_used_support',[loc('interstellar_alpha_name')])}</div><div>${loc('space_red_vr_center_effect1',[morale])}</div><div>${loc('space_red_vr_center_effect2',[max])}</div><div class="has-text-caution">${loc('interstellar_alpha_starport_effect3',[food,global.resource.Food.name])}</div>`;
            },
            powered(){ return 0; },
            s_type: 'alpha',
            support(){ return -1; },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('zoo','interstellar');
                    powerOnNewStruct($(this)[0]);
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0, on: 0 },
                    p: ['zoo','interstellar']
                };
            }
        },
        warehouse: {
            id: 'interstellar-warehouse',
            title(){
                return global.tech['storage'] <= 2 ? loc('city_shed_title1') : (global.tech['storage'] >= 4 ? loc('city_shed_title3') : loc('city_shed_title2'));
            },
            desc(){
                let storage = global.tech['storage'] >= 3 ? (global.tech['storage'] >= 4 ? loc('city_shed_desc_size3') : loc('city_shed_desc_size2')) : loc('city_shed_desc_size1');
                return loc('city_shed_desc',[storage]);
            },
            reqs: { alpha: 2 },
            cost: {
                Money(offset){ return spaceCostMultiplier('warehouse', offset, 175000, 1.28, 'interstellar'); },
                Lumber(offset){ return spaceCostMultiplier('warehouse', offset, 100000, 1.28, 'interstellar'); },
                Aluminium(offset){ return spaceCostMultiplier('warehouse', offset, 120000, 1.28, 'interstellar'); },
                Cement(offset){ return spaceCostMultiplier('warehouse', offset, 45000, 1.28, 'interstellar'); }
            },
            res(){
                let r_list = ['Lumber','Stone','Chrysotile','Furs','Copper','Iron','Aluminium','Cement','Coal','Nano_Tube','Neutronium','Adamantite','Infernite'];
                if (global.tech['storage'] >= 3 && global.resource.Steel.display){
                    r_list.push('Steel');
                }
                if (global.tech['storage'] >= 4 && global.resource.Titanium.display){
                    r_list.push('Titanium');
                }
                return r_list;
            },
            val(res){
                switch (res){
                    case 'Lumber':
                        return 750;
                    case 'Stone':
                        return 750;
                    case 'Chrysotile':
                        return 750;
                    case 'Furs':
                        return 425;
                    case 'Copper':
                        return 380;
                    case 'Iron':
                        return 350;
                    case 'Aluminium':
                        return 320;
                    case 'Cement':
                        return 280;
                    case 'Coal':
                        return 120;
                    case 'Steel':
                        return 60;
                    case 'Titanium':
                        return 40;
                    case 'Nano_Tube':
                        return 30;
                    case 'Neutronium':
                        return 8;
                    case 'Adamantite':
                        return 18;
                    case 'Infernite':
                        return 5;
                    default:
                        return 0;
                }
            },
            wide: true,
            effect(wiki){
                let storage = '<div class="aTable">';
                let multiplier = storageMultipler(1, wiki);
                for (const res of $(this)[0].res()){
                    if (global.resource[res].display){
                        let val = sizeApproximation(+(spatialReasoning($(this)[0].val(res)) * multiplier).toFixed(0),1);
                        storage = storage + `<span>${loc('plus_max_resource',[val,global.resource[res].name])}</span>`;
                    }
                };
                storage = storage + '</div>';
                return storage;
            },
            action(args){
                if (payCosts($(this)[0])){
                    incrementStruct('warehouse','interstellar');
                    let multiplier = storageMultipler();
                    for (const res of $(this)[0].res()){
                        if (global.resource[res].display){
                            global.resource[res].max += (spatialReasoning($(this)[0].val(res) * multiplier));
                        }
                    };
                    return true;
                }
                return false;
            },
            struct(){
                return {
                    d: { count: 0 },
                    p: ['warehouse','interstellar']
                };
            }
        },
        wonder_gardens: {
            id: 'interstellar-wonder_gardens',
            title(){
                return loc('interstellar_wonder_gardens');
            },
            desc(){
                return loc('interstellar_wonder_gardens');
            },
            reqs: {},
            condition(){
                return global.race['wish'] && global.race['wishStats'] && global.interstellar['wonder_gardens'] ? true : false;
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
    };
