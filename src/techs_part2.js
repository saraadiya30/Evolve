import { global } from './vars.js';
import { loc } from './locale.js';
import { vBind, calcQueueMax, calcRQueueMax } from './functions.js';
import { payCosts, updateQueueNames, drawTech, actions, initStruct } from './actions.js';
import { renderPsychicPowers } from './races.js';
import { drawResourceTab } from './resources.js';
import { loadFoundry } from './jobs.js';
import { checkControlling } from './civics.js';
import { arpa } from './arpa.js';
import { defineIndustry } from './industry.js';
import { defineGovernor } from './governor.js';
import { swissKnife } from './swiss_knife.js';

// Bagian 2 dari techs: HANYA logika/teks dinamis (title, desc, cost, action, effect, condition, post, wiki, flair). Field statis ada di techs_data.js
export const techsPart2 = {
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
    titanium_crates: {
        title(){ return loc('tech_titanium_crates',[global.resource.Titanium.name]); },
        desc(){ return loc('tech_titanium_crates',[global.resource.Titanium.name]); },
        cost: {
            Knowledge(){ return 67500; },
            Titanium(){ return 1000; }
        },
        effect(){ return loc('tech_titanium_crates_effect',[global.resource.Titanium.name]); },
        action(){
            if (payCosts($(this)[0])){
                vBind({el: `#createHead`},'update');
                return true;
            }
            return false;
        }
    },
    mythril_crates: {
        title(){ return loc('tech_mythril_crates',[global.resource.Mythril.name]); },
        desc(){ return loc('tech_mythril_crates',[global.resource.Mythril.name]); },
        cost: {
            Knowledge(){ return 145000; },
            Mythril(){ return 350; }
        },
        effect(){ return loc('tech_mythril_crates_effect',[global.resource.Mythril.name]); },
        action(){
            if (payCosts($(this)[0])){
                vBind({el: `#createHead`},'update');
                return true;
            }
            return false;
        }
    },
    infernite_crates: {
        title(){ return loc('tech_crates',[global.resource.Infernite.name]); },
        desc(){ return loc('tech_infernite_crates_desc',[global.resource.Infernite.name]); },
        cost: {
            Knowledge(){ return 575000; },
            Infernite(){ return 1000; }
        },
        effect(){ return loc('tech_infernite_crates_effect',[global.resource.Infernite.name]); },
        action(){
            if (payCosts($(this)[0])){
                vBind({el: `#createHead`},'update');
                return true;
            }
            return false;
        }
    },
    graphene_crates: {
        title(){ return loc('tech_crates',[global.resource.Graphene.name]); },
        desc(){ return loc('tech_crates',[global.resource.Graphene.name]); },
        cost: {
            Knowledge(){ return 725000; },
            Graphene(){ return 75000; }
        },
        effect(){ return loc('tech_graphene_crates_effect',[global.resource.Graphene.name]); },
        action(){
            if (payCosts($(this)[0])){
                vBind({el: `#createHead`},'update');
                return true;
            }
            return false;
        }
    },
    bolognium_crates: {
        title(){ return loc('tech_crates',[global.resource.Bolognium.name]); },
        desc(){ return loc('tech_crates',[global.resource.Bolognium.name]); },
        cost: {
            Knowledge(){ return 3420000; },
            Bolognium(){ return 90000; }
        },
        effect(){ return loc('tech_bolognium_crates_effect',[global.resource.Bolognium.name]); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    elysanite_crates: {
        title(){ return loc('tech_crates',[global.resource.Elysanite.name]); },
        desc(){ return loc('tech_crates',[global.resource.Elysanite.name]); },
        cost: {
            Knowledge(){ return 95500000; },
            Omniscience(){ return 20250; },
            Asphodel_Powder(){ return 175000; },
            Elysanite(){ return 75000000; }
        },
        effect(){ return loc('tech_elysanite_crates_effect',[global.resource.Elysanite.name,global.resource.Asphodel_Powder.name]); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    steel_containers: {
        title(){ return loc('tech_containers',[global.resource.Steel.name]); },
        desc(){ return loc('tech_steel_containers_desc',[global.resource.Steel.name]); },
        cost: {
            Knowledge(){ return 9000; },
            Steel(){ return 250; }
        },
        effect() {
            if (global.race['smoldering'] || global.race['kindling_kindred'] || global.race['evil']){
                let res = global.race['kindling_kindred'] || global.race['smoldering'] ? (global.race['smoldering'] ? 'Chrysotile' : 'Stone') : 'Plywood';
                return loc('tech_steel_containers_alt_effect',[global.resource[res].name,global.resource.Steel.name]);
            }
            else {
                return loc('tech_steel_containers_effect',[global.resource.Steel.name]);
            }
        },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.warehouse);
                return true;
            }
            return false;
        }
    },
    gantry_crane: {
        title: loc('tech_gantry_crane'),
        desc: loc('tech_gantry_crane_desc'),
        cost: {
            Knowledge(){ return 22500; },
            Steel(){ return 5000; }
        },
        effect: loc('tech_gantry_crane_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    alloy_containers: {
        title(){ return loc('tech_containers',[global.resource.Alloy.name]); },
        desc(){ return loc('tech_alloy_containers_desc',[global.resource.Alloy.name]); },
        cost: {
            Knowledge(){ return 49500; },
            Alloy(){ return 2500; }
        },
        effect(){ return loc('tech_alloy_containers_effect',[global.resource.Alloy.name]); },
        action(){
            if (payCosts($(this)[0])){
                vBind({el: `#createHead`},'update');
                return true;
            }
            return false;
        }
    },
    mythril_containers: {
        title(){ return loc('tech_containers',[global.resource.Mythril.name]); },
        desc(){ return loc('tech_mythril_containers_desc',[global.resource.Mythril.name]); },
        cost: {
            Knowledge(){ return 165000; },
            Mythril(){ return 500; }
        },
        effect(){ return loc('tech_mythril_containers_effect',[global.resource.Mythril.name]); },
        action(){
            if (payCosts($(this)[0])){
                vBind({el: `#createHead`},'update');
                return true;
            }
            return false;
        }
    },
    adamantite_containers: {
        title(){ return loc('tech_containers',[global.resource.Adamantite.name]); },
        desc(){ return loc('tech_adamantite_containers_desc',[global.resource.Adamantite.name]); },
        cost: {
            Knowledge(){ return 525000; },
            Adamantite(){ return 17500; }
        },
        effect(){ return loc('tech_adamantite_containers_effect',[global.resource.Adamantite.name]); },
        action(){
            if (payCosts($(this)[0])){
                vBind({el: `#createHead`},'update');
                return true;
            }
            return false;
        }
    },
    aerogel_containers: {
        title(){ return loc('tech_containers',[global.resource.Aerogel.name]); },
        desc(){ return loc('tech_containers',[global.resource.Aerogel.name]); },
        cost: {
            Knowledge(){ return 775000; },
            Aerogel(){ return 500; }
        },
        effect(){ return loc('tech_aerogel_containers_effect',[global.resource.Aerogel.name]); },
        action(){
            if (payCosts($(this)[0])){
                vBind({el: `#createHead`},'update');
                return true;
            }
            return false;
        }
    },
    bolognium_containers: {
        title(){ return loc('tech_containers',[global.resource.Bolognium.name]); },
        desc(){ return loc('tech_containers',[global.resource.Bolognium.name]); },
        cost: {
            Knowledge(){ return 3500000; },
            Bolognium(){ return 125000; }
        },
        effect(){ return loc('tech_bolognium_containers_effect',[global.resource.Bolognium.name]); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    nanoweave_containers: {
        title(){ return loc('tech_nanoweave_containers',[global.resource.Nanoweave.name]); },
        desc(){ return loc('tech_nanoweave_containers',[global.resource.Nanoweave.name]); },
        cost: {
            Knowledge(){ return 9000000; },
            Nanoweave(){ return 50000; }
        },
        effect(){ return loc('tech_nanoweave_containers_effect',[global.resource.Nanoweave.name]); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    elysanite_containers: {
        title(){ return loc('tech_containers',[global.resource.Elysanite.name]); },
        desc(){ return loc('tech_containers',[global.resource.Elysanite.name]); },
        cost: {
            Knowledge(){ return 100000000; },
            Omniscience(){ return 22500; },
            Elysanite(){ return 100000000; }
        },
        effect(){ return loc('tech_elysanite_containers_effect',[global.resource.Elysanite.name]); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    evil_planning: {
        title: loc('tech_urban_planning'),
        desc: loc('tech_urban_planning'),
        wiki: global.race['terrifying'] ? true : false,
        cost: {
            Knowledge(){ return 2500; }
        },
        effect: loc('tech_urban_planning_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.queue.display = true;
                return true;
            }
            return false;
        },
        post(){
            calcQueueMax();
        }
    },
    urban_planning: {
        title: loc('tech_urban_planning'),
        desc: loc('tech_urban_planning'),
        wiki: global.race['terrifying'] ? false : true,
        cost: {
            Knowledge(){ return 2500; }
        },
        effect: loc('tech_urban_planning_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.queue.display = true;
                if (!global.settings.msgFilters.queue.unlocked){
                    global.settings.msgFilters.queue.unlocked = true;
                    global.settings.msgFilters.queue.vis = true;
                }
                return true;
            }
            return false;
        },
        post(){
            calcQueueMax();
        }
    },
    zoning_permits: {
        title: loc('tech_zoning_permits'),
        desc: loc('tech_zoning_permits'),
        cost: {
            Knowledge(){ return 28000; }
        },
        effect(){
            return loc('tech_zoning_permits_effect',[$(this)[0].bQueue()]);
        },
        bQueue(){
            return global.genes?.queue >= 2 ? 4 : 2;
        },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        post(){
            calcQueueMax();
        }
    },
    urbanization: {
        title: loc('tech_urbanization'),
        desc: loc('tech_urbanization'),
        cost: {
            Knowledge(){ return 95000; }
        },
        effect(){
            return loc('tech_urbanization_effect',[$(this)[0].bQueue()]);
        },
        bQueue(){
            return global.genes?.queue >= 2 ? 6 : 3;
        },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        post(){
            calcQueueMax();
        }
    },
    assistant: {
        title: loc('tech_assistant'),
        desc: loc('tech_assistant'),
        cost: {
            Knowledge(){ return 5000; }
        },
        effect: loc('tech_assistant_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.r_queue.display = true;
                if (!global.settings.msgFilters.building_queue.unlocked){
                    global.settings.msgFilters.building_queue.unlocked = true;
                    global.settings.msgFilters.building_queue.vis = true;
                    global.settings.msgFilters.research_queue.unlocked = true;
                    global.settings.msgFilters.research_queue.vis = true;
                }
                return true;
            }
            return false;
        },
        post(){
            calcRQueueMax();
            // Research queue is always visible on the research tab, so sub-tab check is intentionally excluded
            if (global.settings.tabLoad || global.settings.civTabs === 3){
                $(`#resQueue`).removeAttr('style');
            }
        }
    },
    government: {
        title: loc('tech_government'),
        desc: loc('tech_government_desc'),
        cost: {
            Knowledge(){ return 750; }
        },
        effect: loc('tech_government_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        post(){
            vBind({el: '#govType'},'update');
            vBind({el: '#foreign'},'update');
            vBind({el: '#government .govTabs2'},'update');
            if (global.settings.tabLoad){
                $(`#government .govTabs2`).removeAttr('style');
            }
        }
    },
    theocracy: {
        title: loc('govern_theocracy'),
        desc: loc('govern_theocracy'),
        cost: {
            Knowledge(){ return 1200; }
        },
        effect: loc('tech_theocracy_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    republic: {
        title: loc('govern_republic'),
        desc: loc('govern_republic'),
        condition(){
            return (global.tech['trade'] && global.tech['trade'] >= 2) || global.race['terrifying'] ? true : false;
        },
        cost: {
            Knowledge(){ return 17000; }
        },
        effect: loc('tech_republic_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    socialist: {
        title: loc('govern_socialist'),
        desc: loc('govern_socialist'),
        condition(){
            return (global.tech['trade'] && global.tech['trade'] >= 2) || global.race['terrifying'] ? true : false;
        },
        cost: {
            Knowledge(){ return 17000; }
        },
        effect: loc('tech_socialist_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    corpocracy: {
        title: loc('govern_corpocracy'),
        desc: loc('govern_corpocracy'),
        cost: {
            Knowledge(){ return 26000; }
        },
        effect: loc('tech_corpocracy_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    technocracy: {
        title: loc('govern_technocracy'),
        desc: loc('govern_technocracy'),
        cost: {
            Knowledge(){ return 26000; }
        },
        effect: loc('tech_technocracy_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    federation: {
        title: loc('govern_federation'),
        desc: loc('govern_federation'),
        condition(){
            return (global.tech['unify'] && global.tech['unify'] >= 2) || checkControlling();
        },
        cost: {
            Knowledge(){ return 30000; }
        },
        effect: loc('tech_federation_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    magocracy: {
        title: loc('govern_magocracy'),
        desc: loc('govern_magocracy'),
        condition(){
            return global.race.universe === 'magic' ? true : false;
        },
        cost: {
            Knowledge(){ return 26000; }
        },
        effect: loc('tech_magocracy_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    governor: {
        title: loc('tech_governor'),
        desc: loc('tech_governor'),
        condition(){
            return global.genes['governor'] && global.civic.govern.type !== 'anarchy' ? true : false;
        },
        cost: {
            Knowledge(){ return 1000; }
        },
        effect: loc('tech_governor_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.settings.showGovernor = true;
                return true;
            }
            return false;
        },
        post(){
            defineGovernor();
        }
    },
    spy: {
        title: loc('tech_spy'),
        desc: loc('tech_spy'),
        cost: {
            Knowledge(){ return 1250; }
        },
        effect: loc('tech_spy_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        post(){
            vBind({el: '#foreign'},'update');
            defineGovernor();
        }
    },
    espionage: {
        title: loc('tech_espionage'),
        desc: loc('tech_espionage'),
        cost: {
            Knowledge(){ return 7500; }
        },
        effect: loc('tech_espionage_effect'),
        action(){
            if (payCosts($(this)[0])){
                if (!global.settings.msgFilters.spy.unlocked){
                    global.settings.msgFilters.spy.unlocked = true;
                    global.settings.msgFilters.spy.vis = true;
                }
                return true;
            }
            return false;
        },
        post(){
            vBind({el: '#foreign'},'update');
            defineGovernor();
        }
    },
    spy_training: {
        title: loc('tech_spy_training'),
        desc: loc('tech_spy_training'),
        cost: {
            Knowledge(){ return 10000; }
        },
        effect: loc('tech_spy_training_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    spy_gadgets: {
        title: loc('tech_spy_gadgets'),
        desc: loc('tech_spy_gadgets'),
        cost: {
            Knowledge(){ return 15000; }
        },
        effect: loc('tech_spy_gadgets_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    code_breakers: {
        title: loc('tech_code_breakers'),
        desc: loc('tech_code_breakers'),
        cost: {
            Knowledge(){ return 55000; }
        },
        effect: loc('tech_code_breakers_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    currency: {
        title: loc('tech_currency'),
        desc: loc('tech_currency_desc'),
        cost: {
            Knowledge(){ return 22; },
            Lumber(){ return 10; }
        },
        effect: loc('tech_currency_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.resource.Money.display = true;
                return true;
            }
            return false;
        }
    },
    market: {
        title: loc('tech_market'),
        desc: loc('tech_market_desc'),
        cost: {
            Knowledge(){ return global.race['banana'] ? 300 : 1800; }
        },
        effect: loc('tech_market_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.settings.showResources = true;
                global.settings.showMarket = true;
                return true;
            }
            return false;
        },
        post(){
            drawResourceTab('market');
        }
    },
    tax_rates: {
        title: loc('tech_tax_rates'),
        desc: loc('tech_tax_rates_desc'),
        cost: {
            Knowledge(){ return 3375; }
        },
        effect: loc('tech_tax_rates_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.civic.taxes.display = true;
                return true;
            }
            return false;
        },
        post(){
            defineGovernor();
        }
    },
    large_trades: {
        title: loc('tech_large_trades'),
        desc: loc('tech_large_trades_desc'),
        cost: {
            Knowledge(){ return 6750; }
        },
        effect: loc('tech_large_trades_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        post(){
            if (global.race['noble']){
                global.tech['currency'] = 5;
                drawTech();
            }
        }
    },
    corruption: {
        title: loc('tech_corruption'),
        desc: loc('tech_corruption_desc'),
        cost: {
            Knowledge(){ return 36000; }
        },
        effect: loc('tech_corruption_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    massive_trades: {
        title: loc('tech_massive_trades'),
        desc: loc('tech_massive_trades_desc'),
        cost: {
            Knowledge(){ return 108000; }
        },
        effect: loc('tech_massive_trades_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    trade: {
        title: loc('tech_trade'),
        desc: loc('tech_trade_desc'),
        cost: {
            Knowledge(){ return global.race['banana'] ? 1200 : 4500; }
        },
        effect: loc('tech_trade_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.trade);
                global.city.market.active = true;
                return true;
            }
            return false;
        },
        post(){
            drawResourceTab('market');
        }
    },
    diplomacy: {
        title: loc('tech_diplomacy'),
        desc: loc('tech_diplomacy_desc'),
        cost: {
            Knowledge(){ return 16200; }
        },
        effect: loc('tech_diplomacy_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    freight: {
        title: loc('tech_freight'),
        desc: loc('tech_freight_desc'),
        cost: {
            Knowledge(){ return 37800; }
        },
        effect: loc('tech_freight_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        post(){
            if (global.tech['high_tech'] >= 6) {
                arpa('Physics');
            }
        }
    },
    wharf: {
        title: loc('tech_wharf'),
        desc: loc('tech_wharf_desc'),
        cost: {
            Knowledge(){ return 44000; }
        },
        effect: loc('tech_wharf_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.wharf);
                return true;
            }
            return false;
        }
    },
    banking: {
        title: loc('tech_banking'),
        desc: loc('tech_banking_desc'),
        cost: {
            Knowledge(){ return 90; }
        },
        effect: loc('tech_banking_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.bank);
                return true;
            }
            return false;
        }
    },
    investing: {
        title: loc('tech_investing'),
        desc: loc('tech_investing_desc'),
        cost: {
            Money(){ return 2500; },
            Knowledge(){ return 900; }
        },
        effect: loc('tech_investing_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.civic.banker.display = true;
                return true;
            }
            return false;
        }
    },
    vault: {
        title: loc('tech_vault'),
        desc: loc('tech_vault_desc'),
        cost: {
            Money(){ return 2000; },
            Knowledge(){ return 3600; },
            Iron(){ return 500; },
            Cement(){ return 750; }
        },
        effect: loc('tech_vault_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    bonds: {
        title: loc('tech_bonds'),
        desc: loc('tech_bonds'),
        cost: {
            Money(){ return 20000; },
            Knowledge(){ return 5000; }
        },
        effect: loc('tech_bonds_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    steel_vault: {
        title: loc('tech_steel_vault'),
        desc: loc('tech_steel_vault'),
        cost: {
            Money(){ return 30000; },
            Knowledge(){ return 6750; },
            Steel(){ return 3000; }
        },
        effect: loc('tech_steel_vault_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    eebonds: {
        title: loc('tech_eebonds'),
        desc: loc('tech_eebonds'),
        cost: {
            Money(){ return 75000; },
            Knowledge(){ return 18000; }
        },
        effect: loc('tech_eebonds_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    swiss_banking: {
        title: swissKnife(),
        desc: swissKnife(),
        cost: {
            Money(){ return 125000; },
            Knowledge(){ return 45000; }
        },
        effect: loc('tech_swiss_banking_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    safety_deposit: {
        title: loc('tech_safety_deposit'),
        desc: loc('tech_safety_deposit'),
        cost: {
            Money(){ return 250000; },
            Knowledge(){ return 67500; }
        },
        effect: loc('tech_safety_deposit_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    stock_market: {
        title: loc('tech_stock_market'),
        desc: loc('tech_stock_market'),
        cost: {
            Money(){ return 325000; },
            Knowledge(){ return 108000; }
        },
        effect: loc('tech_stock_market_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        post(){
            arpa('Physics');
        }
    },
    hedge_funds: {
        title: loc('tech_hedge_funds'),
        desc: loc('tech_hedge_funds'),
        cost: {
            Money(){ return 375000; },
            Knowledge(){ return 126000; }
        },
        effect: loc('tech_hedge_funds_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    four_oh_one: {
        title: loc('tech_four_oh_one'),
        desc: loc('tech_four_oh_one'),
        cost: {
            Money(){ return 425000; },
            Knowledge(){ return 144000; }
        },
        effect: loc('tech_four_oh_one_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        flair(){
            return loc('tech_four_oh_one_flair');
        }
    },
    exchange: {
        title: loc('tech_exchange'),
        desc: loc('tech_exchange'),
        cost: {
            Money(){ return 1000000; },
            Knowledge(){ return 675000; }
        },
        effect: loc('tech_exchange_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.interstellar.int_alpha.exchange);
                return true;
            }
            return false;
        }
    },
    foreign_investment: {
        title: loc('tech_foreign_investment'),
        desc: loc('tech_foreign_investment'),
        cost: {
            Money(){ return 100000000; },
            Knowledge(){ return 8000000; }
        },
        effect: loc('tech_foreign_investment_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    crypto_currency: {
        title: loc('tech_crypto_currency'),
        desc: loc('tech_crypto_currency'),
        cost: {
            Money(){ return 10000000000; },
            Knowledge(){ return 127500000; },
            Omniscience(){ return 38500; },
        },
        effect: loc('tech_crypto_currency_effect',[loc('tech_bonds')]),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    mythril_vault: {
        title: loc('tech_mythril_vault'),
        desc: loc('tech_mythril_vault'),
        cost: {
            Money(){ return 500000; },
            Knowledge(){ return 150000; },
            Mythril(){ return 750; }
        },
        effect: loc('tech_mythril_vault_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    neutronium_vault: {
        title: loc('tech_neutronium_vault'),
        desc: loc('tech_neutronium_vault'),
        cost: {
            Money(){ return 750000; },
            Knowledge(){ return 280000; },
            Neutronium(){ return 650; }
        },
        effect: loc('tech_neutronium_vault_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    adamantite_vault: {
        title: loc('tech_adamantite_vault'),
        desc: loc('tech_adamantite_vault'),
        cost: {
            Money(){ return 2000000; },
            Knowledge(){ return 560000; },
            Adamantite(){ return 20000; }
        },
        effect: loc('tech_adamantite_vault_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    graphene_vault: {
        title: loc('tech_graphene_vault'),
        desc: loc('tech_graphene_vault'),
        cost: {
            Money(){ return 3000000; },
            Knowledge(){ return 750000; },
            Graphene(){ return 400000; }
        },
        effect: loc('tech_graphene_vault_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    home_safe: {
        title: loc('tech_home_safe'),
        desc: loc('tech_home_safe'),
        cost: {
            Money(){ return 42000; },
            Knowledge(){ return 8000; },
            Steel(){ return 4500; }
        },
        effect: loc('tech_home_safe_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    fire_proof_safe: {
        title: loc('tech_fire_proof_safe'),
        desc: loc('tech_fire_proof_safe'),
        cost: {
            Money(){ return 250000; },
            Knowledge(){ return 120000; },
            Iridium(){ return 1000; }
        },
        effect: loc('tech_fire_proof_safe_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    tamper_proof_safe: {
        title: loc('tech_tamper_proof_safe'),
        desc: loc('tech_tamper_proof_safe'),
        cost: {
            Money(){ return 2500000; },
            Knowledge(){ return 600000; },
            Infernite(){ return 800; }
        },
        effect: loc('tech_tamper_proof_safe_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    monument: {
        title: loc('tech_monument'),
        desc: loc('tech_monument'),
        cost: {
            Knowledge(){ return 120000; }
        },
        effect: loc('tech_monument_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.arpa['m_type'] = arpa('Monument');
                return true;
            }
            return false;
        },
        post(){
            arpa('Physics');
        }
    },
    tourism: {
        title: loc('tech_tourism'),
        desc: loc('tech_tourism'),
        cost: {
            Knowledge(){ return 150000; }
        },
        effect: loc('tech_tourism_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.tourist_center);
                return true;
            }
            return false;
        }
    },
};
