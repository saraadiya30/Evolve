// Civic awal skenario Cataclysm: pajak, pekerja, dan job. Dulu bagian dari cataclysm_s1/_s2 (pecahan mekanis).
import { global } from '../../core/vars.js';
import { jobScale } from '../../civics/jobs/job_scale.js';

export function cataclysmCivic($ctx){
        global.civic.taxes.display = true;

        global.civic.professor.display = true;
        global.civic.scientist.display = true;
        global.civic.colonist.display = true;
        global.civic.space_miner.display = true;
        global.civic.craftsman.display = true;

        if (!global.race['flier']){
            global.tech['cement'] = 5;
            global.civic.cement_worker.display = true;
            global.civic.cement_worker.max = jobScale(1);
            global.civic.cement_worker.workers = jobScale(1);
        }

        global.civic.colonist.max = jobScale(4);
        global.civic.colonist.workers = jobScale(4);
        global.civic.space_miner.max = jobScale(3);
        global.civic.space_miner.workers = jobScale(2);
        global.civic.professor.max = jobScale(1);
        global.civic.professor.workers = jobScale(1);
}
