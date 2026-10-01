// Part 8/8 of legacy save migration to the latest structure (previously one long block in vars.js).
// Executed sequentially by vars.js on load; call order must be preserved.

// Dependencies from core/vars.js are passed as parameters (not imported) to avoid circular dependency back to vars.js.
export function applySaveDefaults8({ global }){
    if (!global.city['market']){
        global.city['market'] = {
            qty: 10,
            mtrade: 0,
            trade: 0,
            active: false
        };
    }

    if (global.city['foundry'] && !global.city.foundry['Mythril']){
        global.city.foundry['Mythril'] = 0;
    }
    if (global.city['foundry'] && !global.city.foundry['Aerogel']){
        global.city.foundry['Aerogel'] = 0;
    }
    if (global.city['foundry'] && !global.city.foundry['Nanoweave']){
        global.city.foundry['Nanoweave'] = 0;
    }
    if (global.city['foundry'] && !global.city.foundry['Scarletite']){
        global.city.foundry['Scarletite'] = 0;
    }
    if (global.city['foundry'] && !global.city.foundry['Quantium']){
        global.city.foundry['Quantium'] = 0;
    }

    if (!global.settings['arpa']){
        global.settings['arpa'] = {
            arpaTabs: 0,
            physics: true,
            genetics: false
        };
    }
    if (!global.settings.arpa['crispr']){
        global.settings.arpa['crispr'] = false;
    }
    if (!global.settings.arpa['blood']){
        global.settings.arpa['blood'] = false;
    }

    if (!global['arpa']){
        global['arpa'] = {};
    }

    if (global.city['factory']){
        if (!global.city.factory['Lux']){
            global.city.factory['Lux'] = 0;
        }
        if (!global.city.factory['Alloy']){
            global.city.factory['Alloy'] = 0;
        }
        if (!global.city.factory['Polymer']){
            global.city.factory['Polymer'] = 0;
        }
    }

    if (!global.race['mutation']){
        global.race['mutation'] = 0;
    }
    if (!global.race['p_mutation']){
        global.race['p_mutation'] = 0;
    }

    if (global.race['old_gods'] && global.race['old_gods'] !== 'none'){
        global.genes['old_gods'] = 1;
    }
    else {
        delete global.genes['old_gods'];
    }

    if (global.tech['fanaticism'] && global.tech['theology'] && global.tech['theology'] === 2){
        global.tech['theology'] = 3;
    }

    if (global.tech['fanaticism'] && global.tech['anthropology'] && !global.genes['transcendence']){
        delete global.tech['anthropology'];
    }

    if (global.tech['unify']){
        if (global.tech['unify'] === 1){
            delete global.tech['m_boost'];
            delete global.tech['world_control'];
        }
    }

    if (global.city.hasOwnProperty('spc_casino')){
        global.space['spc_casino'] = { count: 0, on: 0 };
        delete global.city['spc_casino'];
    }

    if (global.tech.hasOwnProperty('nanoweave')){
        global.resource.Nanoweave.display = true;
    }

    if (!global.civic['new']){
        global.civic['new'] = 0;
    }

    if (!global.race['purgatory']){
        global.race['purgatory'] = {};
    }
    ['city', 'space', 'portal', 'eden', 'tech'].forEach((item) => {
        if(!global.race['purgatory'][item]){
            global.race['purgatory'][item] = {};
        }
    })

    if (!global.civic['d_job']){
        if (global.race['carnivore'] || global.race['soul_eater']){
            global.civic['d_job'] = 'hunter';
        }
        else if (global.tech['agriculture'] && global.tech['agriculture'] >= 1){
            global.civic['d_job'] = 'farmer';
        }
        else {
            global.civic['d_job'] = 'unemployed';
        }
    }

    global.settings.animated = true;
    global.settings.disableReset = false;

    if (global['arpa'] && global.arpa['launch_facility'] && global.arpa.launch_facility.rank > 0 && !global.tech['space']){
        global.tech['space'] = 1;
    }
}

