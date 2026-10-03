import { loc } from '../../../core/locale.js';
import { traitCostMod } from '../../../races/races.js';
import { payCosts, initStruct, actions, checkAffordable } from '../../../actions/actions.js';
import { global } from '../../../core/vars.js';
import { messageQueue, popCost, calcPrestige } from '../../../functions/functions.js';
import { arpa } from '../../../arpa/arpa.js';
import { descension } from '../../../resets/resets.js';

// Bagian dari techsPart3 (24 entri: virtual_reality .. lake_analysis), dipisah dari group_loader.js. Urutan entri sama persis.
export const techsPart3Part3 = {
    virtual_reality: {
        title: loc('tech_virtual_reality'),
        desc: loc('tech_virtual_reality'),
        cost: {
            Knowledge(){ return traitCostMod('stubborn',600000); },
            Stanene(){ return 1250 },
            Soul_Gem(){ return 1 }
        },
        effect: loc('tech_virtual_reality_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        flair(){
            return loc('tech_virtual_reality_flair');
        }
    },
    plasma: {
        title: loc('tech_plasma'),
        desc: loc('tech_plasma'),
        cost: {
            Knowledge(){ return traitCostMod('stubborn',755000); },
            Infernite(){ return global.race['truepath'] ? 0 : 1000; },
            Stanene(){ return global.race['truepath'] ? 1000000 : 250000; }
        },
        effect: loc('tech_plasma_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    shields: {
        title: loc('tech_shields'),
        desc: loc('tech_shields'),
        cost: {
            Knowledge(){ return traitCostMod('stubborn',850000); },
        },
        effect: loc('tech_shields_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.settings.space.neutron = true;
                global.settings.space.blackhole = true;
                return true;
            }
            return false;
        }
    },
    ai_core: {
        title: loc('tech_ai_core'),
        desc: loc('tech_ai_core'),
        cost: {
            Knowledge(){ return traitCostMod('stubborn',1500000); },
        },
        effect: loc('tech_ai_core_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.interstellar.int_neutron.citadel);
                return true;
            }
            return false;
        }
    },
    metaphysics: {
        title: loc('tech_metaphysics'),
        desc: loc('tech_metaphysics'),
        cost: {
            Knowledge(){ return traitCostMod('stubborn',5000000); },
            Vitreloy(){ return 10000; },
            Soul_Gem(){ return 10; }
        },
        effect(){ return loc('tech_metaphysics_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    orichalcum_analysis: {
        title: loc('tech_orichalcum_analysis'),
        desc: loc('tech_orichalcum_analysis'),
        cost: {
            Knowledge(){ return traitCostMod('stubborn',12200000); },
            Orichalcum(){ return 100000; }
        },
        effect(){ return loc('tech_orichalcum_analysis_effect'); },
        action(){
            if (payCosts($(this)[0])){
                messageQueue(loc('tech_orichalcum_analysis_result'),'info',false,['progress']);
                return true;
            }
            return false;
        }
    },
    cybernetics: {
        title: loc('tech_cybernetics'),
        desc: loc('tech_cybernetics'),
        cost: {
            Knowledge(){ return traitCostMod('stubborn',25000000); },
            Adamantite(){ return 12500000; },
            Stanene(){ return 50000000; },
            Vitreloy(){ return 10000000; },
        },
        effect(){ return loc('tech_cybernetics_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    divinity: {
        title: loc('tech_divinity'),
        desc: loc('tech_divinity'),
        cost: {
            Knowledge(){ return traitCostMod('stubborn',120000000); },
            Omniscience(){ return 34000; },
        },
        effect(){ return loc('tech_divinity_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    blood_pact: {
        title: loc('tech_blood_pact'),
        desc: loc('tech_blood_pact'),
        cost: {
            Knowledge(){ return 52000000; },
            Blood_Stone(){ return 1; }
        },
        effect(){ return loc('tech_blood_pact_effect'); },
        action(){
            if (payCosts($(this)[0])){
                global.settings.arpa.blood = true;
                arpa('Crispr');
                return true;
            }
            return false;
        },
        post(){
            arpa('Blood');
        }
    },
    purify: {
        title(){ return global.race['warlord'] ? loc('tech_potent_miasma') : loc('tech_purify'); },
        desc(){ return global.race['warlord'] ? loc('tech_potent_miasma') : loc('tech_purify'); },
        cost: {
            Knowledge(){ return 52500000; },
            Blood_Stone(){ return 1; }
        },
        effect(){ return global.race['warlord'] ? loc('tech_potent_miasma_effect') : loc('tech_purify_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    waygate: {
        title: loc('tech_waygate'),
        desc: loc('tech_waygate'),
        cost: {
            Knowledge(){ return 55000000; }
        },
        effect(){ return loc('tech_waygate_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.portal.prtl_spire.waygate);
                return true;
            }
            return false;
        }
    },
    demonic_infusion: {
        title: loc('tech_demonic_infusion'),
        desc: loc('tech_demonic_infusion'),
        condition(){
            return global.resource.Demonic_Essence.amount >= 1 ? true : false;
        },
        cost: {
            Species(){ return popCost(1000); },
            Knowledge(){ return 55000000; },
            Demonic_Essence(){ return 1; }
        },
        effect(){
            return `<div>${loc('tech_demonic_infusion_effect')}</div><div class="has-text-special">${loc('tech_demonic_infusion_effect2',[calcPrestige('descend').artifact])}</div>`;
        },
        action(){
            // Check affordability without paying the 1000 pop and Demonic Essence to avoid breaking the backup save
            if (checkAffordable($(this)[0])){
                descension();
            }
            return false;
        }
    },
    purify_essence: {
        title(){ return loc('tech_purify_essence'); },
        desc(){ return loc('tech_purify_essence'); },
        condition(){
            return global.resource.Demonic_Essence.amount >= 1 ? true : false;
        },
        cost: {
            Knowledge(){ return 60000000; },
            Artifact(){ return 1; },
            Demonic_Essence(){ return 1; }
        },
        effect(){
            return global.race['warlord'] ? `<div>${loc('tech_purify_essence_effect')}</div>` : `<div>${loc('tech_purify_essence_effect')}</div><div class="has-text-special">${loc('tech_purify_essence_warn')}</div>`;
        },
        action(){
            if (payCosts($(this)[0])){
                global.resource.Demonic_Essence.display = false;
                global.resource.Demonic_Essence.amount = 0;
                global.resource.Blessed_Essence.display = true;
                global.resource.Blessed_Essence.amount = 1;
                return true;
            }
            return false;
        }
    },
    gate_key: {
        title: loc('tech_gate_key'),
        desc: loc('tech_gate_key'),
        cost: {
            Knowledge(){ return 30000000; },
        },
        effect(){ return loc('tech_gate_key_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.portal.prtl_gate.west_tower);
                initStruct(actions.portal.prtl_gate.east_tower);
                return true;
            }
            return false;
        }
    },
    gate_turret: {
        title: loc('tech_gate_turret'),
        desc: loc('tech_gate_turret'),
        cost: {
            Knowledge(){ return 32000000; },
        },
        effect(){ return loc('tech_gate_turret_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.portal.prtl_gate.gate_turret);
                return true;
            }
            return false;
        }
    },
    infernite_mine: {
        title: loc('tech_infernite_mine'),
        desc: loc('tech_infernite_mine'),
        cost: {
            Knowledge(){ return 32500000; },
        },
        effect(){ return loc('tech_infernite_mine_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.portal.prtl_gate.infernite_mine);
                return true;
            }
            return false;
        }
    },
    study_corrupt_gem: {
        title: loc('tech_study_corrupt_gem'),
        desc: loc('tech_study_corrupt_gem'),
        cost: {
            Mana(){ return global.race['no_plasmid'] ? 10000 : 30000; },
            Knowledge(){ return 18500000; },
            Corrupt_Gem(){ return 1; }
        },
        effect(){ return loc('tech_study_corrupt_gem_effect'); },
        action(){
            if (payCosts($(this)[0])){
                messageQueue(loc('tech_study_corrupt_gem_result'),'info',false,['progress','hell']);
                global.resource.Corrupt_Gem.display = false;
                return true;
            }
            return false;
        }
    },
    soul_binding: {
        title: loc('tech_soul_binding'),
        desc: loc('tech_soul_binding'),
        cost: {
            Knowledge(){ return 19000000; }
        },
        effect(){ return loc('tech_soul_binding_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    soul_capacitor: {
        title: loc('tech_soul_capacitor'),
        desc: loc('tech_soul_capacitor'),
        cost: {
            Knowledge(){ return 19500000; }
        },
        effect(){ return loc('tech_soul_capacitor_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.portal.prtl_pit.soul_capacitor);
                return true;
            }
            return false;
        }
    },
    absorption_chamber: {
        title: loc('tech_absorption_chamber'),
        desc: loc('tech_absorption_chamber'),
        cost: {
            Knowledge(){ return 20000000; }
        },
        effect(){ return loc('tech_absorption_chamber_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.portal.prtl_pit.absorption_chamber);
                return true;
            }
            return false;
        }
    },
    corrupt_gem_analysis: {
        title: loc('tech_corrupt_gem_analysis'),
        desc: loc('tech_corrupt_gem_analysis'),
        cost: {
            Species(){ return 1; }, // Not scaled intentionally
            Knowledge(){ return 22000000; },
            Corrupt_Gem(){ return 1; }
        },
        effect(){ return loc('tech_corrupt_gem_analysis_effect'); },
        action(){
            if (payCosts($(this)[0])){
                messageQueue(loc('tech_corrupt_gem_analysis_result'),'info',false,['progress','hell']);
                global.resource.Corrupt_Gem.display = false;
                return true;
            }
            return false;
        }
    },
    hell_search: {
        title: loc('tech_hell_search'),
        desc: loc('tech_hell_search'),
        cost: {
            Knowledge(){ return 22100000; },
            Structs(){
                return {
                    portal: {
                        sensor_drone: { s: 'prtl_badlands', count: 25, on: 25 },
                    }
                };
            },
        },
        effect(){ return loc('tech_hell_search_effect'); },
        action(){
            if (payCosts($(this)[0])){
                messageQueue(loc('tech_hell_search_result'),'info',false,['progress','hell']);
                global.settings.portal.ruins = true;
                global.settings.portal.gate = true;
                initStruct(actions.portal.prtl_ruins.guard_post);
                return true;
            }
            return false;
        }
    },
    codex_infernium: {
        title: loc('tech_codex_infernium'),
        desc: loc('tech_codex_infernium'),
        cost: {
            Knowledge(){ return 23500000; },
            Codex(){ return 1; }
        },
        effect(){ return loc('tech_codex_infernium_effect'); },
        action(){
            if (payCosts($(this)[0])){
                global.resource.Codex.display = false;
                return true;
            }
            return false;
        }
    },
    lake_analysis: {
        title: loc('tech_lake_analysis'),
        desc: loc('tech_lake_analysis'),
        cost: {
            Knowledge(){ return 34000000; },
        },
        effect(){ return loc('tech_lake_analysis_effect'); },
        action(){
            if (payCosts($(this)[0])){
                if(global.race['fasting'] && global.tech['dish'] >= 1){
                    messageQueue(loc('tech_lake_analysis_fasting'),'info',false,['progress','hell']);
                }
                return true;
            }
            return false;
        }
    },
};
