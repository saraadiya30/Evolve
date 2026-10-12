import { global } from '../core/vars.js';

// Mode sentuh: tap pertama menampilkan popup biaya/efek (berisi tombol aksi), bukan langsung mengeksekusi.
// Aktif hanya di perangkat sentuh/ponsel DAN bila setting "Touch Device" menyala.
export function isTouchMode(){
    return 'ontouchstart' in document.documentElement && /Mobi/.test(navigator.userAgent) && global.settings.touch ? true : false;
}
