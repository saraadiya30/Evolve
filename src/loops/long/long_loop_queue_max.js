// Hitung ulang batas antrean bangunan dan riset per detik. Dulu bagian dari longLoop_s2.
import { global } from '../../core/vars.js';
import { calcQueueMax, calcRQueueMax } from '../../functions/queues.js';

export function longLoopQueueMax($ctx){
        if (global.queue.display){
            calcQueueMax();
        }
        if (global.r_queue.display){
            calcRQueueMax();
        }
}
