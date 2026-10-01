// Civic awal skenario Warlord: pajak, pekerja, dan professor.
import { global } from '../../core/vars.js';

export function warlordSetupCivic($ctx){
        global.civic.taxes.display = true;

        if (!global.race['flier']){
            global.civic.cement_worker.display = true;
            global.resource.Cement.crates = 30;
            global.resource.Cement.containers = 30;
        }

        global.civic.professor.display = true;
        global.civic.scientist.display = true;
        global.civic.banker.display = true;

        global.civic.professor.max = 1;
        global.civic.professor.workers = 1;
}
