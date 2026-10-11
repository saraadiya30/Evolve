// Orbit decay dan kamikaze truepath per detik. Dulu bagian dari longLoop_s3.
import { global } from '../../core/vars.js';
import { orbitDecayed } from '../../actions/core/structure_ui.js';
import { orbitLength } from '../../races/trait_logic/trait_ranks.js';

export function longLoopOrbitDecay($ctx){
        if (global.race['orbit_decay']){
            if (!global.race['orbit_decayed']){
                $(`#infoTimer`).html(`T-${global.race['orbit_decay'] - global.stats.days}`);
            }
            orbitDecayed();
        }
        if (global.race['truepath'] && global.city.ptrait.includes('kamikaze') && orbitLength() <= 10){
            global.race['orbit_decay'] = 1;
            global.race['tidal_decay'] = 1;
            orbitDecayed();
        }
}
