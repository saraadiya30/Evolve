// checkBossResist: cek resistansi boss.
import { monsters } from '../../core/registries.js';
import { global, seededRandom } from '../../core/vars.js';

export function checkBossResist(boss,weapon){
    let effectiveness = monsters[boss].weapon[weapon];
    
    let seed = global.stats.reset + (global.portal?.spire?.count || 1);
    let seed_r1 = Math.floor(seededRandom(0,25000,false,seed + (global.portal?.spire?.count || 1) * 2));
    let seed_w1 = Math.floor(seededRandom(0,25000,false,seed + global.stats.reset * 2));
    
    let weaponList = global.race['warlord'] 
        ? ['laser','kinetic','shotgun','missile','flame','plasma','sonic','tesla','claws','venom','cold','shock','fire','acid','stone','iron','flesh','ice','magma','axe','hammer']
        : ['laser','kinetic','shotgun','missile','flame','plasma','sonic','tesla'];

    let resist = weaponList[Math.floor(seededRandom(0,weaponList.length,false,seed_r1))];
    let weak = weaponList[Math.floor(seededRandom(0,weaponList.length,false,seed_w1))];

    if (weapon === resist){
        let seed_r2 = Math.floor(seededRandom(0,25000,false,seed_r1 + (global.portal?.spire?.count || 1) * 3));
        effectiveness -= Math.floor(seededRandom(0,26,false,seed_r2)) / 100;
        if (effectiveness < 0){ effectiveness = 0; }
    }
    else if (weapon === weak){
        let seed_w2 = Math.floor(seededRandom(0,25000,false,seed_w1 + global.stats.reset * 3));
        effectiveness += Math.floor(seededRandom(0,26,false,seed_w2)) / 100;
    }
    return effectiveness;
}
