import { webWorker } from './vars.js';
import { doCallbacks } from './actions.js';
import { stockFlags } from './stocks_core.js';
import { applyStockBreakdown, stockAutoTrade } from './stocks.js';
import { midLoop } from './main_g3.js';
import { longLoop } from './main_g4.js';
import { fastLoopCore } from './main_g2.js';
import { S } from './main_state.js';

// Fungsi-fungsi dipindah dari main.js (urutan sumber dipertahankan). main.js tetap mengekspor ulang nama yang tadinya ter-ekspor.

 // Used to synchronize the fast, mid, and long loops to each other
export function execGameLoops(periods = 1){
    // Currently there is no smart catch-up mechanism
    // Limit to 1 minute (12 game days) of simulation per call
    const maxCatchUp = webWorker.longRatio * 12;
    periods = Math.min(periods, maxCatchUp); 

    while (webWorker.s && periods--){
        ++S.loopTick;
        const doMid = (S.loopTick % webWorker.midRatio) === 0;
        const doLong = (S.loopTick % webWorker.longRatio) === 0;

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
export function fastLoop(){
    S.moneyTick = null;
    S.moneyClampLost = 0;
    stockFlags.prod = true;
    try {
        fastLoopCore();
    }
    finally {
        stockFlags.prod = false;
    }
    applyStockBreakdown();
    if (S.moneyTick !== null){
        stockAutoTrade(S.moneyTick.delta, S.moneyTick.seconds, S.moneyClampLost);
    }
}
