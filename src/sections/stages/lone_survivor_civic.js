// Civic awal skenario Lone Survivor: pajak dan pekerja.
import { global } from '../../core/vars.js';

export function loneSurvivorCivic($ctx){
        global.civic.taxes.display = true;

        if (!global.race['flier']){
            global.civic.cement_worker.display = true;
            global.resource.Cement.crates = 25;
            global.resource.Cement.containers = 25;
        }

        if (!global.race['sappy']){
            global.civic.quarry_worker.display = true
        }
        global.civic.professor.display = true;
        global.civic.scientist.display = true;
        global.civic.banker.display = true;
        global.civic.pit_miner.display = true;

        global.civic.professor.max = 1;
        global.civic.professor.workers = 1;
}
