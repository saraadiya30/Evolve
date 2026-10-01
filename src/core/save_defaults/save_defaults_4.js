// Bagian 4/8 dari penyesuaian save lama ke struktur terbaru (dulu satu blok panjang di vars.js).
// Dijalankan berurutan oleh vars.js saat load; urutan pemanggilan harus dipertahankan.

// Dependensi dari core/vars.js dikirim sebagai parameter (bukan di-import) supaya modul ini tidak bergantung balik ke vars.js.
export function applySaveDefaults4({ global, convertVersion }){
    if (convertVersion(global['version']) < 102000){
        if (global.hasOwnProperty('portal') && global.portal.hasOwnProperty('fortress') && !global.portal.fortress.hasOwnProperty('nocrew')){
            global.portal.fortress['nocrew'] = false;
        }
        if (global.city.hasOwnProperty('smelter') && !global.city.smelter.hasOwnProperty('Iridium')){
            global.city.smelter['Iridium'] = 0;
        }
        if (global.hasOwnProperty('portal') && global.portal.hasOwnProperty('mechbay') && !global.portal.mechbay.hasOwnProperty('active')){
            global.portal.mechbay['active'] = 0;
            global.portal.mechbay['scouts'] = 0;
        }
    }

    if (convertVersion(global['version']) < 102001){
        if (global.race['blood_thirst'] && global.race.blood_thirst > 3){
            global.race.blood_thirst = 1;
        }
        if (global.race['rainbow'] && global.race.rainbow > 3){
            global.race.rainbow = 1;
        }
    }

    if (convertVersion(global['version']) < 102005){
        if (!global.stats['cores'] && global.race.hasOwnProperty('AICore')){
            global.stats['cores'] = global.race.AICore.count;
        }
    }

    if (convertVersion(global['version']) < 102006){
        if (global.race['artifical']){
            if (global.race['calm']){
                if (global.resource.hasOwnProperty('Zen')){
                    global.resource.Zen.display = true;
                }
                global.city['meditation'] = { count: 0 };
            }
            if (global.race['cannibalize']){
                global.city['s_alter'] = {
                    count: 0,
                    rage: 0,
                    mind: 0,
                    regen: 0,
                    mine: 0,
                    harvest: 0,
                };
            }
            if (global.race['magnificent']){
                global.city['shrine'] = {
                    count: 0,
                    morale: 0,
                    metal: 0,
                    know: 0,
                    tax: 0
                };
            }
        }
    }

    if (convertVersion(global['version']) < 102007){
        if (global.stats.hasOwnProperty('achieve')){
            delete global.stats.achieve['extinct_sludge'];
        }
    }

    if (convertVersion(global['version']) < 102012){
        if (global.city.hasOwnProperty('ptrait')){
            global.city.ptrait = global.city.ptrait === 'none' ? [] : [global.city.ptrait];
        }
        if (global.tech['hell_ruins'] && global.tech.hell_ruins >= 3){
            global.tech['hell_vault'] = 1;
        }
    }

    if (convertVersion(global['version']) < 102015){
        if (global.race.hasOwnProperty('governor') && global.race.governor.hasOwnProperty('tasks')){
            for (let task in global.race.governor.tasks) {
                if (global.race.governor.tasks[task] === 'asssemble'){
                    global.race.governor.tasks[task] = 'assemble';
                }
            }
        }
        if (global['settings'] && global.settings.hasOwnProperty('restoreCheck')){
            delete global.settings['restoreCheck'];
        }
    }

    if (convertVersion(global['version']) < 102017){
        if (global.portal.hasOwnProperty('fortress')){
            global.portal.observe = {
                settings: {
                    expanded: false,
                    average: false,
                    hyperSlow: false,
                    display: 'game_days',
                    dropKills: true,
                    dropGems: true
                },
                stats: {
                    total: {
                        start: { year: global.city.calendar.year, day: global.city.calendar.day },
                        days: 0,
                        wounded: 0, died: 0, revived: 0, surveyors: 0, sieges: 0,
                        kills: {
                            drones: 0,
                            patrols: 0,
                            sieges: 0,
                            guns: 0,
                            soul_forge: 0,
                            turrets: 0
                        },
                        gems: {
                            patrols: 0,
                            guns: 0,
                            soul_forge: 0,
                            crafted: 0,
                            turrets: 0
                        },
                    },
                    period: {
                        start: { year: global.city.calendar.year, day: global.city.calendar.day },
                        days: 0,
                        wounded: 0, died: 0, revived: 0, surveyors: 0, sieges: 0,
                        kills: {
                            drones: 0,
                            patrols: 0,
                            sieges: 0,
                            guns: 0,
                            soul_forge: 0,
                            turrets: 0
                        },
                        gems: {
                            patrols: 0,
                            guns: 0,
                            soul_forge: 0,
                            crafted: 0,
                            turrets: 0
                        },
                    }
                },
                graphID: 0,
                graphs: {}
            };
        }
        if (global.tech.hasOwnProperty('genetics') && global.tech.genetics > 1 && global.hasOwnProperty('arpa')){
            if (!global.arpa.hasOwnProperty('sequence')){
                global.arpa['sequence'] = {
                    max: 50000,
                    progress: 0,
                    time: 50000,
                    on: false
                };
            }
            if (!global.arpa.sequence['boost']){
                global.arpa.sequence['boost'] = false;
            }
            if (!global.arpa.sequence['auto']){
                global.arpa.sequence['auto'] = false;
            }
            if (!global.arpa.sequence['labs']){
                global.arpa.sequence['labs'] = 0;
            }
        }
    }

    if (convertVersion(global['version']) < 102021){
        if (global.hasOwnProperty('custom') && !global.custom.hasOwnProperty('race0')){
            let race = global.race.hasOwnProperty('species') ? global.race.species : 'protoplasm';
            if (global.galaxy.hasOwnProperty('alien1') && global.galaxy.alien1.id === 'custom'){
                global.galaxy.alien1.id = race === 'human' ? 'elven' : 'human';
            }
            if (global.galaxy.hasOwnProperty('alien2') && global.galaxy.alien2.id === 'custom'){
                global.galaxy.alien2.id = race === 'orc' || global.galaxy.alien1.id === 'orc' ? 'cath' : 'orc';
            }
        }
    }

    if (convertVersion(global['version']) < 103000){
        if (!global.hasOwnProperty('tauceti')){
            global['tauceti'] = {};
        }

        if (global.race.species === 'protoplasm'){
            if (global.evolution.hasOwnProperty('sexual_reproduction')){
                global.tech['evo'] = global.evolution.sexual_reproduction.count > 0 ? 2 : 1;
                delete global.evolution['sexual_reproduction'];
            }
            [
                ['phagocytosis', {evo: 3, evo_animal: 1}],
                ['chloroplasts', {evo: 3, evo_plant: 1}],
                ['chitin', {evo: 3, evo_fungi: 1}],
                ['exterminate', {evo: 7, evo_synthetic: 2}],
                ['multicellular', {evo: 4}],
                ['spores', {evo: 5}],
                ['poikilohydric', {evo: 5}],
                ['bilateral_symmetry', {evo: 5, evo_insectoid: 1, evo_mammals: 1, evo_eggshell: 1, evo_aquatic: 1, evo_fey: 1, evo_sand: 1, evo_heat: 1, evo_polar: 1}],
                ['bryophyte', {evo: 7}],
                ['athropods', {evo: 7, evo_insectoid: 2}],
                ['mammals', {evo: 6, evo_humanoid: 1, evo_giant: 1, evo_small: 1, evo_animalism: 1, evo_demonic: 1, evo_angelic: 1}],
                ['humanoid', {evo: 7, evo_humanoid: 2}],
                ['gigantism', {evo: 7, evo_giant: 2}],
                ['dwarfism', {evo: 7, evo_small: 2}],
                ['animalism', {evo: 7, evo_animalism: 2}],
                ['carnivore', {evo_animalism: 3, evo_carnivore: 2}],
                ['herbivore', {evo_animalism: 3, evo_herbivore: 2}],
                ['omnivore', {evo_animalism: 3, evo_omnivore: 2}],
                ['celestial', {evo: 7, evo_angelic: 2}],
                ['demonic', {evo: 7, evo_demonic: 2}],
                ['aquatic', {evo: 7, evo_aquatic: 2}],
                ['fey', {evo: 7, evo_fey: 2}],
                ['heat', {evo: 7, evo_heat: 2}],
                ['polar', {evo: 7, evo_polar: 2}],
                ['sand', {evo: 7, evo_sand: 2}],
                ['eggshell', {evo: 6, evo_eggshell: 2}],
                ['endothermic', {evo: 7, evo_avian: 2}],
                ['ectothermic', {evo: 7, evo_reptilian: 2}],
                ['bunker', {evo_challenge: 1}]
            ].forEach(function(step){
                if (global.evolution.hasOwnProperty(step[0]) && global.evolution[step[0]].count > 0){
                    for (let [key, value] of Object.entries(step[1])){
                        global.tech[key] = value;
                    }
                }
                delete global.evolution[step[0]];
            });
            global.evolution['mloaded'] = 1;
            global.evolution['gmloaded'] = 1;
        }
    }

    if (convertVersion(global['version']) < 103001){
        if (!global.hasOwnProperty('prestige')){
            global.prestige = {};
        }
        if (global.race.Plasmid && global.race.Plasmid.hasOwnProperty('anti')){
            global.prestige['AntiPlasmid'] = { count: global.race.Plasmid.anti };
        }
        ['Plasmid','Phage','AICore','Dark','Harmony'].forEach(function (res){
            if (global.race.hasOwnProperty(res)) {
                global.prestige[res] = { count: global.race[res].count };
                delete global.race[res];
            }
        });
        ['Artifact','Blood_Stone'].forEach(function (res){
            if (global.resource.hasOwnProperty(res)) {
                global.prestige[res] = { count: global.resource[res].amount };
                delete global.resource[res];
            }
        });
        if (!global.stats.hasOwnProperty('synth') && global.race.hasOwnProperty('srace')){
            global.stats['synth'] = {};
            global.stats.synth[global.race.srace] = true;
        }
        if (global.race.hasOwnProperty('governor') && global.race.governor.hasOwnProperty('config') && global.race.governor.config.hasOwnProperty('trash')){
            ['Infernite','Elerium','Copper','Iron'].forEach(function(res){
                if (global.race.governor.config.trash.hasOwnProperty(res) && typeof global.race.governor.config.trash[res] === 'number'){
                    global.race.governor.config.trash[res] = { v: global.race.governor.config.trash[res], s: true } ;
                }
            });
        }
    }

    if (convertVersion(global['version']) < 103002){
        if (global.portal.hasOwnProperty('observe') && global.portal.observe.hasOwnProperty('stats')){
            global.portal.observe.stats.period.gems['surveyors'] = 0;
            global.portal.observe.stats.total.gems['surveyors'] = 0;
        }
    }
}
