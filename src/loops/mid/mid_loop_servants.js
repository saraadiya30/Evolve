// Batas servant, pembatasan craftsman, dan pembaruan pekerja per job.
import { global } from '../../core/vars.js';
import { limitCraftsmen, loadServants } from '../../civics/jobs/job_definitions.js';

export function midLoopServants($ctx){
        let unlock_servants = false;
        let total_servants = 0;
        let not_scavanger_jobs_avail = 0;
        Object.keys($ctx.lCaps).forEach(function (job){
            if (global.civic[job].max === -1 && global.civic[job].display && job !== 'unemployed' && job !== 'scavenger'){
                not_scavanger_jobs_avail++;
            }
        });

        // Limit craftsmen for resources that require specific structs. Combined craftsman worker limits are done below.
        ['Scarletite','Quantium'].forEach(function (res){
            limitCraftsmen(res);
        });

        Object.keys($ctx.lCaps).forEach(function (job){
            global.civic[job].max = $ctx.lCaps[job];
            if (global.civic[job].workers > global.civic[job].max && global.civic[job].max !== -1){
                global.civic[job].workers = global.civic[job].max;
            }
            else if (!global.civic[job].display || global.civic[job].workers < 0){
                global.civic[job].workers = 0;
            }

            if (global.race['servants']){
                if (global.civic[job].max === -1 && !global.race.servants.jobs.hasOwnProperty(job)){
                    global.race.servants.jobs[job] = 0;
                    unlock_servants = true;
                }
                if (global.race.servants.jobs.hasOwnProperty(job)){
                    if (!global.civic[job].display && (job !== 'scavenger' || not_scavanger_jobs_avail > 0)){
                        global.race.servants.jobs[job] = 0;
                    }
                    else {
                        total_servants += global.race.servants.jobs[job];
                    }
                    if (total_servants > global.race.servants.max && global.race.servants.jobs[job] > 0){
                        global.race.servants.jobs[job]--;
                        total_servants--;
                    }
                }
            }
        });
        if (unlock_servants){
            loadServants();
        }
        else if (global.race['servants']){
            global.race.servants['force_scavenger'] = not_scavanger_jobs_avail === 0 ? true : false;
            global.race.servants.used = total_servants;
        }
}
