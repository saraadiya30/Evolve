import { global, save } from './vars.js';
import { loc } from './locale.js';
import { calcPrestige, messageQueue, popCost } from './functions.js';
import { unlockAchieve, unlockFeat } from './achieve.js';
import { payCosts, wardenLabel, checkAffordable, actions, initStruct } from './actions.js';
import { renderPsychicPowers, traitCostMod } from './races.js';
import { jobName } from './jobs.js';
import { govTitle } from './civics.js';
import { planetName } from './space.js';
import { arpa } from './arpa.js';
import { setPowerGrid, defineIndustry } from './industry.js';
import { defineGovernor } from './governor.js';
import { descension } from './resets.js';

// Bagian 3 dari techs: HANYA logika/teks dinamis (title, desc, cost, action, effect, condition, post, wiki, flair). Field statis ada di techs_data.js
export const techsPart3 = {
    xeno_tourism: {
        title: loc('tech_xeno_tourism'),
        desc: loc('tech_xeno_tourism'),
        cost: {
            Knowledge(){ return 8000000; }
        },
        effect: loc('tech_xeno_tourism_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    science: {
        title: loc('tech_science'),
        desc: loc('tech_science_desc'),
        cost: {
            Knowledge(){ return traitCostMod('stubborn',65); }
        },
        effect: loc('tech_science_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.university);
                return true;
            }
            return false;
        }
    },
    library: {
        title: loc('tech_library'),
        desc: loc('tech_library_desc'),
        cost: {
            Knowledge(){ return traitCostMod('stubborn',720); }
        },
        effect: loc('tech_library_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.library);
                return true;
            }
            return false;
        }
    },
    thesis: {
        title: loc('tech_thesis'),
        desc: loc('tech_thesis_desc'),
        cost: {
            Knowledge(){ return traitCostMod('stubborn',1125); }
        },
        effect: loc('tech_thesis_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    research_grant: {
        title: loc('tech_research_grant'),
        desc: loc('tech_research_grant_desc'),
        cost: {
            Knowledge(){ return traitCostMod('stubborn',3240); }
        },
        effect: loc('tech_research_grant_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    scientific_journal: {
        title(){ return global.race.universe === 'magic' ? loc('tech_magic_tomes') : loc('tech_scientific_journal'); },
        desc(){ return global.race.universe === 'magic' ? loc('tech_magic_tomes_desc') : loc('tech_scientific_journal_desc'); },
        cost: {
            Knowledge(){ return traitCostMod('stubborn',27000); }
        },
        effect(){ return global.race.universe === 'magic' ? loc('tech_magic_tomes_effect') : loc('tech_scientific_journal_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    adjunct_professor: {
        title: loc('tech_adjunct_professor'),
        desc: loc('tech_adjunct_professor'),
        cost: {
            Knowledge(){ return traitCostMod('stubborn',36000); }
        },
        effect(){ return loc('tech_adjunct_professor_effect',[wardenLabel(),global.civic.scientist ? global.civic.scientist.name : jobName('scientist')]); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    tesla_coil: {
        title: loc('tech_tesla_coil'),
        desc: loc('tech_tesla_coil_desc'),
        cost: {
            Knowledge(){ return traitCostMod('stubborn',51750); }
        },
        effect(){ return loc('tech_tesla_coil_effect',[wardenLabel()]); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    internet: {
        title: loc('tech_internet'),
        desc: loc('tech_internet'),
        cost: {
            Knowledge(){ return traitCostMod('stubborn',61200); }
        },
        effect: loc('tech_internet_effect'),
        action(){
            if (payCosts($(this)[0])){
                if (global.race['toxic'] && global.race.species === 'troll'){
                    unlockAchieve('godwin');
                }
                return true;
            }
            return false;
        }
    },
    observatory: {
        title: loc('tech_observatory'),
        desc: loc('tech_observatory'),
        cost: {
            Knowledge(){ return traitCostMod('stubborn',148000); }
        },
        effect: loc('tech_observatory_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_moon.observatory);
                return true;
            }
            return false;
        }
    },
    world_collider: {
        title: loc('tech_world_collider'),
        desc: loc('tech_world_collider'),
        cost: {
            Knowledge(){ return traitCostMod('stubborn',350000); }
        },
        effect(){ return loc('tech_world_collider_effect',[planetName().dwarf]); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_dwarf.world_collider);
                initStruct(actions.space.spc_dwarf.world_controller);
                return true;
            }
            return false;
        },
        flair: `<div>${loc('tech_world_collider_flair1')}</div><div>${loc('tech_world_collider_flair2')}</div>`
    },
    laboratory: {
        title(){ return global.race.universe === 'magic' ? loc('tech_sanctum') : loc('tech_laboratory'); },
        desc(){ return global.race.universe === 'magic' ? loc('tech_sanctum') : loc('tech_laboratory_desc'); },
        cost: {
            Knowledge(){ return traitCostMod('stubborn',500000); }
        },
        effect(){ return global.race.universe === 'magic' ? loc('tech_sanctum_effect') : loc('tech_laboratory_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.interstellar.int_alpha.laboratory);
                return true;
            }
            return false;
        },
        flair(){ return global.race.universe === 'magic' ? loc('tech_sanctum_flair') : loc('tech_laboratory_flair'); }
    },
    virtual_assistant: {
        title: loc('tech_virtual_assistant'),
        desc: loc('tech_virtual_assistant'),
        cost: {
            Knowledge(){ return traitCostMod('stubborn',635000); }
        },
        effect(){ return global.race.universe === 'magic' ? loc('tech_virtual_assistant_magic_effect') : loc('tech_virtual_assistant_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    dimensional_readings: {
        title: loc('tech_dimensional_readings'),
        desc: loc('tech_dimensional_readings'),
        cost: {
            Knowledge(){ return traitCostMod('stubborn',750000); }
        },
        effect(){ return loc('tech_dimensional_readings_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    quantum_entanglement: {
        title: loc('tech_quantum_entanglement'),
        desc: loc('tech_quantum_entanglement'),
        cost: {
            Knowledge(){ return traitCostMod('stubborn',850000); },
            Neutronium(){ return 7500; },
            Soul_Gem(){ return 2; }
        },
        effect(){ return loc('tech_quantum_entanglement_effect',[2, global.race.universe === 'magic' ? loc('tech_sanctum') : loc('interstellar_laboratory_title'), wardenLabel()]); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    expedition: {
        title(){ return global.race.universe === 'magic' ? loc('tech_expedition_wiz') : loc('tech_expedition'); },
        desc(){ return global.race.universe === 'magic' ? loc('tech_expedition_wiz') : loc('tech_expedition'); },
        cost: {
            Knowledge(){ return traitCostMod('stubborn',5350000); }
        },
        effect(){ return global.race.universe === 'magic' ? loc('tech_expedition_wiz_effect') : loc('tech_expedition_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    subspace_sensors: {
        title: loc('tech_subspace_sensors'),
        desc: loc('tech_subspace_sensors'),
        cost: {
            Knowledge(){ return traitCostMod('stubborn',6000000); }
        },
        effect(){ return loc('tech_subspace_sensors_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    alien_database: {
        title: loc('tech_alien_database'),
        desc: loc('tech_alien_database'),
        cost: {
            Knowledge(){ return traitCostMod('stubborn',8250000); }
        },
        effect(){ return loc('tech_alien_database_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    orichalcum_capacitor: {
        title: loc('tech_orichalcum_capacitor'),
        desc: loc('tech_orichalcum_capacitor'),
        cost: {
            Knowledge(){ return traitCostMod('stubborn',12500000); },
            Orichalcum(){ return 250000; }
        },
        effect(){ return loc('tech_orichalcum_capacitor_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    advanced_biotech: {
        title: loc('tech_advanced_biotech'),
        desc: loc('tech_advanced_biotech'),
        cost: {
            Knowledge(){ return traitCostMod('stubborn',25500000); }
        },
        effect(){ return loc('tech_advanced_biotech_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    codex_infinium: {
        title: loc('tech_codex_infinium'),
        desc: loc('tech_codex_infinium'),
        cost: {
            Knowledge(){ return traitCostMod('stubborn',40100000); },
            Codex(){ return 1; }
        },
        effect(){ return loc('tech_codex_infinium_effect'); },
        action(){
            if (payCosts($(this)[0])){
                global.resource.Codex.display = false;
                return true;
            }
            return false;
        }
    },
    spirit_box: {
        title: loc('tech_spirit_box'),
        desc: loc('tech_spirit_box'),
        cost: {
            Knowledge(){ return 62750000; },
            Asphodel_Powder(){ return 10000; },
        },
        effect(){ return loc('tech_spirit_box_effect'); },
        action(){
            if (payCosts($(this)[0])){
                global.resource.Omniscience.display = true;
                return true;
            }
            return false;
        }
    },
    spirit_researcher: {
        title: loc('tech_spirit_researcher'),
        desc: loc('tech_spirit_researcher'),
        cost: {
            Knowledge(){ return 80000000; },
            Omniscience(){ return 12500; },
        },
        effect(){ return loc('tech_spirit_researcher_effect',[global.civic.scientist ? global.civic.scientist.name : jobName('scientist')]); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    dimensional_tap: {
        title: loc('tech_dimensional_tap'),
        desc: loc('tech_dimensional_tap'),
        cost: {
            Knowledge(){ return 87500000; },
            Omniscience(){ return 13333; },
        },
        effect(){ return loc('tech_dimensional_tap_effect'); },
        action(){
            if (payCosts($(this)[0])){
                global.eden.encampment.asc = true;
                return true;
            }
            return false;
        },
        flair(){ return loc(`tech_dimensional_tap_flair`); }
    },
    devilish_dish: {
        title: loc('tech_devilish_dish'),
        desc: loc('tech_devilish_dish'),
        cost: {
            Knowledge(){ return 29000000; }
        },
        effect(){return loc('tech_devilish_dish_effect');},
        action(){
            if (payCosts($(this)[0])){
                if(global.tech['hell_lake'] >= 3){
                    messageQueue(loc('tech_lake_analysis_fasting'),'info',false,['progress','hell']);
                }
                return true;
            }
            return false;
        }
    },
    hell_oven: {
        title: loc('tech_hell_oven'),
        desc: loc('tech_hell_oven'),
        cost: {
            Knowledge(){ return 32000000; }
        },
        effect(){return loc('tech_hell_oven_effect');},
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.portal.prtl_lake.oven);
                return true;
            }
            return false;
        }
    },
    preparation_methods:{
        title: loc('tech_preparation_methods'),
        desc: loc('tech_preparation_methods'),
        cost: {
            Knowledge(){ return 62000000; }
        },
        effect(){return loc('tech_preparation_methods_effect');},
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.portal.prtl_lake.dish_soul_steeper);
                initStruct(actions.portal.prtl_lake.dish_life_infuser);
                return true;
            }
            return false;
        }
    },
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
    lake_threat: {
        title: loc('tech_lake_threat'),
        desc: loc('tech_lake_threat'),
        cost: {
            Knowledge(){ return 34500000; },
        },
        effect(){ return loc('tech_lake_threat_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.portal.prtl_lake.bireme);
                messageQueue(loc('tech_lake_threat_result'),'info',false,['progress','hell']);
                return true;
            }
            return false;
        }
    },
    lake_transport: {
        title: loc('tech_lake_transport'),
        desc: loc('tech_lake_transport'),
        cost: {
            Knowledge(){ return 35000000; },
        },
        effect(){ return loc('tech_lake_transport_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.portal.prtl_lake.transport);
                return true;
            }
            return false;
        }
    },
    cooling_tower: {
        title: loc('tech_cooling_tower'),
        desc: loc('tech_cooling_tower'),
        cost: {
            Knowledge(){ return 37500000; },
        },
        effect(){ return loc('tech_cooling_tower_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.portal.prtl_lake.cooling_tower);
                return true;
            }
            return false;
        }
    },
    miasma: {
        title: loc('tech_miasma'),
        desc: loc('tech_miasma'),
        cost: {
            Knowledge(){ return 38250000; },
        },
        effect(){ return loc('tech_miasma_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.portal.prtl_spire.port);
                return true;
            }
            return false;
        }
    },
    incorporeal: {
        title: loc('tech_incorporeal'),
        desc: loc('tech_incorporeal'),
        cost: {
            Knowledge(){ return 17500000; },
            Phage(){ return 25; }
        },
        effect(){ return loc('tech_incorporeal_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    tech_ascension: {
        title: loc('tech_ascension'),
        desc: loc('tech_ascension'),
        cost: {
            Knowledge(){ return 18500000; },
            Plasmid(){ return 100; }
        },
        effect(){ return loc('tech_ascension_effect'); },
        action(){
            if (payCosts($(this)[0])){
                global.settings.space.sirius = true;
                return true;
            }
            return false;
        }
    },
    terraforming: {
        title: loc('tech_terraforming'),
        desc: loc('tech_terraforming'),
        cost: {
            Knowledge(){ return 18000000; },
        },
        effect(){ return loc('tech_terraforming_effect',[planetName().red]); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_red.terraformer);
                return true;
            }
            return false;
        }
    },
    cement_processing: {
        title: loc('tech_cement_processing'),
        desc: loc('tech_cement_processing'),
        cost: {
            Knowledge(){ return 1750000; },
        },
        effect: loc('tech_cement_processing_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    adamantite_processing_flier: {
        title: loc('tech_adamantite_processing'),
        desc: loc('tech_adamantite_processing'),
        cost: {
            Knowledge(){ return 2000000; },
        },
        effect: loc('tech_adamantite_processing_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    adamantite_processing: {
        title: loc('tech_adamantite_processing'),
        desc: loc('tech_adamantite_processing'),
        cost: {
            Knowledge(){ return 2000000; },
        },
        effect: loc('tech_adamantite_processing_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    graphene_processing: {
        title: loc('tech_graphene_processing'),
        desc: loc('tech_graphene_processing'),
        cost: {
            Knowledge(){ return 2500000; },
        },
        effect: loc('tech_graphene_processing_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    crypto_mining: {
        title: loc('tech_crypto_mining'),
        desc: loc('tech_crypto_mining'),
        cost: {
            Money(){ return 30000000000; },
            Knowledge(){ return 135000000; },
            Omniscience(){ return 45000; },
        },
        effect: loc('tech_crypto_mining_effect',[loc('interstellar_citadel_title')]),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    fusion_power: {
        title: loc('tech_fusion_power'),
        desc: loc('tech_fusion_power'),
        cost: {
            Knowledge(){ return 640000; }
        },
        effect: loc('tech_fusion_power_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.interstellar.int_alpha.fusion);
                return true;
            }
            return false;
        }
    },
    infernium_power: {
        title: loc('tech_infernium_power'),
        desc: loc('tech_infernium_power'),
        cost: {
            Knowledge(){ return 30000000; }
        },
        effect: loc('tech_infernium_power_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.portal.prtl_ruins.inferno_power);
                return true;
            }
            return false;
        }
    },
    thermomechanics: {
        title: loc('tech_thermomechanics'),
        desc: loc('tech_thermomechanics_desc'),
        cost: {
            Knowledge(){ return 60000; },
        },
        effect(){ return loc('tech_thermomechanics_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    quantum_manufacturing: {
        title: loc('tech_quantum_manufacturing'),
        desc: loc('tech_quantum_manufacturing'),
        cost: {
            Knowledge(){ return 465000; }
        },
        effect: loc('tech_quantum_manufacturing_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    worker_drone: {
        title: loc('tech_worker_drone'),
        desc: loc('tech_worker_drone'),
        cost: {
            Knowledge(){ return 400000; },
        },
        effect(){ return loc('tech_worker_drone_effect',[planetName().gas_moon]); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_gas_moon.drone);
                return true;
            }
            return false;
        }
    },
    uranium: {
        title: loc('tech_uranium'),
        desc: loc('tech_uranium'),
        cost: {
            Knowledge(){ return 72000; }
        },
        effect: loc('tech_uranium_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.resource.Uranium.display = true;
                return true;
            }
            return false;
        },
        post(){
            renderPsychicPowers();
        }
    },
    uranium_storage: {
        title: loc('tech_uranium_storage'),
        desc: loc('tech_uranium_storage'),
        cost: {
            Knowledge(){ return 75600; },
            Alloy(){ return 2500; }
        },
        effect: loc('tech_uranium_storage_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    uranium_ash: {
        title: loc('tech_uranium_ash'),
        desc: loc('tech_uranium_ash'),
        cost: {
            Knowledge(){ return 122000; }
        },
        effect: loc('tech_uranium_ash_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    breeder_reactor: {
        title: loc('tech_breeder_reactor'),
        desc: loc('tech_breeder_reactor'),
        cost: {
            Knowledge(){ return 160000; },
            Uranium(){ return 250; },
            Iridium(){ return 1000; }
        },
        effect: loc('tech_breeder_reactor_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
};
