import { global, keyMultiplier, sizeApproximation, breakdown } from './vars.js';
import { loc } from './locale.js';
import { vBind, messageQueue } from './functions.js';
import {
    OCOIN_RATE, OCOIN_BUY_FEE, LOT_BONUS, LEVEL_STEP, MAX_ORDERS, ORDER_TYPES, stockDefs, newStock, upgradeStock,
    stepMarket, settleAllOrders, buyQuote, sellQuote, maxBuyLots, executeBuy, executeSell, askPrice, bidPrice,
    validateOrder, placeOrder, cancelOrder, isBuyOrder, moneyToOcoin, ocoinCostInMoney, ocoinToMoney,
    AUTO_TICK_SECONDS, autoTradeStep, warmUp
} from './stocks_core.js';

const LEVEL_PCT = +(LEVEL_STEP * 100).toFixed(4);

// Chart size in SVG units (the SVG scales to the width of its container)
const CHART_W = 640;
const CHART_H = 300;

function fmt(n, precision = 2){
    return n ? sizeApproximation(n, precision) : '0';
}

function signed(n){
    return (n < 0 ? '-' : '+') + fmt(Math.abs(n));
}

// Adds a missing key to global.settings. The settings object is already watched by Vue, and a plain assignment of a NEW
// key would not be reactive (the UI would not update when it changes), so Vue.set is used.
function setDefault(key, value){
    if (typeof Vue !== 'undefined' && typeof Vue.set === 'function'){
        Vue.set(global.settings, key, value);
    }
    else {
        global.settings[key] = value;
    }
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
        setDefault('stockAutoOn', false);
    }
    if (typeof global.settings.stockAutoKeep !== 'number' || !isFinite(global.settings.stockAutoKeep) || global.settings.stockAutoKeep < 0){
        setDefault('stockAutoKeep', 1000);
    }
    if (!s.form || typeof s.form !== 'object'){
        s.form = { res: '', type: 'buyLimit', price: 0, lots: 1 };
    }
    if (typeof s.sel !== 'string'){
        s.sel = '';
    }
    // View settings (chart range in ticks, wallet panel open) also survive a reset
    if ([60, 120, 240].indexOf(global.settings.stockRange) === -1){
        setDefault('stockRange', 120);
    }
    if (typeof global.settings.stockWalletOpen !== 'boolean'){
        setDefault('stockWalletOpen', true);
    }
    if (!s.market){
        s.market = {};
    }
    stockDefs.forEach(function(def){
        if (!s.market[def.res]){
            // A new stock starts with some price history so the chart is not empty
            s.market[def.res] = warmUp(newStock(def), 150);
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
    const RANGES = [60, 120, 240];

    // Vue ignores <style> tags inside templates, so the CSS goes into <head> once.
    // Colours come from the game's own theme classes, so every theme keeps working.
    if ($('#stockStyle').length === 0){
        $('head').append($(`<style id="stockStyle">
        #stockExchange .stk-top{display:flex;align-items:baseline;margin:0 0 .25rem 1rem}
        #stockExchange .stk-help{cursor:help;display:inline-block;width:1.1rem;height:1.1rem;line-height:1rem;text-align:center;border:.0625rem solid;border-radius:50%;font-size:.75rem;margin-left:.375rem}
        #stockExchange .stk-toggle{margin-left:auto;cursor:pointer;font-size:.875rem}
        #stockExchange .stk-toggle:hover{text-decoration:underline}
        #stockExchange .stk-wallet{margin:.25rem 0 .5rem 0;padding:.25rem 0;border-top:.0625rem solid rgba(128,128,128,.4);border-bottom:.0625rem solid rgba(128,128,128,.4)}
        #stockExchange .stk-note{margin:.125rem 0 0 1rem;font-size:.8125rem;opacity:.85}
        #stockExchange .market-item.stk-flow{flex-wrap:wrap;align-items:center}
        #stockExchange .stk-flow>*{margin-bottom:.125rem}
        #stockExchange .stk-layout{display:flex;flex-wrap:wrap;align-items:stretch;margin:.5rem 0 0 1rem}
        #stockExchange .stk-main{flex:1 1 24rem;min-width:0}
        #stockExchange .stk-list{flex:0 0 14rem;margin-left:1rem;border-left:.0625rem solid rgba(128,128,128,.4);display:flex;flex-direction:column;min-height:12rem}
        #stockExchange .stk-listwrap{flex:1 1 0;position:relative;min-height:0}
        #stockExchange .stk-listscroll{position:absolute;top:0;right:0;bottom:0;left:0;overflow-y:auto;overflow-x:hidden;scrollbar-width:thin}
        #stockExchange .stk-listhead{flex:none;padding:.125rem .5rem;font-size:.8125rem;opacity:.75}
        #stockExchange .stk-item{padding:.25rem .5rem;cursor:pointer;border-left:.1875rem solid transparent;margin-left:-.0625rem}
        #stockExchange .stk-item:hover{background:rgba(128,128,128,.12)}
        #stockExchange .stk-item.on{background:rgba(128,128,128,.22);border-left-color:currentColor}
        #stockExchange .stk-row1,#stockExchange .stk-row2{display:flex;justify-content:space-between;align-items:baseline}
        #stockExchange .stk-iname{font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-right:.5rem}
        #stockExchange .stk-row2{font-size:.75rem}
        #stockExchange .stk-badges>*{margin-right:.5rem}
        #stockExchange .stk-head{display:flex;flex-wrap:wrap;align-items:baseline}
        #stockExchange .stk-name{font-weight:700;font-size:1.05rem;margin-right:.75rem}
        #stockExchange .stk-rng{margin-left:auto}
        #stockExchange .stk-rng>span{cursor:pointer;padding:0 .4rem;margin-left:.125rem;border:.0625rem solid transparent;border-radius:.25rem;font-size:.8125rem}
        #stockExchange .stk-rng>span.on{border-color:currentColor}
        #stockExchange .stk-chart{display:block;width:100%;height:auto;margin:.25rem 0}
        #stockExchange .stk-line{display:flex;flex-wrap:wrap;margin-top:.125rem;font-size:.875rem}
        #stockExchange .stk-line>*{margin-right:1.25rem}
        #stockExchange .stk-line>.b-tooltip{min-width:8.5rem}
        #stockExchange .stk-btns{margin:.375rem 0 .25rem -.25rem}
        #stockExchange .stk-title{margin:.5rem 0 .25rem 0;padding-top:.375rem;border-top:.0625rem solid rgba(128,128,128,.4)}
        #stockExchange .market-item.stk-plain{margin:.25rem 0 0 0}
        #stockExchange .stk-orderline{display:flex;align-items:center;font-size:.875rem;margin:.125rem 0 0 0}
        #stockExchange .stk-orderline .order{margin-left:.75rem;min-width:4rem}
        #stockExchange select option{background:#fff;color:#000}
    </style>`));
    }

    let wrap = $(`<div id="stockExchange"></div>`);
    $('#miscNew').append(wrap);
    let inputStyle = 'background:transparent;color:inherit;border:1px solid currentColor;border-radius:.25rem;padding:0 .25rem;';

    // Top bar: balance and the wallet toggle
    wrap.append($(`<div class="stk-top"><h3 class="has-text-info">${loc('resource_Ocoin_name')}: <span>{{ ocoinText() }}</span></h3>&nbsp;<span v-if="reservedOcoin() > 0" class="has-text-warning">({{ reservedText() }})</span><b-tooltip :label="helpText()" position="is-bottom" size="is-large" multilined animated><span class="stk-help has-text-warning">?</span></b-tooltip><span role="button" class="stk-toggle" @click="toggleWallet()">{{ s.stockWalletOpen ? '▾' : '▸' }} ${loc('stock_wallet')}</span></div>`));

    // Wallet: Money <-> Ocoin and the auto balance
    let wallet = $(`<div v-if="s.stockWalletOpen" class="stk-wallet"></div>`);
    wrap.append(wallet);
    wallet.append($(`<div class="stk-note has-text-warning" style="margin-bottom:.25rem;">${loc('stock_ocoin_rate',[OCOIN_RATE, OCOIN_BUY_FEE * 100])}</div>`));
    let exchange = $(`<div id="stockOcoin" class="market-item stk-flow"><h3 class="res has-text-info">${loc('stock_convert')}</h3></div>`);
    wallet.append(exchange);
    exchange.append($(`<input type="number" min="0" step="any" v-model.number="st.qty" @change="clampQty()" style="width:7rem;margin-right:.5rem;${inputStyle}">`));
    exchange.append($(`<b-tooltip :label="buyOcoinTip()" position="is-bottom" size="is-small" multilined animated><span role="button" class="order has-text-success" :class="{ off: !canBuyOcoin() }" @click="buyOcoin()">${loc('resource_market_buy')}</span></b-tooltip>`));
    exchange.append($(`<b-tooltip :label="buyOcoinMaxTip()" position="is-bottom" size="is-small" multilined animated><span role="button" class="order has-text-success" @click="buyOcoinMax()">${loc('stock_buy_max')}</span></b-tooltip>`));
    exchange.append($(`<b-tooltip :label="sellOcoinTip()" position="is-bottom" size="is-small" multilined animated><span role="button" class="order has-text-danger" :class="{ off: !canSellOcoin() }" @click="sellOcoin()">${loc('resource_market_sell')}</span></b-tooltip>`));
    exchange.append($(`<b-tooltip :label="sellOcoinMaxTip()" position="is-bottom" size="is-small" multilined animated><span role="button" class="order has-text-danger" @click="sellOcoinMax()">${loc('stock_sell_max')}</span></b-tooltip>`));
    let auto = $(`<div id="stockAuto" class="market-item stk-flow"><h3 class="res has-text-info">${loc('stock_auto')}</h3></div>`);
    wallet.append(auto);
    auto.append($(`<b-tooltip :label="autoTip()" position="is-bottom" size="is-large" multilined animated><span role="button" class="order" :class="s.stockAutoOn ? 'has-text-success' : 'has-text-danger'" @click="toggleAuto()">{{ autoLabel() }}</span></b-tooltip>`));
    auto.append($(`<span class="has-text-warning" style="margin:0 .5rem;">${loc('stock_auto_keep')}</span>`));
    auto.append($(`<input type="number" min="0" step="any" v-model.number="s.stockAutoKeep" @change="clampKeep()" style="width:7rem;margin-right:.75rem;${inputStyle}">`));
    auto.append($(`<span style="font-size:.875rem;">{{ autoStatus() }}</span>`));

    // Trading view: one chart for the selected stock on the left, the watchlist on the right
    wrap.append($(`<div v-if="list.length === 0" class="stk-note has-text-warning">${loc('stock_empty')}</div>`));
    let layout = $(`<div v-else class="stk-layout"></div>`);
    wrap.append(layout);
    let main = $(`<div class="stk-main"></div>`);
    layout.append(main);

    main.append($(`<div class="stk-head"><h3 class="stk-name has-text-info">{{ d.name }}</h3><span>{{ d.priceText }}</span>&nbsp;<span :class="d.chgClass">{{ d.chgText }}</span>&nbsp;<b :class="d.evClass">{{ d.evText }}</b><span class="stk-rng"><span v-for="n in ranges" :key="n" role="button" :class="{ on: s.stockRange === n }" @click="setRange(n)">{{ rangeLabel(n) }}</span></span></div>`));

    main.append($(`<svg v-if="c" class="stk-chart" viewBox="0 0 ${CHART_W} ${CHART_H}" preserveAspectRatio="xMidYMid meet" @mousemove="chartMove($event)" @mouseleave="hv = -1">
        <g v-for="(gl, gi) in c.grid" :key="'g' + gi">
            <line :x1="c.l" :x2="c.r" :y1="gl.y" :y2="gl.y" stroke="currentColor" stroke-opacity=".13"></line>
            <text :x="c.r + 6" :y="gl.y + 3" font-size="10" fill="currentColor" fill-opacity=".65">{{ gl.t }}</text>
        </g>
        <g :class="c.trend">
            <polygon :points="c.area" fill="currentColor" fill-opacity=".1"></polygon>
            <polyline :points="c.line" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"></polyline>
            <rect :x="c.r + 3" :y="c.last.y - 8" width="58" height="16" rx="3" fill="none" stroke="currentColor"></rect>
            <text :x="c.r + 32" :y="c.last.y + 4" text-anchor="middle" font-size="10.5" fill="currentColor">{{ c.last.t }}</text>
        </g>
        <g v-for="(o, oi) in c.lines" :key="'o' + oi" :class="o.cls">
            <line :x1="c.l" :x2="c.r" :y1="o.y" :y2="o.y" stroke="currentColor" stroke-dasharray="4 3"></line>
            <text :x="c.r - 4" :y="o.ly" text-anchor="end" font-size="10" fill="currentColor">{{ o.t }}</text>
        </g>
        <g v-if="c.hover">
            <line :x1="c.hover.x" :x2="c.hover.x" :y1="c.t" :y2="c.b" stroke="currentColor" stroke-opacity=".5"></line>
            <circle :cx="c.hover.x" :cy="c.hover.y" r="3" fill="currentColor"></circle>
            <text :x="c.hover.tx" :y="c.t + 11" :text-anchor="c.hover.anchor" font-size="11" fill="currentColor">{{ c.hover.t }}</text>
        </g>
        <text :x="c.l" :y="c.h - 5" font-size="10" fill="currentColor" fill-opacity=".65">{{ c.xl }}</text>
        <text :x="c.r" :y="c.h - 5" text-anchor="end" font-size="10" fill="currentColor" fill-opacity=".65">{{ c.xr }}</text>
    </svg>`));

    main.append($(`<div class="stk-line"><b-tooltip :label="d.bidTip" position="is-bottom" size="is-small" multilined animated><span class="has-text-success">{{ d.bidText }}</span></b-tooltip><b-tooltip :label="d.askTip" position="is-bottom" size="is-small" multilined animated><span class="has-text-danger">{{ d.askText }}</span></b-tooltip><span>{{ d.spreadText }}</span></div>`));
    main.append($(`<div class="stk-line"><span>{{ d.holdText }}</span><span :class="d.plClass">{{ d.plText }}</span></div>`));
    let btns = $(`<div class="market-item stk-flow stk-btns"></div>`);
    main.append(btns);
    btns.append($(`<b-tooltip :label="d.buyTip" position="is-bottom" size="is-small" multilined animated><span role="button" class="order has-text-success" :class="{ off: !d.canBuy }" @click="buyLots(false)">{{ d.buyBtn }}</span></b-tooltip>`));
    btns.append($(`<b-tooltip :label="d.buyMaxTip" position="is-bottom" size="is-small" multilined animated><span role="button" class="order has-text-success" :class="{ off: !d.canBuy }" @click="buyLots(true)">${loc('stock_buy_max')}</span></b-tooltip>`));
    btns.append($(`<b-tooltip :label="d.sellTip" position="is-bottom" size="is-small" multilined animated><span role="button" class="order has-text-danger" :class="{ off: !d.canSell }" @click="sellLots(false)">{{ d.sellBtn }}</span></b-tooltip>`));
    btns.append($(`<b-tooltip :label="d.sellAllTip" position="is-bottom" size="is-small" multilined animated><span role="button" class="order has-text-danger" :class="{ off: !d.canSell }" @click="sellLots(true)">${loc('stock_sell_all')}</span></b-tooltip>`));

    // Orders for the selected stock
    main.append($(`<div class="stk-title"><h3 class="has-text-info">${loc('stock_orders')}</h3></div>`));
    let form = $(`<div id="stockOrderForm" class="market-item stk-flow stk-plain"></div>`);
    main.append(form);
    let selectStyle = `margin-right:.5rem;${inputStyle}`;
    form.append($(`<b-tooltip :label="typeHint()" position="is-bottom" size="is-medium" multilined animated><select v-model="st.form.type" @change="resetPrice()" style="${selectStyle}">${ORDER_TYPES.map(t => `<option value="${t}">${orderLabel(t)}</option>`).join('')}</select></b-tooltip>`));
    form.append($(`<input type="number" min="0" step="any" v-model.number="st.form.price" style="width:6.5rem;margin-right:.5rem;${inputStyle}" placeholder="${loc('stock_order_price')}">`));
    form.append($(`<input type="number" min="1" step="1" v-model.number="st.form.lots" style="width:4.5rem;margin-right:.5rem;${inputStyle}" placeholder="${loc('stock_order_lots')}">`));
    form.append($(`<b-tooltip :label="orderTip()" position="is-bottom" size="is-small" multilined animated><span role="button" class="order has-text-success" :class="{ off: orderError() !== '' }" @click="place()">${loc('stock_order_place')}</span></b-tooltip>`));
    main.append($(`<div v-if="orderHint() !== ''" class="stk-note" style="margin-left:0;"><span class="has-text-warning">{{ orderHint() }}</span></div>`));
    main.append($(`<div v-for="o in orders" :key="o.id" class="market-item stk-orderline"><span>{{ o.text }}</span><span role="button" class="order has-text-danger" @click="cancel(o.id)">${loc('stock_order_cancel')}</span></div>`));

    // Watchlist
    let listCol = $(`<div class="stk-list"><div class="stk-listhead">${loc('stock_watchlist')}</div><div class="stk-listwrap"><div class="stk-listscroll"></div></div></div>`);
    layout.append(listCol);
    listCol.find('.stk-listscroll').append($(`<div v-for="r in list" :key="r.res" class="stk-item" :class="{ on: r.res === cur }" @click="select(r.res)"><div class="stk-row1"><span class="stk-iname">{{ r.name }}</span><span>{{ r.priceText }}</span></div><div class="stk-row2"><span class="stk-badges"><span v-if="r.lots > 0" class="has-text-warning">{{ r.lotsText }}</span><span v-if="r.orderCount > 0">{{ r.ordersText }}</span><b v-if="r.evText" :class="r.evClass">{{ r.evText }}</b></span><span :class="r.chgClass">{{ r.chgText }}</span></div></div>`));

    vBind({
        el: `#stockExchange`,
        data: {
            st: global.stocks,
            mk: global.stocks.market,
            res: global.resource,
            s: global.settings,
            hv: -1,
            ranges: RANGES
        },
        computed: {
            // The stock shown in the chart (the selected one, or the first listed one)
            cur(){
                let defs = stockDefs.filter(listed);
                if (defs.length === 0){
                    return '';
                }
                return defs.some(d => d.res === global.stocks.sel) ? global.stocks.sel : defs[0].res;
            },
            // Watchlist entries
            list(){
                let out = [];
                let range = global.settings.stockRange;
                stockDefs.forEach(function(def){
                    if (!listed(def)){
                        return;
                    }
                    let st = global.stocks.market[def.res];
                    let n = Math.min(range, st.hist.length);
                    let first = st.hist[st.hist.length - n];
                    let chg = first > 0 ? (st.price / first - 1) * 100 : 0;
                    out.push({
                        res: def.res,
                        name: stockName(def.res),
                        priceText: fmt(st.price),
                        chgText: `${chg >= 0 ? '▲' : '▼'} ${Math.abs(chg).toFixed(2)}%`,
                        chgClass: chg >= 0 ? 'has-text-success' : 'has-text-danger',
                        lots: st.lots,
                        lotsText: loc('stock_list_lots',[fmt(st.lots, 0)]),
                        orderCount: st.orders.length,
                        ordersText: loc('stock_list_orders',[st.orders.length]),
                        evText: st.ev ? loc(st.ev.type === 'boom' ? 'stock_event_boom' : 'stock_event_crash') : '',
                        evClass: st.ev ? (st.ev.type === 'boom' ? 'has-text-success' : 'has-text-danger') : ''
                    });
                });
                return out;
            },
            // Everything about the selected stock
            d(){
                let res = this.cur;
                if (!res){
                    return {};
                }
                let st = global.stocks.market[res];
                let q = keyMultiplier();
                let ask = askPrice(st);
                let bid = bidPrice(st);
                let buyMax = maxBuyLots(st, global.stocks.ocoin);
                let buyN = Math.min(q, buyMax);
                let sellN = Math.min(q, st.lots);
                let value = sellQuote(st, st.lots).proceeds;
                let pl = value - st.spent;
                let plPct = st.spent > 0 ? pl / st.spent * 100 : 0;
                let n = Math.min(global.settings.stockRange, st.hist.length);
                let first = st.hist[st.hist.length - n];
                let chg = first > 0 ? (st.price / first - 1) * 100 : 0;
                let buyShow = buyN || q;
                let buyQ = buyQuote(st, buyShow);
                let buyMaxQ = buyQuote(st, buyMax);
                let sellQ = sellQuote(st, sellN);
                let sellAllQ = sellQuote(st, st.lots);
                return {
                    res: res,
                    name: stockName(res),
                    priceText: `${fmt(st.price)} ${loc('resource_Ocoin_name')}`,
                    chgText: `${chg >= 0 ? '▲' : '▼'} ${Math.abs(chg).toFixed(2)}%`,
                    chgClass: chg >= 0 ? 'has-text-success' : 'has-text-danger',
                    evText: st.ev ? loc(st.ev.type === 'boom' ? 'stock_event_boom' : 'stock_event_crash') : '',
                    evClass: st.ev ? (st.ev.type === 'boom' ? 'has-text-success' : 'has-text-danger') : '',
                    bidText: loc('stock_bid',[fmt(bid), st.bq]),
                    askText: loc('stock_ask',[fmt(ask), st.aq]),
                    bidTip: loc('stock_bid_tip',[st.bq, st.dB, LEVEL_PCT]),
                    askTip: loc('stock_ask_tip',[st.aq, st.dA, LEVEL_PCT]),
                    spreadText: loc('stock_spread',[(st.spread * 100).toFixed(2)]),
                    holdText: loc('stock_hold',[fmt(st.lots, 0), +(st.lots * LOT_BONUS * 100).toFixed(2), loc(`resource_${res}_name`)]),
                    plText: st.lots > 0 ? loc('stock_pl',[fmt(st.spent), fmt(value), signed(pl), plPct.toFixed(1)]) : '',
                    plClass: st.lots === 0 ? '' : (pl >= 0 ? 'has-text-success' : 'has-text-danger'),
                    canBuy: buyN > 0,
                    canSell: sellN > 0,
                    buyBtn: `${loc('resource_market_buy')} ×${q}`,
                    sellBtn: `${loc('resource_market_sell')} ×${q}`,
                    buyTip: loc('stock_buy_tip',[fmt(buyShow, 0), fmt(buyQ.cost), fmt(buyQ.avg), fmt(askPrice(st) * Math.exp(buyQ.ap - st.ap))]),
                    buyMaxTip: loc('stock_buy_tip',[fmt(buyMax, 0), fmt(buyMaxQ.cost), fmt(buyMaxQ.avg), fmt(askPrice(st) * Math.exp(buyMaxQ.ap - st.ap))]),
                    sellTip: loc('stock_sell_tip',[fmt(sellN, 0), fmt(sellQ.proceeds), fmt(sellQ.avg), fmt(bidPrice(st) * Math.exp(st.bp - sellQ.bp))]),
                    sellAllTip: loc('stock_sell_tip',[fmt(st.lots, 0), fmt(sellAllQ.proceeds), fmt(sellAllQ.avg), fmt(bidPrice(st) * Math.exp(st.bp - sellAllQ.bp))])
                };
            },
            // Line chart of the selected stock: price line, grid, your average cost and your open orders
            c(){
                let res = this.cur;
                if (!res){
                    return null;
                }
                let st = global.stocks.market[res];
                let pts = st.hist.slice(-Math.min(global.settings.stockRange, st.hist.length));
                let n = pts.length;
                if (n < 2){
                    return null;
                }
                const W = CHART_W, H = CHART_H, L = 8, R = W - 66, T = 12, B = H - 22;
                let lo = Math.min(...pts);
                let hi = Math.max(...pts);
                let span = hi - lo || hi * 0.02 || 1;
                let pad = span * 0.1;
                let marks = [];
                if (st.lots > 0 && st.spent > 0){
                    let avg = st.spent / st.lots;
                    marks.push({ v: avg, cls: 'has-text-warning', t: loc('stock_avg',[fmt(avg)]) });
                }
                st.orders.forEach(function(o){
                    marks.push({ v: o.price, cls: isBuyOrder(o.type) ? 'has-text-success' : 'has-text-danger', t: `${orderLabel(o.type)} ${fmt(o.price)}` });
                });
                // Lines that are reasonably close make the chart range grow to include them, far ones stick to the edge
                let lo2 = lo - pad;
                let hi2 = hi + pad;
                marks.forEach(function(m){
                    if (m.v > lo2 - span * 0.5 && m.v < hi2 + span * 0.5){
                        lo2 = Math.min(lo2, m.v - pad * 0.5);
                        hi2 = Math.max(hi2, m.v + pad * 0.5);
                    }
                });
                let y = v => T + (hi2 - v) / (hi2 - lo2) * (B - T);
                let x = i => L + i * (R - L) / (n - 1);
                let line = pts.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
                let grid = [];
                for (let k = 0; k <= 4; k++){
                    let v = lo2 + k * (hi2 - lo2) / 4;
                    grid.push({ y: y(v), t: fmt(v) });
                }
                let lines = marks.map(function(m){
                    let yy = y(m.v);
                    let prefix = '';
                    if (yy < T){ yy = T; prefix = '▲ '; }
                    else if (yy > B){ yy = B; prefix = '▼ '; }
                    return { y: yy, ly: yy - 3, cls: m.cls, t: prefix + m.t };
                });
                // Push labels apart so two lines that are close together stay readable
                lines.slice().sort((a, b) => a.y - b.y).reduce(function(prev, cur){
                    if (prev !== null && cur.ly - prev < 11){
                        cur.ly = prev + 11;
                    }
                    return cur.ly;
                }, null);
                let hover = null;
                let hv = this.hv;
                if (hv >= 0 && hv < n){
                    let hx = x(hv);
                    let right = hx > (L + R) * 0.55;
                    hover = {
                        x: hx,
                        y: y(pts[hv]),
                        tx: right ? hx - 6 : hx + 6,
                        anchor: right ? 'end' : 'start',
                        t: `${hv === n - 1 ? loc('stock_chart_now') : loc('stock_chart_ago',[n - 1 - hv])} · ${fmt(pts[hv])}`
                    };
                }
                return {
                    w: W, h: H, l: L, r: R, t: T, b: B, n: n,
                    line: line,
                    area: `${line} ${x(n - 1).toFixed(1)},${B} ${x(0).toFixed(1)},${B}`,
                    grid: grid,
                    lines: lines,
                    last: { y: y(pts[n - 1]), t: fmt(pts[n - 1]) },
                    trend: pts[n - 1] >= pts[0] ? 'has-text-success' : 'has-text-danger',
                    hover: hover,
                    xl: loc('stock_chart_ago',[n - 1]),
                    xr: loc('stock_chart_now')
                };
            },
            // Open orders of the selected stock
            orders(){
                let res = this.cur;
                if (!res){
                    return [];
                }
                return global.stocks.market[res].orders.map(function(o){
                    return {
                        id: o.id,
                        text: loc(isBuyOrder(o.type) ? 'stock_order_line_buy' : 'stock_order_line_sell',
                            [stockName(res), orderLabel(o.type), fmt(o.lots, 0), fmt(o.total, 0), fmt(o.price), fmt(o.reserved)])
                    };
                }).sort((a, b) => a.id - b.id);
            }
        },
        methods: {
            helpText(){
                return [
                    loc('stock_ocoin_rate',[OCOIN_RATE, OCOIN_BUY_FEE * 100]),
                    loc('stock_lot_hint',[LOT_BONUS * 100]),
                    loc('stock_book_hint',[LEVEL_PCT])
                ].join(' ');
            },
            toggleWallet(){
                global.settings.stockWalletOpen = !global.settings.stockWalletOpen;
            },
            // --- Chart and watchlist ---
            select(res){
                global.stocks.sel = res;
                this.hv = -1;
                this.resetPrice();
            },
            setRange(n){
                global.settings.stockRange = n;
                this.hv = -1;
            },
            rangeLabel(n){
                return loc('stock_range_days',[n]);
            },
            chartMove(e){
                let c = this.c;
                if (!c){
                    return;
                }
                let box = e.currentTarget.getBoundingClientRect();
                if (!(box.width > 0)){
                    return;
                }
                let px = (e.clientX - box.left) / box.width * c.w;
                let i = Math.round((px - c.l) / (c.r - c.l) * (c.n - 1));
                this.hv = Math.max(0, Math.min(c.n - 1, i));
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
            // --- Market orders on the selected stock ---
            buyLots(all){
                let res = this.cur;
                if (!res){
                    return;
                }
                let st = global.stocks.market[res];
                let m = Math.min(all ? Infinity : keyMultiplier(), maxBuyLots(st, global.stocks.ocoin));
                if (!(m > 0)){
                    return;
                }
                // Walks up the ask side: each level only fills the lots queued there, the rest goes to a higher price.
                let cost = executeBuy(st, m);
                global.stocks.ocoin = Math.max(0, global.stocks.ocoin - cost);
            },
            sellLots(all){
                let res = this.cur;
                if (!res){
                    return;
                }
                let st = global.stocks.market[res];
                let m = all ? st.lots : Math.min(keyMultiplier(), st.lots);
                if (!(m > 0)){
                    return;
                }
                global.stocks.ocoin += executeSell(st, m);
            },
            // --- Limit / stop orders on the selected stock ---
            resetPrice(){
                let res = this.cur;
                if (res){
                    global.stocks.form.price = +suggestPrice(global.stocks.market[res], global.stocks.form.type).toPrecision(4);
                }
            },
            orderError(){
                let res = this.cur;
                let f = global.stocks.form;
                if (!res){
                    return 'type';
                }
                return validateOrder(global.stocks, res, f.type, f.price, f.lots) || '';
            },
            orderTip(){
                let f = global.stocks.form;
                if (!this.cur){
                    return '';
                }
                let lots = Math.max(0, Math.floor(f.lots || 0));
                return isBuyOrder(f.type)
                    ? loc('stock_order_tip_buy',[fmt(lots, 0), fmt(lots * (f.price || 0))])
                    : loc('stock_order_tip_sell',[fmt(lots, 0)]);
            },
            // What the chosen order type does (tooltip on the type dropdown)
            typeHint(){
                return loc(`stock_order_hint_${global.stocks.form.type}`);
            },
            // Only shown when the order cannot be placed yet
            orderHint(){
                let res = this.cur;
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
                return '';
            },
            place(){
                if (this.orderError() !== ''){
                    return;
                }
                let f = global.stocks.form;
                let res = this.cur;
                let out = placeOrder(global.stocks, res, f.type, f.price, f.lots);
                if (out.ok){
                    messageQueue(loc('stock_msg_placed',[stockName(res), orderLabel(f.type), fmt(out.order.lots, 0), fmt(out.order.price)]), 'info', false, ['minor_events']);
                }
            },
            cancel(id){
                let res = this.cur;
                if (res){
                    cancelOrder(global.stocks, res, id);
                }
            }
        }
    });

    // Fill the order form with a sensible price the first time it is shown
    if (!(global.stocks.form.price > 0)){
        let first = stockDefs.filter(listed)[0];
        if (first){
            global.stocks.form.price = +suggestPrice(global.stocks.market[first.res], global.stocks.form.type).toPrecision(4);
        }
    }
}
