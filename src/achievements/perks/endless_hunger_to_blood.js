import { loc } from '../../core/locale.js';
import { global } from '../../core/vars.js';
import { actions } from '../../core/registries.js';
import { CREEP_GENE_PER_LEVEL } from '../../config/constants.js';

// Bagian dari perkList (23 entri: endless_hunger .. blood), dipisah dari achieve.js. Urutan entri sama persis.
export const perkListPart2 = {
    endless_hunger: {
        name: loc(`achieve_endless_hunger_name`),
        group: [
            {
                desc(){
                    return loc("achieve_perks_endless_hunger1");
                },
                active(){
                    return global.stats.achieve['endless_hunger'] && global.stats.achieve.endless_hunger.l >= 1 ? true : false;
                }
            },
            {
                desc(){
                    return loc("achieve_perks_endless_hunger2");
                },
                active(){
                    return global.stats.achieve['endless_hunger'] && global.stats.achieve.endless_hunger.l >= 2 ? true : false;
                }
            },
            {
                desc(){
                    return loc("achieve_perks_endless_hunger3");
                },
                active(){
                    return global.stats.achieve['endless_hunger'] && global.stats.achieve.endless_hunger.l >= 3 ? true : false;
                }
            },
            {
                desc(){
                    return loc("achieve_perks_endless_hunger4");
                },
                active(){
                    return global.stats.achieve['endless_hunger'] && global.stats.achieve.endless_hunger.l >= 4 ? true : false;
                }
            },
            {
                desc(){
                    return loc("achieve_perks_endless_hunger5");
                },
                active(){
                    return global.stats.achieve['endless_hunger'] && global.stats.achieve.endless_hunger.l >= 5 ? true : false;
                }
            }
        ],
        notes: [
            loc(`wiki_perks_achievement_note`,[`<span class="has-text-caution">${loc(`achieve_endless_hunger_name`)}</span>`]),
            loc(`wiki_perks_achievement_note_task`,[`<span class="has-text-caution">${loc(`achieve_endless_hunger_name`)}</span>`]),
            loc(`wiki_perks_achievement_note_task_num`,[1,`<span class="has-text-${global.stats.endless_hunger.b1.l ? `success` : `danger`}">${loc(`wiki_achieve_endless_hunger1`)}</span>`]),
            loc(`wiki_perks_achievement_note_task_num`,[2,`<span class="has-text-${global.stats.endless_hunger.b2.l ? `success` : `danger`}">${loc(`wiki_achieve_endless_hunger2`)}</span>`]),
            loc(`wiki_perks_achievement_note_task_num`,[3,`<span class="has-text-${global.stats.endless_hunger.b3.l ? `success` : `danger`}">${loc(`wiki_achieve_endless_hunger3`,[80])}</span>`]),
            loc(`wiki_perks_achievement_note_task_num`,[4,`<span class="has-text-${global.stats.endless_hunger.b4.l ? `success` : `danger`}">${loc(`wiki_achieve_endless_hunger4`,[1200])}</span>`]),
            loc(`wiki_perks_achievement_note_task_num`,[5,`<span class="has-text-${global.stats.endless_hunger.b5.l ? `success` : `danger`}">${loc(`wiki_achieve_endless_hunger5`)}</span>`])
        ]
    },
    gladiator: {
        name: loc(`achieve_gladiator_name`),
        desc(wiki){
            let mech = wiki ? "20/40/60/80/100" : global.stats.achieve['gladiator'] ? global.stats.achieve.gladiator.l * 20 : 20;
            return loc("achieve_perks_gladiator",[mech]);
        },
        active(){
            return global.stats.achieve['gladiator'] && global.stats.achieve.gladiator.l >= 1 ? true : false;
        },
        notes: [
            loc(`wiki_perks_achievement_note`,[`<span class="has-text-caution">${loc(`achieve_gladiator_name`)}</span>`]),
            loc(`wiki_perks_achievement_note_scale`,[`<span class="has-text-caution">${loc(`achieve_gladiator_name`)}</span>`])
        ]
    },
    what_is_best: {
        name: loc(`achieve_what_is_best_name`),
        group: [
            {
                desc(){
                    return loc("achieve_perks_what_is_best1",[actions.portal.prtl_ruins.hell_forge.title(),'20%']);
                },
                active(){
                    return global.stats.achieve['what_is_best'] && global.stats.achieve.what_is_best.e >= 1 ? true : false;
                }
            },
            {
                desc(){
                    return loc("achieve_perks_what_is_best2",[actions.portal.prtl_spire.purifier.title(),'25 MW']);
                },
                active(){
                    return global.stats.achieve['what_is_best'] && global.stats.achieve.what_is_best.e >= 2 ? true : false;
                }
            },
            {
                desc(){
                    return loc("achieve_perks_what_is_best3",[actions.portal.prtl_pit.soul_forge.title(),actions.portal.prtl_pit.soul_attractor.title(),'1%']);
                },
                active(){
                    return global.stats.achieve['what_is_best'] && global.stats.achieve.what_is_best.e >= 3 ? true : false;
                }
            },
            {
                desc(){
                    return loc("achieve_perks_what_is_best4",[actions.portal.prtl_lake.transport.title(),3]);
                },
                active(){
                    return global.stats.achieve['what_is_best'] && global.stats.achieve.what_is_best.e >= 4 ? true : false;
                }
            },
            {
                desc(){
                    return loc("achieve_perks_what_is_best5");
                },
                active(){
                    return global.stats.achieve['what_is_best'] && global.stats.achieve.what_is_best.e >= 5 ? true : false;
                }
            }
        ],
        notes: [
            loc(`wiki_perks_achievement_note`,[`<span class="has-text-caution">${loc(`achieve_what_is_best_name`)}</span>`]),
            loc(`wiki_perks_achievement_note_task`,[`<span class="has-text-caution">${loc(`achieve_what_is_best_name`)}</span>`]),
            loc(`wiki_perks_achievement_note_task_num`,[1,`<span class="has-text-${global.stats.warlord.k ? `success` : `danger`}">${loc(`wiki_achieve_what_is_best_k`,[50])}</span>`]),
            loc(`wiki_perks_achievement_note_task_num`,[2,`<span class="has-text-${global.stats.warlord.p ? `success` : `danger`}">${loc(`wiki_achieve_what_is_best_p`)}</span>`]),
            loc(`wiki_perks_achievement_note_task_num`,[3,`<span class="has-text-${global.stats.warlord.a ? `success` : `danger`}">${loc(`wiki_achieve_what_is_best_a`,[250])}</span>`]),
            loc(`wiki_perks_achievement_note_task_num`,[4,`<span class="has-text-${global.stats.warlord.r ? `success` : `danger`}">${loc(`wiki_achieve_what_is_best_r`)}</span>`]),
            loc(`wiki_perks_achievement_note_task_num`,[5,`<span class="has-text-${global.stats.warlord.g ? `success` : `danger`}">${loc(`wiki_achieve_what_is_best_g`)}</span>`])
        ]
    },
    pathfinder: {
        name: loc(`achieve_pathfinder_name`),
        group: [
            {
                desc(){
                    return loc("achieve_perks_pathfinder1",[10]);
                },
                active(){
                    return global.stats.achieve['pathfinder'] && global.stats.achieve.pathfinder.l >= 1 ? true : false;
                }
            },
            {
                desc(){
                    return loc("achieve_perks_pathfinder2",[10]);
                },
                active(){
                    return global.stats.achieve['pathfinder'] && global.stats.achieve.pathfinder.l >= 2 ? true : false;
                }
            },
            {
                desc(){
                    return loc("achieve_perks_pathfinder3");
                },
                active(){
                    return global.stats.achieve['pathfinder'] && global.stats.achieve.pathfinder.l >= 3 ? true : false;
                }
            },
            {
                desc(){
                    return loc("achieve_perks_pathfinder4");
                },
                active(){
                    return global.stats.achieve['pathfinder'] && global.stats.achieve.pathfinder.l >= 4 ? true : false;
                }
            },
            {
                desc(){
                    return loc("achieve_perks_pathfinder5");
                },
                active(){
                    return global.stats.achieve['pathfinder'] && global.stats.achieve.pathfinder.l >= 5 ? true : false;
                }
            },
        ],
        notes: [
            loc(`wiki_perks_achievement_note`,[`<span class="has-text-caution">${loc(`achieve_pathfinder_name`)}</span>`]),
            loc(`wiki_perks_achievement_note_pathfinder`,[`<span class="has-text-caution">${loc(`evo_challenge_truepath`)}</span>`]),
            loc(`wiki_perks_achievement_note_pathfinder_reset`,[`<span class="has-text-${global.stats.achieve['ashanddust'] ? 'success' : 'danger'}">${loc(`wiki_resets_mad`)}</span>`]),
            loc(`wiki_perks_achievement_note_pathfinder_reset`,[`<span class="has-text-${global.stats.achieve['exodus'] ? 'success' : 'danger'}">${loc(`wiki_resets_bioseed`)}</span>`]),
            loc(`wiki_perks_achievement_note_pathfinder_reset`,[`<span class="has-text-${global.stats.achieve['obsolete'] ? 'success' : 'danger'}">${loc(`wiki_resets_ai`)}</span>`]),
            loc(`wiki_perks_achievement_note_pathfinder_reset`,[`<span class="has-text-${global.stats.achieve['bluepill'] ? 'success' : 'danger'}">${loc(`wiki_resets_matrix`)}</span>`]),
            loc(`wiki_perks_achievement_note_pathfinder_reset`,[`<span class="has-text-${global.stats.achieve['retired'] ? 'success' : 'danger'}">${loc(`wiki_resets_retired`)}</span>`]),
        ]
    },
    overlord: {
        name: loc(`achieve_overlord_name`),
        desc(){
            let desc = `<div>${loc("achieve_perks_overlord1",[10])}</div>`;
            desc += `<div>${loc("achieve_perks_overlord2")}</div>`;
            desc += `<div>${loc("achieve_perks_overlord3")}</div>`;
            desc += `<div>${loc("achieve_perks_overlord4")}</div>`;
            return desc;
        },
        active(){
            return global.stats.achieve['overlord'] && global.stats.achieve.overlord.l >= 5 ? true : false;
        },
        notes: [
            loc(`wiki_perks_achievement_note`,[`<span class="has-text-caution">${loc(`achieve_overlord_name`)}</span>`]),
        ]
    },
    adam_eve: {
        name: loc(`achieve_adam_eve_name`),
        desc(){
            return loc(`achieve_perks_adam_eve`);
        },
        active(){
            return global.stats.achieve['adam_eve'] && global.stats.achieve.adam_eve.l >= 5 ? true : false;
        },
        notes: []
    },
    creep: {
        name: loc(`wiki_arpa_crispr_creep`),
        desc(wiki){
            let bonus = wiki ? "0.01/0.02/0.03/0.04/0.05" : global.genes['creep'] ? global.genes.creep * CREEP_GENE_PER_LEVEL : 0;
            return loc("arpa_perks_creep",[bonus]);
        },
        active(){
            return global.genes['creep'] ? true : false;
        },
        notes: [
            loc(`wiki_perks_crispr_note`,[`<span class="has-text-caution">${loc(`arpa_genepool_genetic_memory_title`)}</span>`]),
            loc(`wiki_perks_crispr_note_upgrade`,[ 
                [
                    `<span class="has-text-caution">${loc(`arpa_genepool_animus_title`)}</span>`,
                    `<span class="has-text-caution">${loc(`arpa_genepool_divine_remembrance_title`)}</span>`,
                    `<span class="has-text-caution">${loc(`arpa_genepool_divine_proportion_title`)}</span>`,
                    `<span class="has-text-caution">${loc(`arpa_genepool_genetic_repository_title`)}</span>`
                ].join(', ')
            ])
        ]
    },
    store: {
        name: loc(`wiki_arpa_crispr_store`),
        desc(wiki){
            let psb = wiki ? "0.04/0.06/0.08" : global.genes['store'] && global.genes.store > 1 ? (global.genes.store === 2 ? 0.06 : 0.08) : 0.04;
            return loc(global.genes['store'] && global.genes.store >= 4 ? "arpa_perks_store2" : "arpa_perks_store1",[psb]);
        },
        active(){
            return global.genes['store'] ? true : false;
        },
        notes: [
            loc(`wiki_perks_crispr_note`,[`<span class="has-text-caution">${loc(`arpa_genepool_spatial_reasoning_title`)}</span>`]),
            loc(`wiki_perks_crispr_note_upgrade`,[ 
                [
                    `<span class="has-text-caution">${loc(`arpa_genepool_spatial_superiority_title`)}</span>`,
                    `<span class="has-text-caution">${loc(`arpa_genepool_spatial_supremacy_title`)}</span>`,
                    `<span class="has-text-caution">${loc(`arpa_genepool_dimensional_warping_title`)}</span>`
                ].join(', ')
            ])
        ]
    },
    evolve: {
        name: loc(`wiki_arpa_crispr_evolve`),
        group: [
            {
                desc(){
                    return loc("arpa_perks_evolve");
                },
                active(){
                    return global.genes['evolve'] ? true : false;
                }
            },
            {
                desc(){
                    return loc("arpa_genepool_recombination_desc");
                },
                active(){
                    return global.genes['evolve'] && global.genes.evolve >= 2 ? true : false;
                }
            },
            {
                desc(){
                    return loc("arpa_genepool_homologous_recombination_desc");
                },
                active(){
                    return global.genes['evolve'] && global.genes.evolve >= 3 ? true : false;
                }
            },
            {
                desc(){
                    return loc("arpa_genepool_genetic_reshuffling_desc");
                },
                active(){
                    return global.genes['evolve'] && global.genes.evolve >= 4 ? true : false;
                }
            },
            {
                desc(){
                    return loc("arpa_genepool_recombinant_dna_desc");
                },
                active(){
                    return global.genes['evolve'] && global.genes.evolve >= 5 ? true : false;
                }
            },
            {
                desc(){
                    return loc("arpa_genepool_chimeric_dna_desc");
                },
                active(){
                    return global.genes['evolve'] && global.genes.evolve >= 6 ? true : false;
                }
            },
            {
                desc(){
                    return loc("arpa_genepool_molecular_cloning_desc");
                },
                active(){
                    return global.genes['evolve'] && global.genes.evolve >= 7 ? true : false;
                }
            },
            {
                desc(){
                    return loc("arpa_genepool_transgenes_desc");
                },
                active(){
                    return global.genes['evolve'] && global.genes.evolve >= 8 ? true : false;
                }
            }
        ],
        notes: [
            loc(`wiki_perks_crispr_note`,[`<span class="has-text-caution">${loc(`arpa_genepool_morphogenesis_title`)}</span>`]),
            loc(`wiki_perks_crispr_note_upgrade`,[ 
                [
                    `<span class="has-text-caution">${loc(`arpa_genepool_recombination_title`)}</span>`,
                    `<span class="has-text-caution">${loc(`arpa_genepool_homologous_recombination_title`)}</span>`,
                    `<span class="has-text-caution">${loc(`arpa_genepool_genetic_reshuffling_title`)}</span>`,
                    `<span class="has-text-caution">${loc(`arpa_genepool_recombinant_dna_title`)}</span>`,
                    `<span class="has-text-caution">${loc(`arpa_genepool_chimeric_dna_title`)}</span>`,
                    `<span class="has-text-caution">${loc(`arpa_genepool_molecular_cloning_title`)}</span>`,
                    `<span class="has-text-caution">${loc(`arpa_genepool_transgenes_title`)}</span>`
                ].join(', ')
            ])
        ]
    },
    birth: {
        name: loc(`wiki_arpa_crispr_birth`),
        desc(){
            return loc("arpa_perks_birth");
        },
        active(){
            return global.genes['birth'] ? true : false;
        },
        notes: [
            loc(`wiki_perks_crispr_note`,[`<span class="has-text-caution">${loc(`arpa_genepool_replication_title`)}</span>`]),
        ]
    },
    enhance: {
        name: loc(`wiki_arpa_crispr_enhance`),
        desc(){
            return loc("arpa_perks_enhance");
        },
        active(){
            return global.genes['enhance'] ? true : false;
        },
        notes: [
            loc(`wiki_perks_crispr_note`,[`<span class="has-text-caution">${loc(`arpa_genepool_enhanced_muscle_fiber_title`)}</span>`])
        ]
    },
    crafty: {
        name: loc(`wiki_arpa_crispr_crafty`),
        group: [
            {
                desc(){
                    return loc("arpa_genepool_artificer_desc");
                },
                active(){
                    return global.genes['crafty'] ? true : false;
                }
            },
            {
                desc(wiki){
                    let bonus = wiki ? "50/100" : global.genes['crafty'] && global.genes.crafty >= 3 ? 100 : 50;
                    return loc("arpa_genepool_crafting_desc",[bonus]);
                },
                active(){
                    return global.genes['crafty'] && global.genes.crafty >= 2 ? true : false;
                }
            }
        ],
        notes: [
            loc(`wiki_perks_crispr_note`,[`<span class="has-text-caution">${loc(`arpa_genepool_artificer_title`)}</span>`]),
            loc(`wiki_perks_crispr_note_upgrade`,[ 
                [
                    `<span class="has-text-caution">${loc(`arpa_genepool_detail_oriented_title`)}</span>`,
                    `<span class="has-text-caution">${loc(`arpa_genepool_rigorous_title`)}</span>`
                ].join(', ')
            ])
        ]
    },
    governor: {
        name: loc(`wiki_arpa_crispr_governor`),
        desc(){
            return loc("arpa_perks_governor");
        },
        active(){
            return global.genes['governor'] ? true : false;
        },
        notes: [
            loc(`wiki_perks_crispr_note`,[`<span class="has-text-caution">${loc(`arpa_genepool_governance_title`)}</span>`])
        ]
    },
    synthesis: {
        name: loc(`wiki_arpa_crispr_synthesis`),
        desc(wiki){
            let base = wiki ? "2/3/4" : global.genes['synthesis'] && global.genes['synthesis'] >= 2 ? (global.genes['synthesis'] >= 3 ? 4 : 3) : 2;
            let auto = wiki ? "10/25/50" : global.genes['synthesis'] && global.genes['synthesis'] >= 2 ? (global.genes['synthesis'] >= 3 ? 50 : 25) : 10;
            return loc("arpa_genepool_synthesis_desc",[base,auto]);
        },
        active(){
            return global.genes['synthesis'] ? true : false;
        },
        notes: [
            loc(`wiki_perks_crispr_note`,[`<span class="has-text-caution">${loc(`arpa_genepool_synthesis_title`)}</span>`]),
            loc(`wiki_perks_crispr_note_upgrade`,[ 
                [
                    `<span class="has-text-caution">${loc(`arpa_genepool_karyokinesis_title`)}</span>`,
                    `<span class="has-text-caution">${loc(`arpa_genepool_cytokinesis_title`)}</span>`
                ].join(', ')
            ])
        ]
    },
    challenge: {
        name: loc(`wiki_arpa_crispr_challenge`),
        group: [
            {
                desc(){
                    return loc("arpa_perks_challenge");
                },
                active(){
                    return global.genes['challenge'] ? true : false;
                }
            },
            {
                desc(){
                    return loc("arpa_genepool_unlocked_desc");
                },
                active(){
                    return global.genes['challenge'] && global.genes.challenge >= 2 ? true : false;
                }
            },
            {
                desc(wiki){
                    return loc("arpa_perks_challenge2",[
                        wiki ? "60/80" : global.genes['challenge'] && global.genes.challenge >= 4 ? 80 : 60,
                        wiki ? "60/40" : global.genes['challenge'] && global.genes.challenge >= 4 ? 40 : 60
                    ]);
                },
                active(){
                    return global.genes['challenge'] && global.genes.challenge >= 3 ? true : false;
                }
            },
            {
                desc(){
                    return loc("arpa_perks_challenge3");
                },
                active(){
                    return global.genes['challenge'] && global.genes.challenge >= 5 ? true : false;
                }
            }
        ],
        notes: [
            loc(`wiki_perks_crispr_note`,[`<span class="has-text-caution">${loc(`arpa_genepool_hardened_genes_title`)}</span>`]),
            loc(`wiki_perks_crispr_note_upgrade`,[ 
                [
                    `<span class="has-text-caution">${loc(`arpa_genepool_unlocked_title`)}</span>`,
                    `<span class="has-text-caution">${loc(`arpa_genepool_universal_title`)}</span>`,
                    `<span class="has-text-caution">${loc(`arpa_genepool_standard_title`)}</span>`,
                    `<span class="has-text-caution">${loc(`arpa_genepool_mastered_title`)}</span>`
                ].join(', ')
            ]),
            loc(`wiki_perks_crispr_note_challenge`,[loc(`arpa_genepool_universal_title`),loc(`arpa_genepool_standard_title`)])
        ]
    },
    ancients: {
        name: loc(`wiki_arpa_crispr_ancients`),
        group: [
            {
                desc(){
                    return loc("arpa_perks_ancients");
                },
                active(){
                    return global.genes['ancients'] ? true : false;
                }
            },
            {
                desc(){
                    return global.genes['ancients'] && global.genes.ancients >= 4 ? loc("arpa_perks_ancients3") : loc("arpa_perks_ancients2");
                },
                active(){
                    return global.genes['ancients'] && global.genes.ancients >= 2 ? true : false;
                }
            },
            {
                desc(wiki){
                    return loc("arpa_perks_ancients4",[wiki ? "25/50" : global.genes['ancients'] && global.genes.ancients >= 5 ? 50 : 25]);
                },
                active(){
                    return global.genes['ancients'] && global.genes.ancients >= 3 ? true : false;
                }
            }
        ],
        notes: [
            loc(`wiki_perks_crispr_note`,[`<span class="has-text-caution">${loc(`arpa_genepool_ancients_title`)}</span>`]),
            loc(`wiki_perks_crispr_note_upgrade`,[ 
                [
                    `<span class="has-text-caution">${loc(`arpa_genepool_faith_title`)}</span>`,
                    `<span class="has-text-caution">${loc(`arpa_genepool_devotion_title`)}</span>`,
                    `<span class="has-text-caution">${loc(`arpa_genepool_acolyte_title`)}</span>`,
                    `<span class="has-text-caution">${loc(`arpa_genepool_conviction_title`)}</span>`
                ].join(', ')
            ])
        ]
    },
    trader: {
        name: loc(`wiki_arpa_crispr_trader`),
        desc(){
            return loc("arpa_genepool_negotiator_desc");
        },
        active(){
            return global.genes['trader'] ? true : false;
        },
        notes: [
            loc(`wiki_perks_crispr_note`,[`<span class="has-text-caution">${loc(`arpa_genepool_negotiator_title`)}</span>`])
        ]
    },
    transcendence: {
        name: loc(`wiki_arpa_crispr_transcendence`),
        desc(){
            return loc("arpa_genepool_transcendence_desc");
        },
        active(){
            return global.genes['transcendence'] ? true : false;
        },
        notes: [
            loc(`wiki_perks_crispr_note`,[`<span class="has-text-caution">${loc(`arpa_genepool_transcendence_title`)}</span>`])
        ]
    },
    queue: {
        name: loc(`wiki_arpa_crispr_queue`),
        group: [
            {
                desc(){
                    return loc("arpa_genepool_geographer_desc");
                },
                active(){
                    return global.genes['queue'] ? true : false;
                }
            },
            {
                desc(){
                    return loc("arpa_genepool_architect_desc");
                },
                active(){
                    return global.genes['queue'] && global.genes.queue >= 2 ? true : false;
                }
            }
        ],
        notes: [
            loc(`wiki_perks_crispr_note`,[`<span class="has-text-caution">${loc(`arpa_genepool_geographer_title`)}</span>`]),
            loc(`wiki_perks_crispr_note_upgrade`,[ 
                [
                    `<span class="has-text-caution">${loc(`arpa_genepool_architect_title`)}</span>`
                ].join(', ')
            ])
        ]
    },
    plasma: {
        name: loc(`wiki_arpa_crispr_plasma`),
        desc(wiki){
            let plasmid_cap = wiki ? "3/5" : global.genes['plasma'] >= 2 ? 5 : 3;
            return loc('arpa_genepool_mitosis_desc',[plasmid_cap]);
        },
        active(){
            return global.genes['plasma'] ? true : false;
        },
        notes: [
            loc(`wiki_perks_crispr_note`,[`<span class="has-text-caution">${loc(`arpa_genepool_mitosis_title`)}</span>`]),
            loc(`wiki_perks_crispr_note_upgrade`,[ 
                [
                    `<span class="has-text-caution">${loc(`arpa_genepool_metaphase_title`)}</span>`
                ].join(', ')
            ])
        ]
    },
    mutation: {
        name: loc(`wiki_arpa_crispr_mutation`),
        group: [
            {
                desc(){
                    return global.genes['mutation'] && global.genes.mutation > 1 ? loc("arpa_perks_mutation2") : loc("arpa_perks_mutation1");
                },
                active(){
                    return global.genes['mutation'] ? true : false;
                }
            },
            {
                desc(){
                    return loc("arpa_perks_mutation3");
                },
                active(){
                    return global.genes['mutation'] && global.genes.mutation >= 3 ? true : false;
                }
            }
        ],
        notes: [
            loc(`wiki_perks_crispr_note`,[`<span class="has-text-caution">${loc(`arpa_genepool_mutation_title`)}</span>`]),
            loc(`wiki_perks_crispr_note_upgrade`,[ 
                [
                    `<span class="has-text-caution">${loc(`arpa_genepool_transformation_title`)}</span>`,
                    `<span class="has-text-caution">${loc(`arpa_genepool_metamorphosis_title`)}</span>`
                ].join(', ')
            ])
        ]
    },
    bleed: {
        name: loc(`wiki_arpa_crispr_bleed`),
        group: [
            {
                desc(){
                    return loc("arpa_genepool_bleeding_effect_desc",[2.5]);
                },
                active(){
                    return global.genes['bleed'] ? true : false;
                }
            },
            {
                desc(){
                    return loc("arpa_genepool_synchronicity_desc",[25]);
                },
                active(){
                    return global.genes['bleed'] && global.genes.bleed >= 2 ? true : false;
                }
            },
            {
                desc(){
                    return loc("arpa_genepool_astral_awareness_desc");
                },
                active(){
                    return global.genes['bleed'] && global.genes.bleed >= 3 ? true : false;
                }
            }
        ],
        notes: [
            loc(`wiki_perks_crispr_note`,[`<span class="has-text-caution">${loc(`arpa_genepool_bleeding_effect_title`)}</span>`]),
            loc(`wiki_perks_crispr_note_upgrade`,[ 
                [
                    `<span class="has-text-caution">${loc(`arpa_genepool_synchronicity_title`)}</span>`,
                    `<span class="has-text-caution">${loc(`arpa_genepool_astral_awareness_title`)}</span>`
                ].join(', ')
            ]),
            loc(`wiki_perks_crispr_note_bleed`,[`<span class="has-text-caution">${loc(`arpa_genepool_bleeding_effect_title`)}</span>`]),
        ]
    },
    blood: {
        name: loc(`wiki_arpa_crispr_blood`),
        group: [
            {
                desc(){
                    return loc("arpa_genepool_blood_remembrance_desc");
                },
                active(){
                    return global.genes['blood'] ? true : false;
                }
            },
            {
                desc(){
                    return loc("arpa_genepool_blood_sacrifice_desc");
                },
                active(){
                    return global.genes['blood'] && global.genes.blood >= 2 ? true : false;
                }
            },
            {
                desc(){
                    return loc("arpa_genepool_essence_absorber_desc");
                },
                active(){
                    return global.genes['blood'] && global.genes.blood >= 3 ? true : false;
                }
            }
        ],
        notes: [
            loc(`wiki_perks_crispr_note`,[`<span class="has-text-caution">${loc(`arpa_genepool_blood_remembrance_title`)}</span>`]),
            loc(`wiki_perks_crispr_note_upgrade`,[ 
                [
                    `<span class="has-text-caution">${loc(`arpa_genepool_blood_sacrifice_title`)}</span>`,
                    `<span class="has-text-caution">${loc(`arpa_genepool_essence_absorber_title`)}</span>`
                ].join(', ')
            ]),
            loc(`wiki_perks_crispr_note_blood`,[loc(`arpa_genepool_blood_remembrance_title`)])
        ]
    },
};
