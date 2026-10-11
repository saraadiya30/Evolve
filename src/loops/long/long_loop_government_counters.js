// Penghitung mundur pemerintahan (rev dan fr) per detik. Dulu bagian dari longLoop_s1.
import { global } from '../../core/vars.js';

export function longLoopGovernmentCounters($ctx){
        if (global.civic.govern.rev > 0){
            global.civic.govern.rev--;
        }
        if (global.civic.govern.fr > 0){
            global.civic.govern.fr--;
        }
        if (global.civic.govern.rev < 0){
            global.civic.govern.rev = 0;
        }
}
