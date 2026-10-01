import { loc } from './locale.js';
import { payCosts, actions, initStruct } from './actions.js';
import { global } from './vars.js';
import { renderSupernatural, renderPsychicPowers, checkAltPurgatory } from './races.js';

// Bagian dari techsPart1 (25 entri: thrall_quarters .. adv_mulching), dipisah dari techs_part1.js. Urutan entri sama persis.
export const techsPart1Part2 = {
    thrall_quarters: {
        title: loc('tech_thrall_quarters'),
        desc: loc('tech_thrall_quarters'),
        cost: {
            Knowledge(){ return 95000; },
            Cement(){ return 50000; },
            Wrought_Iron(){ return 12500; }
        },
        effect: loc('tech_thrall_quarters_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.civic.torturer.display = true;
                return true;
            }
            return false;
        }
    },
    minor_wish: {
        title: loc('tech_minor_wish'),
        desc: loc('tech_minor_wish'),
        condition(){ return global.settings.showCivic; },
        cost: {
            Knowledge(){ return 50; }
        },
        effect: loc('tech_minor_wish_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.settings.showWish = true;
                global.race['wishStats'] = { 
                    minor: 0, major: 0, plas: 0, tax: 0, bad: 0, fame: 0, troop: 0, 
                    prof: 0, potato: 0, priest: 0, temple: false, zigg: false, 
                    astro: false, casino: false, ship: false, gov: false, strong: false
                };
                return true;
            }
            return false;
        },
        post(){
            renderSupernatural();
        }
    },
    major_wish: {
        title: loc('tech_major_wish'),
        desc: loc('tech_major_wish'),
        condition(){ return global.settings.showCivic; },
        cost: {
            Knowledge(){ return 110000; }
        },
        effect: loc('tech_major_wish_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        post(){
            renderSupernatural();
        }
    },
    psychic_energy: {
        title: loc('tech_psychic_energy'),
        desc: loc('tech_psychic_energy'),
        condition(){ return global.settings.showCivic; },
        cost: {
            Knowledge(){ return 15; }
        },
        effect: loc('tech_psychic_energy_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.resource.Energy.display = true;
                global.settings.showPsychic = true;
                global.race['psychicPowers'] = { boost: { r: 'Food' }, boostTime: 0 };
                return true;
            }
            return false;
        },
        post(){
            renderPsychicPowers();
        }
    },
    psychic_attack: {
        title: loc('tech_psychic_attack'),
        desc: loc('tech_psychic_attack'),
        condition(){ return global.stats.psykill >= 10; },
        cost: {
            Knowledge(){ return 100; }
        },
        effect: loc('tech_psychic_attack_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.race.psychicPowers['assaultTime'] = 0;
                return true;
            }
            return false;
        },
        post(){
            renderPsychicPowers();
        }
    },
    psychic_finance: {
        title: loc('tech_psychic_finance'),
        desc: loc('tech_psychic_finance'),
        cost: {
            Knowledge(){ return 65000; }
        },
        effect: loc('tech_psychic_finance_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.race.psychicPowers['cash'] = 0;
                return true;
            }
            return false;
        },
        post(){
            renderPsychicPowers();
        }
    },
    psychic_channeling: {
        title: loc('tech_psychic_channeling'),
        desc: loc('tech_psychic_channeling'),
        cost: {
            Knowledge(){ return 360000; }
        },
        effect: loc('tech_psychic_channeling_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.race.psychicPowers['channel'] = { cash: 0, assault: 0, boost: 0 };
                return true;
            }
            return false;
        },
        post(){
            renderPsychicPowers();
        }
    },
    psychic_efficiency: {
        title: loc('tech_psychic_efficiency'),
        desc: loc('tech_psychic_efficiency'),
        cost: {
            Knowledge(){ return 5250000; }
        },
        effect: loc('tech_psychic_efficiency_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        post(){
            renderPsychicPowers();
        }
    },
    mind_break: {
        title: loc('tech_mind_break'),
        desc: loc('tech_mind_break'),
        cost: {
            Knowledge(){ return 7000; }
        },
        effect: loc('tech_mind_break_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        post(){
            renderPsychicPowers();
        }
    },
    psychic_stun: {
        title: loc('tech_psychic_stun'),
        desc: loc('tech_psychic_stun'),
        cost: {
            Knowledge(){ return 32000; }
        },
        effect: loc('tech_psychic_stun_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        post(){
            renderPsychicPowers();
        }
    },
    spear: {
        title: loc('tech_spear'),
        desc: loc('tech_spear_desc'),
        cost: {
            Knowledge(){ return 110; },
            Stone(){ return 75; }
        },
        effect: loc('tech_spear_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    bronze_spear: {
        title: loc('tech_bronze_spear'),
        desc: loc('tech_bronze_spear_desc'),
        cost: {
            Knowledge(){ return 525; },
            Copper(){ return 50; }
        },
        effect: loc('tech_bronze_spear_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    iron_spear: {
        title: loc('tech_iron_spear'),
        desc: loc('tech_iron_spear_desc'),
        cost: {
            Knowledge(){ return global.city.ptrait.includes('unstable') ? 1650 : 3300; },
            Iron(){ return 375; }
        },
        effect: loc('tech_bronze_spear_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    steel_spear: {
        title: loc('tech_steel_spear'),
        desc: loc('tech_steel_spear_desc'),
        cost: {
            Knowledge(){ return 10500; },
            Iron(){ return 750; }
        },
        effect: loc('tech_bronze_spear_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    titanium_spear: {
        title: loc('tech_titanium_spear'),
        desc: loc('tech_titanium_spear_desc'),
        cost: {
            Knowledge(){ return 39500; },
            Titanium(){ return 475; }
        },
        effect: loc('tech_bronze_spear_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    dowsing_rod: {
        title: loc('tech_dowsing_rod'),
        desc: loc('tech_dowsing_rod_desc'),
        cost: {
            Knowledge(){ return 450; },
            Lumber(){ return 750; }
        },
        effect: loc('tech_dowsing_rod_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    metal_detector: {
        title: loc('tech_metal_detector'),
        desc: loc('tech_metal_detector_desc'),
        cost: {
            Knowledge(){ return 65000; }
        },
        effect: loc('tech_metal_detector_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    smokehouse: {
        title(){ return global.race['hrt'] && ['wolven','vulpine'].includes(global.race['hrt']) ? loc('city_smokehouse_easter') : loc('tech_smokehouse'); },
        desc(){ return global.race['hrt'] && ['wolven','vulpine'].includes(global.race['hrt']) ? loc('tech_smokehouse_easter_desc') : loc('tech_smokehouse_desc'); },
        cost: {
            Knowledge(){ return 80; }
        },
        effect(){ return global.race['hrt'] && ['wolven','vulpine'].includes(global.race['hrt']) ? loc('tech_smokehouse_easter_effect') : loc('tech_smokehouse_effect'); },
        action(){
            if (payCosts($(this)[0])){
                checkAltPurgatory('city','smokehouse','silo',actions.city.smokehouse.struct().d);
                return true;
            }
            return false;
        },
        post(){
            if (global.tech['s_lodge']){
                global.tech['hunting'] = 2;
            }
        }
    },
    lodge: {
        title: loc('tech_lodge'),
        desc: loc('tech_lodge'),
        wiki: global.race['carnivore'] ? true : false,
        condition(){ return global.tech['s_lodge'] ? false : true; },
        cost: {
            Knowledge(){ return 180; }
        },
        effect: loc('tech_lodge_effect'),
        action(){
            if (payCosts($(this)[0])){
                checkAltPurgatory('city','lodge','farm',actions.city.lodge.struct().d);
                return true;
            }
            return false;
        }
    },
    alt_lodge: {
        title(){ return this.condition() ? loc('tech_lodge_alt') : loc('tech_lodge'); },
        desc(){ return this.condition() ? loc('tech_lodge_alt') : loc('tech_lodge'); },
        wiki: global.race['carnivore'] ? false : true,
        condition(){
            return (((global.race.species === 'wendigo' || global.race['detritivore']) && !global.race['carnivore'] && !global.race['herbivore'])
              || (global.race['carnivore'] && global.race['soul_eater']) || global.race['artifical'] || global.race['unfathomable'] || global.race['forager']) ? true : false;
        },
        cost: {
            Knowledge(){ return global.race['artifical'] ? 10000 : 180; }
        },
        effect(){ return this.condition() ? loc('tech_lodge_effect_alt') : loc('tech_lodge_effect'); },
        action(){
            if (payCosts($(this)[0])){
                checkAltPurgatory('city','lodge','farm',actions.city.lodge.struct().d);
                return true;
            }
            return false;
        }
    },
    soul_well: {
        title: loc('tech_soul_well'),
        desc: loc('tech_soul_well'),
        cost: {
            Knowledge(){ return 10; }
        },
        effect: loc('tech_soul_well_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.soul_well);
                return true;
            }
            return false;
        }
    },
    compost: {
        title: loc('tech_compost'),
        desc: loc('tech_compost_desc'),
        cost: {
            Knowledge(){ return 10; }
        },
        effect: loc('tech_compost_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.compost);
                return true;
            }
            return false;
        }
    },
    hot_compost: {
        title: loc('tech_hot_compost'),
        desc: loc('tech_hot_compost'),
        cost: {
            Knowledge(){ return 100; }
        },
        effect: loc('tech_hot_compost_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    mulching: {
        title: loc('tech_mulching'),
        desc: loc('tech_mulching'),
        cost: {
            Knowledge(){ return 3200; }
        },
        effect: loc('tech_mulching_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    adv_mulching: {
        title: loc('tech_adv_mulching'),
        desc: loc('tech_adv_mulching'),
        cost: {
            Knowledge(){ return 16000; }
        },
        effect: loc('tech_adv_mulching_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
};
