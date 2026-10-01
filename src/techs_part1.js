import { global, p_on } from './vars.js';
import { loc } from './locale.js';
import { messageQueue } from './functions.js';
import { payCosts, housingLabel, wardenLabel, structName, actions, initStruct } from './actions.js';
import { checkAltPurgatory, renderPsychicPowers, renderSupernatural } from './races.js';
import { drawResourceTab } from './resources.js';
import { loadFoundry } from './jobs.js';
import { defineIndustry, addSmelter } from './industry.js';

// Bagian 1 dari techs: HANYA logika/teks dinamis (title, desc, cost, action, effect, condition, post, wiki, flair). Field statis ada di techs_data.js
export const techsPart1 = {
    club: {
        title: loc('tech_club'),
        desc: loc('tech_club_desc'),
        cost: {
            Lumber(){ return global.race['kindling_kindred'] || global.race['smoldering'] ? 0 : 5; },
            Stone(){ return global.race['kindling_kindred'] || global.race['smoldering'] ? 5 : 0; }
        },
        action(){
            if (payCosts($(this)[0])){
                global.resource.Food.display = true;
                return true;
            }
            return false;
        }
    },
    bone_tools: {
        title: loc('tech_bone_tools'),
        desc: loc('tech_bone_tools_desc'),
        condition(){
            return global.race['soul_eater'] && !global.race['evil'] ? false : true;
        },
        cost: {
            Food(){ return global.race['evil'] && !global.race['smoldering'] || global.race['fasting'] ? 0 : 10; },
            Lumber(){ return global.race['evil'] && !global.race['smoldering'] || global.race['fasting'] ? 10 : 0; }
        },
        action(){
            if (payCosts($(this)[0])){
                global.resource.Stone.display = true;
                if (global.race['smoldering']){
                    global.resource.Chrysotile.display = true;
                }
                return true;
            }
            return false;
        }
    },
    wooden_tools: {
        title() {
            return global.race['kindling_kindred'] ? loc('tech_bone_tools') : loc('tech_wooden_tools');
        },
        desc() {
            return global.race['kindling_kindred'] ? loc('tech_bone_tools_desc') : loc('tech_wooden_tools_desc');
        },
        condition(){
            return global.race['soul_eater'] && !global.race['evil'] ? true : false;
        },
        cost: {
            Lumber(){ return 10; }
        },
        action(){
            if (payCosts($(this)[0])){
                global.resource.Stone.display = true;
                if (global.race['smoldering']){
                    global.resource.Chrysotile.display = true;
                }
                return true;
            }
            return false;
        }
    },
    sundial: {
        title(){ return global.race['unfathomable'] ? loc('tech_moondial') : loc('tech_sundial'); },
        desc(){ return global.race['unfathomable'] ? loc('tech_moondial_desc') : loc('tech_sundial_desc'); },
        condition(){ return !global.race['gravity_well'] || (global.race['gravity_well'] && global.tech['transport']) ? true : false; },
        cost: {
            Lumber(){ return 8; },
            Stone(){ return 10; }
        },
        effect(){ return global.race['unfathomable'] ? loc('tech_moondial_effect') : loc('tech_sundial_effect'); },
        action(){
            if (payCosts($(this)[0])){
                messageQueue(loc('tech_sundial_msg'),'info',false,['progress']);
                global.resource.Knowledge.display = true;
                global.city.calendar.day++;
                if (global.race['infectious']){
                    global.civic.garrison.display = true;
                    global.settings.showCivic = true;
                    initStruct(actions.city.garrison);
                }
                if (global.race['banana'] && !global.race['terrifying']){
                    global.settings.showResources = true;
                    global.settings.showMarket = true;
                    global.resource.Money.display = true;
                    global.city.market.active = true;
                    global.tech['currency'] = 2;
                }
                if (global.race['calm']){
                    global.resource.Zen.display = true;
                    initStruct(actions.city.meditation);
                }
                return true;
            }
            return false;
        },
        post(){
            if (global.race['banana'] && !global.race['terrifying']){
                drawResourceTab('market');
            }
        }
    },
    wheel: {
        title(){ return loc('tech_wheel'); },
        desc(){ return loc('tech_wheel_desc'); },
        cost: {
            Lumber(){ return 50; },
            Stone(){ return 25; }
        },
        effect(){ return loc('tech_wheel_effect'); },
        action(){
            if (payCosts($(this)[0])){
                global.civic.teamster.display = true;
                return true;
            }
            return false;
        }
    },
    wagon: {
        title(){ return loc('tech_wagon'); },
        desc(){ return loc('tech_wagon'); },
        condition(){
            return global.tech['farm'] || global.tech['s_lodge'] || (global.tech['hunting'] && global.tech.hunting >= 2) || (global.race['soul_eater'] && global.race.species !== 'wendigo' && global.tech.housing >= 1 && global.tech.currency >= 1) ? true : false;
        },
        cost: {
            Knowledge(){ return 195; }
        },
        effect(){ return loc('tech_wagon_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    steam_engine: {
        title(){ return loc('tech_steam_engine'); },
        desc(){ return loc('tech_steam_engine'); },
        cost: {
            Knowledge(){ return 14345; }
        },
        effect(){ return loc('tech_steam_engine_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    combustion_engine: {
        title(){ return loc('tech_combustion_engine'); },
        desc(){ return loc('tech_combustion_engine'); },
        cost: {
            Knowledge(){ return 46777; }
        },
        effect(){ return loc('tech_combustion_engine_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    hover_cart: {
        title(){ return loc('tech_hover_cart'); },
        desc(){ return loc('tech_hover_cart'); },
        cost: {
            Knowledge(){ return 284000; }
        },
        effect(){ return loc('tech_hover_cart_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    osha: {
        title(){ return loc('tech_osha'); },
        desc(){ return loc('tech_osha'); },
        cost: {
            Knowledge(){ return 28262; }
        },
        effect(){ return loc('tech_osha_effect'); },
        action(){
            if (payCosts($(this)[0])){
                global.civic.teamster.stress = 6;
                return true;
            }
            return false;
        }
    },
    blackmarket: {
        title(){ return loc('tech_blackmarket'); },
        desc(){ return loc('tech_blackmarket'); },
        cost: {
            Knowledge(){ return 40666; }
        },
        effect(){ return loc('tech_blackmarket_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    pipelines: {
        title(){ return loc('tech_pipelines'); },
        desc(){ return loc('tech_pipelines'); },
        cost: {
            Knowledge(){ return 95000; }
        },
        effect(){ return loc('tech_pipelines_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    housing: {
        title: loc('tech_housing'),
        desc: loc('tech_housing_desc'),
        cost: {
            Knowledge(){ return 10; }
        },
        effect: loc('tech_housing_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.basic_housing);
                return true;
            }
            return false;
        }
    },
    cottage: {
        title(){
            return housingLabel('medium');
        },
        desc: loc('tech_cottage_desc'),
        cost: {
            Knowledge(){ return 3600; }
        },
        effect: loc('tech_cottage_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.cottage);
                return true;
            }
            return false;
        }
    },
    apartment: {
        title(){
            return housingLabel('large');
        },
        desc(){
            return housingLabel('large');
        },
        cost: {
            Knowledge(){ return 15750; }
        },
        effect: loc('tech_apartment_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.apartment);
                return true;
            }
            return false;
        }
    },
    arcology: {
        title: loc('tech_arcology'),
        desc: loc('tech_arcology'),
        cost: {
            Knowledge(){ return 25000000; }
        },
        effect(){ return loc('tech_arcology_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.portal.prtl_ruins.arcology);
                return true;
            }
            return false;
        }
    },
    steel_beams: {
        title: loc('tech_steel_beams'),
        desc: loc('tech_housing_cost'),
        cost: {
            Knowledge(){ return 11250; },
            Steel(){ return 2500; }
        },
        effect(){
            let label = housingLabel('small');
            let cLabel = housingLabel('medium');
            return loc('tech_steel_beams_effect',[label,cLabel]);
        },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    mythril_beams: {
        title: loc('tech_mythril_beams'),
        desc: loc('tech_housing_cost'),
        cost: {
            Knowledge(){ return 175000; },
            Mythril(){ return 1000; }
        },
        effect(){
            let label = housingLabel('small');
            let cLabel = housingLabel('medium');
            return loc('tech_mythril_beams_effect',[label,cLabel]);
        },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    neutronium_walls: {
        title: loc('tech_neutronium_walls'),
        desc: loc('tech_housing_cost'),
        cost: {
            Knowledge(){ return 300000; },
            Neutronium(){ return 850; }
        },
        effect(){
            let label = housingLabel('small');
            let cLabel = housingLabel('medium');
            return loc('tech_neutronium_walls_effect',[label,cLabel]);
        },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    bolognium_alloy_beams: {
        title: loc('tech_bolognium_alloy_beams'),
        desc: loc('tech_housing_cost'),
        cost: {
            Knowledge(){ return 3750000; },
            Adamantite(){ return 2500000; },
            Bolognium(){ return 100000; }
        },
        effect(){
            let label = housingLabel('small');
            let cLabel = housingLabel('medium');
            return loc('tech_bolognium_alloy_beams_effect',[label,cLabel]);
        },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    aphrodisiac: {
        title: loc('tech_aphrodisiac'),
        desc: loc('tech_aphrodisiac_desc'),
        cost: {
            Knowledge(){ return 4500; }
        },
        effect: loc('tech_aphrodisiac_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    fertility_clinic: {
        title: loc('tech_fertility_clinic'),
        desc: loc('tech_fertility_clinic'),
        cost: {
            Knowledge(){ return 4500000; }
        },
        effect: loc('tech_fertility_clinic_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    captive_housing: {
        title: loc('tech_captive_housing'),
        desc: loc('tech_captive_housing'),
        cost: {
            Knowledge(){ return 12; }
        },
        effect: loc('tech_captive_housing_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.captive_housing);
                return true;
            }
            return false;
        }
    },
    torture: {
        title: loc('tech_torture'),
        desc: loc('tech_torture'),
        cost: {
            Knowledge(){ return 25; }
        },
        effect: loc('tech_torture_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.civic.torturer.display = true;
                return true;
            }
            return false;
        }
    },
    thrall_quarters: {
        title: loc('tech_thrall_quarters'),
        desc: loc('tech_thrall_quarters'),
        cost: {
            Knowledge(){ return 95000; },
            Cement(){ return 50000; },
            Wrought_Iron(){ return 12500; }
        },
        effect: loc('tech_thrall_quarters_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.civic.torturer.display = true;
                return true;
            }
            return false;
        }
    },
    minor_wish: {
        title: loc('tech_minor_wish'),
        desc: loc('tech_minor_wish'),
        condition(){ return global.settings.showCivic; },
        cost: {
            Knowledge(){ return 50; }
        },
        effect: loc('tech_minor_wish_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.settings.showWish = true;
                global.race['wishStats'] = { 
                    minor: 0, major: 0, plas: 0, tax: 0, bad: 0, fame: 0, troop: 0, 
                    prof: 0, potato: 0, priest: 0, temple: false, zigg: false, 
                    astro: false, casino: false, ship: false, gov: false, strong: false
                };
                return true;
            }
            return false;
        },
        post(){
            renderSupernatural();
        }
    },
    major_wish: {
        title: loc('tech_major_wish'),
        desc: loc('tech_major_wish'),
        condition(){ return global.settings.showCivic; },
        cost: {
            Knowledge(){ return 110000; }
        },
        effect: loc('tech_major_wish_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        post(){
            renderSupernatural();
        }
    },
    psychic_energy: {
        title: loc('tech_psychic_energy'),
        desc: loc('tech_psychic_energy'),
        condition(){ return global.settings.showCivic; },
        cost: {
            Knowledge(){ return 15; }
        },
        effect: loc('tech_psychic_energy_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.resource.Energy.display = true;
                global.settings.showPsychic = true;
                global.race['psychicPowers'] = { boost: { r: 'Food' }, boostTime: 0 };
                return true;
            }
            return false;
        },
        post(){
            renderPsychicPowers();
        }
    },
    psychic_attack: {
        title: loc('tech_psychic_attack'),
        desc: loc('tech_psychic_attack'),
        condition(){ return global.stats.psykill >= 10; },
        cost: {
            Knowledge(){ return 100; }
        },
        effect: loc('tech_psychic_attack_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.race.psychicPowers['assaultTime'] = 0;
                return true;
            }
            return false;
        },
        post(){
            renderPsychicPowers();
        }
    },
    psychic_finance: {
        title: loc('tech_psychic_finance'),
        desc: loc('tech_psychic_finance'),
        cost: {
            Knowledge(){ return 65000; }
        },
        effect: loc('tech_psychic_finance_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.race.psychicPowers['cash'] = 0;
                return true;
            }
            return false;
        },
        post(){
            renderPsychicPowers();
        }
    },
    psychic_channeling: {
        title: loc('tech_psychic_channeling'),
        desc: loc('tech_psychic_channeling'),
        cost: {
            Knowledge(){ return 360000; }
        },
        effect: loc('tech_psychic_channeling_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.race.psychicPowers['channel'] = { cash: 0, assault: 0, boost: 0 };
                return true;
            }
            return false;
        },
        post(){
            renderPsychicPowers();
        }
    },
    psychic_efficiency: {
        title: loc('tech_psychic_efficiency'),
        desc: loc('tech_psychic_efficiency'),
        cost: {
            Knowledge(){ return 5250000; }
        },
        effect: loc('tech_psychic_efficiency_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        post(){
            renderPsychicPowers();
        }
    },
    mind_break: {
        title: loc('tech_mind_break'),
        desc: loc('tech_mind_break'),
        cost: {
            Knowledge(){ return 7000; }
        },
        effect: loc('tech_mind_break_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        post(){
            renderPsychicPowers();
        }
    },
    psychic_stun: {
        title: loc('tech_psychic_stun'),
        desc: loc('tech_psychic_stun'),
        cost: {
            Knowledge(){ return 32000; }
        },
        effect: loc('tech_psychic_stun_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        post(){
            renderPsychicPowers();
        }
    },
    spear: {
        title: loc('tech_spear'),
        desc: loc('tech_spear_desc'),
        cost: {
            Knowledge(){ return 110; },
            Stone(){ return 75; }
        },
        effect: loc('tech_spear_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    bronze_spear: {
        title: loc('tech_bronze_spear'),
        desc: loc('tech_bronze_spear_desc'),
        cost: {
            Knowledge(){ return 525; },
            Copper(){ return 50; }
        },
        effect: loc('tech_bronze_spear_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    iron_spear: {
        title: loc('tech_iron_spear'),
        desc: loc('tech_iron_spear_desc'),
        cost: {
            Knowledge(){ return global.city.ptrait.includes('unstable') ? 1650 : 3300; },
            Iron(){ return 375; }
        },
        effect: loc('tech_bronze_spear_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    steel_spear: {
        title: loc('tech_steel_spear'),
        desc: loc('tech_steel_spear_desc'),
        cost: {
            Knowledge(){ return 10500; },
            Iron(){ return 750; }
        },
        effect: loc('tech_bronze_spear_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    titanium_spear: {
        title: loc('tech_titanium_spear'),
        desc: loc('tech_titanium_spear_desc'),
        cost: {
            Knowledge(){ return 39500; },
            Titanium(){ return 475; }
        },
        effect: loc('tech_bronze_spear_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    dowsing_rod: {
        title: loc('tech_dowsing_rod'),
        desc: loc('tech_dowsing_rod_desc'),
        cost: {
            Knowledge(){ return 450; },
            Lumber(){ return 750; }
        },
        effect: loc('tech_dowsing_rod_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    metal_detector: {
        title: loc('tech_metal_detector'),
        desc: loc('tech_metal_detector_desc'),
        cost: {
            Knowledge(){ return 65000; }
        },
        effect: loc('tech_metal_detector_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    smokehouse: {
        title(){ return global.race['hrt'] && ['wolven','vulpine'].includes(global.race['hrt']) ? loc('city_smokehouse_easter') : loc('tech_smokehouse'); },
        desc(){ return global.race['hrt'] && ['wolven','vulpine'].includes(global.race['hrt']) ? loc('tech_smokehouse_easter_desc') : loc('tech_smokehouse_desc'); },
        cost: {
            Knowledge(){ return 80; }
        },
        effect(){ return global.race['hrt'] && ['wolven','vulpine'].includes(global.race['hrt']) ? loc('tech_smokehouse_easter_effect') : loc('tech_smokehouse_effect'); },
        action(){
            if (payCosts($(this)[0])){
                checkAltPurgatory('city','smokehouse','silo',actions.city.smokehouse.struct().d);
                return true;
            }
            return false;
        },
        post(){
            if (global.tech['s_lodge']){
                global.tech['hunting'] = 2;
            }
        }
    },
    lodge: {
        title: loc('tech_lodge'),
        desc: loc('tech_lodge'),
        wiki: global.race['carnivore'] ? true : false,
        condition(){ return global.tech['s_lodge'] ? false : true; },
        cost: {
            Knowledge(){ return 180; }
        },
        effect: loc('tech_lodge_effect'),
        action(){
            if (payCosts($(this)[0])){
                checkAltPurgatory('city','lodge','farm',actions.city.lodge.struct().d);
                return true;
            }
            return false;
        }
    },
    alt_lodge: {
        title(){ return this.condition() ? loc('tech_lodge_alt') : loc('tech_lodge'); },
        desc(){ return this.condition() ? loc('tech_lodge_alt') : loc('tech_lodge'); },
        wiki: global.race['carnivore'] ? false : true,
        condition(){
            return (((global.race.species === 'wendigo' || global.race['detritivore']) && !global.race['carnivore'] && !global.race['herbivore'])
              || (global.race['carnivore'] && global.race['soul_eater']) || global.race['artifical'] || global.race['unfathomable'] || global.race['forager']) ? true : false;
        },
        cost: {
            Knowledge(){ return global.race['artifical'] ? 10000 : 180; }
        },
        effect(){ return this.condition() ? loc('tech_lodge_effect_alt') : loc('tech_lodge_effect'); },
        action(){
            if (payCosts($(this)[0])){
                checkAltPurgatory('city','lodge','farm',actions.city.lodge.struct().d);
                return true;
            }
            return false;
        }
    },
    soul_well: {
        title: loc('tech_soul_well'),
        desc: loc('tech_soul_well'),
        cost: {
            Knowledge(){ return 10; }
        },
        effect: loc('tech_soul_well_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.soul_well);
                return true;
            }
            return false;
        }
    },
    compost: {
        title: loc('tech_compost'),
        desc: loc('tech_compost_desc'),
        cost: {
            Knowledge(){ return 10; }
        },
        effect: loc('tech_compost_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.compost);
                return true;
            }
            return false;
        }
    },
    hot_compost: {
        title: loc('tech_hot_compost'),
        desc: loc('tech_hot_compost'),
        cost: {
            Knowledge(){ return 100; }
        },
        effect: loc('tech_hot_compost_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    mulching: {
        title: loc('tech_mulching'),
        desc: loc('tech_mulching'),
        cost: {
            Knowledge(){ return 3200; }
        },
        effect: loc('tech_mulching_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    adv_mulching: {
        title: loc('tech_adv_mulching'),
        desc: loc('tech_adv_mulching'),
        cost: {
            Knowledge(){ return 16000; }
        },
        effect: loc('tech_adv_mulching_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    agriculture: {
        title: loc('tech_agriculture'),
        desc: loc('tech_agriculture_desc'),
        condition(){
            return (global.race['herbivore'] || (!global.race['carnivore'] && !global.race['detritivore'] && !global.race['soul_eater'])) ? true : false;
        },
        cost: {
            Knowledge(){ return 10; }
        },
        effect: loc('tech_agriculture_effect'),
        action(){
            if (payCosts($(this)[0])){
                checkAltPurgatory('city','farm','lodge',actions.city.farm.struct().d);
                return true;
            }
            return false;
        }
    },
    farm_house: {
        title: loc('tech_farm_house'),
        desc: loc('tech_farm_house_desc'),
        cost: {
            Money(){ return 50; },
            Knowledge(){ return 180; }
        },
        effect: loc('tech_farm_house_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    irrigation: {
        title: loc('tech_irrigation'),
        desc: loc('tech_irrigation_desc'),
        cost: {
            Knowledge(){ return 55; }
        },
        effect: loc('tech_irrigation_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    silo: {
        title: loc('tech_silo'),
        desc: loc('tech_silo_desc'),
        cost: {
            Knowledge(){ return 80; }
        },
        effect: loc('tech_silo_effect'),
        action(){
            if (payCosts($(this)[0])){
                checkAltPurgatory('city','silo','smokehouse',actions.city.silo.struct().d);
                return true;
            }
            return false;
        }
    },
    mill: {
        title: loc('tech_mill'),
        desc: loc('tech_mill_desc'),
        cost: {
            Knowledge(){ return 5400; }
        },
        effect: loc('tech_mill_effect'),
        action(){
            if (payCosts($(this)[0])){
                checkAltPurgatory('city','mill','windmill',actions.city.mill.struct().d);
                return true;
            }
            return false;
        }
    },
    windmill: {
        title: loc('tech_windmill'),
        desc: loc('tech_windmill_desc'),
        cost: {
            Knowledge(){ return 16200; }
        },
        effect: loc('tech_windmill_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    windturbine: {
        title: loc('tech_windturbine'),
        desc: loc('tech_windturbine'),
        cost: {
            Knowledge(){ return 66000; }
        },
        effect: loc('tech_windturbine_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    wind_plant: {
        title(){ return global.race['unfathomable'] ? loc('tech_watermill') : loc('tech_windmill'); },
        desc(){ return global.race['unfathomable'] ? loc('tech_watermill') : loc('tech_windmill'); },
        condition(){
            return (global.race['carnivore'] || global.race['detritivore'] || global.race['artifical'] || global.race['soul_eater'] || global.race['unfathomable'] || global.race['forager']) ? true : false;
        },
        cost: {
            Knowledge(){ return 66000; }
        },
        effect(){ return global.race['unfathomable'] ? loc('tech_watermill_effect') : loc('tech_wind_plant_effect'); },
        action(){
            if (payCosts($(this)[0])){
                checkAltPurgatory('city','windmill','mill',actions.city.windmill.struct().d);
                return true;
            }
            return false;
        }
    },
    gmfood: {
        title: loc('tech_gmfood'),
        desc: loc('tech_gmfood_desc'),
        cost: {
            Knowledge(){ return 95000; }
        },
        effect: loc('tech_gmfood_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    foundry: {
        title: loc('tech_foundry'),
        desc: loc('tech_foundry'),
        cost: {
            Knowledge(){ return 650; }
        },
        effect: loc('tech_foundry_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.foundry);
                return true;
            }
            return false;
        }
    },
    artisans: {
        title: loc('tech_artisans'),
        desc: loc('tech_artisans'),
        cost: {
            Knowledge(){ return 1500; }
        },
        effect: loc('tech_artisans_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    apprentices: {
        title: loc('tech_apprentices'),
        desc: loc('tech_apprentices'),
        cost: {
            Knowledge(){ return 3200; }
        },
        effect: loc('tech_apprentices_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    carpentry: {
        title: loc('tech_carpentry'),
        desc: loc('tech_carpentry'),
        cost: {
            Knowledge(){ return 5200; }
        },
        effect: loc('tech_carpentry_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    demonic_craftsman: {
        title: loc('tech_master_craftsman'),
        desc: loc('tech_master_craftsman'),
        wiki: global.race['evil'] ? true : false,
        cost: {
            Knowledge(){ return 12000; }
        },
        effect: loc('tech_master_craftsman_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    master_craftsman: {
        title: loc('tech_master_craftsman'),
        desc: loc('tech_master_craftsman'),
        wiki: global.race['evil'] ? false : true,
        cost: {
            Knowledge(){ return 12000; }
        },
        effect: loc('tech_master_craftsman_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    brickworks: {
        title: loc('tech_brickworks'),
        desc: loc('tech_brickworks'),
        cost: {
            Knowledge(){ return 18500; }
        },
        effect: loc('tech_brickworks_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    machinery: {
        title: loc('tech_machinery'),
        desc: loc('tech_machinery'),
        cost: {
            Knowledge(){ return 66000; }
        },
        effect: loc('tech_machinery_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    cnc_machine: {
        title: loc('tech_cnc_machine'),
        desc: loc('tech_cnc_machine'),
        cost: {
            Knowledge(){ return 132000; }
        },
        effect: loc('tech_cnc_machine_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    vocational_training: {
        title: loc('tech_vocational_training'),
        desc: loc('tech_vocational_training'),
        cost: {
            Knowledge(){ return 30000; }
        },
        effect: loc('tech_vocational_training_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    stellar_forge: {
        title: loc('tech_stellar_forge'),
        desc: loc('tech_stellar_forge'),
        cost: {
            Knowledge(){ return 4500000; }
        },
        effect: loc('tech_stellar_forge_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.interstellar.int_neutron.stellar_forge);
                return true;
            }
            return false;
        }
    },
    stellar_smelting: {
        title: loc('tech_stellar_smelting'),
        desc: loc('tech_stellar_smelting'),
        cost: {
            Knowledge(){ return 5000000; },
            Vitreloy(){ return 10000; }
        },
        effect: loc('tech_stellar_smelting_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        post(){
            let num_forge_on = p_on['stellar_forge'];
            let num_new_smelters = num_forge_on * actions.interstellar.int_neutron.stellar_forge.smelting();
            addSmelter(num_new_smelters, 'Iron', 'Star');
            defineIndustry();
        }
    },
    assembly_line: {
        title: loc('tech_assembly_line'),
        desc: loc('tech_assembly_line'),
        cost: {
            Knowledge(){ return 72000; },
            Copper(){ return 125000; }
        },
        effect: `<span>${loc('tech_assembly_line_effect')}</span> <span class="has-text-special">${loc('tech_factory_warning')}</span>`,
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    automation: {
        title: loc('tech_automation'),
        desc: loc('tech_automation'),
        cost: {
            Knowledge(){ return 165000; }
        },
        effect: `<span>${loc('tech_automation_effect')}</span> <span class="has-text-special">${loc('tech_factory_warning')}</span>`,
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    laser_cutters: {
        title: loc('tech_laser_cutters'),
        desc: loc('tech_laser_cutters'),
        cost: {
            Knowledge(){ return 300000; },
            Elerium(){ return 200; }
        },
        effect: `<span>${loc('tech_laser_cutters_effect')}</span> <span class="has-text-special">${loc('tech_factory_warning')}</span>`,
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    high_tech_factories: {
        title: loc('tech_high_tech_factories'),
        desc: loc('tech_high_tech_factories'),
        cost: {
            Knowledge(){ return 13500000; },
            Vitreloy(){ return 500000; },
            Orichalcum(){ return 300000; }
        },
        effect: `<span>${loc('tech_high_tech_factories_effect')}</span> <span class="has-text-special">${loc('tech_factory_warning')}</span>`,
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    banquet:{
        title: loc('tech_banquet'),
        desc: loc('tech_banquet'),
        condition(){ return global.stats.achieve['endless_hunger'] && global.stats.achieve['endless_hunger'].l >= 1 ? true : false; },
        cost: {
            Knowledge(){ return 18500; }
        },
        effect: loc('tech_banquet_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.banquet);
                return true;
            }
            return false;
        }
    },
    theatre: {
        title(){ return global.race.universe === 'evil' ? loc('tech_theatre_evil') : loc('tech_theatre'); },
        desc(){ return global.race.universe === 'evil' ? loc('tech_theatre_evil') : loc('tech_theatre'); },
        cost: {
            Knowledge(){ return 750; }
        },
        effect(){ return global.race.universe === 'evil' ? loc('tech_theatre_evil_effect') : loc('tech_theatre_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.amphitheatre);
                return true;
            }
            return false;
        }
    },
    playwright: {
        title(){ return global.race.universe === 'evil' ? loc('tech_gladiators') : loc('tech_playwright'); },
        desc: loc('tech_playwright'),
        cost: {
            Knowledge(){ return 1080; }
        },
        effect(){ return global.race.universe === 'evil' ? loc('tech_gladiators_effect',[loc('city_colosseum')]) : loc('tech_playwright_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    magic: {
        title(){ 
            switch(global.race.universe){
                case 'magic':
                    return loc('tech_illusionist');
                case 'evil':
                    return loc('tech_mock_battles');
                default:
                    return loc('tech_magic');
            }
        },
        desc(){ return $(this)[0].title(); },
        cost: {
            Knowledge(){ return 7920; }
        },
        effect(){ 
            switch(global.race.universe){
                case 'magic':
                    return loc('tech_illusionist_effect');
                case 'evil':
                    return loc('tech_mock_battles_effect');
                default:
                    return loc('tech_magic_effect');
            }
        },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    superstars: {
        title(){ return global.race.universe === 'evil' ? loc('tech_champions') : loc('tech_superstars'); },
        desc(){ return global.race.universe === 'evil' ? loc('tech_champions') : loc('tech_superstars'); },
        cost: {
            Knowledge(){ return 660000; }
        },
        effect(){ return global.race.universe === 'evil' ? loc('tech_champions_effect') : loc('tech_superstars_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    radio: {
        title: loc('tech_radio'),
        desc: loc('tech_radio'),
        cost: {
            Knowledge(){ return 16200; }
        },
        effect(){ return loc('tech_radio_effect',[wardenLabel()]); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    tv: {
        title: loc('tech_tv'),
        desc: loc('tech_tv'),
        cost: {
            Knowledge(){ return 67500; }
        },
        effect(){ return loc('tech_tv_effect',[wardenLabel()]); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    vr_center: {
        title: loc('tech_vr_center'),
        desc: loc('tech_vr_center'),
        cost: {
            Knowledge(){ return 620000; }
        },
        effect(){ return loc('tech_vr_center_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_red.vr_center);
                return true;
            }
            return false;
        }
    },
    zoo: {
        title: loc('tech_zoo'),
        desc: loc('tech_zoo'),
        cost: {
            Knowledge(){ return 22500000; }
        },
        effect(){ return loc('tech_zoo_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.interstellar.int_alpha.zoo);
                return true;
            }
            return false;
        }
    },
    casino: {
        title: structName('casino'),
        desc: structName('casino'),
        cost: {
            Knowledge(){ return 95000; }
        },
        effect: loc('tech_casino_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.casino);
                initStruct(actions.space.spc_hell.spc_casino);
                return true;
            }
            return false;
        }
    },
    dazzle: {
        title: loc('tech_dazzle'),
        desc: loc('tech_dazzle'),
        cost: {
            Knowledge(){ return 125000; }
        },
        effect: loc('tech_dazzle_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    casino_vault: {
        title: loc('tech_casino_vault'),
        desc: loc('tech_casino_vault'),
        cost: {
            Knowledge(){ return 145000; },
            Iridium(){ return 2500; }
        },
        effect: loc('tech_casino_vault_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    otb: {
        title: loc('tech_otb'),
        desc: loc('tech_otb'),
        cost: {
            Knowledge(){ return 390000; }
        },
        effect: loc('tech_otb_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    online_gambling: {
        title: loc('tech_online_gambling'),
        desc: loc('tech_online_gambling'),
        cost: {
            Knowledge(){ return 800000; }
        },
        effect: loc('tech_online_gambling_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    bolognium_vaults: {
        title: loc('tech_bolognium_vaults'),
        desc: loc('tech_bolognium_vaults'),
        cost: {
            Knowledge(){ return 3900000; },
            Bolognium(){ return 180000; }
        },
        effect: loc('tech_bolognium_vaults_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    mining: {
        title(){ return global.race['sappy'] ? loc('tech_amber') : loc('tech_mining'); },
        desc(){ return global.race['sappy'] ? loc('tech_amber') : loc('tech_mining_desc'); },
        cost: {
            Knowledge(){ return 45; }
        },
        effect(){ return global.race['sappy'] ? loc('tech_amber_effect') : loc(global.race['flier'] ? 'tech_mining_effect_alt' : 'tech_mining_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.rock_quarry);
                if (global.race['cannibalize']){
                    initStruct(actions.city.s_alter);
                }
                return true;
            }
            return false;
        }
    },
    bayer_process: {
        title: loc('tech_bayer_process'),
        desc: loc('tech_bayer_process_desc'),
        cost: {
            Knowledge(){ return 4500; }
        },
        effect(){ return global.race['sappy'] ? loc('tech_bayer_process_effect_alt') : loc('tech_bayer_process_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.metal_refinery);
                loadFoundry();
                return true;
            }
            return false;
        }
    },
    elysis_process: {
        title: loc('tech_elysis_process'),
        desc: loc('tech_elysis_process'),
        cost: {
            Knowledge(){ return 675000; },
            Graphene(){ return 45000; },
            Stanene(){ return 75000; },
        },
        effect: loc('tech_elysis_process_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
};
