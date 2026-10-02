import { loc } from './locale.js';
import { payCosts, initStruct, actions, wardenLabel } from './actions.js';
import { traitCostMod } from './races.js';
import { global } from './vars.js';
import { jobName } from './jobs.js';
import { unlockAchieve } from './achieve.js';
import { planetName } from './space.js';
import { messageQueue } from './functions.js';

// Bagian dari techsPart3 (27 entri: xeno_tourism .. preparation_methods), dipisah dari techs_part3.js. Urutan entri sama persis.
export const techsPart3Part1 = {
    xeno_tourism: {
        title: loc('tech_xeno_tourism'),
        desc: loc('tech_xeno_tourism'),
        cost: {
            Knowledge(){ return 8000000; }
        },
        effect: loc('tech_xeno_tourism_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    science: {
        title: loc('tech_science'),
        desc: loc('tech_science_desc'),
        cost: {
            Knowledge(){ return traitCostMod('stubborn',65); }
        },
        effect: loc('tech_science_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.university);
                return true;
            }
            return false;
        }
    },
    library: {
        title: loc('tech_library'),
        desc: loc('tech_library_desc'),
        cost: {
            Knowledge(){ return traitCostMod('stubborn',720); }
        },
        effect: loc('tech_library_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.library);
                return true;
            }
            return false;
        }
    },
    thesis: {
        title: loc('tech_thesis'),
        desc: loc('tech_thesis_desc'),
        cost: {
            Knowledge(){ return traitCostMod('stubborn',1125); }
        },
        effect: loc('tech_thesis_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    research_grant: {
        title: loc('tech_research_grant'),
        desc: loc('tech_research_grant_desc'),
        cost: {
            Knowledge(){ return traitCostMod('stubborn',3240); }
        },
        effect: loc('tech_research_grant_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    scientific_journal: {
        title(){ return global.race.universe === 'magic' ? loc('tech_magic_tomes') : loc('tech_scientific_journal'); },
        desc(){ return global.race.universe === 'magic' ? loc('tech_magic_tomes_desc') : loc('tech_scientific_journal_desc'); },
        cost: {
            Knowledge(){ return traitCostMod('stubborn',27000); }
        },
        effect(){ return global.race.universe === 'magic' ? loc('tech_magic_tomes_effect') : loc('tech_scientific_journal_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    adjunct_professor: {
        title: loc('tech_adjunct_professor'),
        desc: loc('tech_adjunct_professor'),
        cost: {
            Knowledge(){ return traitCostMod('stubborn',36000); }
        },
        effect(){ return loc('tech_adjunct_professor_effect',[wardenLabel(),global.civic.scientist ? global.civic.scientist.name : jobName('scientist')]); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    tesla_coil: {
        title: loc('tech_tesla_coil'),
        desc: loc('tech_tesla_coil_desc'),
        cost: {
            Knowledge(){ return traitCostMod('stubborn',51750); }
        },
        effect(){ return loc('tech_tesla_coil_effect',[wardenLabel()]); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    internet: {
        title: loc('tech_internet'),
        desc: loc('tech_internet'),
        cost: {
            Knowledge(){ return traitCostMod('stubborn',61200); }
        },
        effect: loc('tech_internet_effect'),
        action(){
            if (payCosts($(this)[0])){
                if (global.race['toxic'] && global.race.species === 'troll'){
                    unlockAchieve('godwin');
                }
                return true;
            }
            return false;
        }
    },
    observatory: {
        title: loc('tech_observatory'),
        desc: loc('tech_observatory'),
        cost: {
            Knowledge(){ return traitCostMod('stubborn',148000); }
        },
        effect: loc('tech_observatory_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_moon.observatory);
                return true;
            }
            return false;
        }
    },
    world_collider: {
        title: loc('tech_world_collider'),
        desc: loc('tech_world_collider'),
        cost: {
            Knowledge(){ return traitCostMod('stubborn',350000); }
        },
        effect(){ return loc('tech_world_collider_effect',[planetName().dwarf]); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_dwarf.world_collider);
                initStruct(actions.space.spc_dwarf.world_controller);
                return true;
            }
            return false;
        },
        flair: `<div>${loc('tech_world_collider_flair1')}</div><div>${loc('tech_world_collider_flair2')}</div>`
    },
    laboratory: {
        title(){ return global.race.universe === 'magic' ? loc('tech_sanctum') : loc('tech_laboratory'); },
        desc(){ return global.race.universe === 'magic' ? loc('tech_sanctum') : loc('tech_laboratory_desc'); },
        cost: {
            Knowledge(){ return traitCostMod('stubborn',500000); }
        },
        effect(){ return global.race.universe === 'magic' ? loc('tech_sanctum_effect') : loc('tech_laboratory_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.interstellar.int_alpha.laboratory);
                return true;
            }
            return false;
        },
        flair(){ return global.race.universe === 'magic' ? loc('tech_sanctum_flair') : loc('tech_laboratory_flair'); }
    },
    virtual_assistant: {
        title: loc('tech_virtual_assistant'),
        desc: loc('tech_virtual_assistant'),
        cost: {
            Knowledge(){ return traitCostMod('stubborn',635000); }
        },
        effect(){ return global.race.universe === 'magic' ? loc('tech_virtual_assistant_magic_effect') : loc('tech_virtual_assistant_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    dimensional_readings: {
        title: loc('tech_dimensional_readings'),
        desc: loc('tech_dimensional_readings'),
        cost: {
            Knowledge(){ return traitCostMod('stubborn',750000); }
        },
        effect(){ return loc('tech_dimensional_readings_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    quantum_entanglement: {
        title: loc('tech_quantum_entanglement'),
        desc: loc('tech_quantum_entanglement'),
        cost: {
            Knowledge(){ return traitCostMod('stubborn',850000); },
            Neutronium(){ return 7500; },
            Soul_Gem(){ return 2; }
        },
        effect(){ return loc('tech_quantum_entanglement_effect',[2, global.race.universe === 'magic' ? loc('tech_sanctum') : loc('interstellar_laboratory_title'), wardenLabel()]); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    expedition: {
        title(){ return global.race.universe === 'magic' ? loc('tech_expedition_wiz') : loc('tech_expedition'); },
        desc(){ return global.race.universe === 'magic' ? loc('tech_expedition_wiz') : loc('tech_expedition'); },
        cost: {
            Knowledge(){ return traitCostMod('stubborn',5350000); }
        },
        effect(){ return global.race.universe === 'magic' ? loc('tech_expedition_wiz_effect') : loc('tech_expedition_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    subspace_sensors: {
        title: loc('tech_subspace_sensors'),
        desc: loc('tech_subspace_sensors'),
        cost: {
            Knowledge(){ return traitCostMod('stubborn',6000000); }
        },
        effect(){ return loc('tech_subspace_sensors_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    alien_database: {
        title: loc('tech_alien_database'),
        desc: loc('tech_alien_database'),
        cost: {
            Knowledge(){ return traitCostMod('stubborn',8250000); }
        },
        effect(){ return loc('tech_alien_database_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    orichalcum_capacitor: {
        title: loc('tech_orichalcum_capacitor'),
        desc: loc('tech_orichalcum_capacitor'),
        cost: {
            Knowledge(){ return traitCostMod('stubborn',12500000); },
            Orichalcum(){ return 250000; }
        },
        effect(){ return loc('tech_orichalcum_capacitor_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    advanced_biotech: {
        title: loc('tech_advanced_biotech'),
        desc: loc('tech_advanced_biotech'),
        cost: {
            Knowledge(){ return traitCostMod('stubborn',25500000); }
        },
        effect(){ return loc('tech_advanced_biotech_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    codex_infinium: {
        title: loc('tech_codex_infinium'),
        desc: loc('tech_codex_infinium'),
        cost: {
            Knowledge(){ return traitCostMod('stubborn',40100000); },
            Codex(){ return 1; }
        },
        effect(){ return loc('tech_codex_infinium_effect'); },
        action(){
            if (payCosts($(this)[0])){
                global.resource.Codex.display = false;
                return true;
            }
            return false;
        }
    },
    spirit_box: {
        title: loc('tech_spirit_box'),
        desc: loc('tech_spirit_box'),
        cost: {
            Knowledge(){ return 62750000; },
            Asphodel_Powder(){ return 10000; },
        },
        effect(){ return loc('tech_spirit_box_effect'); },
        action(){
            if (payCosts($(this)[0])){
                global.resource.Omniscience.display = true;
                return true;
            }
            return false;
        }
    },
    spirit_researcher: {
        title: loc('tech_spirit_researcher'),
        desc: loc('tech_spirit_researcher'),
        cost: {
            Knowledge(){ return 80000000; },
            Omniscience(){ return 12500; },
        },
        effect(){ return loc('tech_spirit_researcher_effect',[global.civic.scientist ? global.civic.scientist.name : jobName('scientist')]); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    dimensional_tap: {
        title: loc('tech_dimensional_tap'),
        desc: loc('tech_dimensional_tap'),
        cost: {
            Knowledge(){ return 87500000; },
            Omniscience(){ return 13333; },
        },
        effect(){ return loc('tech_dimensional_tap_effect'); },
        action(){
            if (payCosts($(this)[0])){
                global.eden.encampment.asc = true;
                return true;
            }
            return false;
        },
        flair(){ return loc(`tech_dimensional_tap_flair`); }
    },
    devilish_dish: {
        title: loc('tech_devilish_dish'),
        desc: loc('tech_devilish_dish'),
        cost: {
            Knowledge(){ return 29000000; }
        },
        effect(){return loc('tech_devilish_dish_effect');},
        action(){
            if (payCosts($(this)[0])){
                if(global.tech['hell_lake'] >= 3){
                    messageQueue(loc('tech_lake_analysis_fasting'),'info',false,['progress','hell']);
                }
                return true;
            }
            return false;
        }
    },
    hell_oven: {
        title: loc('tech_hell_oven'),
        desc: loc('tech_hell_oven'),
        cost: {
            Knowledge(){ return 32000000; }
        },
        effect(){return loc('tech_hell_oven_effect');},
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.portal.prtl_lake.oven);
                return true;
            }
            return false;
        }
    },
    preparation_methods:{
        title: loc('tech_preparation_methods'),
        desc: loc('tech_preparation_methods'),
        cost: {
            Knowledge(){ return 62000000; }
        },
        effect(){return loc('tech_preparation_methods_effect');},
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.portal.prtl_lake.dish_soul_steeper);
                initStruct(actions.portal.prtl_lake.dish_life_infuser);
                return true;
            }
            return false;
        }
    },
};
