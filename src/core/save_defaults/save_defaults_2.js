// Bagian 2/8 dari penyesuaian save lama ke struktur terbaru (dulu satu blok panjang di vars.js).
// Dijalankan berurutan oleh vars.js saat load; urutan pemanggilan harus dipertahankan.

// Dependensi dari core/vars.js dikirim sebagai parameter (bukan di-import) supaya modul ini tidak bergantung balik ke vars.js.
export function applySaveDefaults2({ global, convertVersion }){
    if (convertVersion(global['version']) < 6018){
        if (global['space'] && global.space['swarm_satellite']){
            global.space['swarm_satellite'].count *= 2;
        }
    }

    if (convertVersion(global['version']) < 6020 && global.race['mutation'] && global.race['universe'] && global.race['universe'] === 'antimatter' && global.race['mutation'] > 0){
        let a_level = 1;
        if (global.race['no_trade']){ a_level++; }
        if (global.race['no_craft']){ a_level++; }
        if (global.race['no_crispr']){ a_level++; }
        if (global.race['weak_mastery']){ a_level++; }
        global.stats.achieve['cross'] = { l: a_level, a: a_level };
    }

    if (convertVersion(global['version']) < 7000){
        if (!global.civic['govern']){
            global.civic['govern'] = {
                type: 'oligarchy',
                rev: 0,
                fr: 0,
            };
        }
    }

    if (convertVersion(global['version']) < 7004 && global['queue'] && global['queue']['queue']){
        for (let i=0; i<global.queue.queue.length; i++){
            global.queue.queue[i]['q'] = 1;
            global.queue.queue[i]['t_max'] = global.queue.queue[i]['time'];
        }
    }

    if (convertVersion(global['version']) < 7007 && global['queue'] && global['queue']['queue']){
        for (let i=0; i<global.queue.queue.length; i++){
            global.queue.queue[i]['qs'] = 1;
        }
    }

    if (convertVersion(global['version']) < 7019 && global.race['fraile']){
        delete global.race['fraile'];
        global.race['frail'] = 1;
    }

    if (convertVersion(global['version']) < 7028){
        if (global.stats['achieve'] && global.stats.achieve['blood_war'] && global.stats.achieve['blood_war']['e']){
            global.stats.achieve['blood_war'].e = undefined;
        }
    }

    if (convertVersion(global['version']) < 8000 && global.civic['foreign']){
        if (typeof global.civic.foreign.gov0['anx'] === 'undefined'){
            global.civic.foreign.gov0['anx'] = false;
        }
        if (typeof global.civic.foreign.gov1['anx'] === 'undefined'){
            global.civic.foreign.gov1['anx'] = false;
        }
        if (typeof global.civic.foreign.gov2['anx'] === 'undefined'){
            global.civic.foreign.gov2['anx'] = false;
        }
        if (typeof global.civic.foreign.gov0['buy'] === 'undefined'){
            global.civic.foreign.gov0['buy'] = false;
        }
        if (typeof global.civic.foreign.gov1['buy'] === 'undefined'){
            global.civic.foreign.gov1['buy'] = false;
        }
        if (typeof global.civic.foreign.gov2['buy'] === 'undefined'){
            global.civic.foreign.gov2['buy'] = false;
        }
    }

    if (convertVersion(global['version']) < 8000){
        if (global['settings'] && global.settings.hasOwnProperty('tLabels')){
            delete global.settings['tLabels'];
        }
    }

    if (convertVersion(global['version']) < 8003){
        if (global.stats['harmony'] && global.stats['harmony'] > 0){
            global.stats['harmony'] = parseFloat(global.stats['harmony'].toFixed(2));
            global.race['Harmony'].count = parseFloat(global.race['Harmony'].count.toFixed(2));
        }
    }

    if (convertVersion(global['version']) < 8017){
        if (global.city['garrison']){
            global.city.garrison['on'] = global.city['garrison'].count;
        }
    }

    if (convertVersion(global['version']) < 9000){
        if (global.settings && global.settings.showCity){
            global.settings.showCiv = global.settings.showCity;
        }
    }

    if (convertVersion(global['version']) < 9005){
        if (global.race.hasOwnProperty('terrifying') && global.tech.hasOwnProperty('gambling') && !global.space.hasOwnProperty('spc_casino')){
            global.space['spc_casino'] = { count: 0, on: 0 };
        }
    }

    if (convertVersion(global['version']) < 9009){
        if (global.genes.hasOwnProperty('ancients') && global.genes['ancients'] >= 3){
            if (global.genes['ancients'] === 4){
                global.genes['ancients'] = 5;
            }
            else {
                global.race.Plasmid.count += 300;
            }
        }
    }

    if (convertVersion(global['version']) < 9010){
        ['species', 'gods', 'old_gods'].forEach(field => {
            if (global.race[field] === 'orge') { global.race[field] = 'ogre'; } // prior to 0.9.10 this was misspelled in the codebase
        })
        if (global.stats.hasOwnProperty('achieve') && global.stats.achieve.hasOwnProperty('extinct_orge')){
            global.stats.achieve['extinct_ogre'] = global.stats.achieve['extinct_orge'];
            delete global.stats.achieve['extinct_orge'];
        }
        if (global.resource.hasOwnProperty('orge')){
            global.resource['ogre'] = global.resource['orge'];
            delete global.resource['orge'];
        }
        if (global['city'] && global.city['factory'] && !global.city.factory['Furs']){
            global.city.factory['Furs'] = 0;
        }
    }

    if (convertVersion(global['version']) < 9014){
        ['seraph', 'unicorn', 'custom'].forEach(field => {
            if (global.race.species === field) {
                if ((field === 'custom' && global.hasOwnProperty('custom') && global.custom.race0.genus === 'angelic') || field !== 'custom'){
                    global.race['holy'] = 1;
                }
            }
        });
        if (global.hasOwnProperty('arpa') && global.arpa.hasOwnProperty('sequence')){
            global.arpa.sequence['labs'] = 0;
        }
    }

    if (convertVersion(global['version']) < 100000){
        delete global.city['lumber'];
        delete global.city['stone'];
        
        global.stats['dark'] = 0;
        if (global.race['Dark']){
            global.stats['dark'] = global.race['Dark'].count;
        }

        if (global.city.hasOwnProperty('smelter')){
            if (!global.city.smelter.hasOwnProperty('Star')){
                global.city.smelter['Star'] = 0;
            }
            if (!global.city.smelter.hasOwnProperty('StarCap')){
                global.city.smelter['StarCap'] = 0;
            }
            if (!global.city.smelter.hasOwnProperty('Inferno')){
                global.city.smelter['Inferno'] = 0;
            }
        }

        if (!global.hasOwnProperty('warseed')){
            global['warseed'] = global.seed + 1;
            Math.war = global.hasOwnProperty('warseed') ? global.warseed : global.seed;
        }

        if (global.portal.hasOwnProperty('bireme')){
            global.portal.bireme['crew'] = 0;
            global.portal.bireme['mil'] = 0;
        }

        if (global.portal.hasOwnProperty('transport')){
            global.portal.transport['crew'] = 0;
            global.portal.transport['mil'] = 0;
            if (!global.portal.transport['cargo']){
                global.portal.transport['cargo'] = {
                    used: 0, max: 0,
                    Crystal: 0, Lumber: 0,
                    Stone: 0, Furs: 0,
                    Copper: 0, Iron: 0,
                    Aluminium: 0, Cement: 0,
                    Coal: 0, Oil: 0,
                    Uranium: 0, Steel: 0,
                    Titanium: 0, Alloy: 0,
                    Polymer: 0, Iridium: 0,
                    Helium_3: 0, Deuterium: 0,
                    Neutronium: 0, Adamantite: 0,
                    Infernite: 0, Elerium: 0,
                    Nano_Tube: 0, Graphene: 0,
                    Stanene: 0, Bolognium: 0,
                    Vitreloy: 0, Orichalcum: 0,
                    Plywood: 0, Brick: 0,
                    Wrought_Iron: 0, Sheet_Metal: 0,
                    Mythril: 0, Aerogel: 0,
                    Nanoweave: 0, Scarletite: 0
                };
            }
        }

        if (global.hasOwnProperty('settings') && global.settings.portal && global.settings.portal.spire && !global.portal.hasOwnProperty('purifier')){
            global.settings.portal.spire = false;
        }

        if (global.portal.hasOwnProperty('mechbay') && !Array.isArray(global.portal.mechbay.mechs)){
            global.portal.mechbay.mechs = [];
        }

        if (global.portal['transport'] && global.portal.transport.count >= 1 && !global.tech['hell_spire']){
            global.tech['hell_spire'] = 1;
            global.settings.portal.spire = true;
            global.settings.showCargo = true;
            global.portal['purifier'] = { count: 0, on: 0, support: 0, s_max: 0, supply: 0, sup_max: 100, diff: 0 };
            global.portal['port'] = { count: 0, on: 0 };
        }

        if (global.tech.hasOwnProperty('waygate') && !global.portal.hasOwnProperty('waygate')){
            delete global.tech['waygate'];
        }

        if (!global.hasOwnProperty('blood')){
            global['blood'] = {};
        }
    }

    if (convertVersion(global['version']) < 100013){
        if (global.hasOwnProperty('settings') && global.settings.hasOwnProperty('showPowerGrid') && global.hasOwnProperty('race') && global.race['infiltrator'] && global.hasOwnProperty('tech') && global.tech.hasOwnProperty('high_tech') && global.tech.high_tech >= 2){
            global.settings.showPowerGrid = true;
        }
    }

    if (convertVersion(global['version']) < 100014){
        if (global.race['Dark']){
            global.stats['dark'] = global.race['Dark'].count;
        }
        if (global.race['casting'] && global.race['evil']){
            global.race.casting.total -= global.race.casting.lumberjack;
            global.race.casting.lumberjack = 0;
        }
        if (global['queue'] && global['queue']['queue']){
            for (let i=0; i<global.queue.queue.length; i++){
                if (global.queue.queue[i].type === 'arpa'){
                    global.queue.queue[i].type = global.queue.queue[i].action;
                    global.queue.queue[i].action = 'arpa';
                }
            }
        }
    }

    if (convertVersion(global['version']) < 100015){
        if (global.race['cataclysm']){
            global.settings.showPowerGrid = true;
        }
    }

    if (convertVersion(global['version']) < 100016){
        ['l','a','e','h','m','mg'].forEach(function(affix){
            if (global.stats.hasOwnProperty('spire') && global.stats.spire.hasOwnProperty(affix) && global.stats.spire[affix].hasOwnProperty('lord')){
                global.stats.spire[affix]['dlstr'] = global.stats.spire[affix].lord;
            }
        });

        if (global.hasOwnProperty('special') && global.special.hasOwnProperty('gift') && global.special.gift){
            global.special.gift = { g2019: true };
        }
    }
}
