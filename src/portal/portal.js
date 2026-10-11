import { global } from '../core/vars.js';
import { monsters } from '../core/registries.js';


export const towerSize = (function(){
    let size;
    return function(recalc){
        if (size && !recalc){
            return size;
        }
        size = 1000;
        if (global.hasOwnProperty('pillars')){
            Object.keys(global.pillars).forEach(function(pillar){
                if (global.pillars[pillar]){
                    size -= global.pillars[pillar] * 2 + 2;
                }
            });            
        }
        if (size < 250){ size = 250; }
        return size;
    }
})();

export { monsters };
