import { astrologySign, astroVal } from '../systems/seasons.js';
import { stockTick, stockAutoTrade } from '../stocks/stocks.js';
import { stockFlags } from '../stocks/stocks_core.js';
import { global, seededRandom, save, webWorker, atrack, breakdown } from '../core/vars.js';
import { longLoop_s1, longLoop_s2, longLoop_s3 } from '../loops/ml_longLoop_1.js';
import { eventList, events } from '../events/events.js';
import { messageQueue, eventActive, exceededATimeThreshold, addATime, tagEvent, gameLoop, modRes } from '../functions/functions.js';
import { mechStationEffect } from '../edenic/edenic.js';
import { cleanRemoveTrait, traits, fathomCheck } from '../races/races.js';
import { drawAchieve } from '../achievements/achieve.js';
import { loc } from '../core/locale.js';
import { govTitle } from '../civics/civics.js';
import { sythMap } from '../main.js';
import { S } from './main_state.js';

// Fungsi-fungsi dipindah dari main.js (urutan sumber dipertahankan). main.js tetap mengekspor ulang nama yang tadinya ter-ekspor.


export function longLoop(){
    const $ctx = {};
    const date = new Date();
    $ctx.astroSign = astrologySign();
    stockTick();
    if (global.race.species !== 'protoplasm'){

        longLoop_s1($ctx);
        longLoop_s2($ctx);
        longLoop_s3($ctx);
    }

    // Event triggered
    if (!global.race.seeded || (global.race.seeded && global.race['chose'])){
        if (Math.rand(0,global.event.t) === 0){
            let event_pool = eventList('major');
            if (event_pool.length > 0){
                let event = event_pool[Math.floor(seededRandom(0,event_pool.length))];
                let msg = events[event].effect();
                messageQueue(msg,'caution',false,['events','major_events']);
                global.event.l = event;
            }
            global.event.t = 999;
            if ($ctx.astroSign === 'pisces'){
                global.event.t -= astroVal('pisces')[0];
            }
        }
        else {
            global.event.t--;
        }

        if (global.race.species !== 'protoplasm'){
            if (Math.rand(0,global.m_event.t) === 0){
                let event_pool = eventList('minor');
                if (!global.race['pet'] && ((global.race['catnip'] && global.race.catnip >= 2) || (global.race['anise'] && global.race.anise >= 2))){
                    event_pool = ['pet'];
                }
                if (event_pool.length > 0){
                    let event = event_pool[Math.floor(seededRandom(0,event_pool.length))];
                    let msg = events[event].effect();
                    messageQueue(msg,false,false,['events','minor_events']);
                    global.m_event.l = event;
                }
                global.m_event.t = 850;
                if ($ctx.astroSign === 'pisces'){
                    global.m_event.t -= astroVal('pisces')[1];
                }
            }
            else {
                global.m_event.t--;
            }
        }

        if (global.race['witch_hunter'] && global.resource.Sus.amount >= 100){
            let odds = 300 - global.resource.Sus.amount;
            if (odds < 1){ odds = 1; }
            if (Math.rand(0,odds) === 0){
                let msg = events['witch_hunt_crusade'].effect();
                messageQueue(msg,'caution',false,['events','major_events']);
            }
        }
        if (global.race['witch_hunter'] && global.resource.Sus.amount >= 50 && global.civic.scientist.workers > 0){
            let odds = 250 - global.resource.Sus.amount * 2;
            if (odds < 50){ odds = 50; }
            if (Math.rand(0,odds) === 0){
                let msg = events['witch_hunt'].effect();
                messageQueue(msg,false,false,['events','minor_events']);
            }
        }
        if(global.stats.achieve['endless_hunger'] && global.city.banquet && global.city.banquet.on){
            global.city.banquet.strength++;
        }

        if (global.eden['mech_station']){
            mechStationEffect()
        }
    }

    if (global.race['warlord'] && global.race['shapeshifter']){
        cleanRemoveTrait('shapeshifter');
    }

    if (date.getMonth() === 11 && date.getDate() >= 17 && date.getDate() <= 24){
        global.special.gift[`g${date.getFullYear()}`] = true;
        global.tech['santa'] = 1;
    }
    else {
        delete global.tech['santa'];
    }

    if (eventActive('fool')){
        if (!$(`body`).hasClass('fool')){
            $(`body`).addClass('fool');
            drawAchieve({fool: true});
        }
    }
    else if ($(`body`).hasClass('fool')){
        $(`body`).removeClass('fool');
        drawAchieve();
    }

    const currentTimestamp = date.valueOf();
    // Checking if a substantial amount of time elapsed since last longLoop, indicating system suspension,
    // hibernation or something similar (the threshold is the same as for counting accelerated time during pause).
    let restartNeeded = false;
    // Set instead of restartNeeded when only the tick speed changes (accelerated time expiring), so the loop
    // can be rescheduled in place rather than torn down and rebuilt - see the 'period' case in gameLoop().
    let rescheduleNeeded = false;
    if (!global.settings.pause && exceededATimeThreshold(currentTimestamp)){
        // Adding accelerated time based on last current time which is updated below. A real time gap this
        // large (system suspend/hibernate, tab throttled) means the worker's drift-correction timing state is
        // stale, so this case gets a full restart rather than the lightweight reschedule.
        addATime(currentTimestamp);
        // The restart is needed to update the duration of the loop interval.
        restartNeeded = true;
    }

    // Save game state
    global.stats['current'] = currentTimestamp;
    if (!global.race.hasOwnProperty('geck')){
        save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
    }

    if (global.race.species !== 'protoplasm' && (global.stats.days + global.stats.tdays) % 100000 === 99999){
        messageQueue(loc(`backup_warning`), 'advanced', true);
    }

    S.kplv--;
    if (S.kplv <= 0){
        S.kplv = 60;
        tagEvent('page_view',{ page_title: `Game Loop` });
    }

    if (global.settings.pause && webWorker.s){
        gameLoop('stop');
    }

    if (atrack.t > 0){
        atrack.t--;
        global.settings.at--;
        if (global.settings.at <= 0 || atrack.t <= 0){
            global.settings.at = 0;
            // Boost just ran out mid-session - only the interval length needs to change, not a full restart.
            rescheduleNeeded = true;
        }
    }

    if (restartNeeded){
        gameLoop('stop');
        gameLoop('start');
    }
    else if (rescheduleNeeded){
        gameLoop('period');
    }
}

export function buildGene(blockGeneBuffer = false){
    let buffer = blockGeneBuffer ? 0 : 10000;
    if (global.resource.Knowledge.amount >= 200000 && global.resource.Knowledge.amount >= global.resource.Knowledge.max - buffer){
        global.resource.Knowledge.amount -= 200000;
        let gene = global.genes['synthesis'] ? sythMap[global.genes['synthesis']] : 1;
        global.resource.Genes.amount += gene;
    }
}

export function diffCalc(res,period){
    let sec = 1000;
    if (global.race['slow']){
        let slow = 1 + (traits.slow.vars()[0] / 100);
        sec = Math.floor(sec * slow);
    }
    if (global.race['hyper']){
        let fast = 1 - (traits.hyper.vars()[0] / 100);
        sec = Math.floor(sec * fast);
    }

    if (res === 'Money'){
        S.moneyTick = { delta: global.resource[res].delta, seconds: period / sec };
        // Stock auto-balance first (it adjusts Money amount and delta), so the rate shown below is the final one of this tick
        stockAutoTrade(S.moneyTick.delta, S.moneyTick.seconds, S.moneyClampLost + stockFlags.moneyLost, S.moneyStart);
    }
    global.resource[res].diff = +(global.resource[res].delta / (period / sec)).toFixed(2);
    global.resource[res].delta = 0;

    if (global.resource[res].hasOwnProperty('gen') && global.resource[res].hasOwnProperty('gen_d')){
        global.resource[res].gen = +(global.resource[res].gen_d / (period / sec)).toFixed(2);
        global.resource[res].gen_d = 0;
    }

    let el = $(`#res${res} .diff`);
    if (global.race['decay']){
        if (global.resource[res].diff < 0){
            if (global.resource[res].diff >= breakdown.p.consume[res][loc('evo_challenge_decay')]){
                if (!el.hasClass('has-text-warning')){
                    el.removeClass('has-text-danger');
                    el.addClass('has-text-warning');
                }
            }
            else {
                if (!el.hasClass('has-text-danger')){
                    el.removeClass('has-text-warning');
                    el.addClass('has-text-danger');
                }
            }
        }
        else if (global.resource[res].diff >= 0 && (el.hasClass('has-text-danger') || el.hasClass('has-text-warning'))){
            el.removeClass('has-text-danger');
            el.removeClass('has-text-warning');
        }
    }
    else if(res === global.race.species && global.race['fasting']){
        if(global.resource[res].diff >= 0 && global.resource[res].diff < 0.75){
            el.addClass('has-text-warning');
            el.removeClass('has-text-danger');
        }
        else if(global.resource[res].diff < 0){
            el.removeClass('has-text-warning');
            el.addClass('has-text-danger');
        }
        else if(global.resource[res].diff >= 0.75){
            el.removeClass('has-text-danger');
            el.removeClass('has-text-warning');
        }
    }
    else {
        if (global.resource[res].diff < 0 && !el.hasClass('has-text-danger')){
            el.addClass('has-text-danger');
        }
        else if (global.resource[res].diff >= 0 && el.hasClass('has-text-danger')){
            el.removeClass('has-text-danger');
        }
    }
}

export function steelCheck(){
    if (global.resource.Steel.display === false && Math.rand(0,1250) === 0){
        global.resource.Steel.display = true;
        modRes('Steel', 1, true);
        messageQueue(loc('steel_sample'),'info',false,['progress']);
    }
}

export function resourceAlt(){
    ['#resources > .resource','.tab-item > .market-item','#galaxyTrade > .market-item'].forEach(function(id){
        let alt = false;
        $(`${id}:visible`).each(function(){
            if (alt){
                $(this).addClass('alt');
                $(this).removeClass('prime');
                alt = false;
            }
            else {
                $(this).removeClass('alt');
                $(this).addClass('prime');
                alt = true;
            }
        });
    });
}

export function spyCaught(i){
    let escape = global.race['elusive'] || Math.floor(seededRandom(0,3)) === 0 ? true : false;
    let fathom = fathomCheck('satyr');
    if (fathom > 0 && Math.floor(seededRandom(0,100)) <= fathom * 100){
        escape = true;
    }
    if (!escape && global.civic.foreign[`gov${i}`].spy > 0){
        global.civic.foreign[`gov${i}`].spy -= 1;
    }
    if (!escape && Math.floor(seededRandom(0,4)) === 0){
        messageQueue(loc('event_spy_sellout',[govTitle(i)]),'danger',false,['spy']);
        let max = global.race['mistrustful'] ? 5 + traits.mistrustful.vars()[0] : 5;
        global.civic.foreign[`gov${i}`].hstl += Math.floor(seededRandom(1,max));
        if (global.civic.foreign[`gov${i}`].hstl > 100){
            global.civic.foreign[`gov${i}`].hstl = 100;
        }
    }
    else {
        messageQueue(loc(escape ? 'event_spy_fail' : 'event_spy',[govTitle(i)]),'danger',false,['spy']);
    }
}
