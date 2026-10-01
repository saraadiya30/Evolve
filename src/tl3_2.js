import { loc } from './locale.js';
import { global, save } from './vars.js';
import { calcPrestige, messageQueue } from './functions.js';
import { checkAffordable, payCosts, initStruct, actions } from './actions.js';
import { descension } from './resets.js';
import { arpa } from './arpa.js';
import { traitCostMod, renderPsychicPowers } from './races.js';
import { defineGovernor } from './governor.js';
import { setPowerGrid, defineIndustry } from './industry.js';
import { unlockFeat, unlockAchieve } from './achieve.js';
import { govTitle } from './civics.js';

// Bagian dari techsPart3 (20 entri: final_ingredient .. quantum_computing), dipisah dari techs_part3.js. Urutan entri sama persis.
export const techsPart3Part2 = {
    final_ingredient: {
        title: loc('tech_final_ingredient'),
        desc: loc('tech_final_ingredient'),
        cost: {
            Bolognium(){ return 50000000; },
            Demonic_Essence(){ return 1; }
        },
        effect(){
            return `${loc('tech_final_ingredient_effect')}
            ${global.race['witch_hunter'] ? `<div class="has-text-warning">${loc('dish_witch_hunter_interaction', [loc('tech_outerplane_summon'), loc('portal_devilish_dish_title')])}</div>` : ""}
            <div class="has-text-special">${loc('tech_demonic_infusion_effect2',[calcPrestige('descend').artifact])}</div>`;
        },
        action(){
            // Check affordability without paying the Demonic Essence to avoid breaking the backup save
            if (checkAffordable($(this)[0])){
                descension();
            }
            return false;
        }
    },
    bioscience: {
        title: loc('tech_bioscience'),
        desc: loc('tech_bioscience_desc'),
        cost: {
            Knowledge(){ return 67500; }
        },
        effect: loc('tech_bioscience_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.biolab);
                return true;
            }
            return false;
        }
    },
    genetics: {
        title: loc('tech_genetics'),
        desc: loc('tech_genetics'),
        cost: {
            Knowledge(){ return 108000; }
        },
        effect: loc('tech_genetics_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.settings.arpa.genetics = true;
                if (!global.arpa['sequence']){
                    global.arpa['sequence'] = {
                        max: 50000,
                        progress: 0,
                        time: 50000,
                        on: global.race['cataclysm'] || global.race['orbit_decayed'] ? false : true,
                        boost: false,
                        auto: false,
                        labs: 0,
                    };
                }
                return true;
            }
            return false;
        },
        post(){
            arpa('Genetics');
        }
    },
    crispr: {
        title: loc('tech_crispr'),
        desc: loc('tech_crispr'),
        cost: {
            Knowledge(){ return 125000; }
        },
        effect(){ return global.race['artifical'] ? loc('tech_crispr_effect_artifical') : loc('tech_crispr_effect'); },
        action(){
            if (payCosts($(this)[0])){
                global.settings.arpa.crispr = true;
                global.settings.arpa.arpaTabs = 2;
                return true;
            }
            return false;
        },
        post(){
            arpa('Genetics');
            arpa('Crispr');
        }
    },
    shotgun_sequencing: {
        title: loc('tech_shotgun_sequencing'),
        desc(){ return global.race['artifical'] ? loc('tech_shotgun_sequencing_desc_artifical') : loc('tech_shotgun_sequencing_desc'); },
        cost: {
            Knowledge(){ return 165000; }
        },
        effect(){ return global.race['artifical'] ? loc('tech_shotgun_sequencing_effect_artifical') : loc('tech_shotgun_sequencing_effect'); },
        action(){
            if (payCosts($(this)[0])){
                global.arpa.sequence.boost = true;
                return true;
            }
            return false;
        },
        post(){
            arpa('Genetics');
        }
    },
    de_novo_sequencing: {
        title: loc('tech_de_novo_sequencing'),
        desc: loc('tech_de_novo_sequencing'),
        cost: {
            Knowledge(){ return 220000; }
        },
        effect(){ return global.race['artifical'] ? loc('tech_de_novo_sequencing_effect_artifical') : loc('tech_de_novo_sequencing_effect'); },
        action(){
            if (payCosts($(this)[0])){
                global.resource.Genes.display = true;
                return true;
            }
            return false;
        },
        post(){
            arpa('Genetics');
        }
    },
    dna_sequencer: {
        title(){ return global.race['artifical'] ? loc('tech_code_sequencer') : loc('tech_dna_sequencer'); },
        desc(){ return global.race['artifical'] ? loc('tech_code_sequencer') : loc('tech_dna_sequencer'); },
        cost: {
            Knowledge(){ return 300000; }
        },
        effect(){ return global.race['artifical'] ? loc('tech_code_sequencer_effect') : loc('tech_dna_sequencer_effect'); },
        action(){
            if (payCosts($(this)[0])){
                global.arpa.sequence.auto = true;
                return true;
            }
            return false;
        },
        post(){
            arpa('Genetics');
        }
    },
    rapid_sequencing: {
        title(){ return global.race['artifical'] ? loc('tech_agile_development') : loc('tech_rapid_sequencing'); },
        desc(){ return global.race['artifical'] ? loc('tech_agile_development') : loc('tech_rapid_sequencing'); },
        cost: {
            Knowledge(){ return 800000; }
        },
        effect(){ return global.race['artifical'] ? loc('tech_agile_development_effect') : loc('tech_rapid_sequencing_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    mad_science: {
        title(){ return global.race.universe === 'magic' ? loc('tech_sages') : loc('tech_mad_science'); },
        desc(){ return global.race.universe === 'magic' ? loc('tech_sages') : loc('tech_mad_science'); },
        cost: {
            Money(){ return 10000; },
            Mana(){ return global.race.universe === 'magic' ? 50 : 0; },
            Knowledge(){ return traitCostMod('stubborn',6750); },
            Crystal(){ return global.race.universe === 'magic' ? 1000 : 0; },
            Aluminium(){ return 750; }
        },
        effect(){ return global.race.universe === 'magic' ? loc('tech_sages_effect') : loc('tech_mad_science_effect'); },
        action(){
            if (payCosts($(this)[0])){
                if (global.race['terrifying']){
                    global.civic['taxes'].display = true;
                }
                initStruct(actions.city.wardenclyffe);
                return true;
            }
            return false;
        },
        post(){
            if (global.race['terrifying']){
                defineGovernor();
            }
        }
    },
    electricity: {
        title: loc('tech_electricity'),
        desc: loc('tech_electricity'),
        cost: {
            Knowledge(){ return traitCostMod('stubborn',13500); },
            Copper(){ return 1000; }
        },
        effect: loc('tech_electricity_effect'),
        action(){
            if (payCosts($(this)[0])){
                messageQueue(loc('tech_electricity_msg'),'info',false,['progress']);
                global.city['power'] = 0;
                global.city['powered'] = true;
                initStruct(actions.city.coal_power);
                global.settings.showPowerGrid = true;
                setPowerGrid();
                return true;
            }
            return false;
        }
    },
    matter_replicator: {
        title(){ return global.race.universe === 'antimatter' && !global.race['amexplode'] ? loc('tech_antireplicator') : loc('tech_replicator'); },
        desc(){ return global.race.universe === 'antimatter' && !global.race['amexplode'] ? loc('tech_antireplicator') : loc('tech_replicator'); },
        condition(){ return global.stats.achieve['adam_eve'] && global.stats.achieve.adam_eve.l >= 5 ? true : false; },
        cost: {
            Knowledge(){ return 25000; },
        },
        effect(){ return global.race.universe === 'antimatter' && !global.race['amexplode'] ? loc('tech_antireplicator_effect_alt') : loc('tech_replicator_effect_alt'); },
        action(){
            if (payCosts($(this)[0])){
                if (global.race.universe === 'antimatter' && global.race['amexplode']){
                    unlockFeat('annihilation');
                    save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
                    $('body').addClass('nuke');
                    let nuke = $('<div class="nuke"></div>');
                    $('body').append(nuke);
                    setTimeout(function(){
                        nuke.addClass('burn');
                    }, 500);
                    setTimeout(function(){
                        nuke.addClass('b');
                    }, 600);
                    setTimeout(function(){
                        window.soft_reset();
                    }, 4000);
                }
                else {
                    global.race['replicator'] = { res: 'Stone', pow: 1 };
                }
                return true;
            }
            return false;
        },
        post(){
            defineIndustry();
            defineGovernor();
        }
    },
    industrialization: {
        title: loc('tech_industrialization'),
        desc: loc('tech_industrialization'),
        cost: {
            Knowledge(){ return traitCostMod('stubborn',25200); }
        },
        effect: loc('tech_industrialization_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.resource.Titanium.display = true;
                initStruct(actions.city.factory);
                return true;
            }
            return false;
        },
        post(){
            renderPsychicPowers();
        }
    },
    electronics: {
        title: loc('tech_electronics'),
        desc: loc('tech_electronics'),
        cost: {
            Knowledge(){ return traitCostMod('stubborn',50000); }
        },
        effect: loc('tech_electronics_effect'),
        action(){
            if (payCosts($(this)[0])){
                if (global.race['terrifying']){
                    global.tech['gambling'] = 1;
                    initStruct(actions.city.casino);
                    initStruct(actions.space.spc_hell.spc_casino);
                }
                return true;
            }
            return false;
        }
    },
    fission: {
        title: loc('tech_fission'),
        desc: loc('tech_fission'),
        cost: {
            Knowledge(){ return traitCostMod('stubborn',77400); },
            Uranium(){ return 10; }
        },
        effect: loc('tech_fission_effect'),
        action(){
            if (payCosts($(this)[0])){
                messageQueue(loc('tech_fission_msg'),'info',false,['progress']);
                initStruct(actions.city.fission_power);
                return true;
            }
            return false;
        }
    },
    arpa: {
        title: loc('tech_arpa'),
        desc: loc('tech_arpa_desc'),
        cost: {
            Knowledge(){ return traitCostMod('stubborn',90000); }
        },
        effect: loc('tech_arpa_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.settings.showGenetics = true;
                global.settings.arpa.physics = true;
                if (global.race['truepath'] && !global.tech['unify']){
                    global.tech['unify'] = 1;
                }
                return true;
            }
            return false;
        },
        post(){
            arpa('Physics');
        }
    },
    rocketry: {
        title: loc('tech_rocketry'),
        desc: loc('tech_rocketry'),
        cost: {
            Knowledge(){ return traitCostMod('stubborn',112500); },
            Oil(){ return global.city.ptrait.includes('dense') ? 8000 : 6800; }
        },
        effect: loc('tech_rocketry_effect'),
        action(){
            if (payCosts($(this)[0])){
                if (global.race['truepath'] && !global.tech['rival']){
                    global.tech['rival'] = 1;
                    messageQueue(loc(`civics_rival_unlocked`,[govTitle(3)]),'info',false,['progress','combat']);
                }
                return true;
            }
            return false;
        },
        post(){
            arpa('Physics');
        }
    },
    robotics: {
        title: loc('tech_robotics'),
        desc: loc('tech_robotics'),
        cost: {
            Knowledge(){ return traitCostMod('stubborn',125000); }
        },
        effect: loc('tech_robotics_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    lasers: {
        title: loc('tech_lasers'),
        desc: loc('tech_lasers_desc'),
        cost: {
            Knowledge(){ return traitCostMod('stubborn',280000); },
            Elerium(){ return 100; }
        },
        effect: loc('tech_lasers_effect'),
        action(){
            if (payCosts($(this)[0])){
                if (global.race['cataclysm']){
                    unlockAchieve('iron_will',false,3);
                }
                return true;
            }
            return false;
        }
    },
    artifical_intelligence: {
        title: loc('tech_artificial_intelligence'),
        desc: loc('tech_artificial_intelligence'),
        cost: {
            Knowledge(){ return traitCostMod('stubborn',325000); }
        },
        effect: loc('tech_artificial_intelligence_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        flair(){
            return loc('tech_artificial_intelligence_flair');
        }
    },
    quantum_computing: {
        title: loc('tech_quantum_computing'),
        desc: loc('tech_quantum_computing'),
        cost: {
            Knowledge(){ return traitCostMod('stubborn',435000); },
            Elerium(){ return 250 },
            Nano_Tube(){ return 100000 }
        },
        effect: loc('tech_quantum_computing_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        flair(){
            return loc('tech_quantum_computing_flair');
        }
    },
};
