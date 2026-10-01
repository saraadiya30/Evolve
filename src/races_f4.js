import { races } from './races_registry.js';
import { minorWish_s1, minorWish_s2, minorWish_s3 } from './sec_minorWish_1.js';

// Fungsi-fungsi dipindah dari races.js (urutan sumber dipertahankan). races.js tetap mengekspor ulang nama yang tadinya ter-ekspor.


export function minorWish(parent){
    const $ctx = {};
    $ctx.parent = parent;
    minorWish_s1($ctx);
        minorWish_s2($ctx);
        minorWish_s3($ctx);
}
