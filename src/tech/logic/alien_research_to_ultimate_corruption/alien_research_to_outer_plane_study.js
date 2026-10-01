import { loc } from '../../../core/locale.js';
import { payCosts } from '../../../actions/core/action_costs.js';
import { actions } from '../../../core/registries.js';
import { initStruct } from '../../../actions/core/structure_ui.js';
import { global } from '../../../core/vars.js';
import { messageQueue } from '../../../functions/message_log.js';
import { defineIndustry } from '../../../industry/industry_smelter.js';
import { defineGovernor } from '../../../governor/governor.js';
import { planetName } from '../../../space/planet_generation.js';
import { jobName } from '../../../civics/jobs/job_definitions.js';

// Bagian dari techsPart8 (26 entri: alien_research .. outer_plane_study), dipisah dari group_loader.js. Urutan entri sama persis.
export const techsPart8Part1 = {
    alien_research: {
        title: loc('tech_alien_research'),
        desc: loc('tech_alien_research'),
        cost: {
            Knowledge(){ return 9350000; }
        },
        effect: loc('tech_alien_research_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.tauceti.alien_space_station['decrypted'] = 0;
                global.tauceti.alien_space_station['focus'] = 95;
                messageQueue(loc('tech_alien_research_msg'),'info',false,['progress']);
                return true;
            }
            return false;
        }
    },
    womling_gene_therapy: {
        title: loc('tech_womling_gene_therapy'),
        desc: loc('tech_womling_gene_therapy'),
        cost: {
            Knowledge(){ return 9520000; }
        },
        effect: loc('tech_womling_gene_therapy_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    food_culture: {
        title(){ return loc('tech_food_culture',[loc(`tau_gas2_alien_station_data2_r${global.race.tau_food_item || 0}`)]); },
        desc(){ return loc('tech_food_culture',[loc(`tau_gas2_alien_station_data2_r${global.race.tau_food_item || 0}`)]); },
        cost: {
            Knowledge(){ return 9410000; }
        },
        effect(){ return loc('tech_food_culture_effect',[loc(`tau_gas2_alien_station_data2_r${global.race.tau_food_item || 0}`),loc('tech_cultural_center')]); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    advanced_refinery: {
        title: loc('tech_advanced_refinery'),
        desc: loc('tech_advanced_refinery'),
        cost: {
            Knowledge(){ return 9680000; }
        },
        effect(){ return loc('tech_advanced_refinery_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    advanced_pit_mining: {
        title: loc('tech_advanced_pit_mining'),
        desc: loc('tech_advanced_pit_mining'),
        cost: {
            Knowledge(){ return 9720000; }
        },
        effect(){ return loc('tech_advanced_pit_mining_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    useless_junk: {
        title: loc('tech_useless_junk'),
        desc: loc('tech_useless_junk'),
        cost: {
            Knowledge(){ return 9550000; }
        },
        effect(){ return loc('tech_useless_junk_effect',[loc(`tau_gas2_alien_station_data4_r${global.race.tau_junk_item || 0}`),loc(`tau_red_womlings`)]); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    advanced_asteroid_mining: {
        title: loc('tech_advanced_asteroid_mining'),
        desc: loc('tech_advanced_asteroid_mining'),
        cost: {
            Knowledge(){ return 9750000; }
        },
        effect(){ return loc('tech_advanced_asteroid_mining_effect',[loc(`tau_roid_mining_ship`)]); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    advanced_material_synthesis: {
        title: loc('tech_advanced_material_synthesis'),
        desc: loc('tech_advanced_material_synthesis'),
        cost: {
            Knowledge(){ return 9880000; }
        },
        effect(){ return loc('tech_advanced_material_synthesis_effect',[global.resource.Quantium.name]); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    matrioshka_brain: {
        title: loc('tech_matrioshka_brain'),
        desc: loc('tech_matrioshka_brain'),
        cost: {
            Knowledge(){ return 10000000; }
        },
        effect(){ return loc('tech_matrioshka_brain_effect',[actions.tauceti.tau_gas2.info.name()]); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.tauceti.tau_gas2.matrioshka_brain);
                return true;
            }
            return false;
        }
    },
    ignition_device: {
        title: loc('tech_ignition_device'),
        desc: loc('tech_ignition_device'),
        cost: {
            Knowledge(){ return 10500000; }
        },
        effect(){ return loc('tech_ignition_device_effect',[actions.tauceti.tau_gas2.info.name()]); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.tauceti.tau_gas2.ignition_device);
                if (!global.tauceti.hasOwnProperty('matrioshka_brain')){
                    initStruct(actions.tauceti.tau_gas2.matrioshka_brain);
                }
                return true;
            }
            return false;
        }
    },
    replicator: {
        title(){ return global.race.universe === 'antimatter' ? loc('tech_antireplicator') : loc('tech_replicator'); },
        desc(){ return global.race.universe === 'antimatter' ? loc('tech_antireplicator') : loc('tech_replicator'); },
        cost: {
            Knowledge(){ return 6250000; },
        },
        effect(){ return global.race.universe === 'antimatter' ? loc('tech_antireplicator_effect') : loc('tech_replicator_effect'); },
        action(){
            if (payCosts($(this)[0])){
                global.race['replicator'] = { res: 'Unobtainium', pow: 1 };
                return true;
            }
            return false;
        },
        post(){
            defineIndustry();
            defineGovernor();
        }
    },
    womling_unlock: {
        title: loc('tech_womling_unlock'),
        desc: loc('tech_womling_unlock'),
        cost: {
            Knowledge(){ return 6500000; }
        },
        effect(){ return loc('tech_womling_unlock_effect',[loc('tau_planet',[planetName().red])]); },
        action(){
            if (payCosts($(this)[0])){
                global.settings.tau.red = true;
                global.tauceti.orbital_platform.count = 1;
                global.tauceti.orbital_platform.on = 1;
                return true;
            }
            return false;
        }
    },
    garden_of_eden: {
        title: loc('tech_garden_of_eden'),
        desc: loc('tech_garden_of_eden'),
        cost: {
            Knowledge(){ return 10000000; }
        },
        effect(){ return loc('tech_garden_of_eden_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.tauceti.tau_star.goe_facility);
                return true;
            }
            return false;
        }
    },
    asphodel_flowers: {
        title: loc('tech_asphodel_flowers'),
        desc: loc('tech_asphodel_flowers'),
        cost: {
            Knowledge(){ return 61000000; }
        },
        effect(){ return loc('tech_asphodel_flowers_effect'); },
        action(){
            if (payCosts($(this)[0])){
                messageQueue(loc('tech_asphodel_flowers_msg'),'info',false,['progress']);
                initStruct(actions.eden.eden_asphodel.asphodel_harvester);
                global.resource.Asphodel_Powder.display = true;
                return true;
            }
            return false;
        }
    },
    ghost_traps: {
        title: loc('tech_ghost_traps'),
        desc: loc('tech_ghost_traps'),
        cost: {
            Knowledge(){ return 61250000; },
            Asphodel_Powder(){ return 2500; },
        },
        effect(){ return loc('tech_ghost_traps_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.eden.eden_asphodel.ectoplasm_processor);
                return true;
            }
            return false;
        }
    },
    research_station: {
        title: loc('tech_research_station'),
        desc: loc('tech_research_station'),
        cost: {
            Knowledge(){ return 61650000; },
            Asphodel_Powder(){ return 5000; },
        },
        effect(){ return loc('tech_research_station_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.eden.eden_asphodel.research_station);
                return true;
            }
            return false;
        }
    },
    soul_engine: {
        title: loc('tech_soul_engine'),
        desc: loc('tech_soul_engine'),
        cost: {
            Knowledge(){ return 70000000; },
            Omniscience(){ return 1000; },
            Asphodel_Powder(){ return 12500; },
        },
        effect(){ return loc('tech_soul_engine_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.eden.eden_asphodel.soul_engine);
                return true;
            }
            return false;
        }
    },
    railway_to_hell: {
        title: loc('tech_railway_to_hell'),
        desc: loc('tech_railway_to_hell'),
        cost: {
            Knowledge(){ return 71250000; },
            Omniscience(){ return 5000; },
            Asphodel_Powder(){ return 15000; },
        },
        effect(){ return loc('tech_railway_to_hell_effect',[global.resource.Asphodel_Powder.name]); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    purification: {
        title(){ return global.race['warlord'] ? loc('tech_putrification') : loc('tech_purification'); },
        desc(){ return global.race['warlord'] ? loc('tech_putrification') : loc('tech_purification'); },
        cost: {
            Knowledge(){ return 71250000; },
            Omniscience(){ return 5000; },
            Asphodel_Powder(){ return 17500; },
        },
        effect(){ return loc(global.race['warlord'] ? 'tech_putrification_effect' : 'tech_purification_effect',[global.resource.Asphodel_Powder.name, actions.portal.prtl_spire.purifier.title(),2,loc('eden_asphodel_harvester_title')]); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    asphodel_mech: {
        title: loc('tech_asphodel_mech'),
        desc: loc('tech_asphodel_mech'),
        cost: {
            Knowledge(){ return 72300000; },
            Omniscience(){ return 6000; },
        },
        effect(){ return loc('tech_asphodel_mech_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.eden.eden_asphodel.mech_station);
                return true;
            }
            return false;
        }
    },
    asphodel_storage: {
        title: loc('tech_asphodel_storage'),
        desc: loc('tech_asphodel_storage'),
        cost: {
            Knowledge(){ return 73000000; },
            Omniscience(){ return 6500; },
        },
        effect(){ return loc('tech_asphodel_storage_effect',[global.resource.Asphodel_Powder.name]); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.eden.eden_asphodel.warehouse);
                return true;
            }
            return false;
        }
    },
    asphodel_stabilizer: {
        title: loc('tech_asphodel_stabilizer'),
        desc: loc('tech_asphodel_stabilizer'),
        cost: {
            Knowledge(){ return 74000000; },
            Omniscience(){ return 10000; },
        },
        effect(){ return loc('tech_asphodel_stabilizer_effect',[global.resource.Asphodel_Powder.name]); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.eden.eden_asphodel.stabilizer);
                return true;
            }
            return false;
        }
    },
    edenic_bunker: {
        title: loc('tech_edenic_bunker'),
        desc: loc('tech_edenic_bunker'),
        cost: {
            Knowledge(){ return 77500000; },
            Omniscience(){ return 12000; },
        },
        effect(){ return loc('tech_edenic_bunker_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.eden.eden_asphodel.bunker);
                return true;
            }
            return false;
        }
    },
    bliss_den: {
        title: loc('tech_bliss_den'),
        desc: loc('tech_bliss_den'),
        cost: {
            Knowledge(){ return 90000000; },
            Omniscience(){ return 16666; },
        },
        effect(){ return loc('tech_bliss_den_effect',[global.resource.Asphodel_Powder.name]); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.eden.eden_asphodel.bliss_den);
                return true;
            }
            return false;
        }
    },
    hallowed_housing: {
        title: loc('tech_hallowed_housing'),
        desc: loc('tech_hallowed_housing'),
        cost: {
            Knowledge(){ return 95000000; },
            Omniscience(){ return 19500; },
        },
        effect(){ return loc('tech_hallowed_housing_effect',[jobName('priest'),loc('eden_asphodel_name')]); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.eden.eden_asphodel.rectory);
                return true;
            }
            return false;
        }
    },
    outer_plane_study: {
        title: loc('tech_outer_plane_study'),
        desc: loc('tech_outer_plane_study'),
        cost: {
            Knowledge(){ return 75000000; },
            Omniscience(){ return 11655; },
        },
        effect(){ return loc('tech_outer_plane_study_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.eden.eden_asphodel.rune_gate);
                initStruct(actions.eden.eden_asphodel.rune_gate_open);
                return true;
            }
            return false;
        }
    },
};
