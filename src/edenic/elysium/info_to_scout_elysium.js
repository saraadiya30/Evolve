import { loc } from '../../core/locale.js';
import { global, seededRandom } from '../../core/vars.js';
import { garrisonSize, soldierDeath, armyRating } from '../../civics/military/army_rating.js';
import { mercCost } from '../../civics/military/government_operations.js';
import { payCosts } from '../../actions/core/action_costs.js';
import { drawTech } from '../../actions/core/action_runner.js';
import { messageQueue } from '../../functions/message_log.js';
import { clearPopper } from '../../functions/popover.js';
import { renderEdenic } from '../edenic_render.js';
import { jobScale } from '../../civics/jobs/job_scale.js';
import { deadCalc } from './elysium.js';

// Bagian dari edenElysium (8 entri: info .. scout_elysium), dipisah dari elysium.js. Urutan entri sama persis.
export const edenElysiumPart1 = {
        info: {
            name: loc('eden_elysium_name'),
            desc: loc('eden_elysium_desc'),
            prop(){
                let soldier_title = global.tech['world_control'] && !global.race['truepath'] ? loc('civics_garrison_peacekeepers') : loc('civics_garrison_soldiers');
                let desc = `<span class="pad"><span class="soldier">${soldier_title}</span> <span v-html="$options.filters.filter(workers,'stationed')"></span> / <span>{{ max | filter('s_max') }}</span></span>`;
                desc += `<span class="pad"><span class="wounded">${loc('civics_garrison_wounded')}</span> <span>{{ wounded }}</span></span>`;
                desc += `<span class="pad"><span v-html="$options.filters.filter(m_use,'m_use')"></span></span>`;
                return desc;
            },
            bind(){
                return global.civic.garrison;
            },
            filter(v,type){
                switch (type){
                    case 'stationed':
                        return garrisonSize();
                    case 's_max':
                        return garrisonSize(true);
                    case 'm_use':
                        return loc(`civics_garrison_mercenary_cost`,[Math.round(mercCost()).toLocaleString()]);
                }
            }
        },
        survey_fields: {
            id: 'eden-survey_fields',
            title: loc('eden_survey_fields'),
            desc: loc('eden_survey_fields'),
            reqs: { elysium: 2 },
            grant: ['elysium',3],
            cost: {
                Money(){ return 1000000000; },
                Oil(){ return 10000000; },
                Helium_3(){ return 5000000; },
            },
            effect:loc('eden_survey_fields_effect'),
            action(args){
                if (payCosts($(this)[0])){
                    messageQueue(loc('eden_survey_fields_msg'),'info',false,['progress']);
                    global.eden['fortress'] = { fortress: 1000, patrols: 20, armory: 100, detector: 100 };
                    return true;
                }
                return false;
            },
            post(){
                if (global.tech['elysium'] && global.tech.elysium === 3){
                    renderEdenic();
                    clearPopper('eden-survey_fields');
                }
            }
        },
        fortress: { 
            id: 'eden-fortress',
            title: loc('eden_fortress'),
            desc: loc('eden_fortress'),
            queue_complete(){ return 0; },
            reqs: { elysium: 3 },
            condition(){
                return global.tech.elysium === 3;
            },
            effect(){ 
                let desc = `<div>${loc('eden_fortress_rating',[global.eden['fortress'] ? global.eden.fortress.fortress / 10 : 0])}</div>`;
                desc += `<div>${loc('eden_fortress_patrols',[global.eden['fortress'] ? global.eden.fortress.patrols : 0])}</div>`;
                desc += `<div>${loc('eden_fortress_detect',[global.eden['fortress'] ? global.eden.fortress.detector : 0])}</div>`;
                desc += `<div>${loc('eden_fortress_armory',[global.eden['fortress'] ? global.eden.fortress.armory : 0])}</div>`;
                return desc;
            },
            action(args){
                return false;
            }
        },
        siege_fortress: { 
            id: 'eden-siege_fortress',
            title: loc('eden_siege_fortress'),
            desc: loc('eden_siege_fortress'),
            queue_complete(){ return 0; },
            reqs: { elysium: 3 },
            condition(){
                return global.tech.elysium === 3 && global.eden.fortress.fortress > 0;
            },
            cost: {
                Troops(){
                    return jobScale(100);
                },
            },
            effect(){ 
                let desc = `<div class="has-text-warning">${loc(`eden_siege_fortress_effect`)}</div>`;
                if (global.eden.hasOwnProperty('fortress') && global.eden.fortress.hasOwnProperty('siege')){
                    desc += `<div>${loc(`eden_siege_fortress_result`)}</div>`;
                    desc += `<div>${loc(`eden_siege_fortress_lost`,[global.eden.fortress.siege.loss])}</div>`;
                    desc += `<div>${loc(`eden_siege_fortress_damage`,[global.eden.fortress.siege.damage])}</div>`;
                    desc += `<div class="has-text-caution">${loc('eden_fortress_rating',[global.eden['fortress'] ? global.eden.fortress.fortress / 10 : 0])}</div>`;
                }
                return desc;
            },
            action(args){
                let armySize = jobScale(100);
                if (garrisonSize() < armySize){
                    return false;
                }

                let armory = (global.eden.fortress.armory + 20) / 20; 
                let enemy_pats = global.eden.fortress.patrols * armory;
                let remain = jobScale(100 - enemy_pats < 0 ? 0 : 100 - enemy_pats);

                if (remain <= 0){
                    global.eden.fortress['siege'] = { loss: armySize, damage: 0 };
                    global.civic.garrison.protest += armySize;
                    soldierDeath(armySize);
                    messageQueue(loc('eden_siege_fortress_fail'),'warning',false,['combat']);
                }
                else {
                    let dead = armySize - remain + Math.floor(seededRandom(0,jobScale(global.eden.fortress.detector),true));
                    dead = deadCalc(dead, armySize);
                    remain = armySize - dead;

                    let troops = Math.ceil(armyRating(remain,'Troops'));
                    let damage = Math.floor(seededRandom(0,troops,true) / 50);

                    let more_dead = Math.floor(seededRandom(0,remain,true));
                    more_dead = deadCalc(more_dead, remain);
                    remain = remain - more_dead;
                    dead += more_dead;

                    global.civic.garrison.protest += dead;
                    soldierDeath(dead);

                    global.civic.garrison.wounded += Math.floor(seededRandom(0,remain,true));
                    if (global.civic.garrison.wounded > global.civic.garrison.workers){
                        global.civic.garrison.wounded = global.civic.garrison.workers;
                    }

                    global.eden.fortress.fortress -= damage;
                    if (global.eden.fortress.fortress < 0){ global.eden.fortress.fortress = 0; }
                    global.eden.fortress['siege'] = { loss: dead, damage: damage / 10 };

                    if (global.eden.fortress.fortress <= 0){
                        messageQueue(loc('eden_siege_fortress_fall'),'success',false,['combat']);
                        global.tech.elysium = 4;
                    }
                    else {
                        messageQueue(loc('eden_siege_fortress_success',[damage / 10]),'success',false,['combat']);
                    }
                }

                renderEdenic();
                return false;
            }
        },
        raid_supplies: { 
            id: 'eden-raid_supplies',
            title: loc('eden_raid_supplies'),
            desc: loc('eden_raid_supplies'),
            queue_complete(){ return 0; },
            reqs: { elysium: 3 },
            condition(){
                return global.tech.elysium === 3 && global.eden.fortress.armory > 0;
            },
            cost: {
                Troops(){
                    return jobScale(50);
                },
            },
            effect(){ 
                let desc = `<div class="has-text-warning">${loc(`eden_raid_supplies_effect`)}</div>`;
                if (global.eden.hasOwnProperty('fortress') && global.eden.fortress.hasOwnProperty('raid')){
                    desc += `<div>${loc(`eden_raid_fortress_result`)}</div>`;
                    desc += `<div>${loc(`eden_siege_fortress_lost`,[global.eden.fortress.raid.loss])}</div>`;
                    desc += `<div>${loc(`eden_siege_fortress_damage`,[global.eden.fortress.raid.damage])}</div>`;
                    desc += `<div class="has-text-caution">${loc('eden_fortress_armory',[global.eden['fortress'] ? global.eden.fortress.armory : 0])}</div>`;
                }
                return desc;
            },
            action(args){
                let armySize = jobScale(50);
                if (garrisonSize() < armySize){
                    return false;
                }

                let enemy_pats = global.eden.fortress.patrols * 2.5;
                let remain = Math.ceil(jobScale(50 - enemy_pats < 0 ? 0 : 50 - enemy_pats));

                if (remain <= 0){
                    global.eden.fortress['raid'] = { loss: armySize, damage: 0 };
                    global.civic.garrison.protest += armySize;
                    soldierDeath(armySize);
                    messageQueue(loc('eden_raid_fortress_fail'),'warning',false,['combat']);
                }
                else {
                    let dead = armySize - remain + Math.floor(seededRandom(0,jobScale(global.eden.fortress.detector / 2),true));
                    dead = deadCalc(dead, armySize);
                    remain = armySize - dead;

                    let troops = Math.ceil(armyRating(remain,'Troops'));
                    let damage = Math.floor(seededRandom(0,troops,true) / 50);

                    global.civic.garrison.protest += dead;
                    soldierDeath(dead);

                    global.civic.garrison.wounded += Math.floor(seededRandom(0,remain,true));
                    if (global.civic.garrison.wounded > global.civic.garrison.workers){
                        global.civic.garrison.wounded = global.civic.garrison.workers;
                    }

                    global.eden.fortress.armory -= damage;
                    if (global.eden.fortress.armory < 0){ global.eden.fortress.armory = 0; }
                    global.eden.fortress['raid'] = { loss: dead, damage: damage };
                    messageQueue(loc('eden_raid_fortress_success',[damage]),'success',false,['combat']);
                    drawTech();
                }

                renderEdenic();
                return false;
            }
        },
        ambush_patrol: { 
            id: 'eden-ambush_patrol',
            title: loc('eden_ambush_patrol'),
            desc: loc('eden_ambush_patrol'),
            queue_complete(){ return 0; },
            reqs: { elysium: 3 },
            condition(){
                return global.tech.elysium === 3 && global.eden.fortress.patrols > 0
            },
            cost: {
                Troops(){
                    return jobScale(25);
                },
            },
            effect(){ 
                let desc = `<div class="has-text-warning">${loc(`eden_ambush_patrol_effect`)}</div>`;
                if (global.eden.hasOwnProperty('fortress') && global.eden.fortress.hasOwnProperty('ambush')){
                    desc += `<div>${loc(`eden_ambush_patrol_result`)}</div>`;
                    desc += `<div>${loc(`eden_siege_fortress_lost`,[global.eden.fortress.ambush.loss])}</div>`;
                    desc += `<div>${loc(`eden_ambush_patrol_damage`,[global.eden.fortress.ambush.damage ? loc('true') : loc('false')])}</div>`;
                    desc += `<div class="has-text-caution">${loc('eden_fortress_patrols',[global.eden['fortress'] ? global.eden.fortress.patrols : 0])}</div>`;
                }
                return desc;
            },
            action(args){
                let armySize = jobScale(25);
                if (garrisonSize() < armySize){
                    return false;
                }

                if (armyRating(jobScale(1),'Troops') > Math.floor(seededRandom(0,global.eden.fortress.detector * 2,true))){
                    let dead = Math.floor(seededRandom(0,armySize,true));
                    dead = deadCalc(dead, armySize);
                    let remain = armySize - dead;

                    global.civic.garrison.protest += dead;
                    soldierDeath(dead);

                    global.civic.garrison.wounded += Math.floor(seededRandom(0,remain,true));
                    if (global.civic.garrison.wounded > global.civic.garrison.workers){
                        global.civic.garrison.wounded = global.civic.garrison.workers;
                    }

                    global.eden.fortress.patrols--;
                    global.eden.fortress['ambush'] = { loss: dead, damage: true };
                    messageQueue(loc('eden_ambush_patrol_success'),'success',false,['combat']);
                    drawTech();
                }
                else {
                    global.eden.fortress['ambush'] = { loss: armySize, damage: false };
                    global.civic.garrison.protest += armySize;
                    soldierDeath(armySize);
                    messageQueue(loc('eden_ambush_patrol_fail'),'warning',false,['combat']);
                }

                renderEdenic();
                return false;
            }
        },
        ruined_fortress: { 
            id: 'eden-ruined_fortress',
            title: loc('eden_ruined_fortress'),
            desc: loc('eden_ruined_fortress'),
            queue_complete(){ return 0; },
            reqs: { elysium: 4 },
            condition(){
                return global.tech.elysium < 8;
            },
            wiki: false,
            effect(){ 
                return loc('eden_ruined_fortress_effect');
            },
            action(args){
                return false;
            }
        },
        scout_elysium: {
            id: 'eden-scout_elysium',
            title: loc('eden_scout_elysium_title'),
            desc: loc('eden_scout_elysium_title'),
            reqs: { elysium: 4 },
            grant: ['elysium',5],
            queue_complete(){ return global.tech.elysium >= 5 ? 0 : 1; },
            cost: {
                Money(){ return 10000000000; },
                Oil(){ return 9000000; },
                Helium_3(){ return 6000000; },
                Troops(){ return jobScale(100); },
            },
            effect: loc('eden_scout_elysium_effect'),
            action(args){
                if (payCosts($(this)[0])){
                    messageQueue(loc('eden_scout_elysium_result'),'info',false,['progress']);
                    global.settings.eden.isle = true;
                    global.civic.garrison.protest += jobScale(50);
                    soldierDeath(jobScale(50));
                    return true;
                }
                return false;
            }
        },
};
