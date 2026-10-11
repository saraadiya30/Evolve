// Isi: loneSurvivor(), xPosition(), xShift()
import { global } from '../core/vars.js';
import { hooks } from '../core/registries.js';

// Fungsi-fungsi dipindah dari truepath.js (urutan sumber dipertahankan). truepath.js tetap mengekspor ulang nama yang tadinya ter-ekspor.


export function loneSurvivor(){
    const $ctx = {};
    if (global.race['lone_survivor']){
        hooks.loneSurvivorSetup($ctx);
    }
}

