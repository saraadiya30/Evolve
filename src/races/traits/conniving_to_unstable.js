import { loc } from '../../core/locale.js';
import { traitRank } from '../trait_logic/trait_ranks.js';

// Bagian dari traits (26 entri: conniving .. unstable), dipisah dari races.js. Urutan entri sama persis.
export const traitsPart6 = {
    conniving: { // Better trade deals
        name: loc('trait_conniving_name'),
        desc: loc('trait_conniving'),
        type: 'major',
        origin: 'imp',
        taxonomy: 'resource',
        val: 4,
        vars(r){
            // [Buy Price, Sell Price]
            switch (r || traitRank('conniving') || 1){
                case 0.1:
                    return [1,6];
                case 0.25:
                    return [2,8];
                case 0.5:
                    return [3,10];
                case 1:
                    return [5,15];
                case 2:
                    return [8,20];
                case 3:
                    return [10,24];
                case 4:
                    return [12,28];
            }
        }
    },
    pathetic: { // You suck at combat
        name: loc('trait_pathetic_name'),
        desc: loc('trait_pathetic'),
        type: 'major',
        origin: 'imp',
        taxonomy: 'combat',
        val: -5,
        vars(r){
            switch (r || traitRank('pathetic') || 1){
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
        }
    },
    spiritual: { // Temples are 13% more effective
        name: loc('trait_spiritual_name'),
        desc: loc('trait_spiritual'),
        type: 'major',
        origin: 'seraph',
        taxonomy: 'production',
        val: 4,
        vars(r){
            switch (r || traitRank('spiritual') || 1){
                case 0.1:
                    return [6];
                case 0.25:
                    return [8];
                case 0.5:
                    return [10];
                case 1:
                    return [13];
                case 2:
                    return [15];
                case 3:
                    return [18];
                case 4:
                    return [20];
            }
        }
    },
    truthful: { // Bankers are less effective
        name: loc('trait_truthful_name'),
        desc: loc('trait_truthful'),
        type: 'major',
        origin: 'seraph',
        taxonomy: 'resource',
        val: -7,
        vars(r){
            switch (r || traitRank('truthful') || 1){
                case 0.1:
                    return [85];
                case 0.25:
                    return [75];
                case 0.5:
                    return [65];
                case 1:
                    return [50];
                case 2:
                    return [30];
                case 3:
                    return [20];
                case 4:
                    return [15];
            }
        }
    },
    unified: { // Start with unification
        name: loc('trait_unified_name'),
        desc: loc('trait_unified'),
        type: 'major',
        origin: 'seraph',
        taxonomy: 'production',
        val: 4,
        vars(r){
            // [Bonus to unification]
            switch (r || traitRank('unified') || 1){
                case 0.1:
                    return [0];
                case 0.25:
                    return [1];
                case 0.5:
                    return [2];
                case 1:
                    return [3];
                case 2:
                    return [5];
                case 3:
                    return [7];
                case 4:
                    return [8];
            }
        }
    },
    rainbow: { // Gain a bonus if sunny after raining
        name: loc('trait_rainbow_name'),
        desc: loc('trait_rainbow'),
        type: 'major',
        origin: 'unicorn',
        taxonomy: 'production',
        val: 3,
        vars(r){
            switch (r || traitRank('rainbow') || 1){
                case 0.1:
                    return [10];
                case 0.25:
                    return [20];
                case 0.5:
                    return [30];
                case 1:
                    return [50];
                case 2:
                    return [80];
                case 3:
                    return [100];
                case 4:
                    return [120];
            }
        }
    },
    gloomy: { // Gain a bonus if cloudy
        name: loc('trait_gloomy_name'),
        desc: loc('trait_gloomy'),
        type: 'major',
        origin: 'unicorn',
        taxonomy: 'production',
        val: 3,
        vars(r){
            switch (r || traitRank('gloomy') || 1){
                case 0.1:
                    return [3];
                case 0.25:
                    return [5];
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
        }
    },
    magnificent: { // construct shrines to receive boons
        name: loc('trait_magnificent_name'),
        desc: loc('trait_magnificent'),
        type: 'major',
        origin: 'unicorn',
        taxonomy: 'utility',
        val: 6,
        vars(r){
            // [Knowledge Base, Knowledge Scale, Tax Bonus, Metal Bonus, Morale Bonus]
            switch (r || traitRank('magnificent') || 1){
                case 0.1:
                    return [250, 1, 0.35, 0.65, 0.5];
                case 0.25:
                    return [300, 1, 0.5, 0.75, 1];
                case 0.5:
                    return [350, 2, 0.75, 0.8, 1];
                case 1:
                    return [400, 3, 1, 1, 1];
                case 2:
                    return [450, 3, 1.5, 1.5, 1.5];
                case 3:
                    return [500, 3, 2, 2, 2];
                case 4:
                    return [520, 3, 2.5, 2.5, 2.5];
            }
        }
    },
    noble: { // Unable to raise taxes above base value or set very low taxes
        name: loc('trait_noble_name'),
        desc: loc('trait_noble'),
        type: 'major',
        origin: 'unicorn',
        taxonomy: 'resource',
        val: -3,
        vars(r){
            // [min tax, max tax]
            switch (r || traitRank('noble') || 1){
                case 0.1:
                    return [18,20];
                case 0.25:
                    return [15,20];
                case 0.5:
                    return [12,20];
                case 1:
                    return [10,20];
                case 2:
                    return [10,24];
                case 3:
                    return [10,28];
                case 4:
                    return [10,30];
            }
        }
    },
    imitation: { // You are an imitation of another species
        name: loc('trait_imitation_name'),
        desc: loc('trait_imitation'),
        type: 'major',
        origin: 'synth',
        taxonomy: 'utility',
        val: 6,
        vars(r){
            // [Postitive Trait Rank, Negative Trait Rank]
            switch (r || traitRank('imitation') || 1){
                case 0.1:
                    return [0.5,0.1]
                case 0.25:
                    return [0.5,0.25];
                case 0.5:
                    return [0.5,0.5];
                case 1:
                    return [0.5,1];
                case 2:
                    return [0.5,2];
                case 3:
                    return [0.5,3];
                case 4:
                    return [0.5,4];
            }
        }
    },
    emotionless: { // You have no emotions, cold logic dictates your decisions
        name: loc('trait_emotionless_name'),
        desc: loc('trait_emotionless'),
        type: 'major',
        origin: 'synth',
        taxonomy: 'production',
        val: -4,
        vars(r){
            // [Entertainer Reduction, Stress Reduction]
            switch (r || traitRank('emotionless') || 1){
                case 0.1:
                    return [55,8];
                case 0.25:
                    return [50,10];
                case 0.5:
                    return [45,10];
                case 1:
                    return [35,13];
                case 2:
                    return [25,15];
                case 3:
                    return [20,15];
                case 4:
                    return [18,16];
            }
        }
    },
    logical: { // Citizens add Knowledge
        name: loc('trait_logical_name'),
        desc: loc('trait_logical'),
        type: 'major',
        origin: 'synth',
        taxonomy: 'utility',
        val: 6,
        vars(r){
            // [Reduce Wardenclyffe Knowledge Cost, Knowledge per Citizen]
            switch (r || traitRank('logical') || 1){
                case 0.1:
                    return [10,5];
                case 0.25:
                    return [25,10];
                case 0.5:
                    return [50,15];
                case 1:
                    return [100,25];
                case 2:
                    return [125,30];
                case 3:
                    return [150,32];
                case 4:
                    return [160,33];
            }
        }
    },
    shapeshifter: {
        name: loc('trait_shapeshifter_name'),
        desc: loc('trait_shapeshifter'),
        type: 'major',
        origin: 'nano',
        taxonomy: 'utility',
        val: 10,
        vars(r){
            // [Postitive Trait Rank, Negative Trait Rank]
            switch (r || traitRank('shapeshifter') || 1){
                case 0.1:
                    return [0.5,0.1];
                case 0.25:
                    return [0.5,0.25];
                case 0.5:
                    return [0.5,0.5];
                case 1:
                    return [0.5,1];
                case 2:
                    return [0.5,2];
                case 3:
                    return [0.5,3];
                case 4:
                    return [0.5,4];
            }
        }
    },
    deconstructor: {
        name: loc('trait_deconstructor_name'),
        desc: loc('trait_deconstructor'),
        type: 'major',
        origin: 'nano',
        taxonomy: 'utility',
        val: -4,
        vars(r){
            switch (r || traitRank('deconstructor') || 1){
                case 0.1:
                    return [25]
                case 0.25:
                    return [40];
                case 0.5:
                    return [60];
                case 1:
                    return [100];
                case 2:
                    return [125];
                case 3:
                    return [140];
                case 4:
                    return [150];
            }
        }
    },
    linked: {
        name: loc('trait_linked_name'),
        desc: loc('trait_linked'),
        type: 'major',
        origin: 'nano',
        taxonomy: 'utility',
        val: 4,
        vars(r){
            // [Quantum Bonus per Citizen, Softcap]
            switch (r || traitRank('linked') || 1){
                case 0.1:
                    return [0.02,40];
                case 0.25:
                    return [0.03,40];
                case 0.5:
                    return [0.05,40];
                case 1:
                    return [0.1,80];
                case 2:
                    return [0.12,100];
                case 3:
                    return [0.14,100];
                case 4:
                    return [0.15,100];
            }
        }
    },
    dark_dweller: {
        name: loc('trait_dark_dweller_name'),
        desc: loc('trait_dark_dweller'),
        type: 'major',
        origin: 'ghast',
        taxonomy: 'resource',
        val: -3,
        vars(r){
            switch (r || traitRank('dark_dweller') || 1){
                case 0.1:
                    return [99];
                case 0.25:
                    return [90];
                case 0.5:
                    return [75];
                case 1:
                    return [60];
                case 2:
                    return [45];
                case 3:
                    return [30];
                case 4:
                    return [25];
            }
        }
    },
    swift: {
        name: loc('trait_swift_name'),
        desc: loc('trait_swift'),
        type: 'major',
        origin: 'ghast',
        taxonomy: 'combat',
        val: 10,
        vars(r){
            // [Combat Bonus, Thrall Catch Bonus]
            switch (r || traitRank('swift') || 1){
                case 0.1:
                    return [20,8];
                case 0.25:
                    return [35,15];
                case 0.5:
                    return [55,30];
                case 1:
                    return [75,45];
                case 2:
                    return [85,55];
                case 3:
                    return [90,65];
                case 4:
                    return [92,70];
            }
        }
    },
    anthropophagite: {
        name: loc('trait_anthropophagite_name'),
        desc: loc('trait_anthropophagite'),
        type: 'major',
        origin: 'ghast',
        taxonomy: 'utility',
        val: -2,
        vars(r){
            switch (r || traitRank('anthropophagite') || 1){
                case 0.1:
                    return [0.25];
                case 0.25:
                    return [0.4];
                case 0.5:
                    return [0.65];
                case 1:
                    return [1];
                case 2:
                    return [1.5];
                case 3:
                    return [2];
                case 4:
                    return [2.5];
            }
        }
    },
    living_tool: {
        name: loc('trait_living_tool_name'),
        desc: loc('trait_living_tool'),
        type: 'major',
        origin: 'shoggoth',
        taxonomy: 'resource',
        val: 12,
        vars(r){
            // [Tool Factor, Crafting Factor]
            switch (r || traitRank('living_tool') || 1){
                case 0.1:
                    return [0.5,2];
                case 0.25:
                    return [0.65,5];
                case 0.5:
                    return [0.8,12];
                case 1:
                    return [1,25];
                case 2:
                    return [1.1,35];
                case 3:
                    return [1.2,42];
                case 4:
                    return [1.25,45];
            }
        }
    },
    bloated: {
        name: loc('trait_bloated_name'),
        desc: loc('trait_bloated'),
        type: 'major',
        origin: 'shoggoth',
        taxonomy: 'utility',
        val: -10,
        vars(r){
            // [Costs are higher]
            switch (r || traitRank('bloated') || 1){
                case 0.1:
                    return [30];
                case 0.25:
                    return [25];
                case 0.5:
                    return [20];
                case 1:
                    return [15];
                case 2:
                    return [10];
                case 3:
                    return [6];
                case 4:
                    return [4];
            }
        }
    },
    artisan: {
        name: loc('trait_artisan_name'),
        desc: loc('trait_artisan'),
        type: 'major',
        origin: 'dwarf',
        taxonomy: 'resource',
        val: 9,
        vars(r){
            // [Auto Crafting Boost, Manufacturing Boost, Improved Morale]
            switch (r || traitRank('artisan') || 1){
                case 0.1:
                    return [15,8,0.15];
                case 0.25:
                    return [20,10,0.2];
                case 0.5:
                    return [35,15,0.35];
                case 1:
                    return [50,20,0.5];
                case 2:
                    return [60,25,0.55];
                case 3:
                    return [70,30,0.6];
                case 4:
                    return [80,35,0.65];
            }
        }
    },
    stubborn: {
        name: loc('trait_stubborn_name'),
        desc: loc('trait_stubborn'),
        type: 'major',
        origin: 'dwarf',
        taxonomy: 'utility',
        val: -5,
        vars(r){
            // Raises Knowledge cost of scientific advancements
            switch (r || traitRank('stubborn') || 1){
                case 0.1:
                    return [20];
                case 0.25:
                    return [18];
                case 0.5:
                    return [14];
                case 1:
                    return [10];
                case 2:
                    return [6];
                case 3:
                    return [4];
                case 4:
                    return [3];
            }
        }
    },
    rogue: {
        name: loc('trait_rogue_name'),
        desc: loc('trait_rogue'),
        type: 'major',
        origin: 'raccoon',
        taxonomy: 'resource',
        val: 6,
        vars(r){
            // [Randomly Steal Things]
            switch (r || traitRank('rogue') || 1){
                case 0.1:
                    return [4];
                case 0.25:
                    return [6];
                case 0.5:
                    return [8];
                case 1:
                    return [10];
                case 2:
                    return [12];
                case 3:
                    return [14];
                case 4:
                    return [16];
            }
        }
    },
    untrustworthy: {
        name: loc('trait_untrustworthy_name'),
        desc: loc('trait_untrustworthy'),
        type: 'major',
        origin: 'raccoon',
        taxonomy: 'utility',
        val: -4,
        vars(r){
            // [Financial Institutions Cost Extra]
            switch (r || traitRank('untrustworthy') || 1){
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
        }
    },
    living_materials: {
        name: loc('trait_living_materials_name'),
        desc: loc('trait_living_materials'),
        type: 'major',
        origin: 'lichen',
        taxonomy: 'resource',
        val: 6,
        vars(r){
            // [Some building materials self replicate reducing cost of the next building]
            // [Lumber/Bone, Plywood/Boneweave, Furs/Flesh, Amber (not Stone/Clay)]
            switch (r || traitRank('living_materials') || 1){
                case 0.1:
                    return [0.995];
                case 0.25:
                    return [0.99];
                case 0.5:
                    return [0.98];
                case 1:
                    return [0.97];
                case 2:
                    return [0.96];
                case 3:
                    return [0.95];
                case 4:
                    return [0.94];
            }
        }
    },
    unstable: {
        name: loc('trait_unstable_name'),
        desc: loc('trait_unstable'),
        type: 'major',
        origin: 'lichen',
        taxonomy: 'utility',
        val: -5,
        vars(r){
            // [Randomly Die]
            switch (r || traitRank('unstable') || 1){
                case 0.1:
                    return [7,10];
                case 0.25:
                    return [6,10];
                case 0.5:
                    return [5,10];
                case 1:
                    return [4,10];
                case 2:
                    return [3,10];
                case 3:
                    return [2,10];
                case 4:
                    return [1,10];
            }
        }
    },
};
