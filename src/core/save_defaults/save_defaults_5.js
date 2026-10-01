// Bagian 5/8 dari penyesuaian save lama ke struktur terbaru (dulu satu blok panjang di vars.js).
// Dijalankan berurutan oleh vars.js saat load; urutan pemanggilan harus dipertahankan.

// Dependensi dari core/vars.js dikirim sebagai parameter (bukan di-import) supaya modul ini tidak bergantung balik ke vars.js.
export function applySaveDefaults5({ global, convertVersion, message_filters, setRegionStates }){
    if (convertVersion(global['version']) < 103011){
        if (global.city.hasOwnProperty('slave_pen') && global.city.slave_pen.hasOwnProperty('slaves')){
            global.resource.Slave.amount = global.city.slave_pen.slaves;
            delete global.city.slave_pen.slaves;
        }
    }

    if (convertVersion(global['version']) < 103014){
        if (global.race['cataclysm'] && !global.race['start_cataclysm']){
            global.civic.craftsman.display = true;
        }
        if (global.race['lone_survivor'] && ((global.tauceti['tau_factory'] && global.tauceti.tau_factory.count > 0) || (global.tauceti['womling_station'] && global.tauceti.womling_station.count > 0))){
            global.civic.craftsman.display = true;
        }
    }

    if (convertVersion(global['version']) <= 103015){
        if (global.portal.hasOwnProperty('harbour')){
            global.portal['harbor'] = global.portal.harbour;
            delete global.portal.harbour;
        }
    }

    if (convertVersion(global['version']) <= 103017){
        if (global.race['broody']){
            global.race['gloomy'] = global.race['broody'];
            delete global.race['broody'];
        }
    }

    if (convertVersion(global['version']) <= 104000){
        if (global.city.hasOwnProperty('shrine') && !global.city.shrine.hasOwnProperty('cycle')){
            global.city.shrine['cycle'] = 0;
        }
    }

    if (convertVersion(global['version']) < 104001){
        if(global.tech['elysium'] && global.tech.elysium >= 18){
            global.tech.elysium--;
            if(global.tech.cement && !global.race['flier']){
                global.tech.cement = 8;
            }
        }
    }

    if (convertVersion(global['version']) < 104002){
        if(global.city['amphitheatre'] && !global.city.amphitheatre.hasOwnProperty('evil')){
            global.city.amphitheatre['evil'] = 0;
        }
    }

    if (convertVersion(global['version']) < 104003){
        if (global.portal.hasOwnProperty('observe') && global.portal.observe.hasOwnProperty('stats')){
            global.portal.observe.stats.period.gems['compactor'] ??= 0;
            global.portal.observe.stats.total.gems['compactor'] ??= 0;
        }
    }

    if (convertVersion(global['version']) <= 104003){
        if(global.race['pet'] && !global.race.pet.hasOwnProperty('event')){
            global.race.pet['event'] = 0;
            global.race.pet['pet'] = 0;
        }
    }

    if (convertVersion(global['version']) < 104008){
        if(global.race.hasOwnProperty('modified')){
            let count = global.race['modified'];
            global.race['modified'] = {
                t: count, nr: 0, na: 0, pr: 0, pa: 0
            };
        }
    }

    if (convertVersion(global['version']) < 104009){
        if(global.city['banquet'] && !global.city['banquet'].level){
            global.city['banquet'].level = global.city['banquet'].count;
            global.city['banquet'].count = Math.min(1, global.city['banquet'].count);
        }
    }



    global['version'] = '1.4.10';
    delete global['revision'];
    delete global['beta'];

    if (!global.hasOwnProperty('prestige')){
        global.prestige = {};
    }
    ['Plasmid','AntiPlasmid','Phage','Dark','Harmony','AICore','Artifact','Blood_Stone','Supercoiled','Aether'].forEach(function (res){
        if (!global.prestige.hasOwnProperty(res)){
            global.prestige[res] = { count: 0 };
        }
    });

    if (!global.hasOwnProperty('power')){
        global['power'] = [];       
    }

    if (!global.hasOwnProperty('support')){
        global['support'] = {};
    }

    [
        'moon','red','belt','alpha','nebula','gateway','alien2','lake','spire',
        'titan','enceladus','eris','tau_home','tau_red','tau_roid','asphodel'
    ].forEach(function(s){
        if (!global.support.hasOwnProperty(s)){
            global.support[s] = [];
        }
    });

    if (global.civic['cement_worker'] && global.civic.cement_worker.impact === 0.25){
        global.civic.cement_worker.impact = 0.4;
    }

    if (!global['settings']){
        global['settings'] = {
            showEvolve: true,
            showAchieve: false,
            animated: true,
            disableReset: false,
            font: 'standard',
            q_merge: 'merge_nearby',
            cLabels: true,
            theme: 'gruvboxDark',
            locale: 'en-US',
            icon: 'star'
        };
    }

    if (!global.settings['space']){
        global.settings['space'] = {};
    }

    if (!global.settings.space.hasOwnProperty('home')){
        global.settings.space['home'] = true;
    }

    setRegionStates(false);

    if(!global.race.hasOwnProperty('inactiveTraits')){
        if(global.race['forager']){
            global.race.inactiveTraits = {herbivore:global.race['forager'], carnivore:global.race['forager']};
        }
        else{
            global.race.inactiveTraits = {};
        }
    }

    if (!global.settings['icon']){
        global.settings['icon'] = 'star';
    }

    if (!global.settings['showResources']){
        global.settings['showResources'] = global.settings['showMarket'];
    }

    if (!global.settings['showStorage']){
        if (global.city['warehouse'] || global.city['storage_yard']){
            global.settings['showStorage'] = true;
        }
        else {
            global.settings['showStorage'] = false;
        }
    }

    if (!global.settings.hasOwnProperty('touch')){
        global.settings['touch'] = false;
    }

    if (!global.settings.hasOwnProperty('lowPowerBalance')){
        global.settings['lowPowerBalance'] = false;
    }

    if (!global['queue']){
        global['queue'] = {
            display: false,
            queue: [],
        };
    }

    if (!global['r_queue']){
        global['r_queue'] = {
            display: false,
            queue: [],
        };
    }

    if (!global['queue']['rename']){
        global.queue['rename'] = false;
    }

    if (!global['queue']['max']){
        global.queue['max'] = 0;
    }

    if (!global['r_queue']['max']){
        global.r_queue['max'] = 0;
    }

    if (!global['queue']['pause']){
        global.queue['pause'] = false;
    }

    if (!global['r_queue']['pause']){
        global.r_queue['pause'] = false;
    }

    if (!global['lastMsg']){
        global['lastMsg'] = {};
    }

    if (!global.settings['msgFilters']){
        global.settings['msgFilters'] = {};
    }

    //Message Filters unlocked by default
    ['all','progress','events','major_events','minor_events'].forEach(function (filter){
        if (!global.settings.msgFilters[filter]){
            global.settings.msgFilters[filter] = {
                unlocked: true,
                vis: true,
                max: 60,
                save: 3
            };
        }
    });

    message_filters.forEach(function (filter){
        if (!global.lastMsg[filter]){
            global.lastMsg[filter] = [];
        }
        //Message Filters not unlocked by default.
        if (!global.settings.msgFilters[filter]){
            global.settings.msgFilters[filter] = {
                unlocked: false,
                vis: false,
                max: 60,
                save: 3
            };
        }
    });

    if (!global.settings['msgQueueHeight']){
        global.settings['msgQueueHeight'] = $(`#msgQueue`).outerHeight();
        global.settings['buildQueueHeight'] = $(`#buildQueue`).outerHeight();
    }

    if (!global['space']){
        global['space'] = {};
    }

    if (!global['starDock']){
        global['starDock'] = {};
    }

    if (!global['interstellar']){
        global['interstellar'] = {};
    }
}
