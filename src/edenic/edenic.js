import { global } from '../core/vars.js';
import { checkRequirements } from '../space/space.js';
import { mechRating } from '../portal/portal.js';
import { asphodelResistCalc, mechStationCalc, mechStationRunning } from './edenic_core.js';
import { edenicModules } from './edenic_modules_registry.js';
import { edenAsphodel } from './asphodel/asphodel.js';
import { edenElysium } from './elysium/elysium.js';
import { edenIsle } from './edenic_isle.js';
import { edenPalace } from './edenic_palace.js';

// Urutan key = urutan region lama (dipakai renderEdenic dan checkRequirements).
Object.assign(edenicModules, {
    eden_asphodel: edenAsphodel,
    eden_elysium: edenElysium,
    eden_isle: edenIsle,
    eden_palace: edenPalace
});

export { renderEdenic } from './edenic_render.js';
export { apotheosisProjection } from './edenic_palace.js';

export function edenicTech(){
    return edenicModules;
}

export function checkEdenRequirements(region,tech){
    return checkRequirements(edenicModules,region,tech);
}

export function asphodelResist(){
    return asphodelResistCalc(global.tech['asphodel'], global.eden['mech_station']);
}

export function mechStationEffect(){
    let station = global.eden.mech_station;
    let result = { effect: 0, mechs: 0 };
    if (mechStationRunning(station)){
        let active = [];
        for (let i = 0; i < global.portal.mechbay.active; i++) {
            active.push(global.portal.mechbay.mechs[i]);
        }
        result = mechStationCalc(
            station,
            global.eden.asphodel_harvester.on,
            global.civic.ghost_trapper.workers,
            active,
            function(mech){ return mechRating(mech,true); }
        );
    }
    station.effect = result.effect;
    station.mechs = result.mechs;
}
