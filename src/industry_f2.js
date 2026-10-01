import { loc } from './locale.js';
import { global, keyMultiplier, p_on, support_on } from './vars.js';
import { vBind, trickOrTreat, popover } from './functions.js';
import { actions } from './actions.js';
import { highPopAdjust, production } from './prod.js';
import { traits, fathomCheck } from './races.js';
import { atomic_mass } from './resources.js';
import { f_rate, nf_resources } from './industry.js';
import { colorRange } from './industry_f3.js';

// Fungsi-fungsi dipindah dari industry.js (urutan sumber dipertahankan). industry.js tetap mengekspor ulang nama yang tadinya ter-ekspor.


export function loadFactory(parent,bind){
    let fuel = $(`<div><span class="has-text-warning">${loc('modal_factory_operate')}:</span> <span :class="level()">{{count | on}}/{{ on | max }}</span></div>`);
    parent.append(fuel);

    let lux = $(`<div class="factory"><span class="Lux" :aria-label="buildLabel('Lux') + ariaProd('Lux')">${loc('modal_factory_lux')}</span></div>`);
    parent.append(lux);

    let luxCount = $(`<span class="current" v-html="$options.filters.spook(Lux)"></span>`);
    let subLux = $(`<span class="sub" @click="subItem('Lux')" role="button" aria-label="Decrease Lux production">&laquo;</span>`);
    let addLux = $(`<span class="add" @click="addItem('Lux')" role="button" aria-label="Increase Lux production">&raquo;</span>`);
    lux.append(subLux);
    lux.append(luxCount);
    lux.append(addLux);

    if (global.tech['synthetic_fur']){
        let fur = $(`<div class="factory"><span class="Furs" :aria-label="buildLabel('Furs') + ariaProd('Furs')">${global.race['evil'] ? loc('resource_Flesh_name') : global.resource.Furs.name}</span></div>`);
        parent.append(fur);

        let furCount = $(`<span class="current">{{ Furs }}</span>`);
        let subFurs= $(`<span class="sub" @click="subItem('Furs')" role="button" aria-label="Decrease Furs production">&laquo;</span>`);
        let addFurs = $(`<span class="add" @click="addItem('Furs')" role="button" aria-label="Increase Furs production">&raquo;</span>`);
        fur.append(subFurs);
        fur.append(furCount);
        fur.append(addFurs);
    }

    let alloy = $(`<div class="factory"><span class="Alloy" :aria-label="buildLabel('Alloy') + ariaProd('Alloy')">${global.resource.Alloy.name}</span></div>`);
    parent.append(alloy);

    let alloyCount = $(`<span class="current">{{ Alloy }}</span>`);
    let subAlloy = $(`<span class="sub" @click="subItem('Alloy')" role="button" aria-label="Decrease Alloy production">&laquo;</span>`);
    let addAlloy = $(`<span class="add" @click="addItem('Alloy')" role="button" aria-label="Increase Alloy production">&raquo;</span>`);
    alloy.append(subAlloy);
    alloy.append(alloyCount);
    alloy.append(addAlloy);

    if (global.tech['polymer']){
        let polymer = $(`<div class="factory"><span class="Polymer" :aria-label="buildLabel('Polymer') + ariaProd('Polymer')">${global.resource.Polymer.name}</span></div>`);
        parent.append(polymer);

        let polymerCount = $(`<span class="current">{{ Polymer }}</span>`);
        let subPolymer= $(`<span class="sub" @click="subItem('Polymer')" role="button" aria-label="Decrease Polymer production">&laquo;</span>`);
        let addPolymer = $(`<span class="add" @click="addItem('Polymer')" role="button" aria-label="Increase Polymer production">&raquo;</span>`);
        polymer.append(subPolymer);
        polymer.append(polymerCount);
        polymer.append(addPolymer);
    }

    if (global.tech['nano']){
        let nano = $(`<div class="factory"><span class="Nano" :aria-label="buildLabel('Nano') + ariaProd('Nano')">${global.resource.Nano_Tube.name}</span></div>`);
        parent.append(nano);

        let nanoCount = $(`<span class="current">{{ Nano }}</span>`);
        let subNano= $(`<span class="sub" @click="subItem('Nano')" role="button" aria-label="Decrease Nanotube production">&laquo;</span>`);
        let addNano = $(`<span class="add" @click="addItem('Nano')" role="button" aria-label="Increase Nanotube production">&raquo;</span>`);
        nano.append(subNano);
        nano.append(nanoCount);
        nano.append(addNano);
    }

    if (global.tech['stanene']){
        let stanene = $(`<div class="factory"><span class="Stanene" :aria-label="buildLabel('Stanene') + ariaProd('Stanene')">${global.resource.Stanene.name}</span></div>`);
        parent.append(stanene);

        let staneneCount = $(`<span class="current">{{ Stanene }}</span>`);
        let subStanene= $(`<span class="sub" @click="subItem('Stanene')" role="button" aria-label="Decrease Stanene production">&laquo;</span>`);
        let addStanene = $(`<span class="add" @click="addItem('Stanene')" role="button" aria-label="Increase Stanene production">&raquo;</span>`);
        stanene.append(subStanene);
        stanene.append(staneneCount);
        stanene.append(addStanene);
    }

    vBind({
        el: bind ? bind : '#specialModal',
        data: global.city['factory'],
        methods: {
            subItem: function(item){
                let keyMult = keyMultiplier();
                for (var i=0; i<keyMult; i++){
                    if (global.city.factory[item] > 0){
                        global.city.factory[item]--;
                    }
                    else {
                        break;
                    }
                }
            },
            addItem: function(item){
                let max = global.space['red_factory'] ? global.space.red_factory.on + global.city.factory.on : global.city.factory.on;
                if (global.interstellar['int_factory'] && p_on['int_factory']){
                    max += p_on['int_factory'] * 2;
                }
                if (global.tauceti['tau_factory'] && support_on['tau_factory']){
                    max += support_on['tau_factory'] * (global.tech['isolation'] ? 5 : 3);
                }
                if (global.portal['hell_factory'] && p_on['hell_factory']){
                    max += p_on['hell_factory'] * actions.portal.prtl_wasteland.hell_factory.lines();
                }
                let keyMult = keyMultiplier();
                for (var i=0; i<keyMult; i++){
                    let used = global.city.factory.Lux + global.city.factory.Furs + global.city.factory.Alloy + global.city.factory.Polymer + global.city.factory.Nano + global.city.factory.Stanene;
                    if (used < max){
                        global.city.factory[item]++;
                    }
                    else if (used === max && item !== 'Alloy' && global.city.factory['Alloy'] > 0){
                        global.city.factory['Alloy']--;
                        global.city.factory[item]++;
                    }
                    else {
                        break;
                    }
                }
            },
            buildLabel: function(type){
                return tooltip(type);
            },
            ariaProd(prod){
                return `. ${global.city.factory[prod]} factories producing ${prod}.`;
            },
            level(){
                let on = global.city.factory.Lux + global.city.factory.Furs + global.city.factory.Alloy + global.city.factory.Polymer + global.city.factory.Nano + global.city.factory.Stanene;
                let max = global.space['red_factory'] ? global.space.red_factory.on + global.city.factory.on : global.city.factory.on;
                if (global.interstellar['int_factory'] && p_on['int_factory']){
                    max += p_on['int_factory'] * 2;
                }
                if (global.tauceti['tau_factory'] && support_on['tau_factory']){
                    max += support_on['tau_factory'] * (global.tech['isolation'] ? 5 : 3);
                }
                if (global.portal['hell_factory'] && p_on['hell_factory']){
                    max += p_on['hell_factory'] * actions.portal.prtl_wasteland.hell_factory.lines();
                }
                return colorRange(on,max);
            }
        },
        filters: {
            on(){
                return global.city.factory.Lux + global.city.factory.Furs + global.city.factory.Alloy + global.city.factory.Polymer + global.city.factory.Nano + global.city.factory.Stanene;
            },
            max(){
                let max = global.space['red_factory'] ? global.space.red_factory.on + global.city.factory.on : global.city.factory.on;
                if (global.interstellar['int_factory'] && p_on['int_factory']){
                    max += p_on['int_factory'] * 2;
                }
                if (global.tauceti['tau_factory'] && support_on['tau_factory']){
                    max += support_on['tau_factory'] * (global.tech['isolation'] ? 5 : 3);
                }
                if (global.portal['hell_factory'] && p_on['hell_factory']){
                    max += p_on['hell_factory'] * actions.portal.prtl_wasteland.hell_factory.lines();
                }
                return max;
            },
            spook(v){
                if (global.city.factory.Lux === 3 && bind){
                    let trick = trickOrTreat(6,12,true);
                    if (trick.length > 0){
                        return trick;
                    }
                }
                return v;
            }
        }
    });

    function tooltip(type){
        let assembly = global.tech['factory'] ? true : false;
        switch(type){
            case 'Lux':{
                let demand = +(highPopAdjust(global.resource[global.race.species].amount) * (assembly ? f_rate.Lux.demand[global.tech['factory']] : f_rate.Lux.demand[0]));
                demand = luxGoodPrice(demand).toFixed(2);
                let fur = assembly ? f_rate.Lux.fur[global.tech['factory']] : f_rate.Lux.fur[0];
                return loc('modal_factory_lux_label',[fur,global.resource.Furs.name,demand]);
            }
            case 'Furs':{
                let money = assembly ? f_rate.Furs.money[global.tech['factory']] : f_rate.Furs.money[0];
                let polymer = assembly ? f_rate.Furs.polymer[global.tech['factory']] : f_rate.Furs.polymer[0];
                return loc('modal_factory_alloy_label',[money,global.resource.Money.name,polymer,global.resource.Polymer.name,global.race['evil'] ? loc('resource_Flesh_name') : global.resource.Furs.name]);
            }
            case 'Alloy':{
                let copper = assembly ? f_rate.Alloy.copper[global.tech['factory']] : f_rate.Alloy.copper[0];
                let aluminium = assembly ? f_rate.Alloy.aluminium[global.tech['factory']] : f_rate.Alloy.aluminium[0];
                return loc('modal_factory_alloy_label',[copper,global.resource.Copper.name,aluminium,global.resource.Aluminium.name,global.resource.Alloy.name]);
            }
            case 'Polymer':{
                if (global.race['kindling_kindred'] || global.race['smoldering']){
                    let oil = assembly ? f_rate.Polymer.oil_kk[global.tech['factory']] : f_rate.Polymer.oil_kk[0];
                    return loc('modal_factory_polymer_label2',[oil,global.resource.Oil.name,global.resource.Polymer.name]);
                }
                else {
                    let oil = assembly ? f_rate.Polymer.oil[global.tech['factory']] : f_rate.Polymer.oil[0];
                    let lumber = assembly ? f_rate.Polymer.lumber[global.tech['factory']] : f_rate.Polymer.lumber[0];
                    return loc('modal_factory_polymer_label1',[oil,global.resource.Oil.name,lumber,global.resource.Lumber.name,global.resource.Polymer.name]);
                }
            }
            case 'Nano':{
                let coal = assembly ? f_rate.Nano_Tube.coal[global.tech['factory']] : f_rate.Nano_Tube.coal[0];
                let neutronium = assembly ? f_rate.Nano_Tube.neutronium[global.tech['factory']] : f_rate.Nano_Tube.neutronium[0];
                return loc('modal_factory_nano_label',[coal,global.resource.Coal.name,neutronium,global.resource.Neutronium.name,global.resource.Nano_Tube.name]);
            }
            case 'Stanene':{
                let aluminium = assembly ? f_rate.Stanene.aluminium[global.tech['factory']] : f_rate.Stanene.aluminium[0];
                let nano = assembly ? f_rate.Stanene.nano[global.tech['factory']] : f_rate.Stanene.nano[0];
                return loc('modal_factory_stanene_label',[aluminium,global.resource.Aluminium.name,nano,global.resource.Nano_Tube.name,global.resource.Stanene.name]);
            }
        }
    }

    ['Lux','Furs','Alloy','Polymer','Nano','Stanene'].forEach(function(type){
        let id = parent.hasClass('modalBody') ? `specialModal` : `iFactory`;
        popover(`${id}${type}`,function(){
            return tooltip(type);
        }, {
            elm: $(`#${id} .factory > .${type}`),
            attach: '#main',
        });
    });
}

export function luxGoodPrice(demand){
    if (global.race['toxic']){
        demand *= 1 + (traits.toxic.vars()[0] / 100);
    }
    let fathom = fathomCheck('shroomi');
    if (fathom > 0){
        demand *= 1 + (traits.toxic.vars(1)[0] / 100 * fathom);
    }
    if (global.civic.govern.type === 'corpocracy'){
        demand *= 2.5;
    }
    if (global.civic.govern.type === 'socialist'){
        demand *= 0.8;
    }
    if (global.stats.achieve['iron_will'] && global.stats.achieve.iron_will.l >= 2){
        demand *= 1.1;
    }
    if (global.race['inflation']){
        demand *= 1 + (global.race.inflation / 1250);
    }
    if (global.tech['isolation']){
        demand *= 1 + ((support_on['colony'] || 0) * 0.5);
    }
    if(global.stats.achieve['endless_hunger'] && global.stats.achieve['endless_hunger'].l >= 4 && global.city.banquet && global.city.banquet.level >= 4 && global.city.banquet.strength){
        demand *= 1 + (global.city.banquet.strength ** 0.75) / 100;
    }
    demand *= production('psychic_cash');
    return demand;
}

export function loadNFactory(parent,bind){
    let fuel = $(`<div><span class="has-text-warning">${loc('modal_factory_operate')}:</span> <span :class="level()">{{count | on}}/{{ count | max }}</span></div>`);
    parent.append(fuel);

    let rId = parent.hasClass('modalBody') ? `mNFactoryRes` : `NFactoryRes`;
    let resTypes = $(`<div id="${rId}" class="fuels"></div>`);
    parent.append(resTypes);

    nf_resources.forEach(function(r){
        if (global.resource[r].display){
            let res = $(`<span :aria-label="eatLabel('${r}')" class="current ${r}">${global.resource[r].name} {{ ${r} }}</span>`);
            let subRes = $(`<span role="button" class="sub" @click="subItem('${r}')" aria-label="Decrease ${r} destruction"><span>&laquo;</span></span>`);
            let addRes = $(`<span role="button" class="add" @click="addItem('${r}')" aria-label="Increase ${r} destruction"><span>&raquo;</span></span>`);
            resTypes.append(subRes);
            resTypes.append(res);
            resTypes.append(addRes);
        }
    });

    vBind({
        el: bind ? bind : '#specialModal',
        data: global.city.nanite_factory,
        methods: {
            subItem: function(r){
                let keyMult = keyMultiplier();
                global.city.nanite_factory[r] -= keyMult;
                if (global.city.nanite_factory[r] < 0){
                    global.city.nanite_factory[r] = 0;
                }
            },
            addItem: function(r){
                let keyMult = keyMultiplier();
                let on = 0;
                nf_resources.forEach(function(r){
                    on += global.city.nanite_factory[r];
                });
                let avail = global.city.nanite_factory.count * 50 - on;
                if (keyMult > avail){
                    keyMult = avail;
                }
                if (keyMult > 0){
                    global.city.nanite_factory[r] += keyMult;
                }
            },
            eatLabel(r){
                return `Consume ${r} to produce ${global.resource.Nanite.name}`;
            },
            level(){
                let on = 0;
                nf_resources.forEach(function(r){
                    on += global.city.nanite_factory[r];
                });
                let max = global.city.nanite_factory.count;
                return colorRange(on,max);
            }
        },
        filters: {
            on(){
                let on = 0;
                nf_resources.forEach(function(r){
                    on += global.city.nanite_factory[r];
                });
                return on;
            },
            max(){
                return global.city.nanite_factory.count * 50;
            }
        }
    });

    function tooltip(res){
        let base_conversion = +(atomic_mass[res] / 100 * (traits.deconstructor.vars()[0] / 100)).toFixed(4);
        let curr_conversion = +(global.city.nanite_factory[res] * base_conversion).toFixed(4);
        return loc('modal_nfactory_resource_label',[1,global.resource[res].name,base_conversion,global.resource.Nanite.name,global.city.nanite_factory[res],curr_conversion]);
    }

    nf_resources.forEach(function(type){
        let id = parent.hasClass('modalBody') ? `specialModal` : `iNFactory`;
        popover(`${id}${type}`,function(){
            return tooltip(type);
        }, {
            elm: $(`#${id} > .fuels > .${type}`),
            attach: '#main',
        });
    });
}

export function loadDroid(parent,bind){
    let fuel = $(`<div><span class="has-text-warning">${loc('modal_factory_operate')}:</span> <span :class="level()">{{count | on}}/{{ on | max }}</span></div>`);
    parent.append(fuel);

    let adam = $(`<div class="factory"><span class="adam" :aria-label="buildLabel('adam') + ariaProd('adam')">${global.resource.Adamantite.name}</span></div>`);
    parent.append(adam);
    let adamCount = $(`<span class="current">{{ adam }}</span>`);
    let adamSub = $(`<span class="sub" @click="subItem('adam')" role="button" aria-label="Decrease Adamantite production">&laquo;</span>`);
    let adamAdd = $(`<span class="add" @click="addItem('adam')" role="button" aria-label="Increase Adamantite production">&raquo;</span>`);
    adam.append(adamSub);
    adam.append(adamCount);
    adam.append(adamAdd);

    let uran = $(`<div class="factory"><span class="uran" :aria-label="buildLabel('uran') + ariaProd('uran')">${global.resource.Uranium.name}</span></div>`);
    parent.append(uran);
    let uranCount = $(`<span class="current">{{ uran }}</span>`);
    let uranSub = $(`<span class="sub" @click="subItem('uran')" role="button" aria-label="Decrease Uranium production">&laquo;</span>`);
    let uranAdd = $(`<span class="add" @click="addItem('uran')" role="button" aria-label="Increase Uranium production">&raquo;</span>`);
    uran.append(uranSub);
    uran.append(uranCount);
    uran.append(uranAdd);

    let coal = $(`<div class="factory"><span class="coal" :aria-label="buildLabel('coal') + ariaProd('coal')">${global.resource.Coal.name}</span></div>`);
    parent.append(coal);
    let coalCount = $(`<span class="current">{{ coal }}</span>`);
    let coalSub = $(`<span class="sub" @click="subItem('coal')" role="button" aria-label="Decrease Coal production">&laquo;</span>`);
    let coalAdd = $(`<span class="add" @click="addItem('coal')" role="button" aria-label="Increase Coal production">&raquo;</span>`);
    coal.append(coalSub);
    coal.append(coalCount);
    coal.append(coalAdd);

    let alum = $(`<div class="factory"><span class="alum" :aria-label="buildLabel('alum') + ariaProd('alum')">${global.resource.Aluminium.name}</span></div>`);
    parent.append(alum);
    let alumCount = $(`<span class="current">{{ alum }}</span>`);
    let alumSub = $(`<span class="sub" @click="subItem('alum')" role="button" aria-label="Decrease Aluminium production">&laquo;</span>`);
    let alumAdd = $(`<span class="add" @click="addItem('alum')" role="button" aria-label="Increase Aluminium production">&raquo;</span>`);
    alum.append(alumSub);
    alum.append(alumCount);
    alum.append(alumAdd);

    vBind({
        el: bind ? bind : '#specialModal',
        data: global.interstellar['mining_droid'],
        methods: {
            subItem: function(item){
                let keyMult = keyMultiplier();
                for (var i=0; i<keyMult; i++){
                    if (global.interstellar.mining_droid[item] > 0){
                        global.interstellar.mining_droid[item]--;
                    }
                    else {
                        break;
                    }
                }
            },
            addItem: function(item){
                let keyMult = keyMultiplier();
                for (var i=0; i<keyMult; i++){
                    if (global.interstellar.mining_droid.adam + global.interstellar.mining_droid.uran + global.interstellar.mining_droid.coal + global.interstellar.mining_droid.alum < global.interstellar.mining_droid.on){
                        global.interstellar.mining_droid[item]++;
                    }
                    else {
                        break;
                    }
                }
            },
            buildLabel: function(type){
                return tooltip(type);
            },
            ariaProd(prod){
                return `. ${global.interstellar.mining_droid[prod]} driod mining ${prod}.`;
            },
            level(){
                let on = global.interstellar.mining_droid.adam + global.interstellar.mining_droid.uran + global.interstellar.mining_droid.coal + global.interstellar.mining_droid.alum;
                let max = global.interstellar.mining_droid.on;
                return colorRange(on,max);
            }
        },
        filters: {
            on(){
                return global.interstellar.mining_droid.adam + global.interstellar.mining_droid.uran + global.interstellar.mining_droid.coal + global.interstellar.mining_droid.alum;
            },
            max(){
                return global.interstellar.mining_droid.on;
            }
        }
    });

    function tooltip(type){
        switch(type){
            case 'adam':
                return loc('modal_droid_res_label',[global.resource.Adamantite.name]);
            case 'uran':
                return loc('modal_droid_res_label',[global.resource.Uranium.name]);
            case 'coal':
                return loc('modal_droid_res_label',[global.resource.Coal.name]);
            case 'alum':
                return loc('modal_droid_res_label',[global.resource.Aluminium.name]);
        }
    }

    ['adam','uran','coal','alum'].forEach(function(type){
        let id = parent.hasClass('modalBody') ? `specialModal` : `iDroid`;
        popover(`${id}${type}`,function(){
            return tooltip(type);
        }, {
            elm: $(`#${id} .factory > .${type}`),
            attach: '#main',
        });
    });
}

export function loadGraphene(parent,bind){
    let graph_source = global.race['truepath'] ? 'space' : 'interstellar';
    let graph_struct = 'g_factory';
    if (global.race['warlord']){
        graph_source = 'portal';
        graph_struct = 'twisted_lab';
    }

    let fuel = $(`<div><span class="has-text-warning">${loc('modal_smelter_fuel')}:</span> <span :class="level()">{{count | on}}/{{ on | max }}</span></div>`);
    parent.append(fuel);

    let fuelTypes = $('<div></div>');
    parent.append(fuelTypes);

    if (!global.race['kindling_kindred'] && !global.race['smoldering']){
        let f_label = global.resource.Lumber.name;
        let wood = $(`<span :aria-label="buildLabel('wood') + ariaCount('Wood')" class="current wood">${f_label} {{ Lumber }}</span>`);
        let subWood = $(`<span role="button" class="sub" @click="subWood" aria-label="Remove lumber fuel"><span>&laquo;</span></span>`);
        let addWood = $(`<span role="button" class="add" @click="addWood" aria-label="Add lumber fuel"><span>&raquo;</span></span>`);
        fuelTypes.append(subWood);
        fuelTypes.append(wood);
        fuelTypes.append(addWood);
    }

    if (global.resource.Coal.display){
        let coal = $(`<span :aria-label="buildLabel('coal') + ariaCount('Coal')" class="current coal">${global.resource.Coal.name} {{ Coal }}</span>`);
        let subCoal = $(`<span role="button" class="sub" @click="subCoal" aria-label="Remove coal fuel"><span>&laquo;</span></span>`);
        let addCoal = $(`<span role="button" class="add" @click="addCoal" aria-label="Add coal fuel"><span>&raquo;</span></span>`);
        fuelTypes.append(subCoal);
        fuelTypes.append(coal);
        fuelTypes.append(addCoal);
    }

    if (global.resource.Oil.display){
        let oil = $(`<span :aria-label="buildLabel('oil') + ariaCount('Oil')" class="current oil">${global.resource.Oil.name} {{ Oil }}</span>`);
        let subOil = $(`<span role="button" class="sub" @click="subOil" aria-label="Remove oil fuel"><span>&laquo;</span></span>`);
        let addOil = $(`<span role="button" class="add" @click="addOil" aria-label="Add oil fuel"><span>&raquo;</span></span>`);
        fuelTypes.append(subOil);
        fuelTypes.append(oil);
        fuelTypes.append(addOil);
    }

    vBind({
        el: bind ? bind : '#specialModal',
        data: global[graph_source][graph_struct],
        methods: {
            subWood(){
                let keyMult = keyMultiplier();
                for (let i=0; i<keyMult; i++){
                    if (global[graph_source][graph_struct].Lumber > 0){
                        global[graph_source][graph_struct].Lumber--;
                    }
                    else {
                        break;
                    }
                }
            },
            addWood(){
                let keyMult = keyMultiplier();
                for (let i=0; i<keyMult; i++){
                    if (global[graph_source][graph_struct].Lumber + global[graph_source][graph_struct].Coal + global[graph_source][graph_struct].Oil < global[graph_source][graph_struct].on){
                        global[graph_source][graph_struct].Lumber++;
                    }
                    else if (global[graph_source][graph_struct].Coal + global[graph_source][graph_struct].Oil > 0){
                        if (global[graph_source][graph_struct].Oil > global[graph_source][graph_struct].Coal){
                            global[graph_source][graph_struct].Coal > 0 ? global[graph_source][graph_struct].Coal-- : global[graph_source][graph_struct].Oil--;
                        }
                        else {
                            global[graph_source][graph_struct].Oil > 0 ? global[graph_source][graph_struct].Oil-- : global[graph_source][graph_struct].Coal--;
                        }
                        global[graph_source][graph_struct].Lumber++;
                    }
                    else {
                        break;
                    }
                }
            },
            subCoal(){
                let keyMult = keyMultiplier();
                for (let i=0; i<keyMult; i++){
                    if (global[graph_source][graph_struct].Coal > 0){
                        global[graph_source][graph_struct].Coal--;
                    }
                    else {
                        break;
                    }
                }
            },
            addCoal(){
                let keyMult = keyMultiplier();
                for (let i=0; i<keyMult; i++){
                    if (global[graph_source][graph_struct].Lumber + global[graph_source][graph_struct].Coal + global[graph_source][graph_struct].Oil < global[graph_source][graph_struct].on){
                        global[graph_source][graph_struct].Coal++;
                    }
                    else if (global[graph_source][graph_struct].Lumber + global[graph_source][graph_struct].Oil > 0){
                        if (global[graph_source][graph_struct].Lumber > 0){
                            global[graph_source][graph_struct].Lumber--;
                        }
                        else {
                            global[graph_source][graph_struct].Oil--;
                        }
                        global[graph_source][graph_struct].Coal++;
                    }
                    else {
                        break;
                    }
                }
            },
            subOil(){
                let keyMult = keyMultiplier();
                for (let i=0; i<keyMult; i++){
                    if (global[graph_source][graph_struct].Oil > 0){
                        global[graph_source][graph_struct].Oil--;
                    }
                    else {
                        break;
                    }
                }
            },
            addOil(){
                let keyMult = keyMultiplier();
                for (let i=0; i<keyMult; i++){
                    if (global[graph_source][graph_struct].Lumber + global[graph_source][graph_struct].Coal + global[graph_source][graph_struct].Oil < global[graph_source][graph_struct].on){
                        global[graph_source][graph_struct].Oil++;
                    }
                    else if (global[graph_source][graph_struct].Lumber + global[graph_source][graph_struct].Coal > 0){
                        if (global[graph_source][graph_struct].Lumber > 0){
                            global[graph_source][graph_struct].Lumber--;
                        }
                        else {
                            global[graph_source][graph_struct].Coal--;
                        }
                        global[graph_source][graph_struct].Oil++;
                    }
                    else {
                        break;
                    }
                }
            },
            buildLabel(type){
                return tooltip(type);
            },
            ariaCount(fuel){
                return ` ${global[graph_source][graph_struct][fuel]} ${fuel} fueled.`;
            },
            ariaProd(res){
                return `. ${global[graph_source][graph_struct][res]} producing ${res}.`;
            },
            level(){
                let on = global[graph_source][graph_struct].Lumber + global[graph_source][graph_struct].Coal + global[graph_source][graph_struct].Oil;
                let max = global[graph_source][graph_struct].on;
                return colorRange(on,max);
            }
        },
        filters: {
            on: function(c){
                return global[graph_source][graph_struct].Lumber + global[graph_source][graph_struct].Coal + global[graph_source][graph_struct].Oil;
            }
        }
    });

    function tooltip(type){
        switch(type){
            case 'wood':
                return loc('modal_graphene_produce',[350,global.race['evil'] ? loc('resource_Bones_name') : global.resource.Lumber.name,global.resource.Graphene.name]);
            case 'coal':
                return loc('modal_graphene_produce',[25,global.resource.Coal.name,global.resource.Graphene.name]);
            case 'oil':
                return loc('modal_graphene_produce',[15,global.resource.Oil.name,global.resource.Graphene.name]);
        }
    }

    ['wood','coal','oil'].forEach(function(type){
        let id = parent.hasClass('modalBody') ? `specialModal` : `iGraphene`;
        popover(`${id}${type}`,function(){
            return tooltip(type);
        }, {
            elm: $(`#${id} > div > .${type}`),
            attach: '#main',
        });
    });
}
