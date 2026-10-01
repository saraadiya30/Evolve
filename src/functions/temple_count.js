// templeCount: jumlah bangunan kuil efektif.
import { global } from '../core/vars.js';

export function templeCount(zig){
    if (!zig && global.city['temple']){
        let count = global.city.temple.count;
        if (!global.race['cataclysm'] && !global.race['orbit_decayed'] && !global.race['lone_survivor'] && !global.race['warlord']){
            if (global.race['wish'] && global.race['wishStats'] && global.race.wishStats.temple){
                count++;
            }
            if (global.genes.hasOwnProperty('ancients') && global.genes.ancients >= 6){
                count++;
            }
        }
        return count;
    }
    else if (zig && global.space['ziggurat']){
        let count = global.space.ziggurat.count;
        if (!global.race['lone_survivor'] && !global.race['warlord']){
            if (global.race['wish'] && global.race['wishStats'] && global.race.wishStats.zigg){
                count++;
            }
            if (global.genes.hasOwnProperty('ancients') && global.genes.ancients >= 7){
                count++;
            }
        }
        return count;
    }
    return 0;
}
