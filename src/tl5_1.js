import { loc } from './locale.js';
import { payCosts, initStruct, actions, fanaticism, drawTech } from './actions.js';
import { global } from './vars.js';
import { resource_values } from './resources.js';
import { unlockAchieve } from './achieve.js';
import { races } from './races.js';

// Bagian dari techsPart5 (24 entri: rebar .. indoctrination), dipisah dari techs_part5.js. Urutan entri sama persis.
export const techsPart5Part1 = {
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
};
