import { loc } from '../../core/locale.js';
import { universe_types } from '../../space/space.js';
import { universe_affixes } from '../../functions/universe_utils.js';
import { masteryType } from '../../functions/prestige_calc.js';
import { harmonyEffect } from '../../functions/cost_multipliers.js';
import { global } from '../../core/vars.js';
import { universeAffix } from '../../functions/universe_utils.js';

// Bagian dari perkList (26 entri: mastery .. escape_velocity), dipisah dari achieve.js. Urutan entri sama persis.
export const perkListPart1 = {
    mastery: {
        name: loc(`mastery`),
        desc(){
            let desc = '';
            Object.keys(universe_types).forEach(function(universe){
                let mastery = masteryType(universe,true,true);
                if (universe === 'standard'){
                    desc += `
                    <span class="row">
                        <span class="has-text-caution">${universe_types[universe].name}</span>:
                        <span>${loc('perks_mastery_general',[`<span class="has-text-advanced">${+(mastery.g).toFixed(2)}%</span>`])}
                        </span>
                    </span>`;
                }
                else if (global.stats.achieve['whitehole']){
                    desc += `
                    <span class="row">
                        <span class="has-text-caution">${universe_types[universe].name}</span>:
                        <span>
                            ${loc('perks_mastery_general',[`<span class="has-text-advanced">${+(mastery.g).toFixed(2)}%</span>`])},
                            ${loc('perks_mastery_universe',[`<span class="has-text-advanced">${+(mastery.u).toFixed(2)}%</span>`])},
                            ${loc('perks_mastery_total',[`<span class="has-text-advanced">${+(mastery.g+mastery.u).toFixed(2)}%</span>`])}
                        </span>
                    </span>`;
                }
            });
            return desc;
        },
        active(){
            return global.genes['challenge'] && global.genes['challenge'] >= 2 ? true : false;
        },
        notes: [
            loc(`wiki_perks_crispr_note`,[`<span class="has-text-caution">${loc(`arpa_genepool_unlocked_title`)}</span>`]),
        ]
    },
    blackhole: {
        name: loc(`achieve_blackhole_name`),
        desc(wiki){
            let bonus = wiki ? "5/10/15/20/25" : global.stats.achieve['blackhole'] ? global.stats.achieve.blackhole.l * 5 : 5;
            return loc("achieve_perks_blackhole",[bonus]);
        },
        active(){
            return global.stats.achieve['blackhole'] && global.stats.achieve.blackhole.l >= 1 ? true : false;
        },
        notes: [
            loc(`wiki_perks_achievement_note`,[`<span class="has-text-caution">${loc(`achieve_blackhole_name`)}</span>`]),
            loc(`wiki_perks_achievement_note_scale`,[`<span class="has-text-caution">${loc(`achieve_blackhole_name`)}</span>`])
        ]
    },
    trade: {
        name: loc(`achieve_trade_name`),
        desc(wiki){
            let bonus1 = wiki ? "2/4/6/8/10" : global.stats.achieve['trade'] ? global.stats.achieve.trade.l * 2 : 2;
            let bonus2 = wiki ? "1/2/3/4/5" : global.stats.achieve['trade'] ? global.stats.achieve.trade.l : 1;
            return loc("achieve_perks_trade",[bonus1,bonus2]);
        },
        active(){
            return global.stats.achieve['trade'] && global.stats.achieve.trade.l >= 1 ? true : false;
        },
        notes: [
            loc(`wiki_perks_achievement_note`,[`<span class="has-text-caution">${loc(`achieve_trade_name`)}</span>`]),
            loc(`wiki_perks_achievement_note_scale`,[`<span class="has-text-caution">${loc(`achieve_trade_name`)}</span>`])
        ]
    },
    creator: {
        name: loc(`achieve_creator_name`),
        desc(wiki){
            let bonus = wiki ? "1.5/2/2.5/3/3.5" : 1 + (global.stats.achieve['creator'] ? global.stats.achieve['creator'].l * 0.5 : 0.5);
            return loc("achieve_perks_creator",[bonus]);
        },
        active(){
            return global.stats.achieve['creator'] && global.stats.achieve.creator.l >= 1 ? true : false;
        },
        notes: [
            loc(`wiki_perks_achievement_note`,[`<span class="has-text-caution">${loc(`achieve_creator_name`)}</span>`]),
            loc(`wiki_perks_achievement_note_scale`,[`<span class="has-text-caution">${loc(`achieve_creator_name`)}</span>`])
        ]
    },
    mass_extinction: {
        name: loc(`achieve_mass_extinction_name`),
        group: [
            {
                desc(){
                    return loc("achieve_perks_mass_extinction");
                },
                active(){
                    return global.stats.achieve['mass_extinction'] && global.stats.achieve['mass_extinction'].l >= 1 ? true : false;
                }
            },
            {
                desc(wiki){
                    let rank = global.stats.achieve['mass_extinction'] ? global.stats.achieve.mass_extinction.l : 1;
                    let bonus = wiki ? "0/50/100/150/200" : (rank - 1) * 50;
                    return loc("achieve_perks_mass_extinction2",[bonus]);
                },
                active(){
                    return global.stats.achieve['mass_extinction'] && global.stats.achieve.mass_extinction.l > 1 ? true : false;
                }
            }
        ],
        notes: [
            loc(`wiki_perks_achievement_note`,[`<span class="has-text-caution">${loc(`achieve_mass_extinction_name`)}</span>`]),
            loc(`wiki_perks_achievement_note_scale`,[`<span class="has-text-caution">${loc(`achieve_mass_extinction_name`)}</span>`])
        ]
    },
    doomed: {
        name: loc(`achieve_doomed_name`),
        desc(wiki){
            return loc("achieve_perks_doomed");
        },
        active(){
            return global.stats.portals >= 1 ? true : false;
        },
        notes: [
            loc(`wiki_perks_achievement_note`,[`<span class="has-text-caution">${loc(`achieve_doomed_name`)}</span>`])
        ]
    },
    explorer: {
        name: loc(`achieve_explorer_name`),
        desc(wiki){
            let bonus = wiki ? "1/2/3/4/5" : global.stats.achieve['explorer'] ? global.stats.achieve['explorer'].l : 1;
            return loc("achieve_perks_explorer",[bonus]);
        },
        active(){
            return global.stats.achieve['explorer'] && global.stats.achieve.explorer.l >= 1 ? true : false;
        },
        notes: [
            loc(`wiki_perks_achievement_note`,[`<span class="has-text-caution">${loc(`achieve_explorer_name`)}</span>`]),
            loc(`wiki_perks_achievement_note_scale`,[`<span class="has-text-caution">${loc(`achieve_explorer_name`)}</span>`])
        ]
    },
    miners_dream: {
        name: loc(`achieve_miners_dream_name`),
        desc(wiki){
            let numGeo = wiki ? "1/2/3/5/7" : global.stats.achieve['miners_dream'] ? global.stats.achieve['miners_dream'].l >= 4 ? global.stats.achieve['miners_dream'].l * 2 - 3 : global.stats.achieve['miners_dream'].l : 0;
            return loc("achieve_perks_miners_dream",[numGeo]);
        },
        active(){
            return global.stats.achieve['miners_dream'] && global.stats.achieve.miners_dream.l >= 1 ? true : false;
        },
        notes: [
            loc(`wiki_perks_achievement_note`,[`<span class="has-text-caution">${loc(`achieve_miners_dream_name`)}</span>`]),
            loc(`wiki_perks_achievement_note_scale`,[`<span class="has-text-caution">${loc(`achieve_miners_dream_name`)}</span>`])
        ]
    },
    extinct_junker: {
        name: loc(`achieve_extinct_junker_name`),
        desc(){
            return loc("achieve_perks_enlightened");
        },
        active(){
            return global.stats.achieve['extinct_junker'] && global.stats.achieve.extinct_junker.l >= 1 ? true : false;
        },
        notes: [
            loc(`wiki_perks_achievement_note`,[`<span class="has-text-caution">${loc(`achieve_extinct_junker_name`)}</span>`])
        ]
    },
    joyless: {
        name: loc(`achieve_joyless_name`),
        desc(wiki){
            let bonus = wiki ? "2/4/6/8/10" : global.stats.achieve['joyless'] ? global.stats.achieve['joyless'].l * 2 : 2;
            return loc("achieve_perks_joyless",[bonus]);
        },
        active(){
            return global.stats.achieve['joyless'] && global.stats.achieve.joyless.l >= 1 ? true : false;
        },
        notes: [
            loc(`wiki_perks_achievement_note`,[`<span class="has-text-caution">${loc(`achieve_joyless_name`)}</span>`]),
            loc(`wiki_perks_achievement_note_scale`,[`<span class="has-text-caution">${loc(`achieve_joyless_name`)}</span>`])
        ]
    },
    steelen: {
        name: loc(`achieve_steelen_name`),
        desc(wiki){
            let bonus = wiki ? "2/4/6/8/10" : global.stats.achieve['steelen'] ? global.stats.achieve['steelen'].l * 2 : 2;
            return loc("achieve_perks_steelen",[bonus]);
        },
        active(){
            return global.stats.achieve['steelen'] && global.stats.achieve.steelen.l >= 1 ? true : false;
        },
        notes: [
            loc(`wiki_perks_achievement_note`,[`<span class="has-text-caution">${loc(`achieve_steelen_name`)}</span>`]),
            loc(`wiki_perks_achievement_note_scale`,[`<span class="has-text-caution">${loc(`achieve_steelen_name`)}</span>`])
        ]
    },
    wheelbarrow: {
        name: loc(`achieve_wheelbarrow_name`),
        desc(wiki){
            let bonus = wiki ? "2/4/6/8/10" : global.stats.achieve['wheelbarrow'] ? global.stats.achieve['wheelbarrow'].l * 2 : 2;
            return loc("achieve_perks_wheelbarrow",[bonus]);
        },
        active(){
            return global.stats.achieve['wheelbarrow'] && global.stats.achieve.wheelbarrow.l >= 1 ? true : false;
        },
        notes: [
            loc(`wiki_perks_achievement_note`,[`<span class="has-text-caution">${loc(`achieve_wheelbarrow_name`)}</span>`]),
            loc(`wiki_perks_achievement_note_scale`,[`<span class="has-text-caution">${loc(`achieve_wheelbarrow_name`)}</span>`])
        ]
    },
    extinct_sludge: {
        name: loc(`achieve_extinct_sludge_name`),
        group: [
            {
                desc(wiki){
                    let bonus = wiki ? "3/6/9/12/15" : (global.stats.achieve['extinct_sludge'] ? global.stats.achieve['extinct_sludge'].l * 3 : 3);
                    return loc("achieve_perks_extinct_sludge",[bonus,loc(`universe_standard`)]);
                },
                active(){
                    return global.stats.achieve['extinct_sludge'] && global.stats.achieve.extinct_sludge.l >= 1 ? true : false;
                },
            },
            {
                desc(wiki){
                    let bonus = wiki ? "3/6/9/12/15" : (global.stats.achieve['extinct_sludge'] ? global.stats.achieve['extinct_sludge'].h * 3 : 3);
                    return loc("achieve_perks_extinct_sludge",[bonus,loc(`universe_heavy`)]);
                },
                active(){
                    return global.stats.achieve['extinct_sludge'] && global.stats.achieve.extinct_sludge.h >= 1 ? true : false;
                },
            },
            {
                desc(wiki){
                    let bonus = wiki ? "3/6/9/12/15" : (global.stats.achieve['extinct_sludge'] ? global.stats.achieve['extinct_sludge'].a * 3 : 3);
                    return loc("achieve_perks_extinct_sludge",[bonus,loc(`universe_antimatter`)]);
                },
                active(){
                    return global.stats.achieve['extinct_sludge'] && global.stats.achieve.extinct_sludge.a >= 1 ? true : false;
                },
            },
            {
                desc(wiki){
                    let bonus = wiki ? "3/6/9/12/15" : (global.stats.achieve['extinct_sludge'] ? global.stats.achieve['extinct_sludge'].e * 3 : 3);
                    return loc("achieve_perks_extinct_sludge",[bonus,loc(`universe_evil`)]);
                },
                active(){
                    return global.stats.achieve['extinct_sludge'] && global.stats.achieve.extinct_sludge.e >= 1 ? true : false;
                },
            },
            {
                desc(wiki){
                    let bonus = wiki ? "3/6/9/12/15" : (global.stats.achieve['extinct_sludge'] ? global.stats.achieve['extinct_sludge'].m * 3 : 3);
                    return loc("achieve_perks_extinct_sludge",[bonus,loc(`universe_micro`)]);
                },
                active(){
                    return global.stats.achieve['extinct_sludge'] && global.stats.achieve.extinct_sludge.m >= 1 ? true : false;
                },
            },
            {
                desc(wiki){
                    let bonus = wiki ? "3/6/9/12/15" : (global.stats.achieve['extinct_sludge'] ? global.stats.achieve['extinct_sludge'].mg * 3 : 3);
                    return loc("achieve_perks_extinct_sludge",[bonus,loc(`universe_magic`)]);
                },
                active(){
                    return global.stats.achieve['extinct_sludge'] && global.stats.achieve.extinct_sludge.mg >= 1 ? true : false;
                },
            },
        ],
        notes: [
            loc(`wiki_perks_achievement_note`,[`<span class="has-text-caution">${loc(`achieve_extinct_sludge_name`)}</span>`]),
            loc(`wiki_perks_achievement_note_universe_scale`,[`<span class="has-text-caution">${loc(`achieve_extinct_sludge_name`)}</span>`])
        ]
    },
    whitehole: {
        name: loc(`achieve_whitehole_name`),
        group: [
            {
                desc(){
                    return loc("achieve_perks_whitehole");
                },
                active(){
                    return global.stats.achieve['whitehole'] ? true : false;
                }
            },
            {
                desc(wiki){
                    let bonus = wiki ? "5/10/15/20/25" : global.stats.achieve['whitehole'] ? global.stats.achieve['whitehole'].l * 5 : 5;
                    return loc("achieve_perks_whitehole2",[bonus]);
                },
                active(){
                    return global.stats.achieve['whitehole'] ? true : false;
                }
            },
            {
                desc(wiki){
                    let bonus = wiki ? "1/2/3/4/5" : global.stats.achieve['whitehole'] ? global.stats.achieve['whitehole'].l : 1;
                    return loc("achieve_perks_whitehole3",[bonus]);
                },
                active(){
                    return global.stats.achieve['whitehole'] ? true : false;
                }
            }
        ],
        notes: [
            loc(`wiki_perks_achievement_note`,[`<span class="has-text-caution">${loc(`achieve_whitehole_name`)}</span>`]),
            loc(`wiki_perks_achievement_note_scale`,[`<span class="has-text-caution">${loc(`achieve_whitehole_name`)}</span>`])
        ]
    },
    heavyweight: {
        name: loc(`achieve_heavyweight_name`),
        desc(wiki){
            let bonus = wiki ? "4/8/12/16/20" : global.stats.achieve['heavyweight'] ? global.stats.achieve['heavyweight'].l * 4 : 4;
            return loc("achieve_perks_heavyweight",[bonus]);
        },
        active(){
            return global.stats.achieve['heavyweight'] ? true : false;
        },
        notes: [
            loc(`wiki_perks_achievement_note`,[`<span class="has-text-caution">${loc(`achieve_heavyweight_name`)}</span>`]),
            loc(`wiki_perks_achievement_note_scale`,[`<span class="has-text-caution">${loc(`achieve_heavyweight_name`)}</span>`])
        ]
    },
    dissipated: {
        name: loc(`achieve_dissipated_name`),
        group: [
            {
                desc(){
                    return loc("achieve_perks_dissipated1",[1]);
                },
                active(){
                    return global.stats.achieve['dissipated'] && global.stats.achieve['dissipated'].l >= 1 ? true : false;
                }
            },
            {
                desc(wiki){
                    let bonus = wiki ? "1/2" : global.stats.achieve['dissipated'] && global.stats.achieve['dissipated'].l >= 5 ? 2 : 1;
                    return loc("achieve_perks_dissipated2",[bonus]);
                },
                active(){
                    return global.stats.achieve['dissipated'] && global.stats.achieve['dissipated'].l >= 3 ? true : false;
                }
            },
            {
                desc(){
                    return loc("achieve_perks_dissipated3",[1]);
                },
                active(){
                    return global.stats.achieve['dissipated'] && global.stats.achieve['dissipated'].l >= 2 ? true : false;
                }
            },
            {
                desc(){
                    return loc("achieve_perks_dissipated4",[1]);
                },
                active(){
                    return global.stats.achieve['dissipated'] && global.stats.achieve['dissipated'].l >= 4 ? true : false;
                }
            }
        ],
        notes: [
            loc(`wiki_perks_achievement_note`,[`<span class="has-text-caution">${loc(`achieve_dissipated_name`)}</span>`]),
            loc(`wiki_perks_achievement_note_scale`,[`<span class="has-text-caution">${loc(`achieve_dissipated_name`)}</span>`])
        ]
    },
    banana: {
        name: loc(`achieve_banana_name`),
        group: [
            {
                desc(){
                    return loc("achieve_perks_banana1",[50]);
                },
                active(){
                    return global.stats.achieve['banana'] && global.stats.achieve.banana.l >= 1 ? true : false;
                }
            },
            {
                desc(){
                    return loc("achieve_perks_banana2",[1]);
                },
                active(){
                    return global.stats.achieve['banana'] && global.stats.achieve.banana.l >= 2 ? true : false;
                }
            },
            {
                desc(){
                    return loc("achieve_perks_banana3",[10]);
                },
                active(){
                    return global.stats.achieve['banana'] && global.stats.achieve.banana.l >= 3 ? true : false;
                }
            },
            {
                desc(){
                    return loc("achieve_perks_banana4",[3]);
                },
                active(){
                    return global.stats.achieve['banana'] && global.stats.achieve.banana.l >= 4 ? true : false;
                }
            },
            {
                desc(){
                    return loc("achieve_perks_banana5",[0.01]);
                },
                active(){
                    return global.stats.achieve['banana'] && global.stats.achieve.banana.l >= 5 ? true : false;
                }
            }
        ],
        notes: [
            loc(`wiki_perks_achievement_note`,[`<span class="has-text-caution">${loc(`achieve_banana_name`)}</span>`]),
            loc(`wiki_perks_achievement_note_task`,[`<span class="has-text-caution">${loc(`achieve_banana_name`)}</span>`]),
            loc(`wiki_perks_achievement_note_task_num`,[1,`<span class="has-text-${global.stats.banana.b1.l ? `success` : `danger`}">${loc(`wiki_achieve_banana1`)}</span>`]),
            loc(`wiki_perks_achievement_note_task_num`,[2,`<span class="has-text-${global.stats.banana.b2.l ? `success` : `danger`}">${loc(`wiki_achieve_banana2`)}</span>`]),
            loc(`wiki_perks_achievement_note_task_num`,[3,`<span class="has-text-${global.stats.banana.b3.l ? `success` : `danger`}">${loc(`wiki_achieve_banana3`)}</span>`]),
            loc(`wiki_perks_achievement_note_task_num`,[4,`<span class="has-text-${global.stats.banana.b4.l ? `success` : `danger`}">${loc(`wiki_achieve_banana4`,[500])}</span>`]),
            loc(`wiki_perks_achievement_note_task_num`,[5,`<span class="has-text-${global.stats.banana.b5.l ? `success` : `danger`}">${loc(`wiki_achieve_banana5`,[50])}</span>`])
        ]
    },
    anarchist: {
        name: loc(`achieve_anarchist_name`),
        desc(wiki){
            let bonus = wiki ? "10/20/30/40/50" : global.stats.achieve['anarchist'] ? global.stats.achieve['anarchist'].l * 10 : 10;
            return loc("achieve_perks_anarchist",[bonus]);
        },
        active(){
            return global.stats.achieve['anarchist'] && global.stats.achieve['anarchist'].l >= 1 ? true : false;
        },
        notes: [
            loc(`wiki_perks_achievement_note`,[`<span class="has-text-caution">${loc(`achieve_anarchist_name`)}</span>`]),
            loc(`wiki_perks_achievement_note_scale`,[`<span class="has-text-caution">${loc(`achieve_anarchist_name`)}</span>`])
        ]
    },
    ascended: {
        name: loc(`achieve_ascended_name`),
        group: [
            {
                desc(wiki){
                    let genes;
                    if (wiki){
                        genes = "1-30";
                    }
                    else {
                        genes = 0;
                        if (global.stats.achieve['ascended']){
                            for (let i=0; i<universe_affixes.length; i++){
                                if (global.stats.achieve.ascended.hasOwnProperty(universe_affixes[i])){
                                    genes += global.stats.achieve.ascended[universe_affixes[i]];
                                }
                            }
                        }
                    }
                    return loc("achieve_perks_ascended1",[genes]);
                },
                active(){
                    return global.stats.achieve['ascended'] && global.stats.achieve['ascended'].l >= 1 ? true : false;
                }
            },
            {
                desc(){
                    return loc("achieve_perks_ascended2",[harmonyEffect()]);
                },
                active(){
                    return global.stats.achieve['ascended'] && global.stats.achieve['ascended'][universeAffix()] >= 1 ? true : false;
                }
            }
        ],
        notes: [
            loc(`wiki_perks_achievement_note`,[`<span class="has-text-caution">${loc(`achieve_ascended_name`)}</span>`]),
            loc(`wiki_perks_achievement_note_scale`,[`<span class="has-text-caution">${loc(`achieve_ascended_name`)}</span>`]),
            loc(`wiki_perks_achievement_note_universe`,[`<span class="has-text-caution">${loc(`achieve_ascended_name`)}</span>`])
        ]
    },
    technophobe: {
        name: loc(`achieve_technophobe_name`),
        group: [
            {
                desc(){
                    return loc("achieve_perks_technophobe1",[25]);
                },
                active(){
                    return global.stats.achieve['technophobe'] && global.stats.achieve['technophobe'].l >= 1 ? true : false;
                }
            },
            {
                desc(wiki){
                    let bonus;
                    if (wiki){
                        bonus = "10/25/30/35/40/45/50";
                    }
                    else {
                        bonus = global.stats.achieve['technophobe'] && global.stats.achieve.technophobe.l >= 4 ? 25 : 10;
                        for (let i=1; i<universe_affixes.length; i++){
                            if (global.stats.achieve['technophobe'] && global.stats.achieve.technophobe[universe_affixes[i]] && global.stats.achieve.technophobe[universe_affixes[i]] >= 5){
                                bonus += 5;
                            }
                        }
                    }
                    return loc("achieve_perks_technophobe2",[bonus]);
                },
                active(){
                    return global.stats.achieve['technophobe'] && global.stats.achieve.technophobe.l >= 2 ? true : false;
                }
            },
            {
                desc(wiki){
                    let gems;
                    if (wiki){
                        gems = "1/2/3/4/5/6";
                    }
                    else {
                        gems = 1;
                        for (let i=1; i<universe_affixes.length; i++){
                            if (global.stats.achieve['technophobe'] && global.stats.achieve.technophobe[universe_affixes[i]] && global.stats.achieve.technophobe[universe_affixes[i]] >= 5){
                                gems += 1;
                            }
                        }
                    }
                    return wiki || gems > 1 ? loc("achieve_perks_technophobe3a",[gems]) : loc("achieve_perks_technophobe3",[gems]);
                },
                active(){
                    return global.stats.achieve['technophobe'] && global.stats.achieve.technophobe.l >= 3 ? true : false;
                }
            },
            {
                desc(){
                    return loc("achieve_perks_technophobe4",[10]);
                },
                active(){
                    return global.stats.achieve['technophobe'] && global.stats.achieve.technophobe.l >= 5 ? true : false;
                }
            },
            {
                desc(wiki){
                    let bonus = wiki ? "4/8/12/16/20" : global.stats.achieve['technophobe'] ? global.stats.achieve.technophobe.l : 0;
                    return loc("achieve_perks_technophobe5",[bonus]);
                },
                active(){
                    return global.stats.achieve['technophobe'] && global.stats.achieve.technophobe.l >= 1 ? true : false;
                }
            }
        ],
        notes: [
            loc(`wiki_perks_achievement_note`,[`<span class="has-text-caution">${loc(`achieve_technophobe_name`)}</span>`]),
            loc(`wiki_perks_achievement_note_scale`,[`<span class="has-text-caution">${loc(`achieve_technophobe_name`)}</span>`]),
            loc(`wiki_perks_achievement_note_universe`,[`<span class="has-text-caution">${loc(`achieve_technophobe_name`)}</span>`])
        ]
    },
    iron_will: {
        name: loc(`achieve_iron_will_name`),
        group: [
            {
                desc(){
                    return loc("achieve_perks_iron_will1",[0.15]);
                },
                active(){
                    return global.stats.achieve['iron_will'] && global.stats.achieve.iron_will.l >= 1 ? true : false;
                }
            },
            {
                desc(){
                    return loc("achieve_perks_iron_will2",[10]);
                },
                active(){
                    return global.stats.achieve['iron_will'] && global.stats.achieve.iron_will.l >= 2 ? true : false;
                }
            },
            {
                desc(){
                    return loc("achieve_perks_iron_will3",[6]);
                },
                active(){
                    return global.stats.achieve['iron_will'] && global.stats.achieve.iron_will.l >= 3 ? true : false;
                }
            },
            {
                desc(){
                    return loc("achieve_perks_iron_will4",[1]);
                },
                active(){
                    return global.stats.achieve['iron_will'] && global.stats.achieve.iron_will.l >= 4 ? true : false;
                }
            },
            {
                desc(){
                    return loc("achieve_perks_iron_will5");
                },
                active(){
                    return global.stats.achieve['iron_will'] && global.stats.achieve.iron_will.l >= 5 ? true : false;
                }
            }
        ],
        notes: [
            loc(`wiki_perks_achievement_note`,[`<span class="has-text-caution">${loc(`achieve_iron_will_name`)}</span>`]),
            loc(`wiki_perks_achievement_note_ironwill`,[`<span class="has-text-caution">${loc(`evo_challenge_cataclysm`)}</span>`]),
            loc(`wiki_perks_achievement_note_ironwill2`,[1,`<span class="has-text-caution">${loc(`space_red_ziggurat_title`)}</span>`]),
            loc(`wiki_perks_achievement_note_ironwill3`,[2,`<span class="has-text-caution">${loc(`tech_elerium_mining`)}</span>`]),
            loc(`wiki_perks_achievement_note_ironwill3`,[3,`<span class="has-text-caution">${loc(`tech_lasers`)}</span>`]),
            loc(`wiki_perks_achievement_note_ironwill3`,[4,`<span class="has-text-caution">${loc(`tech_generational_ship`)}</span>`]),
            loc(`wiki_perks_achievement_note_ironwill4`,[5,`<span class="has-text-caution">${loc(`wiki_resets_bioseed`)}</span>`])
        ]
    },
    failed_history: {
        name: loc(`achieve_failed_history_name`),
        desc(){
            return loc("achieve_perks_failed_history",[2]);
        },
        active(){
            return global.stats.achieve['failed_history'] && global.stats.achieve.failed_history.l >= 5 ? true : false;
        },
        notes: [
            loc(`wiki_perks_achievement_note`,[`<span class="has-text-caution">${loc(`achieve_failed_history_name`)}</span>`]),
            loc(`wiki_perks_achievement_note_failed_history`,[`<span class="has-text-caution">${loc(`evo_challenge_cataclysm`)}</span>`])
        ]
    },
    lamentis: {
        name: loc(`achieve_lamentis_name`),
        group: [
            {
                desc(){
                    return loc("achieve_perks_lamentis1",[`10%`]);
                },
                active(){
                    return global.stats.achieve['lamentis'] && global.stats.achieve.lamentis.l >= 1 ? true : false;
                }
            },
            {
                desc(){
                    return loc("achieve_perks_lamentis2",[`10%`]);
                },
                active(){
                    return global.stats.achieve['lamentis'] && global.stats.achieve.lamentis.l >= 2 ? true : false;
                }
            },
            {
                desc(){
                    return loc("achieve_perks_lamentis3",[`10%`]);
                },
                active(){
                    return global.stats.achieve['lamentis'] && global.stats.achieve.lamentis.l >= 3 ? true : false;
                }
            },
            {
                desc(){
                    return loc("achieve_perks_lamentis4");
                },
                active(){
                    return global.stats.achieve['lamentis'] && global.stats.achieve.lamentis.l >= 4 ? true : false;
                }
            },
            {
                desc(){
                    return loc("achieve_perks_lamentis5");
                },
                active(){
                    return global.stats.achieve['lamentis'] && global.stats.achieve.lamentis.l >= 5 ? true : false;
                }
            },
        ],
        notes: [
            loc(`wiki_perks_achievement_note`,[`<span class="has-text-caution">${loc(`achieve_lamentis_name`)}</span>`]),
            loc(`wiki_perks_achievement_note_scale`,[`<span class="has-text-caution">${loc(`achieve_lamentis_name`)}</span>`])
        ]
    },
    soul_sponge: {
        name: loc(`achieve_soul_sponge_name`),
        desc(wiki){
            let soul = wiki ? "100/200/300/400/500" : global.stats.achieve['soul_sponge'] ? global.stats.achieve.soul_sponge.mg * 100 : 100;
            return loc("achieve_perks_soul_sponge",[soul]);
        },
        active(){
            return global.stats.achieve['soul_sponge'] && global.stats.achieve.soul_sponge.mg >= 1 ? true : false;
        },
        notes: [
            loc(`wiki_perks_achievement_note`,[`<span class="has-text-caution">${loc(`achieve_soul_sponge_name`)}</span>`]),
            loc(`wiki_perks_achievement_note_scale`,[`<span class="has-text-caution">${loc(`achieve_soul_sponge_name`)}</span>`])
        ]
    },
    nightmare: {
        name: loc(`achieve_nightmare_name`),
        desc(){
            return loc("achieve_perks_nightmare");
        },
        active(){
            return global.stats.achieve['nightmare'] && global.stats.achieve.nightmare.mg >= 1 ? true : false;
        },
        notes: [
            loc(`wiki_perks_achievement_note`,[`<span class="has-text-caution">${loc(`achieve_nightmare_name`)}</span>`]),
            loc(`wiki_perks_achievement_note_scale`,[`<span class="has-text-caution">${loc(`achieve_nightmare_name`)}</span>`])
        ]
    },
    escape_velocity: {
        name: loc(`achieve_escape_velocity_name`),
        desc(wiki){
            let ev = wiki ? "2/4/6/8/10" : global.stats.achieve['escape_velocity'] ? global.stats.achieve.escape_velocity.h * 2 : 2;
            return loc("achieve_perks_escape_velocity",[ev]);
        },
        active(){
            return global.stats.achieve['escape_velocity'] && global.stats.achieve.escape_velocity.h >= 1 ? true : false;
        },
        notes: [
            loc(`wiki_perks_achievement_note`,[`<span class="has-text-caution">${loc(`achieve_escape_velocity_name`)}</span>`]),
            loc(`wiki_perks_achievement_note_scale`,[`<span class="has-text-caution">${loc(`achieve_escape_velocity_name`)}</span>`])
        ]
    },
};
