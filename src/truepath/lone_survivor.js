// Isi: loneSurvivor(), xPosition(), xShift()
import { global } from '../core/vars.js';
import { spacePlanetStats } from './truepath.js';
import { loneSurvivor_s1, loneSurvivor_s2 } from '../sections/stages/lone_survivor_parts.js';

// Fungsi-fungsi dipindah dari truepath.js (urutan sumber dipertahankan). truepath.js tetap mengekspor ulang nama yang tadinya ter-ekspor.


export function loneSurvivor(){
    const $ctx = {};
    if (global.race['lone_survivor']){
        loneSurvivor_s1($ctx);
        loneSurvivor_s2($ctx);
    }
}

export function xPosition(x,p){
    if (spacePlanetStats[p].orbit !== -2){
        let e = 1.075 + (spacePlanetStats[p].dist / 100);
        if (global.city.ptrait.includes('elliptical')){
            switch (p){
                case 'spc_home':
                    e = 1.5;
                    break;
                default:
                    e = 1.275 + (spacePlanetStats[p].dist / 100);
                    break;
            }
        }
        x *= e;
    }
    return x;
}

export function xShift(id){
    if (spacePlanetStats[id].orbit !== -2){
        let x = spacePlanetStats[id].dist / 3;
        if (global.city.ptrait.includes('elliptical') && id === 'spc_home'){
            x += 0.15;
        }
        if (id === 'spc_eris'){
            x += 25;
        }
        return x;
    }
    return 0;
}
