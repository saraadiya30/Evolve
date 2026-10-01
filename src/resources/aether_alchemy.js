// Contains: loadAlchemy(), aetherLetterCode(), aetherFormat(), aetherMoneyUnitOptions(), initAether(), faithTempleCount(), faithBonus(), templePlasmidBonus()
import { global, keyMultiplier } from '../core/vars.js';
import { vBind, clearElement } from '../functions/dom_helpers.js';
import { popover } from '../functions/popover.js';
import { loc } from '../core/locale.js';
import { AETHER_OCOIN_RATE } from '../stocks/stocks_core.js';
import { templeCount } from '../actions/core/action_costs.js';
import { workerScale } from '../civics/jobs/job_definitions.js';
import { highPopAdjust } from '../functions/adjusters_basic.js';
import { traits } from '../core/registries.js';
import { fathomCheck } from '../races/trait_logic/fathom_check.js';
import { govEffect } from '../civics/civics.js';
import { aether_small_affix, aether_big_affix } from './resources.js';
import { tradeRatio } from '../config/constants.js';

// Functions extracted from resources.js (source order preserved). resources.js still re-exports the previously exported names.


export function loadAlchemy(name,color,basic){
    if (!global.settings.tabLoad && (global.settings.civTabs !== 4 || global.settings.marketTabs !== 4)){
        return;
    }
    else if (global.race['artifical'] && name === 'Food'){
        return;
    }
    if (global.tech['alchemy'] && (basic || global.tech.alchemy >= 2) && name !== 'Crystal'){
        let alchemy = $(`<div id="alchemy${name}" class="market-item" v-show="r.display"><h3 class="res has-text-${color}">${global.resource[name].name}</h3></div>`);
        $('#resAlchemy').append(alchemy);

        let res = $(`<span class="trade"></span>`);
        alchemy.append(res);

        res.append($(`<span role="button" aria-label="transmute less ${global.resource[name].name}" class="sub has-text-danger" @click="subSpell('${name}')"><span>&laquo;</span></span>`));
        res.append($(`<span class="current">{{ a.${name} }}</span>`));
        res.append($(`<span role="button" aria-label="transmute more ${global.resource[name].name}" class="add has-text-success" @click="addSpell('${name}')"><span>&raquo;</span></span>`));

        if (!global.race.alchemy.hasOwnProperty(name)){
            global.race.alchemy[name] = 0;
        }

        vBind({
            el: `#alchemy${name}`,
            data: {
                r: global.resource[name],
                a: global.race.alchemy
            },
            methods: {
                addSpell(spell){
                    let keyMult = keyMultiplier();
                    let change = Math.min(Math.floor(global.resource.Mana.diff), keyMult);
                    if (change > 0) {
                        global.race.alchemy[spell] += change;
                        global.resource.Mana.diff -= change;
                    }
                },
                subSpell(spell){
                    let keyMult = keyMultiplier();
                    let change = Math.min(global.race.alchemy[spell], keyMult);
                    if (change > 0) {
                        global.race.alchemy[spell] -= change;
                        global.resource.Mana.diff += change;
                    }
                },
            }
        });

        popover(`alchemy${name}`,function(){
            let rate = basic && global.tech.alchemy >= 2 ? tradeRatio[name] * 8 : tradeRatio[name] * 2;
            if (global.race['witch_hunter']){ rate *= 3; }
            if (global.stats.achieve['soul_sponge'] && global.stats.achieve.soul_sponge['mg']){
                rate *= global.stats.achieve.soul_sponge.mg + 1;
            }
            return $(`<div>${loc('resource_alchemy',[1,loc(`resource_Mana_name`),0.15,loc(`resource_Crystal_name`),+rate.toFixed(2), global.resource[name].name])}</div>`);
        },
        {
            elm: `#alchemy${name} h3`
        });
    }
}

function aetherLetterCode(n){
    let first = Math.floor(n / 26);
    let second = n % 26;
    return String.fromCharCode(97 + first) + String.fromCharCode(97 + second);
}

export function aetherFormat(value){
    if (value === Infinity || value === -Infinity){ return value > 0 ? '∞' : '-∞'; }
    if (!value || !isFinite(value)){ return '0'; }
    let sign = value < 0 ? '-' : '';
    let abs = Math.abs(value);

    if (abs < 1){
        if (abs >= 0.001){
            return sign + (+abs.toFixed(6)).toString();
        }
        let oom = Math.floor(Math.log10(abs));
        let trueMod = ((oom % 3) + 3) % 3;
        let snapped = oom - trueMod;
        let tier = -snapped / 3;
        let scaled = abs / (10 ** snapped);
        let suffix = tier <= aether_small_affix.length ? aether_small_affix[tier - 1] : aetherLetterCode(tier - aether_small_affix.length - 1);
        return sign + (+scaled.toFixed(3)) + suffix;
    }

    if (abs < 1000){
        return sign + (+abs.toFixed(3)).toString();
    }

    let oom = Math.floor(Math.log10(abs));
    let snapped = oom - (oom % 3);
    let tier = snapped / 3;
    let scaled = abs / (10 ** snapped);
    let suffix = tier <= aether_big_affix.length ? aether_big_affix[tier - 1] : aetherLetterCode(tier - aether_big_affix.length - 1);
    return sign + (+scaled.toFixed(3)) + suffix;
}

function aetherMoneyUnitOptions(){
    let tiers = [
        ['-12', loc('aether_unit_pico_short')],
        ['-9', loc('aether_unit_nano_short')],
        ['-6', loc('aether_unit_micro_short')],
        ['-3', loc('aether_unit_milli_short')],
        ['0', loc('aether_unit_none')],
        ['3', aether_big_affix[0]],
        ['6', aether_big_affix[1]],
        ['9', aether_big_affix[2]],
        ['12', aether_big_affix[3]],
        ['15', aether_big_affix[4]]
    ];
    let opts = '';
    tiers.forEach(function(tier){
        opts += `<option value="${tier[0]}">${tier[1]}</option>`;
    });
    return opts;
}

export function initAether(){
    clearElement($('#aether'));

    if (!global.prestige.hasOwnProperty('Aether')){
        return;
    }

    if (typeof global.settings.aetherMoneyQtyCoef === 'undefined'){
        global.settings.aetherMoneyQtyCoef = 1;
        global.settings.aetherMoneyQtyExp = -12;
    }
    if (typeof global.settings.aetherMoneyRateCoef === 'undefined'){
        global.settings.aetherMoneyRateCoef = 0;
        global.settings.aetherMoneyRateExp = -12;
    }
    if (typeof global.settings.aetherOcoinQtyCoef === 'undefined'){
        global.settings.aetherOcoinQtyCoef = 1;
        global.settings.aetherOcoinQtyExp = -12;
    }
    ['aetherPlasmidRate','aetherPhageRate','aetherPower','aetherStorage','aetherSpeed','aetherMorale','aetherProd'].forEach(function(k){
        if (typeof global.settings[k] === 'undefined'){
            global.settings[k] = 0;
        }
    });
    if (typeof global.settings.aetherCustomRate === 'undefined'){
        global.settings.aetherCustomRate = 1000;
    }

    let wrap = $(`<div id="aetherExchange"></div>`);
    $('#aether').append(wrap);

    wrap.append($(`<h3 class="has-text-info" style="margin:0 0 .5rem 1rem;">${loc('resource_Aether_name')}: <span>{{ p.Aether.count | round }}</span></h3>`));

    let genRow = $(`<div id="aetherGen" class="market-item" style="margin-bottom:.5rem;"><h3 class="res has-text-info">${loc('aether_gen_label')}</h3></div>`);
    wrap.append(genRow);
    genRow.append($(`<b-tooltip label="${loc('aether_gen_custom')}" position="is-bottom" size="is-small" multilined animated><label class="checkbox" style="margin-right:.5rem;white-space:nowrap;"><input type="checkbox" v-model="s.aetherCustomRateOn"> ${loc('aether_gen_custom_short')}</label></b-tooltip>`));
    genRow.append($(`<input type="number" min="0" step="1" v-model.number="s.aetherCustomRate" @change="clampNonNeg('aetherCustomRate')" style="width:6rem;margin-right:.5rem;background:#1a1a1a;color:inherit;border:1px solid #555;">`));
    genRow.append($(`<span class="current infoOnly">{{ genLabel() }}</span>`));

    let plasmidRow = $(`<div id="aetherPlasmid" class="market-item" style="margin-bottom:.5rem;"><h3 class="res has-text-info">${loc('resource_Plasmid_name')}</h3></div>`);
    wrap.append(plasmidRow);
    plasmidRow.append($(`<span class="buy"><span class="has-text-success">${loc('resource_market_buy')}</span></span>`));
    plasmidRow.append($(`<b-tooltip label="${loc('aether_exchange_button',[1,loc('resource_Aether_name'),1000,loc('resource_Plasmid_name')])}" position="is-bottom" size="is-small" multilined animated><span role="button" class="order" :class="{ off: p.Aether.count < 1 }" @click="buyPlasmid()">1000</span></b-tooltip>`));
    plasmidRow.append($(`<span class="trade"><span class="has-text-warning">${loc('aether_exchange_route')}</span><b-tooltip :label="stepInfo(1)" position="is-bottom" size="is-small" multilined animated><span role="button" aria-label="decrease plasmid rate" class="sub has-text-danger" @click="lessPlasmidRate"><span>-</span></span></b-tooltip><span class="current">{{ s.aetherPlasmidRate }}</span><b-tooltip :label="stepInfo(1)" position="is-bottom" size="is-small" multilined animated><span role="button" aria-label="increase plasmid rate" class="add has-text-success" @click="morePlasmidRate"><span>+</span></span></b-tooltip></span>`));

    let phageRow = $(`<div id="aetherPhage" class="market-item" style="margin-bottom:.5rem;"><h3 class="res has-text-info">${loc('resource_Phage_name')}</h3></div>`);
    wrap.append(phageRow);
    phageRow.append($(`<span class="buy"><span class="has-text-success">${loc('resource_market_buy')}</span></span>`));
    phageRow.append($(`<b-tooltip label="${loc('aether_exchange_button',[1,loc('resource_Aether_name'),100,loc('resource_Phage_name')])}" position="is-bottom" size="is-small" multilined animated><span role="button" class="order" :class="{ off: p.Aether.count < 1 }" @click="buyPhage()">100</span></b-tooltip>`));
    phageRow.append($(`<span class="trade"><span class="has-text-warning">${loc('aether_exchange_route')}</span><b-tooltip :label="stepInfo(1)" position="is-bottom" size="is-small" multilined animated><span role="button" aria-label="decrease phage rate" class="sub has-text-danger" @click="lessPhageRate"><span>-</span></span></b-tooltip><span class="current">{{ s.aetherPhageRate }}</span><b-tooltip :label="stepInfo(1)" position="is-bottom" size="is-small" multilined animated><span role="button" aria-label="increase phage rate" class="add has-text-success" @click="morePhageRate"><span>+</span></span></b-tooltip></span>`));

    let moneyBuyRow = $(`<div id="aetherMoneyBuy" class="market-item" style="margin-bottom:.5rem;"><h3 class="res has-text-info">${loc('resource_Money_name')}</h3></div>`);
    wrap.append(moneyBuyRow);
    moneyBuyRow.append($(`<input type="number" min="0" step="any" v-model.number="s.aetherMoneyQtyCoef" @change="clampNonNeg('aetherMoneyQtyCoef')" style="width:3.5rem;margin-right:.25rem;background:#1a1a1a;color:inherit;border:1px solid #555;">`));
    moneyBuyRow.append($(`<select v-model.number="s.aetherMoneyQtyExp" style="background:#1a1a1a;color:inherit;border:1px solid #555;margin-right:.5rem;">${aetherMoneyUnitOptions()}</select>`));
    moneyBuyRow.append($(`<b-tooltip :label="moneyLabel()" position="is-bottom" size="is-small" multilined animated><span role="button" class="order has-text-success" :class="{ off: p.Aether.count < moneyQty() }" @click="buyMoney()">${loc('resource_market_buy')}</span></b-tooltip>`));

    let moneyRateRow = $(`<div id="aetherMoneyRate" class="market-item" style="margin-bottom:.5rem;"><h3 class="res has-text-info">${loc('aether_money_rate_label')}</h3></div>`);
    wrap.append(moneyRateRow);
    moneyRateRow.append($(`<input type="number" min="0" step="any" v-model.number="s.aetherMoneyRateCoef" @change="clampNonNeg('aetherMoneyRateCoef')" style="width:3.5rem;margin-right:.25rem;background:#1a1a1a;color:inherit;border:1px solid #555;">`));
    moneyRateRow.append($(`<select v-model.number="s.aetherMoneyRateExp" style="background:#1a1a1a;color:inherit;border:1px solid #555;margin-right:.5rem;">${aetherMoneyUnitOptions()}</select>`));
    moneyRateRow.append($(`<span class="current infoOnly">{{ moneyRateLabel() }}</span>`));

    // Ocoin (stock market currency): a one-off purchase, there is no rate/tick for it
    let ocoinBuyRow = $(`<div id="aetherOcoinBuy" class="market-item" style="margin-bottom:.5rem;"><h3 class="res has-text-info">${loc('resource_Ocoin_name')}</h3></div>`);
    wrap.append(ocoinBuyRow);
    ocoinBuyRow.append($(`<input type="number" min="0" step="any" v-model.number="s.aetherOcoinQtyCoef" @change="clampNonNeg('aetherOcoinQtyCoef')" style="width:3.5rem;margin-right:.25rem;background:#1a1a1a;color:inherit;border:1px solid #555;">`));
    ocoinBuyRow.append($(`<select v-model.number="s.aetherOcoinQtyExp" style="background:#1a1a1a;color:inherit;border:1px solid #555;margin-right:.5rem;">${aetherMoneyUnitOptions()}</select>`));
    ocoinBuyRow.append($(`<b-tooltip :label="ocoinLabel()" position="is-bottom" size="is-small" multilined animated><span role="button" class="order has-text-success" :class="{ off: p.Aether.count < ocoinQty() }" @click="buyOcoin()">${loc('resource_market_buy')}</span></b-tooltip>`));

    let powerRow = $(`<div id="aetherPower" class="market-item" style="margin-bottom:.5rem;"><h3 class="res has-text-info">${loc('aether_power_label')}</h3></div>`);
    wrap.append(powerRow);
    powerRow.append($(`<span class="trade" style="margin-left:0"><span class="has-text-warning">${loc('aether_exchange_route')}</span><b-tooltip :label="stepInfo(0.00001)" position="is-bottom" size="is-small" multilined animated><span role="button" aria-label="decrease power draw" class="sub has-text-danger" @click="lessPower"><span>-</span></span></b-tooltip><span class="current">{{ s.aetherPower | round }}</span><b-tooltip :label="stepInfo(0.00001)" position="is-bottom" size="is-small" multilined animated><span role="button" aria-label="increase power draw" class="add has-text-success" @click="morePower"><span>+</span></span></b-tooltip></span>`));
    powerRow.append($(`<b-tooltip :label="'aether_exchange_power' | label([s.aetherPower * 100000000])" position="is-bottom" size="is-small" multilined animated><span class="order">${loc('aether_info_label')}</span></b-tooltip>`));

    let storageRow = $(`<div id="aetherStorage" class="market-item" style="margin-bottom:.5rem;"><h3 class="res has-text-info">${loc('tab_storage')}</h3></div>`);
    wrap.append(storageRow);
    storageRow.append($(`<span class="trade" style="margin-left:0"><span class="has-text-warning">${loc('aether_exchange_route')}</span><b-tooltip :label="stepInfo(0.00000000001)" position="is-bottom" size="is-small" multilined animated><span role="button" aria-label="decrease storage draw" class="sub has-text-danger" @click="lessStorage"><span>-</span></span></b-tooltip><span class="current">{{ s.aetherStorage | round }}</span><b-tooltip :label="stepInfo(0.00000000001)" position="is-bottom" size="is-small" multilined animated><span role="button" aria-label="increase storage draw" class="add has-text-success" @click="moreStorage"><span>+</span></span></b-tooltip></span>`));
    storageRow.append($(`<b-tooltip :label="'aether_exchange_storage' | label([(s.aetherStorage / 0.00000000001) * 100])" position="is-bottom" size="is-small" multilined animated><span class="order">${loc('aether_info_label')}</span></b-tooltip>`));

    let speedRow = $(`<div id="aetherSpeed" class="market-item" style="margin-bottom:.5rem;"><h3 class="res has-text-info">${loc('aether_speed_label')}</h3></div>`);
    wrap.append(speedRow);
    speedRow.append($(`<span class="trade" style="margin-left:0"><span class="has-text-warning">${loc('aether_exchange_route')}</span><b-tooltip :label="stepInfo(1)" position="is-bottom" size="is-small" multilined animated><span role="button" aria-label="decrease speed draw" class="sub has-text-danger" @click="lessSpeed"><span>-</span></span></b-tooltip><span class="current">{{ s.aetherSpeed }}</span><b-tooltip :label="stepInfo(1)" position="is-bottom" size="is-small" multilined animated><span role="button" aria-label="increase speed draw" class="add has-text-success" @click="moreSpeed"><span>+</span></span></b-tooltip></span>`));
    speedRow.append($(`<b-tooltip :label="'aether_exchange_speed' | label([s.aetherSpeed + 1])" position="is-bottom" size="is-small" multilined animated><span class="order">${loc('aether_info_label')}</span></b-tooltip>`));

    let moraleRow = $(`<div id="aetherMorale" class="market-item" style="margin-bottom:.5rem;"><h3 class="res has-text-info">${loc('aether_morale_label')}</h3></div>`);
    wrap.append(moraleRow);
    moraleRow.append($(`<span class="trade" style="margin-left:0"><span class="has-text-warning">${loc('aether_exchange_route')}</span><b-tooltip :label="stepInfo(0.00000000001)" position="is-bottom" size="is-small" multilined animated><span role="button" aria-label="decrease morale draw" class="sub has-text-danger" @click="lessMorale"><span>-</span></span></b-tooltip><span class="current">{{ s.aetherMorale | round }}</span><b-tooltip :label="stepInfo(0.00000000001)" position="is-bottom" size="is-small" multilined animated><span role="button" aria-label="increase morale draw" class="add has-text-success" @click="moreMorale"><span>+</span></span></b-tooltip></span>`));
    moraleRow.append($(`<b-tooltip :label="'aether_exchange_morale' | label([(s.aetherMorale / 0.00000000001) * 100])" position="is-bottom" size="is-small" multilined animated><span class="order">${loc('aether_info_label')}</span></b-tooltip>`));

    let prodRow = $(`<div id="aetherProd" class="market-item" style="margin-bottom:.5rem;"><h3 class="res has-text-info">${loc('aether_prod_label')}</h3></div>`);
    wrap.append(prodRow);
    prodRow.append($(`<span class="trade" style="margin-left:0"><span class="has-text-warning">${loc('aether_exchange_route')}</span><b-tooltip :label="stepInfo(0.000000001)" position="is-bottom" size="is-small" multilined animated><span role="button" aria-label="decrease production draw" class="sub has-text-danger" @click="lessProd"><span>-</span></span></b-tooltip><span class="current">{{ s.aetherProd | round }}</span><b-tooltip :label="stepInfo(0.000000001)" position="is-bottom" size="is-small" multilined animated><span role="button" aria-label="increase production draw" class="add has-text-success" @click="moreProd"><span>+</span></span></b-tooltip></span>`));
    prodRow.append($(`<b-tooltip :label="'aether_exchange_prod' | label([(s.aetherProd / 0.000000001) * 100])" position="is-bottom" size="is-small" multilined animated><span class="order">${loc('aether_info_label')}</span></b-tooltip>`));

    vBind({
        el: `#aetherExchange`,
        data: {
            p: global.prestige,
            s: global.settings
        },
        filters: {
            round(n){ return n ? aetherFormat(n) : n; },
            label(key,args){
                let str = loc(key);
                args.forEach(function(a,i){ str = str.replace(`%${i}`, aetherFormat(a)); });
                return str;
            }
        },
        methods: {
            buyPlasmid(){
                let keyMult = keyMultiplier();
                let convert = Math.min(keyMult, Math.floor(global.prestige.Aether.count));
                if (convert > 0){
                    global.prestige.Aether.count -= convert;
                    global.prestige.Plasmid.count += convert * 1000;
                }
            },
            buyPhage(){
                let keyMult = keyMultiplier();
                let convert = Math.min(keyMult, Math.floor(global.prestige.Aether.count));
                if (convert > 0){
                    global.prestige.Aether.count -= convert;
                    global.prestige.Phage.count += convert * 100;
                }
            },
            moneyQty(){
                return global.settings.aetherMoneyQtyCoef * (10 ** global.settings.aetherMoneyQtyExp);
            },
            buyMoney(){
                let qty = global.settings.aetherMoneyQtyCoef * (10 ** global.settings.aetherMoneyQtyExp);
                let convert = Math.min(qty, global.prestige.Aether.count);
                if (convert > 0){
                    global.prestige.Aether.count -= convert;
                    global.resource.Money.amount += convert * 1000000000000000;
                    global.resource.Money.delta += convert * 1000000000000000;
                }
            },
            moneyLabel(){
                let qty = global.settings.aetherMoneyQtyCoef * (10 ** global.settings.aetherMoneyQtyExp);
                return loc('aether_exchange_money',[aetherFormat(qty), aetherFormat(qty * 1000000000000000)]);
            },
            ocoinQty(){
                return global.settings.aetherOcoinQtyCoef * (10 ** global.settings.aetherOcoinQtyExp);
            },
            buyOcoin(){
                let convert = Math.min(this.ocoinQty(), global.prestige.Aether.count);
                if (convert > 0){
                    global.prestige.Aether.count -= convert;
                    // The stock state normally exists already; if the stock tab was never opened, start it with just the balance
                    // (initStocks fills in the rest later).
                    if (!global.stocks || typeof global.stocks.ocoin !== 'number'){
                        global['stocks'] = Object.assign({}, global.stocks, { ocoin: 0 });
                    }
                    global.stocks.ocoin += convert * AETHER_OCOIN_RATE;
                }
            },
            ocoinLabel(){
                let qty = this.ocoinQty();
                return loc('aether_exchange_ocoin',[aetherFormat(qty), aetherFormat(qty * AETHER_OCOIN_RATE)]);
            },
            moneyRateLabel(){
                let rate = global.settings.aetherMoneyRateCoef * (10 ** global.settings.aetherMoneyRateExp);
                return loc('aether_money_rate',[aetherFormat(rate * 1000000000000000)]);
            },
            stepInfo(base){
                return loc('aether_step_info',[aetherFormat(base * keyMultiplier()), loc('resource_Aether_name')]);
            },
            clampNonNeg(key){
                if (!global.settings[key] || global.settings[key] < 0){
                    global.settings[key] = 0;
                }
            },
            genLabel(){
                let rate;
                if (global.settings.aetherCustomRateOn){
                    rate = global.settings.aetherCustomRate || 0;
                }
                else {
                    let plasmid = global.prestige.Plasmid.count || 1;
                    let phage = global.prestige.Phage.count || 1;
                    rate = plasmid * phage;
                }
                return loc('aether_gen_rate',[aetherFormat(rate)]);
            },
            morePower(){
                global.settings.aetherPower = +(global.settings.aetherPower + (0.00001 * keyMultiplier())).toFixed(10);
            },
            lessPower(){
                global.settings.aetherPower = Math.max(0, +(global.settings.aetherPower - (0.00001 * keyMultiplier())).toFixed(10));
            },
            moreStorage(){
                global.settings.aetherStorage = +(global.settings.aetherStorage + (0.00000000001 * keyMultiplier())).toFixed(15);
            },
            lessStorage(){
                global.settings.aetherStorage = Math.max(0, +(global.settings.aetherStorage - (0.00000000001 * keyMultiplier())).toFixed(15));
            },
            morePlasmidRate(){ global.settings.aetherPlasmidRate += keyMultiplier(); },
            lessPlasmidRate(){ global.settings.aetherPlasmidRate = Math.max(0, global.settings.aetherPlasmidRate - keyMultiplier()); },
            morePhageRate(){ global.settings.aetherPhageRate += keyMultiplier(); },
            lessPhageRate(){ global.settings.aetherPhageRate = Math.max(0, global.settings.aetherPhageRate - keyMultiplier()); },
            moreSpeed(){ global.settings.aetherSpeed += keyMultiplier(); },
            lessSpeed(){ global.settings.aetherSpeed = Math.max(0, global.settings.aetherSpeed - keyMultiplier()); },
            moreMorale(){
                global.settings.aetherMorale = +(global.settings.aetherMorale + (0.00000000001 * keyMultiplier())).toFixed(15);
            },
            lessMorale(){
                global.settings.aetherMorale = Math.max(0, +(global.settings.aetherMorale - (0.00000000001 * keyMultiplier())).toFixed(15));
            },
            moreProd(){
                global.settings.aetherProd = +(global.settings.aetherProd + (0.000000001 * keyMultiplier())).toFixed(13);
            },
            lessProd(){
                global.settings.aetherProd = Math.max(0, +(global.settings.aetherProd - (0.000000001 * keyMultiplier())).toFixed(13));
            }
        }
    });
}

export function faithTempleCount(){
    let noEarth = global.race['cataclysm'] || global.race['orbit_decayed'] ? true : false;
    return templeCount(noEarth);
}

export function faithBonus(num_temples = -1){
    if (global.race['no_plasmid'] || global.race.universe === 'antimatter'){
        if (num_temples === -1){
            num_temples = faithTempleCount();
        }

        if (num_temples > 0){
            let temple_bonus = global.tech['anthropology'] && global.tech['anthropology'] >= 1 ? 0.016 : 0.01;
            if (global.tech['fanaticism'] && global.tech['fanaticism'] >= 2){
                let indoc = workerScale(global.civic.professor.workers,'professor') * highPopAdjust(global.race.universe === 'antimatter' ? 0.0002 : 0.0004);
                temple_bonus += indoc;
            }
            if (global.genes['ancients'] && global.genes['ancients'] >= 2 && global.civic.priest.display){
                let priest_bonus = global.genes['ancients'] >= 5 ? 0.00015 : (global.genes['ancients'] >= 3 ? 0.000125 : 0.0001);
                temple_bonus += highPopAdjust(priest_bonus) * workerScale(global.civic.priest.workers,'priest');
            }
            if (global.race.universe === 'antimatter'){
                temple_bonus /= (global.race['nerfed'] ? 3 : 2);
            }
            else if (global.race['nerfed']){
                temple_bonus /= 2;
            }
            if (global.race['spiritual']){
                temple_bonus *= 1 + (traits.spiritual.vars()[0] / 100);
            }
            let fathom = fathomCheck('seraph');
            if (fathom > 0){
                temple_bonus *= 1 + (traits.spiritual.vars(1)[0] / 100 * fathom);
            }
            if (global.race['blasphemous']){
                temple_bonus *= 1 - (traits.blasphemous.vars()[0] / 100);
            }
            if (global.civic.govern.type === 'theocracy'){
                temple_bonus *= 1 + (govEffect.theocracy()[0] / 100);
            }
            if (global.race['ooze']){
                temple_bonus *= 1 - (traits.ooze.vars()[1] / 100);
            }

            return num_temples * temple_bonus;
        }
    }
    return 0;
}

export function templePlasmidBonus(num_temples = -1){
    if (!global.race['no_plasmid'] && global.race.universe !== 'antimatter'){
        if (num_temples === -1){
            num_temples = faithTempleCount();
        }

        if (num_temples > 0){
            let temple_bonus = global.tech['anthropology'] && global.tech['anthropology'] >= 1 ? 0.08 : 0.05;
            if (global.tech['fanaticism'] && global.tech['fanaticism'] >= 2){
                let indoc = workerScale(global.civic.professor.workers,'professor') * highPopAdjust(0.002);
                temple_bonus += indoc;
            }
            if (global.genes['ancients'] && global.genes['ancients'] >= 2 && global.civic.priest.display){
                let priest_bonus = global.genes['ancients'] >= 5 ? 0.0015 : (global.genes['ancients'] >= 3 ? 0.00125 : 0.001);
                temple_bonus += highPopAdjust(priest_bonus) * workerScale(global.civic.priest.workers,'priest');
            }
            if (global.race['spiritual']){
                temple_bonus *= 1 + (traits.spiritual.vars()[0] / 100);
            }
            let fathom = fathomCheck('seraph');
            if (fathom > 0){
                temple_bonus *= 1 + (traits.spiritual.vars(1)[0] / 100 * fathom);
            }
            if (global.race['blasphemous']){
                temple_bonus *= 1 - (traits.blasphemous.vars()[0] / 100);
            }
            if (global.civic.govern.type === 'theocracy'){
                temple_bonus *= 1 + (govEffect.theocracy()[0] / 100);
            }
            if (global.race['ooze']){
                temple_bonus *= 1 - (traits.ooze.vars()[1] / 100);
            }
            if (global.race['orbit_decayed'] && global.race['truepath']){
                temple_bonus *= 0.1;
            }

            return num_temples * temple_bonus;
        }
    }
    return 0;
}

