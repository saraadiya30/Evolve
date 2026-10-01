import { loc } from './locale.js';
import { global } from './vars.js';
import { actions, payCosts, initStruct } from './actions.js';
import { messageQueue } from './functions.js';
import { defineGovernor } from './governor.js';
import { int_fuel_adjust } from './space.js';

// Bagian dari techsPart7 (13 entri: vaccine_campaign .. outer_tau_survey), dipisah dari techs_part7.js. Urutan entri sama persis.
export const techsPart7Part4 = {
    vaccine_campaign: {
        title: loc('tech_vaccine_campaign'),
        desc: loc('tech_vaccine_campaign'),
        cost: {
            Knowledge(){ return 9250000; }
        },
        effect(){
            let struct = global.race['artifical'] ? actions.city.boot_camp.title() : actions.city.hospital.title;
            return `<div>${loc('tech_vaccine_campaign_effect',[struct])}</div>`;
        },
        action(){
            if (payCosts($(this)[0])){
                global.race['vax'] = 0;
                return true;
            }
            return false;
        }
    },
    vax_strat1: {
        title: loc('tech_vax_strat1'),
        desc: loc('tech_vax_strat1'),
        cost: {
            Knowledge(){ return 9500000; }
        },
        effect(){
            return `<div>${loc('tech_vax_strat1_effect')}</div><div class="has-text-special">${loc('tech_vax_warning')}</div>`;
        },
        action(){
            if (payCosts($(this)[0])){
                global.tech['vax_p'] = 1;
                messageQueue(loc('tech_vax_strat1_msg'),'info',false,['progress']);
                return true;
            }
            return false;
        }
    },
    vax_strat2: {
        title: loc('tech_vax_strat2'),
        desc: loc('tech_vax_strat2'),
        cost: {
            Knowledge(){ return 9500000; }
        },
        effect(){
            return `<div>${loc('tech_vax_strat2_effect')}</div><div class="has-text-special">${loc('tech_vax_warning')}</div>`;
        },
        action(){
            if (payCosts($(this)[0])){
                global.tech['vax_f'] = 1;
                messageQueue(loc('tech_vax_strat2_msg'),'info',false,['progress']);
                return true;
            }
            return false;
        }
    },
    vax_strat3: {
        title: loc('tech_vax_strat3'),
        desc: loc('tech_vax_strat3'),
        cost: {
            Knowledge(){ return 9500000; }
        },
        effect(){
            return `<div>${loc('tech_vax_strat3_effect')}</div><div class="has-text-special">${loc('tech_vax_warning')}</div>`;
        },
        action(){
            if (payCosts($(this)[0])){
                global.tech['vax_s'] = 1;
                messageQueue(loc('tech_vax_strat3_msg'),'info',false,['progress']);
                return true;
            }
            return false;
        }
    },
    vax_strat4: {
        title: loc('tech_vax_strat4'),
        desc: loc('tech_vax_strat4'),
        cost: {
            Knowledge(){ return 9500000; }
        },
        effect(){
            return `<div>${loc('tech_vax_strat4_effect')}</div><div class="has-text-special">${loc('tech_vax_warning')}</div>`;
        },
        action(){
            if (payCosts($(this)[0])){
                global.tech['vax_c'] = 1;
                messageQueue(loc('tech_vax_strat4_msg'),'info',false,['progress']);
                return true;
            }
            return false;
        }
    },
    cloning: {
        title: loc('tech_cloning'),
        desc: loc('tech_cloning'),
        cost: {
            Knowledge(){ return 9750000; }
        },
        effect(){
            return `<div>${loc(global.race['artifical'] ? 'tech_cloning_effect_s' : 'tech_cloning_effect')}</div>`;
        },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.tauceti.tau_home.cloning_facility);
                return true;
            }
            return false;
        },
        post(){
            defineGovernor();
        }
    },
    clone_degradation: {
        title: loc('tech_clone_degradation'),
        desc: loc('tech_clone_degradation'),
        cost: {
            Knowledge(){ return 10000000; }
        },
        effect(){
            return `<div>${loc('tech_clone_degradation_effect')}</div>`;
        },
        action(){
            if (payCosts($(this)[0])){
                messageQueue(loc('tech_clone_degradation_msg'),'info',false,['progress']);
                return true;
            }
            return false;
        }
    },
    digital_paradise: {
        title: loc('tech_digital_paradise'),
        desc: loc('tech_digital_paradise'),
        cost: {
            Knowledge(){ return 10500000; },
            Cipher(){ return 200000; }
        },
        effect(){
            return `<div>${loc('tech_digital_paradise_effect')}</div>`;
        },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    ringworld: {
        title: loc('tech_ringworld'),
        desc: loc('tech_ringworld'),
        cost: {
            Money(){ return 3000000000; },
            Knowledge(){ return 11000000; }
        },
        effect(){
            return `<div>${loc('tech_ringworld_effect')}</div>`;
        },
        action(){
            if (payCosts($(this)[0])){
                global.settings.tau.star = true;
                initStruct(actions.tauceti.tau_star.ringworld);
                return true;
            }
            return false;
        }
    },
    iso_gambling: {
        title: loc('tech_iso_gambling'),
        desc: loc('tech_iso_gambling'),
        cost: {
            Knowledge(){ return 8650000; }
        },
        effect: loc('tech_iso_gambling_effect',[5]),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    outpost_boost: {
        title(){ return loc('tech_outpost_boost'); },
        desc(){ return loc('tech_outpost_boost'); },
        cost: {
            Knowledge(){ return 8900000; },
        },
        effect(){ return loc('tech_outpost_boost_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        flair(){ return loc('tech_outpost_boost_flair'); }
    },
    cultural_center: {
        title: loc('tech_cultural_center'),
        desc: loc('tech_cultural_center'),
        cost: {
            Knowledge(){ return 8850000; }
        },
        effect: loc('tech_cultural_center_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.tauceti.tau_home.tau_cultural_center);
                return true;
            }
            return false;
        },
        flair(){ return loc('tech_cultural_center_flair'); }
    },
    outer_tau_survey: {
        title: loc('tech_outer_tau_survey'),
        desc: loc('tech_outer_tau_survey'),
        cost: {
            Knowledge(){ return 9100000; },
            Helium_3(){ return +int_fuel_adjust(5000000).toFixed(0); },
        },
        effect: loc('tech_outer_tau_survey_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.settings.tau.gas2 = true;
                return true;
            }
            return false;
        }
    },
};
