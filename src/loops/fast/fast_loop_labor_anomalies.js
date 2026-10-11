// Deteksi anomali tenaga kerja per tick: koreksi pekerja default dan negatif. Dulu bagian dari fastLoopCore_s4.
import { global } from '../../core/vars.js';
import { traits } from '../../core/registries.js';
import { planetTraits } from '../../races/planet_data.js';
import { job_desc } from '../../civics/jobs.js';

export function fastLoopLaborAnomalies($ctx){
        let total = $ctx.crew_total; // dari fastLoopGalaxyCrew
        // Detect labor anomalies
        Object.keys(job_desc).forEach(function (job) {
            if (global.civic[job]){
                if (job !== 'crew'){
                    total += global.civic[job].workers;
                    if (total > global.resource[global.race.species].amount){
                        global.civic[job].workers -= total - global.resource[global.race.species].amount;
                    }
                    if (!global.civic[job].display || global.civic[job].workers < 0){
                        global.civic[job].workers = 0;
                    }
                }
                if (job !== 'unemployed' && job !== 'hunter' && job !== 'forager'){
                    let stress_level = global.civic[job].stress;
                    if (global.city.ptrait.includes('mellow')){
                        stress_level += planetTraits.mellow.vars()[1];
                    }
                    if (global.race['content']){
                        let effectiveness = job === 'hell_surveyor' ? 0.2 : 0.4;
                        stress_level += global.race['content'] * effectiveness;
                    }
                    if (global.city.ptrait.includes('dense') && job === 'miner'){
                        stress_level -= planetTraits.dense.vars()[1];
                    }
                    if (global.race['freespirit'] && job !== 'farmer' && job !== 'lumberjack' && job !== 'quarry_worker' && job !== 'crystal_miner' && job !== 'scavenger'){
                        stress_level /= 1 + (traits.freespirit.vars()[0] / 100);
                    }

                    let workers = global.civic[job].workers;
                    if (global.race['high_pop']){
                        workers /= traits.high_pop.vars()[0];
                    }

                    if (global.race['sky_lover'] && ['miner','coal_miner','crystal_miner','pit_miner'].includes(job)){
                        workers *= 1 + (traits.sky_lover.vars()[0] / 100);
                    }

                    $ctx.stress -= workers / stress_level;
                }
            }
        });
        global.civic[global.civic.d_job].workers += global.resource[global.race.species].amount - total;
        if (global.civic[global.civic.d_job].workers < 0){
            global.civic[global.civic.d_job].workers = 0;
        }

        Object.keys(job_desc).forEach(function (job){
            if (job !== 'craftsman' && global.civic[job] && global.civic[job].display && global.civic[job].workers < global.civic[job].assigned && global.civic[global.civic.d_job].workers > 0 && global.civic[job].workers < global.civic[job].max){
                global.civic[job].workers++;
                global.civic[global.civic.d_job].workers--;
            }
        });
}
