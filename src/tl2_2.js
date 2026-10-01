import { loc } from './locale.js';
import { global } from './vars.js';
import { payCosts, initStruct, actions } from './actions.js';
import { vBind, calcQueueMax, calcRQueueMax } from './functions.js';

// Bagian dari techsPart2 (23 entri: titanium_crates .. republic), dipisah dari techs_part2.js. Urutan entri sama persis.
export const techsPart2Part2 = {
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
};
