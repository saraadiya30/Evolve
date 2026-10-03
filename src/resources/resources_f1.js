import { global, tmp_vars } from '../core/vars.js';
import { traits } from '../races/races.js';
import { atomic_mass, supplyValue } from './resources.js';
import { tradeRatio } from '../config/trade.js';
import { initMarket, initStorage, initEjector, initSupply, initAlchemy, loadEjector, loadSupply, loadRouteCounter, loadContainerCounter } from './resources_f4.js';
import { marketItem, loadSpecialResource, initGalaxyTrade } from './resources_f2.js';
import { containerItem } from './resources_f3.js';
import { loadAlchemy } from './resources_f5.js';
import { loadResource_s1, loadResource_s2 } from '../sections/sec_loadResource_1.js';

// Fungsi-fungsi dipindah dari resources.js (urutan sumber dipertahankan). resources.js tetap mengekspor ulang nama yang tadinya ter-ekspor.


export function craftCost(manual=false){
    let costs = {
        Plywood: [{ r: 'Lumber', a: 100 }],
        Brick: global.race['flier'] ? [{ r: 'Stone', a: 60 }] : [{ r: 'Cement', a: 40 }],
        Wrought_Iron: [{ r: 'Iron', a: 80 }],
        Sheet_Metal: [{ r: 'Aluminium', a: 120 }],
        Mythril: [{ r: 'Iridium', a: 100 },{ r: 'Alloy', a: 250 }],
        Aerogel: [{ r: 'Graphene', a: 2500 },{ r: 'Infernite', a: 50 }],
        Nanoweave: [{ r: 'Nano_Tube', a: 1000 },{ r: 'Vitreloy', a: 40 }],
        Scarletite: [{ r: 'Iron', a: 250000 },{ r: 'Adamantite', a: 7500 },{ r: 'Orichalcum', a: 500 }],
        Quantium: [{ r: 'Nano_Tube', a: 1000 },{ r: 'Graphene', a: 1000 },{ r: 'Elerium', a: 25 }],
        Thermite: [{ r: 'Iron', a: 180 },{ r: 'Aluminium', a: 60 }],
    };
    if (global.race['wasteful']){
        let rate = 1 + traits.wasteful.vars()[0] / 100;
        Object.keys(costs).forEach(function(res){
            for (let i=0; i<costs[res].length; i++){
                costs[res][i].a = Math.round(costs[res][i].a * rate);
            }
        });
    }
    if (global.race['high_pop'] && !manual){
        let rate = 1 / traits.high_pop.vars()[0];
        Object.keys(costs).forEach(function(res){
            for (let i=0; i<costs[res].length; i++){
                costs[res][i].a = Math.round(costs[res][i].a * rate);
            }
        });
    }
    return costs;
}

export function initResourceTabs(tab){
    if (tab){
        switch (tab){
            case 'market':
                initMarket();
                break;
            case 'storage':
                initStorage();
                break;
            case 'ejector':
                initEjector();
                break;
            case 'supply':
                initSupply();
                break;
            case 'alchemy':
                initAlchemy();
                break;
        }
    }
    else {
        initMarket();
        initStorage();
        initEjector();
        initSupply();
        initAlchemy();
    }
}

export function drawResourceTab(tab){
    if (tab === 'market'){
        if (!global.settings.tabLoad && (global.settings.civTabs !== 4 || global.settings.marketTabs !== 0)){
            return;
        }
        initResourceTabs('market');
        if (tmp_vars.hasOwnProperty('resource')){
            Object.keys(tmp_vars.resource).forEach(function(name){
                let color = tmp_vars.resource[name].color;
                let tradable = tmp_vars.resource[name].tradable;
                if (tradable){
                    var market_item = $(`<div id="market-${name}" class="market-item" v-show="r.display"></div>`);
                    $('#market').append(market_item);
                    marketItem(`#market-${name}`,market_item,name,color,true);
                }
            });
        }
        tradeSummery();
    }
    else if (tab === 'storage'){
        if (!global.settings.tabLoad && (global.settings.civTabs !== 4 || global.settings.marketTabs !== 1)){
            return;
        }
        initResourceTabs('storage');
        if (tmp_vars.hasOwnProperty('resource')){
            Object.keys(tmp_vars.resource).forEach(function(name){
                let color = tmp_vars.resource[name].color;
                let stackable = tmp_vars.resource[name].stackable;
                if (stackable){
                    var market_item = $(`<div id="stack-${name}" class="market-item" v-show="display"></div>`);
                    $('#resStorage').append(market_item);
                    containerItem(`#stack-${name}`,market_item,name,color,true);
                }
            });
        }
        tradeSummery();
    }
    else if (tab === 'ejector'){
        if (!global.settings.tabLoad && (global.settings.civTabs !== 4 || global.settings.marketTabs !== 2)){
            return;
        }
        initResourceTabs('ejector');
        if (tmp_vars.hasOwnProperty('resource')){
            Object.keys(tmp_vars.resource).forEach(function(name){
                let color = tmp_vars.resource[name].color;
                if (atomic_mass[name]){
                    loadEjector(name,color);
                }
            });
        }
    }
    else if (tab === 'supply'){
        if (!global.settings.tabLoad && (global.settings.civTabs !== 4 || global.settings.marketTabs !== 3)){
            return;
        }
        initResourceTabs('supply');
        if (tmp_vars.hasOwnProperty('resource')){
            Object.keys(tmp_vars.resource).forEach(function(name){
                let color = tmp_vars.resource[name].color;
                if (supplyValue[name]){
                    loadSupply(name,color);
                }
            });
        }
    }
    else if (tab === 'alchemy'){
        if (!global.settings.tabLoad && (global.settings.civTabs !== 4 || global.settings.marketTabs !== 4)){
            return;
        }
        initResourceTabs('alchemy');
        if (tmp_vars.hasOwnProperty('resource')){
            Object.keys(tmp_vars.resource).forEach(function(name){
                let color = tmp_vars.resource[name].color;
                let tradable = tmp_vars.resource[name].tradable;
                if (tradeRatio[name] && global.race.universe === 'magic'){
                    global['resource'][name]['basic'] = tradable;
                    loadAlchemy(name,color,tradable);
                }
            });
        }
    }
}

// Sets up resource definitions
export function defineResources(wiki){
    if (global.race.species === 'protoplasm'){
        let base = 100;
        if (global.stats.achieve['mass_extinction'] && global.stats.achieve['mass_extinction'].l > 1){
            base += 50 * (global.stats.achieve['mass_extinction'].l - 1);
        }
        loadResource('RNA',wiki,base,1,false);
        loadResource('DNA',wiki,base,1,false);
    }
    
    loadResource('Money',wiki,1000,1,false,false,'success');
    loadResource(global.race.species,wiki,0,0,false,false,'warning');
    loadResource('Slave',wiki,0,0,false,false,'warning');
    loadResource('Authority',wiki,0,0,false,false,'warning');
    loadResource('Mana',wiki,0,1,false,false,'warning');
    loadResource('Energy',wiki,0,0,false,false,'warning');
    loadResource('Sus',wiki,0,0,false,false,'warning');
    loadResource('Knowledge',wiki,100,1,false,false,'warning');
    loadResource('Omniscience',wiki,100,1,false,false,'warning');
    loadResource('Zen',wiki,0,0,false,false,'warning');
    loadResource('Crates',wiki,0,0,false,false,'warning');
    loadResource('Containers',wiki,0,0,false,false,'warning');
    loadResource('Food',wiki,250,1,true,true);
    loadResource('Lumber',wiki,200,1,true,true);
    loadResource('Chrysotile',wiki,200,1,true,true);
    loadResource('Stone',wiki,200,1,true,true);
    loadResource('Crystal',wiki,200,1,true,true);
    loadResource('Useless',wiki,-2,0,false,false);
    loadResource('Furs',wiki,100,1,true,true);
    loadResource('Copper',wiki,100,1,true,true);
    loadResource('Iron',wiki,100,1,true,true);
    loadResource('Aluminium',wiki,50,1,true,true);
    loadResource('Cement',wiki,100,1,true,true);
    loadResource('Coal',wiki,50,1,true,true);
    loadResource('Oil',wiki,0,1,true,false);
    loadResource('Uranium',wiki,10,1,true,false);
    loadResource('Steel',wiki,50,1,true,true);
    loadResource('Titanium',wiki,50,1,true,true);
    loadResource('Alloy',wiki,50,1,true,true);
    loadResource('Polymer',wiki,50,1,true,true);
    loadResource('Iridium',wiki,0,1,true,true);
    loadResource('Helium_3',wiki,0,1,true,false);
    loadResource('Water',wiki,0,1,false,false,'advanced');
    loadResource('Deuterium',wiki,0,1,false,false,'advanced');
    loadResource('Neutronium',wiki,0,1,false,false,'advanced');
    loadResource('Adamantite',wiki,0,1,false,true,'advanced');
    loadResource('Infernite',wiki,0,1,false,false,'advanced');
    loadResource('Elerium',wiki,1,1,false,false,'advanced');
    loadResource('Nano_Tube',wiki,0,1,false,false,'advanced');
    loadResource('Graphene',wiki,0,1,false,true,'advanced');
    loadResource('Stanene',wiki,0,1,false,true,'advanced');
    loadResource('Bolognium',wiki,0,1,false,true,'advanced');
    loadResource('Vitreloy',wiki,0,1,false,true,'advanced');
    loadResource('Orichalcum',wiki,0,1,false,true,'advanced');
    loadResource('Asphodel_Powder',wiki,0,1,false,false,'advanced');
    loadResource('Elysanite',wiki,0,1,false,true,'advanced');
    loadResource('Unobtainium',wiki,0,1,false,false,'advanced');
    loadResource('Materials',wiki,0,1,false,false,'advanced');
    loadResource('Horseshoe',wiki,-2,0,false,false,'advanced');
    loadResource('Nanite',wiki,0,1,false,false,'advanced');
    loadResource('Genes',wiki,-2,0,false,false,'advanced');
    loadResource('Soul_Gem',wiki,-2,0,false,false,'advanced');
    loadResource('Plywood',wiki,-1,0,false,false,'danger');
    loadResource('Brick',wiki,-1,0,false,false,'danger');
    loadResource('Wrought_Iron',wiki,-1,0,false,false,'danger');
    loadResource('Sheet_Metal',wiki,-1,0,false,false,'danger');
    loadResource('Mythril',wiki,-1,0,false,false,'danger');
    loadResource('Aerogel',wiki,-1,0,false,false,'danger');
    loadResource('Nanoweave',wiki,-1,0,false,false,'danger');
    loadResource('Scarletite',wiki,-1,0,false,false,'danger');
    loadResource('Quantium',wiki,-1,0,false,false,'danger');
    loadResource('Thermite',wiki,-1,0,false,false,'danger');
    loadResource('Corrupt_Gem',wiki,-2,0,false,false,'caution');
    loadResource('Codex',wiki,-2,0,false,false,'caution');
    loadResource('Cipher',wiki,0,1,false,false,'caution');
    loadResource('Demonic_Essence',wiki,-2,0,false,false,'caution');
    loadResource('Blessed_Essence',wiki,-2,0,false,false,'caution');
    if (wiki){ return; }
    loadSpecialResource('Blood_Stone','caution');
    loadSpecialResource('Artifact','caution');
    loadResource('Knockoff',wiki,-2,0,false,false,'special');
    loadSpecialResource('Plasmid');
    loadSpecialResource('AntiPlasmid');
    loadSpecialResource('Supercoiled');
    loadSpecialResource('Phage');
    loadSpecialResource('Dark');
    loadSpecialResource('Harmony');
    loadSpecialResource('AICore');
    loadSpecialResource('Aether');
}

export function tradeSummery(){
    if (global.race.species !== 'protoplasm'){
        loadRouteCounter();
        initGalaxyTrade();
        loadContainerCounter();
    }
}

// Load resource function
// This function defines each resource, loads saved values from localStorage
// And it creates Vue binds for various resource values
export function loadResource(name,wiki,max,rate,tradable,stackable,color){
    const $ctx = {};
    $ctx.name = name;
    $ctx.wiki = wiki;
    $ctx.max = max;
    $ctx.rate = rate;
    $ctx.tradable = tradable;
    $ctx.stackable = stackable;
    $ctx.color = color;
    { const $r = loadResource_s1($ctx); if ($r) return $r.$r; }

    loadResource_s2($ctx);
}
