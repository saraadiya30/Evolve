import { global } from './vars.js';
import { loc } from './locale.js';
import { messageQueue } from './functions.js';
import { payCosts, actions, initStruct } from './actions.js';
import { races } from './races.js';
import { jobName } from './jobs.js';
import { planetName } from './space.js';
import { defineIndustry } from './industry.js';
import { defineGovernor } from './governor.js';

// Bagian 8 dari techs: HANYA logika/teks dinamis (title, desc, cost, action, effect, condition, post, wiki, flair). Field statis ada di techs_data.js
export const techsPart8 = {
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
    camouflage: {
        title: loc('tech_camouflage'),
        desc: loc('tech_camouflage'),
        cost: {
            Knowledge(){ return 83000000; },
            Omniscience(){ return 15000; },
            Asphodel_Powder(){ return 100000; }
        },
        effect(){ return loc('tech_camouflage_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    celestial_tactics: {
        title: loc('tech_celestial_tactics'),
        desc: loc('tech_celestial_tactics'),
        condition(){
            return global.eden.hasOwnProperty('fortress') && global.eden.fortress.patrols <= 18 ? true : false;
        },
        cost: {
            Knowledge(){ return 86000000; },
            Omniscience(){ return 17500; }
        },
        effect(){ return loc('tech_celestial_tactics_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    active_camouflage: {
        title: loc('tech_active_camouflage'),
        desc: loc('tech_active_camouflage'),
        condition(){
            return global.eden.hasOwnProperty('fortress') && global.eden.fortress.armory < 100 ? true : false;
        },
        cost: {
            Knowledge(){ return 89000000; },
            Omniscience(){ return 18750; }
        },
        effect(){ return loc('tech_active_camouflage_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    special_ops_training: {
        title: loc('tech_special_ops_training'),
        desc: loc('tech_special_ops_training'),
        condition(){
            return global.eden.hasOwnProperty('fortress') && global.eden.fortress.armory <= 80 && global.eden.fortress.patrols <= 15 ? true : false;
        },
        cost: {
            Knowledge(){ return 92000000; },
            Omniscience(){ return 20000; }
        },
        effect(){ return loc('tech_special_ops_training_effect',[loc('eden_bunker_title')]); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    spectral_training: {
        title: loc('tech_spectral_training'),
        desc: loc('tech_spectral_training'),
        cost: {
            Knowledge(){ return 94500000; },
            Omniscience(){ return 21000; }
        },
        effect(){ return loc('tech_spectral_training_effect',[loc('eden_bunker_title')]); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    elysanite_mining: {
        title: loc('tech_elysanite_mining'),
        desc: loc('tech_elysanite_mining'),
        cost: {
            Knowledge(){ return 93000000; },
            Omniscience(){ return 18500; },
        },
        effect(){ return loc('tech_elysanite_mining_effect',[global.resource.Elysanite.name]); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.eden.eden_elysium.elysanite_mine);
                global.resource.Elysanite.display = true;
                return true;
            }
            return false;
        }
    },
    sacred_smelter: {
        title: loc('eden_sacred_smelter_title'),
        desc: loc('eden_sacred_smelter_title'),
        cost: {
            Knowledge(){ return 96000000; },
            Omniscience(){ return 19425; },
        },
        effect(){ return loc('tech_sacred_smelter_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.eden.eden_elysium.sacred_smelter);
                return true;
            }
            return false;
        }
    },
    fire_support_base: {
        title: loc('eden_fire_support_base_title'),
        desc: loc('eden_fire_support_base_title'),
        cost: {
            Knowledge(){ return 100000000; },
            Omniscience(){ return 22500; },
        },
        effect(){ return loc('tech_fire_support_base_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.eden.eden_elysium.fire_support_base);
                return true;
            }
            return false;
        }
    },
    pillbox: {
        title: loc('eden_pillbox_title'),
        desc: loc('eden_pillbox_title'),
        cost: {
            Knowledge(){ return 102500000; },
            Omniscience(){ return 23500; },
        },
        effect(){ return loc('tech_pillbox_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.eden.eden_elysium.pillbox);
                return true;
            }
            return false;
        }
    },
    elerium_cannon: {
        title: loc('tech_elerium_cannon'),
        desc: loc('tech_elerium_cannon'),
        cost: {
            Knowledge(){ return 105000000; },
            Omniscience(){ return 25000; },
            Steel(){ return 1000000000; },
            Nano_Tube(){ return 500000000; },
            Asphodel_Powder(){ return 250000; },
            Elysanite(){ return 100000000; },
            Soul_Gem(){ return 5000; },
        },
        effect(){ return loc('tech_elerium_cannon_effect',[loc('eden_fire_support_base_title')]); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    elerium_containment: {
        title(){ return loc('eden_elerium_containment',[global.resource.Elerium.name]); },
        desc(){ return loc('eden_elerium_containment',[global.resource.Elerium.name]); },
        cost: {
            Knowledge(){ return 106500000; },
            Omniscience(){ return 26500; },
        },
        effect(){ return loc('tech_elerium_containment_effect',[global.resource.Elerium.name]); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.eden.eden_elysium.elerium_containment);
                return true;
            }
            return false;
        }
    },
    ambrosia: {
        title(){ return loc('tech_ambrosia'); },
        desc(){ return loc('tech_ambrosia'); },
        cost: {
            Knowledge(){ return 112000000; },
            Omniscience(){ return 28000; },
        },
        effect(){ return loc('tech_ambrosia_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.eden.eden_elysium.restaurant);
                return true;
            }
            return false;
        }
    },
    eternal_bank: {
        title(){ return loc('tech_eternal_bank'); },
        desc(){ return loc('tech_eternal_bank'); },
        cost: {
            Knowledge(){ return 115000000; },
            Omniscience(){ return 30000; },
        },
        effect(){ return loc('tech_eternal_bank_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.eden.eden_elysium.eternal_bank);
                return true;
            }
            return false;
        }
    },
    wisdom: {
        title(){ return loc('tech_wisdom'); },
        desc(){ return loc('tech_wisdom'); },
        cost: {
            Knowledge(){ return 118000000; },
            Omniscience(){ return 32000; },
        },
        effect(){ return loc('tech_wisdom_effect',[loc('eden_elysium_name')]); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.eden.eden_elysium.archive);
                return true;
            }
            return false;
        }
    },
    rushmore: {
        title(){ return loc('eden_rushmore',[races[global.race.species].name]); },
        desc(){ return loc('eden_rushmore',[races[global.race.species].name]); },
        cost: {
            Knowledge(){ return 125000000; },
            Omniscience(){ return 37250; },
        },
        effect(){ return loc('tech_rushmore_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.eden.eden_elysium.rushmore);
                return true;
            }
            return false;
        }
    },
    reincarnation: {
        title(){ return loc('eden_reincarnation_title'); },
        desc(){ return loc('eden_reincarnation_title'); },
        cost: {
            Knowledge(){ return 130000000; },
            Omniscience(){ return 40000; },
        },
        effect(){ return loc('tech_reincarnation_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.eden.eden_elysium.reincarnation);
                return true;
            }
            return false;
        }
    },
    otherworldly_cement: {
        title(){ return loc('tech_otherworldly_cement',[global.resource.Cement.name]); },
        desc(){ return loc('tech_otherworldly_cement',[global.resource.Cement.name]); },
        cost: {
            Knowledge(){ return 135000000; },
            Omniscience(){ return 42500; },
        },
        effect(){ return loc('tech_otherworldly_cement_effect',[global.resource.Cement.name]); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.eden.eden_elysium.eden_cement);
                return true;
            }
            return false;
        }
    },
    ancient_crafters: {
        title(){ return loc('tech_ancient_crafters'); },
        desc(){ return loc('tech_ancient_crafters'); },
        cost: {
            Knowledge(){ return 140000000; },
            Omniscience(){ return 44000; },
        },
        effect(){ return loc('tech_ancient_crafters_effect',[actions.eden.eden_elysium.sacred_smelter.title()]); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    spirit_syphon: {
        title: loc('tech_spirit_syphon'),
        desc: loc('tech_spirit_syphon'),
        cost: {
            Knowledge(){ return 125000000; },
            Omniscience(){ return 35000; },
        },
        effect(){ return loc('tech_spirit_syphon_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.eden.eden_isle.spirit_vacuum);
                global.eden['palace'] = { energy: 1000000000000, rate: 0 };
                return true;
            }
            return false;
        }
    },
    spirit_capacitor: {
        title: loc('tech_spirit_capacitor'),
        desc: loc('tech_spirit_capacitor'),
        cost: {
            Knowledge(){ return 128000000; },
            Omniscience(){ return 37500; },
        },
        effect(){ return loc('tech_spirit_capacitor_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.eden.eden_isle.spirit_battery);
                return true;
            }
            return false;
        }
    },
    suction_force: {
        title: loc('tech_suction_force'),
        desc: loc('tech_suction_force'),
        cost: {
            Knowledge(){ return 130000000; },
            Omniscience(){ return 40000; },
        },
        effect(){ return loc('tech_suction_force_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    soul_compactor: {
        title(){ return loc('eden_soul_compactor_title'); },
        desc(){ return loc('eden_soul_compactor_title'); },
        cost: {
            Knowledge(){ return 135000000; },
            Omniscience(){ return 42500; },
        },
        effect(){ return loc('tech_soul_compactor_effect',[global.resource.Soul_Gem.name]); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.eden.eden_isle.soul_compactor);
                return true;
            }
            return false;
        }
    },
    tomb: {
        title(){ return loc('eden_tomb_title'); },
        desc(){ return loc('eden_tomb_title'); },
        cost: {
            Knowledge(){ return 140000000; },
            Omniscience(){ return 45000; },
        },
        effect(){ return loc('tech_tomb_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.eden.eden_palace.tomb);
                return true;
            }
            return false;
        }
    },
    energy_drain: {
        title(){ return loc('tech_energy_drain'); },
        desc(){ return loc('tech_energy_drain'); },
        cost: {
            Knowledge(){ return 145000000; },
            Omniscience(){ return 47500; },
        },
        effect(){ return loc('tech_energy_drain_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.eden.eden_palace.conduit);
                return true;
            }
            return false;
        }
    },
    divine_infuser: {
        title(){ return loc('tech_divine_infuser'); },
        desc(){ return loc('tech_divine_infuser'); },
        cost: {
            Knowledge(){ return 150000000; },
            Omniscience(){ return 50000; },
        },
        effect(){ return loc('tech_divine_infuser_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.eden.eden_palace.infuser);
                return true;
            }
            return false;
        }
    },
    might: {
        title: loc('tech_might'),
        desc: loc('tech_might'),
        condition(){
            return global.race['universe'] === 'evil' ? true : false;
        },
        cost: {
            Knowledge(){ return 100; }
        },
        effect: loc('tech_might_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        flair(){
            return loc('tech_might_flair');
        }
    },
    executions: {
        title: loc('tech_executions'),
        desc: loc('tech_executions'),
        condition(){
            return global.race['universe'] === 'evil' ? true : false;
        },
        cost: {
            Knowledge(){ return 35000; }
        },
        effect: loc('tech_executions_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    secret_police: {
        title: loc('tech_secret_police'),
        desc: loc('tech_secret_police'),
        condition(){
            return global.race['universe'] === 'evil' ? true : false;
        },
        cost: {
            Knowledge(){ return 112000; }
        },
        effect: loc('tech_secret_police_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    ai_tracking: {
        title: loc('tech_ai_tracking'),
        desc: loc('tech_ai_tracking'),
        condition(){
            return global.race['universe'] === 'evil' ? true : false;
        },
        cost: {
            Knowledge(){ return 345000; }
        },
        effect: loc('tech_ai_tracking_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    predictive_arrests: {
        title: loc('tech_predictive_arrests'),
        desc: loc('tech_predictive_arrests'),
        condition(){
            return global.race['universe'] === 'evil' ? true : false;
        },
        cost: {
            Knowledge(){ return 5123450; }
        },
        effect: loc('tech_predictive_arrests_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    hellspawn_tunnelers: {
        title: loc('tech_hellspawn_tunnelers'),
        desc: loc('tech_hellspawn_tunnelers'),
        condition(){
            return global.race['universe'] === 'evil' ? true : false;
        },
        wiki: global.race['warlord'] ? true : false,
        cost: {
            Knowledge(){ return 250000; }
        },
        effect: loc('tech_hellspawn_tunnelers_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.portal.prtl_wasteland.tunneler);
                return true;
            }
            return false;
        }
    },
    hell_minions: {
        title: loc('tech_minion_spawn'),
        desc: loc('tech_minion_spawn'),
        condition(){
            return global.race['universe'] === 'evil' ? true : false;
        },
        wiki: global.race['warlord'] ? true : false,
        cost: {
            Knowledge(){ return 500000; }
        },
        effect: loc('tech_minion_spawn_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.portal.prtl_badlands.minions);
                return true;
            }
            return false;
        }
    },
    reapers: {
        title: loc('tech_reapers'),
        desc: loc('tech_reapers'),
        condition(){
            return global.race['universe'] === 'evil' && global.race?.absorbed?.length >= 4 ? true : false;
        },
        wiki: global.race['warlord'] ? true : false,
        cost: {
            Knowledge(){ return 1750000; }
        },
        effect: loc('tech_reapers_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.portal.prtl_badlands.reaper);
                return true;
            }
            return false;
        }
    },
    hellfire: {
        title: loc('tech_hellfire'),
        desc: loc('tech_hellfire'),
        condition(){
            return global.race['universe'] === 'evil' ? true : false;
        },
        wiki: global.race['warlord'] ? true : false,
        cost: {
            Knowledge(){ return 90000000; }
        },
        effect: loc('tech_hellfire_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    corpse_retrieval: {
        title: loc('tech_corpse_retrieval'),
        desc: loc('tech_corpse_retrieval'),
        condition(){
            return global.race['universe'] === 'evil' ? true : false;
        },
        wiki: global.race['warlord'] ? true : false,
        cost: {
            Knowledge(){ return 125000000; }
        },
        effect: loc('tech_corpse_retrieval_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.portal.prtl_badlands.corpse_pile);
                return true;
            }
            return false;
        }
    },
    spire_bazaar: {
        title: loc('tech_spire_bazaar'),
        desc: loc('tech_spire_bazaar'),
        condition(){
            return global.race['universe'] === 'evil' ? true : false;
        },
        wiki: global.race['warlord'] ? true : false,
        cost: {
            Knowledge(){ return 148000000; }
        },
        effect: loc('tech_spire_bazaar_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.portal.prtl_spire.bazaar);
                return true;
            }
            return false;
        }
    },
    mortuary: {
        title: loc('tech_mortuary'),
        desc: loc('tech_mortuary'),
        condition(){
            return global.race['universe'] === 'evil' ? true : false;
        },
        wiki: global.race['warlord'] ? true : false,
        cost: {
            Knowledge(){ return 175000000; },
            Omniscience(){ return 5000; }
        },
        effect: loc('tech_mortuary_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.portal.prtl_badlands.mortuary);
                return true;
            }
            return false;
        }
    },
    ghost_miners: {
        title: loc('tech_ghost_miners'),
        desc: loc('tech_ghost_miners'),
        condition(){
            return global.race['universe'] === 'evil' ? true : false;
        },
        wiki: global.race['warlord'] ? true : false,
        cost: {
            Knowledge(){ return 1900000; }
        },
        effect: loc('tech_ghost_miners_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.portal.prtl_pit.shadow_mine);
                return true;
            }
            return false;
        }
    },
    tavern: {
        title: loc('tech_tavern'),
        desc: loc('tech_tavern'),
        condition(){
            return global.race['universe'] === 'evil' ? true : false;
        },
        wiki: global.race['warlord'] ? true : false,
        cost: {
            Knowledge(){ return 2500000; }
        },
        effect: loc('tech_tavern_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.portal.prtl_pit.tavern);
                return true;
            }
            return false;
        }
    },
    energized_dead: {
        title: loc('tech_energized_dead'),
        desc: loc('tech_energized_dead'),
        condition(){
            return global.race['universe'] === 'evil' ? true : false;
        },
        wiki: global.race['warlord'] ? true : false,
        cost: {
            Knowledge(){ return 12500000; },
            Asphodel_Powder(){ return 2500; }
        },
        effect(){ return loc('tech_energized_dead_effect',[global.resource.Asphodel_Powder.name, loc('portal_shadow_mine_title')]); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    corruptor: {
        title: loc('tech_corruptor'),
        desc: loc('tech_corruptor'),
        condition(){
            return global.race['universe'] === 'evil' ? true : false;
        },
        wiki: global.race['warlord'] ? true : false,
        cost: {
            Knowledge(){ return 135000000; },
            Omniscience(){ return 19500; },
        },
        effect(){ return loc('tech_corruptor_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.eden.eden_asphodel.corruptor);
                return true;
            }
            return false;
        }
    },
    seeping_corruption: {
        title(){ return loc('tech_seeping_corruption'); },
        desc(){ return loc('tech_seeping_corruption'); },
        condition(){
            return global.race['universe'] === 'evil' ? true : false;
        },
        wiki: global.race['warlord'] ? true : false,
        cost: {
            Knowledge(){ return 200000000; },
            Omniscience(){ return 47500; },
            Elysanite(){ return 100000000; }
        },
        effect(){ return loc('tech_seeping_corruption_effect',[loc('eden_asphodel_name')]); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    ultimate_corruption: {
        title(){ return loc('tech_ultimate_corruption'); },
        desc(){ return loc('tech_ultimate_corruption'); },
        condition(){
            return global.race['universe'] === 'evil' ? true : false;
        },
        wiki: global.race['warlord'] ? true : false,
        cost: {
            Knowledge(){ return 325000000; },
            Omniscience(){ return 50000; },
            Asphodel_Powder(){ return 900000; }
        },
        effect(){ return loc('tech_ultimate_corruption_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
};
