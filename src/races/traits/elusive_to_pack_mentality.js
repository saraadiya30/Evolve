import { loc } from '../../core/locale.js';
import { traitRank } from '../trait_logic/trait_ranks.js';

// Bagian dari traits (28 entri: elusive .. pack_mentality), dipisah dari races.js. Urutan entri sama persis.
export const traitsPart2 = {
    elusive: { // Spies are never caught
        name: loc('trait_elusive_name'),
        desc: loc('trait_elusive'),
        type: 'genus',
        origin: 'fey',
        taxonomy: 'utility',
        val: 7,
        vars(r){
            switch (r || traitRank('elusive') || 1){
                case 0.1:
                    return [5];
                case 0.25:
                    return [10];
                case 0.5:
                    return [15];
                case 1:
                    return [20];
                case 2:
                    return [25];
                case 3:
                    return [30];
                case 4:
                    return [35];
            }
        },
    },
    iron_allergy: { // Iron mining reduced
        name: loc('trait_iron_allergy_name'),
        desc: loc('trait_iron_allergy'),
        type: 'genus',
        origin: 'fey',
        taxonomy: 'resource',
        val: -4,
        vars(r){
            switch (r || traitRank('iron_allergy') || 1){
                case 0.1:
                    return [45];
                case 0.25:
                    return [40];
                case 0.5:
                    return [35];
                case 1:
                    return [25];
                case 2:
                    return [18];
                case 3:
                    return [15];
                case 4:
                    return [12];
            }
        },
    },
    smoldering: { // Hot weather is a bonus
        name: loc('trait_smoldering_name'),
        desc: loc('trait_smoldering'),
        type: 'genus',
        origin: 'heat',
        taxonomy: 'production',
        val: 7,
        vars(r){
            // [Seasonal Morale, Hot Bonus, High Hot Bonus]
            switch (r || traitRank('smoldering') || 1){
                case 0.1:
                    return [2,0.1,0.06];
                case 0.25:
                    return [3,0.14,0.08];
                case 0.5:
                    return [4,0.18,0.1];
                case 1:
                    return [5,0.35,0.2];
                case 2:
                    return [10,0.38,0.22];
                case 3:
                    return [12,0.4,0.24];
                case 4:
                    return [14,0.42,0.25];
            }
        },
    },
    cold_intolerance: { // Cold weather is a detriment
        name: loc('trait_cold_intolerance_name'),
        desc: loc('trait_cold_intolerance'),
        type: 'genus',
        origin: 'heat',
        taxonomy: 'production',
        val: -4,
        vars(r){
            switch (r || traitRank('cold_intolerance') || 1){
                case 0.1:
                    return [0.4];
                case 0.25:
                    return [0.35];
                case 0.5:
                    return [0.3];
                case 1:
                    return [0.25];
                case 2:
                    return [0.2];
                case 3:
                    return [0.18];
                case 4:
                    return [0.16];
            }
        },
    },
    chilled: { // Cold weather is a bonus
        name: loc('trait_chilled_name'),
        desc: loc('trait_chilled'),
        type: 'genus',
        origin: 'polar',
        taxonomy: 'production',
        val: 7,
        vars(r){
            // [Seasonal Morale, Cold Bonus, High Cold Bonus, Snow Food Bonus, Cold Food Bonus, Sun Food Penalty]
            switch (r || traitRank('chilled') || 1){
                case 0.1:
                    return [1,0.12,0.06,3,2,22];
                case 0.25:
                    return [1,0.14,0.08,5,2,20];
                case 0.5:
                    return [2,0.18,0.1,10,5,18];
                case 1:
                    return [5,0.35,0.2,20,10,15];
                case 2:
                    return [10,0.38,0.22,25,12,10];
                case 3:
                    return [12,0.4,0.24,30,14,8];
                case 4:
                    return [14,0.42,0.25,35,15,6];
            }
        },
    },
    heat_intolerance: { // Hot weather is a detriment
        name: loc('trait_heat_intolerance_name'),
        desc: loc('trait_heat_intolerance'),
        type: 'genus',
        origin: 'polar',
        taxonomy: 'production',
        val: -4,
        vars(r){
            switch (r || traitRank('heat_intolerance') || 1){
                case 0.1:
                    return [0.4];
                case 0.25:
                    return [0.35];
                case 0.5:
                    return [0.3];
                case 1:
                    return [0.25];
                case 2:
                    return [0.2];
                case 3:
                    return [0.18];
                case 4:
                    return [0.16];
            }
        },
    },
    scavenger: { // scavenger job is always available
        name: loc('trait_scavenger_name'),
        desc: loc('trait_scavenger'),
        type: 'genus',
        origin: 'sand',
        taxonomy: 'production',
        val: 3,
        vars(r){
            // [impact, duel bonus]
            switch (r || traitRank('scavenger') || 1){
                case 0.1:
                    return [0.05,18];
                case 0.25:
                    return [0.08,20];
                case 0.5:
                    return [0.1,22];
                case 1:
                    return [0.12,25];
                case 2:
                    return [0.14,30];
                case 3:
                    return [0.16,32];
                case 4:
                    return [0.18,34];
            }
        },
    },
    nomadic: { // -1 Trade route from trade post
        name: loc('trait_nomadic_name'),
        desc: loc('trait_nomadic'),
        type: 'genus',
        origin: 'sand',
        taxonomy: 'utility',
        val: -5,
    },
    immoral: { // Warmonger is a bonus instead of a penalty
        name: loc('trait_immoral_name'),
        desc: loc('trait_immoral'),
        type: 'genus',
        origin: 'demonic',
        taxonomy: 'utility',
        val: 4,
        vars(r){
            switch (r || traitRank('immoral') || 1){
                case 0.1:
                    return [-40];
                case 0.25:
                    return [-30];
                case 0.5:
                    return [-20];
                case 1:
                    return [0];
                case 2:
                    return [20];
                case 3:
                    return [30];
                case 4:
                    return [40];
            }
        },
    },
    evil: { // You are pure evil
        name: loc('trait_evil_name'),
        desc: loc('trait_evil'),
        type: 'genus',
        origin: 'demonic',
        taxonomy: 'utility',
        val: 0,
    },
    blissful: { // Low morale penalty is halved and citizens never riot.
        name: loc('trait_blissful_name'),
        desc: loc('trait_blissful'),
        type: 'genus',
        origin: 'angelic',
        taxonomy: 'utility',
        val: 3,
        vars(r){
            switch (r || traitRank('blissful') || 1){
                case 0.1:
                    return [75];
                case 0.25:
                    return [70];
                case 0.5:
                    return [60];
                case 1:
                    return [50];
                case 2:
                    return [40];
                case 3:
                    return [30];
                case 4:
                    return [25];
            }
        },
    },
    pompous: { // Professors are less effective
        name: loc('trait_pompous_name'),
        desc: loc('trait_pompous'),
        type: 'genus',
        origin: 'angelic',
        taxonomy: 'utility',
        val: -6,
        vars(r){
            switch (r || traitRank('pompous') || 1){
                case 0.1:
                    return [90];
                case 0.25:
                    return [85];
                case 0.5:
                    return [80];
                case 1:
                    return [75];
                case 2:
                    return [65];
                case 3:
                    return [58];
                case 4:
                    return [50];
            }
        },
    },
    holy: { // Combat Bonus in Hell
        name: loc('trait_holy_name'),
        desc: loc('trait_holy'),
        type: 'genus',
        origin: 'angelic',
        taxonomy: 'combat',
        val: 4,
        vars(r){
            // [Hell Army Bonus, Hell Suppression Bonus]
            switch (r || traitRank('holy') || 1){
                case 0.1:
                    return [20,5];
                case 0.25:
                    return [25,10];
                case 0.5:
                    return [30,15];
                case 1:
                    return [50,25];
                case 2:
                    return [60,35];
                case 3:
                    return [65,40];
                case 4:
                    return [70,45];
            }
        },
    },
    artifical: {
        name: loc('trait_artifical_name'),
        desc: loc('trait_artifical'),
        type: 'genus',
        origin: 'synthetic',
        taxonomy: 'utility',
        val: 5,
        vars(r){
            // [Science Bonus]
            switch (r || traitRank('artifical') || 1){
                case 0.1:
                    return [3];
                case 0.25:
                    return [5];
                case 0.5:
                    return [10];
                case 1:
                    return [20];
                case 2:
                    return [25];
                case 3:
                    return [30];
                case 4:
                    return [35];
            }
        },
    },
    powered: {
        name: loc('trait_powered_name'),
        desc: loc('trait_powered'),
        type: 'genus',
        origin: 'synthetic',
        taxonomy: 'utility',
        val: -6,
        vars(r){
            // [Power Req, Labor Boost]
            switch (r || traitRank('powered') || 1){
                case 0.1:
                    return [0.4,4];
                case 0.25:
                    return [0.35,5];
                case 0.5:
                    return [0.3,8];
                case 1:
                    return [0.2,16];
                case 2:
                    return [0.1,20];
                case 3:
                    return [0.05,24];
                case 4:
                    return [0.05,28];
            }
        },
    },
    psychic: {
        name: loc('trait_psychic_name'),
        desc: loc('trait_psychic'),
        type: 'genus',
        origin: 'eldritch',
        taxonomy: 'utility',
        val: 10,
        vars(r){
            // [Mind Break Modifer, Thrall Modifer, Recharge Rate, Effect Strength]
            switch (r || traitRank('psychic') || 1){
                case 0.1:
                    return [0.2,4,0.01,15];
                case 0.25:
                    return [0.35,5,0.01,20];
                case 0.5:
                    return [0.65,10,0.025,30];
                case 1:
                    return [1,15,0.05,40];
                case 2:
                    return [1.25,20,0.075,50];
                case 3:
                    return [1.5,25,0.1,60];
                case 4:
                    return [1.65,30,0.12,65];
            }
        },
    },
    tormented: {
        name: loc('trait_tormented_name'),
        desc: loc('trait_tormented'),
        type: 'genus',
        origin: 'eldritch',
        taxonomy: 'utility',
        val: -25,
        vars(r){
            // [Morale above 100% is greatly reduced]
            switch (r || traitRank('tormented') || 1){
                case 0.1:
                    return [99];
                case 0.25:
                    return [98];
                case 0.5:
                    return [95];
                case 1:
                    return [90];
                case 2:
                    return [80];
                case 3:
                    return [75];
                case 4:
                    return [70];
            }
        },
    },
    darkness: {
        name: loc('trait_darkness_name'),
        desc: loc('trait_darkness'),
        type: 'genus',
        origin: 'eldritch',
        taxonomy: 'utility',
        val: 1,
        vars(r){
            // [Sunny Days less frequent]
            switch (r || traitRank('darkness') || 1){
                case 0.1:
                    return [0];
                case 0.25:
                    return [1];
                case 0.5:
                    return [2];
                case 1:
                    return [3];
                case 2:
                    return [4];
                case 3:
                    return [5];
                case 4:
                    return [6];
            }
        },
    },
    unfathomable: {
        name: loc('trait_unfathomable_name'),
        desc: loc('trait_unfathomable'),
        type: 'genus',
        origin: 'eldritch',
        taxonomy: 'utility',
        val: 15,
        vars(r){
            // [Thrall Races, Catch Modifer, Thrall Effectiveness]
            switch (r || traitRank('unfathomable') || 1){
                case 0.1:
                    return [1,0.4,0.03];
                case 0.25:
                    return [1,0.5,0.05];
                case 0.5:
                    return [1,0.65,0.08];
                case 1:
                    return [2,0.8,0.1];
                case 2:
                    return [2,0.9,0.12];
                case 3:
                    return [3,1,0.13];
                case 4:
                    return [3,1.1,0.14];
            }
        },
    },
    creative: { // A.R.P.A. Projects are cheaper
        name: loc('trait_creative_name'),
        desc: loc('trait_creative'),
        type: 'major',
        origin: 'human',
        taxonomy: 'resource',
        val: 8,
        vars(r){
            switch (r || traitRank('creative') || 1){
                case 0.1:
                    return [0.001,3];
                case 0.25:
                    return [0.0015,5];
                case 0.5:
                    return [0.0025,10];
                case 1:
                    return [0.005,20];
                case 2:
                    return [0.006,22];
                case 3:
                    return [0.0065,24];
                case 4:
                    return [0.0068,26];
            }
        },
    },
    diverse: { // Training soldiers takes longer
        name: loc('trait_diverse_name'),
        desc: loc('trait_diverse'),
        type: 'major',
        origin: 'human',
        taxonomy: 'combat',
        val: -4,
        vars(r){
            switch (r || traitRank('diverse') || 1){
                case 0.1:
                    return [40];
                case 0.25:
                    return [35];
                case 0.5:
                    return [30];
                case 1:
                    return [25];
                case 2:
                    return [20];
                case 3:
                    return [15];
                case 4:
                    return [12];
            }
        },
    },
    studious: { // Professors generate an extra 0.25 Knowledge per second, Libraries provide 10% more knowledge cap
        name: loc('trait_studious_name'),
        desc: loc('trait_studious'),
        type: 'major',
        origin: 'elven',
        taxonomy: 'utility',
        val: 2,
        vars(r){
            // [Prof Bonus, Library Bonus]
            switch (r || traitRank('studious') || 1){
                case 0.1:
                    return [0.08,4];
                case 0.25:
                    return [0.1,6];
                case 0.5:
                    return [0.15,8];
                case 1:
                    return [0.25,10];
                case 2:
                    return [0.35,12];
                case 3:
                    return [0.4,14];
                case 4:
                    return [0.45,16];
            }
        },
    },
    arrogant: { // Market prices are higher
        name: loc('trait_arrogant_name'),
        desc: loc('trait_arrogant'),
        type: 'major',
        origin: 'elven',
        taxonomy: 'resource',
        val: -2,
        vars(r){
            switch (r || traitRank('arrogant') || 1){
                case 0.1:
                    return [16]
                case 0.25:
                    return [14];
                case 0.5:
                    return [12];
                case 1:
                    return [10];
                case 2:
                    return [8];
                case 3:
                    return [6];
                case 4:
                    return [5];
            }
        },
    },
    brute: { // Recruitment costs are 1/2 price
        name: loc('trait_brute_name'),
        desc: loc('trait_brute'),
        type: 'major',
        origin: 'orc',
        taxonomy: 'combat',
        val: 7,
        vars(r){
            // [Merc Discount, Training Bonus]
            switch (r || traitRank('brute') || 1){
                case 0.1:
                    return [15,40];
                case 0.25:
                    return [20,50];
                case 0.5:
                    return [25,60];
                case 1:
                    return [50,100];
                case 2:
                    return [60,120];
                case 3:
                    return [65,140];
                case 4:
                    return [70,150];
            }
        },
    },
    angry: { // When hungry you get hangry, low food penalty is more severe
        name: loc('trait_angry_name'),
        desc: loc('trait_angry'),
        type: 'major',
        origin: 'orc',
        taxonomy: 'production',
        val: -1,
        vars(r){
            switch (r || traitRank('angry') || 1){
                case 0.1:
                    return [40];
                case 0.25:
                    return [35];
                case 0.5:
                    return [30];
                case 1:
                    return [25];
                case 2:
                    return [20];
                case 3:
                    return [15];
                case 4:
                    return [12];
            }
        },
    },
    lazy: { // All production is lowered when the temperature is hot
        name: loc('trait_lazy_name'),
        desc: loc('trait_lazy'),
        type: 'major',
        origin: 'cath',
        taxonomy: 'production',
        val: -4,
        vars(r){
            switch (r || traitRank('lazy') || 1){
                case 0.1:
                    return [16];
                case 0.25:
                    return [14];
                case 0.5:
                    return [12];
                case 1:
                    return [10];
                case 2:
                    return [8];
                case 3:
                    return [6];
                case 4:
                    return [5];
            }
        },
    },
    curious: { // University cap boosted by citizen count, curious random events
        name: loc('trait_curious_name'),
        desc: loc('trait_curious'),
        type: 'major',
        origin: 'cath',
        taxonomy: 'utility',
        val: 4,
        vars(r){
            switch (r || traitRank('curious') || 1){
                case 0.1:
                    return [0.02];
                case 0.25:
                    return [0.03];
                case 0.5:
                    return [0.05];
                case 1:
                    return [0.1];
                case 2:
                    return [0.12];
                case 3:
                    return [0.13];
                case 4:
                    return [0.14];
            }
        },
    },
    pack_mentality: { // Cabins cost more, but cottages cost less.
        name: loc('trait_pack_mentality_name'),
        desc: loc('trait_pack_mentality'),
        type: 'major',
        origin: 'wolven',
        taxonomy: 'utility',
        val: 4,
        vars(r){
            // [Cabin Creep penatly, Cottage Creep bonus]
            switch (r || traitRank('pack_mentality') || 1){
                case 0.1:
                    return [0.03,0.014];
                case 0.25:
                    return [0.03,0.016];
                case 0.5:
                    return [0.03,0.018];
                case 1:
                    return [0.03,0.02];
                case 2:
                    return [0.026,0.022];
                case 3:
                    return [0.024,0.023];
                case 4:
                    return [0.022,0.024];
            }
        },
    },
};
