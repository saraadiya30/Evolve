import { loc } from '../../../core/locale.js';
import { global, webWorker } from '../../../core/vars.js';
import { payCosts, initStruct, actions, checkAffordable } from '../../../actions/actions.js';
import { universeAffix } from '../../../achievements/achieve.js';
import { messageQueue, calcPrestige, clearPopper } from '../../../functions/functions.js';
import { planetName } from '../../../space/space.js';
import { aiApocalypse } from '../../../resets/resets.js';

// Bagian dari techsPart6 (18 entri: improved_concealment .. protocol66a), dipisah dari group_loader.js. Urutan entri sama persis.
export const techsPart6Part4 = {
    improved_concealment: {
        title: loc('tech_improved_concealment'),
        desc: loc('tech_improved_concealment'),
        condition(){
            return global.race['universe'] === 'magic' && global.race['witch_hunter'] ? true : false;
        },
        cost: {
            Mana(){ return global.race['no_plasmid'] ? 6000 : 15000; },
            Knowledge(){ return 20000000; }
        },
        effect(){ return loc('tech_improved_concealment_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    outerplane_summon: {
        title: loc('tech_outerplane_summon'),
        desc: loc('tech_outerplane_summon'),
        condition(){
            return global.race['universe'] === 'magic' && global.race['witch_hunter'] ? true : false;
        },
        cost: {
            Mana(){ return global.race['no_plasmid'] ? 12000 : 40000; },
            Knowledge(){ return 60000000; },
            Demonic_Essence(){ return 1; }
        },
        effect(){ return loc('tech_outerplane_summon_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    dark_bomb: {
        title: loc('tech_dark_bomb'),
        desc: loc('tech_dark_bomb'),
        condition(){
            let affix = universeAffix();
            if (global.portal.hasOwnProperty('waygate') && global.portal.waygate.progress < 100 && global.stats.spire.hasOwnProperty(affix) && global.stats.spire[affix].hasOwnProperty('dlstr') && global.stats.spire[affix].dlstr > 0){
                return true;
            }
            return false;
        },
        cost: {
            Knowledge(){ return 65000000; },
            Soul_Gem(){ return 5000; },
            Blood_Stone(){ return 25; },
            Dark(){ return 1; },
            Supply(){ return 1000000; }
        },
        effect(){
            return loc('tech_dark_bomb_effect');
        },
        action(){
            if (payCosts($(this)[0])){
                global.portal.waygate.progress = 100;
                global.portal.waygate.on = 0;
                global.tech['waygate'] = 3;
                global.resource.Demonic_Essence.display = true;
                global.resource.Demonic_Essence.amount = 1;
                return true;
            }
            return false;
        },
        flair(){ return loc('tech_dark_bomb_flair'); }
    },
    bribe_sphinx: {
        title: loc('portal_sphinx_bribe'),
        desc: loc('portal_sphinx_bribe'),
        cost: {
            Soul_Gem(){ return 250; },
            Supply(){ return 500000; }
        },
        effect(){
            return loc('tech_bribe_sphinx_effect');
        },
        action(){
            if (payCosts($(this)[0])){
                global.resource.Codex.display = true;
                global.resource.Codex.amount = 1;
                messageQueue(loc('tech_bribe_sphinx_msg'),'info',false,['progress','hell']);
                return true;
            }
            return false;
        }
    },
    alien_biotech: {
        title: loc('tech_alien_biotech'),
        desc: loc('tech_alien_biotech'),
        cost: {
            Knowledge(){ return 2400000; },
            Orichalcum(){ return 125000; },
            Cipher(){ return 15000; }
        },
        effect(){ return loc(global.race['orbit_decayed'] ? 'tech_alien_biotech_effect_alt' : 'tech_alien_biotech_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    zero_g_lab: {
        title: loc('tech_zero_g_lab'),
        desc: loc('tech_zero_g_lab'),
        cost: {
            Knowledge(){ return 900000; }
        },
        effect: loc('tech_zero_g_lab_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_enceladus.zero_g_lab);
                return true;
            }
            return false;
        }
    },
    operating_base: {
        title: loc('tech_operating_base'),
        desc: loc('tech_operating_base'),
        cost: {
            Knowledge(){ return 1400000; }
        },
        effect(){ return loc('tech_operating_base_effect',[planetName().enceladus]); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_enceladus.operating_base);
                return true;
            }
            return false;
        }
    },
    munitions_depot: {
        title: loc('tech_munitions_depot'),
        desc: loc('tech_munitions_depot'),
        cost: {
            Knowledge(){ return 1500000; }
        },
        effect(){ return loc('tech_munitions_depot_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_enceladus.munitions_depot);
                return true;
            }
            return false;
        }
    },
    fob: {
        title: loc('tech_fob'),
        desc: loc('tech_fob'),
        cost: {
            Knowledge(){ return 1450000; }
        },
        effect(){ return loc('tech_fob_effect',[planetName().triton]); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_triton.fob);
                initStruct(actions.space.spc_triton.lander);
                initStruct(actions.space.spc_triton.crashed_ship);
                return true;
            }
            return false;
        }
    },
    bac_tanks_tp: {
        title: loc('tech_bac_tanks'),
        desc: loc('tech_bac_tanks_desc'),
        cost: {
            Knowledge(){ return 1750000; }
        },
        effect: loc('tech_bac_tanks_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    medkit: {
        title: loc('tech_medkit'),
        desc: loc('tech_medkit'),
        cost: {
            Knowledge(){ return 2250000; },
            Quantium(){ return 250000; },
            Cipher(){ return 8000; }
        },
        effect: loc('tech_medkit_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    sam_site: {
        title: loc('tech_sam_site'),
        desc: loc('tech_sam_site'),
        cost: {
            Knowledge(){ return 1475000; }
        },
        effect(){ return loc('tech_sam_site_effect',[planetName().titan]); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_titan.sam);
                return true;
            }
            return false;
        }
    },
    data_cracker: {
        title: loc('tech_data_cracker'),
        desc: loc('tech_data_cracker'),
        cost: {
            Knowledge(){ return 2750000; },
            Cipher(){ return 25000; }
        },
        effect(){ return loc('tech_data_cracker_effect',[global.resource.Cipher.name]); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_titan.decoder);
                return true;
            }
            return false;
        }
    },
    ai_core_tp: {
        title: loc('tech_ai_core'),
        desc: loc('tech_ai_core'),
        cost: {
            Knowledge(){ return 3000000; },
            Cipher(){ return 100000; },
        },
        effect: loc('tech_ai_core_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_titan.ai_core);
                return true;
            }
            return false;
        }
    },
    ai_optimizations: {
        title: loc('tech_ai_optimizations'),
        desc: loc('tech_ai_optimizations'),
        cost: {
            Knowledge(){ return 3750000; },
            Cipher(){ return 75000; }
        },
        effect: loc('tech_ai_optimizations_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
    },
    synthetic_life: {
        title: loc('tech_synthetic_life'),
        desc: loc('tech_synthetic_life'),
        cost: {
            Knowledge(){ return 4000000; },
            Cipher(){ return 75000; }
        },
        effect: loc('tech_synthetic_life_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_titan.ai_colonist);
                return true;
            }
            return false;
        },
    },
    protocol66: {
        title: loc('tech_protocol66'),
        desc: loc('tech_protocol66'),
        cost: {
            Knowledge(){ return 5000000; }
        },
        effect: loc('tech_protocol66_effect'),
        action(){
            if (checkAffordable($(this)[0])){
                return true;
            }
            return false;
        },
        flair: loc('tech_protocol66_flair'),
    },
    protocol66a: {
        title: loc('tech_protocol66'),
        desc: loc('tech_protocol66'),
        wiki: false,
        cost: {
            Knowledge(){ return 5000000; }
        },
        effect(){
            let gains = calcPrestige('ai');
            let plasmidType = global.race.universe === 'antimatter' ? loc('resource_AntiPlasmid_plural_name') : loc('resource_Plasmid_plural_name');
            let prestige = `<div class="has-text-caution">${loc('tech_protocol66a_effect_gains',[gains.plasmid, plasmidType, gains.phage, gains.cores])}</div>`;
            return `<div>${loc('tech_protocol66a_effect')}</div>${prestige}`;
        },
        action(){
            if (payCosts($(this)[0])){
                if (webWorker.w){
                    webWorker.w.terminate();
                }
                clearPopper();
                $(`body`).append(`<div id="aiAppoc"><div></div></div>`);
                $(`#aiAppoc`).addClass('noise-wrapper');
                $(`#aiAppoc > div`).addClass('noise');

                setTimeout(function(){
                    $(`body`).append(`<div id="deadAirTop" class="signal-lost-top"></div>`);
                    $(`body`).append(`<div id="deadAirBottom" class="signal-lost-bottom"></div>`);

                    $('#deadAirTop').animate({
                        height: "50%",
                        opacity: 1
                    }, 400);

                    $('#deadAirBottom').animate({
                        height: "50%",
                        opacity: 1
                    }, 400);
                }, 3000);
                setTimeout(function(){
                    aiApocalypse();
                }, 4000);
                return true;
            }
            return false;
        },
        flair: loc('tech_protocol66a_flair'),
    },
};
