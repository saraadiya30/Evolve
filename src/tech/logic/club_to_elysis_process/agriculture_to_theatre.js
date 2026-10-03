import { loc } from '../../../core/locale.js';
import { global, p_on } from '../../../core/vars.js';
import { payCosts, actions, initStruct } from '../../../actions/actions.js';
import { checkAltPurgatory } from '../../../races/races.js';
import { addSmelter, defineIndustry } from '../../../industry/industry.js';

// Bagian dari techsPart1 (27 entri: agriculture .. theatre), dipisah dari group_loader.js. Urutan entri sama persis.
export const techsPart1Part3 = {
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
};
