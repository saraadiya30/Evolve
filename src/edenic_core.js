// Pure Eden calculations. Like morale_core.js / stocks_core.js, this file imports nothing and touches no
// global/DOM state: every input is an explicit argument, so it can be unit-tested outside the browser.
// edenic.js keeps thin wrappers that read `global` and (for mechStationEffect) write the result back.

// Asphodel hostility resistance multiplier applied to soul/powder gains.
//   asphodelTech: global.tech.asphodel (undefined/<5 => no hostility yet => 1)
//   mechStation:  global.eden.mech_station (or undefined); only .count and .effect are read
export function asphodelResistCalc(asphodelTech, mechStation){
    if (asphodelTech && asphodelTech >= 5){
        let resist = asphodelTech >= 6 ? 0.34 : 0.67;
        if (mechStation && mechStation.count >= 10){
            resist = 0.34 + (mechStation.effect * 0.0066);
        }
        return resist;
    }
    return 1;
}

// The station only does anything with 10+ buildings and a mode other than 0 (off). Exported so the wrapper in
// edenic.js can skip reading other global state (which may not exist yet) when the station is idle.
export function mechStationRunning(station){
    return !(station.count < 10 || station.mode === 0);
}

// Mech station: how many mechs get assigned and what % of asphodel hostility they absorb.
//   station: { count, mode }
//   harvesters: global.eden.asphodel_harvester.on, trappers: global.civic.ghost_trapper.workers
//   mechs: one entry per ACTIVE mech slot, in order (mechbay.mechs[0..active-1]); each needs .size
//   rate(mech): mech's rating -- injected (real one is portal.js mechRating(mech,true)) and called lazily,
//               exactly when the original loop called it.
// Returns { effect, mechs }.
export function mechStationCalc(station, harvesters, trappers, mechs, rate){
    if (!mechStationRunning(station)){
        return { effect: 0, mechs: 0 };
    }

    let hostility = 0;
    hostility += harvesters * 4;
    hostility += trappers;
    let rawHostility = hostility;
    let targetHostility = 0;

    if (station.mode === 1){
        targetHostility = Math.ceil(hostility * 0.66);
    }
    else if (station.mode === 2){
        targetHostility = Math.ceil(hostility * 0.33);
    }
    else if (station.mode === 4){
        hostility *= 1.25;
        rawHostility *= 1.25;
    }
    else if (station.mode === 5){
        hostility *= 1.5;
        rawHostility *= 1.5;
    }

    let count = 0;
    for (let i = 0; i < mechs.length; i++) {
        let mech = mechs[i];
        if (mech.size !== 'collector' && hostility > targetHostility){
            hostility -= rate(mech) * 12500;
            count++;
        }
    }

    if (hostility < 0){ hostility = 0 }
    let effect = 100 - Math.floor(hostility / rawHostility * 100);

    if (effect === 100 && station.mode === 4){
        effect = 110;
    }
    else if (effect === 100 && station.mode === 5){
        effect = 120;
    }
    return { effect: effect, mechs: count };
}
