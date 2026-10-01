import { adjustCosts } from './cost_adjusters.js';
import { global } from '../core/vars.js';
import { arpaAdjustCosts } from '../arpa/arpa_projects.js';
import { loc } from '../core/locale.js';

export function timeCheck(c_action,track,detailed,reqMet){
    reqMet = typeof reqMet === 'undefined' ? true : reqMet;
    if (c_action.cost){
        let time = 0;
        let bottleneck = false;
        let offset = track && track.id[c_action.id] ? track.id[c_action.id] : false;
        let costs = c_action['doNotAdjustCost'] ? c_action.cost : adjustCosts(c_action,offset);
        let og_track_r = track ? {} : false;
        let og_track_rr = track ? {} : false;
        if (track){
            Object.keys(track.r).forEach(function (res){
                og_track_r[res] = track.r[res];
            });
            Object.keys(track.rr).forEach(function (res){
                og_track_rr[res] = track.rr[res];
            });
        }
        let hasTrash = false;
        if (global.interstellar.hasOwnProperty('mass_ejector') && global.genes['governor'] && global.tech['governor'] && global.race['governor'] && global.race.governor['g'] && global.race.governor['tasks']){
            Object.keys(global.race.governor.tasks).forEach(function (t){
                if (global.race.governor.tasks[t] === 'trash'){
                    hasTrash = true;
                }
            });
        }
        let shorted = {};
        Object.keys(costs).forEach(function (res){
            if (time >= 0 && !global.prestige.hasOwnProperty(res) && !['Morale','HellArmy','Structs','Bool','Army','Troops'].includes(res)){
                let testCost = offset ? Number(costs[res](offset)) : Number(costs[res]());
                if (testCost > 0){
                    let f_res = res === 'Species' ? global.race.species : res;
                    let res_have = res === 'Supply' ? global.portal.purifier.supply : Number(global.resource[f_res].amount);
                    let res_max = res === 'Supply' ? global.portal.purifier.sup_max : global.resource[f_res].max;
                    let res_diff = res === 'Supply' ? global.portal.purifier.diff : global.resource[f_res].diff;

                    if (hasTrash && global.interstellar.mass_ejector[res]){
                        res_diff += global.interstellar.mass_ejector[res];
                        if (global.race.governor.config.trash.hasOwnProperty(res)){
                            res_diff -= Math.min(global.race.governor.config.trash[res].v,global.interstellar.mass_ejector[res]);
                        }
                    }

                    if (track){
                        res_have += res_diff * (reqMet ? track.t.t : track.t.rt);
                        if (!track.r.hasOwnProperty(f_res)){ track.r[f_res] = 0; }
                        if (!track.rr.hasOwnProperty(f_res)){ track.rr[f_res] = 0; }
                        if (reqMet){
                            res_have -= Number(track.r[f_res]);
                            track.r[f_res] += testCost;
                            track.rr[f_res] += testCost;
                        }
                        else {
                            res_have -= Number(track.rr[f_res]);
                            track.rr[f_res] += testCost;
                        }
                        if (res_max >= 0 && res_have > res_max){
                            res_have = res_max;
                        }
                    }
                    if (testCost > res_have){
                        if (res_diff > 0){
                            let r_time = (testCost - res_have) / res_diff;
                            if (r_time > time){
                                bottleneck = f_res;
                                time = r_time;
                            }
                            shorted[f_res] = r_time;
                        }
                        else {
                            if (track){
                                track.r = og_track_r;
                                track.rr = og_track_rr;
                            }
                            time = -9999999;
                            shorted[f_res] = 99999999 - res_diff;
                            if ((shorted[bottleneck] && shorted[f_res] > shorted[bottleneck]) || !shorted[bottleneck]){
                                bottleneck = f_res;
                            }
                        }
                    }
                }
            }
        });
        if (track && time >= 0){
            if (typeof track.id[c_action.id] === "undefined"){
                track.id[c_action.id] = 1;
            }
            else {
                track.id[c_action.id]++;
            }
            if (reqMet){
                track.t.t += time;
            }
            track.t.rt += time;
        }
        return detailed ? { t: time, r: bottleneck, s: shorted } : time;
    }
    else {
        return 0;
    }
}

// This function returns the time to complete all remaining Arpa segments.
// Note: remain is a fraction between 0 and 1 representing the fraction of
// remaining arpa segments to be completed
export function arpaTimeCheck(project, remain, track, detailed){
    let offset = track && track.id[project.id] ? track.id[project.id] : false;
    let costs = arpaAdjustCosts(project.cost,offset);
    let allRemainingSegmentsTime = 0;
    let og_track_r = track ? {} : false;
    let og_track_rr = track ? {} : false;
    let bottleneck = false;
    if (track){
        Object.keys(track.r).forEach(function (res){
            og_track_r[res] = track.r[res];
        });
        Object.keys(track.rr).forEach(function (res){
            og_track_rr[res] = track.rr[res];
        });
    }
    let hasTrash = false;
    if (global.interstellar.hasOwnProperty('mass_ejector') && global.genes['governor'] && global.tech['governor'] && global.race['governor'] && global.race.governor['g'] && global.race.governor['tasks']){
        Object.keys(global.race.governor.tasks).forEach(function (t){
            if (global.race.governor.tasks[t] === 'trash'){
                hasTrash = true;
            }
        });
    }

    let shorted = {};
    Object.keys(costs).forEach(function (res){
        if (allRemainingSegmentsTime >= 0){
            let allRemainingSegmentsCost = Number(costs[res](offset)) * remain;
            if (allRemainingSegmentsCost > 0){
                let res_have = Number(global.resource[res].amount);
                let res_diff = global.resource[res].diff;

                if (track){
                    if (hasTrash && global.interstellar.mass_ejector[res]){
                        res_diff += global.interstellar.mass_ejector[res];
                        if (global.race.governor.config.trash.hasOwnProperty(res)){
                            res_diff -= Math.min(global.race.governor.config.trash[res].v,global.interstellar.mass_ejector[res]);
                        }
                    }

                    res_have += res_diff * track.t.t;
                    if (track.r[res]){
                        res_have -= Number(track.r[res]);
                        track.r[res] += allRemainingSegmentsCost;
                    }
                    else {
                        track.r[res] = allRemainingSegmentsCost;
                    }
                    if (track.rr[res]){
                        track.rr[res] += allRemainingSegmentsCost;
                    }
                    else {
                        track.rr[res] = allRemainingSegmentsCost;
                    }
                    if (global.resource[res].max >= 0 && res_have > global.resource[res].max){
                        res_have = global.resource[res].max;
                    }
                }

                if (allRemainingSegmentsCost > res_have){
                    if (res_diff > 0){
                        let r_time = (allRemainingSegmentsCost - res_have) / res_diff;
                        if (r_time > allRemainingSegmentsTime){
                            allRemainingSegmentsTime = r_time;
                            bottleneck = res;
                        }
                        shorted[res] = r_time;
                    }
                    else {
                        if (track){
                            track.r = og_track_r;
                            track.rr = og_track_rr;
                        }
                        allRemainingSegmentsTime = -9999999;
                        shorted[res] = 99999999 - res_diff;
                        if ((shorted[bottleneck] && shorted[res] > shorted[bottleneck]) || !shorted[bottleneck]){
                            bottleneck = res;
                        }
                    }
                }
            }
        }
    });
    if (track && allRemainingSegmentsTime >= 0){
        if (typeof track.id[project.id] === "undefined"){
            track.id[project.id] = 1;
        }
        else {
            track.id[project.id]++;
        }
        track.t.t += allRemainingSegmentsTime;
        track.t.rt += allRemainingSegmentsTime;
    }
    return detailed ? { t: allRemainingSegmentsTime, r: bottleneck, s: shorted } : allRemainingSegmentsTime;
}

export function timeFormat(time){
    let formatted;
    if (time < 0){
        formatted = loc('time_never');
    }
    else {
        time = +(time.toFixed(0));
        const secs_per_min = 60;

        if (time < secs_per_min){
            formatted = `${time}s`;
        }
        else {
            const mins_per_hour = 60;
            const secs_per_hour = secs_per_min*mins_per_hour;
            const secs = time % secs_per_min;
            const mins = Math.floor(time / secs_per_min) % mins_per_hour;

            if (time < secs_per_hour){
                if (secs > 0){ formatted = `${mins}m ${secs}s`; }
                else { formatted = `${mins}m`; }
            }
            else {
                const hours_per_day = 24;
                const secs_per_day = secs_per_hour*hours_per_day;
                const hours = Math.floor(time / secs_per_hour) % hours_per_day;

                if (time < secs_per_day){
                    if (mins > 0){ formatted = `${hours}h ${mins}m`; }
                    else if (secs > 0){ formatted = `${hours}h ${secs}s`; }
                    else { formatted = `${hours}h`; }
                }
                else {
                    const days = Math.floor(time / secs_per_day);

                    if (hours > 0){ formatted = `${days}d ${hours}h`; }
                    else if (mins > 0){ formatted = `${days}d ${mins}m`; }
                    else if (secs > 0){ formatted = `${days}d ${secs}s`; }
                    else { formatted = `${days}d`; }
                }
            }
        }
    }
    return formatted;
}
