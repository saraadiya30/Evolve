import { global, keyMultiplier, sizeApproximation, breakdown } from './vars.js';
import { loc } from './locale.js';
import { vBind, messageQueue } from './functions.js';
import {
    OCOIN_RATE, OCOIN_BUY_FEE, LOT_BONUS, LEVEL_STEP, MAX_ORDERS, ORDER_TYPES, stockDefs, newStock, upgradeStock,
    stepMarket, settleAllOrders, buyQuote, sellQuote, maxBuyLots, executeBuy, executeSell, askPrice, bidPrice,
    validateOrder, placeOrder, cancelOrder, isBuyOrder, moneyToOcoin, ocoinCostInMoney, ocoinToMoney,
    AUTO_TICK_SECONDS, autoTradeStep
} from './stocks_core.js';

const SPARK = '▁▂▃▄▅▆▇█';
const LEVEL_PCT = +(LEVEL_STEP * 100).toFixed(4);

function fmt(n, precision = 2){
    return n ? sizeApproximation(n, precision) : '0';
}

function signed(n){
    return (n < 0 ? '-' : '+') + fmt(Math.abs(n));
}

function spark(hist){
    if (hist.length < 2){
        return '';
    }
    let lo = Math.min(...hist);
    let hi = Math.max(...hist);
    if (hi === lo){
        return SPARK[3].repeat(hist.length);
    }
    return hist.map(v => SPARK[Math.min(SPARK.length - 1, Math.floor((v - lo) / (hi - lo) * SPARK.length))]).join('');
}

function moneyRoom(){
    let money = global.resource.Money;
    return money.max >= 0 ? Math.max(0, money.max - money.amount) : Infinity;
}

function listed(def){
    let resource = global.resource[def.res];
    return !!(resource && resource.display);
}

function stockName(res){
    return loc(`stock_${res}_name`);
}

function orderLabel(type){
    return loc(`stock_order_${type}`);
}

// Makes sure global.stocks exists and has an up to date entry for every listed company (also for old saves).
export function initStocks(){
    if (!global.stocks || typeof global.stocks !== 'object'){
        global['stocks'] = { ocoin: 0 };
    }
    let s = global.stocks;
    if (typeof s.ocoin !== 'number' || !isFinite(s.ocoin)){
        s.ocoin = 0;
    }
    if (typeof s.qty !== 'number'){
        s.qty = 1;
    }
    if (typeof s.oid !== 'number'){
        s.oid = 0;
    }
    // Live numbers for the auto-balance status line (per second)
    if (typeof s.autoNat !== 'number'){
        s.autoNat = 0;
    }
    if (typeof s.autoFlow !== 'number'){
        s.autoFlow = 0;
    }
    // What the auto-balance added to the Money delta on the previous tick (so it can be told apart from real income)
    if (typeof s.autoAdj !== 'number'){
        s.autoAdj = 0;
    }
    // Auto-balance settings live in global.settings so they survive a reset
    if (typeof global.settings.stockAutoOn !== 'boolean'){
        global.settings.stockAutoOn = false;
    }
    if (typeof global.settings.stockAutoKeep !== 'number' || !isFinite(global.settings.stockAutoKeep) || global.settings.stockAutoKeep < 0){
        global.settings.stockAutoKeep = 1000;
    }
    if (!s.form || typeof s.form !== 'object'){
        s.form = { res: '', type: 'buyLimit', price: 0, lots: 1 };
    }
    if (!s.market){
        s.market = {};
    }
    stockDefs.forEach(function(def){
        if (!s.market[def.res]){
            s.market[def.res] = newStock(def);
        }
        else {
            upgradeStock(s.market[def.res]);
        }
    });
}

function orderNote(n){
    let name = stockName(n.res);
    let label = orderLabel(n.type);
    if (n.kind === 'fill'){
        return [loc('stock_msg_fill',[name, label, fmt(n.lots, 0), fmt(n.avg)]), 'info'];
    }
    if (n.kind === 'trigger'){
        return [loc(n.partial ? 'stock_msg_trigger_partial' : 'stock_msg_trigger',[name, label, fmt(n.lots, 0), fmt(n.avg)]), 'warning'];
    }
    if (n.kind === 'nofunds'){
        return [loc('stock_msg_nofunds',[name, label]), 'danger'];
    }
    return [loc('stock_msg_noholdings',[name, label]), 'danger'];
}

// One market tick per game day (longLoop): prices move, events may start, the book is re-rolled, orders are checked.
export function stockTick(){
    if (global.race.species === 'protoplasm'){
        return;
    }
    initStocks();
    let notes = stepMarket(global.stocks.market);
    notes.forEach(function(n){
        let boom = n.type === 'boom';
        if (n.scope === 'market'){
            messageQueue(loc(boom ? 'stock_msg_market_boom' : 'stock_msg_market_crash'), boom ? 'success' : 'danger', false, ['minor_events']);
        }
        else if (global.resource[n.res] && global.resource[n.res].display){
            messageQueue(loc(boom ? 'stock_msg_boom' : 'stock_msg_crash', [stockName(n.res)]), boom ? 'success' : 'danger', false, ['minor_events']);
        }
    });
    settleAllOrders(global.stocks).forEach(function(n){
        let msg = orderNote(n);
        messageQueue(msg[0], msg[1], false, ['minor_events']);
    });
}

// Called every fast tick with the Money delta the game recorded for that tick (`delta`) and how many seconds the tick lasted.
// When auto-balance is on, income above the amount you keep becomes Ocoin and a shortfall is paid from Ocoin.
export function stockAutoTrade(delta, seconds = AUTO_TICK_SECONDS){
    let money = global.resource.Money;
    // Money is only displayed once currency is unlocked, so nothing happens during the early evolution stage
    if (!money || !money.display || !isFinite(delta) || !(seconds > 0)){
        return;
    }
    if (!global.stocks || typeof global.stocks.autoAdj !== 'number'){
        initStocks();
    }
    let s = global.stocks;
    // The delta also contains what this feature added to it last tick; take that out to get the real income of this tick
    let natural = delta - s.autoAdj;
    let flow = 0;
    let adj = 0;
    if (global.settings.stockAutoOn){
        let out = autoTradeStep(s, money, natural, global.settings.stockAutoKeep * seconds);
        if (out.kind === 'convert'){
            flow = out.money;
            adj = -out.money;
        }
        else if (out.kind === 'topup'){
            flow = -out.money;
            adj = out.money;
        }
    }
    s.autoAdj = adj;
    // Smoothed per-second numbers for the status line (about 10 ticks)
    s.autoNat = s.autoNat * 0.9 + natural / seconds * 0.1;
    s.autoFlow = s.autoFlow * 0.9 + flow / seconds * 0.1;
}

// Shows the stock production bonus in each resource's production breakdown popover.
export function applyStockBreakdown(){
    if (!global.stocks || !global.stocks.market){
        return;
    }
    stockDefs.forEach(function(def){
        let st = global.stocks.market[def.res];
        if (st && st.lots > 0 && breakdown.p[def.res]){
            breakdown.p[def.res][loc('stock_bonus_label')] = +(st.lots * LOT_BONUS * 100).toFixed(2) + '%';
        }
    });
}

// Sensible starting price for the order form: a bit away from the current quote, on the correct side.
function suggestPrice(st, type){
    switch (type){
        case 'buyLimit': return askPrice(st) * 0.95;
        case 'buyStop': return askPrice(st) * 1.05;
        case 'sellLimit': return bidPrice(st) * 1.05;
        default: return bidPrice(st) * 0.95;
    }
}

export function drawStocks(){
    initStocks();

    let wrap = $(`<div id="stockExchange"></div>`);
    $('#miscNew').append(wrap);

    // Small layout helpers. Vue ignores <style> tags inside templates, so the CSS goes into <head> once.
    // Colours come from the game's own theme classes, so every theme keeps working.
    if ($('#stockStyle').length === 0){
        $('head').append($(`<style id="stockStyle">
        #stockExchange .stk-top{margin:0 0 .5rem 1rem}
        #stockExchange .stk-help{cursor:help;display:inline-block;width:1.1rem;height:1.1rem;line-height:1rem;text-align:center;border:.0625rem solid;border-radius:50%;font-size:.75rem;margin-left:.375rem}
        #stockExchange .stk-note{margin:.125rem 0 0 1rem;font-size:.8125rem;opacity:.85}
        #stockExchange .stk-card{display:block;margin:.5rem 0 0 1rem;padding-top:.375rem;border-top:.0625rem solid rgba(128,128,128,.4)}
        #stockExchange .stk-head{display:flex;flex-wrap:wrap;align-items:baseline}
        #stockExchange .stk-name{min-width:11rem;margin-right:.75rem;font-weight:700}
        #stockExchange .stk-line{display:flex;flex-wrap:wrap;margin-top:.125rem;font-size:.875rem}
        #stockExchange .stk-line>*{margin-right:1.25rem}
        #stockExchange .stk-spark{font-size:.75rem;letter-spacing:.0625rem;opacity:.85}
        #stockExchange .stk-line>.b-tooltip{min-width:8.5rem}
        #stockExchange .stk-btns{margin:.375rem 0 .125rem -.25rem}
        #stockExchange select option{background:#fff;color:#000}
        #stockExchange .stk-title{margin:.75rem 0 .25rem 1rem;padding-top:.375rem;border-top:.0625rem solid rgba(128,128,128,.4)}
        #stockExchange .stk-orderline{display:flex;align-items:center;margin:.125rem 0 0 1rem;font-size:.875rem}
        #stockExchange .stk-orderline .order{margin-left:.75rem}
        #stockExchange .market-item.stk-flow{flex-wrap:wrap;align-items:center}
        #stockExchange .stk-flow>*{margin-bottom:.125rem}
    </style>`));
    }

    wrap.append($(`<div class="stk-top"><h3 class="has-text-info">${loc('resource_Ocoin_name')}: <span>{{ ocoinText() }}</span></h3> <span v-if="reservedOcoin() > 0" class="has-text-warning">({{ reservedText() }})</span><b-tooltip :label="helpText()" position="is-bottom" size="is-large" multilined animated><span class="stk-help has-text-warning">?</span></b-tooltip></div>`));
    wrap.append($(`<div class="stk-note has-text-warning">${loc('stock_ocoin_rate',[OCOIN_RATE, OCOIN_BUY_FEE * 100])}</div>`));

    // Money <-> Ocoin
    let exchange = $(`<div id="stockOcoin" class="market-item stk-flow" style="margin-top:.5rem;"><h3 class="res has-text-info">${loc('stock_convert')}</h3></div>`);
    wrap.append(exchange);
    exchange.append($(`<input type="number" min="0" step="any" v-model.number="st.qty" @change="clampQty()" style="width:7rem;margin-right:.5rem;background:transparent;color:inherit;border:1px solid currentColor;border-radius:.25rem;padding:0 .25rem;">`));
    exchange.append($(`<b-tooltip :label="buyOcoinTip()" position="is-bottom" size="is-small" multilined animated><span role="button" class="order has-text-success" :class="{ off: !canBuyOcoin() }" @click="buyOcoin()">${loc('resource_market_buy')}</span></b-tooltip>`));
    exchange.append($(`<b-tooltip :label="buyOcoinMaxTip()" position="is-bottom" size="is-small" multilined animated><span role="button" class="order has-text-success" @click="buyOcoinMax()">${loc('stock_buy_max')}</span></b-tooltip>`));
    exchange.append($(`<b-tooltip :label="sellOcoinTip()" position="is-bottom" size="is-small" multilined animated><span role="button" class="order has-text-danger" :class="{ off: !canSellOcoin() }" @click="sellOcoin()">${loc('resource_market_sell')}</span></b-tooltip>`));
    exchange.append($(`<b-tooltip :label="sellOcoinMaxTip()" position="is-bottom" size="is-small" multilined animated><span role="button" class="order has-text-danger" @click="sellOcoinMax()">${loc('stock_sell_max')}</span></b-tooltip>`));

    // Auto balance of Money income <-> Ocoin
    let auto = $(`<div id="stockAuto" class="market-item stk-flow"><h3 class="res has-text-info">${loc('stock_auto')}</h3></div>`);
    wrap.append(auto);
    auto.append($(`<b-tooltip :label="autoTip()" position="is-bottom" size="is-large" multilined animated><span role="button" class="order" :class="s.stockAutoOn ? 'has-text-success' : 'has-text-danger'" @click="toggleAuto()">{{ autoLabel() }}</span></b-tooltip>`));
    auto.append($(`<span class="has-text-warning" style="margin:0 .5rem 0 .5rem;">${loc('stock_auto_keep')}</span>`));
    auto.append($(`<input type="number" min="0" step="any" v-model.number="s.stockAutoKeep" @change="clampKeep()" style="width:7rem;margin-right:.75rem;background:transparent;color:inherit;border:1px solid currentColor;border-radius:.25rem;padding:0 .25rem;">`));
    auto.append($(`<span style="font-size:.875rem;">{{ autoStatus() }}</span>`));

    // One card per listed company
    wrap.append($(`<div v-if="rows().length === 0" class="stk-note has-text-warning">${loc('stock_empty')}</div>`));
    let card = $(`<div v-for="r in rows()" :key="r.res" class="market-item stk-card"></div>`);
    wrap.append(card);
    card.append($(`<div class="stk-head"><h3 class="stk-name has-text-info">{{ r.name }}</h3><span>{{ r.priceText }}</span>&nbsp;<span :class="r.chgClass">{{ r.chgText }}</span>&nbsp;<span class="stk-spark" :class="r.sparkClass">{{ r.spark }}</span>&nbsp;<b :class="r.evClass">{{ r.evText }}</b></div>`));
    card.append($(`<div class="stk-line"><b-tooltip :label="r.bidTip" position="is-bottom" size="is-small" multilined animated><span class="has-text-success">{{ r.bidText }}</span></b-tooltip><b-tooltip :label="r.askTip" position="is-bottom" size="is-small" multilined animated><span class="has-text-danger">{{ r.askText }}</span></b-tooltip><span>{{ r.spreadText }}</span></div>`));
    card.append($(`<div class="stk-line"><span>{{ r.holdText }}</span><span :class="r.plClass">{{ r.plText }}</span></div>`));
    let btns = $(`<div class="stk-btns"></div>`);
    card.append(btns);
    btns.append($(`<b-tooltip :label="r.buyTip" position="is-bottom" size="is-small" multilined animated><span role="button" class="order has-text-success" :class="{ off: !r.canBuy }" @click="buyLots(r.res, false)">{{ r.buyBtn }}</span></b-tooltip>`));
    btns.append($(`<b-tooltip :label="r.buyMaxTip" position="is-bottom" size="is-small" multilined animated><span role="button" class="order has-text-success" :class="{ off: !r.canBuy }" @click="buyLots(r.res, true)">${loc('stock_buy_max')}</span></b-tooltip>`));
    btns.append($(`<b-tooltip :label="r.sellTip" position="is-bottom" size="is-small" multilined animated><span role="button" class="order has-text-danger" :class="{ off: !r.canSell }" @click="sellLots(r.res, false)">{{ r.sellBtn }}</span></b-tooltip>`));
    btns.append($(`<b-tooltip :label="r.sellAllTip" position="is-bottom" size="is-small" multilined animated><span role="button" class="order has-text-danger" :class="{ off: !r.canSell }" @click="sellLots(r.res, true)">${loc('stock_sell_all')}</span></b-tooltip>`));

    // Order form (buy limit / buy stop / sell limit / sell stop)
    let selectStyle = 'margin-right:.5rem;background:transparent;color:inherit;border:1px solid currentColor;border-radius:.25rem;padding:0 .25rem;';
    wrap.append($(`<div v-if="rows().length > 0" class="stk-title"><h3 class="has-text-info">${loc('stock_orders')}</h3></div>`));
    let form = $(`<div id="stockOrderForm" v-if="rows().length > 0" class="market-item stk-flow"></div>`);
    wrap.append(form);
    form.append($(`<select v-model="st.form.res" @change="resetPrice()" style="${selectStyle}"><option v-for="r in rows()" :key="r.res" :value="r.res">{{ r.name }}</option></select>`));
    form.append($(`<select v-model="st.form.type" @change="resetPrice()" style="${selectStyle}">${ORDER_TYPES.map(t => `<option value="${t}">${orderLabel(t)}</option>`).join('')}</select>`));
    form.append($(`<input type="number" min="0" step="any" v-model.number="st.form.price" style="width:6.5rem;margin-right:.5rem;background:transparent;color:inherit;border:1px solid currentColor;border-radius:.25rem;padding:0 .25rem;" placeholder="${loc('stock_order_price')}">`));
    form.append($(`<input type="number" min="1" step="1" v-model.number="st.form.lots" style="width:4.5rem;margin-right:.5rem;background:transparent;color:inherit;border:1px solid currentColor;border-radius:.25rem;padding:0 .25rem;" placeholder="${loc('stock_order_lots')}">`));
    form.append($(`<b-tooltip :label="orderTip()" position="is-bottom" size="is-small" multilined animated><span role="button" class="order has-text-success" :class="{ off: orderError() !== '' }" @click="place()">${loc('stock_order_place')}</span></b-tooltip>`));
    wrap.append($(`<div v-if="rows().length > 0" class="stk-note has-text-warning">{{ orderHint() }}</div>`));

    // Open orders
    let orderRow = $(`<div v-for="o in orders()" :key="o.id" class="stk-orderline"></div>`);
    wrap.append(orderRow);
    orderRow.append($(`<span>{{ o.text }}</span>`));
    orderRow.append($(`<span role="button" class="order has-text-danger" style="min-width:4rem;" @click="cancel(o.res, o.id)">${loc('stock_order_cancel')}</span>`));

    vBind({
        el: `#stockExchange`,
        data: {
            st: global.stocks,
            mk: global.stocks.market,
            res: global.resource,
            s: global.settings
        },
        methods: {
            helpText(){
                return [
                    loc('stock_ocoin_rate',[OCOIN_RATE, OCOIN_BUY_FEE * 100]),
                    loc('stock_lot_hint',[LOT_BONUS * 100]),
                    loc('stock_book_hint',[LEVEL_PCT])
                ].join(' ');
            },
            // --- Auto balance ---
            autoLabel(){
                return loc(global.settings.stockAutoOn ? 'stock_auto_on' : 'stock_auto_off');
            },
            autoTip(){
                return loc('stock_auto_tip',[OCOIN_BUY_FEE * 100]);
            },
            toggleAuto(){
                global.settings.stockAutoOn = !global.settings.stockAutoOn;
            },
            clampKeep(){
                let keep = global.settings.stockAutoKeep;
                if (typeof keep !== 'number' || !isFinite(keep) || keep < 0){
                    global.settings.stockAutoKeep = 0;
                }
            },
            autoStatus(){
                let nat = global.stocks.autoNat;
                let flow = global.stocks.autoFlow;
                if (!global.settings.stockAutoOn || Math.abs(flow) < 1e-9){
                    return loc('stock_auto_status_even',[signed(nat)]);
                }
                if (flow > 0){
                    return loc('stock_auto_status_convert',[signed(nat), fmt(flow), fmt(moneyToOcoin(flow))]);
                }
                return loc('stock_auto_status_topup',[signed(nat), fmt(-flow), fmt(-flow / OCOIN_RATE)]);
            },
            ocoinText(){
                return fmt(global.stocks.ocoin);
            },
            reservedOcoin(){
                let total = 0;
                Object.keys(global.stocks.market).forEach(function(res){
                    global.stocks.market[res].orders.forEach(function(o){
                        total += o.reserved;
                    });
                });
                return total;
            },
            reservedText(){
                return loc('stock_reserved',[fmt(this.reservedOcoin())]);
            },
            clampQty(){
                if (!global.stocks.qty || global.stocks.qty < 0 || !isFinite(global.stocks.qty)){
                    global.stocks.qty = 0;
                }
            },
            // --- Money <-> Ocoin ---
            canBuyOcoin(){
                let qty = global.stocks.qty || 0;
                return qty > 0 && ocoinCostInMoney(qty) <= global.resource.Money.amount;
            },
            buyOcoinTip(){
                let qty = global.stocks.qty || 0;
                return loc('stock_ocoin_buy_tip',[fmt(ocoinCostInMoney(qty)), OCOIN_BUY_FEE * 100, fmt(qty)]);
            },
            buyOcoin(){
                if (!this.canBuyOcoin()){
                    return;
                }
                let qty = global.stocks.qty;
                global.resource.Money.amount = Math.max(0, global.resource.Money.amount - ocoinCostInMoney(qty));
                global.stocks.ocoin += qty;
            },
            buyOcoinMaxTip(){
                return loc('stock_ocoin_buy_max_tip',[fmt(moneyToOcoin(global.resource.Money.amount)), OCOIN_BUY_FEE * 100]);
            },
            buyOcoinMax(){
                let money = global.resource.Money.amount;
                if (money > 0){
                    global.stocks.ocoin += moneyToOcoin(money);
                    global.resource.Money.amount = 0;
                }
            },
            sellOcoinQty(all){
                let qty = all ? global.stocks.ocoin : (global.stocks.qty || 0);
                return Math.max(0, Math.min(qty, global.stocks.ocoin, moneyRoom() / OCOIN_RATE));
            },
            canSellOcoin(){
                return this.sellOcoinQty(false) > 0;
            },
            sellOcoinTip(){
                let qty = this.sellOcoinQty(false);
                return loc('stock_ocoin_sell_tip',[fmt(qty), fmt(ocoinToMoney(qty))]);
            },
            sellOcoinMaxTip(){
                let qty = this.sellOcoinQty(true);
                return loc('stock_ocoin_sell_max_tip',[fmt(qty), fmt(ocoinToMoney(qty))]);
            },
            sellOcoin(){
                this.doSellOcoin(this.sellOcoinQty(false));
            },
            sellOcoinMax(){
                this.doSellOcoin(this.sellOcoinQty(true));
            },
            doSellOcoin(qty){
                if (qty > 0){
                    global.stocks.ocoin = Math.max(0, global.stocks.ocoin - qty);
                    global.resource.Money.amount += ocoinToMoney(qty);
                }
            },
            // --- Stocks: quotes and market orders ---
            rows(){
                let out = [];
                let q = keyMultiplier();
                stockDefs.forEach(function(def){
                    if (!listed(def)){
                        return;
                    }
                    let st = global.stocks.market[def.res];
                    let ask = askPrice(st);
                    let bid = bidPrice(st);
                    let buyMax = maxBuyLots(st, global.stocks.ocoin);
                    let buyN = Math.min(q, buyMax);
                    let sellN = Math.min(q, st.lots);
                    let value = sellQuote(st, st.lots).proceeds;
                    let pl = value - st.spent;
                    let plPct = st.spent > 0 ? pl / st.spent * 100 : 0;
                    let chg = st.prev > 0 ? (st.price / st.prev - 1) * 100 : 0;
                    let plClass = st.lots === 0 ? '' : (pl >= 0 ? 'has-text-success' : 'has-text-danger');
                    let buyShow = buyN || q;
                    let buyQ = buyQuote(st, buyShow);
                    let buyMaxQ = buyQuote(st, buyMax);
                    let sellQ = sellQuote(st, sellN);
                    let sellAllQ = sellQuote(st, st.lots);
                    out.push({
                        res: def.res,
                        name: stockName(def.res),
                        priceText: `${fmt(st.price)} ${loc('resource_Ocoin_name')}`,
                        evText: st.ev ? loc(st.ev.type === 'boom' ? 'stock_event_boom' : 'stock_event_crash') : '',
                        evClass: st.ev ? (st.ev.type === 'boom' ? 'has-text-success' : 'has-text-danger') : '',
                        chgText: `${chg >= 0 ? '▲' : '▼'} ${Math.abs(chg).toFixed(2)}%`,
                        chgClass: chg >= 0 ? 'has-text-success' : 'has-text-danger',
                        spark: spark(st.hist),
                        sparkClass: st.hist.length > 1 && st.hist[st.hist.length - 1] < st.hist[0] ? 'has-text-danger' : 'has-text-success',
                        bidText: loc('stock_bid',[fmt(bid), st.bq]),
                        askText: loc('stock_ask',[fmt(ask), st.aq]),
                        bidTip: loc('stock_bid_tip',[st.bq, st.dB, LEVEL_PCT]),
                        askTip: loc('stock_ask_tip',[st.aq, st.dA, LEVEL_PCT]),
                        spreadText: loc('stock_spread',[(st.spread * 100).toFixed(2)]),
                        holdText: loc('stock_hold',[fmt(st.lots, 0), +(st.lots * LOT_BONUS * 100).toFixed(2), loc(`resource_${def.res}_name`)]),
                        plText: st.lots > 0 ? loc('stock_pl',[fmt(st.spent), fmt(value), signed(pl), plPct.toFixed(1)]) : '',
                        plClass: plClass,
                        canBuy: buyN > 0,
                        canSell: sellN > 0,
                        buyBtn: `${loc('resource_market_buy')} ×${q}`,
                        sellBtn: `${loc('resource_market_sell')} ×${q}`,
                        buyTip: loc('stock_buy_tip',[fmt(buyShow, 0), fmt(buyQ.cost), fmt(buyQ.avg), fmt(askPrice(st) * Math.exp(buyQ.ap - st.ap))]),
                        buyMaxTip: loc('stock_buy_tip',[fmt(buyMax, 0), fmt(buyMaxQ.cost), fmt(buyMaxQ.avg), fmt(askPrice(st) * Math.exp(buyMaxQ.ap - st.ap))]),
                        sellTip: loc('stock_sell_tip',[fmt(sellN, 0), fmt(sellQ.proceeds), fmt(sellQ.avg), fmt(bidPrice(st) * Math.exp(st.bp - sellQ.bp))]),
                        sellAllTip: loc('stock_sell_tip',[fmt(st.lots, 0), fmt(sellAllQ.proceeds), fmt(sellAllQ.avg), fmt(bidPrice(st) * Math.exp(st.bp - sellAllQ.bp))])
                    });
                });
                return out;
            },
            buyLots(res, all){
                let st = global.stocks.market[res];
                let m = Math.min(all ? Infinity : keyMultiplier(), maxBuyLots(st, global.stocks.ocoin));
                if (!(m > 0)){
                    return;
                }
                // Walks up the ask side: each level only fills the lots queued there, the rest goes to a higher price.
                let cost = executeBuy(st, m);
                global.stocks.ocoin = Math.max(0, global.stocks.ocoin - cost);
            },
            sellLots(res, all){
                let st = global.stocks.market[res];
                let m = all ? st.lots : Math.min(keyMultiplier(), st.lots);
                if (!(m > 0)){
                    return;
                }
                global.stocks.ocoin += executeSell(st, m);
            },
            // --- Orders ---
            formRes(){
                let f = global.stocks.form;
                let defs = stockDefs.filter(listed);
                if (defs.length === 0){
                    return '';
                }
                return defs.some(d => d.res === f.res) ? f.res : defs[0].res;
            },
            resetPrice(){
                let res = this.formRes();
                if (res){
                    global.stocks.form.res = res;
                    global.stocks.form.price = +suggestPrice(global.stocks.market[res], global.stocks.form.type).toPrecision(4);
                }
            },
            orderError(){
                let res = this.formRes();
                let f = global.stocks.form;
                if (!res){
                    return 'type';
                }
                return validateOrder(global.stocks, res, f.type, f.price, f.lots) || '';
            },
            orderTip(){
                let f = global.stocks.form;
                let res = this.formRes();
                if (!res){
                    return '';
                }
                let lots = Math.max(0, Math.floor(f.lots || 0));
                return isBuyOrder(f.type)
                    ? loc('stock_order_tip_buy',[fmt(lots, 0), fmt(lots * (f.price || 0))])
                    : loc('stock_order_tip_sell',[fmt(lots, 0)]);
            },
            orderHint(){
                let res = this.formRes();
                if (!res){
                    return '';
                }
                let f = global.stocks.form;
                let st = global.stocks.market[res];
                let err = this.orderError();
                if (err === 'side'){
                    let ref = isBuyOrder(f.type) ? askPrice(st) : bidPrice(st);
                    return loc(`stock_order_err_side_${f.type}`,[fmt(ref)]);
                }
                if (err !== ''){
                    return loc(`stock_order_err_${err}`,[MAX_ORDERS]);
                }
                return loc(`stock_order_hint_${f.type}`);
            },
            place(){
                if (this.orderError() !== ''){
                    return;
                }
                let f = global.stocks.form;
                let res = this.formRes();
                let out = placeOrder(global.stocks, res, f.type, f.price, f.lots);
                if (out.ok){
                    messageQueue(loc('stock_msg_placed',[stockName(res), orderLabel(f.type), fmt(out.order.lots, 0), fmt(out.order.price)]), 'info', false, ['minor_events']);
                }
            },
            orders(){
                let out = [];
                Object.keys(global.stocks.market).forEach(function(res){
                    global.stocks.market[res].orders.forEach(function(o){
                        out.push({
                            id: o.id,
                            res: res,
                            text: loc(isBuyOrder(o.type) ? 'stock_order_line_buy' : 'stock_order_line_sell',
                                [stockName(res), orderLabel(o.type), fmt(o.lots, 0), fmt(o.total, 0), fmt(o.price), fmt(o.reserved)])
                        });
                    });
                });
                return out.sort((a, b) => a.id - b.id);
            },
            cancel(res, id){
                cancelOrder(global.stocks, res, id);
            }
        }
    });

    // Fill the form with a sensible price the first time it is shown
    if (!(global.stocks.form.price > 0)){
        let res = stockDefs.filter(listed)[0];
        if (res){
            global.stocks.form.res = res.res;
            global.stocks.form.price = +suggestPrice(global.stocks.market[res.res], global.stocks.form.type).toPrecision(4);
        }
    }
}
