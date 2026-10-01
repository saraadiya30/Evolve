// Part 1/8 of legacy save migration to the latest structure (previously one long block in vars.js).
// Executed sequentially by vars.js on load; call order must be preserved.

// Dependencies from core/vars.js are passed as parameters (not imported) to avoid circular dependency back to vars.js.
export function applySaveDefaults1({ global, convertVersion }){
    if (!global['version']){
        global['version'] = '0.2.0';
    }

    if (convertVersion(global['version']) < 2060){
        Object.keys(global.resource).forEach(function (res){
            if (global.resource[res].crates){
                global.resource[res].crates = Math.ceil(global.resource[res].crates / 5);
            }
            if (global.resource[res].containers){
                global.resource[res].containers = Math.ceil(global.resource[res].containers / 5);
            }
        });
    }

    if (convertVersion(global['version']) < 2062 && global.civic.taxes !== undefined){
        switch(Number(global.civic.taxes.tax_rate)){
            case 0:
                global.civic.taxes.tax_rate = 0;
                break;
            case 1:
                global.civic.taxes.tax_rate = 10;
                break;
            case 2:
                global.civic.taxes.tax_rate = 20;
                break;
            case 3:
                global.civic.taxes.tax_rate = 30;
                break;
            case 4:
                global.civic.taxes.tax_rate = 40;
                break;
            case 5:
                global.civic.taxes.tax_rate = 50;
                break;
        }
    }

    if (convertVersion(global['version']) === 2062 && global.civic.taxes !== undefined){
        if (global.civic.taxes.tax_rate === 2){
            global.civic.taxes.tax_rate = 20;
        }
    }

    if (convertVersion(global['version']) < 2065 && global.race !== undefined && global.race.species === 'sporgar'){
        delete global.race['crafty'];
        delete global.race['hydrophilic'];
        global.race['infectious'] = 1;
        global.race['parasite'] = 1;
        if (!global.tech['military'] && global.tech['primitive'] && global.tech['primitive'] >= 3){
            global.civic['garrison'].display = true;
            global.settings.showCivic = true;
            global.city['garrison'] = { count: 0 };
        }
    }

    if (convertVersion(global['version']) < 3002 && global['space']){
        if (global.tech['space'] && global.tech['space'] >= 4){
            if (!global.space['living_quarters']){
                global.space['living_quarters'] = { count: 0, on: 0 };
            }
            if (!global.space['garage']){
                global.space['garage'] = { count: 0 };
            }
            if (!global.space['red_mine']){
                global.space['red_mine'] = { count: 0, on: 0 };
            }
            if (!global.space['fabrication']){
                global.space['fabrication'] = { count: 0, on: 0 };
            }
            if (!global.space['laboratory']){
                global.space['laboratory'] = { count: 0, on: 0 };
            }
        }

        if (global.tech['space'] && global.tech['space'] >= 3){
            if (!global.space['iridium_mine']){
                global.space['iridium_mine'] = { count: 0, on: 0 };
            }
            if (!global.space['helium_mine']){
                global.space['helium_mine'] = { count: 0, on: 0 };
            }
        }

        if (global.tech['hell']){
            if (!global.space['geothermal']){
                global.space['geothermal'] = { count: 0, on: 0 };
            }
        }
    }

    if (convertVersion(global['version']) < 3004 && global['settings'] && global.settings['space'] && global.settings.space.belt){
        global.space['space_station'] = { count: 0, on: 0, support: 0, s_max: 0 };
    }

    if (convertVersion(global['version']) < 4001 && global['city'] && global.city['factory'] && !global.city.factory['Nano']){
        global.city.factory['Nano'] = 0;
    }

    if (convertVersion(global['version']) < 4003 && global.stats['achieve']){
        Object.keys(global.stats.achieve).forEach(function (key){
            global.stats.achieve[key] = 1;
        });
    }

    if (convertVersion(global['version']) < 4010){
        if (global.stats['achieve'] && global.stats.achieve['doomed']){
            global.stats['portals'] = 1;
        }
    }

    if (convertVersion(global['version']) < 4028 && global.stats['achieve'] && global.stats.achieve['genus_demonic']){
        global.stats.achieve['biome_hellscape'] = global.stats.achieve['genus_demonic'];
    }

    if (convertVersion(global['version']) < 4029 && global.race['mutation'] && global.race['mutation'] > 0){
        global['resource']['Genes'] = {
            name: 'Genes',
            display: true,
            value: 0,
            amount: 0,
            crates: 0,
            diff: 0,
            delta: 0,
            max: -2,
            rate: 0
        };

        for (let i=0; i<global.race.mutation; i++){
            global.resource.Genes.amount += i + 1;
        }
    }

    if (convertVersion(global['version']) < 4031){
        if (global.tech && global.tech['gambling'] && global.tech['gambling'] === 2){
            global.tech['gambling'] = 3;
            global.city.casino['on'] = 0;
        }
        if (global.tech['hunting'] && global.tech['hunting'] >= 3){
            global.tech['wind_plant'] = 1;
            global.tech['hunting'] = 2;
        }
        let races = [ "Human", "Humano", "Elf", "Elfo", "Orc", "Cath", "Wolven", "Centaur", "Centauro", "Kobold", "Goblin", "Gnome", "Ogre", "Ogro", "Cyclops", "Ciclope", "Troll", "Tortoisan", "Gecko", "Slitheryn", "Arraak", "Pterodacti", "Dracnid", "Ent", "Cacti", "Sporgar", "Shroomi", "Mantis", "Scorpid", "Antid", "Sharkin", "Octigoran", "Balorg", "Imp" ]
        for (let i=0; i<races.length; i++){
            if (global.resource[races[i]]){
                global.resource[global.race.species] = global.resource[races[i]];
                delete global.resource[races[i]];
                break;
            }
        }
    }

    if (convertVersion(global['version']) < 4032){
        if (global.race.species === 'balorg'){
            global.race['slaver'] = 1;
        }
    }

    if (convertVersion(global['version']) < 5000){
        global['portal'] = {};
        if (global['city'] && global.city['factory'] && !global.city.factory['Stanene']){
            global.city.factory['Stanene'] = 0;
        }
    }

    if (convertVersion(global['version']) === 5000){
        if (global.civic['craftsman']){
            global.civic.craftsman['assigned'] = 0;
            if (global.city['foundry']){
                let workers = global.city.foundry.Plywood + global.city.foundry.Brick + global.city.foundry.Wrought_Iron + global.city.foundry.Sheet_Metal + global.city.foundry.Mythril + global.city.foundry.Aerogel;
                global.civic.craftsman.workers = workers;
            }
        }
    }

    if (convertVersion(global['version']) <= 5008 && global['queue'] && global['queue']['queue']){
        global.queue.queue = [];
    }

    if (convertVersion(global['version']) <= 5011 && global.stats['died']){
        global.stats['attacks'] = global.stats['died'];
    }

    if (convertVersion(global['version']) <= 5016 && global.race.species === 'mantis'){
        delete global.race['frail'];
        global.race['cannibalize'] = 1;
        global.city['s_alter'] = {
            count: 0,
            rage: 0,
            mind: 0,
            regen: 0,
            mine: 0,
            harvest: 0,
        };
    }

    if (convertVersion(global['version']) < 6000){
        if (global.race.species === 'imp' || global.race.species === 'balorg'){
            global.race['soul_eater'] = 1;
        }
    }

    if (convertVersion(global['version']) < 6001){
        if (global.stats['achieve']){
            Object.keys(global.stats.achieve).forEach(function (key){
                if (!global.stats.achieve[key]['l']){
                    global.stats.achieve[key] = { l: global.stats.achieve[key] };
                }
            });
        }
    }

    if (convertVersion(global['version']) < 6004 && global.city['windmill'] && !global.race['soul_eater'] && !global.race['carnivore']){
        delete global.city['windmill'];
    }

    if (convertVersion(global['version']) < 6006 && !global.city['windmill'] && global.tech['wind_plant'] && (global.race['soul_eater'] || global.race['carnivore'])){
        global.city['windmill'] = { count: 0 };
    }

    if (convertVersion(global['version']) < 6006 && global.tech['wind_plant'] && !global.race['soul_eater'] && !global.race['carnivore']){
        delete global.tech['wind_plant'];
    }

    if (convertVersion(global['version']) <= 6008 && global['r_queue'] && global['r_queue']['queue']){
        for (let i=0; i<global.r_queue.queue.length; i++){
            global.r_queue.queue[i]['time'] = 0;
        }
    }

    if (convertVersion(global['version']) < 6010 && global.race['Plasmid']){
        if (global.race.Plasmid.anti < 0){
            global.race.Plasmid.anti = 0;
        }
        if (global.race.Plasmid.count < 0){
            global.race.Plasmid.count = 0;
        }

        if (global.tech['foundry'] && !global.race['kindling_kindred']){
            global.resource.Plywood.display = true;
        }
    }

    if (convertVersion(global['version']) < 6011 && !global.city['ptrait']){
        global.city['ptrait'] = 'none';
    }

    if (convertVersion(global['version']) < 6012 && global.portal['fortress']){
        global.portal.fortress['s_ntfy'] = 'Yes';
    }

    if (convertVersion(global['version']) < 6014){
        if (global.race['noble'] && global.tech['currency'] && global.tech['currency'] === 4){
            global.tech['currency'] = 5;
        }
        if (global['settings']){
            global.settings['cLabels'] = true;
        }
    }

    if (convertVersion(global['version']) < 6016 && global.stats && global.stats['reset'] && global.stats['achieve']){
        global.stats['mad'] = global.stats['reset'];
        global.stats['bioseed'] = 0;
        global.stats['blackhole'] = 0;
        let blkhle = ['whitehole','heavy','canceled','eviltwin','microbang'];
        for (let i=0; i<blkhle.length; i++){
            if (global.stats.achieve[blkhle[i]]){
                global.stats['blackhole']++;
                global.stats['mad']--;
            }
        }
        let genus = ['genus_humanoid','genus_animal','genus_small','genus_giant','genus_reptilian','genus_avian','genus_insectoid','genus_plant','genus_fungi','genus_aquatic','genus_demonic','genus_angelic'];
        for (let i=0; i<genus.length; i++){
            if (global.stats.achieve[genus[i]]){
                global.stats['bioseed']++;
                global.stats['mad']--;
            }
        }
    }
}

