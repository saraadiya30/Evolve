import { webWorker, global } from '../core/vars.js';
import { timeScale } from '../functions/resource_mod.js';
import { doCallbacks } from '../actions/core/queue_callbacks.js';
import { stockFlags } from '../stocks/stocks_core.js';
import { applyStockBreakdown } from '../stocks/stocks.js';
import { midLoop } from './mid/mid_loop_resource_caps.js';
import { longLoop } from './long/long_loop.js';
import { fastLoopCore } from './fast/fast_loop_core.js';
import { S_loops as S } from '../core/registries.js';

// Fungsi-fungsi dipindah dari main.js (urutan sumber dipertahankan). main.js tetap mengekspor ulang nama yang tadinya ter-ekspor.

 // Used to synchronize the fast, mid, and long loops to each other
export function execGameLoops(periods = 1){
    // Currently there is no smart catch-up mechanism
    // Limit to 1 minute (12 game days) of simulation per call
    const maxCatchUp = webWorker.longRatio * 12;
    periods = Math.min(periods, maxCatchUp); 

    while (webWorker.s && periods--){
        // While accelerated time is active one real tick is worth several ticks of game time: the fast loop runs once
        // (its production is scaled in modRes), but the tick counter advances by the full amount so the mid loop and the
        // long loop (game days) still come at the accelerated pace.
        let doMid = false;
        let doLong = false;
        for (let step = timeScale(); step > 0; step--){
            ++S.loopTick;
            doMid = doMid || (S.loopTick % webWorker.midRatio) === 0;
            doLong = doLong || (S.loopTick % webWorker.longRatio) === 0;
        }

        // Always run a faster loop before a slower loop
        fastLoop();
        if (doMid){ midLoop(); }

        // Perform callbacks before longLoop, so that any permanent results can be saved during longLoop
        doCallbacks();
        if (doLong){ longLoop(); }

        // Overflow prevention
        if (doMid && doLong){ S.loopTick = 0; }
    }
}

// Wrapper: the stock portfolio production bonus (modRes) is only active while the production loop runs.
function fastLoop(){
    S.moneyTick = null;
    S.moneyClampLost = 0;
    stockFlags.moneyLost = 0;
    S.moneyStart = global.resource.Money ? global.resource.Money.amount : NaN; // Money before this tick's production (see autoTradeStep)
    stockFlags.prod = true;
    try {
        fastLoopCore();
    }
    finally {
        stockFlags.prod = false;
    }
    applyStockBreakdown();
}
