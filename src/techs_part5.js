import { global, save } from './vars.js';
import { loc } from './locale.js';
import { calcPrestige, messageQueue } from './functions.js';
import { unlockAchieve } from './achieve.js';
import { payCosts, drawTech, fanaticism, checkAffordable, actions, initStruct } from './actions.js';
import { races, renderPsychicPowers } from './races.js';
import { resource_values } from './resources.js';
import { loadFoundry, jobScale } from './jobs.js';
import { buildGarrison, govTitle } from './civics.js';
import { planetName } from './space.js';
import { arpa } from './arpa.js';
import { defineGovernor, removeTask } from './governor.js';
import { big_bang } from './resets.js';

// Bagian 5 dari techs: HANYA logika/teks dinamis (title, desc, cost, action, effect, condition, post, wiki, flair). Field statis ada di techs_data.js
function uniteEffect(){
    global.tech['world_control'] = 1;
    buildGarrison($('#garrison'),true);
    buildGarrison($('#c_garrison'),false);
    for (let i=0; i<3; i++){
        if (global.civic.foreign[`gov${i}`].occ){
            let occ_amount = jobScale(global.civic.govern.type === 'federation' ? 15 : 20);
            global.civic['garrison'].max += occ_amount;
            global.civic['garrison'].workers += occ_amount;
            global.civic.foreign[`gov${i}`].occ = false;
        }
        global.civic.foreign[`gov${i}`].buy = false;
        global.civic.foreign[`gov${i}`].anx = false;
        global.civic.foreign[`gov${i}`].sab = 0;
        global.civic.foreign[`gov${i}`].act = 'none';
    }
    removeTask('spy');
    removeTask('spyop');
    removeTask('combo_spy');
    defineGovernor();
}

export const techsPart5 = {
    rebar: {
        title: loc('tech_rebar'),
        desc: loc('tech_rebar'),
        cost: {
            Knowledge(){ return 3200; },
            Iron(){ return 750; }
        },
        effect: loc('tech_rebar_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    steel_rebar: {
        title: loc('tech_steel_rebar'),
        desc: loc('tech_steel_rebar'),
        cost: {
            Knowledge(){ return 6750; },
            Steel(){ return 750; }
        },
        effect: loc('tech_steel_rebar_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    portland_cement: {
        title: loc('tech_portland_cement'),
        desc: loc('tech_portland_cement'),
        cost: {
            Knowledge(){ return 32000; }
        },
        effect: loc('tech_portland_cement_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    screw_conveyor: {
        title: loc('tech_screw_conveyor'),
        desc: loc('tech_screw_conveyor'),
        cost: {
            Knowledge(){ return 72000; }
        },
        effect: loc('tech_screw_conveyor_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    adamantite_screws: {
        title: loc('tech_adamantite_screws'),
        desc: loc('tech_adamantite_screws'),
        cost: {
            Knowledge(){ return 500000; },
            Adamantite(){ return 10000; }
        },
        effect: loc('tech_adamantite_screws_effect',[3]),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    otherworldly_binder: {
        title: loc('tech_otherworldly_binder'),
        desc: loc('tech_otherworldly_binder'),
        cost: {
            Knowledge(){ return 85000000; },
            Omniscience(){ return 20000; },
            Asphodel_Powder(){ return 50000; }
        },
        effect(){ return loc('tech_otherworldly_binder_effect',[global.resource.Asphodel_Powder.name, global.resource.Cement.name]); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    hunter_process: {
        title: loc('tech_hunter_process'),
        desc: loc('tech_hunter_process'),
        cost: {
            Knowledge(){ return 45000; },
            Titanium(){ return 1000; }
        },
        effect: loc('tech_hunter_process_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.resource.Titanium.value = resource_values['Titanium'];
                return true;
            }
            return false;
        }
    },
    kroll_process: {
        title: loc('tech_kroll_process'),
        desc: loc('tech_kroll_process'),
        cost: {
            Knowledge(){ return 78000; },
            Titanium(){ return 10000; }
        },
        effect: loc('tech_kroll_process_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    cambridge_process: {
        title: loc('tech_cambridge_process'),
        desc: loc('tech_cambridge_process'),
        cost: {
            Knowledge(){ return 135000; },
            Titanium(){ return 17500; }
        },
        effect: loc('tech_cambridge_process_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    pynn_partical: {
        title: loc('tech_pynn_partical'),
        desc: loc('tech_pynn_partical'),
        cost: {
            Knowledge(){ return 100000; }
        },
        effect: loc('tech_pynn_partical_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    matter_compression: {
        title: loc('tech_matter_compression'),
        desc: loc('tech_matter_compression'),
        cost: {
            Knowledge(){ return 112500; }
        },
        effect: loc('tech_matter_compression_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    higgs_boson: {
        title: loc('tech_higgs_boson'),
        desc: loc('tech_higgs_boson'),
        cost: {
            Knowledge(){ return 125000; }
        },
        effect: loc('tech_higgs_boson_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    dimensional_compression: {
        title: loc('tech_dimensional_compression'),
        desc: loc('tech_dimensional_compression'),
        cost: {
            Knowledge(){ return 425000; }
        },
        effect: loc('tech_dimensional_compression_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    theology: {
        title: loc('tech_theology'),
        desc: loc('tech_theology'),
        cost: {
            Knowledge(){ return 900; }
        },
        effect: loc('tech_theology_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.temple);
                if (global.race['magnificent']){
                    initStruct(actions.city.shrine);
                }
                if (global.genes['ancients'] && global.genes['ancients'] >= 2){
                    global.civic.priest.display = true;
                }
                return true;
            }
            return false;
        }
    },
    fanaticism: {
        title: loc('tech_fanaticism'),
        desc: loc('tech_fanaticism'),
        wiki: global.genes['transcendence'] ? false : true,
        no_queue(){ return global.r_queue.queue.some(item => item.id === 'tech-anthropology') ? true : false; },
        cost: {
            Knowledge(){ return 2500; }
        },
        effect: `<div>${loc('tech_fanaticism_effect')}</div><div class="has-text-special">${loc('tech_fanaticism_warning')}</div>`,
        action(){
            if (payCosts($(this)[0])){
                global.tech['fanaticism'] = 1;
                if (global.race.gods === global.race.species){
                    unlockAchieve(`second_evolution`);
                }
                fanaticism(global.race.gods);
                if (global.race['warlord']){
                    global.portal.throne.points++;
                }
                return true;
            }
            return false;
        }
    },
    alt_fanaticism: {
        title: loc('tech_fanaticism'),
        desc: loc('tech_fanaticism'),
        wiki: global.genes['transcendence'] ? true : false,
        cost: {
            Knowledge(){ return 2500; }
        },
        effect: `<div>${loc('tech_fanaticism_effect')}</div>`,
        action(){
            if (payCosts($(this)[0])){
                if (global.tech['theology'] === 2){
                    global.tech['theology'] = 3;
                }
                if (global.race.gods === global.race.species){
                    unlockAchieve(`second_evolution`);
                }
                fanaticism(global.race.gods);
                if (global.race['warlord']){
                    global.portal.throne.points++;
                }
                return true;
            }
            return false;
        }
    },
    ancient_theology: {
        title: loc('tech_ancient_theology'),
        desc: loc('tech_ancient_theology'),
        condition(){
            return global.genes['ancients'] ? true : false;
        },
        cost: {
            Knowledge(){ return 180000; }
        },
        effect(){
            let entityA = global.race.old_gods !== 'none' ? races[global.race.old_gods.toLowerCase()].entity : races[global.race.species].entity;
            let entityB = global.race.gods !== 'none' ? races[global.race.gods.toLowerCase()].entity : races[global.race.species].entity;
            return loc('tech_ancient_theology_effect',[entityA,entityB]);
        },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_red.ziggurat);
                return true;
            }
            return false;
        }
    },
    study: {
        title: loc('tech_study'),
        desc: loc('tech_study_desc'),
        wiki: global.genes['transcendence'] && global.genes.transcendence >= 2 ? false : true,
        condition(){ return !global.genes['transcendence'] || global.genes.transcendence < 2 ? true : false; },
        no_queue(){ return global.r_queue.queue.some(item => item.id === 'tech-deify') ? true : false; },
        cost: {
            Knowledge(){ return 195000; }
        },
        effect(){
            let entity = global.race.old_gods !== 'none' ? races[global.race.old_gods.toLowerCase()].entity : races[global.race.species].entity;
            return `<div>${loc('tech_study_effect',[entity])}</div><div class="has-text-special">${loc('tech_study_warning')}</div>`;
        },
        action(){
            if (payCosts($(this)[0])){
                global.tech['ancient_study'] = 1;
                return true;
            }
            return false;
        }
    },
    study_alt: {
        title: loc('tech_study'),
        desc: loc('tech_study_desc'),
        wiki: global.genes['transcendence'] && global.genes.transcendence >= 2 ? true : false,
        condition(){ return global.genes['transcendence'] && global.genes.transcendence >= 2 ? true : false; },
        cost: {
            Knowledge(){ return 195000; }
        },
        effect(){
            let entity = global.race.old_gods !== 'none' ? races[global.race.old_gods.toLowerCase()].entity : races[global.race.species].entity;
            return `<div>${loc('tech_study_effect',[entity])}</div>`;
        },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    encoding: {
        title: loc('tech_encoding'),
        desc: loc('tech_encoding_desc'),
        cost: {
            Knowledge(){ return 268000; }
        },
        effect(){ return `<div>${loc('tech_encoding_effect')}</div>`; },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    deify: {
        title: loc('tech_deify'),
        desc: loc('tech_deify_desc'),
        wiki: global.genes['transcendence'] && global.genes.transcendence >= 2 ? false : true,
        condition(){ return !global.genes['transcendence'] || global.genes.transcendence < 2 ? true : false; },
        no_queue(){ return global.r_queue.queue.some(item => item.id === 'tech-study') ? true : false; },
        cost: {
            Knowledge(){ return 195000; }
        },
        effect(){
            let entity = global.race.old_gods !== 'none' ? races[global.race.old_gods.toLowerCase()].entity : races[global.race.species].entity;
            return `<div>${loc('tech_deify_effect',[entity])}</div><div class="has-text-special">${loc('tech_deify_warning')}</div>`;
        },
        action(){
            if (payCosts($(this)[0])){
                global.tech['ancient_deify'] = 1;
                fanaticism(global.race.old_gods);
                if (global.race['warlord']){
                    global.portal.throne.points++;
                }
                return true;
            }
            return false;
        }
    },
    deify_alt: {
        title: loc('tech_deify'),
        desc: loc('tech_deify_desc'),
        wiki: global.genes['transcendence'] && global.genes.transcendence >= 2 ? true : false,
        condition(){ return global.genes['transcendence'] && global.genes.transcendence >= 2 ? true : false; },
        cost: {
            Knowledge(){ return 195000; }
        },
        effect(){
            let entity = global.race.old_gods !== 'none' ? races[global.race.old_gods.toLowerCase()].entity : races[global.race.species].entity;
            return `<div>${loc('tech_deify_effect',[entity])}</div><div class="has-text-special">${loc('tech_deify_warning')}</div>`;
        },
        action(){
            if (payCosts($(this)[0])){
                fanaticism(global.race.old_gods);
                if (global.race['warlord']){
                    global.portal.throne.points++;
                }
                return true;
            }
            return false;
        }
    },
    infusion: {
        title: loc('tech_infusion'),
        desc: loc('tech_infusion_desc'),
        cost: {
            Knowledge(){ return 268000; }
        },
        effect(){ return `<div>${loc('tech_infusion_effect')}</div>`; },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    indoctrination: {
        title: loc('tech_indoctrination'),
        desc: loc('tech_indoctrination'),
        cost: {
            Knowledge(){ return 5000; }
        },
        effect: loc('tech_indoctrination_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        post(){
            if (global.race['terrifying']){
                global.tech['fanaticism'] = 3;
                drawTech();
            }
        }
    },
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
    dyson_sphere2: {
        title: loc('tech_dyson_sphere'),
        desc: loc('tech_dyson_sphere'),
        cost: {
            Knowledge(){ return 5000000; }
        },
        effect: loc('tech_dyson_sphere2_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.interstellar.int_proxima.dyson_sphere);
                return true;
            }
            return false;
        }
    },
    orichalcum_sphere: {
        title: loc('tech_orichalcum_sphere'),
        desc: loc('tech_orichalcum_sphere'),
        condition(){
            return global.interstellar['dyson_sphere'] && global.interstellar.dyson_sphere.count >= 100 ? true : false;
        },
        cost: {
            Knowledge(){ return 17500000; },
            Orichalcum(){ return 250000; }
        },
        effect: loc('tech_orichalcum_sphere_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.interstellar.int_proxima.orichalcum_sphere);
                return true;
            }
            return false;
        }
    },
    elysanite_sphere: {
        title: loc('tech_elysanite_sphere'),
        desc: loc('tech_elysanite_sphere'),
        condition(){
            return global.interstellar?.orichalcum_sphere?.count >= 100;
        },
        cost: {
            Knowledge(){ return 122500000; },
            Omniscience(){ return 36500; },
        },
        effect(){ return loc('tech_elysanite_sphere_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.interstellar.int_proxima.elysanite_sphere);
                return true;
            }
            return false;
        }
    },
    gps: {
        title: loc('tech_gps'),
        desc: loc('tech_gps'),
        cost: {
            Knowledge(){ return 150000; }
        },
        effect: loc('tech_gps_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_home.gps);
                return true;
            }
            return false;
        }
    },
    nav_beacon: {
        title: loc('tech_nav_beacon'),
        desc: loc('tech_nav_beacon'),
        cost: {
            Knowledge(){ return 180000; }
        },
        effect: loc('tech_nav_beacon_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_home.nav_beacon);
                return true;
            }
            return false;
        }
    },
    subspace_signal: {
        title: loc('tech_subspace_signal'),
        desc: loc('tech_subspace_signal'),
        cost: {
            Knowledge(){ return 700000; },
            Stanene(){ return 125000; }
        },
        effect(){ return loc('tech_subspace_signal_effect',[planetName().red]); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    atmospheric_mining: {
        title: loc('tech_atmospheric_mining'),
        desc: loc('tech_atmospheric_mining'),
        cost: {
            Knowledge(){ return 190000; }
        },
        effect: loc('tech_atmospheric_mining_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_gas.gas_mining);
                initStruct(actions.space.spc_gas.gas_storage);
                return true;
            }
            return false;
        }
    },
    helium_attractor: {
        title: loc('tech_helium_attractor'),
        desc: loc('tech_helium_attractor'),
        cost: {
            Knowledge(){ return 290000; },
            Elerium(){ return 250; }
        },
        effect(){ return loc('tech_helium_attractor_effect',[planetName().gas]); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    ram_scoops: {
        title: loc('tech_ram_scoops'),
        desc: loc('tech_ram_scoops'),
        cost: {
            Knowledge(){ return 580000; }
        },
        effect(){ return loc('tech_ram_scoops_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    elerium_prospecting: {
        title: loc('tech_elerium_prospecting'),
        desc: loc('tech_elerium_prospecting'),
        cost: {
            Knowledge(){ return 610000; }
        },
        effect(){ return loc('tech_elerium_prospecting_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.interstellar.int_nebula.elerium_prospector);
                return true;
            }
            return false;
        }
    },
    zero_g_mining: {
        title: loc('tech_zero_g_mining'),
        desc: loc('tech_zero_g_mining'),
        cost: {
            Knowledge(){ return 210000; }
        },
        effect: loc('tech_zero_g_mining_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_belt.space_station);
                initStruct(actions.space.spc_belt.iridium_ship);
                initStruct(actions.space.spc_belt.iron_ship);
                return true;
            }
            return false;
        }
    },
    elerium_mining: {
        title: loc('tech_elerium_mining'),
        desc: loc('tech_elerium_mining'),
        cost: {
            Knowledge(){ return 235000; },
            Elerium(){ return global.race['truepath'] ? 0.5 : 1; }
        },
        effect: loc('tech_elerium_mining_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_belt.elerium_ship);
                if (global.race['cataclysm']){
                    unlockAchieve('iron_will',false,2);
                }
                return true;
            }
            return false;
        }
    },
    laser_mining: {
        title: loc('tech_laser_mining'),
        desc: loc('tech_laser_mining'),
        cost: {
            Knowledge(){ return 350000; },
        },
        effect: loc('tech_laser_mining_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    plasma_mining: {
        title: loc('tech_plasma_mining'),
        desc: loc('tech_plasma_mining'),
        cost: {
            Knowledge(){ return 825000; },
        },
        effect: loc('tech_plasma_mining_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    elerium_tech: {
        title: loc('tech_elerium_tech'),
        desc: loc('tech_elerium_tech'),
        cost: {
            Knowledge(){ return 275000; },
            Elerium(){ return 20; }
        },
        effect: loc('tech_elerium_tech_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    elerium_reactor: {
        title: loc('tech_elerium_reactor'),
        desc: loc('tech_elerium_reactor'),
        cost: {
            Knowledge(){ return 325000; },
            Elerium(){ return 180; }
        },
        effect: loc('tech_elerium_reactor_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_dwarf.e_reactor);
                return true;
            }
            return false;
        }
    },
    neutronium_housing: {
        title: loc('tech_neutronium_housing'),
        desc: loc('tech_neutronium_housing'),
        cost: {
            Knowledge(){ return 275000; },
            Neutronium(){ return 350; }
        },
        effect(){ return loc('tech_neutronium_housing_effect',[planetName().red]); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    unification: {
        title: loc('tech_unification'),
        desc(){ return loc('tech_unification_desc',[races[global.race.species].home]); },
        cost: {
            Knowledge(){ return 200000; }
        },
        effect: loc('tech_unification_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    unification2: {
        title: loc('tech_unification'),
        desc(){ return loc('tech_unification_desc',[races[global.race.species].home]); },
        cost: {
            Bool(){
                let owned = 0;
                for (let i=0; i<3; i++){
                    if (global.civic.foreign[`gov${i}`].occ || global.civic.foreign[`gov${i}`].buy || global.civic.foreign[`gov${i}`].anx){
                        owned++;
                    }
                }
                return owned === 3 ? true : false;
            }
        },
        effect(){
            let banana_warn = global.race['banana'] ? `<div class="has-text-danger">${loc('tech_unification_banana')}</div>` : '';
            return `<div>${loc('tech_unification_effect2')}</div><div class="has-text-special">${loc('tech_unification_warning')}</div>${banana_warn}`;
        },
        action(){
            if (payCosts($(this)[0])){
                if (global.race['banana']){
                    if (!global['sim']){
                        save.setItem('evolveBak',LZString.compressToUTF16(JSON.stringify(global)));
                    }
                    delete global.race['banana'];
                }
                if (global.civic.foreign.gov0.occ && global.civic.foreign.gov1.occ && global.civic.foreign.gov2.occ){
                    unlockAchieve(`world_domination`);
                }
                if (global.civic.foreign.gov0.anx && global.civic.foreign.gov1.anx && global.civic.foreign.gov2.anx){
                    unlockAchieve(`illuminati`);
                }
                if (global.civic.foreign.gov0.buy && global.civic.foreign.gov1.buy && global.civic.foreign.gov2.buy){
                    unlockAchieve(`syndicate`);
                }
                if (global.stats.attacks === 0){
                    unlockAchieve(`pacifist`);
                }
                uniteEffect();
                return true;
            }
            return false;
        }
    },
    unite: {
        title: loc('tech_unite'),
        desc(){ return loc('tech_unite_desc'); },
        cost: {
            Bool(){
                let owned = 0;
                for (let i=0; i<3; i++){
                    if (global.civic.foreign[`gov${i}`].occ || global.civic.foreign[`gov${i}`].buy || global.civic.foreign[`gov${i}`].anx){
                        owned++;
                    }
                }
                return owned === 3 ? true : false;
            }
        },
        effect(){ return `<div>${loc('tech_unite_effect')}</div><div class="has-text-warning">${loc('tech_unification_effect2')}</div>`; },
        action(){
            if (payCosts($(this)[0])){
                if (global.race['banana']){
                    if (!global['sim']){
                        save.setItem('evolveBak',LZString.compressToUTF16(JSON.stringify(global)));
                    }
                    delete global.race['banana'];
                }
                if (global.civic.foreign.gov0.occ && global.civic.foreign.gov1.occ && global.civic.foreign.gov2.occ){
                    unlockAchieve(`world_domination`);
                }
                if (global.civic.foreign.gov0.anx && global.civic.foreign.gov1.anx && global.civic.foreign.gov2.anx){
                    unlockAchieve(`illuminati`);
                }
                if (global.civic.foreign.gov0.buy && global.civic.foreign.gov1.buy && global.civic.foreign.gov2.buy){
                    unlockAchieve(`syndicate`);
                }
                if (global.stats.attacks === 0){
                    unlockAchieve(`pacifist`);
                }
                uniteEffect();
                if (global.race['truepath'] && !global.tech['rival']){
                    global.tech['rival'] = 1;
                    messageQueue(loc(`civics_rival_unlocked`,[govTitle(3)]),'info',false,['progress','combat']);
                }
                return true;
            }
            return false;
        }
    },
    genesis: {
        title: loc('tech_genesis'),
        desc: loc('tech_genesis'),
        cost: {
            Knowledge(){ return 350000; }
        },
        effect: loc('tech_genesis_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    star_dock: {
        title: loc('tech_star_dock'),
        desc: loc('tech_star_dock'),
        cost: {
            Knowledge(){ return 380000; },
        },
        effect: loc('tech_star_dock_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_gas.star_dock);
                return true;
            }
            return false;
        }
    },
    interstellar: {
        title: loc('tech_interstellar'),
        desc: loc('tech_interstellar'),
        cost: {
            Knowledge(){ return 400000; },
        },
        effect: loc('tech_interstellar_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.starDock.probes);
                return true;
            }
            return false;
        }
    },
    genesis_ship: {
        title(){ return global.race['cataclysm'] ? loc('tech_generational_ship') : loc('tech_genesis_ship'); },
        desc(){ return global.race['cataclysm'] ? loc('tech_generational_ship') : loc('tech_genesis_ship'); },
        cost: {
            Knowledge(){ return 425000; },
        },
        effect(){ return global.race['cataclysm'] ? loc('tech_generational_effect') : loc('tech_genesis_ship_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.starDock.seeder);
                if (global.race['cataclysm']){
                    unlockAchieve('iron_will',false,4);
                }
                return true;
            }
            return false;
        }
    },
    geck: {
        title(){ return loc('tech_geck'); },
        desc(){ return loc('tech_geck_desc'); },
        condition(){
            return global.stats.achieve['lamentis'] && global.stats.achieve.lamentis.l >= 5 ? true : false;
        },
        cost: {
            Knowledge(){ return 500000; },
        },
        effect(){ return loc('tech_geck_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.starDock.geck);
                return true;
            }
            return false;
        }
    },
    genetic_decay: {
        title: loc('tech_genetic_decay'),
        desc: loc('tech_genetic_decay'),
        cost: {
            Knowledge(){ return 200000; }
        },
        effect: loc('tech_genetic_decay_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    stabilize_decay: {
        title: loc('tech_stabilize_decay'),
        desc: loc('tech_stabilize_decay'),
        cost: {
            Knowledge(){ return 50000000; },
            Blood_Stone(){ return 1; }
        },
        effect: loc('tech_stabilize_decay_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    tachyon: {
        title: loc('tech_tachyon'),
        desc: loc('tech_tachyon'),
        cost: {
            Knowledge(){ return 435000; }
        },
        effect: loc('tech_tachyon_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    warp_drive: {
        title: loc('tech_warp_drive'),
        desc: loc('tech_warp_drive'),
        cost: {
            Knowledge(){ return 450000; }
        },
        effect: loc('tech_warp_drive_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.settings.showDeep = true;
                global.settings.space.alpha = true;
                initStruct(actions.interstellar.int_alpha.starport);
                return true;
            }
            return false;
        }
    },
    habitat: {
        title: loc('tech_habitat'),
        desc: loc('tech_habitat_desc'),
        cost: {
            Knowledge(){ return 480000; }
        },
        effect: loc('tech_habitat_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.interstellar.int_alpha.habitat);
                return true;
            }
            return false;
        }
    },
    graphene: {
        title: loc('tech_graphene'),
        desc: loc('tech_graphene'),
        cost: {
            Knowledge(){ return 540000; },
            Adamantite(){ return 10000; }
        },
        effect: loc('tech_graphene_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.interstellar.int_alpha.g_factory);
                return true;
            }
            return false;
        }
    },
    aerogel: {
        title: loc('tech_aerogel'),
        desc: loc('tech_aerogel'),
        cost: {
            Knowledge(){ return 750000; },
            Graphene(){ return 50000; },
            Infernite(){ return 500; }
        },
        effect: loc('tech_aerogel_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.resource.Aerogel.display = true;
                loadFoundry();
                return true;
            }
            return false;
        },
        post(){
            renderPsychicPowers();
        }
    },
    mega_manufacturing: {
        title: loc('tech_mega_manufacturing'),
        desc: loc('tech_mega_manufacturing'),
        cost: {
            Knowledge(){ return 5650000; }
        },
        effect(){ return loc('tech_mega_manufacturing_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.interstellar.int_alpha.int_factory);
                return true;
            }
            return false;
        }
    },
    luxury_condo: {
        title: loc('tech_luxury_condo'),
        desc: loc('tech_luxury_condo'),
        cost: {
            Knowledge(){ return 15000000; }
        },
        effect(){ return loc('tech_luxury_condo_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.interstellar.int_alpha.luxury_condo);
                return true;
            }
            return false;
        }
    },
    stellar_engine: {
        title: loc('tech_stellar_engine'),
        desc: loc('tech_stellar_engine'),
        cost: {
            Knowledge(){ return 1000000; }
        },
        effect: loc('tech_stellar_engine_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.interstellar.int_blackhole.stellar_engine);
                return true;
            }
            return false;
        }
    },
    mass_ejector: {
        title: loc('tech_mass_ejector'),
        desc: loc('tech_mass_ejector'),
        cost: {
            Knowledge(){ return 1100000; }
        },
        effect: loc('tech_mass_ejector_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.interstellar.int_blackhole.mass_ejector);
                return true;
            }
            return false;
        }
    },
    asteroid_redirect: {
        title: loc('tech_asteroid_redirect'),
        desc: loc('tech_asteroid_redirect'),
        cost: {
            Knowledge(){ return 3500000; }
        },
        effect: loc('tech_asteroid_redirect_effect'),
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
    exotic_infusion: {
        title: loc('tech_exotic_infusion'),
        desc: loc('tech_exotic_infusion'),
        cost: {
            Knowledge(){ return 1500000; },
            Soul_Gem(){ return 10; }
        },
        effect(){ return `<div>${loc('tech_exotic_infusion_effect',[global.resource.Soul_Gem.name])}</div><div class="has-text-danger">${loc('tech_exotic_infusion_effect2')}</div>`; },
        action(){
            if (checkAffordable($(this)[0])){
                return true;
            }
            return false;
        },
        flair(){ return loc('tech_exotic_infusion_flair'); }
    },
    infusion_check: {
        title: loc('tech_infusion_check'),
        desc: loc('tech_infusion_check'),
        cost: {
            Knowledge(){ return 1500000; },
            Soul_Gem(){ return 10; }
        },
        effect(){ return `<div>${loc('tech_infusion_check_effect')}</div><div class="has-text-danger">${loc('tech_exotic_infusion_effect2')}</div>`; },
        action(){
            if (checkAffordable($(this)[0])){
                return true;
            }
            return false;
        },
        flair(){ return loc('tech_infusion_check_flair'); }
    },
    infusion_confirm: {
        title: loc('tech_infusion_confirm'),
        desc: loc('tech_infusion_confirm'),
        cost: {
            Knowledge(){ return 1500000; },
            Soul_Gem(){ return 10; }
        },
        effect(){
            let gains = calcPrestige('bigbang');
            let plasmidType = global.race.universe === 'antimatter' ? loc('resource_AntiPlasmid_plural_name') : loc('resource_Plasmid_plural_name');
            let prestige = `<div class="has-text-caution">${loc('wiki_tech_infusion_confirm_gains',[gains.plasmid,gains.phage,gains.dark,plasmidType])}</div>`;
            return `<div>${loc('tech_infusion_confirm_effect')}</div><div class="has-text-danger">${loc('tech_exotic_infusion_effect2')}</div>${prestige}`;
        },
        action(){
            if (payCosts($(this)[0])){
                if (global.tech['whitehole'] >= 4){
                    return;
                }
                global.tech['whitehole'] = 4;
                let bang = $('<div class="bigbang"></div>');
                $('body').append(bang);
                setTimeout(function(){
                    bang.addClass('burn');
                }, 125);
                setTimeout(function(){
                    bang.addClass('b');
                }, 150);
                setTimeout(function(){
                    bang.addClass('c');
                }, 2000);
                setTimeout(function(){
                    big_bang();
                }, 4000);
                return false;
            }
            return false;
        },
        flair(){ return loc('tech_infusion_confirm_flair'); }
    },
};
