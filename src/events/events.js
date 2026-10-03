import { global, seededRandom, sizeApproximation } from '../core/vars.js';
import { loc } from '../core/locale.js';
import { races, traits } from '../races/races.js';
import { garrisonSize, armyRating } from '../civics/civics.js';
import { tradeRatio } from '../config/trade.js';
import { soldierDeath } from '../civics/civics.js';
import { govActive } from '../governor/governor.js';
import { events } from './ev_registry.js';
import { eventsPart1 } from './ev_events_1.js';
import { eventsPart2 } from './ev_events_2.js';
import { eventsPart3 } from './ev_events_3.js';

Object.assign(events,
    eventsPart1,
    eventsPart2,
    eventsPart3
);
export { events };






export function pillaged(gov,serious){
    let army = armyRating(garrisonSize(),'army',global.civic.garrison.wounded);
    let eAdv = global.tech['high_tech'] ? global.tech['high_tech'] + 1 : 1;
    let enemy = (gov === 'witchhunt' ? 1000 : global.civic.foreign[gov].mil) * (1 + Math.floor(seededRandom(0,10) - 5) / 10) * eAdv;

    let injured = global.civic.garrison.wounded > garrisonSize() ? garrisonSize() : global.civic.garrison.wounded;
    let killed = garrisonSize() > 0 ? Math.floor(seededRandom(1,injured)) : 0;
    let wounded = Math.floor(seededRandom(0,garrisonSize() - injured));
    if (global.race['instinct']){
        killed = Math.round(killed / 2);
        wounded = Math.round(wounded / 2);
    }
    soldierDeath(killed);
    global.civic.garrison.wounded += wounded;
    if (global.civic.garrison.wounded > global.civic.garrison.workers){
        global.civic.garrison.wounded = global.civic.garrison.workers;
    }

    if (global.race['blood_thirst']){
        global.race['blood_thirst_count'] += Math.ceil(enemy / 5);
        if (global.race['blood_thirst_count'] > traits.blood_thirst.vars()[0]){
            global.race['blood_thirst_count'] = traits.blood_thirst.vars()[0];
        }
    }

    let enemy_name = gov === 'witchhunt' ? loc(`witch_hunter_crusade`) : loc(`civics_gov${global.civic.foreign[gov].name.s0}`,[global.civic.foreign[gov].name.s1]);

    if (army > enemy){
        return loc('event_pillaged1',[enemy_name,killed.toLocaleString(),wounded.toLocaleString()]);
    }
    else {
        let limiter = serious ? 2 : 4;
        let stolen = [];
        let targets = Object.keys(tradeRatio);
        targets.push('Money');
        targets.forEach(function(res){
            if (global.resource[res] && global.resource[res].display && global.resource[res].amount > 0){
                let loss = Math.rand(1,Math.round(global.resource[res].amount / limiter));
                let remain = global.resource[res].amount - loss;
                if (remain < 0){ remain = 0; }
                global.resource[res].amount = remain;
                if (res === 'Money'){
                    stolen.push(`$${sizeApproximation(loss)}`);
                }
                else {
                    stolen.push(`${sizeApproximation(loss)} ${global.resource[res].name}`);
                }
            }
        });
        return loc('event_pillaged2',[enemy_name,killed.toLocaleString(),wounded.toLocaleString(),stolen.join(', ')]);
    }
}

export function eventList(type){
    let event_pool = [];
    Object.keys(events).forEach(function (event){
        let isOk = true;
        if (type !== events[event].type){
            isOk = false;
        }
        if ((type === 'major' && global.event.l === event) || (type === 'minor' && global.m_event.l === event)){
            isOk = false;
        }
        if (events[event]['reqs']){
            Object.keys(events[event].reqs).forEach(function (req) {
                switch(req){
                    case 'race':
                        if (events[event].reqs[req] !== global.race.species){
                            isOk = false;
                        }
                        break;
                    case 'genus':
                        if (events[event].reqs[req] !== races[global.race.species].type){
                            isOk = false;
                        }
                        break;
                    case 'nogenus':
                        if (events[event].reqs[req] === races[global.race.species].type){
                            isOk = false;
                        }
                        break;
                    case 'resource':
                        if (!global.resource[events[event].reqs[req]] || !global.resource[events[event].reqs[req]].display){
                            isOk = false;
                        }
                        break;
                    case 'trait':
                        if (!global.race[events[event].reqs[req]]){
                            isOk = false;
                        }
                        break;
                    case 'notrait':
                        if (global.race[events[event].reqs[req]]){
                            isOk = false;
                        }
                        break;
                    case 'tech':
                        if (!global.tech[events[event].reqs[req]]){
                            isOk = false;
                        }
                        break;
                    case 'notech':
                        if (global.tech[events[event].reqs[req]]){
                            isOk = false;
                        }
                        break;

                    case 'high_tax_rate':
                        // there are currently no events with the high_tax_rate requirement
                        if (global.civic.taxes.tax_rate <= events[event].reqs[req]){
                            isOk = false;
                        }
                        break;
                    case 'low_morale':
                        if (global.city.morale.current >= events[event].reqs[req]){
                            isOk = false;
                        }
                        break;
                    case 'biome':
                        // there are currently no events with the biome requirement
                        if (global.city.biome !== events[event].reqs[req]){
                            isOk = false;
                        }
                        break;
                    default:
                        isOk = false;
                        break;
                }
            });
        }
        if (isOk && events[event]['condition'] && !events[event].condition()){
            isOk = false;
        }
        if (isOk){
            event_pool.push(event);
        }
    });
    return event_pool;
}

export function tax_revolt(){
    let special_res = ['Soul_Gem', 'Corrupt_Gem', 'Codex', 'Demonic_Essence']
    let ramp = global.civic.govern.type === 'oligarchy' ? 45 : 25;
    let aristoVal = govActive('aristocrat',2);
    if (aristoVal){
        ramp -= aristoVal;
    }
    let risk = (global.civic.taxes.tax_rate - ramp) * 0.04;
    Object.keys(global.resource).forEach(function (res) {
        if (!special_res.includes(res)){
            let loss = Math.rand(1,Math.round(global.resource[res].amount * risk));
            let remain = global.resource[res].amount - loss;
            if (remain < 0){ remain = 0; }
            global.resource[res].amount = remain;
        }
    });
    return loc('event_tax_revolt');
}
