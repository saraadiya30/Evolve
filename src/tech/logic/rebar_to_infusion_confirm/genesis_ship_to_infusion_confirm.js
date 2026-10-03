import { global } from '../../../core/vars.js';
import { loc } from '../../../core/locale.js';
import { payCosts, initStruct, actions, checkAffordable } from '../../../actions/actions.js';
import { unlockAchieve } from '../../../achievements/achieve.js';
import { loadFoundry } from '../../../civics/jobs.js';
import { renderPsychicPowers } from '../../../races/races.js';
import { arpa } from '../../../arpa/arpa.js';
import { calcPrestige } from '../../../functions/functions.js';
import { big_bang } from '../../../resets/resets.js';

// Bagian dari techsPart5 (17 entri: genesis_ship .. infusion_confirm), dipisah dari group_loader.js. Urutan entri sama persis.
export const techsPart5Part4 = {
    genesis_ship: {
        title(){ return global.race['cataclysm'] ? loc('tech_generational_ship') : loc('tech_genesis_ship'); },
        desc(){ return global.race['cataclysm'] ? loc('tech_generational_ship') : loc('tech_genesis_ship'); },
        cost: {
            Knowledge(){ return 425000; },
        },
        effect(){ return global.race['cataclysm'] ? loc('tech_generational_effect') : loc('tech_genesis_ship_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.starDock.seeder);
                if (global.race['cataclysm']){
                    unlockAchieve('iron_will',false,4);
                }
                return true;
            }
            return false;
        }
    },
    geck: {
        title(){ return loc('tech_geck'); },
        desc(){ return loc('tech_geck_desc'); },
        condition(){
            return global.stats.achieve['lamentis'] && global.stats.achieve.lamentis.l >= 5 ? true : false;
        },
        cost: {
            Knowledge(){ return 500000; },
        },
        effect(){ return loc('tech_geck_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.starDock.geck);
                return true;
            }
            return false;
        }
    },
    genetic_decay: {
        title: loc('tech_genetic_decay'),
        desc: loc('tech_genetic_decay'),
        cost: {
            Knowledge(){ return 200000; }
        },
        effect: loc('tech_genetic_decay_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    stabilize_decay: {
        title: loc('tech_stabilize_decay'),
        desc: loc('tech_stabilize_decay'),
        cost: {
            Knowledge(){ return 50000000; },
            Blood_Stone(){ return 1; }
        },
        effect: loc('tech_stabilize_decay_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    tachyon: {
        title: loc('tech_tachyon'),
        desc: loc('tech_tachyon'),
        cost: {
            Knowledge(){ return 435000; }
        },
        effect: loc('tech_tachyon_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    warp_drive: {
        title: loc('tech_warp_drive'),
        desc: loc('tech_warp_drive'),
        cost: {
            Knowledge(){ return 450000; }
        },
        effect: loc('tech_warp_drive_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.settings.showDeep = true;
                global.settings.space.alpha = true;
                initStruct(actions.interstellar.int_alpha.starport);
                return true;
            }
            return false;
        }
    },
    habitat: {
        title: loc('tech_habitat'),
        desc: loc('tech_habitat_desc'),
        cost: {
            Knowledge(){ return 480000; }
        },
        effect: loc('tech_habitat_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.interstellar.int_alpha.habitat);
                return true;
            }
            return false;
        }
    },
    graphene: {
        title: loc('tech_graphene'),
        desc: loc('tech_graphene'),
        cost: {
            Knowledge(){ return 540000; },
            Adamantite(){ return 10000; }
        },
        effect: loc('tech_graphene_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.interstellar.int_alpha.g_factory);
                return true;
            }
            return false;
        }
    },
    aerogel: {
        title: loc('tech_aerogel'),
        desc: loc('tech_aerogel'),
        cost: {
            Knowledge(){ return 750000; },
            Graphene(){ return 50000; },
            Infernite(){ return 500; }
        },
        effect: loc('tech_aerogel_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.resource.Aerogel.display = true;
                loadFoundry();
                return true;
            }
            return false;
        },
        post(){
            renderPsychicPowers();
        }
    },
    mega_manufacturing: {
        title: loc('tech_mega_manufacturing'),
        desc: loc('tech_mega_manufacturing'),
        cost: {
            Knowledge(){ return 5650000; }
        },
        effect(){ return loc('tech_mega_manufacturing_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.interstellar.int_alpha.int_factory);
                return true;
            }
            return false;
        }
    },
    luxury_condo: {
        title: loc('tech_luxury_condo'),
        desc: loc('tech_luxury_condo'),
        cost: {
            Knowledge(){ return 15000000; }
        },
        effect(){ return loc('tech_luxury_condo_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.interstellar.int_alpha.luxury_condo);
                return true;
            }
            return false;
        }
    },
    stellar_engine: {
        title: loc('tech_stellar_engine'),
        desc: loc('tech_stellar_engine'),
        cost: {
            Knowledge(){ return 1000000; }
        },
        effect: loc('tech_stellar_engine_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.interstellar.int_blackhole.stellar_engine);
                return true;
            }
            return false;
        }
    },
    mass_ejector: {
        title: loc('tech_mass_ejector'),
        desc: loc('tech_mass_ejector'),
        cost: {
            Knowledge(){ return 1100000; }
        },
        effect: loc('tech_mass_ejector_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.interstellar.int_blackhole.mass_ejector);
                return true;
            }
            return false;
        }
    },
    asteroid_redirect: {
        title: loc('tech_asteroid_redirect'),
        desc: loc('tech_asteroid_redirect'),
        cost: {
            Knowledge(){ return 3500000; }
        },
        effect: loc('tech_asteroid_redirect_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        post(){
            arpa('Physics');
        }
    },
    exotic_infusion: {
        title: loc('tech_exotic_infusion'),
        desc: loc('tech_exotic_infusion'),
        cost: {
            Knowledge(){ return 1500000; },
            Soul_Gem(){ return 10; }
        },
        effect(){ return `<div>${loc('tech_exotic_infusion_effect',[global.resource.Soul_Gem.name])}</div><div class="has-text-danger">${loc('tech_exotic_infusion_effect2')}</div>`; },
        action(){
            if (checkAffordable($(this)[0])){
                return true;
            }
            return false;
        },
        flair(){ return loc('tech_exotic_infusion_flair'); }
    },
    infusion_check: {
        title: loc('tech_infusion_check'),
        desc: loc('tech_infusion_check'),
        cost: {
            Knowledge(){ return 1500000; },
            Soul_Gem(){ return 10; }
        },
        effect(){ return `<div>${loc('tech_infusion_check_effect')}</div><div class="has-text-danger">${loc('tech_exotic_infusion_effect2')}</div>`; },
        action(){
            if (checkAffordable($(this)[0])){
                return true;
            }
            return false;
        },
        flair(){ return loc('tech_infusion_check_flair'); }
    },
    infusion_confirm: {
        title: loc('tech_infusion_confirm'),
        desc: loc('tech_infusion_confirm'),
        cost: {
            Knowledge(){ return 1500000; },
            Soul_Gem(){ return 10; }
        },
        effect(){
            let gains = calcPrestige('bigbang');
            let plasmidType = global.race.universe === 'antimatter' ? loc('resource_AntiPlasmid_plural_name') : loc('resource_Plasmid_plural_name');
            let prestige = `<div class="has-text-caution">${loc('wiki_tech_infusion_confirm_gains',[gains.plasmid,gains.phage,gains.dark,plasmidType])}</div>`;
            return `<div>${loc('tech_infusion_confirm_effect')}</div><div class="has-text-danger">${loc('tech_exotic_infusion_effect2')}</div>${prestige}`;
        },
        action(){
            if (payCosts($(this)[0])){
                if (global.tech['whitehole'] >= 4){
                    return;
                }
                global.tech['whitehole'] = 4;
                let bang = $('<div class="bigbang"></div>');
                $('body').append(bang);
                setTimeout(function(){
                    bang.addClass('burn');
                }, 125);
                setTimeout(function(){
                    bang.addClass('b');
                }, 150);
                setTimeout(function(){
                    bang.addClass('c');
                }, 2000);
                setTimeout(function(){
                    big_bang();
                }, 4000);
                return false;
            }
            return false;
        },
        flair(){ return loc('tech_infusion_confirm_flair'); }
    },
};
