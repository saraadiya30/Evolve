import { sentience_s1, sentience_s2 } from '../../sections/stages/sentience_parts.js';

// Fungsi-fungsi dipindah dari actions.js (urutan sumber dipertahankan). actions.js tetap mengekspor ulang nama yang tadinya ter-ekspor.


export function sentience(){
    const $ctx = {};
    sentience_s1($ctx);
        sentience_s2($ctx);
}
