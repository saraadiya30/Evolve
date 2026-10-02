import { loc } from './locale.js';
import { global } from './vars.js';
import { calcPillar } from './functions.js';
import { races } from './races.js';
import { checkAdept } from './achieve.js';

// Bagian dari perkList (17 entri: spire .. grandmaster), dipisah dari achieve.js. Urutan entri sama persis.
export const perkListPart3 = {
    spire: {
        name: loc(`wiki_arpa_blood_spire`),
        group: [
            {
                desc(){
                    return loc("arpa_blood_purify_desc");
                },
                active(){
                    return global.blood['spire'] ? true : false;
                }
            },
            {
                desc(){
                    return loc("arpa_blood_chum_desc");
                },
                active(){
                    return global.blood['spire'] && global.blood.spire >= 2 ? true : false;
                }
            }
        ],
        notes: [
            loc(`wiki_perks_blood_note`,[`<span class="has-text-caution">${loc(`arpa_blood_purify_title`)}</span>`]),
            loc(`wiki_perks_blood_note_upgrade`,[ 
                [
                    `<span class="has-text-caution">${loc(`arpa_blood_chum_title`)}</span>`
                ].join(', ')
            ])
        ]
    },
    lust: {
        name: loc(`wiki_arpa_blood_lust`),
        group: [
            {
                desc(wiki){
                    return loc("arpa_perks_lust",[wiki ? 0.2 : 0.2 * (global.blood['lust'] ? global.blood['lust'] : 1)]);
                },
                active(){
                    return global.blood['lust'] ? true : false;
                }
            }
        ],
        notes: [
            loc(`wiki_perks_blood_note`,[`<span class="has-text-caution">${loc(`arpa_blood_lust_title`)}</span>`]),
            loc(`wiki_perks_blood_note_repeat`,[loc(`arpa_blood_lust_title`)])
        ]
    },
    illuminate: {
        name: loc(`wiki_arpa_blood_illuminate`),
        group: [
            {
                desc(wiki){
                    return loc("arpa_perks_illuminate",[wiki ? 0.01 : 0.01 * (global.blood['illuminate'] ? global.blood['illuminate'] : 1)]);
                },
                active(){
                    return global.blood['illuminate'] ? true : false;
                }
            }
        ],
        notes: [
            loc(`wiki_perks_blood_note`,[`<span class="has-text-caution">${loc(`arpa_blood_illuminate_title`)}</span>`]),
            loc(`wiki_perks_blood_note_repeat`,[loc(`arpa_blood_illuminate_title`)])
        ]
    },
    greed: {
        name: loc(`wiki_arpa_blood_greed`),
        group: [
            {
                desc(wiki){
                    return loc("arpa_perks_greed",[wiki ? 1 : 1 * (global.blood['greed'] ? global.blood['greed'] : 1)]);
                },
                active(){
                    return global.blood['greed'] ? true : false;
                }
            }
        ],
        notes: [
            loc(`wiki_perks_blood_note`,[`<span class="has-text-caution">${loc(`arpa_blood_greed_title`)}</span>`]),
            loc(`wiki_perks_blood_note_repeat`,[loc(`arpa_blood_greed_title`)])
        ]
    },
    hoarder: {
        name: loc(`wiki_arpa_blood_hoarder`),
        group: [
            {
                desc(wiki){
                    return loc("arpa_perks_hoarder",[wiki ? 1 : 1 * (global.blood['hoarder'] ? global.blood['hoarder'] : 1)]);
                },
                active(){
                    return global.blood['hoarder'] ? true : false;
                }
            }
        ],
        notes: [
            loc(`wiki_perks_blood_note`,[`<span class="has-text-caution">${loc(`arpa_blood_hoarder_title`)}</span>`]),
            loc(`wiki_perks_blood_note_repeat`,[loc(`arpa_blood_hoarder_title`)])
        ]
    },
    artisan: {
        name: loc(`wiki_arpa_blood_artisan`),
        group: [
            {
                desc(wiki){
                    return loc("arpa_perks_artisan",[wiki ? 1 : 1 * (global.blood['artisan'] ? global.blood['artisan'] : 1)]);
                },
                active(){
                    return global.blood['artisan'] ? true : false;
                }
            }
        ],
        notes: [
            loc(`wiki_perks_blood_note`,[`<span class="has-text-caution">${loc(`arpa_blood_artisan_title`)}</span>`]),
            loc(`wiki_perks_blood_note_repeat`,[loc(`arpa_blood_artisan_title`)])
        ]
    },
    attract: {
        name: loc(`wiki_arpa_blood_attract`),
        group: [
            {
                desc(wiki){
                    return loc("arpa_perks_attract",[wiki ? 5 : 5 * (global.blood['attract'] ? global.blood['attract'] : 1)]);
                },
                active(){
                    return global.blood['attract'] ? true : false;
                }
            }
        ],
        notes: [
            loc(`wiki_perks_blood_note`,[`<span class="has-text-caution">${loc(`arpa_blood_attract_title`)}</span>`]),
            loc(`wiki_perks_blood_note_repeat`,[loc(`arpa_blood_attract_title`)])
        ]
    },
    wrath: {
        name: loc(`wiki_arpa_blood_wrath`),
        group: [
            {
                desc(wiki){
                    return loc("arpa_perks_wrath",[wiki ? 5 : 5 * (global.blood['wrath'] ? global.blood['wrath'] : 1)]);
                },
                active(){
                    return global.blood['wrath'] ? true : false;
                }
            }
        ],
        notes: [
            loc(`wiki_perks_blood_note`,[`<span class="has-text-caution">${loc(`arpa_blood_wrath_title`)}</span>`]),
            loc(`wiki_perks_blood_note_repeat`,[loc(`arpa_blood_wrath_title`)])
        ]
    },
    prepared: {
        name: loc(`wiki_arpa_blood_prepared`),
        group: [
            {
                desc(){
                    return loc("arpa_blood_prepared_desc");
                },
                active(){
                    return global.blood['prepared'] ? true : false;
                }
            },
            {
                desc(){
                    return loc("arpa_blood_compact_desc");
                },
                active(){
                    return global.blood['prepared'] && global.blood.prepared >= 2 ? true : false;
                }
            }
        ],
        notes: [
            loc(`wiki_perks_blood_note`,[`<span class="has-text-caution">${loc(`arpa_blood_prepared_title`)}</span>`]),
            loc(`wiki_perks_blood_note_upgrade`,[ 
                [
                    `<span class="has-text-caution">${loc(`arpa_blood_compact_title`)}</span>`
                ].join(', ')
            ])
        ]
    },
    unbound: {
        name: loc(`wiki_arpa_blood_unbound`),
        group: [
            {
                desc(){
                    return loc("arpa_blood_unbound_desc");
                },
                active(){
                    return global.blood['unbound'] ? true : false;
                }
            },
            {
                desc(){
                    return loc("arpa_blood_shadow_war_desc");
                },
                active(){
                    return global.blood['unbound'] && global.blood.unbound >= 3 ? true : false;
                }
            },
            {
                desc(wiki){
                    return loc("arpa_perks_unbound_resist",[wiki ? "10/5" : global.blood['unbound'] && global.blood.unbound >= 4 ? 5 : 10]);
                },
                active(){
                    return global.blood['unbound'] && global.blood.unbound >= 2 ? true : false;
                }
            }
        ],
        notes: [
            loc(`wiki_perks_blood_note`,[`<span class="has-text-caution">${loc(`arpa_blood_unbound_title`)}</span>`]),
            loc(`wiki_perks_blood_note_upgrade`,[ 
                [
                    `<span class="has-text-caution">${loc(`arpa_blood_unbound_resistance_title`)}</span>`,
                    `<span class="has-text-caution">${loc(`arpa_blood_shadow_war_title`)}</span>`,
                    `<span class="has-text-caution">${loc(`arpa_blood_unbound_immunity_title`)}</span>`
                ].join(', ')
            ])
        ]
    },
    aware: {
        name: loc(`wiki_arpa_blood_aware`),
        group: [
            {
                desc(){
                    return loc("arpa_blood_blood_aware_desc");
                },
                active(){
                    return global.blood['aware'] ? true : false;
                }
            }
        ],
        notes: [
            loc(`wiki_perks_blood_note`,[`<span class="has-text-caution">${loc(`arpa_blood_blood_aware_title`)}</span>`])
        ]
    },
    harmonic: {
        name: loc(`harmonic`),
        group: [
            {
                desc(wiki){
                    let harmonic = calcPillar();
                    return loc("perks_harmonic",[wiki ? `1-${Object.keys(races).length + 2}` : +((harmonic[0] - 1) * 100).toFixed(0), wiki ? `2-${(Object.keys(races).length + 2) * 2}` : +((harmonic[1] - 1) * 100).toFixed(0)]);
                },
                active(){
                    let harmonic = calcPillar();
                    return global['pillars'] && harmonic[0] > 1 ? true : false;
                }
            },
            {
                desc(wiki){
                    let harmonic = calcPillar();
                    return loc("perks_harmonic2",[loc("portal_west_tower"), loc("portal_east_tower"), wiki ? `12-${(Object.keys(races).length - 1) * 12}` : +(Object.keys(global.pillars).length * 12)]);
                },
                active(){
                    let harmonic = calcPillar();
                    return global['pillars'] && harmonic[0] > 1 ? true : false;
                }
            },
        ],
        notes: [
            loc(`wiki_perks_harmonic_note1`),
            loc(`wiki_perks_harmonic_note2`)
        ]
    },
    novice: {
        name: loc(`perk_novice`),
        desc(wiki){
            let rank = global.stats.feat['novice'] && global.stats.achieve['apocalypse'] && global.stats.achieve.apocalypse.l > 0 ? Math.min(global.stats.achieve.apocalypse.l,global.stats.feat['novice']) : 1;
            let rna = wiki ? "0.5/1/1.5/2/2.5" : rank / 2;
            let dna = wiki ? "0.25/0.5/0.75/1/1.25" : rank / 4;
            return `<div>${loc("achieve_perks_novice",[rna,dna])}</div><div>${loc("achieve_perks_novice2")}</div>`;
        },
        active(){
            return global.stats.feat['novice'] && global.stats.mad > 0 ? true : false;
        },
        notes: [
            loc(`wiki_perks_progress_note1`,[10,loc(`wiki_resets_mad`)]),
            loc(`wiki_perks_progress_note2`)
        ]
    },
    journeyman: {
        name: loc(`perk_journeyman`),
        desc(wiki){
            let rank = global.stats.feat['journeyman'] && global.stats.achieve['seeder'] && global.stats.achieve.seeder.l > 0 ? Math.min(global.stats.achieve.seeder.l,global.stats.feat['journeyman']) : 1;
            if (wiki || rank > 1){
                let rqueue = wiki ? "1/2/3" : rank >= 3 ? (rank >= 5 ? 3 : 2) : 1;
                let queue = wiki ? "1/2" : rank >= 4 ? 2 : 1;
                return `<div>${loc("achieve_perks_journeyman2",[rqueue,queue])}</div><div>${loc("achieve_perks_journeyman3")}</div>`;
            }
            else {
                return `<div>${loc("achieve_perks_journeyman1",[1])}</div><div>${loc("achieve_perks_journeyman3")}</div>`;
            }
        },
        active(){
            return global.stats.feat['journeyman'] && global.stats.bioseed > 0 ? true : false;
        },
        notes: [
            loc(`wiki_perks_progress_note1`,[25,loc(`wiki_resets_bioseed`)]),
            loc(`wiki_perks_progress_note2`)
        ]
    },
    adept: {
        name: loc(`perk_adept`),
        desc(wiki){
            let rank = checkAdept() || 1;
            let res = wiki ? "100/200/300/400/500" : rank * 100;
            let cap = wiki ? "60/120/180/240/300" : rank * 60;
            return loc("achieve_perks_adept",[res,cap]);
        },
        active(){
            return checkAdept() > 0;
        },
        notes: [
            loc(`wiki_perks_progress_note1`,[50,loc(`wiki_resets_blackhole`)]),
            loc(`wiki_perks_progress_note2`)
        ]
    },
    master: {
        name: loc(`perk_master`),
        desc(wiki){
            let rank = global.stats.feat['master'] && global.stats.achieve['ascended'] && global.stats.achieve.ascended.l > 0 ? Math.min(global.stats.achieve.ascended.l,global.stats.feat['master']) : 1;
            let boost1 = wiki ? "1/2/3/4/5" : rank;
            let boost2 = wiki ? "2/4/6/8/10" : rank * 2;
            return loc("achieve_perks_master",[boost1,boost2,loc('evo_mitochondria_title'),loc('evo_eukaryotic_title'),loc('evo_membrane_title'),loc('evo_organelles_title'),loc('evo_nucleus_title')]);
        },
        active(){
            return global.stats.feat['master'] && global.stats.achieve['ascended'] && global.stats.achieve.ascended.l > 0 ? true : false;
        },
        notes: [
            loc(`wiki_perks_progress_note1`,[75,loc(`wiki_resets_ascension`)]),
            loc(`wiki_perks_progress_note2`)
        ]
    },
    grandmaster: {
        name: loc(`perk_grandmaster`),
        desc(wiki){
            let rank = global.stats.feat['grandmaster'] && global.stats.achieve['corrupted'] && global.stats.achieve.corrupted.l > 0 ? Math.min(global.stats.achieve.corrupted.l,global.stats.feat['grandmaster']) : 1;
            let boost = wiki ? "1/2/3/4/5" : rank;
            return loc("achieve_perks_grandmaster",[boost]);
        },
        active(){
            return global.stats.feat['grandmaster'] && global.stats.achieve['corrupted'] && global.stats.achieve.corrupted.l > 0 ? true : false;
        },
        notes: [
            loc(`wiki_perks_progress_note1`,[100,loc(`wiki_resets_infusion`)]),
            loc(`wiki_perks_progress_note2`)
        ]
    },
};
