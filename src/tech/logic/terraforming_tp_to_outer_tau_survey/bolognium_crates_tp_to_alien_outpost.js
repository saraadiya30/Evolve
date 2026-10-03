import { loc } from '../../../core/locale.js';
import { global } from '../../../core/vars.js';
import { payCosts, initStruct, actions } from '../../../actions/actions.js';
import { vBind, messageQueue } from '../../../functions/functions.js';
import { planetName } from '../../../space/space.js';
import { setOrbits, drawShipYard } from '../../../truepath/truepath.js';

// Bagian dari techsPart7 (27 entri: bolognium_crates_tp .. alien_outpost), dipisah dari group_loader.js. Urutan entri sama persis.
export const techsPart7Part2 = {
    bolognium_crates_tp: {
        title(){ return loc('tech_crates',[global.resource.Bolognium.name]); },
        desc(){ return loc('tech_crates',[global.resource.Bolognium.name]); },
        cost: {
            Knowledge(){ return 6160000; },
            Bolognium(){ return 750000; }
        },
        effect(){ return loc('tech_bolognium_crates_effect',[global.resource.Bolognium.name]); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    adamantite_containers_tp: {
        title(){ return loc('tech_containers',[global.resource.Adamantite.name]); },
        desc(){ return loc('tech_adamantite_containers_desc',[global.resource.Adamantite.name]); },
        cost: {
            Knowledge(){ return 575000; },
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
    quantium_containers: {
        title(){ return loc('tech_containers',[global.resource.Quantium.name]); },
        desc(){ return loc('tech_containers',[global.resource.Quantium.name]); },
        cost: {
            Knowledge(){ return 1150000; },
            Quantium(){ return 100000; }
        },
        effect(){ return loc('tech_quantium_containers_effect',[global.resource.Quantium.name]); },
        action(){
            if (payCosts($(this)[0])){
                vBind({el: `#createHead`},'update');
                return true;
            }
            return false;
        }
    },
    unobtainium_containers: {
        title(){ return loc('tech_containers',[global.resource.Unobtainium.name]); },
        desc(){ return loc('tech_containers',[global.resource.Unobtainium.name]); },
        cost: {
            Knowledge(){ return 7250000; },
            Unobtainium(){ return 7500; }
        },
        effect(){ return loc('tech_bolognium_containers_effect',[global.resource.Unobtainium.name]); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    reinforced_shelving: {
        title: loc('tech_reinforced_shelving'),
        desc: loc('tech_reinforced_shelving'),
        cost: {
            Knowledge(){ return 850000; },
            Adamantite(){ return 350000; },
            Graphene(){ return 250000; }
        },
        effect: loc('tech_reinforced_shelving_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    garage_shelving: {
        title: loc('tech_garage_shelving'),
        desc: loc('tech_garage_shelving'),
        cost: {
            Knowledge(){ return 1250000; },
            Quantium(){ return 75000; }
        },
        effect: loc('tech_garage_shelving_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    warehouse_shelving: {
        title: loc('tech_warehouse_shelving'),
        desc: loc('tech_warehouse_shelving'),
        cost: {
            Knowledge(){ return 2250000; },
            Quantium(){ return 1000000; },
            Cipher(){ return 25000; }
        },
        effect: loc('tech_warehouse_shelving_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    elerium_extraction: {
        title: loc('tech_elerium_extraction'),
        desc: loc('tech_elerium_extraction'),
        cost: {
            Knowledge(){ return 2500000; },
            Orichalcum(){ return 100000; },
            Cipher(){ return 12000; }
        },
        effect(){ return loc('tech_elerium_extraction_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_kuiper.elerium_mine);
                return true;
            }
            return false;
        }
    },
    orichalcum_panels_tp: {
        title: loc('tech_orichalcum_panels'),
        desc: loc('tech_orichalcum_panels'),
        cost: {
            Knowledge(){ return 2400000; },
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
    shipyard: {
        title(){ return loc('tech_shipyard',[planetName().dwarf]); },
        desc(){ return loc('tech_shipyard',[planetName().dwarf]); },
        cost: {
            Knowledge(){ return 420000; }
        },
        effect(){ return loc('tech_shipyard_effect',[planetName().dwarf]); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_dwarf.shipyard);
                setOrbits();
                return true;
            }
            return false;
        },
    },
    ship_lasers: {
        title: loc('tech_ship_lasers'),
        desc: loc('tech_ship_lasers'),
        cost: {
            Knowledge(){ return 425000; },
            Elerium(){ return 500; }
        },
        effect: loc('tech_ship_lasers_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    pulse_lasers: {
        title: loc('tech_pulse_lasers'),
        desc: loc('tech_pulse_lasers'),
        cost: {
            Knowledge(){ return 500000; },
            Elerium(){ return 750; }
        },
        effect: loc('tech_pulse_lasers_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    ship_plasma: {
        title: loc('tech_ship_plasma'),
        desc: loc('tech_ship_plasma'),
        cost: {
            Knowledge(){ return 880000; },
            Elerium(){ return 2500; }
        },
        effect: loc('tech_ship_plasma_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    ship_phaser: {
        title: loc('tech_ship_phaser'),
        desc: loc('tech_ship_phaser'),
        cost: {
            Knowledge(){ return 1225000; },
            Quantium(){ return 75000; }
        },
        effect: loc('tech_ship_phaser_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    ship_disruptor: {
        title: loc('tech_ship_disruptor'),
        desc: loc('tech_ship_disruptor'),
        cost: {
            Knowledge(){ return 2000000; },
            Cipher(){ return 25000; }
        },
        effect: loc('tech_ship_disruptor_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    destroyer_ship: {
        title: loc('tech_destroyer_ship'),
        desc: loc('tech_destroyer_ship'),
        cost: {
            Knowledge(){ return 465000; }
        },
        effect: loc('tech_destroyer_ship_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    cruiser_ship_tp: {
        title: loc('tech_cruiser_ship'),
        desc: loc('tech_cruiser_ship'),
        cost: {
            Knowledge(){ return 750000; },
            Adamantite(){ return 50000; }
        },
        effect: loc('tech_cruiser_ship_tp'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    h_cruiser_ship: {
        title: loc('tech_h_cruiser_ship'),
        desc: loc('tech_h_cruiser_ship'),
        cost: {
            Knowledge(){ return 1500000; }
        },
        effect: loc('tech_h_cruiser_ship_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    dreadnought_ship: {
        title: loc('tech_dreadnought_ship'),
        desc: loc('tech_dreadnought_ship'),
        cost: {
            Knowledge(){ return 2500000; },
            Cipher(){ return 10000; }
        },
        effect: loc('tech_dreadnought_ship_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    pulse_engine: {
        title: loc('outer_shipyard_engine_pulse'),
        desc: loc('outer_shipyard_engine_pulse'),
        cost: {
            Knowledge(){ return 555000; },
            Stanene(){ return 250000; }
        },
        effect: loc('tech_pulse_engine_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    photon_engine: {
        title: loc('outer_shipyard_engine_photon'),
        desc: loc('outer_shipyard_engine_photon'),
        cost: {
            Knowledge(){ return 1150000; },
            Quantium(){ return 50000; }
        },
        effect: loc('tech_photon_engine_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    vacuum_drive: {
        title: loc('outer_shipyard_engine_vacuum'),
        desc: loc('outer_shipyard_engine_vacuum'),
        cost: {
            Knowledge(){ return 1850000; },
            Cipher(){ return 10000; }
        },
        effect: loc('outer_shipyard_engine_vacuum_desc'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    ship_fusion: {
        title: loc('tech_fusion_generator'),
        desc: loc('tech_fusion_generator'),
        cost: {
            Knowledge(){ return 1100000; },
            Quantium(){ return 65000; }
        },
        effect: loc('tech_fusion_generator_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    ship_elerium: {
        title: loc('tech_elerium_generator'),
        desc: loc('tech_elerium_generator'),
        cost: {
            Knowledge(){ return 1900000; },
            Cipher(){ return 18000; }
        },
        effect: loc('tech_elerium_generator_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    quantum_signatures: {
        title: loc('tech_quantum_signatures'),
        desc: loc('tech_quantum_signatures'),
        cost: {
            Knowledge(){ return 1050000; },
            Quantium(){ return 10000; }
        },
        effect: loc('tech_quantum_signatures_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    interstellar_drive: {
        title: loc('tech_interstellar_drive'),
        desc: loc('tech_interstellar_drive'),
        cost: {
            Knowledge(){ return 4500000; },
            Quantium(){ return 250000; },
            Cipher(){ return 75000; }
        },
        effect: loc('tech_interstellar_drive_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        post(){
            drawShipYard();
        }
    },
    alien_outpost: {
        title: loc('tech_alien_outpost'),
        desc: loc('tech_alien_outpost'),
        cost: {
            Knowledge(){ return 5000000; },
            Cipher(){ return 100000; }
        },
        effect: loc('tech_alien_outpost_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.tauceti.tau_home.alien_outpost);
                initStruct(actions.tauceti.tau_home.jump_gate);
                initStruct(actions.space.spc_sun.jump_gate);
                messageQueue(loc('tech_alien_outpost_msg'),'info',false,['progress']);
                return true;
            }
            return false;
        }
    },
};
