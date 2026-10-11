// Deteksi unlock baru per tick (showResearch). Dulu bagian dari fastLoopCore_s14.
import { global } from '../../core/vars.js';

export function fastLoopUnlockDetection($ctx){
        // Detect new unlocks
        if (!global.settings.showResearch && (global.resource.Lumber.amount >= 5 || global.resource.Stone.amount >= 6)){
            global.settings.showResearch = true;
        }
}
