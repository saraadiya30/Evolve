export { loadIndustry, defineIndustry, smelterFuelConfig, smelterUnlocked, addSmelter } from './industry_smelter.js';
export { luxGoodPrice } from './factory_panels.js';
export { setupRituals, cancelRituals, replicator, manaCost, maxRitualNum, gridEnabled, setPowerGrid } from './industry_panels.js';
export { gridDefs, clearGrids } from './power_grid.js';

export const f_rate = {
    Lux: {
        demand: [0.14,0.21,0.28,0.35,0.42],
        fur: [2,3,4,5,6]
    },
    Furs: {
        money: [10,15,20,25,30],
        polymer: [1.5,2.25,3,3.75,4.5],
        output: [1,1.5,2,2.5,3]
    },
    Alloy: {
        copper: [0.75,1.12,1.49,1.86,2.23],
        aluminium: [1,1.5,2,2.5,3],
        output: [0.075,0.112,0.149,0.186,0.223]
    },
    Polymer: {
        oil_kk: [0.22,0.33,0.44,0.55,0.66],
        oil: [0.18,0.27,0.36,0.45,0.54],
        lumber: [15,22,29,36,43],
        output: [0.125,0.187,0.249,0.311,0.373],
    },
    Nano_Tube: {
        coal: [8,12,16,20,24],
        neutronium: [0.05,0.075,0.1,0.125,0.15],
        output: [0.2,0.3,0.4,0.5,0.6],
    },
    Stanene: {
        aluminium: [30,45,60,75,90],
        nano: [0.02,0.03,0.04,0.05,0.06],
        output: [0.6,0.9,1.2,1.5,1.8],
    }
};

export const nf_resources = [
    'Lumber', 'Chrysotile', 'Stone', 'Crystal', 'Furs', 'Copper', 'Iron', 'Aluminium',
    'Cement', 'Coal', 'Oil', 'Uranium', 'Steel', 'Titanium', 'Alloy', 'Polymer',
    'Iridium', 'Helium_3', 'Water', 'Deuterium', 'Neutronium', 'Adamantite', 'Bolognium', 'Orichalcum',
];

export const ritual_types = ['farmer','miner','lumberjack','science','factory','army','hunting','crafting'];
