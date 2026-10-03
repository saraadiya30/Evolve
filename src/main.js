import { global, save, webWorker, intervals, keyMap, resizeGame, breakdown, power_generated, p_on, support_on, int_on, set_qlevel } from './core/vars.js';
import { loc } from './core/locale.js';
import { challengeIcon } from './achievements/achieve.js';
import { gameLoop, vBind, popover, flib, initMessageQueue, messageQueue, calc_mastery, calcQueueMax, calcRQueueMax, buildQueue, powerGrid, loopTimers, calcQuantumLevel, drawPet } from './functions/functions.js';
import { races, traits, orbitLength, biomes, planetTraits, shapeShift } from './races/races.js';
import { defineResources } from './resources/resources.js';
import { defineJobs } from './civics/jobs.js';
import { gridDefs, replicator, setupRituals } from './industry/industry.js';
import { govEffect } from './civics/civics.js';
import { drawEvolution, updateQueueNames, planetGeology, start_cataclysm } from './actions/actions.js';
import { genPlanets, setUniverse, universe_types } from './space/space.js';
import { events } from './events/events.js';
import { govActive } from './governor/governor.js';
import { swissKnife } from './tech/tech.js';
import { index, mainVue, initTabs, loadTab } from './core/index.js';
import { setWeather, seasonDesc } from './systems/seasons.js';
import { getTopChange } from './wiki/change.js';
import { enableDebug } from './core/debug.js';
import { MORALE_BONUS_PER_LOT } from './stocks/stocks_core.js';
import { S } from './main/main_state.js';
import { execGameLoops } from './main/main_g1.js';
export { execGameLoops } from './main/main_g1.js';
import { resourceAlt } from './main/main_g4.js';
export { buildGene, steelCheck, spyCaught } from './main/main_g4.js';

{
    $(document).ready(function() {
        if (!window.matchMedia)
            return;

        var current = $('head > link[rel="icon"][media]');
        $.each(current, function(i, icon) {
            var match = window.matchMedia(icon.media);
            function swap() {
                if (match.matches) {
                    current.remove();
                    current = $(icon).appendTo('head');
                }
            }
            match.addListener(swap);
            swap();
        });
    });
}

var multitab = false;
window.addEventListener('storage', (e) => {
    if (multitab === false){
        messageQueue(loc(`multitab_warning`), 'danger', true);
    }
    multitab = true;
});

if (global.settings.expose){
    enableDebug();
}

var quickMap = {
    showCiv: 1,
    showCivic: 2,
    showResearch: 3,
    showResources: 4,
    showGenetics: 5,
    showMisc: 6,
    showAchieve: 7,
    settings: 8
};

$(document).keydown(function(e){
    e = e || window.event;
    let key = e.key || e.keyCode;
    Object.keys(keyMap).forEach(function(k){
        if (key === global.settings.keyMap[k]){
            keyMap[k] = true;
        }
    });
    if (!$(`input`).is(':focus') && !$(`textarea`).is(':focus')){
        Object.keys(quickMap).forEach(function(k){
            // Misc has no global.settings.showMisc flag like the other tabs - it gates on species the same way
            // the tab's own :visible="showMiscTab()" does (see index.js), so it's checked separately here.
            if (key === global.settings.keyMap[k] && global.settings.civTabs !== 0 && (k === 'settings' || (k === 'showMisc' ? global.race.species !== 'protoplasm' : global.settings[k]))){
                if (global.settings.civTabs !== quickMap[k]) {
                    global.settings.civTabs = quickMap[k];
                }
                else {
                    let s = global.settings;
                    let tabName = null;
                    let tabList = null;
                    switch(quickMap[k]) {
                            // Some sub tabs are always visible, and JavaScript strings
                            // are truthy, so the sub tab name is used for clarity.
                        case quickMap.showCiv:
                            tabName = 'spaceTabs';
                            tabList = [s.showCity, s.showSpace, s.showDeep, s.showGalactic, s.showPortal, s.showOuter, s.showTau, s.showEden];
                            break;
                        case quickMap.showCivic:
                            // not reaching Military
                            tabName = 'govTabs';
                            tabList = ["Government", s.showIndustry, s.showPowerGrid, s.showMil, s.showMechLab, s.showShipYard, s.showPsychic, s.showWish];
                            break;
                        case quickMap.showResearch:
                            tabName = 'resTabs';
                            tabList = ["New", "Completed"]; // always visible
                            break;
                        case quickMap.showResources:
                            tabName = 'marketTabs';
                            tabList = [s.showMarket, s.showStorage, s.showEjector, s.showCargo, s.showAlchemy];
                            break;
                        case quickMap.showGenetics:
                            s = global.settings.arpa;
                            tabName = 'arpaTabs';
                            tabList = [s.physics, s.genetics, s.crispr, s.blood];
                            break;
                        case quickMap.showMisc:
                            tabName = 'miscTabs';
                            tabList = ["Aether", "New"]; // always visible
                            break;
                        case quickMap.showAchieve:
                            tabName = 'statsTabs';
                            tabList = ["Stats", "Achievements", "Perks"]; // always visible
                            break;
                        case quickMap.settings:
                        default:
                            // no sub tabs
                            tabName = '';
                            tabList = [];
                            break;
                    }
                    for (let i = 1; i < tabList.length; i+=1) {
                        let next = (s[tabName] + i) % tabList.length
                        if (tabList[next]) {
                            s[tabName] = next;
                            break;
                        }
                    }
                }
                if (!global.settings.tabLoad){
                    loadTab(global.settings.civTabs);
                }
            }
        });
    }
});
$(document).keyup(function(e){
    e = e || window.event;
    let key = e.key || e.keyCode;
    Object.keys(keyMap).forEach(function(k){
        if (key === global.settings.keyMap[k]){
            keyMap[k] = false;
        }
    });
});
$(document).mousemove(function(e){
    e = e || window.event;
    Object.keys(global.settings.keyMap).forEach(function(k){
        switch(global.settings.keyMap[k]){
            case 'Shift':
            case 16:
                keyMap[k] = e.shiftKey ? true : false;
                break;
            case 'Control':
            case 17:
                keyMap[k] = e.ctrlKey ? true : false;
                break;
            case 'Alt':
            case 18:
                keyMap[k] = e.altKey ? true : false;
                break;
            case 'Meta':
            case 91:
                keyMap[k] = e.metaKey ? true : false;
                break;
        }
    });
});

index();
var revision = global['revision'] ? global['revision'] : '';
if (global['beta']){
    $('#topBar .version > a').html(`v${global.version} Beta ${global.beta}${revision}`);
}
else {
    $('#topBar .version > a').html('v'+global.version+revision);
}

initMessageQueue();

if (global.lastMsg){
    Object.keys(global.lastMsg).forEach(function (tag){
        global.lastMsg[tag].reverse().forEach(function(msg){
            messageQueue(msg.m, msg.c, true, [tag], true);
        });
        global.lastMsg[tag].reverse();
    });
}

$(`#msgQueue`).height(global.settings.msgQueueHeight);
$(`#buildQueue`).height(global.settings.buildQueueHeight);

if (global.queue.rename === true){
    updateQueueNames(true);
    global.queue.rename = false;
}

global.settings.sPackMsg = save.getItem('string_pack_name') ? loc(`string_pack_using`,[save.getItem('string_pack_name')]) : loc(`string_pack_none`);

if (global.queue.display){
    calcQueueMax();
}
if (global.r_queue.display){
    calcRQueueMax();
}

mainVue();

if (global['new']){
    messageQueue(loc('new'), 'warning',false,['progress']);
    global['new'] = false;
}
if (global.city['mass_driver']){
    p_on['mass_driver'] = global.city['mass_driver'].on;
}
if (global.portal['turret']){
    p_on['turret'] = global.portal.turret.on;
}
if (global.interstellar['starport']){
    p_on['starport'] = global.interstellar.starport.on;
}
if (global.interstellar['fusion']){
    int_on['fusion'] = global.interstellar.fusion.on;
}
if (global.interstellar['s_gate']){
    p_on['s_gate'] = global.interstellar.s_gate.on;
}
if (global.portal['hell_forge']){
    p_on['hell_forge'] = global.portal.hell_forge.on;
}
if (global.portal['demon_forge']){
    p_on['demon_forge'] = global.portal.demon_forge.on;
}
if (global.space['sam']){
    p_on['sam'] = global.space.sam.on;
}
if (global.space['operating_base']){
    p_on['operating_base'] = global.space.operating_base.on;
    support_on['operating_base'] = global.space.operating_base.on;
}
if (global.space['fob']){
    p_on['fob'] = global.space.fob.on;
}
if (global.tauceti['fusion_generator']){
    p_on['fusion_generator'] = global.tauceti.fusion_generator.on;
}
if (global.eden['encampment']){
    p_on['encampment'] = global.eden.encampment.on;
}
if (global.eden['soul_engine']){
    p_on['soul_engine'] = global.eden.soul_engine.on;
    support_on['soul_engine'] = global.eden.soul_engine.on;
}
if (global.eden['corruptor']){
    p_on['corruptor'] = global.eden.corruptor.on;
}
if (global.eden['ectoplasm_processor']){
    p_on['ectoplasm_processor'] = global.eden.ectoplasm_processor.on;
    support_on['ectoplasm_processor'] = global.eden.ectoplasm_processor.on;
}
if (global.eden['research_station']){
    p_on['research_station'] = global.eden.research_station.on;
    support_on['research_station'] = global.eden.research_station.on;
}
if (global.eden['bunker']){
    p_on['bunker'] = global.eden.bunker.on;
    support_on['bunker'] = global.eden.bunker.on;
}
if (global.eden['spirit_vacuum']){
    p_on['spirit_vacuum'] = global.eden.spirit_vacuum.on;
}
if (global.eden['spirit_battery']){
    p_on['spirit_battery'] = global.eden.spirit_battery.on;
}
if (global.city['replicator'] && global.race?.replicator?.pow && global.race?.governor?.config?.replicate?.pow?.on){
    if (Object.values(global.race.governor.tasks || {}).includes('replicate')){
        global.city.replicator.on = 0;
        global.city.replicator.count = 0;
        global.race.replicator.pow = 0;
    }
}

defineJobs(true);
defineResources();
initTabs();
buildQueue();
if (global.race['shapeshifter']){
    shapeShift(false,true);
}
setupRituals();

Object.keys(gridDefs()).forEach(function(gridtype){
    powerGrid(gridtype);
});

resizeGame();

vBind({
    el: '#race',
    data: {
        race: global.race,
        city: global.city
    },
    methods: {
        name(){
            return flib('name');
        }
    },
    filters: {
        replicate(kw){
            if (global.race.hasOwnProperty('governor') && global.race.governor.hasOwnProperty('tasks') && global.race.hasOwnProperty('replicator') && Object.values(global.race.governor.tasks).includes('replicate') && global.race.governor.config.replicate.pow.on && global.race.replicator.pow > 0){
                return kw + global.race.replicator.pow;
            }
            return kw;
        },
        approx(kw){
            return +(kw).toFixed(2);
        },
        mRound(m){
            return +(m).toFixed(1);
        }
    }
});

popover('race',
    function(){
        return typeof races[global.race.species].desc === 'string' ? races[global.race.species].desc : races[global.race.species].desc();
    },{
        elm: '#race > .name'
    }
);

S.moraleCap = 125;

popover('morale',
    function(obj){
        if (global.city.morale.unemployed !== 0){
            let type = global.city.morale.unemployed > 0 ? 'success' : 'danger';
            obj.popper.append(`<p class="modal_bd"><span>${loc(global.race['playful'] ? 'morale_hunter' : 'morale_unemployed')}</span> <span class="has-text-${type}"> ${+(global.city.morale.unemployed).toFixed(1)}%</span></p>`);
        }
        if (global.city.morale.stress !== 0){
            let type = global.city.morale.stress > 0 ? 'success' : 'danger';
            obj.popper.append(`<p class="modal_bd"><span>${loc('morale_stress')}</span> <span class="has-text-${type}"> ${+(global.city.morale.stress).toFixed(1)}%</span></p>`);
        }

        let total = 100 + global.city.morale.unemployed + global.city.morale.stress;
        Object.keys(global.city.morale).forEach(function (morale){
            if (!['current','unemployed','stress','season','cap','potential','pet'].includes(morale) && global.city.morale[morale] !== 0){
                total += global.city.morale[morale];
                let type = global.city.morale[morale] > 0 ? 'success' : 'danger';

                let value = global.city.morale[morale];
                if (morale === 'entertain' && global.civic.govern.type === 'democracy'){
                    let democracy = 1 + (govEffect.democracy()[0] / 100);
                    value /= democracy;
                }

                let label = {  }

                obj.popper.append(`<p class="modal_bd"><span>${loc(`morale_${morale}`)}</span> <span class="has-text-${type}"> ${+(value).toFixed(1)}%</span></p>`)

                if (morale === 'entertain' && global.civic.govern.type === 'democracy'){
                    let democracy = govEffect.democracy()[0];
                    obj.popper.append(`<p class="modal_bd"><span>ᄂ${loc('govern_democracy')}</span> <span class="has-text-success"> +${democracy}%</span></p>`);
                }
            }
        });

        if (global.city.morale.season !== 0){
            total += global.city.morale.season;
            let season = global.city.calendar.season === 0 ? loc('morale_spring') : global.city.calendar.season === 1 ? loc('morale_summer') : loc('morale_winter');
            let type = global.city.morale.season > 0 ? 'success' : 'danger';
            obj.popper.append(`<p class="modal_bd"><span>${season}</span> <span class="has-text-${type}"> ${+(global.city.morale.season).toFixed(1)}%</span></p>`);
        }

        if (global.civic.govern.type === 'corpocracy'){
            let penalty = govEffect.corpocracy()[3];
            total -= penalty;
            obj.popper.append(`<p class="modal_bd"><span>${loc('govern_corpocracy')}</span> <span class="has-text-danger"> -${penalty}%</span></p>`);
        }
        if (global.civic.govern.type === 'republic'){
            let repub = govEffect.republic()[1];
            total += repub;
            obj.popper.append(`<p class="modal_bd"><span>${loc('govern_republic')}</span> <span class="has-text-success"> ${repub}%</span></p>`);
        }
        if (global.civic.govern.type === 'federation'){
            let fed = govEffect.federation()[1];
            total += fed;
            obj.popper.append(`<p class="modal_bd"><span>${loc('govern_federation')}</span> <span class="has-text-success"> ${fed}%</span></p>`);
        }

        let milVal = govActive('militant',1);
        if (milVal){
            total -= milVal;
            obj.popper.append(`<p class="modal_bd"><span>${loc('gov_trait_militant')}</span> <span class="has-text-danger"> -${milVal}%</span></p>`);
        }

        if (global.race['cheese']){
            let raw_cheese = global.stats.hasOwnProperty('reset') ? global.stats.reset + 1 : 1;
            let cheese = +(raw_cheese / (raw_cheese + 10) * 11).toFixed(2);
            total += cheese;
            obj.popper.append(`<p class="modal_bd"><span>${swissKnife(true,false)}</span> <span class="has-text-success"> ${cheese}%</span></p>`);
        }

        if (global.race['motivated']){
            let boost = Math.ceil(global.race['motivated'] ** 0.4);
            total += boost;
            obj.popper.append(`<p class="modal_bd"><span>${loc(`event_motivation_bd`)}</span> <span class="has-text-success"> ${boost}%</span></p>`);
        }

        if (global.race['artisan'] && global.civic.craftsman.workers > 0){
            let boost = +(traits.artisan.vars()[2] * global.civic.craftsman.workers).toFixed(2);
            total += boost;
            obj.popper.append(`<p class="modal_bd"><span>${loc(`trait_artisan_name`)}</span> <span class="has-text-success"> ${boost}%</span></p>`)
        }

        if (global.race['pet'] && global.city.morale.pet){
            let change = global.city.morale.pet;
            total += change;
            let style = change > 0 ? 'success' : 'danger';
            obj.popper.append(`<p class="modal_bd"><span>${loc(`event_pet_${global.race.pet.type}_owner`)}</span> <span class="has-text-${style}"> ${change}%</span></p>`);
        }

        if (global.race['wishStats'] && global.race.wishStats.fame !== 0){
            total += global.race.wishStats.fame;
            if (global.race.wishStats.fame > 0){
                obj.popper.append(`<p class="modal_bd"><span>${loc(`wish_reputable`)}</span> <span class="has-text-success"> ${global.race.wishStats.fame}%</span></p>`);
            }
            else {
                obj.popper.append(`<p class="modal_bd"><span>${loc(`wish_notorious`)}</span> <span class="has-text-danger"> ${global.race.wishStats.fame}%</span></p>`);
            }
        }

        if (global.civic['homeless']){
            let homeless = global.civic.homeless / 2;
            total -= homeless;
            obj.popper.append(`<p class="modal_bd"><span>${loc(`homeless`)}</span> <span class="has-text-danger"> -${homeless}%</span></p>`);
        }

        if (global.tech['vax_c'] || global.tech['vax_f']){
            let drop = global.tech['vax_c'] ? 10 : 50;
            total -= drop;
            obj.popper.append(`<p class="modal_bd"><span>${loc(global.tech['vax_c'] ? `tech_vax_strat4_bd` : `tech_vax_strat2_bd`)}</span> <span class="has-text-danger"> -${drop}%</span></p>`);
        }
        else if (global.tech['vax_s']){
            let gain = 20;
            total += gain;
            obj.popper.append(`<p class="modal_bd"><span>${loc(`tech_vax_strat3_bd`)}</span> <span class="has-text-success"> ${gain}%</span></p>`);
        }

        if (global.city['tormented']){
            total -= global.city.tormented;
            obj.popper.append(`<p class="modal_bd"><span>${loc(`trait_tormented_name`)}</span> <span class="has-text-danger"> -${global.city.tormented}%</span></p>`);
        }

        if (global.race['wish'] && global.race['wishStats'] && global.race.wishStats.bad > 0){
            let badPress = Math.floor(global.race.wishStats.bad / 75) + 1;
            total -= badPress * 5;
            obj.popper.append(`<p class="modal_bd"><span>${loc(`wish_bad`)}</span> <span class="has-text-danger"> -${badPress * 5}%</span></p>`);
        }

        // This tooltip's "Total" is its own separate tally of morale modifiers - it doesn't reuse the real
        // calculation in the main tick, so the Morale stock bonus (a flat +0.1%/lot added to current, not part
        // of any modifier above) has to be listed here too, or Current can sit far above Total with nothing in
        // the breakdown explaining the gap.
        if (global.stocks && global.stocks.market &&  global.stocks.market.Morale && global.stocks.market.Morale.lots > 0){
            let stockBonus = global.stocks.market.Morale.lots * MORALE_BONUS_PER_LOT;
            total += stockBonus;
            obj.popper.append(`<p class="modal_bd"><span>${loc('stock_bonus_label')}</span> <span class="has-text-success"> ${+(stockBonus).toFixed(1)}%</span></p>`);
        }

        total = +(total).toFixed(1);

        let container = $(`<div></div>`);
        obj.popper.append(container);

        container.append(`<div class="modal_bd sum"><span>${loc('morale_total')}</span> <span class="has-text-warning"> ${+(total).toFixed(1)}%</span></div>`);
        container.append(`<div class="modal_bd"><span>${loc('morale_max')}</span> <span class="has-text-${total > S.moraleCap ? 'caution' : 'warning'}"> ${+(S.moraleCap).toFixed(1)}%</span></div>`);
        container.append(`<div class="modal_bd"><span>${loc('morale_current')}</span> <span class="has-text-warning"> ${+(global.city.morale.current).toFixed(1)}%</span></div>`);

        return undefined;
    },
    {
        classes: `has-background-light has-text-dark`
    }
);

popover('powerStatus',function(obj){
        let drain = +(global.city.power_total - global.city.power).toFixed(2);
        Object.keys(power_generated).forEach(function (k){
            if (power_generated[k]){
                let gen = +power_generated[k];
                obj.popper.append(`<p class="modal_bd"><span>${k}</span> <span class="has-text-success">+${+gen.toFixed(2)}</span></p>`);
            }
        });
        obj.popper.append(`<p class="modal_bd"><span>${loc('power_consumed')}</span> <span class="has-text-danger"> -${drain}</span></p>`);
        let avail = +(global.city.power).toFixed(2);
        if (global.city.power > 0){
            obj.popper.append(`<p class="modal_bd sum"><span>${loc('power_available')}</span> <span class="has-text-success">${avail}</span></p>`);
        }
        else {
            obj.popper.append(`<p class="modal_bd sum"><span>${loc('power_available')}</span> <span class="has-text-danger">${avail}</span></p>`);
        }
    },
    {
        classes: `has-background-light has-text-dark`
    }
);

if (global.settings.pause){
    $(`#pausegame`).addClass('pause');
}
else {
    $(`#pausegame`).addClass('play');
}

vBind({
    el: '#topBar',
    data: {
        city: global.city,
        race: global.race,
        s: global.settings
    },
    methods: {
        sign(){
            return seasonDesc('sign');
        },
        getAstroSign(){
            return seasonDesc('astrology');
        },
        weather(){
            return seasonDesc('weather');
        },
        temp(){
            return seasonDesc('temp');
        },
        moon(){
            return seasonDesc('moon');
        },
        season() {
            return seasonDesc('season');
        },
        showUniverse(){
            return global.race.universe === 'standard' || global.race.universe === 'bigbang' ? false : true;
        },
        showSim(){
            return global['sim'] ? true : false;
        },
        atRemain(){
            return loc(`accelerated_time`);
        },
        pause(){
            $(`#pausegame`).removeClass('play');
            $(`#pausegame`).removeClass('pause');
            if (global.settings.pause){
                global.settings.pause = false;
                $(`#pausegame`).addClass('play');
            }
            else {
                global.settings.pause = true;
                $(`#pausegame`).addClass('pause');
            }
            if (!global.settings.pause && !webWorker.s){
                gameLoop('start');
            }
        },
        pausedesc(){
            return global.settings.pause ? loc('game_play') : loc('game_pause');
        },
        showPet(){
            return global.race['pet'] ? true : false;
        },
        petPet(){
            if (global.race['pet'] && global.race.pet.pet === 0){
                let outcome = global.race.pet.type === 'cat' ? Math.rand(0,3) : Math.rand(0,10);
                if (outcome === 0){
                    global.race.pet.pet = -60;
                    messageQueue(loc(`event_${global.race.pet.type}_pet_failure`,[loc(`event_${global.race.pet.type}_name${global.race.pet.name}`)]),false,false,['events','minor_events']);
                }
                else {
                    global.race.pet.pet = 60;
                    messageQueue(loc(`event_${global.race.pet.type}_pet_success`,[loc(`event_${global.race.pet.type}_name${global.race.pet.name}`)]),false,false,['events','minor_events']);
                }
            }
        }
    },
    filters: {
        planet(species){
            return races[species].home;
        },
        universe(universe){
            return universe === 'standard' || universe === 'bigbang' ? '' : universe_types[universe].name;
        },
        remain(at){
            let minutes = Math.ceil(at * loopTimers().longTimer / 60000);
            if (minutes > 0){
                let hours = Math.floor(minutes / 60);
                minutes -= hours * 60;
                return `${hours}:${minutes.toString().padStart(2,'0')}`;
            }
            return;
        }
    }
});

['astroSign'].forEach(function(topId){
    popover(`${topId}`,function(){
        return seasonDesc('sign');
    }, {
        elm: $(`#${topId}`)
    });
});

popover('topBarPlanet',
    function(obj){
        if (global.race.species === 'protoplasm'){
            obj.popper.append($(`<span>${loc('infant')}</span>`));
        }
        else {
            let planet = races[global.race.species].home;
            let race = flib('name');
            let planet_label = biomes[global.city.biome].label;
            let trait = global.city.ptrait;
            if (trait.length > 0){
                let traits = '';
                trait.forEach(function(t){
                    if (planetTraits.hasOwnProperty(t)){
                        if (t === 'mellow' && global.race.species === 'entish'){
                            traits += `${loc('planet_mellow_eg')} `;
                        }
                        else {
                            traits += `${planetTraits[t].label} `;
                        }
                    }
                });
                planet_label = `${traits}${planet_label}`;
            }
            let orbit = orbitLength();

            let geo_traits = planetGeology(global.city.geology);

            let challenges = '';
            if (global.race['truepath']){
                challenges = challenges + `<div>${loc('evo_challenge_truepath_recap')}</div>`;
            }
            if (global.race['junker']){
                challenges = challenges + `<div>${loc('evo_challenge_junker_desc')} ${loc('evo_challenge_junker_conditions')}</div>`;
            }
            if (global.race['joyless']){
                challenges = challenges + `<div>${loc('evo_challenge_joyless_desc')} ${loc('evo_challenge_joyless_conditions')}</div>`;
            }
            if (global.race['steelen']){
                challenges = challenges + `<div>${loc('evo_challenge_steelen_desc')} ${loc('evo_challenge_steelen_conditions')}</div>`;
            }
            if (global.race['decay']){
                challenges = challenges + `<div>${loc('evo_challenge_decay_desc')} ${loc('evo_challenge_decay_conditions')}</div>`;
            }
            if (global.race['emfield']){
                challenges = challenges + `<div>${loc('evo_challenge_emfield_desc')} ${loc('evo_challenge_emfield_conditions')}</div>`;
            }
            if (global.race['inflation']){
                challenges = challenges + `<div>${loc('evo_challenge_inflation_desc')} ${loc('evo_challenge_inflation_conditions')}</div>`;
            }
            if (global.race['banana']){
                challenges = challenges + `<div>${loc('evo_challenge_banana_desc')} ${loc('wiki_achieve_banana1')}. ${loc('wiki_achieve_banana2')}. ${loc('wiki_achieve_banana3')}. ${loc('wiki_achieve_banana4',[500])}. ${loc('wiki_achieve_banana5',[50])}.</div>`;
            }
            if (global.race['witch_hunter']){
                challenges = challenges + `<div>${loc('evo_challenge_witch_hunter_desc')}</div>`;
            }
            if (global.race['nonstandard']){
                challenges = challenges + `<div>${loc('evo_challenge_nonstandard_desc')}</div>`;
            }
            if (global.race['gravity_well']){
                challenges = challenges + `<div>${loc('evo_challenge_gravity_well_desc')}</div>`;
            }
            if (global.race['warlord']){
                challenges = challenges + `<div>${loc('evo_challenge_warlord_desc')}</div>`;
            }
            if (global.race['fasting']){
                challenges = challenges + `<div>${loc('evo_challenge_fasting_desc')}</div>`;
            }
            if (global.race['lone_survivor']){
                challenges = challenges + `<div>${loc('evo_challenge_lone_survivor_desc')}</div>`;
            }
            if (global.race['sludge']){
                challenges = challenges + `<div>${loc('evo_challenge_sludge_desc')} ${loc('evo_challenge_sludge_conditions')}</div>`;
            }
            if (global.race['ultra_sludge']){
                challenges = challenges + `<div>${loc('evo_challenge_ultra_sludge_desc')} ${loc('evo_challenge_ultra_sludge_conditions')}</div>`;
            }
            if (global.race['orbit_decay']){
                let impact = global.race['orbit_decayed'] ? '' : loc('evo_challenge_orbit_decay_impact',[global.race['orbit_decay'] - global.stats.days]);
                let state = global.race['orbit_decayed'] ? (global.race['tidal_decay'] ? loc(`planet_kamikaze_msg`) : loc('evo_challenge_orbit_decay_impacted',[races[global.race.species].home])) : loc('evo_challenge_orbit_decay_desc');
                challenges = challenges + `<div>${state} ${loc('evo_challenge_orbit_decay_conditions')} ${impact}</div>`;
                if (calc_mastery() >= 100 && global.race.universe !== 'antimatter'){
                    challenges = challenges + `<div class="has-text-caution">${loc('evo_challenge_cataclysm_warn')}</div>`;
                }
                else {
                    challenges = challenges + `<div class="has-text-danger">${loc('evo_challenge_scenario_warn')}</div>`;
                }
            }

            if (global.race['cataclysm']){
                if (calc_mastery() >= 50 && global.race.universe !== 'antimatter'){
                    challenges = challenges + `<div>${loc('evo_challenge_cataclysm_desc')}</div><div class="has-text-caution">${loc('evo_challenge_cataclysm_warn')}</div>`;
                }
                else {
                    challenges = challenges + `<div>${loc('evo_challenge_cataclysm_desc')}</div><div class="has-text-danger">${loc('evo_challenge_scenario_warn')}</div>`;
                }
            }
            obj.popper.append($(`<div>${loc(global.race['cataclysm'] ? 'no_home' : 'home',[planet,race,planet_label,orbit])}</div>${geo_traits}${challenges}`));
        }
        return undefined;
    },
    {
        elm: `#topBar .planetWrap .planet`,
        classes: `has-background-light has-text-dark`
    }
);

popover('topBarUniverse',
    function(obj){
        obj.popper.append($(`<div>${universe_types[global.race.universe].desc}</div>`));
        obj.popper.append($(`<div>${universe_types[global.race.universe].effect}</div>`));
        return undefined;
    },
    {
        elm: `#topBar .planetWrap .universe`,
        classes: `has-background-light has-text-dark`
    }
);

popover('topBarSimulation',
    function(obj){
        obj.popper.append($(`<div>${loc(`evo_challenge_simulation_topbar`)}</div>`));
        return undefined;
    },
    {
        elm: `#topBar .planetWrap .simulation`,
        classes: `has-background-light has-text-dark`
    }
);

if (global.race['orbit_decay'] && !global.race['orbit_decayed']){
    popover(`infoTimer`, function(){
        return global.race['orbit_decayed'] ? '' : loc('evo_challenge_orbit_decay_impact',[global.race['orbit_decay'] - global.stats.days]);
    },
    {
        elm: `#infoTimer`,
        classes: `has-background-light has-text-dark`
    });
}

challengeIcon();
drawPet();

if (global.race.species === 'protoplasm'){
    global.resource.RNA.display = true;
    let perk_rank = global.stats.feat['master'] && global.stats.achieve['ascended'] && global.stats.achieve.ascended.l > 0 ? Math.min(global.stats.achieve.ascended.l,global.stats.feat['master']) : 0;
    if (global['sim']){ perk_rank = 5; }
    if (perk_rank > 0 && !global.evolution['mloaded']){
        let evolve_actions = ['dna','membrane','organelles','nucleus','eukaryotic_cell','mitochondria'];
        for (let i = 0; i < evolve_actions.length; i++) {
            if (!global.evolution[evolve_actions[i]]){
                global.evolution[evolve_actions[i]] = { count: 0 };
            }
        }
        global.evolution['dna'] = 1;
        global.resource.DNA.display = true;
        global.evolution.membrane.count = perk_rank * 2;
        global.evolution.eukaryotic_cell.count = perk_rank;
        global.evolution.mitochondria.count = perk_rank;
        global.evolution.organelles.count = perk_rank * 2;
        global.evolution.nucleus.count = perk_rank * 2;
        global.tech['evo'] = 2;
        global.evolution['mloaded'] = 1;
    }
    let grand_rank = global.stats.feat['grandmaster'] && global.stats.achieve['corrupted'] && global.stats.achieve.corrupted.l > 0 ? Math.min(global.stats.achieve.corrupted.l,global.stats.feat['grandmaster']) : 0;
    if (global['sim']){ grand_rank = 5; }
    if (grand_rank >= 5 && !global.evolution['gmloaded']){
        global.tech['evo'] = 6;
        global.evolution['gselect'] = true;
        global.evolution['gmloaded'] = 1;
        global.evolution['final'] = 80;
        global.tech['evo_humanoid'] = 1;
        global.tech['evo_giant'] = 1;
        global.tech['evo_small'] = 1;
        global.tech['evo_animalism'] = 2;
        global.tech['evo_demonic'] = 1;
        global.tech['evo_angelic'] = 1;
        global.tech['evo_insectoid'] = 1;
        global.tech['evo_eggshell'] = 2;
        global.tech['evo_eldritch'] = 1;
        global.tech['evo_sand'] = 1;
        global.tech['evo_polar'] = 1;
        global.tech['evo_heat'] = 1;
        global.tech['evo_fey'] = 1;
        global.tech['evo_aquatic'] = 1;
    }
    if (global.race.universe === 'bigbang'){
        global.seed = global.race.seed;
        setUniverse();
    }
    else if (global.race.seeded && !global.race['chose']){
        global.seed = global.race.seed;
        genPlanets();
    }
    else {
        drawEvolution();
    }
}
else {
    if (global.portal.hasOwnProperty('soul_forge') && global.portal.soul_forge.on){
        p_on['soul_forge'] = 1;
    }
    setWeather();
}

set_qlevel(calcQuantumLevel(true));

$('#lbl_city').html('Village');

S.loopTick = 0;

if (window.Worker){
    webWorker.w = new Worker("evolve/evolve.js");
    webWorker.w.addEventListener('message', function(e){
        const data = e.data;
        switch (data.loop) {
            case 'main':
                let speedMult = 1;
                if (global.prestige.hasOwnProperty('Aether') && global.settings.aetherSpeed > 0){
                    let draw = Math.min(global.settings.aetherSpeed, Math.floor(global.prestige.Aether.count));
                    if (draw > 0){
                        global.prestige.Aether.count -= draw;
                        speedMult = 1 + draw;
                    }
                }
                execGameLoops(data.periods * speedMult);
                break;
        }
    }, false);
}
gameLoop('start');

resourceAlt();

export var firstRun = true;
S.gene_sequence = global.arpa['sequence'] && global.arpa['sequence']['on'] ? global.arpa.sequence.on : 0;
// Money delta of the last fast tick and how many seconds that tick lasted, captured by diffCalc() just before it resets
// the delta. Used by the stock auto-balance to see the Money income of a tick.
S.moneyTick = null;
// Money that the storage cap cut off during the last fast tick (0 when the cap was not hit)
S.moneyClampLost = 0;
S.moneyStart = NaN;

export let sythMap = {
    1: 1.1,
    2: 1.25,
    3: 1.5,
};

S.kplv = 60;

intervals['version_check'] = setInterval(function(){
    $.ajax({
        url: 'https://pmotschmann.github.io/Evolve/package.json',
        type: 'GET',
        dataType: 'json',
        success: function(res){
            if (res['version'] && res['version'] != global['version'] && !global['beta']){
                $('#topBar .version > a').html(`<span class="has-text-warning">${loc(`update_avail`)}</span> v`+global.version+revision);
            }
        }
    });
}, 900000);

let changeLog = $(`<div class="infoBox"></div>`);
popover('versionLog',getTopChange(changeLog),{ wide: true });

if (global.race['start_cataclysm']){
    start_cataclysm();
}

export function set_firstRun(v){ return firstRun = v; }
