import { global, keyMultiplier, support_on, p_on } from '../core/vars.js';
import { loc } from '../core/locale.js';
import { vBind, popover, get_qlevel, darkEffect, eventActive, clearElement, clearPopper } from '../functions/functions.js';
import { garrisonSize, describeSoldier } from '../civics/civics.js';
import { galaxyProjects } from './space_registry.js';
import { actionDesc, templeCount, setPlanet } from '../actions/actions.js';
import { planetTraits, traits, races, genusVars } from '../races/races.js';
import { highPopAdjust } from '../resources/prod.js';
import { universeAffix } from '../achievements/achieve.js';
import { gatewayArmada, universe_types } from './space.js';

// Fungsi-fungsi dipindah dari space.js (urutan sumber dipertahankan). space.js tetap mengekspor ulang nama yang tadinya ter-ekspor.


export function armada(parent,id){
    if (global.tech['piracy'] && !global.race['truepath']){

        let header = $(`<div id="h${id}" class="armHead"><h3 class="has-text-warning">${loc('galaxy_armada')}</h3></div>`);
        parent.append(header);

        let soldier_title = global.tech['world_control'] ? loc('civics_garrison_peacekeepers') : loc('civics_garrison_soldiers');
        header.append($(`<span>|</span>`));
        header.append($(`<span class="has-text-caution"><span class="soldier">${soldier_title}</span> <span>{{ g.workers | stationed }} / {{ g.max | s_max }}</span></span>`));
        header.append($(`<span>|</span>`));
        header.append($(`<span class="has-text-caution"><span class="crew1">${loc('job_crew_mil')}</span> <span>{{ g.crew }}</span></span>`));
        header.append($(`<span>|</span>`));
        header.append($(`<span class="has-text-success"><span class="crew2">${loc('job_crew_civ')}</span> <span>{{ c.workers }} / {{ c.max }}</span></span>`));

        vBind({
            el: `#h${id}`,
            data: {
                g: global.civic.garrison,
                c: global.civic.crew,
            },
            filters: {
                stationed(v){
                    return garrisonSize();
                },
                s_max(v){
                    return garrisonSize(true);
                }
            }
        });

        ['soldier','crew1','crew2'].forEach(function(k){
            popover(`h${id}${k}`, function(){
                    switch(k){
                        case 'soldier':
                            return describeSoldier();
                        case 'crew1':
                            return loc('civics_garrison_crew_desc');
                        case 'crew2':
                            return loc('job_crew_desc');
                    }
                },
                {
                    elm: `#h${id} span.${k}`
                }
            );
        });

        let fleet = $(`<div id="${id}" class="fleet"></div>`);
        parent.append(fleet);

        let cols = [];
        // One column per ship type plus an extra column for labels
        for (let i = 0; i < gatewayArmada.length + 1; i++){
            let col = $(`<div class="area"></div>`);
            cols.push(col);
            fleet.append(col);
        }

        cols[0].append($(`<span></span>`));
        cols[0].append($(`<span id="armadagateway" class="has-text-danger">${galaxyProjects.gxy_gateway.info.name}</span>`));

        for (let i = 0; i < gatewayArmada.length; i++){
            const ship = gatewayArmada[i];
            if (global.galaxy.hasOwnProperty(ship)){
                cols[i+1].append($(`<span id="armada${ship}" class="ship has-text-advanced">${galaxyProjects.gxy_gateway[ship].title}</span>`));
                cols[i+1].append($(`<span class="ship">{{ gateway.${ship} }}</span>`));
            }
        }

        Object.keys(global.galaxy.defense).forEach(function (area){
            let r = area.substring(4);
            if (global.settings.space[r] && r !== 'gateway'){

                let region = $(`<span id="armada${r}" class="has-text-caution">${typeof galaxyProjects[area].info.name === 'string' ? galaxyProjects[area].info.name : galaxyProjects[area].info.name()}</span>`);
                cols[0].append(region);

                for (let i = 0; i < gatewayArmada.length; i++){
                    const ship = gatewayArmada[i];
                    if (global.galaxy.hasOwnProperty(ship)){
                        let shipSpan = $(`<span class="ship"></span>`);
                        let sub = $(`<span role="button" aria-label="remove ${ship}" class="sub has-text-danger" @click="sub('${area}','${ship}')"><span>&laquo;</span></span>`);
                        let count = $(`<span class="current">{{ ${r}.${ship} }}</span>`);
                        let add = $(`<span role="button" aria-label="add ${ship}" class="add has-text-success" @click="add('${area}','${ship}')"><span>&raquo;</span></span>`);
                        cols[i+1].append(shipSpan);
                        shipSpan.append(sub);
                        shipSpan.append(count);
                        shipSpan.append(add);
                    }
                }

            }
        });

        vBind({
            el: `#${id}`,
            data: {
                stargate: global.galaxy.defense.gxy_stargate,
                gateway: global.galaxy.defense.gxy_gateway,
                gorddon: global.galaxy.defense.gxy_gorddon,
                alien1: global.galaxy.defense.gxy_alien1,
                alien2: global.galaxy.defense.gxy_alien2,
                chthonian: global.galaxy.defense.gxy_chthonian,
                t: global.tech
            },
            methods: {
                sub(area,ship){
                    if (global.galaxy.defense[area][ship] > 0){
                        let ship_change = keyMultiplier();
                        if (ship_change > global.galaxy.defense[area][ship]) {
                            ship_change = global.galaxy.defense[area][ship];
                        }
                        global.galaxy.defense.gxy_gateway[ship] += ship_change;
                        global.galaxy.defense[area][ship] -= ship_change;
                    }
                },
                add(area,ship){
                    if (global.galaxy.defense.gxy_gateway[ship] > 0){
                        let ship_change = keyMultiplier();
                        if (ship_change > global.galaxy.defense.gxy_gateway[ship]) {
                            ship_change = global.galaxy.defense.gxy_gateway[ship];
                        }
                        global.galaxy.defense.gxy_gateway[ship] -= ship_change;
                        global.galaxy.defense[area][ship] += ship_change;
                    }
                }
            }
        });

        Object.keys(global.galaxy.defense).forEach(function (area){
            let r = area.substring(4);
            if (global.settings.space[r]){
                popover(`armada${r}`,function(){
                    return `<div>${typeof galaxyProjects[area].info.desc === 'string' ? galaxyProjects[area].info.desc : galaxyProjects[area].info.desc()}</div>`;
                });
            }
        });

        for (let i = 0; i < gatewayArmada.length; i++){
            const ship = gatewayArmada[i];
            if (global.galaxy.hasOwnProperty(ship)){
                popover(`armada${ship}`,function(obj){
                    actionDesc(obj.popper, galaxyProjects.gxy_gateway[ship], global.galaxy[ship]);
                    return undefined;
                });
            }
        }
    }
}

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

export function planetName(){
    let type = races[global.race.species].type === 'hybrid' ? global.race.maintype : races[global.race.species].type;
    let names = {
        red: races[global.race.species].solar.red,
        hell: races[global.race.species].solar.hell,
        gas: races[global.race.species].solar.gas,
        gas_moon: races[global.race.species].solar.gas_moon,
        dwarf: races[global.race.species].solar.dwarf,
        titan: genusVars[type].solar.titan,
        enceladus: genusVars[type].solar.enceladus,
        triton: genusVars[type].solar.triton,
        eris: genusVars[type].solar.eris,
    };
    if (global.race.species === 'custom'){
        for (let p of ['titan','enceladus','triton','eris']){
            if (global.custom.race0.hasOwnProperty(p)){
                names[p] = global.custom.race0[p];
            }
        }
    }
    if (global.race.species === 'hybrid'){
        for (let p of ['titan','enceladus','triton','eris']){
            if (global.custom.race1.hasOwnProperty(p)){
                names[p] = global.custom.race1[p];
            }
        }
    }
    return names;
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
