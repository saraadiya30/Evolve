import { global, breakdown, keyMultiplier, sizeApproximation, p_on } from '../core/vars.js';
import { loc } from '../core/locale.js';
import { vBind, easterEgg, popover, modRes, trickOrTreat, messageQueue, clearElement } from '../functions/functions.js';
import { defineGovernor } from '../governor/governor.js';
import { traits, fathomCheck } from '../races/races.js';
import { BLACKHOLE_STORAGE_BONUS_PER_LEVEL } from '../config/storage.js';
import { spatialReasoning, atomic_mass, supplyValue } from './resources.js';
import { unassignCrate, assignCrate, unassignContainer, assignContainer } from './resources_f3.js';
import { drawResourceTab } from './resources_f1.js';

// Fungsi-fungsi dipindah dari resources.js (urutan sumber dipertahankan). resources.js tetap mengekspor ulang nama yang tadinya ter-ekspor.


export function loadRouteCounter(){
    if (!global.settings.tabLoad && (global.settings.civTabs !== 4 || global.settings.marketTabs !== 0)){
        return;
    }

    let no_market = global.race['no_trade'] ? ' nt' : '';
    var market_item = $(`<div id="tradeTotal" v-show="active" class="market-item"><div id="tradeTotalPopover"><span class="tradeTotal${no_market}"><span class="has-text-caution">${loc('resource_market_trade_routes')}</span> <span v-html="$options.filters.tdeCnt(trade)"></span> / {{ mtrade }}</span></div></div>`);
    market_item.append($(`<span role="button" class="zero has-text-advanced" @click="zero()">${loc('cancel_all_routes')}</span>`));
    $('#market').append(market_item);
    vBind({
        el: '#tradeTotal',
        data: global.city.market,
        methods: {
            zero(){
                Object.keys(global.resource).forEach(function(res){
                    if (global.resource[res]['trade']){
                        global.city.market.trade -= Math.abs(global.resource[res].trade);
                        global.resource[res].trade = 0;
                        tradeRouteColor(res);
                    }
                });
            }
        },
        filters: {
            tdeCnt(ct){
                let egg17 = easterEgg(17,11);
                if (((ct === 100 && !global.tech['isolation'] && !global.race['cataclysm']) || (ct === 10 && (global.tech['isolation'] || global.race['cataclysm']))) && egg17.length > 0){
                    return '10'+egg17;
                }
                return ct;
            }
        }
    });

    popover(`tradeTotalPopover`,function(){
        let bd = $(`<div class="resBreakdown"></div>`);
        if (breakdown.hasOwnProperty('t_route')){
            Object.keys(breakdown.t_route).forEach(function(k){
                if (breakdown.t_route[k] > 0){
                    bd.append(`<div class="modal_bd"><span class="has-text-warning">${k}</span> <span>+${breakdown.t_route[k]}</span></div>`);
                }
            });
        }
        bd.append(`<div class="modal_bd ${global.city.market.mtrade > 0 ? 'sum' : ''}"><span class="has-text-caution">${loc('resource_market_trade_routes')}</span> <span>${global.city.market.mtrade}</span></div>`);
        return bd;
    },{
        elm: `#tradeTotalPopover > span`
    });
}

export function loadContainerCounter(){
    if (!global.settings.tabLoad && (global.settings.civTabs !== 4 || global.settings.marketTabs !== 1)){
        return;
    }

    var market_item = $(`<div id="crateTotal" class="market-item"><span v-show="cr.display" class="crtTotal"><span class="has-text-warning">${global.resource.Crates.name}</span><span>{{ cr.amount }} / {{ cr.max }}</span></span><span v-show="cn.display" class="cntTotal"><span class="has-text-warning">${global.resource.Containers.name}</span><span>{{ cn.amount }} / {{ cn.max }}</span></span></div>`);
    $('#resStorage').append(market_item);

    vBind({
        el: '#crateTotal',
        data: {
            cr: global.resource.Crates,
            cn: global.resource.Containers
        }
    });
}

export function tradeRouteColor(res){
    $(`#market-${res} .trade .current`).removeClass('has-text-warning');
    $(`#market-${res} .trade .current`).removeClass('has-text-danger');
    $(`#market-${res} .trade .current`).removeClass('has-text-success');
    if (global.resource[res].trade > 0){
        $(`#market-${res} .trade .current`).addClass('has-text-success');
    }
    else if (global.resource[res].trade < 0){
        $(`#market-${res} .trade .current`).addClass('has-text-danger');
    }
    else {
        $(`#market-${res} .trade .current`).addClass('has-text-warning');
    }
}

export function buildCrateLabel(){
    let material = global.race['kindling_kindred'] || global.race['smoldering'] ? (global.race['smoldering'] ? global.resource.Chrysotile.name : global.resource.Stone.name) : (global.resource['Plywood'] ? global.resource.Plywood.name : global.resource.Plywood.name);
    if (global.race['iron_wood']){ material = global.resource.Lumber.name; }
    let cost = global.race['kindling_kindred'] || global.race['smoldering'] || global.race['iron_wood'] ? 200 : 10
    return loc('resource_modal_crate_construct_desc',[cost,material,crateValue()]);
}

export function buildContainerLabel(){
    return loc('resource_modal_container_construct_desc',[125,containerValue()]);
}

export function crateGovHook(type,num){
    switch (type){
        case 'crate':
            buildCrate(num);
            break;
        case 'container':
            buildContainer(num);
            break;
    }
}

export function buildCrate(num){
    let keyMutipler = num || keyMultiplier();
    let material = global.race['kindling_kindred'] || global.race['smoldering'] ? (global.race['smoldering'] ? 'Chrysotile' : 'Stone') : 'Plywood';
    if (global.race['iron_wood']){ material = 'Lumber'; }
    let cost = global.race['kindling_kindred'] || global.race['smoldering'] || global.race['iron_wood'] ? 200 : 10;
    if (keyMutipler + global.resource.Crates.amount > global.resource.Crates.max){
        keyMutipler = global.resource.Crates.max - global.resource.Crates.amount;
    }
    if (global.resource[material].amount < cost * keyMutipler){
        keyMutipler = Math.floor(global.resource[material].amount / cost);
    }
    if (global.resource[material].amount >= (cost * keyMutipler) && global.resource.Crates.amount < global.resource.Crates.max){
        modRes(material, -(cost * keyMutipler), true);
        global.resource.Crates.amount += keyMutipler;
    }
}

export function buildContainer(num){
    let keyMutipler = num || keyMultiplier();
    if (keyMutipler + global.resource.Containers.amount > global.resource.Containers.max){
        keyMutipler = global.resource.Containers.max - global.resource.Containers.amount;
    }
    if (global.resource['Steel'].amount < 125 * keyMutipler){
        keyMutipler = Math.floor(global.resource['Steel'].amount / 125);
    }
    if (global.resource['Steel'].amount >= (125 * keyMutipler) && global.resource.Containers.amount < global.resource.Containers.max){
        modRes('Steel', -(125 * keyMutipler), true);
        global.resource.Containers.amount += keyMutipler;
    }
}

export function drawModal(name){
    $('#modalBox').append($('<p id="modalBoxTitle" class="has-text-warning modalTitle">{{ name }} - {{ amount | size }}/{{ max | size }}</p>'));
    
    let body = $('<div class="modalBody crateModal"></div>');
    $('#modalBox').append(body);

    if ((name === 'Food' && !global.race['artifical']) || (global.race['artifical'] && name === 'Coal') || name === 'Souls'){
        let egg = easterEgg(7,10);
        if (egg.length > 0){
            $('#modalBoxTitle').prepend(egg);
        }
    }

    if (name === 'Stone'){
        let trick = trickOrTreat(1,12,false);
        if (trick.length > 0){
            $('#modalBoxTitle').prepend(trick);
        }
    }
    
    let crates = $('<div id="modalCrates" class="crates"></div>');
    body.append(crates);
    
    crates.append($(`<div class="crateHead"><span>${loc('resource_modal_crate_owned')} {{ crates.amount }}/{{ crates.max }}</span><span>${loc('resource_modal_crate_assigned')} {{ res.crates }}</span></div>`));
    
    let buildCr = $(`<button class="button construct" @click="buildCrate()">${loc('resource_modal_crate_construct')}</button>`);
    let removeCr = $(`<button class="button unassign" @click="subCrate('${name}')">${loc('resource_modal_crate_unassign')}</button>`);
    let addCr = $(`<button class="button assign" @click="addCrate('${name}')">${loc('resource_modal_crate_assign')}</button>`);
    
    crates.append(buildCr);
    crates.append(removeCr);
    crates.append(addCr);
    
    vBind({
        el: `#modalCrates`,
        data: { 
            crates: global['resource']['Crates'],
            res: global['resource'][name],
        },
        methods: {
            buildCrate(){
                buildCrate();
            },
            subCrate(res){
                unassignCrate(res);
            },
            addCrate(res){
                assignCrate(res);
            }
        }
    });
    
    if (global.resource.Containers.display){
        let containers = $('<div id="modalContainers" class="crates divide"></div>');
        body.append(containers);
        
        containers.append($(`<div class="crateHead"><span>${loc('resource_modal_container_owned')} {{ containers.amount }}/{{ containers.max }}</span><span>${loc('resource_modal_container_assigned')} {{ res.containers }}</span></div>`));

        let buildCon = $(`<button class="button construct" @click="buildContainer()">${loc('resource_modal_container_construct')}</button>`);
        let removeCon = $(`<button class="button unassign" @click="removeContainer('${name}')">${loc('resource_modal_container_unassign')}</button>`);
        let addCon = $(`<button class="button assign" @click="addContainer('${name}')">${loc('resource_modal_container_assign')}</button>`);
        
        containers.append(buildCon);
        containers.append(removeCon);
        containers.append(addCon);
        
        vBind({
            el: `#modalContainers`,
            data: { 
                containers: global['resource']['Containers'],
                res: global['resource'][name],
            },
            methods: {
                buildContainer(){
                    buildContainer();
                },
                removeContainer(res){
                    unassignContainer(res);
                },
                addContainer(res){
                    assignContainer(res);
                }
            }
        });
    }

    vBind({
        el: `#modalBoxTitle`,
        data: global['resource'][name], 
        filters: {
            size: function (value){
                return sizeApproximation(value,0);
            },
            diffSize: function (value){
                return sizeApproximation(value,2);
            }
        }
    });

    function tooltip(type,subtype){
        if (type === 'modalContainers'){
            let cap = containerValue();
            switch (subtype){
                case 'assign':
                    return loc('resource_modal_container_assign_desc',[cap]);
                case 'unassign':
                    return loc('resource_modal_container_unassign_desc',[cap]);
                case 'construct':
                    return buildContainerLabel();
            }
        }
        else {
            let cap = crateValue();
            switch (subtype){
                case 'assign':
                    return loc('resource_modal_crate_assign_desc',[cap]);
                case 'unassign':
                    return loc('resource_modal_crate_unassign_desc',[cap]);
                case 'construct':
                    return buildCrateLabel();
            }
        }
    }

    ['modalCrates','modalContainers'].forEach(function(type){
        ['assign','unassign','construct'].forEach(function(subtype){
            popover(`${type}${subtype}`,tooltip(type,subtype), {
                elm: $(`#${type} > .${subtype}`),
                attach: '#main',
            });
        });
    });
}

export function unlockStorage(){
    // If this is the first resource subtab to unlock, then mark it as the visible subtab
    if (!global.settings.showResources) {
        global.settings.marketTabs = 1;
    }

    // Enable display for resource tab and storage subtab
    global.settings.showResources = true;
    global.settings.showStorage = true;

    // Possibly draw or redraw the storage subtab
    drawResourceTab('storage');

    // Redraw the governor, who has actions to build and manage storage
    defineGovernor();
}

// Crates are always initially unlocked by the Freight Yard building.
// Other buildings that provide crates do not need to call this function.
export function unlockCrates(){
    if (!global.resource.Crates.display){
        // Message about unlocking crates for the first time
        messageQueue(loc('city_storage_yard_msg'),'info',false,['progress']);

        // Enable display for crates
        global.resource.Crates.display = true;

        // Unlock the storage tab
        unlockStorage();
    }
}

// Containers are optional to clear the game, so every building that provides Containers might be the very first one.
// All buildings that provide containers, not just the Container Port, should call this function.
export function unlockContainers(){
    if (!global.resource.Containers.display){
        // Message about unlocking containers for the first time
        messageQueue(loc('city_warehouse_msg'),'info',false,['progress']);

        // Enable display for containers
        global.resource.Containers.display = true;

        // Unlock the storage tab
        unlockStorage();
    }
}

export function crateValue(){
    let create_value = global.tech['container'] && global.tech['container'] >= 2 ? 500 : 350;
    if (global.tech['container'] && global.tech['container'] >= 4){
        create_value += global.tech['container'] >= 5 ? 500 : 250;
    }
    if (global.tech['container'] && global.tech['container'] >= 6){
        create_value += global.tech['container'] >= 7 ? 1200 : 500;
    }
    if (global.tech['container'] && global.tech['container'] >= 8){
        create_value += global.tech['container'] >= 9 ? 7800 : 4000;
    }
    if (global.race['pack_rat']){
        create_value *= 1 + (traits.pack_rat.vars()[0] / 100);
    }
    let fathom = fathomCheck('kobold');
    if (fathom > 0){
        create_value *= 1 + (traits.pack_rat.vars(1)[0] / 100 * fathom);
    }
    if (global.stats.achieve['banana'] && global.stats.achieve.banana.l >= 3){
        create_value *= 1.1;
    }
    create_value *= global.stats.achieve['blackhole'] ? 1 + (global.stats.achieve.blackhole.l * BLACKHOLE_STORAGE_BONUS_PER_LEVEL) : 1;
    return Math.round(spatialReasoning(create_value)) * 1000;
}

export function containerValue(){
    let container_value = global.tech['steel_container'] && global.tech['steel_container'] >= 3 ? 1200 : 800;
    if (global.tech['steel_container'] && global.tech['steel_container'] >= 4){
        container_value += global.tech['steel_container'] >= 5 ? 1000 : 400;
    }
    if (global.tech['steel_container'] && global.tech['steel_container'] >= 6){
        container_value += global.tech['steel_container'] >= 7 ? 7500 : 1000;
    }
    if (global.tech['steel_container'] && global.tech['steel_container'] >= 8){
        container_value += global.tech['steel_container'] >= 9 ? 15300 : 8000;
    }
    if (global.race['pack_rat']){
        container_value *= 1 + (traits.pack_rat.vars()[0] / 100);
    }
    let fathom = fathomCheck('kobold');
    if (fathom > 0){
        container_value *= 1 + (traits.pack_rat.vars(1)[0] / 100 * fathom);
    }
    container_value *= global.stats.achieve['blackhole'] ? 1 + (global.stats.achieve.blackhole.l * BLACKHOLE_STORAGE_BONUS_PER_LEVEL) : 1;
    return Math.round(spatialReasoning(container_value)) * 10000;
}

export function initMarket(){
    if (!global.settings.tabLoad && (global.settings.civTabs !== 4 || global.settings.marketTabs !== 0)){
        return;
    }
    let market = $(`<div id="market-qty" class="market-header"><h2 class="is-sr-only">${loc('resource_market')}</h2></div>`);
    clearElement($('#market'));
    $('#market').append(market);
    loadMarket();
}

export function initStorage(){
    if (!global.settings.tabLoad && (global.settings.civTabs !== 4 || global.settings.marketTabs !== 1)){
        return;
    }
    let store = $(`<div id="createHead" class="storage-header"><h2 class="is-sr-only">${loc('tab_storage')}</h2></div>`);
    clearElement($('#resStorage'));
    $('#resStorage').append(store);
    
    if (global.resource['Crates'] && global.resource['Containers']){
        store.append($(`<b-tooltip :label="buildCrateDesc()" position="is-bottom" class="crate" animated multilined><button :aria-label="buildCrateDesc()" v-show="cr.display" class="button" @click="crate">${loc('resource_modal_crate_construct')}</button></b-tooltip>`));
        store.append($(`<b-tooltip :label="buildContainerDesc()" position="is-bottom" class="container" animated multilined><button :aria-label="buildContainerDesc()" v-show="cn.display" class="button" @click="container">${loc('resource_modal_container_construct')}</button></b-tooltip>`));

        vBind({
            el: '#createHead',
            data: {
                cr: global.resource.Crates,
                cn: global.resource.Containers
            },
            methods: {
                crate(){
                    buildCrate();
                },
                container(){
                    buildContainer();
                },
                buildCrateDesc(){
                    return buildCrateLabel();
                },
                buildContainerDesc(){
                    return buildContainerLabel();
                },
            }
        });
    }
}

export function loadMarket(){
    if (!global.settings.tabLoad && (global.settings.civTabs !== 4 || global.settings.marketTabs !== 0)){
        return;
    }

    let market = $('#market-qty');
    clearElement(market);

    if (!global.race['no_trade']){
        market.append($(`<h3 class="is-sr-only">${loc('resource_trade_qty')}</h3>`));
        market.append($(`<b-field class="market"><span class="button has-text-danger" role="button" @click="less">-</span><b-numberinput :input="val()" min="1" :max="limit()" v-model="qty" :controls="false"></b-numberinput><span class="button has-text-success" role="button" @click="more">+</span></b-field>`));
    }

    vBind({
        el: `#market-qty`,
        data: global.city.market,
        methods: {
            val(){
                if (global.city.market.qty < 1){
                    global.city.market.qty = 1;
                }
                else if (global.city.market.qty > tradeMax()){
                    global.city.market.qty = tradeMax();
                }
            },
            limit(){
                return tradeMax();
            },
            less(){
                global.city.market.qty -= keyMultiplier();
            },
            more(){
                global.city.market.qty += keyMultiplier();
            }
        }
    });
}

export function tradeMax(){
    if (global.tech['currency'] >= 6){
        return 1000000;
    }
    else if (global.tech['currency'] >= 4){
        return 5000;
    }
    else {
        return 100;
    }
}

export function initEjector(){
    if (!global.settings.tabLoad && (global.settings.civTabs !== 4 || global.settings.marketTabs !== 2)){
        return;
    }
    clearElement($('#resEjector'));
    if (global.interstellar['mass_ejector']){
        let ejector = $(`<div id="eject" class="market-item"><h3 class="res has-text-warning">${loc('interstellar_mass_ejector_vol')}</h3></div>`);
        $('#resEjector').append(ejector);

        let eject = $(`<span class="trade"></span>`);
        ejector.append(eject);

        eject.append($(`<span>{{ total }} / {{ on | max }}{{ on | real }}</span><span class="mass">${loc('interstellar_mass_ejector_mass')}: {{ mass | approx }} kt/s</span>`));

        vBind({
            el: `#eject`,
            data: global.interstellar.mass_ejector,
            filters: {
                max(num){
                    return num * 1000;
                },
                real(num){
                    if (p_on['mass_ejector'] < num){
                        return ` (${loc('interstellar_mass_ejector_active',[p_on['mass_ejector'] * 1000])})`;
                    }
                    return '';
                },
                approx(tons){
                    return sizeApproximation(tons,2);
                }
            }
        });
    }
}

export function loadEjector(name,color){
    if (!global.settings.tabLoad && (global.settings.civTabs !== 4 || global.settings.marketTabs !== 2)){
        return;
    }
    else if (global.race['artifical'] && name === 'Food'){
        return;
    }
    if (atomic_mass[name] && global.interstellar['mass_ejector']){
        if (global.race.universe !== 'magic' && (name === 'Elerium' || name === 'Infernite')){
            color = 'caution';
        }
        let ejector = $(`<div id="eject${name}" class="market-item" v-show="r.display"><h3 class="res has-text-${color}">${global.resource[name].name}</h3></div>`);
        $('#resEjector').append(ejector);

        let res = $(`<span class="trade"></span>`);
        ejector.append(res);

        res.append($(`<span role="button" aria-label="eject less ${global.resource[name].name}" class="sub has-text-danger" @click="ejectLess('${name}')"><span>&laquo;</span></span>`));
        res.append($(`<span class="current">{{ e.${name} }}</span>`));
        res.append($(`<span role="button" aria-label="eject more ${global.resource[name].name}" class="add has-text-success" @click="ejectMore('${name}')"><span>&raquo;</span></span>`));

        res.append($(`<span class="mass">${loc('interstellar_mass_ejector_per')}: <span class="has-text-warning">${atomic_mass[name]}</span> kt</span>`));

        if (!global.interstellar.mass_ejector.hasOwnProperty(name)){
            global.interstellar.mass_ejector[name] = 0;
        }

        vBind({
            el: `#eject${name}`,
            data: {
                r: global.resource[name],
                e: global.interstellar.mass_ejector
            },
            methods: {
                ejectMore(r){
                    let keyMutipler = keyMultiplier();
                    if (keyMutipler + global.interstellar.mass_ejector.total > p_on['mass_ejector'] * 1000){
                        keyMutipler = p_on['mass_ejector'] * 1000 - global.interstellar.mass_ejector.total;
                    }
                    global.interstellar.mass_ejector[r] += keyMutipler;
                    global.interstellar.mass_ejector.total += keyMutipler;
                },
                ejectLess(r){
                    let keyMutipler = keyMultiplier();
                    if (keyMutipler > global.interstellar.mass_ejector[r]){
                        keyMutipler = global.interstellar.mass_ejector[r];
                    }
                    if (global.interstellar.mass_ejector[r] > 0){
                        global.interstellar.mass_ejector[r] -= keyMutipler;
                        global.interstellar.mass_ejector.total -= keyMutipler;
                    }
                },
            }
        });
    }
}

export function initSupply(){
    if (!global.settings.tabLoad && (global.settings.civTabs !== 4 || global.settings.marketTabs !== 3)){
        return;
    }
    clearElement($('#resCargo'));
    if (global.portal['transport']){
        let supply = $(`<div id="spireSupply"><h3 class="res has-text-warning pad">${loc('portal_transport_supply')}</h3></div>`);
        $('#resCargo').append(supply);

        let cargo = $(`<span class="pad">{{ used }} / {{ max }}</span>`);
        supply.append(cargo);

        vBind({
            el: `#spireSupply`,
            data: global.portal.transport.cargo
        });
    }
}

export function loadSupply(name,color){
    if (!global.settings.tabLoad && (global.settings.civTabs !== 4 || global.settings.marketTabs !== 3)){
        return;
    }
    if (supplyValue[name] && global.portal['transport']){
        let ejector = $(`<div id="supply${name}" class="market-item" v-show="r.display"><h3 class="res has-text-${color}">${global.resource[name].name}</h3></div>`);
        $('#resCargo').append(ejector);

        let res = $(`<span class="trade"></span>`);
        ejector.append(res);

        res.append($(`<span role="button" aria-label="eject less ${loc('resource_'+name+'_name')}" class="sub has-text-danger" @click="supplyLess('${name}')"><span>&laquo;</span></span>`));
        res.append($(`<span class="current">{{ e.${name} }}</span>`));
        res.append($(`<span role="button" aria-label="eject more ${loc('resource_'+name+'_name')}" class="add has-text-success" @click="supplyMore('${name}')"><span>&raquo;</span></span>`));

        let volume = sizeApproximation(supplyValue[name].out);
        res.append($(`<span class="mass">${loc('portal_transport_item',[`<span class="has-text-caution">${volume}</span>`,`<span class="has-text-success">${supplyValue[name].in}</span>`])}</span>`));

        if (!global.portal.transport.cargo.hasOwnProperty(name)){
            global.portal.transport.cargo[name] = 0;
        }

        vBind({
            el: `#supply${name}`,
            data: {
                r: global.resource[name],
                e: global.portal.transport.cargo
            },
            methods: {
                supplyMore(r){
                    let keyMutipler = keyMultiplier();
                    if (keyMutipler + global.portal.transport.cargo.used > global.portal.transport.cargo.max){
                        keyMutipler = global.portal.transport.cargo.max - global.portal.transport.cargo.used;
                        if (global.portal.transport.cargo[r] + keyMutipler < 0){
                            keyMutipler = -global.portal.transport.cargo[r];
                        }
                    }
                    global.portal.transport.cargo[r] += keyMutipler;
                    global.portal.transport.cargo.used += keyMutipler;
                },
                supplyLess(r){
                    let keyMutipler = keyMultiplier();
                    if (keyMutipler > global.portal.transport.cargo[r]){
                        keyMutipler = global.portal.transport.cargo[r];
                    }
                    if (global.portal.transport.cargo[r] > 0){
                        global.portal.transport.cargo[r] -= keyMutipler;
                        global.portal.transport.cargo.used -= keyMutipler;
                    }
                },
            }
        });
    }
}

export function initAlchemy(){
    if (!global.settings.tabLoad && (global.settings.civTabs !== 4 || global.settings.marketTabs !== 4)){
        return;
    }
    clearElement($('#resAlchemy'));
}
