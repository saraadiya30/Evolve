import { loc } from '../../core/locale.js';
import { traitRank } from '../races.js';

// Bagian dari traits (27 entri: hard_of_hearing .. atrophy), dipisah dari races.js. Urutan entri sama persis.
export const traitsPart4 = {
    hard_of_hearing: { // University science cap gain reduced by 5%
        name: loc('trait_hard_of_hearing_name'),
        desc: loc('trait_hard_of_hearing'),
        type: 'major',
        origin: 'slitheryn',
        taxonomy: 'utility',
        val: -3,
        vars(r){
            switch (r || traitRank('hard_of_hearing') || 1){
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
    resourceful: { // Crafting costs are reduced slightly
        name: loc('trait_resourceful_name'),
        desc: loc('trait_resourceful'),
        type: 'major',
        origin: 'arraak',
        taxonomy: 'resource',
        val: 4,
        vars(r){
            switch (r || traitRank('resourceful') || 1){
                case 0.1:
                    return [4];
                case 0.25:
                    return [6];
                case 0.5:
                    return [8];
                case 1:
                    return [12];
                case 2:
                    return [16];
                case 3:
                    return [18];
                case 4:
                    return [20];
            }
        },
    },
    selenophobia: { // Moon phase directly affects productivity, on average this is slightly negative
        name: loc('trait_selenophobia_name'),
        desc: loc('trait_selenophobia'),
        type: 'major',
        origin: 'arraak',
        taxonomy: 'production',
        val: -6,
        vars(r){
            // [Max bonus]
            switch (r || traitRank('selenophobia') || 1){
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
    leathery: { // Morale penalty from some weather conditions are reduced.
        name: loc('trait_leathery_name'),
        desc: loc('trait_leathery'),
        type: 'major',
        origin: 'pterodacti',
        taxonomy: 'production',
        val: 2,
        vars(r){
            // Morale loss (Base value is 5)
            switch (r || traitRank('leathery') || 1){
                case 0.1:
                    return [5];
                case 0.25:
                    return [4];
                case 0.5:
                    return [3];
                case 1:
                    return [2];
                case 2:
                    return [1];
                case 3:
                    return [0];
                case 4:
                    return [-1];
            }
        },
    },
    pessimistic: { // Minor increase to stress
        name: loc('trait_pessimistic_name'),
        desc: loc('trait_pessimistic'),
        type: 'major',
        origin: 'pterodacti',
        taxonomy: 'production',
        val: -1,
        vars(r){
            switch (r || traitRank('pessimistic') || 1){
                case 0.1:
                    return [5];
                case 0.25:
                    return [4];
                case 0.5:
                    return [3];
                case 1:
                    return [2];
                case 2:
                    return [1];
                case 3:
                    return [1];
                case 4:
                    return [0];
            }
        },
    },
    hoarder: { // Banks can store 20% more money
        name: loc('trait_hoarder_name'),
        desc: loc('trait_hoarder'),
        type: 'major',
        origin: 'dracnid',
        taxonomy: 'resource',
        val: 4,
        vars(r){
            switch (r || traitRank('hoarder') || 1){
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
    solitary: { // Cabins are cheaper however cottages cost more
        name: loc('trait_solitary_name'),
        desc: loc('trait_solitary'),
        type: 'major',
        origin: 'dracnid',
        taxonomy: 'utility',
        val: -1,
        vars(r){
            // [Cabin Creep bonus, Cottage Creep malus]
            switch (r || traitRank('solitary') || 1){
                case 0.1:
                    return [0.01,0.03];
                case 0.25:
                    return [0.01,0.025];
                case 0.5:
                    return [0.01,0.02];
                case 1:
                    return [0.02,0.02];
                case 2:
                    return [0.025,0.02];
                case 3:
                    return [0.025,0.015];
                case 4:
                    return [0.028,0.012];
            }
        },
    },
    kindling_kindred: { // Lumber is no longer a resource, however other costs are increased for anything that would have used lumber to compensate.
        name: loc('trait_kindling_kindred_name'),
        desc: loc('trait_kindling_kindred'),
        type: 'major',
        origin: 'entish',
        taxonomy: 'resource',
        val: 8,
        vars(r){
            switch (r || traitRank('kindling_kindred') || 1){
                case 0.1:
                    return [12];
                case 0.25:
                    return [10];
                case 0.5:
                    return [8];
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
    iron_wood: { // Removes Plywood as a resource, adds attack bonus
        name: loc('trait_iron_wood_name'),
        desc: loc('trait_iron_wood'),
        type: 'major',
        origin: 'entish',
        taxonomy: 'resource',
        val: 4,
        vars(r){
            switch (r || traitRank('iron_wood') || 1){
                case 0.1:
                    return [3];
                case 0.25:
                    return [6];
                case 0.5:
                    return [9];
                case 1:
                    return [12];
                case 2:
                    return [15];
                case 3:
                    return [18];
                case 4:
                    return [21];
            }
        },
    },
    pyrophobia: { // Smelter productivity is reduced
        name: loc('trait_pyrophobia_name'),
        desc: loc('trait_pyrophobia'),
        type: 'major',
        origin: 'entish',
        taxonomy: 'resource',
        val: -4,
        vars(r){
            switch (r || traitRank('pyrophobia') || 1){
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
        }
    },
    catnip: { // Attract Cats
        name: loc('trait_catnip_name'),
        desc: loc('trait_catnip'),
        type: 'major',
        origin: 'entish',
        taxonomy: 'production',
        val: 1,
        vars(r){
            switch (r || traitRank('catnip') || 1){
                case 0.1:
                    return [1,2];
                case 0.25:
                    return [1,2];
                case 0.5:
                    return [1,2];
                case 1:
                    return [1,2];
                case 2:
                    return [1,2];
                case 3:
                    return [2,2];
                case 4:
                    return [2,4];
            }
        }
    },
    hyper: { // The game moves at a 5% faster pace
        name: loc('trait_hyper_name'),
        desc: loc('trait_hyper'),
        type: 'major',
        origin: 'cacti',
        taxonomy: 'utility',
        val: 4,
        vars(r){
            switch (r || traitRank('hyper') || 1){
                case 0.1:
                    return [1];
                case 0.25:
                    return [2];
                case 0.5:
                    return [3];
                case 1:
                    return [5];
                case 2:
                    return [6];
                case 3:
                    return [7];
                case 4:
                    return [8];
            }
        }
    },
    skittish: { // Thunderstorms lower all production
        name: loc('trait_skittish_name'),
        desc: loc('trait_skittish'),
        type: 'major',
        origin: 'cacti',
        taxonomy: 'production',
        val: -4,
        vars(r){
            switch (r || traitRank('skittish') || 1){
                case 0.1:
                    return [20];
                case 0.25:
                    return [18];
                case 0.5:
                    return [15];
                case 1:
                    return [12];
                case 2:
                    return [8];
                case 3:
                    return [6];
                case 4:
                    return [4];
            }
        }
    },
    fragrant: { // Reduced Hunting effectiveness
        name: loc('trait_fragrant_name'),
        desc: loc('trait_fragrant'),
        type: 'major',
        origin: 'pinguicula',
        taxonomy: 'resource',
        val: -3,
        vars(r){
            switch (r || traitRank('fragrant') || 1){
                case 0.1:
                    return [40];
                case 0.25:
                    return [35];
                case 0.5:
                    return [30];
                case 1:
                    return [20];
                case 2:
                    return [15];
                case 3:
                    return [12];
                case 4:
                    return [10];
            }
        }
    },
    sticky: { // Food req lowered, Increase Combat Rating
        name: loc('trait_sticky_name'),
        desc: loc('trait_sticky'),
        type: 'major',
        origin: 'pinguicula',
        taxonomy: 'combat',
        val: 3,
        vars(r){
            // [Food Consumption, Army Bonus]
            switch (r || traitRank('sticky') || 1){
                case 0.1:
                    return [3,3];
                case 0.25:
                    return [5,5];
                case 0.5:
                    return [10,8];
                case 1:
                    return [20,15];
                case 2:
                    return [25,18];
                case 3:
                    return [30,20];
                case 4:
                    return [35,22];
            }
        }
    },
    anise: { // Attract Dogs
        name: loc('trait_anise_name'),
        desc: loc('trait_anise'),
        type: 'major',
        origin: 'pinguicula',
        taxonomy: 'production',
        val: 1,
        vars(r){
            switch (r || traitRank('anise') || 1){
                case 0.1:
                    return [1,1];
                case 0.25:
                    return [1,1];
                case 0.5:
                    return [1,1];
                case 1:
                    return [1,1];
                case 2:
                    return [1,1];
                case 3:
                    return [2,1];
                case 4:
                    return [2,3];
            }
        }
    },
    infectious: { // Attacking has a chance to infect other creatures and grow your population
        name: loc('trait_infectious_name'),
        desc: loc('trait_infectious'),
        type: 'major',
        origin: 'sporgar',
        taxonomy: 'combat',
        val: 4,
        vars(r){
            // [Ambush, Raid, Pillage, Assault, Siege]
            switch (r || traitRank('infectious') || 1){
                case 0.1:
                    return [1,2,3,6,15];
                case 0.25:
                    return [1,2,3,7,18];
                case 0.5:
                    return [1,2,4,8,20];
                case 1:
                    return [2,3,5,10,25];
                case 2:
                    return [2,4,6,12,30];
                case 3:
                    return [3,4,7,13,32];
                case 4:
                    return [3,5,8,14,34];
            }
        }
    },
    parasite: { // You can only reproduce by infecting victims, spores sometimes find a victim when it's windy
        name: loc('trait_parasite_name'),
        desc: loc('trait_parasite'),
        type: 'major',
        origin: 'sporgar',
        taxonomy: 'combat',
        val: -4,
        vars(r){
            switch (r || traitRank('parasite') || 1){
                case 0.1:
                    return [0,12];
                case 0.25:
                    return [1,10];
                case 0.5:
                    return [1,8];
                case 1:
                    return [2,6];
                case 2:
                    return [2,4];
                case 3:
                    return [3,2];
                case 4:
                    return [3,0];
            }
        }
    },
    toxic: { // Factory type jobs are more productive
        name: loc('trait_toxic_name'),
        desc: loc('trait_toxic'),
        type: 'major',
        origin: 'shroomi',
        taxonomy: 'resource',
        val: 5,
        vars(r){
            // [Lux Fur Alloy Polymer, Nano Stanene, Cement]
            switch (r || traitRank('toxic') || 1){
                case 0.1:
                    return [3,2,8];
                case 0.25:
                    return [5,3,10];
                case 0.5:
                    return [10,5,15];
                case 1:
                    return [20,8,30];
                case 2:
                    return [25,10,40];
                case 3:
                    return [30,12,45];
                case 4:
                    return [35,14,50];
            }
        }
    },
    nyctophilia: { // Productivity is lost when it is sunny
        name: loc('trait_nyctophilia_name'),
        desc: loc('trait_nyctophilia'),
        type: 'major',
        origin: 'shroomi',
        taxonomy: 'production',
        val: -3,
        vars(r){
            // [Sunny, Cloudy]
            switch (r || traitRank('nyctophilia') || 1){
                case 0.1:
                    return [12,6];
                case 0.25:
                    return [10,6];
                case 0.5:
                    return [8,5];
                case 1:
                    return [5,2];
                case 2:
                    return [3,1];
                case 3:
                    return [2,1];
                case 4:
                    return [1,1];
            }
        }
    },
    infiltrator: { // Cheap spies and sometimes steal tech from rivals
        name: loc('trait_infiltrator_name'),
        desc: loc('trait_infiltrator'),
        type: 'major',
        origin: 'moldling',
        taxonomy: 'utility',
        val: 4,
        vars(r){ // [Steal Cap]
            switch (r || traitRank('infiltrator') || 1){
                case 0.1:
                    return [120];
                case 0.25:
                    return [110];
                case 0.5:
                    return [100];
                case 1:
                    return [90];
                case 2:
                    return [85];
                case 3:
                    return [80];
                case 4:
                    return [75];
            }
        }
    },
    hibernator: { // Lower activity during winter
        name: loc('trait_hibernator_name'),
        desc: loc('trait_hibernator'),
        type: 'major',
        origin: 'moldling',
        taxonomy: 'production',
        val: -3,
        vars(r){
            // [Food Consumption, Production]
            switch (r || traitRank('hibernator') || 1){
                case 0.1:
                    return [10,10];
                case 0.25:
                    return [15,9];
                case 0.5:
                    return [20,8];
                case 1:
                    return [25,8];
                case 2:
                    return [30,6];
                case 3:
                    return [35,5];
                case 4:
                    return [40,4];
            }
        }
    },
    cannibalize: { // Eat your own for buffs
        name: loc('trait_cannibalize_name'),
        desc: loc('trait_cannibalize'),
        type: 'major',
        origin: 'mantis',
        taxonomy: 'utility',
        val: 5,
        vars(r){
            switch (r || traitRank('cannibalize') || 1){
                case 0.1:
                    return [6];
                case 0.25:
                    return [8];
                case 0.5:
                    return [10];
                case 1:
                    return [15];
                case 2:
                    return [20];
                case 3:
                    return [22];
                case 4:
                    return [24];
            }
        }
    },
    frail: { // More soldiers die in combat
        name: loc('trait_frail_name'),
        desc: loc('trait_frail'),
        type: 'major',
        origin: 'mantis',
        taxonomy: 'combat',
        val: -2,
        vars(r){
            // [Win Deaths, Loss Deaths]
            switch (r || traitRank('frail') || 1){
                case 0.1:
                    return [3,4];
                case 0.25:
                    return [3,3];
                case 0.5:
                    return [2,3];
                case 1:
                    return [2,2];
                case 2:
                    return [1,2];
                case 3:
                    return [1,1];
                case 4:
                    return [0,1];
            }
        }
    },
    malnutrition: { // The rationing penalty is weaker
        name: loc('trait_malnutrition_name'),
        desc: loc('trait_malnutrition'),
        type: 'major',
        origin: 'mantis',
        taxonomy: 'production',
        val: 1,
        vars(r){
            switch (r || traitRank('malnutrition') || 1){
                case 0.1:
                    return [8];
                case 0.25:
                    return [10];
                case 0.5:
                    return [12];
                case 1:
                    return [25];
                case 2:
                    return [40];
                case 3:
                    return [50];
                case 4:
                    return [60];
            }
        }
    },
    claws: { // Raises maximum bound for army score roll
        name: loc('trait_claws_name'),
        desc: loc('trait_claws'),
        type: 'major',
        origin: 'scorpid',
        taxonomy: 'combat',
        val: 5,
        vars(r){
            switch (r || traitRank('claws') || 1){
                case 0.1:
                    return [5];
                case 0.25:
                    return [8];
                case 0.5:
                    return [12];
                case 1:
                    return [25];
                case 2:
                    return [32];
                case 3:
                    return [35];
                case 4:
                    return [38];
            }
        }
    },
    atrophy: { // More prone to starvation
        name: loc('trait_atrophy_name'),
        desc: loc('trait_atrophy'),
        type: 'major',
        origin: 'scorpid',
        taxonomy: 'production',
        val: -1,
        vars(r){
            switch (r || traitRank('atrophy') || 1){
                case 0.1:
                    return [0.4];
                case 0.25:
                    return [0.35];
                case 0.5:
                    return [0.25];
                case 1:
                    return [0.15];
                case 2:
                    return [0.1];
                case 3:
                    return [0.08];
                case 4:
                    return [0.06];
            }
        }
    },
};
