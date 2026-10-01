import { global, tmp_vars, atrack } from '../core/vars.js';
import { stockFlags, productionLots, lotBonus } from '../stocks/stocks_core.js';

// Computes the relative to default duration of a single loop (common for all three loop types).
// Note that these values are not tied to the time_multiplier from fastLoop - the relative speed of time in the game
// is controlled by loop lengths.
// Speed of accelerated time (atrack.t > 0): game time runs this many times faster than real time.
export const TIME_ACCELERATION_FACTOR = 2;

// How many ticks of game time one real fast tick is worth right now (1 normally, 2 while accelerated time is active).
export function timeScale(){
    return atrack.t > 0 ? TIME_ACCELERATION_FACTOR : 1;
}

export function resetResBuffer(){
    // During fastLoop, temporarily increase the maximum storage to avoid unfortunate cases where
    // storage cannot be maximized as a result of consuming a resource after it is produced.
    // The resource buffer is eliminated at the end of fastLoop.
    Object.keys(tmp_vars.resource).forEach(function (res) {
        let temp_max = global.resource[res].max;
        // Don't change infinite storage (-1) into finite storage
        if (temp_max > 0){
            temp_max += global.resource[res].amount;
        }
        tmp_vars.resource[res].temp_max = temp_max;
    });
}

export function modRes(res,val,notrack,noStockBonus){
    if(res === 'Food' && global.race['fasting']){
        global.resource[res].amount = 0;
        return false;
    }
    // Accelerated time: everything the production loop adds or takes this tick is worth `timeScale()` ticks of game time
    if (!notrack && stockFlags.prod){
        val *= timeScale();
    }
    // Stock portfolio bonus: only boosts income produced during the production loop (see fastLoop wrapper in main.js).
    // noStockBonus: trade route income is bought/sold, not produced, so it must not be multiplied by the portfolio bonus.
    if (val > 0 && !notrack && !noStockBonus && stockFlags.prod && global.stocks && global.stocks.market && global.stocks.market[res] && productionLots(global.stocks.market[res]) > 0){
        val *= lotBonus(productionLots(global.stocks.market[res]));
    }
    let count = global.resource[res].amount + val;
    let success = true;
    let max = notrack ? global.resource[res].max : tmp_vars.resource[res].temp_max;
    if (count > max && max >= 0){
        // Income Money yang terpotong kapasitas tetap tercatat di delta, jadi auto-convert stock harus tahu jumlahnya
        if (res === 'Money' && !notrack && val > 0){
            stockFlags.moneyLost += count - max;
        }
        count = max;
    }
    else if (count < 0){
        success = false;
        count = 0;
    }
    if (!Number.isNaN(count)){
        global.resource[res].amount = count;
        if (!notrack){
            global.resource[res].delta += val;
            if (res === 'Mana' && val > 0){
                global.resource[res].gen_d += val;
            }
            else if (val < 0 && max >= 0){
                tmp_vars.resource[res].temp_max = Math.max(0, tmp_vars.resource[res].temp_max + val);
            }
        }
    }
    return success;
}
