import { loc } from '../../../core/locale.js';
import { payCosts, initStruct, actions } from '../../../actions/actions.js';
import { messageQueue } from '../../../functions/functions.js';
import { global } from '../../../core/vars.js';
import { planetName } from '../../../space/space.js';
import { renderPsychicPowers } from '../../../races/races.js';

// Bagian dari techsPart3 (21 entri: lake_threat .. breeder_reactor), dipisah dari group_loader.js. Urutan entri sama persis.
export const techsPart3Part4 = {
    lake_threat: {
        title: loc('tech_lake_threat'),
        desc: loc('tech_lake_threat'),
        cost: {
            Knowledge(){ return 34500000; },
        },
        effect(){ return loc('tech_lake_threat_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.portal.prtl_lake.bireme);
                messageQueue(loc('tech_lake_threat_result'),'info',false,['progress','hell']);
                return true;
            }
            return false;
        }
    },
    lake_transport: {
        title: loc('tech_lake_transport'),
        desc: loc('tech_lake_transport'),
        cost: {
            Knowledge(){ return 35000000; },
        },
        effect(){ return loc('tech_lake_transport_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.portal.prtl_lake.transport);
                return true;
            }
            return false;
        }
    },
    cooling_tower: {
        title: loc('tech_cooling_tower'),
        desc: loc('tech_cooling_tower'),
        cost: {
            Knowledge(){ return 37500000; },
        },
        effect(){ return loc('tech_cooling_tower_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.portal.prtl_lake.cooling_tower);
                return true;
            }
            return false;
        }
    },
    miasma: {
        title: loc('tech_miasma'),
        desc: loc('tech_miasma'),
        cost: {
            Knowledge(){ return 38250000; },
        },
        effect(){ return loc('tech_miasma_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.portal.prtl_spire.port);
                return true;
            }
            return false;
        }
    },
    incorporeal: {
        title: loc('tech_incorporeal'),
        desc: loc('tech_incorporeal'),
        cost: {
            Knowledge(){ return 17500000; },
            Phage(){ return 25; }
        },
        effect(){ return loc('tech_incorporeal_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    tech_ascension: {
        title: loc('tech_ascension'),
        desc: loc('tech_ascension'),
        cost: {
            Knowledge(){ return 18500000; },
            Plasmid(){ return 100; }
        },
        effect(){ return loc('tech_ascension_effect'); },
        action(){
            if (payCosts($(this)[0])){
                global.settings.space.sirius = true;
                return true;
            }
            return false;
        }
    },
    terraforming: {
        title: loc('tech_terraforming'),
        desc: loc('tech_terraforming'),
        cost: {
            Knowledge(){ return 18000000; },
        },
        effect(){ return loc('tech_terraforming_effect',[planetName().red]); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_red.terraformer);
                return true;
            }
            return false;
        }
    },
    cement_processing: {
        title: loc('tech_cement_processing'),
        desc: loc('tech_cement_processing'),
        cost: {
            Knowledge(){ return 1750000; },
        },
        effect: loc('tech_cement_processing_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    adamantite_processing_flier: {
        title: loc('tech_adamantite_processing'),
        desc: loc('tech_adamantite_processing'),
        cost: {
            Knowledge(){ return 2000000; },
        },
        effect: loc('tech_adamantite_processing_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    adamantite_processing: {
        title: loc('tech_adamantite_processing'),
        desc: loc('tech_adamantite_processing'),
        cost: {
            Knowledge(){ return 2000000; },
        },
        effect: loc('tech_adamantite_processing_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    graphene_processing: {
        title: loc('tech_graphene_processing'),
        desc: loc('tech_graphene_processing'),
        cost: {
            Knowledge(){ return 2500000; },
        },
        effect: loc('tech_graphene_processing_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    crypto_mining: {
        title: loc('tech_crypto_mining'),
        desc: loc('tech_crypto_mining'),
        cost: {
            Money(){ return 30000000000; },
            Knowledge(){ return 135000000; },
            Omniscience(){ return 45000; },
        },
        effect: loc('tech_crypto_mining_effect',[loc('interstellar_citadel_title')]),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    fusion_power: {
        title: loc('tech_fusion_power'),
        desc: loc('tech_fusion_power'),
        cost: {
            Knowledge(){ return 640000; }
        },
        effect: loc('tech_fusion_power_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.interstellar.int_alpha.fusion);
                return true;
            }
            return false;
        }
    },
    infernium_power: {
        title: loc('tech_infernium_power'),
        desc: loc('tech_infernium_power'),
        cost: {
            Knowledge(){ return 30000000; }
        },
        effect: loc('tech_infernium_power_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.portal.prtl_ruins.inferno_power);
                return true;
            }
            return false;
        }
    },
    thermomechanics: {
        title: loc('tech_thermomechanics'),
        desc: loc('tech_thermomechanics_desc'),
        cost: {
            Knowledge(){ return 60000; },
        },
        effect(){ return loc('tech_thermomechanics_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    quantum_manufacturing: {
        title: loc('tech_quantum_manufacturing'),
        desc: loc('tech_quantum_manufacturing'),
        cost: {
            Knowledge(){ return 465000; }
        },
        effect: loc('tech_quantum_manufacturing_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    worker_drone: {
        title: loc('tech_worker_drone'),
        desc: loc('tech_worker_drone'),
        cost: {
            Knowledge(){ return 400000; },
        },
        effect(){ return loc('tech_worker_drone_effect',[planetName().gas_moon]); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_gas_moon.drone);
                return true;
            }
            return false;
        }
    },
    uranium: {
        title: loc('tech_uranium'),
        desc: loc('tech_uranium'),
        cost: {
            Knowledge(){ return 72000; }
        },
        effect: loc('tech_uranium_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.resource.Uranium.display = true;
                return true;
            }
            return false;
        },
        post(){
            renderPsychicPowers();
        }
    },
    uranium_storage: {
        title: loc('tech_uranium_storage'),
        desc: loc('tech_uranium_storage'),
        cost: {
            Knowledge(){ return 75600; },
            Alloy(){ return 2500; }
        },
        effect: loc('tech_uranium_storage_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    uranium_ash: {
        title: loc('tech_uranium_ash'),
        desc: loc('tech_uranium_ash'),
        cost: {
            Knowledge(){ return 122000; }
        },
        effect: loc('tech_uranium_ash_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    breeder_reactor: {
        title: loc('tech_breeder_reactor'),
        desc: loc('tech_breeder_reactor'),
        cost: {
            Knowledge(){ return 160000; },
            Uranium(){ return 250; },
            Iridium(){ return 1000; }
        },
        effect: loc('tech_breeder_reactor_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
};
