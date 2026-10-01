import { loadIndustry, cancelRituals, nf_resources } from './industry.js';
import { galacticTrade } from './resources.js';
import { global } from './vars.js';
import { loc } from './locale.js';
import { actions } from './actions_registry.js';
import { messageQueue, clearElement, eventActive, deepClone } from './functions.js';
import { races } from './races.js';
import { removeTask, defineGovernor, govActive } from './governor.js';
import { job_desc } from './jobs.js';
import { renderSpace } from './space.js';
import { setAction } from './actions_f4.js';
import { drawEvolution } from './actions_f2.js';
import { sentience } from './actions_f8.js';

// Fungsi-fungsi dipindah dari actions.js (urutan sumber dipertahankan). actions.js tetap mengekspor ulang nama yang tadinya ter-ekspor.


export function drawModal(c_action,type){
    let title = typeof c_action.title === 'string' ? c_action.title : c_action.title();
    $('#modalBox').append($(`<p id="modalBoxTitle" class="has-text-warning modalTitle">${title}</p>`));

    var body = $('<div id="specialModal" class="modalBody"></div>');
    $('#modalBox').append(body);

    switch(type){
        case 'smelter':
        case 'hell_smelter':
        case 'stellar_forge':
        case 'hell_forge':
        case 'demon_forge':
        case 'sacred_smelter':
        case 'geothermal':
        case 'ore_refinery':
            loadIndustry('smelter',body);
            break;
        case 'factory':
        case 'red_factory':
        case 'int_factory':
        case 'tau_factory':
        case 'hell_factory':
            loadIndustry('factory',body);
            break;
        case 'star_dock':
            starDockModal(body);
            break;
        case 'mining_droid':
            loadIndustry('droid',body);
            break;
        case 'g_factory':
        case 'refueling_station':
        case 'twisted_lab':
            loadIndustry('graphene',body);
            break;
        case 'freighter':
        case 'super_freighter':
            galacticTrade(body);
            break;
        case 'pylon':
            loadIndustry('pylon',body);
            break;
        case 'rock_quarry':
            loadIndustry('rock_quarry',body);
            break;
        case 'titan_mine':
            loadIndustry('titan_mine',body);
            break;
        case 'mining_ship':
            loadIndustry('mining_ship',body);
            break;
        case 'alien_space_station':
            loadIndustry('alien_space_station',body);
            break;
        case 'nanite_factory':
            loadIndustry('nanite_factory',body);
            break;
        case 'alien_outpost':
            loadIndustry('replicator',body);
            break;
        case 'mech_station':
            loadIndustry('mech_station',body);
            break;
    }
}

export function starDockModal(modal){
    if (global.tech['genesis'] < 4){
        let warn = $(`<div><span class="has-text-warning">${loc('stardock_warn')}</span></div>`);
        modal.append(warn);
        return;
    }

    let dock = $(`<div id="starDock" class="actionSpace"></div>`);
    modal.append(dock);

    let c_action = actions.starDock.probes;
    setAction(c_action,'starDock','probes');

    if (global.tech['geck'] && global.stats.achieve['lamentis'] && global.stats.achieve.lamentis.l >= 5){
        let c_action = actions.starDock.geck;
        setAction(c_action,'starDock','geck');
    }

    if (global.tech['genesis'] >= 5){
        let c_action = actions.starDock.seeder;
        setAction(c_action,'starDock','seeder');
    }

    if (global.tech['genesis'] === 6){
        let c_action = actions.starDock.prep_ship;
        setAction(c_action,'starDock','prep_ship');
    }

    if (global.tech['genesis'] >= 7){
        let c_action = actions.starDock.launch_ship;
        setAction(c_action,'starDock','launch_ship');
    }
}

export function orbitDecayed(){
    if (global.race['orbit_decay'] && global.stats.hasOwnProperty('days') && global.stats.days >= global.race['orbit_decay'] && !global.race['orbit_decayed']){
        global.race['orbit_decayed'] = true;

        if (global.race['tidal_decay']){
            messageQueue(loc('planet_kamikaze_msg'),'info',false,['progress']);
        }
        else {
            messageQueue(loc('evo_challenge_orbit_decayed_msg',[races[global.race.species].home]),'info',false,['progress']);
        }

        if (global.race.universe === 'magic'){
            if (global.city['pylon']){
                global.space['pylon'] = { count: Math.ceil(global.city.pylon.count / 2) };
            }
            cancelRituals();
        }

        Object.keys(actions.city).forEach(function (k){
            if (global.city.hasOwnProperty(k) && global.city[k].hasOwnProperty('count')){
                if (global.race['hooved']){
                    if (actions.city[k].cost.hasOwnProperty('Horseshoe')){
                        global.race['shoecnt'] -= actions.city[k].cost.Horseshoe() * global.city[k].count;
                    }
                }
                global.city[k].count = 0;
                if (global.city[k].hasOwnProperty('on')){
                    global.city[k].on = 0;
                }
            }
        });

        if (global.race['hooved'] && global.race['shoecnt'] < 5){
            global.race.shoecnt = 5;
        }
        if (global.resource.Zen.display){
            global.resource.Zen.display = false;
        }
        if (global.resource.Slave.display){
            global.resource.Slave.display = false;
            global.resource.Slave.amount = 0;
            removeTask('slave');
            defineGovernor();
        }
        if (global.race['deconstructor']){
            nf_resources.forEach(function (res){
                global.city.nanite_factory[res] = 0;
            });
        }
        Object.keys(global.resource).forEach(function (res){
            if (global.resource[res].hasOwnProperty('trade')){
                global.resource[res].trade = 0;
            }
        });

        global.space['red_university'] = { count: 0 };

        Object.keys(actions.space.spc_moon).forEach(function (k){
            if (global.space.hasOwnProperty(k) && global.space[k].hasOwnProperty('count')){
                global.space[k].count = 0;
                if (global.space[k].hasOwnProperty('on')){
                    global.space[k].on = 0;
                }
            }
        });

        Object.keys(job_desc).forEach(function (job){
            if (job !== 'colonist'){
                global.civic[job].workers = 0;
                global.civic[job].assigned = 0;
            }
        });

        ['bolognium_ship','scout_ship','corvette_ship','frigate_ship','cruiser_ship','dreadnought','freighter','super_freighter','armed_miner','scavenger'].forEach(function(ship){
            if (global.galaxy[ship]){
                global.galaxy[ship].on = 0;
            }
        });
        if (global.portal['transport']){
            global.portal.transport.on = 0;
        }

        ['forager','farmer','lumberjack','quarry_worker'].forEach(function (job){
            global.civic[job].display = false;
        });

        if (global.civic.hunter.display){
            global.civic.d_job = 'hunter';
        }
        else {
            global.civic.d_job = 'unemployed';
        }

        for (let building of Object.values(global.race.purgatory.city)){
            if (building.hasOwnProperty('count')){
                building.count = 0;
            }
            if (building.hasOwnProperty('on')){
                building.on = 0;
            }
        }
        if (global.queue.hasOwnProperty('queue')){
            for (let i = global.queue.queue.length-1; i >= 0; i--){
                let item = global.queue.queue[i];
                if (item.action === 'city' || (item.action === 'space' && actions.space.spc_moon[item.type])){
                    global.queue.queue.splice(i,1);
                }
            }
        }

        if (global.arpa['sequence']){
            global.arpa.sequence.on = false;
            global.arpa.sequence.boost = false;
        }

        global.city.calendar.moon = 0;
        document.getElementById('moon').removeAttribute('class');
        $('#moon').addClass('moon wi wi-moon-new');

        global.settings.spaceTabs = 1;
        global.settings.space.moon = false;
        global.settings.showCity = false;

        clearElement($(`#infoTimer`));

        renderSpace();
    }
}

export function evoProgress(){
    clearElement($('#evolution .evolving'),true);
    let progress = $(`<div class="evolving"><progress class="progress" value="${global.evolution.final}" max="100">${global.evolution.final}%</progress></div>`);
    $('#evolution').append(progress);
}

export function wardenLabel(){
    if (global.race.universe === 'magic'){
        return loc('city_wizard_tower_title');
    }
    else {
        return global.race['evil'] ? loc('city_babel_title') : loc('city_wardenclyffe');
    }
}

export function basicHousingLabel(){
    let halloween = eventActive('halloween');
    if (halloween.active){
        return loc(`events_halloween_basic_house`);
    }

    switch (global.race.species){
        case 'orc':
            return loc('city_basic_housing_orc_title');
        case 'wolven':
            return loc('city_basic_housing_wolven_title');
        case 'sporgar':
            return loc('city_basic_housing_sporgar_title');
        case 'dracnid':
            return loc('city_basic_housing_title7');
        case 'balorg':
            return loc('city_basic_housing_title7');
        case 'imp':
            return loc('city_basic_housing_title8');
        case 'seraph':
            return loc('city_basic_housing_seraph_title');
        case 'unicorn':
            return loc('city_basic_housing_unicorn_title');
    }

    switch (global.race.maintype || races[global.race.species].type){
        case 'avian':
            return loc('city_basic_housing_nest_title');
        case 'plant':
            return loc('city_basic_housing_entish_title');
        case 'sand':
            return loc('city_basic_housing_sand_title');
        case 'polar':
            return loc('city_basic_housing_polar_title');
        case 'eldritch':
            return loc('city_basic_housing_eldritch_title');
    }

    return global.city.ptrait.includes('trashed') ? loc('city_basic_housing_trash_title') : loc('city_basic_housing_title');
}

export function mediumHousingLabel(){
    let halloween = eventActive('halloween');
    if (halloween.active){
        return loc(`events_halloween_medium_house`);
    }

    switch (global.race.species){
        case 'sporgar':
            return loc('city_cottage_title2');
        case 'balorg':
            return loc('city_cottage_title3');
        case 'imp':
            return loc('city_basic_housing_title7');
        case 'seraph':
            return loc('city_cottage_title4');
        case 'unicorn':
            return loc('city_cottage_title5');
        case 'dracnid':
            return loc('city_cottage_title7');
    }

    switch (global.race.maintype || races[global.race.species].type){
        case 'avian':
            return loc('city_cottage_title6');
        case 'eldritch':
            return loc('city_cottage_title8');
    }

    return loc('city_cottage_title1');
}

export function largeHousingLabel(basic){
    let halloween = eventActive('halloween');
    if (halloween.active){
        return loc(`events_halloween_large_house`);
    }

    if (!basic && govActive('extravagant',0)){
        return loc(`city_mansion`);
    }

    switch (global.race.species){
        case 'sporgar':
            return loc('city_apartment_title2');
    }

    switch (global.race.maintype || races[global.race.species].type){
        case 'avian':
            return loc('city_apartment_title5');
        case 'sand':
            return loc('city_apartment_title6');
        case 'demonic':
            return loc('city_apartment_title3');
        case 'angelic':
            return loc('city_apartment_title4');
        case 'giant':
            return loc('city_apartment_title7');
        case 'eldritch':
            return loc('city_apartment_title8');
    }

    return loc('city_apartment_title1');
}

export function housingLabel(type,flag){
    switch (type){
        case 'small':
            return basicHousingLabel();
        case 'medium':
            return mediumHousingLabel();
        case 'large':
            return largeHousingLabel(flag);
    }
}

export function structName(type){
    let halloween = eventActive('halloween');

    switch (type){
        case 'casino':
        {
            return halloween.active ? loc(`events_halloween_casino`) : (global.race['warlord'] ? loc(`portal_casino`) : loc(`city_casino`));
        }
        case 'farm':
        {
            return halloween.active ? loc(`events_halloween_farm`) : loc(`city_farm`);
        }
        case 'dormitory':
        {
            return halloween.active ? loc(`events_halloween_dorm`) : loc(`galaxy_dormitory`);
        }
        case 'mine':
        {
            return halloween.active ? loc(`events_halloween_mine`) : loc('city_mine');
        }
        case 'coal_mine':
        {
            return halloween.active ? loc(`events_halloween_coal_mine`) : loc('city_coal_mine');
        }
        case 'lumberyard':
        {
            return halloween.active ? loc(`events_halloween_lumberyard`) : loc('city_lumber_yard');
        }
        case 'sawmill':
        {
            return halloween.active ? loc(`events_halloween_sawmill`) : loc('city_sawmill');
        }
        case 'hospital':
        {
            return halloween.active ? loc(`events_halloween_hospital`) : loc('city_hospital');
        }
        case 'windmill':
        {
            return halloween.active ? loc(`events_halloween_windmill`) : loc('city_mill_title2');
        }
        case 'factory':
        {
            return halloween.active ? loc(`events_halloween_factory`) : loc('city_factory');
        }
        case 'storage_yard':
        {
            return halloween.active ? loc(`events_halloween_storage_yard`) : loc('city_storage_yard');
        }
        case 'temple':
        {
            return halloween.active ? loc(`events_halloween_temple`) : (global.race.universe === 'evil' && global.civic.govern.type != 'theocracy' ? loc('city_propaganda') : loc('city_temple'));
        }
    }
}

export function updateQueueNames(both, items){
    if (global.tech['queue'] && global.queue.display){
        let deepScan = ['space','interstellar','galaxy','portal','tauceti'];
        for (let i=0; i<global.queue.queue.length; i++){
            let currItem = global.queue.queue[i];
            if (!items || items.indexOf(currItem.id) > -1){
                if (deepScan.includes(currItem.action)){
                    let scan = true; Object.keys(actions[currItem.action]).forEach(function (region){
                        if (actions[currItem.action][region][currItem.type] && scan){
                            global.queue.queue[i].label = 
                                typeof actions[currItem.action][region][currItem.type].title === 'string' ? 
                                actions[currItem.action][region][currItem.type].title : 
                                actions[currItem.action][region][currItem.type].title();
                            scan = false;
                        }
                    });
                }
                else if (actions[currItem.action]?.[currItem.type]){
                    global.queue.queue[i].label = 
                        typeof actions[currItem.action][currItem.type].title === 'string' ? 
                        actions[currItem.action][currItem.type].title : 
                        actions[currItem.action][currItem.type].title();
                }
            }
        }
    }
    if (both && global.tech['r_queue'] && global.r_queue.display){
        for (let i=0; i<global.r_queue.queue.length; i++){
            global.r_queue.queue[i].label = 
                typeof actions.tech[global.r_queue.queue[i].type].title === 'string' ? 
                actions.tech[global.r_queue.queue[i].type].title : 
                actions.tech[global.r_queue.queue[i].type].title();
        }
    }
}

export function initStruct(c_action){
    let path = c_action.struct().p;
    if (!global[path[1]].hasOwnProperty(path[0])){
        global[path[1]][path[0]] = deepClone(c_action.struct().d);
    }
}

export function evoExtraState(race){
    if ((race === 'synth' || (race === 'custom' && global.custom.race0.traits.includes('imitation')) || (race === 'hybrid' && global.custom.race1.traits.includes('imitation'))) && Object.keys(global.stats.synth).length > 1){
        global.race['evoFinalMenu'] = race;
        drawEvolution();
        return true;
    }
    else {
        global.race.species = race;
        sentience();
    }
}
