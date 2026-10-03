import { races } from '../races/races.js';
import { outerTruth, tauCetiModules } from './truepath_registry.js';
import { outerTitan } from './tp_outer_titan.js';
import { outerEnceladus } from './tp_outer_enceladus.js';
import { outerTriton } from './tp_outer_triton.js';
import { outerKuiper } from './tp_outer_kuiper.js';
import { outerEris } from './tp_outer_eris.js';
import { tauStar } from './tp_tau_star.js';
import { tauHome } from './tp_tau_home.js';
import { tauRed } from './tp_tau_red.js';
import { tauGas } from './tp_tau_gas.js';
import { tauRoid } from './tp_tau_roid.js';
import { tauGas2 } from './tp_tau_gas2.js';
export { outerTruthTech, tauCetiTech, checkPathRequirements, renderTauCeti, drawShipYard, buildTPShipQueue, TPShipDesc, shipCrewSize, shipPower, shipAttackPower, shipSpeed, shipFuelUse, shipCosts, clearShipDrag } from './truepath_f1.js';
export { drawShips, syndicate, sensorRange, tritonWar, erisWar, setOrbits, genXYcoord, jumpGateShutdown } from './truepath_f2.js';
export { loneSurvivor } from './truepath_f3.js';
export { drawMap } from './truepath_f4.js';
import { S } from './truepath_f_state.js';

// Urutan key = urutan region lama.
Object.assign(outerTruth, {
    spc_titan: outerTitan,
    spc_enceladus: outerEnceladus,
    spc_triton: outerTriton,
    spc_kuiper: outerKuiper,
    spc_eris: outerEris
});
Object.assign(tauCetiModules, {
    tau_star: tauStar,
    tau_home: tauHome,
    tau_red: tauRed,
    tau_gas: tauGas,
    tau_roid: tauRoid,
    tau_gas2: tauGas2
});

export { tpStorageMultiplier, calcAIDrift, tauEnabled } from './tp_support.js';

export const shipyardRanks = {
    // Lower number -> higher in the auto-sorted list
    location: {
        spc_dwarf: 1,
        spc_moon: 2,
        spc_red: 3,
        spc_belt: 4,
        spc_gas: 5,
        spc_gas_moon: 6,
        spc_titan: 7,
        spc_enceladus: 8,
        spc_triton: 9,
        spc_kuiper: 10,
        spc_eris: 11,
        tauceti: 12,
    },
    class: {
        corvette: 1,
        frigate: 2,
        destroyer: 3,
        cruiser: 4,
        battlecruiser: 5,
        dreadnought: 6,
        explorer: 7,
    },
    engine: {
        ion: 1,
        tie: 3,
        pulse: 2,
        photon: 4,
        vacuum: 5,
        emdrive: 6,
    },
    power: {
        solar: 1,
        diesel: 2,
        fission: 3,
        fusion: 4,
        elerium: 5,
    }
};

export const spacePlanetStats = {
    spc_sun: { dist: 0, orbit: 0, size: 2 },
    spc_home: { dist: 1, orbit: -1, size: 0.6 },
    spc_moon: { dist: 1.01, orbit: -1, size: 0.1, moon: true },
    spc_red: { dist: 1.524, orbit: 687, size: 0.5 },
    spc_hell: { dist: 0.4, orbit: 88, size: 0.4 },
    spc_venus: { dist: 0.7, orbit: 225, size: 0.5 },
    spc_gas: { dist: 5.203, orbit: 4330, size: 1.25 },
    spc_gas_moon: { dist: 5.204, orbit: 4330, size: 0.2, moon: true },
    spc_belt: { dist: 2.7, orbit: 1642, size: 0.5, belt: true },
    spc_dwarf: { dist: 2.77, orbit: 1682, size: 0.5 },
    spc_saturn: { dist: 9.539, orbit: 10751, size: 1.1 },
    spc_titan: { dist: 9.536, orbit: 10751, size: 0.2, moon: true },
    spc_enceladus: { dist: 9.542, orbit: 10751, size: 0.1, moon: true },
    spc_uranus: { dist: 19.8, orbit: 30660, size: 1 },
    spc_neptune: { dist: 30.08, orbit: 60152, size: 1 },
    spc_triton: { dist: 30.1, orbit: 60152, size: 0.1, moon: true },
    spc_kuiper: { dist: 39.5, orbit: 90498, size: 0.5, belt: true },
    spc_eris: { dist: 68, orbit: 204060, size: 0.5 },
    tauceti: { dist: 752568.8, orbit: -2, size: 2 },
};

S.mapScale, S.mapShift;
