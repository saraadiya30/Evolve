// Bagian 3/8 dari penyesuaian save lama ke struktur terbaru (dulu satu blok panjang di vars.js).
// Dijalankan berurutan oleh vars.js saat load; urutan pemanggilan harus dipertahankan.

// Dependensi dari core/vars.js dikirim sebagai parameter (bukan di-import) supaya modul ini tidak bergantung balik ke vars.js.
export function applySaveDefaults3({ global, convertVersion, message_filters }){
    if (convertVersion(global['version']) < 100017){
        if (global.hasOwnProperty('settings') && !global.settings.hasOwnProperty('font')){
            global.settings['font'] = 'standard';
        }

        if (global.hasOwnProperty('lastMsg') && global.lastMsg){
            global.lastMsg = [global.lastMsg];
        }
    }

    if (convertVersion(global['version']) < 100023){
        if (global.city.hasOwnProperty('rock_quarry')){
            global.city.rock_quarry['asbestos'] = 50;
        }

        if (global.race['smoldering']){
            global.resource['Chrysotile'] = {
                name: 'Chrysotile', display: true, value: 5, amount: 0,
                crates: 0, diff: 0, delta: 0, max: 200, rate: 1
            };
            if (!global.race['kindling_kindred']){
                global.resource.Lumber.display = false;
                global.resource.Crates.amount += global.resource.Lumber.crates;
                global.resource.Lumber.crates = 0;
                global.resource.Containers.amount += global.resource.Lumber.containers;
                global.resource.Lumber.containers = 0;
                global.resource.Lumber.trade = 0;
                global.resource.Plywood.display = false;
                if (global.city['sawmill']){ delete global.city['sawmill']; }
                if (global.city['graveyard']){ delete global.city['graveyard']; }
                if (global.city['lumber_yard']){ delete global.city['lumber_yard']; }
                delete global.tech['axe']; delete global.tech['reclaimer']; delete global.tech['saw'];
                global.civic.lumberjack.display = false;
                global.civic.lumberjack.workers = 0;
                global.civic.lumberjack.assigned = 0;
                if (global.civic.d_job === 'lumberjack') { global.civic.d_job = 'unemployed'; }
                if (global.race['casting']){
                    global.race.casting.total -= global.race.casting.lumberjack;
                    global.race.casting.lumberjack = 0;
                }
                if (global.tech['foundry']){
                    global.civic.craftsman.workers -= global.city.foundry['Plywood'];
                    global.city.foundry.crafting -= global.city.foundry['Plywood'];
                    global.city.foundry['Plywood'] = 0;
                }
                if (global.city['s_alter']) { global.city.s_alter.harvest = 0; }
                if (global.interstellar['mass_ejector']){
                    global.interstellar.mass_ejector.total -= global.interstellar.mass_ejector.Lumber;
                    global.interstellar.mass_ejector.Lumber = 0;
                }
            }
        }
    }

    if (convertVersion(global['version']) < 100025){
        if (global.race['casting'] && global.race['smoldering']){
            global.race.casting.total -= global.race.casting.lumberjack;
            global.race.casting.lumberjack = 0;
        }
    }

    if (convertVersion(global['version']) < 100032){
        if (global.civic.hasOwnProperty('free')){
            global.civic['hunter'] = {
                job: 'hunter',
                display: global.race['carnivore'] || global.race['soul_eater'],
                workers: global.race['carnivore'] || global.race['soul_eater'] ? global.civic.free : 0,
                max: -1
            };
            global.civic['unemployed'] = {
                job: 'unemployed',
                display: !(global.race['carnivore'] || global.race['soul_eater']),
                workers: global.race['carnivore'] || global.race['soul_eater'] ? 0 : global.civic.free,
                max: -1
            };
            if (global.civic.d_job === 'unemployed' && (global.race['carnivore'] || global.race['soul_eater'])){
                global.civic.d_job = 'hunter';
            }
            delete global.civic.free;
        }
    }

    if (convertVersion(global['version']) < 100033){
        if (global.hasOwnProperty('special') && global.special.hasOwnProperty('egg')){
            global.special.egg['2020'] = JSON.parse(JSON.stringify(global.special['egg']));
            delete global.special.egg.egg1;
            delete global.special.egg.egg2;
            delete global.special.egg.egg3;
            delete global.special.egg.egg4;
            delete global.special.egg.egg5;
            delete global.special.egg.egg6;
            delete global.special.egg.egg7;
            delete global.special.egg.egg8;
            delete global.special.egg.egg9;
            delete global.special.egg.egg10;
            delete global.special.egg.egg11;
            delete global.special.egg.egg12;
        }
    }

    if (convertVersion(global['version']) < 100035){
        if (global.race['terrifying']){
            delete global.tech['trade'];
            delete global.city['trade'];
        }
    }

    if (convertVersion(global['version']) < 100040){
        const dt = new Date();
        if (dt.getFullYear() === 2021 && dt.getMonth() === 3 && dt.getDate() <= 14 && global.race.hasOwnProperty('species') && global.race.species === 'wolven'){
            global.race['hrt'] = 'wolven';
        }
    }

    if (convertVersion(global['version']) < 100041){
        global['event'] = {
            t: 499,
            l: false
        };
        global['m_event'] = {
            t: 99,
            l: false
        };
    }

    if (convertVersion(global['version']) < 101000){
        if (global.race['jtype'] && global.race['jtype'] === 'animal'){
            global.race['jtype'] = 'omnivore';
        }
        if (global.hasOwnProperty('custom') && global.custom.hasOwnProperty('race0') && global.custom.race0.hasOwnProperty('genus') && global.custom.race0.genus === 'animal'){
            global.custom.race0.genus = 'omnivore';
        }
        if (global.portal.hasOwnProperty('mechbay')){
            for (let i=0; i<global.portal.mechbay.mechs.length; i++){
                if (!global.portal.mechbay.mechs[i].hasOwnProperty('infernal')){
                    global.portal.mechbay.mechs[i]['infernal'] = false;
                }
            }
        }
        if (global.hasOwnProperty('stats') && global.stats.hasOwnProperty('achieve') && global.stats.achieve.hasOwnProperty('genus_animal')){
            global.stats.achieve['genus_carnivore'] = global.stats.achieve.genus_animal;
            delete global.stats.achieve.genus_animal;
        }
    }

    if (convertVersion(global['version']) < 101001){
        if (global.hasOwnProperty('race') && global.race.hasOwnProperty('governor') && global.race.governor.hasOwnProperty('config') && global.race.governor.config.hasOwnProperty('merc')){
            global.race.governor.config.merc['reserve'] = 100;
        }
    }

    if (convertVersion(global['version']) < 101002){
        if (global.race.hasOwnProperty('frenzy')){
            global.race['blood_thirst'] = global.race['frenzy'];
            delete global.race['frenzy'];
            if (global.city.hasOwnProperty('morale') && global.city.morale.hasOwnProperty('frenzy')){
                global.city.morale['blood_thirst'] = global.city.morale['frenzy'];
                delete global.city.morale['frenzy'];
            }
        }

        if (global.hasOwnProperty('custom') && global.custom.hasOwnProperty('race0') && global.custom.race0.hasOwnProperty('traits')){
            for (let i=0; i<global.custom.race0.traits.length; i++){
                if (global.custom.race0.traits[i] === 'frenzy'){
                    global.custom.race0.traits[i] = 'blood_thirst';
                }
            }
        }
        
        if (global.race['jtype'] && global.race['jtype'] === 'omnivore'){
            global.race['jtype'] = 'carnivore';
        }
        if (global.hasOwnProperty('custom') && global.custom.hasOwnProperty('race0') && global.custom.race0.hasOwnProperty('genus') && global.custom.race0.genus === 'omnivore'){
            global.custom.race0.genus = 'carnivore';
        }
    }

    if (convertVersion(global['version']) < 101010){
        if (global.hasOwnProperty('settings') && !global.settings.hasOwnProperty('q_merge')){
            global.settings['q_merge'] = 'merge_nearby';
        }
    }

    if (convertVersion(global['version']) < 101011){
        if (global.hasOwnProperty('settings') && !global.settings.hasOwnProperty('msgFilters')){
            global.settings['msgFilters'] = {
                all: true,
                progress: true,
                queue: global['queue'] && global.queue.display,
                building_queue: global['r_queue'] && global.r_queue.display,
                research_queue: global['r_queue'] && global.r_queue.display,
                combat: global.civic['garrison'] && global.civic.garrison.display,
                spy: global.tech['spy'] && global.tech.spy >= 2,
                events: true,
                major_events: true,
                minor_events: true,
                achievements: (global.stats['achieve'] && Object.keys(global.stats.achieve).length > 0) || (global.stats['feat'] && Object.keys(global.stats.feat).length > 0),
                hell: global.settings.showPortal || global.stats.blackhole || global.stats.ascend || global.stats.descend
            }
        }
        if (global.race.hasOwnProperty('inflation')){
            ['supercollider','stock_exchange','launch_facility','monuments','railway','roid_eject','nexus','syphon'].forEach(function(arpa){
                if (global.tech.hasOwnProperty(arpa)){
                    global.race.inflation += global.tech[arpa] * 10;
                }
            });
        }
    }

    if (convertVersion(global['version']) < 101012){
        if (global.civic['garrison']){
            global.civic.garrison['rate'] = 0;
        }
    } 

    if (convertVersion(global['version']) < 101014){
        if (global.hasOwnProperty('settings') && global.settings.hasOwnProperty('msgFilters')){
            Object.keys(global.settings.msgFilters).forEach(function (filter){
                global.settings.msgFilters[filter] = {
                    unlocked: global.settings.msgFilters[filter] ? true : false,
                    vis: global.settings.msgFilters[filter] ? true : false,
                    max: 60,
                    save: 3
                };
            });
        }
        if (global.hasOwnProperty('lastMsg') && global.lastMsg){
            let lastMsg = {};
            message_filters.forEach(function (filter){
                lastMsg[filter] = [];
            });
            global.lastMsg.forEach(function (msg){
                if (msg.t){
                    msg.t.forEach(function (tag){
                        lastMsg[tag].push({ m: msg.m, c: msg.c });
                    });
                }
                else {
                    lastMsg.all.push({ m: msg.m, c: msg.c })
                }
            });
            global.lastMsg = lastMsg;
        }
    }

    if (convertVersion(global['version']) <= 101014 && !global['revision']){
        if (global.race['cataclysm'] && global.race['universe'] && global.race['universe'] === 'magic' && global.tech['magic'] && global.tech['magic'] >= 2){
            global.space['pylon'] = { count: 0 };
        }
    }

    if (convertVersion(global['version']) < 101015){
        if (global.hasOwnProperty('special') && global.special.hasOwnProperty('trick')){
            global.special.trick['2020'] = JSON.parse(JSON.stringify(global.special['trick']));
            delete global.special.trick.trick1;
            delete global.special.trick.trick2;
            delete global.special.trick.trick3;
            delete global.special.trick.trick4;
            delete global.special.trick.trick5;
            delete global.special.trick.trick6;
            delete global.special.trick.trick7;
            delete global.special.trick.trick8;
            delete global.special.trick.trick9;
            delete global.special.trick.trick10;
            delete global.special.trick.trick11;
            delete global.special.trick.trick12;
        }
    }
}
