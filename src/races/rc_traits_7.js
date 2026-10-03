import { loc } from '../core/locale.js';
import { global } from '../core/vars.js';
import { traitRank } from './races.js';

// Bagian dari traits (31 entri: elemental .. mastery), dipisah dari races.js. Urutan entri sama persis.
export const traitsPart7 = {
    elemental: {
        name: loc('trait_elemental_name'),
        desc: loc('trait_elemental'),
        type: 'major',
        origin: 'wyvern',
        taxonomy: 'utility',
        val: 5,
        vars(r){
            let element = 'fire';
            switch (global.city.biome || 'grassland'){
                case 'savanna':
                case 'forest':
                case 'swamp':
                    element = 'acid';
                    break;
                case 'grassland':
                case 'desert':
                case 'eden':
                    element = 'electric';
                    break;
                case 'oceanic':
                case 'tundra':
                case 'taiga':
                    element = 'frost';
                    break;
                case 'volcanic':
                case 'ashland':
                case 'hellscape':
                    element = 'fire';
                    break;
            }

            // [Element, Electric, Acid, Fire, Frost, Combat]
            // [Type, Power, Industry, Smelting, Bioscience, Combat]
            switch (r || traitRank('elemental') || 1){
                case 0.1:
                    return [element, 0.08, 0.01, 0.02, 0.005, 1];
                case 0.25:
                    return [element, 0.12, 0.02, 0.03, 0.01, 2];
                case 0.5:
                    return [element, 0.16, 0.04, 0.06, 0.02, 4];
                case 1:
                    return [element, 0.2, 0.06, 0.09, 0.03, 6];
                case 2:
                    return [element, 0.23, 0.08, 0.12, 0.04, 8];
                case 3:
                    return [element, 0.26, 0.10, 0.15, 0.05, 10];
                case 4:
                    return [element, 0.28, 0.12, 0.18, 0.06, 12];
            }
        }
    },
    chicken: {
        name: loc('trait_chicken_name'),
        desc: loc('trait_chicken'),
        type: 'major',
        origin: 'wyvern',
        taxonomy: 'combat',
        val: -8,
        vars(r){
            // [Hell Worse, Piracy Worse, Events Worse]
            switch (r || traitRank('chicken') || 1){
                case 0.1:
                    return [110,20];
                case 0.25:
                    return [100,18];
                case 0.5:
                    return [75,15];
                case 1:
                    return [50,12];
                case 2:
                    return [40,9];
                case 3:
                    return [30,6];
                case 4:
                    return [20,3];
            }
        }
    },
    tusk: {
        name: loc('trait_tusk_name'),
        desc: loc('trait_tusk'),
        type: 'major',
        origin: 'narwhal',
        taxonomy: 'resource',
        val: 6,
        vars(r){
            let moisture = 0;
            switch (global.city.biome || 'grassland'){
                case 'oceanic':
                case 'swamp':
                    moisture = 30;
                    break;
                case 'eden':
                case 'forest':
                case 'grassland':
                case 'savanna':
                    moisture = 20;
                    break;
                case 'tundra':
                case 'taiga':
                    moisture = 10;
                    break;
                case 'desert':
                case 'volcanic':
                case 'ashland':
                case 'hellscape':
                    moisture = 0;
                    break;
            }

            if (global.city.calendar.weather === 0 && global.city.calendar.temp > 0){
                moisture += 10;
            }

            // [Mining based on Attack, Attack Bonus]
            switch (r || traitRank('tusk') || 1){
                case 0.1:
                    return [80,Math.round(moisture * 0.4)];
                case 0.25:
                    return [100,Math.round(moisture * 0.5)];
                case 0.5:
                    return [130,Math.round(moisture * 0.75)];
                case 1:
                    return [160,Math.round(moisture * 1)];
                case 2:
                    return [190,Math.round(moisture * 1.2)];
                case 3:
                    return [220,Math.round(moisture * 1.4)];
                case 4:
                    return [250,Math.round(moisture * 1.6)];
            }
        }
    },
    blubber: {
        name: loc('trait_blubber_name'),
        desc: loc('trait_blubber'),
        type: 'major',
        origin: 'narwhal',
        taxonomy: 'resource',
        val: -3,
        vars(r){
            // [Refine your dead to make Oil]
            switch (r || traitRank('blubber') || 1){
                case 0.1:
                    return [2.5];
                case 0.25:
                    return [2];
                case 0.5:
                    return [1.5];
                case 1:
                    return [1];
                case 2:
                    return [0.75];
                case 3:
                    return [0.5];
                case 4:
                    return [0.25];
            }
        }
    },
    ocular_power: {
        name: loc('trait_ocular_power_name'),
        desc: loc('trait_ocular_power'),
        type: 'major',
        origin: 'beholder',
        taxonomy: 'utility',
        val: 9,
        vars(r){
            // [Powers Active, Power Scaling]
            switch (r || traitRank('ocular_power') || 1){
                case 0.1:
                    return [1, 10];
                case 0.25:
                    return [1, 25];
                case 0.5:
                    return [1, 50];
                case 1:
                    return [2, 75];
                case 2:
                    return [2, 100];
                case 3:
                    return [3, 125];
                case 4:
                    return [3, 150];
            }
        }
    },
    floating: {
        name: loc('trait_floating_name'),
        desc: loc('trait_floating'),
        type: 'major',
        origin: 'beholder',
        taxonomy: 'production',
        val: -3,
        vars(r){
            // [Wind lowers production]
            switch (r || traitRank('floating') || 1){
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
        }
    },
    wish: {
        name: loc('trait_wish_name'),
        desc: loc('trait_wish'),
        type: 'major',
        origin: 'djinn',
        taxonomy: 'utility',
        val: 13,
        vars(r){
            // [Wish Cooldown Period]
            switch (r || traitRank('wish') || 1){
                case 0.1:
                    return [2520];
                case 0.25:
                    return [2160];
                case 0.5:
                    return [1800];
                case 1:
                    return [1440];
                case 2:
                    return [1080];
                case 3:
                    return [720];
                case 4:
                    return [540];
            }
        }
    },
    devious: {
        name: loc('trait_devious_name'),
        desc: loc('trait_devious'),
        type: 'major',
        origin: 'djinn',
        taxonomy: 'resource',
        val: -4,
        vars(r){
            // [Trade Less Productive]
            switch (r || traitRank('devious') || 1){
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
                    return [8];
            }
        }
    },
    grenadier: {
        name: loc('trait_grenadier_name'),
        desc: loc('trait_grenadier'),
        type: 'major',
        origin: 'bombardier',
        taxonomy: 'combat',
        val: 6,
        vars(r){
            // [More Powerful Soldiers but less of them]
            switch (r || traitRank('grenadier') || 1){
                case 0.1:
                    return [100];
                case 0.25:
                    return [110];
                case 0.5:
                    return [125];
                case 1:
                    return [150];
                case 2:
                    return [175];
                case 3:
                    return [200];
                case 4:
                    return [225];
            }
        }
    },
    aggressive: {
        name: loc('trait_aggressive_name'),
        desc: loc('trait_aggressive'),
        type: 'major',
        origin: 'bombardier',
        taxonomy: 'combat',
        val: -2,
        vars(r){
            // [Major Death, Minor Death]
            switch (r || traitRank('aggressive') || 1){
                case 0.1:
                    return [35,14]
                case 0.25:
                    return [30,12];
                case 0.5:
                    return [25,10];
                case 1:
                    return [20,8];
                case 2:
                    return [15,6];
                case 3:
                    return [10,4];
                case 4:
                    return [5,2];
            }
        }
    },
    empowered: {
        name: loc('trait_empowered_name'),
        desc: loc('trait_empowered'),
        type: 'major',
        origin: 'nephilim',
        taxonomy: 'utility',
        val: 8,
        vars(r){
            // [Boosts Other Traits]
            switch (r || traitRank('empowered') || 1){
                case 0.1:
                    return [-1,2];
                case 0.25:
                    return [-2,3];
                case 0.5:
                    return [-3,4];
                case 1:
                    return [-4,6];
                case 2:
                    return [-6,9];
                case 3:
                    return [-8,12];
                case 4:
                    return [-99,99];
            }
        }
    },
    blasphemous: {
        name: loc('trait_blasphemous_name'),
        desc: loc('trait_blasphemous'),
        type: 'major',
        origin: 'nephilim',
        taxonomy: 'production',
        val: -5,
        vars(r){
            // [Temples less effective]
            switch (r || traitRank('blasphemous') || 1){
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
                    return [4];
            }
        }
    },
    ooze: { // you are some kind of ooze, everything is bad
        name: loc('trait_ooze_name'),
        desc: loc('trait_ooze'),
        type: 'major',
        origin: 'sludge',
        taxonomy: 'production',
        val: -50,
        vars(r){
            // [All jobs worse, Theology weaker, Mastery weaker]
            switch (r || traitRank('ooze') || 1){
                case 0.1:
                    return [25,30,50];
                case 0.25:
                    return [20,25,40];
                case 0.5:
                    return [15,20,35];
                case 1:
                    return [12,15,30];
                case 2:
                    return [10,12,25];
                case 3:
                    return [8,10,20];
                case 4:
                    return [6,8,18];
            }
        }
    },
    soul_eater: { // You eat souls for breakfast, lunch, and dinner
        name: loc('trait_soul_eater_name'),
        desc: loc('trait_soul_eater'),
        type: 'special',
        val: 0,
    },
    untapped: { // Untapped Potential
        name: loc('trait_untapped_name'),
        desc: loc('trait_untapped'),
        type: 'special',
        val: 0,
    },
    emfield: { // Your body produces a natural electromagnetic field that disrupts electriciy
        name: loc('trait_emfield_name'),
        desc: loc('trait_emfield'),
        type: 'special',
        val: -20,
    },
    tactical: { // War Bonus
        name: loc('trait_tactical_name'),
        desc: loc('trait_tactical'),
        type: 'minor',
        vars(r){ return [5]; },
    },
    analytical: { // Science Bonus
        name: loc('trait_analytical_name'),
        desc: loc('trait_analytical'),
        type: 'minor',
        vars(r){ return [1]; },
    },
    promiscuous: { // Organics Growth Bonus, Synths Population Discount
        name: loc('trait_promiscuous_name'),
        desc: loc('trait_promiscuous'),
        type: 'minor',
        vars(r){ return [1,0.02]; },
    },
    resilient: { // Coal Mining Bonus
        name: loc('trait_resilient_name'),
        desc: loc('trait_resilient'),
        type: 'minor',
        vars(r){ return [2]; },
    },
    cunning: { // Hunting Bonus
        name: loc('trait_cunning_name'),
        desc: loc('trait_cunning'),
        type: 'minor',
        vars(r){ return [5]; },
    },
    hardy: { // Factory Woker Bonus
        name: loc('trait_hardy_name'),
        desc: loc('trait_hardy'),
        type: 'minor',
        vars(r){ return [1]; },
    },
    ambidextrous: { // Crafting Bonus
        name: loc('trait_ambidextrous_name'),
        desc: loc('trait_ambidextrous'),
        type: 'minor',
        vars(r){ return [3,2]; },
    },
    industrious: { // Miner Bonus
        name: loc('trait_industrious_name'),
        desc: loc('trait_industrious'),
        type: 'minor',
        vars(r){ return [2]; },
    },
    content: { // Morale Bonus
        name: loc('trait_content_name'),
        desc: loc('trait_content'),
        type: 'minor',
    },
    fibroblast: { // Healing Bonus
        name: loc('trait_fibroblast_name'),
        desc: loc('trait_fibroblast'),
        type: 'minor',
        vars(r){ return [2]; },
    },
    metallurgist: { // Alloy bonus
        name: loc('trait_metallurgist_name'),
        desc: loc('trait_metallurgist'),
        type: 'minor',
        vars(r){ return [4]; },
    },
    gambler: { // Casino bonus
        name: loc('trait_gambler_name'),
        desc: loc('trait_gambler'),
        type: 'minor',
        vars(r){ return [4]; },
    },
    persuasive: { // Trade bonus
        name: loc('trait_persuasive_name'),
        desc: loc('trait_persuasive'),
        type: 'minor',
        vars(r){ return [1]; },
    },
    fortify: { // gene fortification
        name: loc('trait_fortify_name'),
        desc: loc('trait_fortify'),
        type: 'special',
    },
    mastery: { // mastery booster
        name: loc('trait_mastery_name'),
        desc: loc('trait_mastery'),
        type: 'special',
        vars(r){ return [1]; },
    }
};
