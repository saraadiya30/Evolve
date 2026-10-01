import { loc } from '../../core/locale.js';
import { traitRank } from '../trait_logic/trait_ranks.js';

// Bagian dari traits (27 entri: hivemind .. compact), dipisah dari races.js. Urutan entri sama persis.
export const traitsPart5 = {
    hivemind: { // Jobs with low citizen counts assigned to them have reduced output, but those with high numbers have increased output.
        name: loc('trait_hivemind_name'),
        desc: loc('trait_hivemind'),
        type: 'major',
        origin: 'antid',
        taxonomy: 'production',
        val: 9,
        vars(r){
            switch (r || traitRank('hivemind') || 1){
                case 0.1:
                    return [13];
                case 0.25:
                    return [12];
                case 0.5:
                    return [11];
                case 1:
                    return [10];
                case 2:
                    return [8];
                case 3:
                    return [7];
                case 4:
                    return [6];
            }
        }
    },
    tunneler: { // Mines and Coal Mines are cheaper.
        name: loc('trait_tunneler_name'),
        desc: loc('trait_tunneler'),
        type: 'major',
        origin: 'antid',
        taxonomy: 'utility',
        val: 2,
        vars(r){
            switch (r || traitRank('tunneler') || 1){
                case 0.1:
                    return [0.001];
                case 0.25:
                    return [0.002];
                case 0.5:
                    return [0.005];
                case 1:
                    return [0.01];
                case 2:
                    return [0.015];
                case 3:
                    return [0.018];
                case 4:
                    return [0.02];
            }
        }
    },
    blood_thirst: { // Combat causes a temporary increase in morale
        name: loc('trait_blood_thirst_name'),
        desc: loc('trait_blood_thirst'),
        type: 'major',
        origin: 'sharkin',
        taxonomy: 'combat',
        val: 5,
        vars(r){
            // [Cap]
            switch (r || traitRank('blood_thirst') || 1){
                case 0.1:
                    return [150000];
                case 0.25:
                    return [250000];
                case 0.5:
                    return [500000];
                case 1:
                    return [1000000];
                case 2:
                    return [2000000];
                case 3:
                    return [4000000];
                case 4:
                    return [5000000];
            }
        }
    },
    apex_predator: { // Hunting and Combat ratings are significantly higher, but you can't use armor
        name: loc('trait_apex_predator_name'),
        desc: loc('trait_apex_predator'),
        type: 'major',
        origin: 'sharkin',
        taxonomy: 'combat',
        val: 6,
        vars(r){
            // [Combat, Hunting]
            switch (r || traitRank('apex_predator') || 1){
                case 0.1:
                    return [10,15];
                case 0.25:
                    return [15,20];
                case 0.5:
                    return [20,30];
                case 1:
                    return [30,50];
                case 2:
                    return [40,60];
                case 3:
                    return [45,65];
                case 4:
                    return [50,70];
            }
        }
    },
    invertebrate: { // You have no bones
        name: loc('trait_invertebrate_name'),
        desc: loc('trait_invertebrate'),
        type: 'major',
        origin: 'octigoran',
        taxonomy: 'combat',
        val: -2,
        vars(r){
            switch (r || traitRank('invertebrate') || 1){
                case 0.1:
                    return [30];
                case 0.25:
                    return [25];
                case 0.5:
                    return [20];
                case 1:
                    return [10];
                case 2:
                    return [8];
                case 3:
                    return [5];
                case 4:
                    return [4];
            }
        }
    },
    suction_grip: { // Global productivity boost
        name: loc('trait_suction_grip_name'),
        desc: loc('trait_suction_grip'),
        type: 'major',
        origin: 'octigoran',
        taxonomy: 'production',
        val: 4,
        vars(r){
            switch (r || traitRank('suction_grip') || 1){
                case 0.1:
                    return [3];
                case 0.25:
                    return [5];
                case 0.5:
                    return [6];
                case 1:
                    return [8];
                case 2:
                    return [12];
                case 3:
                    return [14];
                case 4:
                    return [15];
            }
        }
    },
    befuddle: { // Spy actions complete in 1/2 time
        name: loc('trait_befuddle_name'),
        desc: loc('trait_befuddle'),
        type: 'major',
        origin: 'dryad',
        taxonomy: 'utility',
        val: 4,
        vars(r){
            switch (r || traitRank('befuddle') || 1){
                case 0.1:
                    return [10];
                case 0.25:
                    return [20];
                case 0.5:
                    return [30];
                case 1:
                    return [50];
                case 2:
                    return [75];
                case 3:
                    return [85];
                case 4:
                    return [90];
            }
        }
    },
    environmentalist: { // Use renewable energy instead of dirtly coal & oil power.
        name: loc('trait_environmentalist_name'),
        desc: loc('trait_environmentalist'),
        type: 'major',
        origin: 'dryad',
        taxonomy: 'utility',
        val: -5,
        vars(r){
            // [power adjustment, windmill power]
            switch (r || traitRank('environmentalist') || 1){
                case 0.1:
                    return [-2.5,1];
                case 0.25:
                    return [-2,1.15];
                case 0.5:
                    return [-1.5,1.25];
                case 1:
                    return [-1,1.35];
                case 2:
                    return [-0.5,1.4];
                case 3:
                    return [-0.25,1.45];
                case 4:
                    return [0,1.5];
            }
        }
    },
    unorganized: { // Increased time between revolutions
        name: loc('trait_unorganized_name'),
        desc: loc('trait_unorganized'),
        type: 'major',
        origin: 'satyr',
        taxonomy: 'utility',
        val: -2,
        vars(r){
            switch (r || traitRank('unorganized') || 1){
                case 0.1:
                    return [100];
                case 0.25:
                    return [90];
                case 0.5:
                    return [80];
                case 1:
                    return [50];
                case 2:
                    return [40];
                case 3:
                    return [30];
                case 4:
                    return [25];
            }
        }
    },
    musical: { // Entertainers are more effective
        name: loc('trait_musical_name'),
        desc: loc('trait_musical'),
        type: 'major',
        origin: 'satyr',
        taxonomy: 'production',
        val: 5,
        vars(r){
            switch (r || traitRank('musical') || 1){
                case 0.1:
                    return [0.15];
                case 0.25:
                    return [0.25];
                case 0.5:
                    return [0.5];
                case 1:
                    return [1];
                case 2:
                    return [1.1];
                case 3:
                    return [1.2];
                case 4:
                    return [1.25];
            }
        }
    },
    revive: { // Soldiers sometimes self res
        name: loc('trait_revive_name'),
        desc: loc('trait_revive'),
        type: 'major',
        origin: 'phoenix',
        taxonomy: 'combat',
        val: 4,
        vars(r){
            // [cold win, normal win, hot win, cold loss, normal loss, hot loss, hell]
            switch (r || traitRank('revive') || 1){
                case 0.1:
                    return [8,6,2,9,7,3.5,4];
                case 0.25:
                    return [7,5,2,8,6,3,4];
                case 0.5:
                    return [6,4,2,7,5,2.5,4];
                case 1:
                    return [5,3,1.5,6,4,2,3];
                case 2:
                    return [4,2,1,5,3,1.5,2];
                case 3:
                    return [3,1.5,1,4,2.5,1,2];
                case 4:
                    return [2.5,1.2,1,3.5,2,1,2];
            }
        }
    },
    slow_regen: { // Your soldiers wounds heal slower.
        name: loc('trait_slow_regen_name'),
        desc: loc('trait_slow_regen'),
        type: 'major',
        origin: 'phoenix',
        taxonomy: 'combat',
        val: -4,
        vars(r){
            switch (r || traitRank('slow_regen') || 1){
                case 0.1:
                    return [45];
                case 0.25:
                    return [40];
                case 0.5:
                    return [35];
                case 1:
                    return [25];
                case 2:
                    return [20];
                case 3:
                    return [15];
                case 4:
                    return [12];
            }
        }
    },
    forge: { // Smelters do not require fuel, boosts geothermal power
        name: loc('trait_forge_name'),
        desc: loc('trait_forge'),
        type: 'major',
        origin: 'salamander',
        taxonomy: 'utility',
        val: 4,
        vars(r){
            switch (r || traitRank('forge') || 1){
                case 0.1:
                    return [0.25];
                case 0.25:
                    return [0.5];
                case 0.5:
                    return [1];
                case 1:
                    return [2];
                case 2:
                    return [2.5];
                case 3:
                    return [3];
                case 4:
                    return [3.5];
            }
        }
    },
    autoignition: { // Library knowledge bonus reduced
        name: loc('trait_autoignition_name'),
        desc: loc('trait_autoignition'),
        type: 'major',
        origin: 'salamander',
        taxonomy: 'utility',
        val: -4,
        vars(r){
            switch (r || traitRank('autoignition') || 1){
                case 0.1:
                    return [5];
                case 0.25:
                    return [4];
                case 0.5:
                    return [3];
                case 1:
                    return [2];
                case 2:
                    return [1.5];
                case 3:
                    return [1];
                case 4:
                    return [0.5];
            }
        }
    },
    blurry: { // Increased success chance of spies // Warlord improves Reapers
        name: loc('trait_blurry_name'),
        desc: loc('trait_blurry'),
        type: 'major',
        origin: 'yeti',
        taxonomy: 'utility',
        val: 5,
        vars(r){
            switch (r || traitRank('blurry') || 1){
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
        }
    },
    snowy: { // You lose morale if it's not snowing
        name: loc('trait_snowy_name'),
        desc: loc('trait_snowy'),
        type: 'major',
        origin: 'yeti',
        taxonomy: 'production',
        val: -3,
        vars(r){
            // [Not Hot, Hot]
            switch (r || traitRank('snowy') || 1){
                case 0.1:
                    return [5,12];
                case 0.25:
                    return [4,10];
                case 0.5:
                    return [3,8];
                case 1:
                    return [2,5];
                case 2:
                    return [2,4];
                case 3:
                    return [1,3];
                case 4:
                    return [1,2];
            }
        }
    },
    ravenous: { // Drastically increases food consumption
        name: loc('trait_ravenous_name'),
        desc: loc('trait_ravenous'),
        type: 'major',
        origin: 'wendigo',
        taxonomy: 'resource',
        val: -5,
        vars(r){
            // [Extra Food Consumed, Stockpile Divisor]
            switch (r || traitRank('ravenous') || 1){
                case 0.1:
                    return [35,2];
                case 0.25:
                    return [30,2];
                case 0.5:
                    return [25,2];
                case 1:
                    return [20,3];
                case 2:
                    return [15,4];
                case 3:
                    return [10,4];
                case 4:
                    return [8,4];
            }
        }
    },
    ghostly: { // More souls from hunting and soul wells, increased soul gem drop chance
        name: loc('trait_ghostly_name'),
        desc: loc('trait_ghostly'),
        type: 'major',
        origin: 'wendigo',
        taxonomy: 'utility',
        val: 5,
        vars(r){
            // [Hunting Food, Soul Well Food, Soul Gem Adjust]
            switch (r || traitRank('ghostly') || 1){
                case 0.1:
                    return [15,1.1,2];
                case 0.25:
                    return [20,1.2,5];
                case 0.5:
                    return [25,1.25,10];
                case 1:
                    return [50,1.5,15];
                case 2:
                    return [60,1.6,20];
                case 3:
                    return [65,1.7,22];
                case 4:
                    return [70,1.8,23];
            }
        }
    },
    lawless: { // Government lockout timer is reduced by 90%
        name: loc('trait_lawless_name'),
        desc: loc('trait_lawless'),
        type: 'major',
        origin: 'tuskin',
        taxonomy: 'utility',
        val: 3,
        vars(r){
            switch (r || traitRank('lawless') || 1){
                case 0.1:
                    return [20];
                case 0.25:
                    return [30];
                case 0.5:
                    return [50];
                case 1:
                    return [90];
                case 2:
                    return [95];
                case 3:
                    return [98];
                case 4:
                    return [99];
            }
        }
    },
    mistrustful: { // Lose standing with rival cities quicker
        name: loc('trait_mistrustful_name'),
        desc: loc('trait_mistrustful'),
        type: 'major',
        origin: 'tuskin',
        taxonomy: 'utility',
        val: -1,
        vars(r){
            switch (r || traitRank('mistrustful') || 1){
                case 0.1:
                    return [5];
                case 0.25:
                    return [4];
                case 0.5:
                    return [3];
                case 1:
                    return [2];
                case 2:
                    return [2];
                case 3:
                    return [1];
                case 4:
                    return [1];
            }
        }
    },
    humpback: { // Starvation resistance and miner/lumberjack boost
        name: loc('trait_humpback_name'),
        desc: loc('trait_humpback'),
        type: 'major',
        origin: 'kamel',
        taxonomy: 'resource',
        val: 4,
        vars(r){
            // [Starve Resist, Miner/Lumber boost]
            switch (r || traitRank('humpback') || 1){
                case 0.1:
                    return [0.15, 5];
                case 0.25:
                    return [0.2, 8];
                case 0.5:
                    return [0.25, 10];
                case 1:
                    return [0.5, 20];
                case 2:
                    return [0.75, 25];
                case 3:
                    return [0.8, 30];
                case 4:
                    return [0.85, 35];
            }
        }
    },
    thalassophobia: { // Wharves are unavailable
        name: loc('trait_thalassophobia_name'),
        desc: loc('trait_thalassophobia'),
        type: 'major',
        origin: 'kamel',
        taxonomy: 'utility',
        val: -4
    },
    unfavored: { // Zodiac Signs give negative Effects
        name: loc('trait_unfavored_name'),
        desc: loc('trait_unfavored'),
        type: 'major',
        origin: 'kamel',
        taxonomy: 'utility',
        val: -4,
        vars(r){
            // [Negative Sign Intensity]
            switch (r || traitRank('unfavored') || 1){
                case 0.1:
                    return [175];
                case 0.25:
                    return [150];
                case 0.5:
                    return [125];
                case 1:
                    return [100];
                case 2:
                    return [75];
                case 3:
                    return [50];
                case 4:
                    return [25];
            }
        }
    },
    fiery: { // Major war bonus
        name: loc('trait_fiery_name'),
        desc: loc('trait_fiery'),
        type: 'major',
        origin: 'balorg',
        taxonomy: 'combat',
        val: 10,
        vars(r){
            // [Combat Bonus, Hunting Bonus]
            switch (r || traitRank('fiery') || 1){
                case 0.1:
                    return [20,12];
                case 0.25:
                    return [30,15];
                case 0.5:
                    return [40,18];
                case 1:
                    return [65,25];
                case 2:
                    return [70,35];
                case 3:
                    return [72,38];
                case 4:
                    return [74,40];
            }
        }
    },
    terrifying: { // No one will trade with you
        name: loc('trait_terrifying_name'),
        desc: loc('trait_terrifying'),
        type: 'major',
        origin: 'balorg',
        taxonomy: 'resource',
        val: 6,
        vars(r){
            // [Titanium Low Roll, Titanium High Roll]
            switch (r || traitRank('terrifying') || 1){
                case 0.1:
                    return [6,15];
                case 0.25:
                    return [8,20];
                case 0.5:
                    return [10,25];
                case 1:
                    return [12,32];
                case 2:
                    return [13,34];
                case 3:
                    return [14,36];
                case 4:
                    return [15,38];
            }
        }
    },
    slaver: { // You capture victims and force them to work for you
        name: loc('trait_slaver_name'),
        desc: loc('trait_slaver'),
        type: 'major',
        origin: 'balorg',
        taxonomy: 'production',
        val: 12,
        vars(r){
            switch (r || traitRank('slaver') || 1){
                case 0.1:
                    return [0.05];
                case 0.25:
                    return [0.1];
                case 0.5:
                    return [0.14];
                case 1:
                    return [0.28];
                case 2:
                    return [0.3];
                case 3:
                    return [0.32];
                case 4:
                    return [0.33];
            }
        }
    },
    compact: { // You hardly take up any space at all
        name: loc('trait_compact_name'),
        desc: loc('trait_compact'),
        type: 'major',
        origin: 'imp',
        taxonomy: 'utility',
        val: 10,
        vars(r){
            // [Planet Creep, Space Creep]
            switch (r || traitRank('compact') || 1){
                case 0.1:
                    return [0.003,0.002];
                case 0.25:
                    return [0.005,0.003];
                case 0.5:
                    return [0.01,0.005];
                case 1:
                    return [0.015,0.0075];
                case 2:
                    return [0.018,0.0085];
                case 3:
                    return [0.02,0.009];
                case 4:
                    return [0.021,0.0092];
            }
        }
    },
};
