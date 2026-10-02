import { loc } from './locale.js';
import { traitRank } from './races.js';

// Bagian dari traits (28 entri: tracker .. astrologer), dipisah dari races.js. Urutan entri sama persis.
export const traitsPart3 = {
    tracker: { // 20% increased gains from hunting
        name: loc('trait_tracker_name'),
        desc: loc('trait_tracker'),
        type: 'major',
        origin: 'wolven',
        taxonomy: 'resource',
        val: 2,
        vars(r){
            switch (r || traitRank('tracker') || 1){
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
    playful: { // Hunters are Happy
        name: loc('trait_playful_name'),
        desc: loc('trait_playful'),
        type: 'major',
        origin: 'vulpine',
        taxonomy: 'production',
        val: 5,
        vars(r){
            switch (r || traitRank('playful') || 1){
                case 0.1:
                    return [0.2];
                case 0.25:
                    return [0.3];
                case 0.5:
                    return [0.4];
                case 1:
                    return [0.5];
                case 2:
                    return [0.6];
                case 3:
                    return [0.7];
                case 4:
                    return [0.8];
            }
        },
    },
    freespirit: { // Job Stress is higher for those who must work mundane jobs
        name: loc('trait_freespirit_name'),
        desc: loc('trait_freespirit'),
        type: 'major',
        origin: 'vulpine',
        taxonomy: 'production',
        val: -3,
        vars(r){
            switch (r || traitRank('freespirit') || 1){
                case 0.1:
                    return [70];
                case 0.25:
                    return [65];
                case 0.5:
                    return [60];
                case 1:
                    return [50];
                case 2:
                    return [35];
                case 3:
                    return [25];
                case 4:
                    return [20];
            }
        },
    },
    beast_of_burden: { // Gains more loot during raids
        name: loc('trait_beast_of_burden_name'),
        desc: loc('trait_beast_of_burden'),
        type: 'major',
        origin: 'centaur',
        taxonomy: 'combat',
        val: 3
    },
    sniper: { // Weapon upgrades are more impactful
        name: loc('trait_sniper_name'),
        desc: loc('trait_sniper'),
        type: 'major',
        origin: 'centaur',
        taxonomy: 'combat',
        val: 6,
        vars(r){
            switch (r || traitRank('sniper') || 1){
                case 0.1:
                    return [3];
                case 0.25:
                    return [4];
                case 0.5:
                    return [6];
                case 1:
                    return [8];
                case 2:
                    return [9];
                case 3:
                    return [10];
                case 4:
                    return [11];
            }
        },
    },
    hooved: { // You require special footwear
        name: loc('trait_hooved_name'),
        desc: loc('trait_hooved'),
        type: 'major',
        origin: 'centaur',
        taxonomy: 'utility',
        val: -4,
        vars(r){
            // [Cost Adjustment]
            switch (r || traitRank('hooved') || 1){
                case 0.1:
                    return [140];
                case 0.25:
                    return [130];
                case 0.5:
                    return [120];
                case 1:
                    return [100];
                case 2:
                    return [80];
                case 3:
                    return [70];
                case 4:
                    return [60];
            }
        },
    },
    rage: { // Wounded soldiers rage with extra power
        name: loc('trait_rage_name'),
        desc: loc('trait_rage'),
        type: 'major',
        origin: 'rhinotaur',
        taxonomy: 'combat',
        val: 4,
        vars(r){
            // [Rage Bonus, Wounded Bonus]
            switch (r || traitRank('rage') || 1){
                case 0.1:
                    return [0.2,10];
                case 0.25:
                    return [0.3,20];
                case 0.5:
                    return [0.5,30];
                case 1:
                    return [1,50];
                case 2:
                    return [1.25,60];
                case 3:
                    return [1.4,65];
                case 4:
                    return [1.5,70];
            }
        },
    },
    heavy: { // Some costs increased
        name: loc('trait_heavy_name'),
        desc: loc('trait_heavy'),
        type: 'major',
        origin: 'rhinotaur',
        taxonomy: 'utility',
        val: -4,
        vars(r){
            // [Fuel Costs, Stone Cement and Wrought Iron Costs]
            switch (r || traitRank('heavy') || 1){
                case 0.1:
                    return [20,12];
                case 0.25:
                    return [18,10];
                case 0.5:
                    return [15,8];
                case 1:
                    return [10,5];
                case 2:
                    return [8,4];
                case 3:
                    return [6,3];
                case 4:
                    return [5,2];
            }
        },
    },
    gnawer: { // Population destroys lumber by chewing on it
        name: loc('trait_gnawer_name'),
        desc: loc('trait_gnawer'),
        type: 'major',
        origin: 'capybara',
        taxonomy: 'resource',
        val: -1,
        vars(r){
            switch (r || traitRank('gnawer') || 1){
                case 0.1:
                    return [0.6];
                case 0.25:
                    return [0.5];
                case 0.5:
                    return [0.4];
                case 1:
                    return [0.25];
                case 2:
                    return [0.2];
                case 3:
                    return [0.15];
                case 4:
                    return [0.12];
            }
        },
    },
    calm: { // Your are very calm, almost zen like
        name: loc('trait_calm_name'),
        desc: loc('trait_calm'),
        type: 'major',
        origin: 'capybara',
        taxonomy: 'production',
        val: 6,
        vars(r){
            switch (r || traitRank('calm') || 1){
                case 0.1:
                    return [6];
                case 0.25:
                    return [7];
                case 0.5:
                    return [8];
                case 1:
                    return [10];
                case 2:
                    return [12];
                case 3:
                    return [13];
                case 4:
                    return [14];
            }
        },
    },
    pack_rat: { // Storage space is increased
        name: loc('trait_pack_rat_name'),
        desc: loc('trait_pack_rat'),
        type: 'major',
        origin: 'kobold',
        taxonomy: 'resource',
        val: 3,
        vars(r){
            // [Crate Bonus, Storage Bonus]
            switch (r || traitRank('pack_rat') || 1){
                case 0.1:
                    return [4,1];
                case 0.25:
                    return [5,2];
                case 0.5:
                    return [6,3];
                case 1:
                    return [10,5];
                case 2:
                    return [15,8];
                case 3:
                    return [20,10];
                case 4:
                    return [25,12];
            }
        },
    },
    paranoid: { // Bank capacity reduced by 10%
        name: loc('trait_paranoid_name'),
        desc: loc('trait_paranoid'),
        type: 'major',
        origin: 'kobold',
        taxonomy: 'resource',
        val: -3,
        vars(r){
            switch (r || traitRank('paranoid') || 1){
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
    greedy: { // Lowers income from taxes
        name: loc('trait_greedy_name'),
        desc: loc('trait_greedy'),
        type: 'major',
        origin: 'goblin',
        taxonomy: 'resource',
        val: -5,
        vars(r){
            switch (r || traitRank('greedy') || 1){
                case 0.1:
                    return [20];
                case 0.25:
                    return [17.5];
                case 0.5:
                    return [15];
                case 1:
                    return [12.5];
                case 2:
                    return [10];
                case 3:
                    return [8];
                case 4:
                    return [6];
            }
        },
    },
    merchant: { // Better commodity selling prices
        name: loc('trait_merchant_name'),
        desc: loc('trait_merchant'),
        type: 'major',
        origin: 'goblin',
        taxonomy: 'resource',
        val: 3,
        vars(r){
            // [Sell Price, Galactic Buy Volume]
            switch (r || traitRank('merchant') || 1){
                case 0.1:
                    return [5,2];
                case 0.25:
                    return [10,3];
                case 0.5:
                    return [15,5];
                case 1:
                    return [25,10];
                case 2:
                    return [35,12];
                case 3:
                    return [40,13];
                case 4:
                    return [45,14];
            }
        },
    },
    smart: { // Knowledge costs reduced by 10%
        name: loc('trait_smart_name'),
        desc: loc('trait_smart'),
        type: 'major',
        origin: 'gnome',
        taxonomy: 'utility',
        val: 6,
        vars(r){
            switch (r || traitRank('smart') || 1){
                case 0.1:
                    return [2];
                case 0.25:
                    return [3];
                case 0.5:
                    return [5];
                case 1:
                    return [10];
                case 2:
                    return [12];
                case 3:
                    return [13];
                case 4:
                    return [14];
            }
        },
    },
    puny: { // Lowers minium bound for army score roll
        name: loc('trait_puny_name'),
        desc: loc('trait_puny'),
        type: 'major',
        origin: 'gnome',
        taxonomy: 'combat',
        val: -4,
        vars(r){
            switch (r || traitRank('puny') || 1){
                case 0.1:
                    return [20];
                case 0.25:
                    return [18];
                case 0.5:
                    return [15];
                case 1:
                    return [10];
                case 2:
                    return [6];
                case 3:
                    return [4];
                case 4:
                    return [3];
            }
        },
    },
    dumb: { // Knowledge costs increased by 5%
        name: loc('trait_dumb_name'),
        desc: loc('trait_dumb'),
        type: 'major',
        origin: 'ogre',
        taxonomy: 'utility',
        val: -5,
        vars(r){
            switch (r || traitRank('dumb') || 1){
                case 0.1:
                    return [8];
                case 0.25:
                    return [7];
                case 0.5:
                    return [6];
                case 1:
                    return [5];
                case 2:
                    return [4];
                case 3:
                    return [3];
                case 4:
                    return [2];
            }
        },
    },
    tough: { // Mining output increased by 25%
        name: loc('trait_tough_name'),
        desc: loc('trait_tough'),
        type: 'major',
        origin: 'ogre',
        taxonomy: 'resource',
        val: 4,
        vars(r){
            switch (r || traitRank('tough') || 1){
                case 0.1:
                    return [5];
                case 0.25:
                    return [10];
                case 0.5:
                    return [15];
                case 1:
                    return [25];
                case 2:
                    return [35];
                case 3:
                    return [40];
                case 4:
                    return [45];
            }
        },
    },
    nearsighted: { // Libraries are less effective
        name: loc('trait_nearsighted_name'),
        desc: loc('trait_nearsighted'),
        type: 'major',
        origin: 'cyclops',
        taxonomy: 'utility',
        val: -4,
        vars(r){
            switch (r || traitRank('nearsighted') || 1){
                case 0.1:
                    return [20];
                case 0.25:
                    return [18];
                case 0.5:
                    return [15];
                case 1:
                    return [12];
                case 2:
                    return [10];
                case 3:
                    return [8];
                case 4:
                    return [6];
            }
        },
    },
    intelligent: { // Professors and Scientists add a global production bonus
        name: loc('trait_intelligent_name'),
        desc: loc('trait_intelligent'),
        type: 'major',
        origin: 'cyclops',
        taxonomy: 'production',
        val: 7,
        vars(r){
            // [Prof Bonus, Scientist Bonus]
            switch (r || traitRank('intelligent') || 1){
                case 0.1:
                    return [0.05,0.1];
                case 0.25:
                    return [0.08,0.15];
                case 0.5:
                    return [0.1,0.2];
                case 1:
                    return [0.125,0.25];
                case 2:
                    return [0.14,0.3];
                case 3:
                    return [0.15,0.32];
                case 4:
                    return [0.16,0.34];
            }
        },
    },
    regenerative: { // Wounded soldiers heal 4x as fast
        name: loc('trait_regenerative_name'),
        desc: loc('trait_regenerative'),
        type: 'major',
        origin: 'troll',
        taxonomy: 'combat',
        val: 8,
        vars(r){
            switch (r || traitRank('regenerative') || 1){
                case 0.1:
                    return [1];
                case 0.25:
                    return [2];
                case 0.5:
                    return [3];
                case 1:
                    return [4];
                case 2:
                    return [5];
                case 3:
                    return [6];
                case 4:
                    return [7];
            }
        },
    },
    gluttony: { // Eats 10% more food per rank
        name: loc('trait_gluttony_name'),
        desc: loc('trait_gluttony'),
        type: 'major',
        origin: 'troll',
        taxonomy: 'resource',
        val: -2,
        vars(r){
            switch (r || traitRank('gluttony') || 1){
                case 0.1:
                    return [25];
                case 0.25:
                    return [20];
                case 0.5:
                    return [15];
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
    slow: { // The game moves at a 10% slower pace
        name: loc('trait_slow_name'),
        desc: loc('trait_slow'),
        type: 'major',
        origin: 'tortoisan',
        taxonomy: 'utility',
        val: -6,
        vars(r){
            switch (r || traitRank('slow') || 1){
                case 0.1:
                    return [14];
                case 0.25:
                    return [13];
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
    armored: { // Less soldiers die in combat
        name: loc('trait_armored_name'),
        desc: loc('trait_armored'),
        type: 'major',
        origin: 'tortoisan',
        taxonomy: 'combat',
        val: 4,
        vars(r){
            // [Solder % death prevention, Hell Armor Bonus]
            switch (r || traitRank('armored') || 1){
                case 0.1:
                    return [10,0];
                case 0.25:
                    return [15,1];
                case 0.5:
                    return [25,1];
                case 1:
                    return [50,2];
                case 2:
                    return [70,2];
                case 3:
                    return [80,2];
                case 4:
                    return [85,2];
            }
        },
    },
    optimistic: { // Minor reduction to stress
        name: loc('trait_optimistic_name'),
        desc: loc('trait_optimistic'),
        type: 'major',
        origin: 'gecko',
        taxonomy: 'production',
        val: 3,
        vars(r){
            switch (r || traitRank('optimistic') || 1){
                case 0.1:
                    return [3,4];
                case 0.25:
                    return [4,6];
                case 0.5:
                    return [5,8];
                case 1:
                    return [10,10];
                case 2:
                    return [15,13];
                case 3:
                    return [18,15];
                case 4:
                    return [20,16];
            }
        },
    },
    chameleon: { // Barracks have less soldiers
        name: loc('trait_chameleon_name'),
        desc: loc('trait_chameleon'),
        type: 'major',
        origin: 'gecko',
        taxonomy: 'combat',
        val: 6,
        vars(r){
            // [Combat Rating Bonus, Ambush Avoid]
            switch (r || traitRank('chameleon') || 1){
                case 0.1:
                    return [3,5];
                case 0.25:
                    return [5,10];
                case 0.5:
                    return [10,15];
                case 1:
                    return [20,20];
                case 2:
                    return [25,25];
                case 3:
                    return [30,30];
                case 4:
                    return [35,35];
            }
        },
    },
    slow_digestion: { // Your race is more resilient to starvation
        name: loc('trait_slow_digestion_name'),
        desc: loc('trait_slow_digestion'),
        type: 'major',
        origin: 'slitheryn',
        taxonomy: 'production',
        val: 1,
        vars(r){
            switch (r || traitRank('slow_digestion') || 1){
                case 0.1:
                    return [0.2];
                case 0.25:
                    return [0.3];
                case 0.5:
                    return [0.5];
                case 1:
                    return [0.75];
                case 2:
                    return [1];
                case 3:
                    return [1.25];
                case 4:
                    return [1.4];
            }
        },
    },
    astrologer: { // Improved astrological effects
        name: loc('trait_astrologer_name'),
        desc: loc('trait_astrologer'),
        type: 'major',
        origin: 'slitheryn',
        taxonomy: 'utility',
        val: 3,
        vars(r){
            switch (r || traitRank('astrologer') || 1){
                case 0.1:
                    return [10];
                case 0.25:
                    return [20];
                case 0.5:
                    return [30];
                case 1:
                    return [40];
                case 2:
                    return [50];
                case 3:
                    return [60];
                case 4:
                    return [70];
            }
        },
    },
};
