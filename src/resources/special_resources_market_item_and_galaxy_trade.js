import { global, sizeApproximation, keyMultiplier } from '../core/vars.js';
import { flib, eventActive, hoovedRename, vBind, popover, darkEffect, harmonyEffect, calc_mastery, trickOrTreat } from '../functions/functions.js';
import { loc } from '../core/locale.js';
import { govActive } from '../governor/governor.js';
import { OCULAR_POWER_CHARM_BASE } from '../config/ocular_power.js';
import { traits, fathomCheck } from '../races/races.js';
import { plasmidBonus, spatialReasoning } from './resources.js';
import { tradeRatio, resource_values } from '../config/trade.js';
import { aetherFormat } from './alchemy_aether_format_and_faith.js';
import { astroVal, astrologySign } from '../systems/seasons.js';
import { tradeRouteColor } from './market_storage_crates_and_containers.js';
import { tradeSellPrice, tradeBuyPrice, galacticTrade } from './crate_container_assignment_and_trade_prices.js';

// Fungsi-fungsi dipindah dari resources.js (urutan sumber dipertahankan). resources.js tetap mengekspor ulang nama yang tadinya ter-ekspor.


export function setResourceName(name){
    if (name === global.race.species){
        global.resource[name].name = flib('name');
    }
    else {
        global.resource[name].name = name === 'Money' ? '$' : loc(`resource_${name}_name`);
    }

    if (name === 'Useless'){
        if (!global.resource.Lumber.display){
            global.resource.Useless.name = loc('resource_Lumber_name');
        }
        else if (!global.resource.Chrysotile.display){
            global.resource.Useless.name = loc('resource_Chrysotile_name');
        }
        else if (!global.resource.Crystal.display){
            global.resource.Useless.name = loc('resource_Crystal_name');
        }
        else {
            global.resource.Useless.name = loc('resource_Bronze_name');
        }
    }
    
    if (eventActive('fool',2022)){
        switch(name){
            case 'Lumber':
                global['resource'][name].name = loc('resource_Stone_name');
                break;
            case 'Stone':
                global['resource'][name].name = loc('resource_Lumber_name');
                break;
            case 'Copper':
                global['resource'][name].name = loc('resource_Iron_name');
                break;
            case 'Iron':
                global['resource'][name].name = loc('resource_Copper_name');
                break;
            case 'Steel':
                global['resource'][name].name = loc('resource_Titanium_name');
                break;
            case 'Titanium':
                global['resource'][name].name = loc('resource_Steel_name');
                break;
            case 'Coal':
                global['resource'][name].name = loc('resource_Oil_name');
                break;
            case 'Oil':
                global['resource'][name].name = loc('resource_Coal_name');
                break;
            case 'Alloy':
                global['resource'][name].name = loc('resource_Polymer_name');
                break;
            case 'Polymer':
                global['resource'][name].name = loc('resource_Alloy_name');
                break;
            case 'Graphene':
                global['resource'][name].name = loc('resource_Stanene_name');
                break;
            case 'Stanene':
                global['resource'][name].name = loc('resource_Graphene_name');
                break;
            case 'Plywood':
                global['resource'][name].name = loc('resource_Brick_name');
                break;
            case 'Brick':
                global['resource'][name].name = loc('resource_Plywood_name');
                break;
            case 'Genes':
                global['resource'][name].name = loc('resource_Soul_Gem_name');
                break;
            case 'Soul_Gem':
                global['resource'][name].name = loc('resource_Genes_name');
                break;
            case 'Slave':
                global['resource'][name].name = loc('resource_Peon_name');
                break;
        }
    }

    if (name === 'Horseshoe'){
        global.resource[name].name = hoovedRename();
    }

    if (global.race['artifical']){
        if (name === 'Genes'){
            global.resource[name].name = loc(`resource_Program_name`);
        }
    }

    if (global.race['sappy']){
        switch(name){
            case 'Stone':
                global['resource'][name].name = loc('resource_Amber_name');
                break;
        }
    }
    else if (global.race['flier']){
        switch(name){
            case 'Stone':
                global['resource'][name].name = loc('resource_Clay_name');
                break;
            case 'Brick':
                global['resource'][name].name = loc('resource_Mud_Brick_name');
                break;
        }
    }

    if (global.race['soul_eater']){
        switch(name){
            case 'Food':
                global['resource'][name].name = loc('resource_Souls_name');
                break;
        }
    }

    if (global.race['evil']){
        switch(name){
            case 'Lumber':
                global['resource'][name].name = loc('resource_Bones_name');
                break;
            case 'Furs':
                global['resource'][name].name = loc('resource_Flesh_name');
                break;
            case 'Plywood':
                global['resource'][name].name = loc('resource_Boneweave_name');
                break;
        }
    }

    if (global.race['artifical']){
        switch(name){
            case 'Food':
                global['resource'][name].name = loc('resource_Signal_name');
                break;
        }
    }

    /* Too many hard coded string references to cement, maybe some other day
    if (global.city.biome === 'ashland'){
        switch(name){
            case 'Cement':
                global['resource'][name].name = loc('resource_Ashcrete_name');
                break;
        }
    }*/

    let hallowed = eventActive('halloween');
    if (hallowed.active){
        switch(name){
            case 'Food':
                global['resource'][name].name = loc('resource_Candy_name');
                break;
            case 'Lumber':
                global['resource'][name].name = loc('resource_Bones_name');
                break;
            case 'Stone':
                global['resource'][name].name = loc('resource_RockCandy_name');
                break;
            case 'Furs':
                global['resource'][name].name = loc('resource_Webs_name');
                break;
            case 'Plywood':
                global['resource'][name].name = loc('resource_Boneweave_name');
                break;
            case 'Brick':
                global['resource'][name].name = loc('resource_Tombstone_name');
                break;
            case 'Soul_Gem':
                global['resource'][name].name = loc('resource_CandyCorn_name');
                break;
            case 'Slave':
                global['resource'][name].name = loc('events_halloween_ghoul');
                break;
        }
    }
}

export function loadSpecialResource(name,color) {
    if ($(`#res${name}`).length){
        let bind = $(`#res${name}`);
        bind.detach();
        $('#resources').append(bind);
        return;
    }
    color = color || 'special';

    var res_container = $(`<div id="res${name}" class="resource" v-show="count"><div><span class="res has-text-${color}">${loc(`resource_${name}_name`)}</span><span class="count">{{ count | round }}</span></div></div>`);
    $('#resources').append(res_container);

    vBind({
        el: `#res${name}`,
        data: global.prestige[name],
        filters: {
            round(n){ return n ? (name === 'Aether' ? aetherFormat(n) : sizeApproximation(n, 3, false, true)) : n; }
        }
    });

    if (name === "Artifact" || name === "Blood_Stone"){
        return;
    }

    popover(`res${name}`, function(){
        let desc = $(`<div></div>`);
        switch (name){
            case 'Plasmid':
                {
                    let potential = global.race.p_mutation + (global.race['wish'] && global.race['wishStats'] ? global.race.wishStats.plas : 0);
                    let active = global.race['no_plasmid'] ? Math.min(potential, global.prestige.Plasmid.count) : global.prestige.Plasmid.count;
                    desc.append($(`<span>${loc(`resource_${name}_desc`,[active, +(plasmidBonus('plasmid') * 100).toFixed(2)])}</span>`));
                    if (global.genes['store'] && (global.race.universe !== 'antimatter' || global.genes['bleed'] >= 3)){
                        let plasmidSpatial = spatialReasoning(1,'plasmid');
                        if (plasmidSpatial > 1){
                            desc.append($(`<span> ${loc(`resource_Plasmid_desc2`,[+((plasmidSpatial - 1) * 100).toFixed(2)])}</span>`));
                        }   
                    }
                }
                break;
    
            case 'AntiPlasmid':
                {
                    desc.append($(`<span>${loc(`resource_${name}_desc`,[global.prestige.AntiPlasmid.count, +(plasmidBonus('antiplasmid') * 100).toFixed(2)])}</span>`));
                    let antiSpatial = spatialReasoning(1,'anti');
                    if (global.genes['store'] && (global.race.universe === 'antimatter' || global.genes['bleed'] >= 3)){
                        if (antiSpatial > 1){
                            desc.append($(`<span> ${loc(`resource_Plasmid_desc2`,[+((antiSpatial - 1) * 100).toFixed(2)])}</span>`));
                        }
                    }
                }
                break;
    
            case 'Phage':
                {
                    desc.append($(`<span>${loc(global.prestige.AntiPlasmid.count > 0 ? `resource_Phage_desc2` : `resource_Phage_desc`,[250 + global.prestige.Phage.count])}</span>`));
                    let phageSpatial = spatialReasoning(1,'phage');
                    if (global.genes['store'] && global.genes['store'] >= 4){
                        if (phageSpatial > 1){
                            desc.append($(`<span> ${loc(`resource_Plasmid_desc2`,[+((phageSpatial - 1) * 100).toFixed(2)])}</span>`));
                        }
                    }
                }
                break;
    
            case 'Dark':
                {
                    switch (global.race.universe){
                        case 'standard':
                            desc.append($(`<span>${loc(`resource_${name}_desc_s`,[+((darkEffect('standard') - 1) * 100).toFixed(2)])}</span>`));
                            break;
        
                        case 'evil':
                            desc.append($(`<span>${loc(`resource_${name}_desc_e`,[+((darkEffect('evil') - 1) * 100).toFixed(2),+((darkEffect('evil',true) - 1) * 100).toFixed(2)])}</span>`));
                            break;
        
                        case 'micro':
                            desc.append($(`<span>${loc(`resource_${name}_desc_m`,[darkEffect('micro',false),darkEffect('micro',true)])}</span>`));
                            break;
        
                        case 'heavy':
                            let hDE = darkEffect('heavy');
                            let space = 0.25 + (0.5 * hDE);
                            let int = 0.2 + (0.3 * hDE);
                            desc.append($(`<span>${loc(`resource_${name}_desc_h`,[+(space * 100).toFixed(4),+(int * 100).toFixed(4)])}</span>`));
                            break;
        
                        case 'antimatter':
                            desc.append($(`<span>${loc(`resource_${name}_desc_a`,[+((darkEffect('antimatter') - 1) * 100).toFixed(2)])}</span>`));
                            break;

                        case 'magic':
                            desc.append($(`<span>${loc(`resource_${name}_desc_mg`,[loc('resource_Mana_name'),+((darkEffect('magic') - 1) * 100).toFixed(2)])}</span>`));
                            break;
                    }
                }
                break;
    
            case 'Harmony':
                desc.append($(`<span>${loc(`resource_${name}_desc`,[global.race.universe === 'standard' ? 0.1 : 1, harmonyEffect()])}</span>`));
                break;

            case 'AICore':
                {
                    let bonus = +((1 - (0.99 ** global.prestige.AICore.count)) * 100).toFixed(2);
                    desc.append($(`<span>${loc(`resource_${name}_desc`,[bonus])}</span>`));
                }
                break;

            case 'Supercoiled':
                {
                    let coiled = global.prestige.Supercoiled.count;
                    let bonus = (coiled / (coiled + 5000)) * 100;
                    desc.append($(`<span>${loc(`resource_${name}_desc`,[+bonus.toFixed(2)])}</span>`));
                    if (global.genes.hasOwnProperty('trader') && global.genes.trader >= 2){
                        let trade = (coiled / (coiled + 500)) * 100;
                        desc.append($(`<span> ${loc(`resource_${name}_trade_desc`,[+trade.toFixed(2)])}</span>`));
                    }
                }
                break;
        }
        return desc;
    });
}

function exportRouteEnabled(route){
    let routeCap = global.tech.currency >= 6 ? -1000000 : (global.tech.currency >= 4 ? -100 : -25);
    if (global.race['banana']){
        let exporting = false;
        Object.keys(global.resource).forEach(function(res){
            if (global.resource[res].hasOwnProperty('trade') && global.resource[res].trade < 0){
                exporting = res;
            }
        });
        if (exporting && exporting !== route){
            return false;
        }
        routeCap = global.tech.currency >= 6 ? -1000000 : (global.tech.currency >= 4 ? -25 : -10);
    }
    if (global.resource[route].trade <= routeCap){
        return false;
    }
    return true;
}

function importRouteEnabled(route){
    let routeCap = global.tech.currency >= 6 ? 1000000 : (global.tech.currency >= 4 ? 100 : 25);
    if (global.resource[route].trade >= routeCap){
        return false;
    }
    return true;
}

export function marketItem(mount,market_item,name,color,full){
    if (!global.settings.tabLoad && (global.settings.civTabs !== 4 || global.settings.marketTabs !== 0)){
        return;
    }

    if ((global.race['artifical'] || global.race['fasting']) && name === 'Food'){
        return;
    }

    if (full){
        market_item.append($(`<h3 class="res has-text-${color}">{{ r.name | namespace }}</h3>`));
    }

    if (!global.race['no_trade']){
        market_item.append($(`<span class="buy"><span class="has-text-success">${loc('resource_market_buy')}</span></span>`));
        market_item.append($(`<span role="button" class="order" @click="purchase('${name}')">\${{ r.value | buy }}</span>`));
        
        market_item.append($(`<span class="sell"><span class="has-text-danger">${loc('resource_market_sell')}</span></span>`));
        market_item.append($(`<span role="button" class="order" @click="sell('${name}')">\${{ r.value | sell }}</span>`));
    }

    if (full && ((global.race['banana'] && name === 'Food') || (global.tech['trade'] && !global.race['terrifying']))){
        let trade = $(`<span class="trade" v-show="m.active"><span class="has-text-warning">${loc('resource_market_routes')}</span></span>`);
        market_item.append(trade);
        trade.append($(`<b-tooltip :label="aSell('${name}')" position="is-bottom" size="is-small" multilined animated><span role="button" aria-label="export ${global.resource[name].name}" class="sub has-text-danger" @click="autoSell('${name}')"><span>-</span></span></b-tooltip>`));
        trade.append($(`<span class="current" v-html="$options.filters.trade(r.trade)"></span>`));
        trade.append($(`<b-tooltip :label="aBuy('${name}')" position="is-bottom" size="is-small" multilined animated><span role="button" aria-label="import ${global.resource[name].name}" class="add has-text-success" @click="autoBuy('${name}')"><span>+</span></span></b-tooltip>`));
        trade.append($(`<span role="button" class="zero has-text-advanced" @click="zero('${name}')">${loc('cancel_routes')}</span>`));
        tradeRouteColor(name);
    }
    
    vBind({
        el: mount,
        data: { 
            r: global.resource[name],
            m: global.city.market
        },
        methods: {
            aSell(res){
                let unit = tradeRatio[res] === 1 ? loc('resource_market_unit') : loc('resource_market_units');
                let price = tradeSellPrice(res);
                let rate = tradeRatio[res];
                if (global.stats.achieve.hasOwnProperty('trade')){
                    let rank = global.stats.achieve.trade.l;
                    if (rank > 5){ rank = 5; }
                    rate *= 1 - (rank / 100);
                }
                rate = +(rate).toFixed(3);
                return loc('resource_market_auto_sell_desc',[rate,unit,price]);
            },
            aBuy(res){
                let rate = tradeRatio[res];
                let dealVal = govActive('dealmaker',0);
                if (dealVal){
                    rate *= 1 + (dealVal / 100);
                }
                if (global.race['persuasive']){
                    rate *= 1 + (global.race['persuasive'] / 100);
                }
                if (astrologySign() === 'capricorn'){
                    rate *= 1 + (astroVal('capricorn')[0] / 100);
                }
                if (global.race['ocular_power'] && global.race['ocularPowerConfig'] && global.race.ocularPowerConfig.c){
                    let trade = OCULAR_POWER_CHARM_BASE * (traits.ocular_power.vars()[1] / 100);
                    rate *= 1 + (trade / 100);
                }
                if (global.race['devious']){
                    rate *= 1 - (traits.devious.vars()[0] / 100);
                }
                if (global.race['merchant']){
                    rate *= 1 + (traits.merchant.vars()[1] / 100);
                }
                let fathom = fathomCheck('goblin');
                if (fathom > 0){
                    rate *= 1 + (traits.merchant.vars(1)[1] / 100 * fathom);
                }
                if (global.genes['trader']){
                    let mastery = calc_mastery();
                    rate *= 1 + (mastery / 100);
                }
                if (global.stats.achieve.hasOwnProperty('trade')){
                    let rank = global.stats.achieve.trade.l;
                    if (rank > 5){ rank = 5; }
                    rate *= 1 + (rank / 50);
                }
                if (global.race['truepath']){
                    rate *= 1 - (global.civic.foreign.gov3.hstl / 101);
                }
                rate = +(rate).toFixed(3);
                let unit = rate === 1 ? loc('resource_market_unit') : loc('resource_market_units');
                let price = tradeBuyPrice(res);
                return loc('resource_market_auto_buy_desc',[rate,unit,price]);
            },
            purchase(res){
                if (!global.race['no_trade'] && !global.settings.pause){
                    let qty = global.city.market.qty;
                    let value = global.resource[res].value;
                    if (global.race['arrogant']){
                        value *= 1 + (traits.arrogant.vars()[0] / 100);
                    }
                    if (global.race['conniving']){
                        value *= 1 - (traits.conniving.vars()[0] / 100);
                    }
                    let fathom = fathomCheck('imp');
                    if (fathom > 0){
                        value *= 1 - (traits.conniving.vars(1)[0] / 100 * fathom);
                    }
                    let capRoom = global.resource[res].max < 0 ? qty : (global.resource[res].max - global.resource[res].amount);
                    let amount = Math.floor(Math.min(qty, global.resource.Money.amount / value, capRoom));
                    if (amount > 0){
                        global.resource[res].amount += amount;
                        global.resource.Money.amount -= Math.round(value * amount);

                        global.resource[res].value += Number((amount / Math.rand(1000,10000)).toFixed(2));
                    }
                }
            },
            sell(res){
                if (!global.race['no_trade'] && !global.settings.pause){
                    let qty = global.city.market.qty;
                    let divide = 4;
                    if (global.race['merchant']){
                        divide *= 1 - (traits.merchant.vars()[0] / 100);
                    }
                    let gobFathom = fathomCheck('goblin');
                    if (gobFathom > 0){
                        divide *= 1 - (traits.merchant.vars(1)[0] / 100 * gobFathom);
                    }
                    if (global.race['asymmetrical']){
                        divide *= 1 + (traits.asymmetrical.vars()[0] / 100);
                    }
                    if (global.race['conniving']){
                        divide *= 1 - (traits.conniving.vars()[1] / 100);
                    }
                    let impFathom = fathomCheck('imp');
                    if (impFathom > 0){
                        divide *= 1 - (traits.conniving.vars(1)[1] / 100 * impFathom);
                    }
                    let price = global.resource[res].value / divide;
                    let amount = Math.floor(Math.min(qty, global.resource[res].amount,
                      (global.resource.Money.max - global.resource.Money.amount) / price));
                    if (amount > 0) {
                        global.resource[res].amount -= amount;
                        global.resource.Money.amount += Math.round(price * amount);

                        global.resource[res].value -= Number((amount / Math.rand(1000,10000)).toFixed(2));
                        if (global.resource[res].value < Number(resource_values[res] / 2)){
                            global.resource[res].value = Number(resource_values[res] / 2);
                        }
                    }
                }
            },
            autoBuy(res, keyMult = keyMultiplier()){
                for (let i=0; i<keyMult; i++){
                    if (govActive('dealmaker',0)){
                        let exporting = 0;
                        let importing = 0;
                        Object.keys(global.resource).forEach(function(res){
                            if (global.resource[res].hasOwnProperty('trade') && global.resource[res].trade < 0){
                                exporting -= global.resource[res].trade;
                            }
                            if (global.resource[res].hasOwnProperty('trade') && global.resource[res].trade > 0){
                                importing += global.resource[res].trade;
                            }
                        });
                        if (exporting <= importing){
                            break;
                        }
                    }
                    if (global.resource[res].trade >= 0){
                        if (importRouteEnabled(res) && global.city.market.trade < global.city.market.mtrade){
                            global.city.market.trade++;
                            global.resource[res].trade++;
                        }
                        else {
                            break;
                        }
                    }
                    else {
                        global.city.market.trade--;
                        global.resource[res].trade++;
                    }
                }
                tradeRouteColor(res);
            },
            autoSell(res, keyMult = keyMultiplier()){
                for (let i=0; i<keyMult; i++){
                    if (global.resource[res].trade <= 0){
                        if (exportRouteEnabled(res) && global.city.market.trade < global.city.market.mtrade){
                            global.city.market.trade++;
                            global.resource[res].trade--;
                        }
                        else {
                            break;
                        }
                    }
                    else {
                        global.city.market.trade--;
                        global.resource[res].trade--;
                    }
                }
                tradeRouteColor(res);
            },
            zero(res){
                if (global.resource[res].trade > 0){
                    this.autoSell(res, global.resource[res].trade);
                }
                else if (global.resource[res].trade < 0){
                    this.autoBuy(res, -global.resource[res].trade);
                }
            }
        },
        filters: {
            buy(value){
                if (global.race['arrogant']){
                    value *= 1 + (traits.arrogant.vars()[0] / 100);
                }
                return sizeApproximation(value * global.city.market.qty,0);
            },
            sell(value){
                let divide = 4;
                if (global.race['merchant']){
                    divide *= 1 - (traits.merchant.vars()[0] / 100);
                }
                let fathom = fathomCheck('goblin');
                if (fathom > 0){
                    divide *= 1 - (traits.merchant.vars(1)[0] / 100 * fathom);
                }
                if (global.race['devious']){
                    divide *= 1 - (traits.devious.vars()[0] / 100);
                }
                if (global.race['asymmetrical']){
                    divide *= 1 + (traits.asymmetrical.vars()[0] / 100);
                }
                return sizeApproximation(value * global.city.market.qty / divide,0);
            },
            trade(val){
                if (name === 'Stone' && (val === 31 || val === -31)){
                    let trick = trickOrTreat(3,12,false);
                    if (trick.length > 0){
                        return trick;
                    }
                }
                if (val < 0){
                    val = 0 - val;
                    return `-${val}`;
                }
                else if (val > 0){
                    return `+${val}`;
                }
                else {
                    return 0;
                }
            },
            namespace(val){
                return val.replace("_", " ");
            }
        }
    });
}

export function initGalaxyTrade(){
    if (!global.settings.tabLoad && (global.settings.civTabs !== 4 || global.settings.marketTabs !== 0)){
        return;
    }
    $('#market').append($(`<div id="galaxyTrade" v-show="t.xeno && t.xeno >= 5" class="market-header galaxyTrade"><h2 class="is-sr-only">${loc('galaxy_trade')}</h2></div>`));
    galacticTrade();
}

export function galaxyOffers(){
    let offers = [
        {
            buy: { res: 'Deuterium', vol: 5 },
            sell: { res: 'Helium_3', vol: 25 }
        },
        {
            buy: { res: 'Neutronium', vol: 2.5 },
            sell: { res: 'Copper', vol: 200 }
        },
        {
            buy: { res: 'Adamantite', vol: 3 },
            sell: { res: 'Iron', vol: 300 }
        },
        {
            buy: { res: 'Elerium', vol: 1 },
            sell: { res: 'Oil', vol: 125 }
        },
        {
            buy: { res: 'Nano_Tube', vol: 10 },
            sell: { res: 'Titanium', vol: 20 }
        },
        {
            buy: { res: 'Graphene', vol: 25 },
            sell: { res: global.race['kindling_kindred'] || global.race['smoldering'] ? (global.race['smoldering'] ? 'Chrysotile' : 'Stone') : 'Lumber', vol: 1000 }
        },
        {
            buy: { res: 'Stanene', vol: 40 },
            sell: { res: 'Aluminium', vol: 800 }
        },
        {
            buy: { res: 'Bolognium', vol: 0.75 },
            sell: { res: 'Uranium', vol: 4 }
        },
        {
            buy: { res: 'Vitreloy', vol: 1 },
            sell: { res: 'Infernite', vol: 1 }
        }
    ];
    return offers;
}
