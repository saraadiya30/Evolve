import { loc } from '../../../core/locale.js';
import { payCosts } from '../../../actions/core/action_costs.js';
import { initStruct } from '../../../actions/core/structure_ui.js';
import { actions } from '../../../core/registries.js';
import { global } from '../../../core/vars.js';
import { planetName } from '../../../space/planet_generation.js';
import { races } from '../../../core/registries.js';

// Bagian dari techsPart5 (27 entri: missionary .. dyson_net), dipisah dari group_loader.js. Urutan entri sama persis.
export const techsPart5Part2 = {
    missionary: {
        title: loc('tech_missionary'),
        desc: loc('tech_missionary'),
        cost: {
            Knowledge(){ return 10000; }
        },
        effect: loc('tech_missionary_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    zealotry: {
        title: loc('tech_zealotry'),
        desc: loc('tech_zealotry'),
        cost: {
            Knowledge(){ return 25000; }
        },
        effect: loc('tech_zealotry_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    anthropology: {
        title: loc('tech_anthropology'),
        desc: loc('tech_anthropology'),
        wiki: global.genes['transcendence'] ? false : true,
        no_queue(){ return global.r_queue.queue.some(item => item.id === 'tech-fanaticism') ? true : false; },
        cost: {
            Knowledge(){ return 2500; }
        },
        effect: `<div>${loc('tech_anthropology_effect')}</div><div class="has-text-special">${loc('tech_anthropology_warning')}</div>`,
        action(){
            if (payCosts($(this)[0])){
                global.tech['anthropology'] = 1;
                return true;
            }
            return false;
        }
    },
    alt_anthropology: {
        title: loc('tech_anthropology'),
        desc: loc('tech_anthropology'),
        wiki: global.genes['transcendence'] ? true : false,
        cost: {
            Knowledge(){ return 2500; }
        },
        effect: `<div>${loc('tech_anthropology_effect')}</div>`,
        action(){
            if (payCosts($(this)[0])){
                if (global.tech['theology'] === 2){
                    global.tech['theology'] = 3;
                }
                return true;
            }
            return false;
        }
    },
    mythology: {
        title: loc('tech_mythology'),
        desc: loc('tech_mythology'),
        cost: {
            Knowledge(){ return 5000; }
        },
        effect: loc('tech_mythology_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    archaeology: {
        title: loc('tech_archaeology'),
        desc: loc('tech_archaeology'),
        cost: {
            Knowledge(){ return 10000; }
        },
        effect: loc('tech_archaeology_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    merchandising: {
        title: loc('tech_merchandising'),
        desc: loc('tech_merchandising'),
        cost: {
            Knowledge(){ return 25000; }
        },
        effect(){ return global.race['truepath'] ? loc('tech_merchandising_effect_tp') : loc('tech_merchandising_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    astrophysics: {
        title: loc('tech_astrophysics'),
        desc: loc('tech_astrophysics_desc'),
        cost: {
            Knowledge(){ return 125000; }
        },
        effect: loc('tech_astrophysics_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_home.propellant_depot);
                return true;
            }
            return false;
        }
    },
    rover: {
        title: loc('tech_rover'),
        desc: loc('tech_rover'),
        cost: {
            Knowledge(){ return 135000; },
            Alloy(){ return 22000 },
            Polymer(){ return 18000 },
            Uranium(){ return 750 }
        },
        effect: loc('tech_rover_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.settings.space.moon = true;
                initStruct(actions.space.spc_moon.moon_base);
                return true;
            }
            return false;
        }
    },
    probes: {
        title: loc('tech_probes'),
        desc: loc('tech_probes'),
        cost: {
            Knowledge(){ return 168000; },
            Steel(){ return 100000 },
            Iridium(){ return 5000 },
            Uranium(){ return 2250 },
            Helium_3(){ return 3500 }
        },
        effect: loc('tech_probes_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.settings.space.red = true;
                global.settings.space.hell = true;
                initStruct(actions.space.spc_red.spaceport);
                return true;
            }
            return false;
        }
    },
    starcharts: {
        title: loc('tech_starcharts'),
        desc: loc('tech_starcharts'),
        cost: {
            Knowledge(){ return 185000; }
        },
        effect: loc('tech_starcharts_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.settings.space.gas = true;
                global.settings.space.sun = true;
                if (global.race['truepath']){
                    global.settings.showOuter = true;
                }
                initStruct(actions.space.spc_sun.swarm_control);
                return true;
            }
            return false;
        }
    },
    colonization: {
        title: loc('tech_colonization'),
        desc(){ return loc('tech_colonization_desc',[planetName().red]); },
        cost: {
            Knowledge(){ return 172000; }
        },
        effect(){ return loc(global.race['artifical'] ? 'tech_colonization_artifical_effect' : 'tech_colonization_effect',[planetName().red]); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_red.biodome);
                return true;
            }
            return false;
        }
    },
    red_tower: {
        title(){ return loc('tech_red_tower',[planetName().red]); },
        desc(){ return loc('tech_red_tower',[planetName().red]); },
        cost: {
            Knowledge(){ return 195000; }
        },
        effect(){ return loc('tech_red_tower_effect',[planetName().red]); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_red.red_tower);
                return true;
            }
            return false;
        }
    },
    space_manufacturing: {
        title: loc('tech_space_manufacturing'),
        desc: loc('tech_space_manufacturing_desc'),
        cost: {
            Knowledge(){ return 220000; }
        },
        effect(){ return loc('tech_space_manufacturing_effect',[planetName().red]); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_red.red_factory);
                return true;
            }
            return false;
        }
    },
    exotic_lab: {
        title: loc('tech_exotic_lab'),
        desc: loc('tech_exotic_lab_desc'),
        cost: {
            Knowledge(){ return 250000; }
        },
        effect: loc('tech_exotic_lab_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_red.exotic_lab);
                return true;
            }
            return false;
        }
    },
    hydroponics: {
        title: loc('tech_hydroponics'),
        desc(){ return loc('tech_hydroponics'); },
        cost: {
            Knowledge(){ return 3000000; },
            Bolognium(){ return 500000; }
        },
        effect(){ return loc('tech_hydroponics_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    dyson_sphere: {
        title: loc('tech_dyson_sphere'),
        desc: loc('tech_dyson_sphere'),
        cost: {
            Knowledge(){ return 195000; }
        },
        effect: loc('tech_dyson_sphere_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    dyson_swarm: {
        title: loc('tech_dyson_swarm'),
        desc: loc('tech_dyson_swarm'),
        cost: {
            Knowledge(){ return 210000; }
        },
        effect: loc('tech_dyson_swarm_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_sun.swarm_satellite);
                return true;
            }
            return false;
        }
    },
    swarm_plant: {
        title: loc('tech_swarm_plant'),
        desc: loc('tech_swarm_plant'),
        cost: {
            Knowledge(){ return 250000; }
        },
        effect(){ return loc('tech_swarm_plant_effect',[races[global.race.species].home,planetName().hell]); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_hell.swarm_plant);
                return true;
            }
            return false;
        }
    },
    space_sourced: {
        title: loc('tech_space_sourced'),
        desc: loc('tech_space_sourced_desc'),
        cost: {
            Knowledge(){ return 300000; }
        },
        effect: loc('tech_space_sourced_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    swarm_plant_ai: {
        title: loc('tech_swarm_plant_ai'),
        desc: loc('tech_swarm_plant_ai'),
        cost: {
            Knowledge(){ return 335000; }
        },
        effect: loc('tech_swarm_plant_ai_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    swarm_control_ai: {
        title: loc('tech_swarm_control_ai'),
        desc: loc('tech_swarm_control_ai'),
        cost: {
            Knowledge(){ return 360000; }
        },
        effect: loc('tech_swarm_control_ai_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    quantum_swarm: {
        title: loc('tech_quantum_swarm'),
        desc: loc('tech_quantum_swarm'),
        cost: {
            Knowledge(){ return 450000; }
        },
        effect: loc('tech_quantum_swarm_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    perovskite_cell: {
        title: loc('tech_perovskite_cell'),
        desc: loc('tech_perovskite_cell'),
        cost: {
            Knowledge(){ return 525000; },
            Titanium(){ return 100000; }
        },
        effect: loc('tech_perovskite_cell_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    swarm_convection: {
        title: loc('tech_swarm_convection'),
        desc: loc('tech_swarm_convection'),
        cost: {
            Knowledge(){ return 725000; },
            Stanene(){ return 100000; }
        },
        effect: loc('tech_swarm_convection_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    orichalcum_panels: {
        title: loc('tech_orichalcum_panels'),
        desc: loc('tech_orichalcum_panels'),
        cost: {
            Knowledge(){ return 14000000; },
            Orichalcum(){ return 125000; }
        },
        effect(){ return loc('tech_orichalcum_panels_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    dyson_net: {
        title: loc('tech_dyson_net'),
        desc: loc('tech_dyson_net'),
        cost: {
            Knowledge(){ return 800000; }
        },
        effect: loc('tech_dyson_net_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.interstellar.int_proxima.dyson);
                return true;
            }
            return false;
        }
    },
};
