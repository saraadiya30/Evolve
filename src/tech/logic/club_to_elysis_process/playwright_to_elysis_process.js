import { global } from '../../../core/vars.js';
import { loc } from '../../../core/locale.js';
import { payCosts, wardenLabel, initStruct, actions, structName } from '../../../actions/actions.js';
import { loadFoundry } from '../../../civics/jobs.js';

// Bagian dari techsPart1 (16 entri: playwright .. elysis_process), dipisah dari group_loader.js. Urutan entri sama persis.
export const techsPart1Part4 = {
    playwright: {
        title(){ return global.race.universe === 'evil' ? loc('tech_gladiators') : loc('tech_playwright'); },
        desc: loc('tech_playwright'),
        cost: {
            Knowledge(){ return 1080; }
        },
        effect(){ return global.race.universe === 'evil' ? loc('tech_gladiators_effect',[loc('city_colosseum')]) : loc('tech_playwright_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    magic: {
        title(){ 
            switch(global.race.universe){
                case 'magic':
                    return loc('tech_illusionist');
                case 'evil':
                    return loc('tech_mock_battles');
                default:
                    return loc('tech_magic');
            }
        },
        desc(){ return $(this)[0].title(); },
        cost: {
            Knowledge(){ return 7920; }
        },
        effect(){ 
            switch(global.race.universe){
                case 'magic':
                    return loc('tech_illusionist_effect');
                case 'evil':
                    return loc('tech_mock_battles_effect');
                default:
                    return loc('tech_magic_effect');
            }
        },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    superstars: {
        title(){ return global.race.universe === 'evil' ? loc('tech_champions') : loc('tech_superstars'); },
        desc(){ return global.race.universe === 'evil' ? loc('tech_champions') : loc('tech_superstars'); },
        cost: {
            Knowledge(){ return 660000; }
        },
        effect(){ return global.race.universe === 'evil' ? loc('tech_champions_effect') : loc('tech_superstars_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    radio: {
        title: loc('tech_radio'),
        desc: loc('tech_radio'),
        cost: {
            Knowledge(){ return 16200; }
        },
        effect(){ return loc('tech_radio_effect',[wardenLabel()]); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    tv: {
        title: loc('tech_tv'),
        desc: loc('tech_tv'),
        cost: {
            Knowledge(){ return 67500; }
        },
        effect(){ return loc('tech_tv_effect',[wardenLabel()]); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    vr_center: {
        title: loc('tech_vr_center'),
        desc: loc('tech_vr_center'),
        cost: {
            Knowledge(){ return 620000; }
        },
        effect(){ return loc('tech_vr_center_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_red.vr_center);
                return true;
            }
            return false;
        }
    },
    zoo: {
        title: loc('tech_zoo'),
        desc: loc('tech_zoo'),
        cost: {
            Knowledge(){ return 22500000; }
        },
        effect(){ return loc('tech_zoo_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.interstellar.int_alpha.zoo);
                return true;
            }
            return false;
        }
    },
    casino: {
        title: structName('casino'),
        desc: structName('casino'),
        cost: {
            Knowledge(){ return 95000; }
        },
        effect: loc('tech_casino_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.casino);
                initStruct(actions.space.spc_hell.spc_casino);
                return true;
            }
            return false;
        }
    },
    dazzle: {
        title: loc('tech_dazzle'),
        desc: loc('tech_dazzle'),
        cost: {
            Knowledge(){ return 125000; }
        },
        effect: loc('tech_dazzle_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    casino_vault: {
        title: loc('tech_casino_vault'),
        desc: loc('tech_casino_vault'),
        cost: {
            Knowledge(){ return 145000; },
            Iridium(){ return 2500; }
        },
        effect: loc('tech_casino_vault_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    otb: {
        title: loc('tech_otb'),
        desc: loc('tech_otb'),
        cost: {
            Knowledge(){ return 390000; }
        },
        effect: loc('tech_otb_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    online_gambling: {
        title: loc('tech_online_gambling'),
        desc: loc('tech_online_gambling'),
        cost: {
            Knowledge(){ return 800000; }
        },
        effect: loc('tech_online_gambling_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    bolognium_vaults: {
        title: loc('tech_bolognium_vaults'),
        desc: loc('tech_bolognium_vaults'),
        cost: {
            Knowledge(){ return 3900000; },
            Bolognium(){ return 180000; }
        },
        effect: loc('tech_bolognium_vaults_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    mining: {
        title(){ return global.race['sappy'] ? loc('tech_amber') : loc('tech_mining'); },
        desc(){ return global.race['sappy'] ? loc('tech_amber') : loc('tech_mining_desc'); },
        cost: {
            Knowledge(){ return 45; }
        },
        effect(){ return global.race['sappy'] ? loc('tech_amber_effect') : loc(global.race['flier'] ? 'tech_mining_effect_alt' : 'tech_mining_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.rock_quarry);
                if (global.race['cannibalize']){
                    initStruct(actions.city.s_alter);
                }
                return true;
            }
            return false;
        }
    },
    bayer_process: {
        title: loc('tech_bayer_process'),
        desc: loc('tech_bayer_process_desc'),
        cost: {
            Knowledge(){ return 4500; }
        },
        effect(){ return global.race['sappy'] ? loc('tech_bayer_process_effect_alt') : loc('tech_bayer_process_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.metal_refinery);
                loadFoundry();
                return true;
            }
            return false;
        }
    },
    elysis_process: {
        title: loc('tech_elysis_process'),
        desc: loc('tech_elysis_process'),
        cost: {
            Knowledge(){ return 675000; },
            Graphene(){ return 45000; },
            Stanene(){ return 75000; },
        },
        effect: loc('tech_elysis_process_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
};
