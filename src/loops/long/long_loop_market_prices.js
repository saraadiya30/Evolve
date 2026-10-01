// Fluktuasi harga pasar per detik.
import { global } from '../../core/vars.js';
import { govActive } from '../../governor/gov_active.js';
import { resource_values } from '../../config/constants.js';

export function longLoopMarketPrices($ctx){
        // Market price fluctuation
        if (global.tech['currency'] && global.tech['currency'] >= 2){
            let fluxVal = govActive('risktaker',0) ? 2 : 4;
            Object.keys(resource_values).forEach(function (res) {
                let r_val = global.race['truepath'] ? resource_values[res] * 2 : resource_values[res];
                if (res === 'Copper' && global.tech['high_tech'] && global.tech['high_tech'] >= 2){
                    r_val *= 2;
                }
                if (res === 'Titanium'){
                    if (global.tech['titanium'] && global.tech['titanium'] > 0){
                        r_val *= global.resource.Alloy.display ? 1 : 2.5;
                    }
                    else {
                        r_val *= 5;
                    }
                }
                if (global.resource[res].display && Math.rand(0,fluxVal) === 0){
                    let max = r_val * 3;
                    let min = r_val / 2;
                    let variance = (Math.rand(0,200) - 100) / 100;
                    let new_value = global.resource[res].value + variance;
                    if (new_value < min){
                        new_value = r_val;
                    }
                    else if (new_value > max){
                        new_value = max - r_val;
                    }
                    global.resource[res].value = new_value;
                }
            });
        }
}
