import { loc } from '../core/locale.js';
import { payCosts, initStruct, actions, drawTech, updateQueueNames } from '../actions/actions.js';
import { global } from '../core/vars.js';
import { defineIndustry } from '../industry/industry.js';
import { renderPsychicPowers } from '../races/races.js';
import { loadFoundry } from '../civics/jobs.js';
import { vBind } from '../functions/functions.js';

// Bagian dari techsPart2 (23 entri: smelting .. cranes), dipisah dari techs_part2.js. Urutan entri sama persis.
export const techsPart2Part1 = {
    smelting: {
        title: loc('tech_smelting'),
        desc: loc('tech_smelting_desc'),
        cost: {
            Knowledge(){ return 4050; }
        },
        effect: loc('tech_smelting_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.smelter);
                return true;
            }
            return false;
        },
        post(){
            if (global.race['steelen']){
                global.tech['smelting'] = 2;
                drawTech();
            }
        }
    },
    steel: {
        title: loc('tech_steel'),
        desc: loc('tech_steel_desc'),
        condition() {
            return global.race['steelen'] ? false : true;
        },
        cost: {
            Knowledge(){ return 4950; },
            Steel(){ return 25; }
        },
        effect: loc('tech_steel_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.resource.Steel.display = true;
                return true;
            }
            return false;
        },
        post(){
            defineIndustry();
            renderPsychicPowers();
        }
    },
    blast_furnace: {
        title: loc('tech_blast_furnace'),
        desc: loc('tech_blast_furnace'),
        cost: {
            Knowledge(){ return 13500; },
            Coal(){ return 2000; }
        },
        effect: loc('tech_blast_furnace_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        post(){
            if (global.race['steelen']){
                global.tech['smelting'] = 6;
                drawTech();
            }
        }
    },
    bessemer_process: {
        title: loc('tech_bessemer_process'),
        desc: loc('tech_bessemer_process'),
        condition() {
            return global.race['steelen'] ? false : true;
        },
        cost: {
            Knowledge(){ return 19800; },
            Coal(){ return 5000; }
        },
        effect: loc('tech_bessemer_process_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    oxygen_converter: {
        title: loc('tech_oxygen_converter'),
        desc: loc('tech_oxygen_converter'),
        condition() {
            return global.race['steelen'] ? false : true;
        },
        cost: {
            Knowledge(){ return 46800; },
            Coal(){ return 10000; }
        },
        effect: loc('tech_oxygen_converter_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    electric_arc_furnace: {
        title: loc('tech_electric_arc_furnace'),
        desc: loc('tech_electric_arc_furnace'),
        condition() {
            return global.race['steelen'] ? false : true;
        },
        cost: {
            Knowledge(){ return 85500; },
            Copper(){ return 25000; }
        },
        effect: loc('tech_electric_arc_furnace_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    hellfire_furnace: {
        title: loc('tech_hellfire_furnace'),
        desc: loc('tech_hellfire_furnace'),
        cost: {
            Knowledge(){ return 615000; },
            Infernite(){ return 2000; },
            Soul_Gem(){ return 2; }
        },
        effect: loc('tech_hellfire_furnace_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    infernium_fuel: {
        title: loc('tech_infernium_fuel'),
        desc: loc('tech_infernium_fuel'),
        cost: {
            Knowledge(){ return 27500000; },
            Coal(){ return global.race['warlord'] ? 35000000 : 45000000; },
            Oil(){ return 500000; },
            Infernite(){ return 750000; }
        },
        effect: loc('tech_infernium_fuel_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        post(){
            defineIndustry();
        }
    },
    iridium_smelting_perk: {
        title: loc('tech_iridium_smelting'),
        desc: loc('tech_iridium_smelting'),
        condition(){ return global.stats.achieve['pathfinder'] && global.stats.achieve.pathfinder.l >= 3 ? true : false; },
        cost: {
            Knowledge(){ return 350000; },
            Mythril(){ return 2500; }
        },
        effect: loc('tech_iridium_smelting_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        post(){
            defineIndustry();
        }
    },
    rotary_kiln: {
        title: loc('tech_rotary_kiln'),
        desc: loc('tech_rotary_kiln'),
        cost: {
            Knowledge(){ return 57600; },
            Coal(){ return 8000; }
        },
        effect: loc('tech_rotary_kiln_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    metal_working: {
        title: loc('tech_metal_working'),
        desc: loc('tech_metal_working_desc'),
        cost: {
            Knowledge(){ return 350; }
        },
        effect: loc('tech_metal_working_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.mine);
                return true;
            }
            return false;
        }
    },
    iron_mining: {
        title: loc('tech_iron_mining'),
        desc: loc('tech_iron_mining_desc'),
        cost: {
            Knowledge(){ return global.city.ptrait.includes('unstable') ? 500 : 2500; }
        },
        effect: loc('tech_iron_mining_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.resource.Iron.display = true;
                if (global.city['foundry'] && global.city['foundry'].count > 0){
                    global.resource.Wrought_Iron.display = true;
                    loadFoundry();
                }
                return true;
            }
            return false;
        },
        post(){
            renderPsychicPowers();
        }
    },
    coal_mining: {
        title: loc('tech_coal_mining'),
        desc: loc('tech_coal_mining_desc'),
        cost: {
            Knowledge(){ return 4320; }
        },
        effect: loc('tech_coal_mining_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.coal_mine);
                global.resource.Coal.display = true;
                return true;
            }
            return false;
        },
        post(){
            renderPsychicPowers();
        }
    },
    storage: {
        title: loc('tech_storage'),
        desc: loc('tech_storage_desc'),
        cost: {
            Knowledge(){ return 20; }
        },
        effect: loc('tech_storage_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.shed);
                return true;
            }
            return false;
        }
    },
    reinforced_shed: {
        title: loc('tech_reinforced_shed'),
        desc: loc('tech_reinforced_shed_desc'),
        cost: {
            Money(){ return 3750; },
            Knowledge(){ return 2550; },
            Iron(){ return 750; },
            Cement(){ return 500; }
        },
        effect: loc('tech_reinforced_shed_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    barns: {
        title: loc('tech_barns'),
        desc: loc('tech_barns_desc'),
        cost: {
            Knowledge(){ return 15750; },
            Aluminium(){ return 3000; },
            Steel(){ return 3000; }
        },
        effect: loc('tech_barns_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        post(){
            updateQueueNames(false, ['city-shed']);
        }
    },
    warehouse: {
        title: loc('tech_warehouse'),
        desc: loc('tech_warehouse_desc'),
        cost: {
            Knowledge(){ return 40500; },
            Titanium(){ return 3000; }
        },
        effect: loc('tech_warehouse_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        post(){
            updateQueueNames(false, ['city-shed']);
        }
    },
    cameras: {
        title: loc('tech_cameras'),
        desc: loc('tech_cameras_desc'),
        cost: {
            Money(){ return 90000; },
            Knowledge(){ return 65000; }
        },
        effect: loc('tech_cameras_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    pocket_dimensions: {
        title: loc('tech_pocket_dimensions'),
        desc: loc('tech_pocket_dimensions_desc'),
        cost: {
            Knowledge(){ return 108000; }
        },
        effect: loc('tech_pocket_dimensions_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    ai_logistics: {
        title: loc('tech_ai_logistics'),
        desc: loc('tech_ai_logistics'),
        cost: {
            Knowledge(){ return 650000; }
        },
        effect: loc('tech_ai_logistics_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    containerization: {
        title: loc('tech_containerization'),
        desc: loc('tech_containerization_desc'),
        cost: {
            Knowledge(){ return 2700; }
        },
        effect: loc('tech_containerization_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.storage_yard);
                return true;
            }
            return false;
        }
    },
    reinforced_crates: {
        title: loc('tech_reinforced_crates'),
        desc: loc('tech_reinforced_crates'),
        cost: {
            Knowledge(){ return 6750; },
            Sheet_Metal(){ return 100; }
        },
        effect() {
            if (global.race['smoldering'] || global.race['kindling_kindred'] || global.race['evil']){
                let res = loc('resource_Bones_name');
                if (global.race['smoldering']){
                    res = loc('resource_Chrysotile_name');
                }
                else if (global.race['kindling_kindred']){
                    res = loc('resource_Stone_name');
                }
                return loc('tech_reinforced_crates_alt_effect',[res]);
            }
            else {
                return loc('tech_reinforced_crates_effect');
            }
        },
        action(){
            if (payCosts($(this)[0])){
                vBind({el: `#createHead`},'update');
                return true;
            }
            return false;
        }
    },
    cranes: {
        title: loc('tech_cranes'),
        desc: loc('tech_cranes_desc'),
        cost: {
            Knowledge(){ return 18000; },
            Copper(){ return 1000; },
            Steel(){ return 2500; }
        },
        effect: loc('tech_cranes_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
};
