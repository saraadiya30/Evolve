import { global } from '../core/vars.js';
import { loc } from '../core/locale.js';
import { govEffect } from './gov_effect.js';

export const government_desc = (function(type){
    let desc = {
        anarchy: loc('govern_anarchy_effect'),
        autocracy: loc('govern_autocracy_effect',govEffect.autocracy()),
        democracy: loc(global.race.universe === 'evil' ? 'govern_managed_democracy_effect' : 'govern_democracy_effect',govEffect.democracy()),
        oligarchy: global.tech['high_tech'] && global.tech['high_tech'] >= 12 ? loc('govern_oligarchy_effect_alt',[govEffect.oligarchy()[1]]) : loc('govern_oligarchy_effect',[govEffect.oligarchy()[0], govEffect.oligarchy()[1]]),
        theocracy: loc('govern_theocracy_effect',govEffect.theocracy()),
        theocracy_alt: loc('govern_theocracy_effect_alt',govEffect.theocracy()),
        republic: loc('govern_republic_effect',govEffect.republic()),
        socialist: loc('govern_socialist_effect',govEffect.socialist()),
        corpocracy: loc('govern_corpocracy_effect',govEffect.corpocracy()),
        technocracy: global.tech['high_tech'] && global.tech['high_tech'] >= 16 ? loc('govern_technocracy_effect_alt',[govEffect.technocracy()[0],govEffect.technocracy()[2]]) : loc('govern_technocracy_effect',govEffect.technocracy()),
        federation: loc('govern_federation_effect',[govEffect.federation()[0],govEffect.federation()[1]]),
        federation_alt: loc('govern_federation_effect_alt',[25, govEffect.federation()[2], govEffect.federation()[1]]),
        magocracy: loc('govern_magocracy_effect',govEffect.magocracy()),
        dictator: loc('govern_dictator_effect',govEffect.dictator()),
    };
    let effect = desc[type];
    if (global.race.universe === 'evil'){
        switch (type){
            case 'autocracy':
                effect += ` ${loc(`govern_authority`,[8])} ${loc(`govern_authority_cap`,[10])}`;
                break;
            case 'dictator':
                effect +=  ` ${loc(`govern_authority`,[12])}`;
                break;
            case 'oligarchy':
                effect +=  ` ${loc(`govern_authority_cap`,[20])}`;
                break;
        }
    }
    return effect;
});

