// Isi: armada(), house_adjust(), iron_adjust(), swarm_adjust(), fuel_adjust(), int_fuel_adjust(), zigguratBonus(), planetName(), genPlanets(), setUniverse()
import { global, support_on, p_on } from '../core/vars.js';
import { loc } from '../core/locale.js';
import { get_qlevel } from '../functions/quantum_level.js';
import { darkEffect } from '../functions/power_modifiers.js';
import { vBind, clearElement } from '../functions/dom_helpers.js';
import { popover, clearPopper } from '../functions/popover.js';
import { eventActive } from '../functions/event_dates.js';
import { templeCount } from '../functions/temple_count.js';
import { setPlanet } from '../actions/evolution/planet_setup.js';
import { planetTraits } from '../races/planet_data.js';
import { traits } from '../core/registries.js';
import { highPopAdjust } from '../functions/adjusters_basic.js';
import { universeAffix } from '../functions/universe_utils.js';
import { universe_types } from './space.js';

// Fungsi-fungsi dipindah dari space.js (urutan sumber dipertahankan). space.js tetap mengekspor ulang nama yang tadinya ter-ekspor.


export function house_adjust(res){
    if (global.tech['space_housing']){
        res *= 0.8 ** global.tech['space_housing'];
    }
    return res;
}

export function iron_adjust(res,wiki){
    let num_iron_ship_on = wiki ? (global.space?.iron_ship?.on ?? 0) : support_on['iron_ship'];
    if (global.tech['solar'] && global.tech['solar'] >= 5 && num_iron_ship_on){
        res *= 0.95 ** num_iron_ship_on;
    }
    return res;
}

export function swarm_adjust(res,wiki){
    if (global.space['swarm_plant']){
        let reduce = global.tech['swarm'] ? 0.88 : 0.94;
        if (global.tech['swarm'] >= 3){
            reduce -= get_qlevel(wiki) / 100;
        }
        if (reduce < 0.05){
            reduce = 0.05;
        }
        res *= reduce ** global.space.swarm_plant.count;
    }
    return res;
}

export function fuel_adjust(fuel,drain,wiki){
    if (global.race.universe === 'heavy'){
        fuel *= 1.25 + (0.5 * darkEffect('heavy'));
    }
    if (global.race['truepath']){
        fuel *= drain ? 2.5 : 1.25;
    }
    let num_driver_on = wiki ? (global.city?.mass_driver?.on ?? 0) : p_on['mass_driver'];
    if (num_driver_on){
        let factor = (wiki ? wiki.truepath : global.race['truepath']) ? 0.94 : 0.95;
        fuel *= factor ** num_driver_on;
    }
    if (global.stats.achieve['heavyweight']){
        fuel *= 0.96 ** global.stats.achieve['heavyweight'].l;
    }
    if (global.city.ptrait.includes('dense')){
        fuel *= planetTraits.dense.vars()[2];
    }
    if (global.race['cataclysm']){
        fuel *= 0.2;
    }
    if (global.race['heavy']){
        fuel *= 1 + (traits.heavy.vars()[0] / 100);
    }
    if (global.race['gravity_well']){
        fuel *= 1.35 + (9.65 * darkEffect('heavy'));
    }
    if (eventActive('launch_day')){
        fuel *= 0.95;
    }
    return fuel;
}

export function int_fuel_adjust(fuel){
    if (global.race.universe === 'heavy'){
        fuel *= 1.2 + (0.3 * darkEffect('heavy'));
    }
    if (global.stats.achieve['heavyweight']){
        fuel *= 0.96 ** global.stats.achieve['heavyweight'].l;
    }
    if (global.race['heavy']){
        fuel *= 1 + (traits.heavy.vars()[0] / 100);
    }
    if (eventActive('launch_day')){
        fuel *= 0.95;
    }
    return fuel;
}

export function zigguratBonus(){
    let bonus = 1;
    if (global.space['ziggurat']){
        let zig = global.tech['ancient_study'] ? 0.006 : 0.004;
        if (global.tech['ancient_deify'] && global.tech['ancient_deify'] >= 2 && support_on['exotic_lab']){
            zig += 0.0001 * support_on['exotic_lab'];
        }
        if (global.civic.govern.type === 'theocracy' && global.genes['ancients'] && global.genes['ancients'] >= 2 && global.civic.priest.display){
            let faith = 0.00002;
            if (global.race['high_pop']){
                faith = highPopAdjust(faith);
            }
            zig += faith * global.civic.priest.workers;
        }
        if (global.race['ooze']){
            zig *= 1 - (traits.ooze.vars()[1] / 100);
        }
        if (global.race['high_pop']){
            zig = highPopAdjust(zig);
        }
        bonus += (templeCount(true) * global.civic.colonist.workers * zig);
    }
    return bonus;
}

export function genPlanets(){
    let avail = [];
    if (global.stats.achieve['lamentis'] && global.stats.achieve.lamentis.l >= 4 && global.custom.hasOwnProperty('planet')){
        Object.keys(universe_types).forEach(function(u){
            let uafx = universeAffix(u);
            if (global.custom.planet.hasOwnProperty(uafx)){
                if (global.custom.planet[uafx].s){
                    avail.push(`${uafx}:s`);
                }
            }
        });
    }

    if (global.race['geck'] && global.race.geck > 0){
        let geck = $(`<div id="geck" class="geck"><span class="has-text-caution">${loc(`gecks_remaining`)}</span>: <span class="has-text-warning">{{ geck }}</span></div>`);
        $('#evolution').append(geck);

        vBind({
            el: '#geck',
            data: global.race,
        });
    }

    if (global.race.probes === 0){
        setPlanet({ custom: avail });
    }
    else {
        let hell = false;
        for (let i=0; i<global.race.probes; i++){
            let result = setPlanet({ hell: hell, custom: avail });
            if (result === 'hellscape'){
                hell = true;
            }
            else if (avail.includes(result)){
                avail.splice(avail.indexOf(result), 1);
            }
        }
    }
}

export function setUniverse(){
    let universes = ['standard','heavy','antimatter','evil','micro','magic'];

    for (let i=0; i<universes.length; i++){
        let universe = universes[i];

        let id = `uni-${universe}`;

        let parent = $(`<div id="${id}" class="action"></div>`);
        let element = $(`<a class="button is-dark" v-on:click="action" role="link"><span class="aTitle">${universe_types[universe].name}</span></a>`);
        parent.append(element);

        $('#evolution').append(parent);

        $('#'+id).on('click',function(){
            global.race['universe'] = universe;
            clearElement($('#evolution'));
            genPlanets();
            clearPopper();
        });

        popover(id,function(obj){
            obj.popper.append($(`<div>${universe_types[universe].name}</div>`));
            obj.popper.append($(`<div>${universe_types[universe].desc}</div>`));
            obj.popper.append($(`<div>${universe_types[universe].effect}</div>`));
            return undefined;
        },{
            classes: `has-background-light has-text-dark`
        });
    }
}
