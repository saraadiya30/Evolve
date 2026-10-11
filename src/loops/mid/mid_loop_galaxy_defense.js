// Pengecekan pertahanan galaksi (kapal dan region). Dulu bagian dari midLoop_s6.
import { global, gal_on } from '../../core/vars.js';
import { gatewayArmada, galaxyRegions } from '../../space/space.js';

export function midLoopGalaxyDefense($ctx){
        if (global.galaxy['defense']){
            // Check both ships and regions in reverse order to prioritize bigger ships and later systems above smaller ships and earlier systems
            for (let i = gatewayArmada.length - 1; i >= 0; i--){
                let ship = gatewayArmada[i];
                let count = 0;
                for (let j = galaxyRegions.length - 1; j >= 0; j--){
                    let region = galaxyRegions[j];
                    if (global.galaxy.defense.hasOwnProperty(region)){
                        count += global.galaxy.defense[region][ship];
                        if (isNaN(global.galaxy.defense[region][ship])){
                            global.galaxy.defense[region][ship] = 0;
                        }
                        if (count > gal_on[ship]){
                            let overflow = count - gal_on[ship];
                            global.galaxy.defense[region][ship] -= overflow;
                        }
                        if (global.galaxy.defense[region][ship] < 0){
                            global.galaxy.defense[region][ship] = 0;
                        }
                    }
                }
                if (count < gal_on[ship]){
                    let underflow = gal_on[ship] - count;
                    global.galaxy.defense.gxy_gateway[ship] += underflow;
                }
            }
        }
}
