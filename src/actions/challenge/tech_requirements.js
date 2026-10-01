// checkTechRequirements / checkTechPath / checkOldTech: pengecekan syarat tech.
import { global } from '../../core/vars.js';
import { actions } from '../../core/registries.js';
import { techPath } from '../../tech/tech_list.js';

export function skipRequirement(req,rank){
    if (global.race['flier'] && req === 'cement'){
        return true;
    }
    return false;
}

export function checkTechRequirements(tech,predList){
    let isMet = true; let precog = false;

    let failChecks = {};
    Object.keys(actions.tech[tech].reqs).forEach(function (req){
        if (skipRequirement(req, global.tech[req] || 0)){ return; }
        if (!global.tech[req] || global.tech[req] < actions.tech[tech].reqs[req]){
            isMet = false;
            failChecks[req] = actions.tech[tech].reqs[req];
        }
    });
    if (predList && typeof predList === 'object' && global.genes.hasOwnProperty('queue') && global.genes.queue >= 3){
        precog = true;
        global.r_queue.queue.forEach(function(q){
            if (checkTechRequirements(q.type,false)){
                predList[actions[q.action][q.type].grant[0]] = { v: actions[q.action][q.type].grant[1], a: q.type };
            }
        });
        Object.keys(failChecks).forEach(function (req){
            let cTech = global.tech[req] || 0;
            if (skipRequirement(req, global.tech[req] || 0)){ return; }
            if (!predList[req] || predList[req].v < actions.tech[tech].reqs[req] || predList[req].v > cTech + 1){
                precog = false;
            }
        });
    }
    if ((isMet || precog) && (!global.tech[actions.tech[tech].grant[0]] || global.tech[actions.tech[tech].grant[0]] < actions.tech[tech].grant[1])){
        return isMet ? 'ok' : 'precog';
    }
    return false;
}

export function checkTechPath(tech){
    let path = global.race['truepath'] ? 'truepath' : 'standard';
    if ((!techPath[path].includes(actions.tech[tech].era) && !actions.tech[tech].hasOwnProperty('path')) || (actions.tech[tech].hasOwnProperty('path') && !actions.tech[tech].path.includes(path))){
        return false;
    }
    return true;
}

export function checkOldTech(tech){
    let tch = actions.tech[tech].grant[0];
    if (global.tech[tch] && global.tech[tch] >= actions.tech[tech].grant[1]){
        switch (tech) {
            case 'fanaticism':
                return Boolean(global.tech['fanaticism']);
            case 'anthropology':
                return Boolean(global.tech['anthropology']);
            case 'deify':
                return Boolean(global.tech['ancient_deify']);
            case 'study':
                return Boolean(global.tech['ancient_study']);
            case 'isolation_protocol':
                return Boolean(global.tech['isolation']);
            case 'focus_cure':
                return Boolean(global.tech['focus_cure']);
            case 'vax_strat1':
                return Boolean(global.tech['vax_p']);
            case 'vax_strat2':
                return Boolean(global.tech['vax_f']);
            case 'vax_strat3':
                return Boolean(global.tech['vax_s']);
            case 'vax_strat4':
                return Boolean(global.tech['vax_c']);
            default:
                return true;
        }
    }
    return false;
}
