// Populasi dan batas pekerja awal skenario Warlord (dig demon, miner, entertainer, banker, pemerintahan).
import { global } from '../../core/vars.js';
import { actions } from '../../core/registries.js';

export function warlordSetupJobs($ctx){
        global.civic.d_job = 'lumberjack';
        global.civic.miner.display = true;
        if (!global.race['joyless']){
            global.civic.entertainer.display = true;
        }
        global.civic.craftsman.display = true;

        let citizens = actions.portal.prtl_wasteland.dig_demon.citizens() + actions.portal.prtl_wasteland.hovel.citizens();

        global.resource[global.race.species].max = citizens;
        global.resource[global.race.species].amount = citizens;

        global.civic.miner.max = actions.portal.prtl_wasteland.dig_demon.citizens();
        global.civic.miner.workers = actions.portal.prtl_wasteland.dig_demon.citizens();
        global.civic.miner.assigned = actions.portal.prtl_wasteland.dig_demon.citizens();

        global.civic.cement_worker.max = 5;
        global.civic.cement_worker.workers = 5;
        global.civic.cement_worker.assigned = 5;

        if (!global.race['joyless']){
            global.civic.entertainer.max = 3;
            global.civic.entertainer.workers = 3;
            global.civic.entertainer.assigned = 3;
        }

        global.civic.banker.max = 1;
        global.civic.banker.workers = 1;
        global.civic.banker.assigned = 1;

        global.civic.professor.max = 3;
        global.civic.professor.workers = 3;
        global.civic.professor.assigned = 3;

        global.civic.scientist.max = 2;
        global.civic.scientist.workers = 2;
        global.civic.scientist.assigned = 2;

        global.civic.govern.type = 'autocracy';
}
