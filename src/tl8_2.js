import { loc } from './locale.js';
import { payCosts, initStruct, actions } from './actions.js';
import { global } from './vars.js';
import { races } from './races.js';

// Bagian dari techsPart8 (25 entri: camouflage .. divine_infuser), dipisah dari techs_part8.js. Urutan entri sama persis.
export const techsPart8Part2 = {
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
};
