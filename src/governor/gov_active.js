// govActive(): cek apakah governor yang menjabat punya trait tertentu. Modul daun: membaca gov_traits lewat registry (core/registries.js)
// yang diisi saat registerAll(), jadi tidak meng-import governor.js maupun definisi trait-nya.
import { global } from '../core/vars.js';
import { gov_traits } from '../core/registries.js';
import { gmen } from './gov_men.js';

export function govActive(trait,val){
    if (global.race.hasOwnProperty('governor') && global.race.governor.hasOwnProperty('g')){
        return gmen[global.race.governor.g.bg].traits[trait] ? gov_traits[trait].vars()[val] : false;
    }
    return false;
}
