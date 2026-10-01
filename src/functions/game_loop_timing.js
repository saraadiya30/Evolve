// Isi: popover(), clearPopper(), gameLoop(), TIME_ACCELERATION_FACTOR, timeScale(), loopTimers(), addATime(), exceededATimeThreshold(), powerGrid(), initMessageQueue(), messageQueue(), removeFromQueue(), removeFromRQueue(), calcQueueMax() +9
import { global, webWorker, atrack } from '../core/vars.js';
import { traits } from '../core/registries.js';
import { ATIME_CAP } from '../config/constants.js';
import { TIME_ACCELERATION_FACTOR } from './resource_mod.js';



export function gameLoop(act){
    switch(act){
        case 'stop':
            {
                if (webWorker.w){
                    webWorker.w.postMessage({ loop: 'clear' });
                }
                if (global.settings.at > 0){
                    global.settings.at = atrack.t;
                }
                webWorker.s = false;
            }
            break;
        case 'start':
            {
                addATime(Date.now());

                const timers = loopTimers();

                // Used to calculate resource increase.
                webWorker.mt = timers.webWorkerMainTimer;

                if (webWorker.w){
                    webWorker.w.postMessage({ loop: 'start', period: timers.mainTimer });
                }
                webWorker.s = true;
            }
            break;
        case 'period':
            {
                // Only the interval length changed (accelerated time ran out or kicked in) - reschedule the
                // existing timer in place instead of a stop+start round trip. Avoids tearing down the worker's
                // drift correction (and the brief stutter that comes with rebuilding it) for a plain speed change.
                const timers = loopTimers();
                webWorker.mt = timers.webWorkerMainTimer;
                if (webWorker.w && webWorker.s){
                    webWorker.w.postMessage({ loop: 'period', period: timers.mainTimer });
                }
            }
    }
}



export function loopTimers(){
    // Here come any speed modifiers not related to accelerated time.
    let modifier = 1.0;
    if (global.race['slow']){
        modifier *= 1 + (traits.slow.vars()[0] / 100);
    }
    if (global.race['hyper']){
        modifier *= 1 - (traits.hyper.vars()[0] / 100);
    }

    // Main loop takes 250ms without any modifiers.
    const webWorkerMainTimer = Math.floor(250 * modifier);
    // Long loop (game day) takes 5000ms without any modifiers.
    const baseLongTimer = webWorker.longRatio * webWorkerMainTimer;
    // The constant by which the time is accelerated when atrack.t > 0.
    const timeAccelerationFactor = TIME_ACCELERATION_FACTOR;

    const aTimeMultiplier = atrack.t > 0 ? 1 / timeAccelerationFactor : 1;
    return {
        webWorkerMainTimer,
        // Accelerated time no longer shortens the tick interval: the loop keeps running at the normal rate and the
        // production of each fast tick is multiplied instead (timeScale() in modRes), so 2x speed is not 2x the work.
        mainTimer: webWorkerMainTimer,
        // Real-time length of one game day while accelerated (used for the remaining-time estimate), still halved
        // because the day counter advances `timeAccelerationFactor` ticks per real tick (see execGameLoops).
        longTimer: Math.ceil(baseLongTimer * aTimeMultiplier),
        baseLongTimer,
        timeAccelerationFactor,
    };
}

// Adds accelerated time if enough time has passed since `global.stats.current`. Returns true if there was accelerated
// time added. If the parameter is true, it will only add the time if a threshold of 120s has been reached.
export function addATime(currentTimestamp){
    // The second case is used for the initialization of atrack.t.
    if (exceededATimeThreshold(currentTimestamp) || global.stats.hasOwnProperty('current') && global.settings.at > 0){
        let timeDiff = currentTimestamp - global.stats.current;
        // Removing any accelerated time if the value is larger than the cap.
        if (global.settings.at > ATIME_CAP){
            global.settings.at = 0;
        }
        // Accelerated time is added only if it is over the threshold.
        if (timeDiff >= 120000){
            const timers = loopTimers();
            const gameDayDuration = timers.baseLongTimer;
            // The number of days during which the time is accelerated (at) should take as long as 2 / 3 of paused time.
            // at * gameDayDuration / timeAccelerationFactor = 2 / 3 * timeDiff
            global.settings.at += Math.floor(2 / 3 * timeDiff * timers.timeAccelerationFactor / gameDayDuration);
        }
        // Accelerated time is capped at ATIME_CAP game days.
        if (global.settings.at > ATIME_CAP){
            global.settings.at = ATIME_CAP;
        }
        atrack.t = global.settings.at;
        // Updating the current date so that it won't be counted twice (e.g., when unpausing).
        global.stats.current = currentTimestamp;
    }
}

// Takes the current Date.now, returns whether the minimum threshold to count accelerated time has passed.
export function exceededATimeThreshold(currentTimestamp){
    return global.stats.hasOwnProperty('current') && currentTimestamp - global.stats.current >= 120000;
}















