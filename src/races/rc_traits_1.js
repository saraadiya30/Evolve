import { loc } from '../core/locale.js';
import { traitRank } from './races.js';

// Bagian dari traits (30 entri: adaptable .. low_light), dipisah dari races.js. Urutan entri sama persis.
export const traitsPart1 = {
    adaptable: { // Genetic Mutations occur faster from gene tampering
        name: loc('trait_adaptable_name'),
        desc: loc('trait_adaptable'),
        type: 'genus',
        origin: 'humanoid',
        taxonomy: 'utility',
        val: 3,
        vars(r){ 
            switch (r || traitRank('adaptable') || 1){
                case 0.1:
                    return [2];
                case 0.25:
                    return [3];
                case 0.5:
                    return [5];
                case 1:
                    return [10];
                case 2:
                    return [15];
                case 3:
                    return [20];
                case 4:
                    return [25];
            }
        },
    },
    wasteful: { // Craftings cost more materials
        name: loc('trait_wasteful_name'),
        desc: loc('trait_wasteful'),
        type: 'genus',
        origin: 'humanoid',
        taxonomy: 'resource',
        val: -3,
        vars(r){ 
            switch (r || traitRank('wasteful') || 1){
                case 0.1:
                    return [16];
                case 0.25:
                    return [14];
                case 0.5:
                    return [12];
                case 1:
                    return [10];
                case 2:
                    return [6];
                case 3:
                    return [4];
                case 4:
                    return [2];
            }
        },
    },
    xenophobic: { // Trade posts suffer a -1 penalty per post
        name: loc('trait_xenophobic_name'),
        desc: loc('trait_xenophobic'),
        type: 'genus',
        genus: 'humanoid',
        taxonomy: 'resource',
        val: -5,
    },
    carnivore: { // No agriculture tech tree path, however unemployed citizens now act as hunters.
        name: loc('trait_carnivore_name'),
        desc: loc('trait_carnivore'),
        type: 'genus',
        origin: 'carnivore',
        taxonomy: 'resource',
        val: 3,
        vars(r){ 
            // [Rot Percent]
            switch (r || traitRank('carnivore') || 1){
                case 0.1:
                    return [70];
                case 0.25:
                    return [65];
                case 0.5:
                    return [60];
                case 1:
                    return [50];
                case 2:
                    return [40];
                case 3:
                    return [35];
                case 4:
                    return [30];
            }
        },
    },
    beast: { // Improved hunting and soldier training
        name: loc('trait_beast_name'),
        desc: loc('trait_beast'),
        type: 'genus',
        origin: 'carnivore',
        taxonomy: 'resource',
        val: 2,
        vars(r){
            // [Hunting, Windy Hunting, Training Speed]
            switch (r || traitRank('beast') || 1){
                case 0.1:
                    return [3,6,3];
                case 0.25:
                    return [4,8,4];
                case 0.5:
                    return [5,10,5];
                case 1:
                    return [8,15,10];
                case 2:
                    return [10,20,15];
                case 3:
                    return [12,24,20];
                case 4:
                    return [14,28,25];
            }
        },
    },
    cautious: { // Rain reduces combat rating
        name: loc('trait_cautious_name'),
        desc: loc('trait_cautious'),
        type: 'genus',
        origin: 'carnivore',
        taxonomy: 'combat',
        val: -2,
        vars(r){ 
            switch (r || traitRank('cautious') || 1){
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
                    return [4];
            }
        },
    },
    herbivore: { // No food is gained from hunting
        name: loc('trait_herbivore_name'),
        desc: loc('trait_herbivore'),
        type: 'genus',
        origin: 'herbivore',
        taxonomy: 'resource',
        val: -7,
    },
    instinct: { // Avoids Danger
        name: loc('trait_instinct_name'),
        desc: loc('trait_instinct'),
        type: 'genus',
        genus: 'herbivore',
        taxonomy: 'utility',
        val: 5,
        vars(r){
            // [Surveyor Survival Boost, Reduce Combat Deaths %]
            switch (r || traitRank('instinct') || 1){
                case 0.1:
                    return [2,10];
                case 0.25:
                    return [3,15];
                case 0.5:
                    return [5,25];
                case 1:
                    return [10,50];
                case 2:
                    return [15,60];
                case 3:
                    return [20,65];
                case 4:
                    return [25,70];
            }
        },
    },
    forager: { // Will eat just about anything
        name: loc('trait_forager_name'),
        desc: loc('trait_forager'),
        type: 'genus',
        origin: 'hybrid',
        taxonomy: 'resource',
        val: 4,
        vars(r){
            // [Foraging Strength]
            switch (r || traitRank('forager') || 1){
                case 0.1:
                    return [70];
                case 0.25:
                    return [80];
                case 0.5:
                    return [90];
                case 1:
                    return [100];
                case 2:
                    return [110];
                case 3:
                    return [120];
                case 4:
                    return [130];
            }
        },
    },
    small: { // Reduces cost creep multipliers by 0.01
        name: loc('trait_small_name'),
        desc: loc('trait_small'),
        type: 'genus',
        origin: 'small',
        taxonomy: 'utility',
        val: 6,
        vars(r){
            // [Planet Creep, Space Creep]
            switch (r || traitRank('small') || 1){
                case 0.1:
                    return [0.0015,0.001];
                case 0.25:
                    return [0.0025,0.0015];
                case 0.5:
                    return [0.005,0.0025];
                case 1:
                    return [0.01,0.005];
                case 2:
                    return [0.0125,0.006];
                case 3:
                    return [0.015,0.0075];
                case 4:
                    return [0.016,0.008];
            }
        },
    },
    weak: { // Lumberjacks, miners, and quarry workers are 10% less effective
        name: loc('trait_weak_name'),
        desc: loc('trait_weak'),
        type: 'genus',
        origin: 'small',
        taxonomy: 'resource',
        val: -3,
        vars(r){
            switch (r || traitRank('weak') || 1){
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
                    return [4];
            }
        },
    },
    large: { // Increases plantery cost creep multipliers by 0.005
        name: loc('trait_large_name'),
        desc: loc('trait_large'),
        type: 'genus',
        origin: 'giant',
        taxonomy: 'utility',
        val: -5,
        vars(r){
            switch (r || traitRank('large') || 1){
                case 0.1:
                    return [0.008];
                case 0.25:
                    return [0.007];
                case 0.5:
                    return [0.006];
                case 1:
                    return [0.005];
                case 2:
                    return [0.004];
                case 3:
                    return [0.003];
                case 4:
                    return [0.002];
            }
        },
    },
    strong: { // Increased manual resource gain
        name: loc('trait_strong_name'),
        desc: loc('trait_strong'),
        type: 'genus',
        origin: 'giant',
        taxonomy: 'resource',
        val: 5,
        vars(r){
            // [Manual Gathering, Basic Jobs]
            switch (r || traitRank('strong') || 1){
                case 0.1:
                    return [2,1.1];
                case 0.25:
                    return [2,1.25];
                case 0.5:
                    return [3,1.5];
                case 1:
                    return [4,2];
                case 2:
                    return [5,2.25];
                case 3:
                    return [6,2.5];
                case 4:
                    return [7,2.75];
            }
        },
    },
    cold_blooded: { // Weather affects productivity
        name: loc('trait_cold_blooded_name'),
        desc: loc('trait_cold_blooded'),
        type: 'genus',
        origin: 'reptilian',
        taxonomy: 'production',
        val: -2,
        vars(r){
            // [Weather Penalty, Weather Bonus]
            switch (r || traitRank('cold_blooded') || 1){
                case 0.25:
                    return [30,6];
                case 0.5:
                    return [25,8];
                case 1:
                    return [20,10];
                case 2:
                    return [15,15];
                case 3:
                    return [12,18];
                case 4:
                    return [10,20];
            }
        },
    },
    scales: { // Minor decrease of soldiers killed in combat
        name: loc('trait_scales_name'),
        desc: loc('trait_scales'),
        type: 'genus',
        origin: 'reptilian',
        taxonomy: 'combat',
        val: 5,
        vars(r){
            // [Win, Loss, Hell]
            switch (r || traitRank('scales') || 1){
                case 0.1:
                    return [1,0,0];
                case 0.25:
                    return [1,0,1];
                case 0.5:
                    return [1,1,1];
                case 1:
                    return [2,1,1];
                case 2:
                    return [2,2,1];
                case 3:
                    return [2,2,2];
                case 4:
                    return [3,2,2];
            }
        },
    },
    flier: { // Use Clay instead of Stone or Cement
        name: loc('trait_flier_name'),
        desc: loc('trait_flier'),
        type: 'genus',
        origin: 'avian',
        taxonomy: 'resource',
        val: 3,
        vars(r){
            // [Reduce Stone Costs, Extra Trade Post Route]
            switch (r || traitRank('flier') || 1){
                case 0.1:
                    return [5,0];
                case 0.25:
                    return [10,0];
                case 0.5:
                    return [15,0];
                case 1:
                    return [25,1];
                case 2:
                    return [40,1];
                case 3:
                    return [50,2];
                case 4:
                    return [60,2];
            }
        },
    },
    hollow_bones: { // Less Crafted Materials Needed
        name: loc('trait_hollow_bones_name'),
        desc: loc('trait_hollow_bones'),
        type: 'genus',
        origin: 'avian',
        taxonomy: 'resource',
        val: 2,
        vars(r){
            switch (r || traitRank('hollow_bones') || 1){
                case 0.1:
                    return [1];
                case 0.25:
                    return [2];
                case 0.5:
                    return [3];
                case 1:
                    return [5];
                case 2:
                    return [8];
                case 3:
                    return [10];
                case 4:
                    return [12]
            }
        },
    },
    sky_lover: { // Mining type jobs more stressful
        name: loc('trait_sky_lover_name'),
        desc: loc('trait_sky_lover'),
        type: 'genus',
        origin: 'avian',
        taxonomy: 'utility',
        val: -2,
        vars(r){
            switch (r || traitRank('sky_lover') || 1){
                case 0.1:
                    return [50];
                case 0.25:
                    return [40];
                case 0.5:
                    return [30];
                case 1:
                    return [20];
                case 2:
                    return [15];
                case 3:
                    return [10];
                case 4:
                    return [8];
            }
        },
    },
    rigid: { // Crafting production lowered slightly
        name: loc('trait_rigid_name'),
        desc: loc('trait_rigid'),
        type: 'genus',
        origin: 'avian',
        taxonomy: 'resource',
        val: -2,
        vars(r){
            switch (r || traitRank('rigid') || 1){
                case 0.1:
                    return [4];
                case 0.25:
                    return [3];
                case 0.5:
                    return [2];
                case 1:
                    return [1];
                case 2:
                    return [0.5];
                case 3:
                    return [0.4];
                case 4:
                    return [0.3];
            }
        },
    },
    high_pop: { // Population is higher, but less productive
        name: loc('trait_high_pop_name'),
        desc: loc('trait_high_pop'),
        type: 'genus',
        origin: 'insectoid',
        taxonomy: 'utility',
        val: 3,
        vars(r){
            // [Citizen Cap, Worker Effectiveness, Growth Multiplier]
            switch (r || traitRank('high_pop') || 1){
                case 0.1:
                    return [2, 50, 1.2];
                case 0.25:
                    return [2, 50, 1.5];
                case 0.5:
                    return [3, 34, 2.5];
                case 1:
                    return [4, 26, 3.5];
                case 2:
                    return [5, 21.2, 4.5];
                case 3:
                    return [6, 18, 5.5];
                case 4:
                    return [7, 15.8, 6.5];
            }
        },
    },
    fast_growth: { // Greatly increases odds of population growth each cycle
        name: loc('trait_fast_growth_name'),
        desc: loc('trait_fast_growth'),
        type: 'genus',
        origin: 'insectoid',
        taxonomy: 'utility',
        val: 2,
        vars(r){
            // [bound multi, bound add]
            switch (r || traitRank('fast_growth') || 1){
                case 0.1:
                    return [1.2,1];
                case 0.25:
                    return [1.5,1];
                case 0.5:
                    return [2,1];
                case 1:
                    return [2,2];
                case 2:
                    return [2.5,3];
                case 3:
                    return [3,3];
                case 4:
                    return [3.5,3];
            }
        },
    },
    high_metabolism: { // Food requirements increased by 5%
        name: loc('trait_high_metabolism_name'),
        desc: loc('trait_high_metabolism'),
        type: 'genus',
        origin: 'insectoid',
        taxonomy: 'utility',
        val: -1,
        vars(r){
            switch (r || traitRank('high_metabolism') || 1){
                case 0.1:
                    return [12];
                case 0.25:
                    return [10];
                case 0.5:
                    return [8];
                case 1:
                    return [5];
                case 2:
                    return [3];
                case 3:
                    return [2];
                case 4:
                    return [1];
            }
        },
    },
    photosynth: { // Reduces food requirements dependant on sunshine.
        name: loc('trait_photosynth_name'),
        desc: loc('trait_photosynth'),
        type: 'genus',
        origin: 'plant',
        taxonomy: 'utility',
        val: 3,
        vars(r){
            // [Sunny, Cloudy, Rainy]
            switch (r || traitRank('photosynth') || 1){
                case 0.1:
                    return [5,4,3];
                case 0.25:
                    return [10,5,4];
                case 0.5:
                    return [20,10,5];
                case 1:
                    return [40,20,10];
                case 2:
                    return [50,30,15];
                case 3:
                    return [60,35,20];
                case 4:
                    return [70,40,25];
            }
        },
    },
    sappy: { // Stone is replaced with Amber.
        name: loc('trait_sappy_name'),
        desc: loc('trait_sappy',[loc('resource_Amber_name')]),
        type: 'genus',
        origin: 'plant',
        taxonomy: 'resource',
        val: 4,
        vars(r){
            switch (r || traitRank('sappy') || 1){
                case 0.1:
                    return [0.3];
                case 0.25:
                    return [0.4];
                case 0.5:
                    return [0.5];
                case 1:
                    return [0.6];
                case 2:
                    return [0.65];
                case 3:
                    return [0.7];
                case 4:
                    return [0.75];
            }
        },
    },
    asymmetrical: { // Trade selling prices are slightly worse then normal
        name: loc('trait_asymmetrical_name'),
        desc: loc('trait_asymmetrical'),
        type: 'genus',
        origin: 'plant',
        taxonomy: 'utility',
        val: -3,
        vars(r){
            switch (r || traitRank('asymmetrical') || 1){
                case 0.1:
                    return [35];
                case 0.25:
                    return [30];
                case 0.5:
                    return [25];
                case 1:
                    return [20];
                case 2:
                    return [15];
                case 3:
                    return [10];
                case 4:
                    return [5];
            }
        },
    },
    detritivore: { // You eat dead matter
        name: loc('trait_detritivore_name'),
        desc: loc('trait_detritivore'),
        type: 'genus',
        origin: 'fungi',
        taxonomy: 'utility',
        val: 2,
        vars(r){
            switch (r || traitRank('detritivore') || 1){
                case 0.1:
                    return [60];
                case 0.25:
                    return [65];
                case 0.5:
                    return [72];
                case 1:
                    return [80];
                case 2:
                    return [85];
                case 3:
                    return [90];
                case 4:
                    return [95];
            }
        },
    },
    spores: { // Birthrate increased when it's windy
        name: loc('trait_spores_name'),
        desc: loc('trait_spores'),
        type: 'genus',
        origin: 'fungi',
        taxonomy: 'utility',
        val: 2,
        vars(r){
            // [Bound Add, Bound Multi, Bound Add Parasite]
            switch (r || traitRank('spores') || 1){
                case 0.1:
                    return [1,1.2,1];
                case 0.25:
                    return [1,1.5,1];
                case 0.5:
                    return [2,1.5,1];
                case 1:
                    return [2,2,1];
                case 2:
                    return [2,2.5,2];
                case 3:
                    return [2,3,2];
                case 4:
                    return [3,3.5,2];
            }
        },
    },
    spongy: { // Birthrate decreased when it's raining
        name: loc('trait_spongy_name'),
        desc: loc('trait_spongy'),
        type: 'genus',
        origin: 'fungi',
        taxonomy: 'utility',
        val: -2,
    },
    submerged: { // Immune to weather effects
        name: loc('trait_submerged_name'),
        desc: loc('trait_submerged'),
        type: 'genus',
        origin: 'aquatic',
        taxonomy: 'utility',
        val: 3,
    },
    low_light: { // Farming effectiveness decreased
        name: loc('trait_low_light_name'),
        desc: loc('trait_low_light'),
        type: 'genus',
        origin: 'aquatic',
        taxonomy: 'resource',
        val: -2,
        vars(r){
            switch (r || traitRank('low_light') || 1){
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
                    return [4];
            }
        },
    },
};
