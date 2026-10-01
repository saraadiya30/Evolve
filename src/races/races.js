import { global } from '../core/vars.js';
import { loc } from '../core/locale.js';
import { altRace } from './race_helpers.js';
import { traits } from '../core/registries.js';
import { races } from '../core/registries.js';
export { setJType, racialTrait, servantTrait, randomMinorTrait, checkAltPurgatory, traitCostMod } from './trait_logic/racial_traits.js';
export { cleanAddTrait, cleanRemoveTrait, setImitation, shapeShift } from './trait_logic/trait_changes.js';
export { combineTraits, traitRank, setTraitRank, traitSkin, hoovedReskin, orbitLength, shellColor, foxColor, basicRace, renderSupernatural } from './trait_logic/trait_ranks.js';
export { fathomCheck } from './trait_logic/fathom_check.js';
export { renderPsychicPowers } from './powers/power_panels.js';
export { blubberFill } from './powers/psychic_powers.js';
export { altRace };


export const neg_roll_traits = ['angry','arrogant','atrophy','diverse','dumb','fragrant','frail','freespirit','gluttony','gnawer','greedy','hard_of_hearing','heavy','hooved','invertebrate','lazy','mistrustful','nearsighted','nyctophilia','paranoid','pathetic','pessimistic','puny','pyrophobia','skittish','slow','slow_regen','snowy','solitary','unorganized','unfavored'];



export { traits };


export { races };


export const genusVars = {
    organism: {},
    humanoid: {},
    carnivore: {},
    herbivore: {},
    omnivore: {},
    small: {},
    giant: {},
    reptilian: {},
    avian: {},
    insectoid: {},
    plant: {},
    fungi: {},
    aquatic: {},
    fey: {},
    heat: {},
    polar: {},
    sand: {},
    demonic: {},
    angelic: {},
    synthetic: {},
    eldritch: {}
};


export const biomes = {
    grassland: {
        label: loc('biome_grassland_name'),
        desc: loc('biome_grassland'),
        vars(){
            return global.race['rejuvenated'] ? [1.25] : [1.2];
        }, // [Agriculture]
        wiki: ['%']
    },
    oceanic: {
        label: loc('biome_oceanic_name'),
        desc: loc('biome_oceanic'),
        vars(){
            return global.race['rejuvenated'] ? [1.25,1.12,0.92] : [1.12,1.06,0.95];
        }, // [Iron Titanium, cSteel Titanium, Hunting Fur]
        wiki: ['%','%','%']
    },
    forest: {
        label: loc('biome_forest_name'),
        desc: loc('biome_forest'),
        vars(){
            return global.race['rejuvenated'] ? [1.35] : [1.2];
        }, // [Lumberjack Lumber]
        wiki: ['%']
    },
    desert: {
        label: loc('biome_desert_name'),
        desc: loc('biome_desert'),
        vars(){
            return global.race['rejuvenated'] ? [1.35,1.18,0.6] : [1.2,1.1,0.75];
        }, // [Quarry Worker, Oil Well, Lumberjack]
        wiki: ['%','%','%']
    },
    volcanic: {
        label: loc('biome_volcanic_name'),
        desc: loc('biome_volcanic'),
        vars(){
            return global.race['rejuvenated'] ? [0.8,1.25,1.15] : [0.9,1.12,1.08];
        }, // [Agriculture, Copper, Iron]
        wiki: ['%','%','%']
    },
    tundra: {
        label: loc('biome_tundra_name'),
        desc: loc('biome_tundra'),
        vars(){
            return global.race['rejuvenated'] ? [1.5,0.8] : [1.25,0.9];
        }, // [Hunting Fur, Oil Well]
        wiki: ['%','%']
    },
    savanna: {
        label: loc('biome_savanna_name'),
        desc: loc('biome_savanna'),
        vars(){
            return global.race['rejuvenated'] ? [1.18, 1.25, 0.75] : [1.1, 1.18, 0.8];
        }, // [Agriculture, Hunting, Lumberjack]
        wiki: ['%','%','%']
    },
    swamp: {
        label: loc('biome_swamp_name'),
        desc: loc('biome_swamp'),
        vars(){
            return global.race['rejuvenated'] ? [1.6,1.35,1.15,0.78] : [1.4,1.25,1.1,0.88];
        }, // [City Defense, War Loot, Lumber, Stone]
        wiki: ['%','%','%','%']
    },
    ashland: {
        label: loc('biome_ashland_name'),
        desc: loc('biome_ashland'),
        vars(){
            return global.race['rejuvenated'] ? [0.55,1.35,1.2] : [0.62,1.25,1.1];
        }, // [Agriculture, Ashcrete, Iron & Copper]
        wiki: ['%','%','%']
    },
    taiga: {
        label: loc('biome_taiga_name'),
        desc: loc('biome_taiga'),
        vars(){
            return global.race['rejuvenated'] ? [1.2,1.65,0.88] : [1.1,1.5,0.92];
        }, // [Lumber, Pop Growth Speed, Oil Well]
        wiki: ['%','%','%']
    },
    hellscape: {
        label: loc('biome_hellscape_name'),
        desc: loc('biome_hellscape'),
        vars(){
            return global.race['rejuvenated'] ? [0.2] : [0.25];
        }, // [Agriculture]
        wiki: ['%']
    },
    eden: {
        label: loc('biome_eden_name'),
        desc: loc('biome_eden')
    }
};

export const planetTraits = {
    toxic: {
        label: loc('planet_toxic'),
        desc: loc('planet_toxic_desc'),
        vars(){
            return global.race['rejuvenated'] ? [2,1.5] : [1,1.25];
        }, // [Mutation Bonus, Birth Rate]
        wiki: ['A','-%']
    },
    mellow: {
        label: loc('planet_mellow'),
        desc: loc('planet_mellow_desc'),
        vars(){
            return global.race['rejuvenated'] ? [2,3,0.88] : [1.5,2,0.9];
        }, // [Unemployed and Soldier Stress Divisor, Job Stress Reduction, Production]
        wiki: ['%','A','%']
    },
    rage: {
        label: loc('planet_rage'),
        desc: loc('planet_rage_desc'),
        vars(){
            return global.race['rejuvenated'] ? [1.1,1.05,1] : [1.05,1.02,1];
        }, // [Combat, Hunting, Death]
        wiki: ['%','%','A']
    },
    stormy: {
        label: loc('planet_stormy'),
        desc: loc('planet_stormy_desc')
    },
    ozone: {
        label: loc('planet_ozone'),
        desc: loc('planet_ozone_desc'),
        vars(){
            return global.race['rejuvenated'] ? [0.18] : [0.25];
        }, // [Ozone Penalty]
        wiki: ['-A']
    },
    magnetic: {
        label: loc('planet_magnetic'),
        desc: loc('planet_magnetic_desc'),
        vars(){
            return global.race['rejuvenated'] ? [2,150,0.98] : [1,100,0.985];
        }, // [Sundial, Wardenclyffe, Miner]
        wiki: ['A','A','%']
    },
    trashed: {
        label: loc('planet_trashed'),
        desc: loc('planet_trashed_desc'),
        vars(){
            return global.race['rejuvenated'] ? [0.8,1.2] : [0.75,1];
        }, // [Agriculture, Scavenger Bonus]
        wiki: ['%','%']
    },
    elliptical: {
        label: loc('planet_elliptical'),
        desc: loc('planet_elliptical_desc'),
    },
    flare: {
        label: loc('planet_flare'),
        desc: loc('planet_flare_desc')
    },
    dense: {
        label: loc('planet_dense'),
        desc: loc('planet_dense_desc'),
        vars(){
            return global.race['rejuvenated'] ? [1.5,1.2,1.35] : [1.2,1,1.2];
        }, // [Mining Production, Miner Stress, Solar Fuel Cost]
        wiki: ['%','A','%']
    },
    unstable: {
        label: loc('planet_unstable'),
        desc: loc('planet_unstable_desc')
    },
    permafrost: {
        label: loc('planet_permafrost'),
        desc: loc('planet_permafrost_desc'),
        vars(){
            return global.race['rejuvenated'] ? [0.7,125] : [0.75,100];
        }, // [Mining Production, University Base]
        wiki: ['%','A']
    },
    retrograde: {
        label: loc('planet_retrograde'),
        desc: loc('planet_retrograde_desc')
    },
    kamikaze: {
        label: loc('planet_kamikaze'),
        desc: loc('planet_kamikaze_desc'),
        vars(){
            return [100,-1];
        }, // [Orbit, Orbit Loss]
        wiki: ['A','A']
    },
};
