import { loc } from '../../../core/locale.js';
import { global } from '../../../core/vars.js';
import { payCosts, initStruct, actions } from '../../../actions/actions.js';

// Bagian dari techsPart8 (18 entri: might .. ultimate_corruption), dipisah dari group_loader.js. Urutan entri sama persis.
export const techsPart8Part3 = {
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
