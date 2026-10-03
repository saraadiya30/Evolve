import { bloodwar_s1, bloodwar_s2 } from '../../sections/portal/bloodwar_parts.js';

// Fungsi-fungsi dipindah dari portal.js (urutan sumber dipertahankan). portal.js tetap mengekspor ulang nama yang tadinya ter-ekspor.


export function bloodwar(){
    const $ctx = {};
    bloodwar_s1($ctx);
        bloodwar_s2($ctx);
}
