import { webWorker, global } from '../core/vars.js';
import { baseTimeScale, setTickScale } from '../functions/resource_mod.js';
import { doCallbacks } from '../actions/core/queue_callbacks.js';
import { stockFlags } from '../stocks/stocks_core.js';
import { applyStockBreakdown } from '../stocks/stocks.js';
import { midLoop } from './mid/mid_loop_resource_caps.js';
import { longLoop } from './long/long_loop.js';
import { fastLoopCore } from './fast/fast_loop_core.js';
import { S_loops as S } from '../core/registries.js';


// Most periods one execGameLoops call will simulate. Currently there is no smart catch-up mechanism:
// limited to 1 minute (12 game days) of simulation per call.
export function maxLoopPeriods(){
    return webWorker.longRatio * 12;
}

// How much Aether can be spent on game speed for a call that already carries `basePeriods` periods. Every Aether makes each
// period worth one more tick of game time, and one call is limited to maxLoopPeriods() ticks' worth of work (mid and long
// loops still run once per boundary crossed), so anything beyond that is not taken from the stock. `wanted` is the speed
// setting, `available` the Aether in stock; both are capped, and the result is never negative.
export function affordableSpeedDraw(basePeriods, wanted, available){
    if (!(basePeriods > 0) || !(wanted > 0) || !(available > 0)){
        return 0;
    }
    const room = Math.floor(maxLoopPeriods() / basePeriods) - 1;
    return Math.max(0, Math.min(wanted, Math.floor(available), room));
}

 // Largest number of ticks of game time one fast loop may stand for. The fast loop computes everything for a single tick and
// scales the result up (modRes, the repeated chance rolls), which is only a good approximation for a few ticks: the
// "is there enough input for this tick" checks look at one tick of consumption, and some progress counters are not scaled
// at all. So a period worth more ticks than this (accelerated time combined with Aether speed) is split into several fast
// loops instead of one huge one. It equals midRatio, so each chunk crosses at most one mid loop boundary.
export const MAX_FAST_SCALE = 4;

// Splits `totalTicks` of game time into fast-loop chunks of at most `maxChunk` ticks each; the chunks always add up to
// the (whole) total. Invalid or sub-tick input gives no chunks.
export function planTickChunks(totalTicks, maxChunk = MAX_FAST_SCALE){
    const chunks = [];
    if (!(totalTicks >= 1) || !(maxChunk >= 1)){
        return chunks;
    }
    const max = Math.floor(maxChunk);
    let remaining = Math.floor(totalTicks);
    while (remaining > 0){
        const chunk = Math.min(remaining, max);
        chunks.push(chunk);
        remaining -= chunk;
    }
    return chunks;
}

 // Used to synchronize the fast, mid, and long loops to each other.
// `periods` is the number of real ticks to simulate. `speedBoost` (Aether speed) makes each of them worth that many times more
// game time, on top of accelerated time, without running the whole loop that many times (see planTickChunks).
export function execGameLoops(periods = 1, speedBoost = 1){
    periods = Math.min(periods, maxLoopPeriods());
    const boost = Math.max(1, Math.floor(speedBoost) || 1);

    try {
        while (webWorker.s && periods--){
            for (const ticks of planTickChunks(baseTimeScale() * boost)){
                if (!webWorker.s){
                    break;
                }
                runTickChunk(ticks);
            }
        }
    }
    finally {
        setTickScale(null);
    }
}

// One fast loop worth `ticks` ticks of game time (its production is scaled in modRes, and its own chance rolls are repeated
// timeScale() times), followed by every mid/long loop whose boundary those ticks crossed. The tick counter advances by the
// full amount so the mid loop and the long loop (game days) still come at the accelerated pace, and every boundary crossed
// counts, so none is lost.
function runTickChunk(ticks){
    setTickScale(ticks);
    let midRuns = 0;
    let longRuns = 0;
    for (let step = ticks; step > 0; step--){
        ++S.loopTick;
        if ((S.loopTick % webWorker.midRatio) === 0){ ++midRuns; }
        if ((S.loopTick % webWorker.longRatio) === 0){ ++longRuns; }
    }

    // Always run a faster loop before a slower loop
    fastLoop();
    for (let run = 0; run < midRuns; run++){ midLoop(); }

    // Perform callbacks before longLoop, so that any permanent results can be saved during longLoop
    doCallbacks();
    for (let run = 0; run < longRuns; run++){ longLoop(); }

    // Overflow prevention. Keep the position inside the long cycle instead of going back to 0: a chunk can end a few ticks past
    // the boundary, and dropping those ticks would make game days come later than they should.
    if (midRuns > 0 && longRuns > 0){ S.loopTick %= webWorker.longRatio; }
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
