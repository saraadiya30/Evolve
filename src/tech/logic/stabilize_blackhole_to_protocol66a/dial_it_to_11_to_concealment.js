import { loc } from '../../../core/locale.js';
import { global } from '../../../core/vars.js';
import { calcPrestige } from '../../../functions/functions.js';
import { planetName } from '../../../space/space.js';
import { races, renderPsychicPowers } from '../../../races/races.js';
import { payCosts, initStruct, actions } from '../../../actions/actions.js';
import { cataclysm_end } from '../../../resets/resets.js';
import { setupRituals, defineIndustry } from '../../../industry/industry.js';
import { arpa } from '../../../arpa/arpa.js';
import { drawResourceTab } from '../../../resources/resources.js';

// Bagian dari techsPart6 (19 entri: dial_it_to_11 .. concealment), dipisah dari group_loader.js. Urutan entri sama persis.
export const techsPart6Part3 = {
    dial_it_to_11: {
        title: loc('tech_dial_it_to_11'),
        desc: loc('tech_dial_it_to_11'),
        wiki: false,
        cost: {
            Knowledge(){ return 500000; }
        },
        condition(){
            return (global.race['sludge'] || global.race['ultra_sludge']) && !global.race['cataclysm'] ? false : true;
        },
        effect(){
            let gains = calcPrestige('cataclysm');
            let plasmidType = global.race.universe === 'antimatter' ? loc('resource_AntiPlasmid_plural_name') : loc('resource_Plasmid_plural_name');
            return `<div>${loc('tech_dial_it_to_11_effect',[planetName().dwarf,global.race['cataclysm'] ? planetName().red : races[global.race.species].home])}</div><div class="has-text-danger">${loc('tech_dial_it_to_11_effect2')}</div><div class="has-text-special">${loc('star_dock_genesis_effect2',[gains.plasmid,plasmidType])}</div><div class="has-text-special">${loc('star_dock_genesis_effect3',[gains.phage])}</div>`; },
        action(){
            if (payCosts($(this)[0])){
                $('#main').addClass('earthquake');
                setTimeout(function(){
                    $('#main').removeClass('earthquake');
                    cataclysm_end();
                }, 4000);
                return true;
            }
            return false;
        },
        flair(){ return loc('tech_dial_it_to_11_flair'); }
    },
    limit_collider: {
        title: loc('tech_limit_collider'),
        desc: loc('tech_limit_collider'),
        wiki: false,
        cost: {
            Knowledge(){ return 500000; }
        },
        effect(){ return loc('tech_limit_collider_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    mana: {
        title: loc('tech_mana'),
        desc: loc('tech_mana'),
        condition(){
            return global.race['universe'] === 'magic' ? true : false;
        },
        cost: {
            Knowledge(){ return 25; }
        },
        effect(){ return loc('tech_mana_effect'); },
        action(){
            if (payCosts($(this)[0])){
                global.resource.Mana.display = true;
                global.resource.Crystal.display = true;
                global.civic.crystal_miner.display = true;
                if (global.race['witch_hunter']){
                    global.resource.Sus.display = true;
                }
                return true;
            }
            return false;
        },
        flair: loc('tech_mana_flair'),
        post(){
            renderPsychicPowers();
        }
    },
    ley_lines: {
        title: loc('tech_ley_lines'),
        desc: loc('tech_ley_lines'),
        condition(){
            return global.race['universe'] === 'magic' ? true : false;
        },
        cost: {
            Knowledge(){ return 40; }
        },
        effect(){ return loc('tech_ley_lines_effect'); },
        action(){
            if (payCosts($(this)[0])){
                if (global.tech['isolation']){
                    initStruct(actions.tauceti.tau_home.pylon);
                }
                else if (global.race['cataclysm'] || global.race['orbit_decayed']){
                    initStruct(actions.space.spc_red.pylon);
                }
                else {
                    initStruct(actions.city.pylon);
                }
                return true;
            }
            return false;
        }
    },
    rituals: {
        title: loc('tech_rituals'),
        desc: loc('tech_rituals'),
        condition(){
            return global.race['universe'] === 'magic' ? true : false;
        },
        cost: {
            Mana(){ return 25; },
            Knowledge(){ return 750; },
            Crystal(){ return 50; }
        },
        effect(){ return loc('tech_rituals_effect'); },
        action(){
            if (payCosts($(this)[0])){
                setupRituals(true);
                global.settings.showIndustry = true;
                return true;
            }
            return false;
        },
        post(){
            defineIndustry();
        }
    },
    crafting_ritual: {
        title: loc('tech_crafting_ritual'),
        desc: loc('tech_crafting_ritual'),
        condition(){
            return global.race['universe'] === 'magic' ? true : false;
        },
        cost: {
            Mana(){ return 100; },
            Knowledge(){ return 15000; },
            Crystal(){ return 2500; }
        },
        effect(){ return loc('tech_crafting_ritual_effect'); },
        action(){
            if (payCosts($(this)[0])){
                global.race.casting['crafting'] = 0;
                return true;
            }
            return false;
        },
        post(){
            defineIndustry();
        }
    },
    mana_nexus: {
        title: loc('tech_mana_nexus'),
        desc: loc('tech_mana_nexus'),
        condition(){
            return global.race['universe'] === 'magic' ? true : false;
        },
        cost: {
            Mana(){ return 500; },
            Knowledge(){ return 160000; },
            Crystal(){ return 2500; }
        },
        effect(){ return loc('tech_mana_nexus_effect'); },
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
    clerics: {
        title: loc('tech_clerics'),
        desc: loc('tech_clerics'),
        condition(){
            return global.race['universe'] === 'magic' && global.genes['ancients'] && global.genes['ancients'] >= 2 && global.civic.priest.display ? true : false;
        },
        cost: {
            Mana(){ return 100; },
            Knowledge(){ return 2000; },
            Crystal(){ return 100; }
        },
        effect(){ return loc('tech_clerics_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    conjuring: {
        title: loc('tech_conjuring'),
        desc: loc('tech_conjuring_desc'),
        condition(){
            return global.race['universe'] === 'magic' ? true : false;
        },
        cost: {
            Mana(){ return 2; },
            Crystal(){ return 5; }
        },
        effect(){ return loc('tech_conjuring_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    res_conjuring: {
        title: loc('tech_res_conjuring'),
        desc: loc('tech_res_conjuring'),
        condition(){
            return global.race['universe'] === 'magic' ? true : false;
        },
        cost: {
            Mana(){ return 5; },
            Crystal(){ return 10; }
        },
        effect(){ return loc('tech_res_conjuring_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    alchemy: {
        title: loc('tech_alchemy'),
        desc: loc('tech_alchemy'),
        condition(){
            return global.race['universe'] === 'magic' ? true : false;
        },
        cost: {
            Mana(){ return 100; },
            Knowledge(){ return 10000; },
            Crystal(){ return 250; }
        },
        effect(){ return loc('tech_alchemy_effect'); },
        action(){
            if (payCosts($(this)[0])){
                global.race['alchemy'] = {
                    Food: 0, Lumber: 0,
                    Stone: 0, Furs: 0,
                    Copper: 0, Iron: 0,
                    Aluminium: 0, Cement: 0,
                    Coal: 0, Oil: 0,
                    Uranium: 0, Steel: 0,
                    Titanium: 0, Alloy: 0,
                    Polymer: 0, Iridium: 0,
                    Helium_3: 0, Deuterium: 0,
                    Neutronium: 0, Adamantite: 0,
                    Infernite: 0, Elerium: 0,
                    Nano_Tube: 0, Graphene: 0,
                    Stanene: 0, Bolognium: 0,
                    Vitreloy: 0, Orichalcum: 0
                };
                global.settings.showAlchemy = true;
                return true;
            }
            return false;
        },
        post(){
            drawResourceTab('alchemy');
        }
    },
    transmutation: {
        title: loc('tech_transmutation'),
        desc: loc('tech_transmutation'),
        condition(){
            return global.race['universe'] === 'magic' ? true : false;
        },
        cost: {
            Mana(){ return 1250; },
            Knowledge(){ return 5500000; },
            Crystal(){ return 1000000; }
        },
        effect(){ return loc('tech_transmutation_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        post(){
            drawResourceTab('alchemy');
        }
    },
    secret_society: {
        title: loc('tech_secret_society'),
        desc: loc('tech_secret_society'),
        condition(){
            return global.race['universe'] === 'magic' && global.race['witch_hunter'] ? true : false;
        },
        cost: {
            Mana(){ return 10; },
            Knowledge(){ return 45; },
        },
        effect(){ return loc('tech_secret_society_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    cultists: {
        title: loc('tech_cultists'),
        desc: loc('tech_cultists'),
        condition(){
            return global.race['universe'] === 'magic' && global.race['witch_hunter'] ? true : false;
        },
        cost: {
            Mana(){ return 250; },
            Knowledge(){ return 2125; }
        },
        effect(){ return loc('tech_cultists_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    conceal_ward: {
        title: loc('tech_conceal_ward'),
        desc: loc('tech_conceal_ward'),
        condition(){
            return global.race['universe'] === 'magic' && global.race['witch_hunter'] ? true : false;
        },
        cost: {
            Mana(){ return 500; },
            Knowledge(){ return 8200; },
            Crystal(){ return 1000; }
        },
        effect(){ return loc('tech_conceal_ward_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.conceal_ward);
                global.space['conceal_ward'] = { count: 0 }; // ???
                return true;
            }
            return false;
        }
    },
    subtle_rituals: {
        title: loc('tech_subtle_rituals'),
        desc: loc('tech_subtle_rituals'),
        condition(){
            return global.race['universe'] === 'magic' && global.race['witch_hunter'] ? true : false;
        },
        cost: {
            Mana(){ return 100; },
            Knowledge(){ return 15000; },
            Crystal(){ return 2500; }
        },
        effect(){ return loc('tech_subtle_rituals_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    pylon_camouflage: {
        title: loc('tech_pylon_camouflage'),
        desc: loc('tech_pylon_camouflage'),
        condition(){
            return global.race['universe'] === 'magic' && global.race['witch_hunter'] ? true : false;
        },
        cost: {
            Mana(){ return 1000; },
            Knowledge(){ return 30000; },
            Crystal(){ return 3750; }
        },
        effect(){ return loc('tech_pylon_camouflage_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    fake_tech: {
        title: loc('tech_fake_tech'),
        desc: loc('tech_fake_tech'),
        condition(){
            return global.race['universe'] === 'magic' && global.race['witch_hunter'] ? true : false;
        },
        cost: {
            Mana(){ return 2250; },
            Knowledge(){ return 60000; }
        },
        effect(){ return loc('tech_fake_tech_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    concealment: {
        title: loc('tech_concealment'),
        desc: loc('tech_concealment'),
        condition(){
            return global.race['universe'] === 'magic' && global.race['witch_hunter'] ? true : false;
        },
        cost: {
            Mana(){ return 3000; },
            Knowledge(){ return 185000; }
        },
        effect(){ return loc('tech_concealment_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
};
