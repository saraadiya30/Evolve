import { smelterFuelConfig } from '../industry/industry_f1.js';
import { loc } from '../core/locale.js';
import { easterEgg, trickOrTreat, vBind, popover } from '../functions/functions.js';
import { global, keyMultiplier, sizeApproximation } from '../core/vars.js';
import { colorRange } from '../industry/industry_f3.js';

// Bagian dari loadSmelter (industry_f1.js), dipisah mekanis: variabel yang dibagi antar bagian ada di $ctx.

export function loadSmelter_s1($ctx){
        const fuel_config = smelterFuelConfig();
    let fuel = $(`<div><span class="has-text-warning">${loc('modal_smelter_fuel')}:</span> <span :class="level()">{{s.count | on}}/{{ s.cap }}</span></div>`);
    $ctx.parent.append(fuel);

    if ($ctx.parent.hasClass('modalBody')){
        let egg = easterEgg(10);
        if (egg.length > 0){
            fuel.prepend(egg);
        }
    }

    if ($ctx.bind && global.race['forge'] && global.race['steelen']){
        let trick = trickOrTreat(3,12,true);
        if (trick.length > 0){
            fuel.prepend(trick);
        }
    }

    let fId = $ctx.parent.hasClass('modalBody') ? `mSmelterFuels` : `smelterFuels`;
    let fuelTypes = $(`<div id="${fId}" class="fuels"></div>`);
    $ctx.parent.append(fuelTypes);

    if (!global.race['forge']){
        if ((!global.race['kindling_kindred'] && !global.race['smoldering']) || global.race['evil']){
            let f_label = global.resource[fuel_config.l_type].name;
            let wood = $(`<span :aria-label="buildLabel('wood') + ariaCount('Wood', '${f_label}')" class="current wood">${f_label} {{ s.Wood }}</span>`);
            let subWood = $(`<span role="button" class="sub" @click="subFuel('Wood')" aria-label="Remove ${f_label} fuel"><span>&laquo;</span></span>`);
            let addWood = $(`<span role="button" class="add" @click="addFuel('Wood')" aria-label="Add ${f_label} fuel"><span>&raquo;</span></span>`);
            fuelTypes.append(subWood);
            fuelTypes.append(wood);
            fuelTypes.append(addWood);
        }

        if (global.resource.Coal.display){
            let coal = $(`<span :aria-label="buildLabel('coal') + ariaCount('Coal')" class="current coal">${global.resource.Coal.name} <span v-html="$options.filters.spook(s.Coal)"></span></span>`);
            let subCoal = $(`<span role="button" class="sub" @click="subFuel('Coal')" aria-label="Remove ${global.resource.Coal.name} fuel"><span>&laquo;</span></span>`);
            let addCoal = $(`<span role="button" class="add" @click="addFuel('Coal')" aria-label="Add ${global.resource.Coal.name} fuel"><span>&raquo;</span></span>`);
            fuelTypes.append(subCoal);
            fuelTypes.append(coal);
            fuelTypes.append(addCoal);
        }
    }

    if (global.race['forge']){
        let oil = $(`<span :aria-label="buildLabel('oil') + ariaCount('Oil')" class="current oil infoOnly">${loc('trait_forge_name')} <span v-html="$options.filters.altspook(s.Oil)"></span></span>`);
        fuelTypes.append(oil);
    }
    else if (global.resource.Oil.display){
        let oil = $(`<span :aria-label="buildLabel('oil') + ariaCount('Oil')" class="current oil">${global.resource.Oil.name} {{ s.Oil }}</span>`);
        let subOil = $(`<span role="button" class="sub" @click="subFuel('Oil')" aria-label="Remove ${global.resource.Oil.name} fuel"><span>&laquo;</span></span>`);
        let addOil = $(`<span role="button" class="add" @click="addFuel('Oil')" aria-label="Add ${global.resource.Oil.name} fuel"><span>&raquo;</span></span>`);
        fuelTypes.append(subOil);
        fuelTypes.append(oil);
        fuelTypes.append(addOil);
    }

    if (global.tech['star_forge'] && global.tech.star_forge >= 2){
        let star = $(`<span :aria-label="buildLabel('star') + ariaCount('Star')" class="current star infoOnly">${loc('star')} {{ s.Star }}</span>`);
        fuelTypes.append(star);
    }

    if (global.tech['smelting'] && global.tech.smelting >= 8){
        let inferno = $(`<span :aria-label="buildLabel('inferno') + ariaCount('Inferno')" class="current inferno">${loc('modal_smelter_inferno')} {{ s.Inferno }}</span>`);
        let subInferno = $(`<span role="button" class="sub" @click="subFuel('Inferno')" aria-label="Remove inferno fuel"><span>&laquo;</span></span>`);
        let addInferno = $(`<span role="button" class="add" @click="addFuel('Inferno')" aria-label="Add inferno fuel"><span>&raquo;</span></span>`);
        fuelTypes.append(subInferno);
        fuelTypes.append(inferno);
        fuelTypes.append(addInferno);
    }

    let available = $('<div class="avail"></div>');
    $ctx.parent.append(available);

    if (!$ctx.bind && 1 === 2){
        switch (fuel_config.l_type){
            case 'Food':
                available.append(`<span :class="net('Lumber')">{{ food.diff | diffSize }}</span>`);
                break;
            case 'Furs':
                available.append(`<span :class="net('Lumber')">{{ fur.diff | diffSize }}</span>`);
                break;
            case 'Lumber':
            default:
                available.append(`<span :class="net('Lumber')">{{ lum.diff | diffSize }}</span>`);
                break;
        }

        if (global.resource.Coal.display){
            available.append(`<span :class="net('Coal')">{{ coal.diff | diffSize }}</span>`);
        }

        if (global.resource.Oil.display){
            available.append(`<span :class="net('Oil')">{{ oil.diff | diffSize }}</span>`);
        }
    }

    $ctx.irid_smelt = global.tech['irid_smelting'] || (global.tech['m_smelting'] && global.tech.m_smelting >= 2) ? true : false;
    if ((global.resource.Iridium.display && $ctx.irid_smelt) || (global.resource.Steel.display && global.tech.smelting >= 2 && !global.race['steelen'])){
        let smelt = $(`<div id="${$ctx.parent.hasClass('modalBody') ? `mSmelterMats` : `smelterMats`}" class="smelting"></div>`);
        $ctx.parent.append(smelt);

        smelt.append(`<div><span class="has-text-warning">${loc('modal_smelter_type')}:</span> <span :class="level()">{{s.count | son}}/{{ s.cap | on }}</span></div>`);

        let smeltTypes = $(`<div class="fuels"></div>`);
        smelt.append(smeltTypes);

        let iron = $(`<span :aria-label="mLabel('iron') + ariaProd('Iron')" class="current iron">${global.resource.Iron.name} {{ s.Iron }}</span>`);
        let ironSub = $(`<span role="button" class="sub" @click="subMetal('Iron')" aria-label="Smelt less iron"><span>&laquo;</span></span>`);
        let ironAdd = $(`<span role="button" class="add" @click="addMetal('Iron')" aria-label="Smelt more iron"><span>&raquo;</span></span>`);
        smeltTypes.append(ironSub);
        smeltTypes.append(iron);
        smeltTypes.append(ironAdd);

        if (global.resource.Steel.display && global.tech.smelting >= 2 && !global.race['steelen']){
            let steel = $(`<span :aria-label="mLabel('steel') + ariaProd('Steel')" class="current steel">${global.resource.Steel.name} {{ s.Steel }}</span>`);
            let steelSub = $(`<span role="button" class="sub" @click="subMetal('Steel')" aria-label="Smelt less steel"><span>&laquo;</span></span>`);
            let steelAdd = $(`<span role="button" class="add" @click="addMetal('Steel')" aria-label="Smelt more steel"><span>&raquo;</span></span>`);
            smeltTypes.append(steelSub);
            smeltTypes.append(steel);
            smeltTypes.append(steelAdd);
        }

        if (global.resource.Iridium.display && $ctx.irid_smelt){
            let iridium = $(`<span :aria-label="mLabel('iridium') + ariaProd('Iridium')" class="current iridium">${global.resource.Iridium.name} {{ s.Iridium }}</span>`);
            let iridiumSub = $(`<span role="button" class="sub" @click="subMetal('Iridium')" aria-label="Smelt less iridium"><span>&laquo;</span></span>`);
            let iridiumAdd = $(`<span role="button" class="add" @click="addMetal('Iridium')" aria-label="Smelt more iridium"><span>&raquo;</span></span>`);
            smeltTypes.append(iridiumSub);
            smeltTypes.append(iridium);
            smeltTypes.append(iridiumAdd);
        }
    }
}

export function loadSmelter_s2($ctx){
        vBind({
        el: $ctx.bind ? $ctx.bind : '#specialModal',
        data: {
            s: global.city['smelter'],
            lum: global.resource.Lumber,
            coal: global.resource.Coal,
            oil: global.resource.Oil,
            food: global.resource.Food,
            fur: global.resource.Furs,
        },
        methods: {
            addFuel(type){
                let keyMult = keyMultiplier();
                for (let i=0; i<keyMult; i++){
                    let total = global.city.smelter.Wood + global.city.smelter.Coal + global.city.smelter.Oil + global.city.smelter.Star + global.city.smelter.Inferno;
                    if (type === 'Star' && global.city.smelter.Star >= global.city.smelter.StarCap){
                        break;
                    }
                    else if (total < global.city.smelter.cap){
                        global.city.smelter[type]++;
                        global.city.smelter.Iron++;
                    }
                    else if (total - global.city.smelter[type] > 0){
                        if (type !== 'Wood' && global.city.smelter.Wood > 0){
                            global.city.smelter.Wood--;
                            global.city.smelter[type]++;
                        }
                        else if (type !== 'Coal' && global.city.smelter.Coal > 0){
                            global.city.smelter.Coal--;
                            global.city.smelter[type]++;
                        }
                        else if (type !== 'Oil' && global.city.smelter.Oil > 0){
                            global.city.smelter.Oil--;
                            global.city.smelter[type]++;
                        }
                        else if (type !== 'Inferno' && global.city.smelter.Inferno > 0){
                            global.city.smelter.Inferno--;
                            global.city.smelter[type]++;
                        }
                    }
                    else {
                        break;
                    }
                }
            },
            subFuel(type){
                let keyMult = keyMultiplier();
                for (let i=0; i<keyMult; i++){
                    if (global.city.smelter[type] > 0){
                        global.city.smelter[type]--;
                        if (global.race['forge'] && type === 'Inferno'){
                            global.city.smelter.Oil++;
                        }
                        let total = global.city.smelter.Wood + global.city.smelter.Coal + global.city.smelter.Oil + global.city.smelter.Star + global.city.smelter.Inferno;
                        let used = global.city.smelter.Iron + global.city.smelter.Steel + global.city.smelter.Iridium;
                        if (used > total){
                            if (global.city.smelter.Iron > 0){
                                global.city.smelter.Iron--;
                            }
                            else if (global.city.smelter.Steel > 0) {
                                global.city.smelter.Steel--;
                            }
                            else if (global.city.smelter.Iridium > 0) {
                                global.city.smelter.Iridium--;
                            }
                        }
                    }
                    else {
                        break;
                    }
                }
            },
            mLabel(m){
                return $ctx.matText(m);
            },
            addMetal(m){
                let keyMult = keyMultiplier();
                for (let i=0; i<keyMult; i++){
                    let count = global.city.smelter.Wood + global.city.smelter.Coal + global.city.smelter.Oil + global.city.smelter.Star + global.city.smelter.Inferno;
                    if (global.city.smelter.Iron + global.city.smelter.Steel + global.city.smelter.Iridium < count){
                        global.city.smelter[m]++;
                    }
                    else if (global.city.smelter.Iron > 0 && m !== 'Iron'){
                        global.city.smelter.Iron--;
                        global.city.smelter[m]++;
                    }
                    else if (global.city.smelter.Steel > 0 && m !== 'Steel'){
                        global.city.smelter.Steel--;
                        global.city.smelter[m]++;
                    }
                    else if (global.city.smelter.Iridium > 0 && m !== 'Iridium'){
                        global.city.smelter.Iridium--;
                        global.city.smelter[m]++;
                    }
                    else {
                        break;
                    }
                }
            },
            subMetal(m){
                let keyMult = keyMultiplier();
                global.city.smelter[m] -= keyMult;
                if (global.city.smelter[m] < 0){
                    global.city.smelter[m] = 0;
                }
            },
            buildLabel(type){
                return $ctx.tooltip(type);
            },
            ariaCount(fuel, name=fuel){
                return ` ${global.city.smelter[fuel]} ${name} fueled.`;
            },
            ariaProd(res){
                return `. ${global.city.smelter[res]} producing ${res}.`;
            },
            net(res){
                return global.resource[res].diff >= 0 ? 'has-text-success' : 'has-text-danger';
            },
            level(){
                let workers = global.city.smelter.Wood + global.city.smelter.Coal + global.city.smelter.Oil + global.city.smelter.Star + global.city.smelter.Inferno;
                return colorRange(workers,global.city.smelter.count);
            }
        },
        filters: {
            on(c){
                return global.city.smelter.Wood + global.city.smelter.Coal + global.city.smelter.Oil + global.city.smelter.Star + global.city.smelter.Inferno;
            },
            son(c){
                return global.city.smelter.Iron + global.city.smelter.Steel + global.city.smelter.Iridium;
            },
            diffSize(value){
                return value > 0 ? `+${sizeApproximation(value,2)}` : sizeApproximation(value,2);
            },
            spook(v){
                if ($ctx.bind && (((global.race['kindling_kindred'] || global.race['smoldering']) && (global.city.smelter.Steel === 6 || global.city.smelter.Iron === 6)) || global.city.smelter.Wood === 6) && global.city.smelter.Coal === 6 && global.city.smelter.Oil === 6){
                    let trick = trickOrTreat(3,12,true);
                    if (trick.length > 0){
                        return trick;
                    }
                }
                return v;
            },
            altspook(v){
                if ($ctx.bind && global.race['forge'] && global.city.smelter.Steel === 6 && global.city.smelter.Iron === 6){
                    let trick = trickOrTreat(3,12,true);
                    if (trick.length > 0){
                        return trick;
                    }
                }
                return v;
            }
        }
    });
}

export function loadSmelter_s3($ctx){
        let id = $ctx.parent.hasClass('modalBody') ? `mSmelterFuels` : `smelterFuels`;
    ['wood','coal','oil','star','inferno'].forEach(function(fuel){
        popover(`${id}${fuel}`,function(){
            return $ctx.tooltip(fuel);
        }, {
            elm: $(`#${id} > .${fuel}`),
            attach: '#main',
        });
    });

    if ((global.resource.Steel.display && global.tech.smelting >= 2 && !global.race['steelen']) || (global.resource.Iridium.display && $ctx.irid_smelt)){
        let id = $ctx.parent.hasClass('modalBody') ? `mSmelterMats` : `smelterMats`;
        ['iron','steel','iridium'].forEach(function(mat){
            if (mat === 'steel' && (!global.resource.Steel.display || global.race['steelen'])){
                return;
            }
            else if (mat === 'iridium' && !(global.resource.Iridium.display && $ctx.irid_smelt)){
                return;
            }
            popover(`${id}${mat}`,function(){
                return $ctx.matText(mat);
            }, {
                elm: $(`#${id} span.${mat}`),
                attach: '#main',
            });
        });
    }
}
