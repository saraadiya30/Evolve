// smelterFuelConfig: konfigurasi bahan bakar smelter. Modul daun (core/vars).
import { global } from '../core/vars.js';

export function smelterFuelConfig(){
    let fuel = {
        d_fuel: 'Lumber',
        l_type: 'Lumber',
        l_cost: 3,
        // Discount coal cost for species that (usually) cannot burn lumber
        c_cost: (global.race['kindling_kindred'] || global.race['smoldering']) ? 0.15 : 0.25,
        // Oil bonus is free with Forge trait
        o_cost: global.race['forge'] ? 0 : 0.35,
    };

    if (global.race['evil']){
        if (global.race['soul_eater'] && global.race.species !== 'wendigo' && !global.race['artificial']){
            fuel.l_type = 'Food';
        }
        else {
            fuel.l_type = 'Furs';
            fuel.l_cost = 1;
        }
    }
    // Set default fuel to coal if it's not possible to burn lumber, souls, or flesh
    else if (global.race['kindling_kindred'] || global.race['smoldering']){
        fuel.d_fuel = 'Coal';
    }

    // Synthetics start with oil unlocked and always default to its use
    if (global.race['artificial']) {
        fuel.d_fuel = 'Oil';
    }

    return fuel;
}
