// Batas pekerja khusus: servant, teamster gravity well, space miner, transport dan purifier portal.
import { global, support_on, p_on, gal_on, spire_on } from '../../core/vars.js';
import { workerScale } from '../../civics/jobs/worker_scale.js';

export function midLoopSpecialJobs($ctx){
        if (global.race['servants'] && global.race.servants.hasOwnProperty('smax') && global.race.servants.smax > 0){
            let used = 0;
            Object.keys(global.race.servants.sjobs).forEach(function(res){
                if (!global.resource[res].display){
                    global.race.servants.sjobs[res] = 0;
                }
                used += global.race.servants.sjobs[res];
                if (used > global.race.servants.smax){
                    global.race.servants.sjobs[res] -= used - global.race.servants.smax;
                }
                if (global.race.servants.sjobs[res] < 0){
                    global.race.servants.sjobs[res] = 0;
                }
            });
            global.race.servants.sused = used;
        }

        if (global.race['gravity_well']){
            let teamster = 0;

            [
                'hunter',
                'forager',
                'farmer',
                'lumberjack',
                'quarry_worker',
                'crystal_miner',
                'scavenger',
                'miner',
                'coal_miner',
                'craftsman',
                'cement_worker',
                'space_miner',
                'hell_surveyor',
                'pit_miner',
            ].forEach(function (job){
                teamster += global.civic[job].workers;
                if (global.race['servants'] && global.race.servants.jobs[job]){
                    teamster += global.race.servants.jobs[job];
                }
            });

            if (global.city['oil_well']){
                teamster += global.city.oil_well.count * (global.tech['teamster'] && global.tech.teamster >= 3 ? 0 : 2);
            }

            if (global.city['factory'] && p_on['factory']){
                teamster += p_on['factory'] * 2;
            }

            if (global.space['red_factory'] && p_on['red_factory']){
                teamster += p_on['red_factory'] * 2;
            }

            if (global.space['moon_base'] && support_on['iridium_mine']){
                teamster += support_on['iridium_mine'] * 2;
            }

            if (global.space['moon_base'] && support_on['helium_mine']){
                teamster += support_on['helium_mine'];
            }

            if (global.tech['mars'] && support_on['red_mine']){
                teamster += support_on['red_mine'] * 3;
            }

            if (p_on['outpost']){
                teamster += p_on['outpost'] * 3;
            }

            if (global.race['servants'] && global.race.servants.hasOwnProperty('smax') && global.race.servants.smax > 0){
                teamster += global.race.servants.sused;
            }

            global.race['teamster'] = teamster;
        }

        if (global.civic.space_miner.display && global.space['space_station']){
            global.space.space_station.s_max = workerScale(global.civic.space_miner.workers,'space_miner');
        }

        if (global.portal.hasOwnProperty('transport')){
            let max = 0;
            if (gal_on['transport']){
                max = gal_on['transport'] * (global.stats.achieve['what_is_best'] && global.stats.achieve.what_is_best.e >= 4 ? 8 : 5);
            }
            global.portal.transport.cargo.max = max;
        }

        if (global.portal.hasOwnProperty('purifier')){
            let max = 100;
            let port_value = 10000;
            if (spire_on['base_camp']){
                port_value *= 1 + (spire_on['base_camp'] * 0.4);
            }
            if (spire_on['port']){
                max += spire_on['port'] * port_value;
            }
            global.portal.purifier.sup_max = Math.round(max);
        }
}
