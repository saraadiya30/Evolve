// Statistik kapal truepath (crew, speed, attack, fuel, power). Modul daun (systems/ship_core + core + functions), dipisah dari tau_ceti_shipyard.js supaya ship_orbits tidak saling impor dengan galangan.
import { shipCrewCalc, shipSpeedCalc, shipAttackCalc, shipFuelUseCalc, shipPowerCalc } from '../systems/ship_core.js';
import { global, p_on } from '../core/vars.js';
import { jobScale } from '../civics/jobs/job_scale.js';
import { powerModifier } from '../functions/power_modifiers.js';

export function shipCrewSize(ship){
    return shipCrewCalc(ship.class, global.race['grenadier'], jobScale);
}

export function shipSpeed(ship){
    let boost = ship.location === 'spc_dwarf' && p_on['m_relay'] && ship.transit === 0 && global.space['m_relay'] && global.space.m_relay.charged >= 10000 ? 3 : 1;
    return shipSpeedCalc(ship, boost);
}

export function shipAttackPower(ship){
    return shipAttackCalc(ship, global.race['wish'] && global.race['wishStats'] && global.race.wishStats.ship);
}

export function shipFuelUse(ship){
    return shipFuelUseCalc(ship);
}

export function shipPower(ship, wiki){
    return shipPowerCalc(ship, wiki, powerModifier);
}
