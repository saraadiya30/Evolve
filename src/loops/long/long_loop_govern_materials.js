// Living materials dan pemanggilan govern() per detik. Dulu ujung longLoop_s3.
import { global } from '../../core/vars.js';
import { govern } from '../../governor/governor.js';

export function longLoopGovernMaterials($ctx){
        if (global.race['living_materials']){
            ['city','space','interstellar','galaxy','portal','eden','tauceti'].forEach(function(sector){
                Object.keys(global[sector]).forEach(function(struct){
                    if (global[sector][struct].hasOwnProperty('l_m')){
                        global[sector][struct].l_m++;
                    }
                });
            });
        }

        govern();
}
