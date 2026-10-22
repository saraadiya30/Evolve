// Contains: initOcoinAlchemy(), loadOcoinAlchemy(), drawOcoinAlchemy(), fastLoopOcoinAlchemy()
// Resources > Ocoin tab: like Alchemy, but it pays with Ocoin (free Ocoin only, what is locked in stock orders cannot be used)
// and works for every resource that has a price (see ocoin_alchemy_core.js), not only the ones in tradeRatio.
import { global, breakdown, tmp_vars, keyMultiplier } from '../core/vars.js';
import { vBind, clearElement } from '../functions/dom_helpers.js';
import { popover } from '../functions/popover.js';
import { loc } from '../core/locale.js';
import { modRes, timeScale } from '../functions/resource_mod.js';
import { stockFlags } from '../stocks/stocks_core.js';
import { ocoinAlchemyPrice, ocoinAlchemyList, ocoinAlchemyStep } from '../stocks/ocoin_alchemy_core.js';
import { aetherFormat } from './aether_alchemy.js';

const TAB_INDEX = 5;

function ensureState(){
    if (!global.race['ocoinAlchemy']){
        global.race['ocoinAlchemy'] = {};
    }
    if (!global.stocks || typeof global.stocks.ocoin !== 'number'){
        global['stocks'] = Object.assign({}, global.stocks, { ocoin: 0 });
    }
}

export function initOcoinAlchemy(){
    if (!global.settings.tabLoad && (global.settings.civTabs !== 4 || global.settings.marketTabs !== TAB_INDEX)){
        return;
    }
    clearElement($('#resOcoinAlchemy'));
}

// Header row: free Ocoin and what the current allocation costs per second.
function loadHeader(){
    let head = $(`<div id="ocoinAlchemyHead" class="market-item"><h3 class="res has-text-info">${loc('resource_Ocoin_name')}</h3></div>`);
    $('#resOcoinAlchemy').append(head);
    head.append($(`<span class="current">{{ free() }}</span>`));
    head.append($(`<span class="current has-text-warning" style="margin-left:.75rem;">${loc('ocoin_alchemy_cost')} {{ cost() }}</span>`));
    vBind({
        el: `#ocoinAlchemyHead`,
        data: { st: global.stocks, a: global.race.ocoinAlchemy },
        methods: {
            free(){
                return aetherFormat(global.stocks.ocoin);
            },
            cost(){
                let total = 0;
                Object.keys(global.race.ocoinAlchemy).forEach(function(res){
                    if (global.resource[res] && global.resource[res].display){
                        total += Number(global.race.ocoinAlchemy[res]) * ocoinAlchemyPrice(res);
                    }
                });
                return aetherFormat(total);
            }
        }
    });
}

export function loadOcoinAlchemy(name,color){
    if (!global.settings.tabLoad && (global.settings.civTabs !== 4 || global.settings.marketTabs !== TAB_INDEX)){
        return;
    }
    ensureState();
    let alchemy = $(`<div id="ocoinAlch${name}" class="market-item" v-show="r.display"><h3 class="res has-text-${color}">${global.resource[name].name}</h3></div>`);
    $('#resOcoinAlchemy').append(alchemy);

    let res = $(`<span class="trade"></span>`);
    alchemy.append(res);
    res.append($(`<span role="button" aria-label="buy less ${global.resource[name].name}" class="sub has-text-danger" @click="subSpell('${name}')"><span>&laquo;</span></span>`));
    res.append($(`<span class="current">{{ a.${name} }}</span>`));
    res.append($(`<span role="button" aria-label="buy more ${global.resource[name].name}" class="add has-text-success" @click="addSpell('${name}')"><span>&raquo;</span></span>`));

    if (!global.race.ocoinAlchemy.hasOwnProperty(name)){
        global.race.ocoinAlchemy[name] = 0;
    }

    vBind({
        el: `#ocoinAlch${name}`,
        data: {
            r: global.resource[name],
            a: global.race.ocoinAlchemy
        },
        methods: {
            addSpell(spell){
                global.race.ocoinAlchemy[spell] += keyMultiplier();
            },
            subSpell(spell){
                let change = Math.min(global.race.ocoinAlchemy[spell], keyMultiplier());
                if (change > 0){
                    global.race.ocoinAlchemy[spell] -= change;
                }
            }
        }
    });

    popover(`ocoinAlch${name}`,function(){
        let price = ocoinAlchemyPrice(name);
        let perSec = global.race.ocoinAlchemy[name] * price;
        return $(`<div>${loc('resource_ocoin_alchemy',[aetherFormat(price), global.resource[name].name])}</div><div class="has-text-warning">${loc('ocoin_alchemy_cost')} ${aetherFormat(perSec)}</div>`);
    },
    {
        elm: `#ocoinAlch${name} h3`
    });
}

// Draws the whole tab: header + one row per eligible resource. Rows use v-show r.display, so a resource that unlocks
// later just appears; nothing needs redrawing.
export function drawOcoinAlchemy(){
    if (!global.settings.tabLoad && (global.settings.civTabs !== 4 || global.settings.marketTabs !== TAB_INDEX)){
        return;
    }
    initOcoinAlchemy();
    ensureState();
    let list = tmp_vars.hasOwnProperty('resource') ? ocoinAlchemyList(tmp_vars.resource) : [];
    // Every key must exist BEFORE the first vBind: Vue 2 only makes the keys that exist at bind time reactive, so a key added
    // afterwards would change in the data but the number on screen would never update (the buttons look dead).
    list.forEach(function(name){
        if (!global.race.ocoinAlchemy.hasOwnProperty(name)){
            global.race.ocoinAlchemy[name] = 0;
        }
    });
    loadHeader();
    list.forEach(function(name){
        loadOcoinAlchemy(name, tmp_vars.resource[name].color);
    });
}

export function fastLoopOcoinAlchemy($ctx){
    let alloc = global.race['ocoinAlchemy'];
    if (!alloc || !global.stocks || !(global.stocks.ocoin > 0)){
        return;
    }
    let scale = stockFlags.prod ? timeScale() : 1;
    Object.keys(alloc).forEach(function(res){
        if (!(alloc[res] > 0) || !global.resource[res] || !global.resource[res].display){
            return;
        }
        let price = ocoinAlchemyPrice(res);
        // real storage left (not the temporary buffer of the loop), so no Ocoin is spent on units that would be thrown away
        let cap = global.resource[res].max;
        let room = cap >= 0 ? Math.max(0, cap - global.resource[res].amount) : -1;
        let buy = ocoinAlchemyStep(Number(alloc[res]), $ctx.time_multiplier, scale, price, global.stocks.ocoin, room);
        if (buy.units > 0){
            // bought, not produced: no stock production bonus (same as trade routes)
            modRes(res, buy.units, false, true);
            global.stocks.ocoin = Math.max(0, global.stocks.ocoin - buy.cost);
            if (breakdown.p.consume && breakdown.p.consume[res]){
                breakdown.p.consume[res][loc('tab_ocoin_alchemy')] = buy.units / $ctx.time_multiplier;
            }
        }
    });
}
