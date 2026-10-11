// Mechbay hell spire. Dulu awal midLoop_s7.
import { global } from '../../core/vars.js';
import { hooks } from '../../core/registries.js';
import { drawTech } from '../../actions/core/action_runner.js';
import { loc } from '../../core/locale.js';
import { messageQueue } from '../../functions/message_log.js';
import { timeFormat } from '../../functions/time_format.js';
import { unlockAchieve } from '../../achievements/achievement_logic.js';
import { alevel } from '../../achievements/achievement_helpers.js';
import { universeAffix } from '../../functions/universe_utils.js';
import { genSpireFloor, updateMechbay } from '../../portal/mech/mechbay.js';
import { mechRating } from '../../portal/mech/mech_analysis.js';
import { renderFortress } from '../../portal/hell/fortress_defense.js';

export function midLoopMechbay($ctx){
        if (global.portal.hasOwnProperty('mechbay') && global.tech['hell_spire'] && global.tech.hell_spire >= 9){
            if (!global.portal.spire['boss']){
                genSpireFloor();
            }
            updateMechbay();

            if (global.portal.hasOwnProperty('spire') && global.portal.spire.count >= 50 && !global.tech['edenic'] && Object.keys(global.pillars).length >= 10){
                messageQueue(loc('eden_purify_well_msg',[50]),'info',false,['progress']);
                global.tech['edenic'] = 1;
                drawTech();
            }

            let progress = 0;
            let mechSkips = global.eden['mech_station'] ? global.eden.mech_station.mechs : 0;
            for (let i = 0; i < global.portal.mechbay.active; i++) {
                let mech = global.portal.mechbay.mechs[i];
                if (mechSkips > 0 && mech.size !== 'collector'){
                    mechSkips--;
                }
                else {
                    if (global.portal.hasOwnProperty('waygate') && global.tech.hasOwnProperty('waygate') && global.portal.waygate.on === 1 && global.tech.waygate >= 2 && global.portal.waygate.progress < 100){
                        progress += mechRating(mech,true);
                    }
                    else {
                        progress += mechRating(mech,false);
                    }
                }
            }

            if (global.portal.hasOwnProperty('waygate') && global.tech.hasOwnProperty('waygate') && global.portal.waygate.on === 1 && global.tech.waygate >= 2 && global.portal.waygate.progress < 100){
                global.portal.waygate.progress += progress;
                global.portal.waygate.time = progress === 0 ? timeFormat(-1) : timeFormat((100 - global.portal.waygate.progress) / progress);
                global.portal.spire.time = timeFormat(-1);
            }
            else {
                global.portal.spire.progress += progress;
                global.portal.spire.time = progress === 0 ? timeFormat(-1) : timeFormat((100 - global.portal.spire.progress) / progress);
                if (global.tech['waygate'] && global.tech.waygate >= 2){
                    global.portal.waygate.time = timeFormat(-1);
                }
            }
            if (global.portal.hasOwnProperty('waygate') && global.portal.waygate.on === 1 && global.portal.waygate.progress >= 100){
                global.portal.waygate.progress = 100;
                global.portal.waygate.on = 0;
                global.tech.waygate = 3;
                global.resource.Demonic_Essence.display = true;
                global.resource.Demonic_Essence.amount = 1;
                drawTech();
            }
            if (global.portal.spire.progress >= 100){
                global.portal.spire.progress = 0;
                let rank = Number(alevel());
                let stones = rank;
                if (global.genes['blood'] && global.genes['blood'] >= 2){
                    stones *= 2;
                }
                global.prestige.Blood_Stone.count += stones;
                global.stats.blood += stones;
                hooks.arpa('Blood');
                if (!global.tech.hasOwnProperty('b_stone')){
                    global.tech['b_stone'] = 1;
                    drawTech();
                }

                messageQueue(
                    `${loc('portal_spire_conquest',[loc(`portal_mech_boss_${global.portal.spire.boss}`),global.portal.spire.count])} ${loc(stones === 1 ? 'portal_spire_conquest_stone' : 'portal_spire_conquest_stones',[stones])}`
                ,'info',false,['progress','hell']);

                global.portal.spire.count++;
                if (global.portal.spire.count > 10 && global.tech['hell_spire'] && global.tech.hell_spire < 10){
                    global.tech['hell_spire'] = 10;
                    drawTech();
                }

                let affix = universeAffix();
                if (!global.stats.spire.hasOwnProperty(affix)){
                    global.stats.spire[affix] = { s0: 0, s1: 0, s2: 0, s3: 0, s4: 0 };
                }
                if (global.portal.spire.count > global.stats.spire[affix][`s${rank-1}`]){
                    global.stats.spire[affix][`s${rank-1}`] = global.portal.spire.count;
                }
                if (!global.stats.spire[affix].hasOwnProperty(global.portal.spire.boss) || rank > global.stats.spire[affix][global.portal.spire.boss]){
                    global.stats.spire[affix][global.portal.spire.boss] = rank;
                }

                if ((global.portal.spire.boss === 'djinni' && global.race.species === 'djinn') || global.portal.spire.boss === global.race.species){
                    unlockAchieve('doppelganger');
                }

                genSpireFloor();
                renderFortress();
            }
        }
}
