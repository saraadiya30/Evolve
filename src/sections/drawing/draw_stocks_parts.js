import { initStocks, CHART_W, CHART_H, orderLabel, liveStockDefs, listed, stockName, fmt, isSpecial, specialBonusPerLot, signed, snapPrice, stepOf, settleStock, moneyRoom, suggestPrice, joinNotes } from '../../stocks/stocks.js';
import { loc } from '../../core/locale.js';
import { OCOIN_RATE, OCOIN_BUY_FEE, ORDER_TYPES, askPrice, bidPrice, maxBuyLots, sellQuote, buyQuote, committedSellLots, tpPriceFromPct, slPriceFromPct, MAX_ORDERS, LOT_BONUS, isBuyOrder, bookLevels, STORAGE_BONUS, MORALE_BONUS_PER_LOT, POWER_BONUS_PER_LOT, BIRTH_BONUS_PER_LOT, ARMY_BONUS_PER_LOT, armyCapBonus, OCOIN_YIELD_PER_LOT, ocoinYield, moneyToOcoin, ocoinCostInMoney, ocoinToMoney, GOLD_BAR_OCOIN, goldBarCount, maxGoldBarsFromOcoin, ocoinToGoldBars, goldBarsToOcoin, executeBuy, executeSell, validateOrder, validateBracket, placeOrder, cancelOrder, placeExitOrders } from '../../stocks/stocks_core.js';
import { storageLots, productionLots, setStorageLots, ocoinFlowPerSecond, AUTO_TICK_SECONDS } from '../../stocks/stocks_core.js';
import { vBind } from '../../functions/dom_helpers.js';
import { aetherExact } from '../../resources/aether_alchemy.js';
import { popover } from '../../functions/popover.js';
import { messageQueue } from '../../functions/message_log.js';
import { global, keyMultiplier, webWorker } from '../../core/vars.js';

// Net Ocoin per game second from Auto Convert, the Compoundia payout (a game day is longRatio ticks of AUTO_TICK_SECONDS) and
// buying/selling in the Resources > Ocoin tab.
function ocoinFlow(){
    let d = global.stocks.market.Dividend;
    return ocoinFlowPerSecond(global.stocks.autoFlow, !!global.settings.stockAutoOn, global.stocks.ocoin, d ? d.lots : 0, webWorker.longRatio * AUTO_TICK_SECONDS, global.stocks.alchemyFlow);
}


const GOLD_BTN_STYLE = 'background:transparent;border:1px solid currentColor;border-radius:.25rem;padding:.125rem .75rem;font:inherit;';
const GOLD_INPUT_STYLE = 'background:transparent;color:inherit;border:1px solid currentColor;border-radius:.25rem;padding:0 .25rem;';

// Gold Bar popup: whole bars only, 1 bar = GOLD_BAR_OCOIN Ocoin, no fee.
function drawGoldModal(){
    $('#modalBox').append($(`<p id="modalBoxTitle" class="has-text-warning modalTitle">${loc('stock_gold_title')}</p>`));
    let body = $('<div id="goldModal" class="modalBody"></div>');
    $('#modalBox').append(body);
    // Invisible table: one grid, so labels, buttons and previews line up in columns
    let btn = (cls, on, label, click) => `<button type="button" class="${cls}" style="${GOLD_BTN_STYLE}" :style="{ opacity: ${on} ? 1 : .4, cursor: ${on} ? 'pointer' : 'not-allowed' }" @click="${click}">${label}</button>`;
    body.append($(`<div style="display:grid;grid-template-columns:max-content max-content 1fr;column-gap:.75rem;row-gap:.5rem;align-items:center;text-align:left;">
        <span>${loc('resource_Ocoin_name')}</span><b style="grid-column:2 / 4;" :title="exactOcoin()">{{ ocoinText() }}</b>
        <span>${loc('stock_gold_have')}</span><b style="grid-column:2 / 4;" :title="exactBars()">{{ barsText() }}</b>
        <span>${loc('stock_gold_qty')}</span><input type="number" min="1" step="1" v-model.number="q.n" @change="clampN()" style="width:100%;min-width:9rem;box-sizing:border-box;${GOLD_INPUT_STYLE}"><span></span>
        ${btn('has-text-success', 'canBuy()', loc('stock_gold_to_bar'), 'buy()')}${btn('has-text-success', 'maxBuy() >= 1', loc('stock_gold_max'), 'buyMax()')}<span :title="exactBuy()">{{ buyText() }}</span>
        ${btn('has-text-danger', 'canSell()', loc('stock_gold_to_ocoin'), 'sell()')}${btn('has-text-danger', 'bars() >= 1', loc('stock_gold_all'), 'sellAll()')}<span :title="exactSell()">{{ sellText() }}</span>
    </div>`));
    vBind({
        el: '#goldModal',
        data: { st: global.stocks, s: global.settings, q: { n: 1 } },
        methods: {
            ocoinText(){ return fmt(global.stocks.ocoin); },
            exactOcoin(){ return aetherExact(global.stocks.ocoin); },
            bars(){ return goldBarCount(global.settings); },
            barsText(){ return fmt(this.bars()); },
            exactBars(){ return aetherExact(this.bars()); },
            qty(){ return Math.max(0, Math.floor(this.q.n || 0)); },
            maxBuy(){ return maxGoldBarsFromOcoin(global.stocks); },
            clampN(){ this.q.n = Math.max(1, Math.floor(this.q.n || 1)); },
            canBuy(){ return this.qty() >= 1 && this.qty() <= this.maxBuy(); },
            canSell(){ return this.qty() >= 1 && this.qty() <= this.bars(); },
            buyText(){ return loc('stock_gold_cost',[fmt(this.qty() * GOLD_BAR_OCOIN)]); },
            sellText(){ return loc('stock_gold_gain',[fmt(this.qty() * GOLD_BAR_OCOIN)]); },
            exactBuy(){ return aetherExact(this.qty() * GOLD_BAR_OCOIN); },
            exactSell(){ return aetherExact(this.qty() * GOLD_BAR_OCOIN); },
            buy(){ ocoinToGoldBars(global.stocks, global.settings, this.qty()); },
            buyMax(){ ocoinToGoldBars(global.stocks, global.settings, this.maxBuy()); },
            sell(){ goldBarsToOcoin(global.stocks, global.settings, this.qty()); },
            sellAll(){ goldBarsToOcoin(global.stocks, global.settings, this.bars()); }
        }
    });
}

// Breakdown-style popover for the net Ocoin rate (same look as the resource breakdown popovers).
function netBreakdownHtml(){
    let f = ocoinFlow();
    let row = (label, n, extra) => `<div class="modal_bd"><span>${label}</span><span class="has-text-${n < 0 ? 'danger' : 'success'}">${Math.abs(n) < 1e-9 ? '0' : signed(n)}${extra || ''}</span></div>`;
    let html = `<div class="resBreakdown"><div class="has-text-info">${loc('stock_net_title')}</div><div class="parent"><div>`;
    html += row(loc('stock_net_auto'), f.auto);
    html += row(loc('stock_net_dividend'), f.dividend);
    html += row(loc('stock_net_alchemy'), f.alchemy);
    html += `</div>`;
    html += `</div><div class="modal_bd sum"><span>${loc('stock_net_total')}</span><span class="has-text-${f.net < -1e-9 ? 'danger' : 'success'}">${Math.abs(f.net) < 1e-9 ? '0' : signed(f.net)}/s</span></div>`;
    html += `<div style="font-size:.75rem;opacity:.75;max-width:16rem;white-space:normal;">${loc('stock_net_note')}</div></div>`;
    return html;
}

// Variabel yang dibagi antar bagian ada di $ctx.

export function drawStocks_s1($ctx){
        initStocks();
    $ctx.RANGES = [60, 120, 240];

    // Vue ignores <style> tags inside templates, so the CSS goes into <head> once.
    // Colours come from the game's own theme classes, so every theme keeps working.
    if ($('#stockStyle').length === 0){
        $('head').append($(`<style id="stockStyle">
        #stockExchange .stk-top{display:flex;align-items:baseline;margin:0 0 .25rem 1rem}
        #stockExchange .stk-help{cursor:help;display:inline-block;width:1.1rem;height:1.1rem;line-height:1rem;text-align:center;border:.0625rem solid;border-radius:50%;font-size:.75rem;margin-left:.375rem}
        #stockExchange .stk-gold{margin-left:.5rem;cursor:pointer;font-size:.875rem}
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
        #stockExchange .stk-head{display:flex;flex-wrap:nowrap;align-items:baseline;min-height:1.75rem}
        #stockExchange .stk-head>*{flex:none;white-space:nowrap}
        #stockExchange .stk-name{font-weight:700;font-size:1.05rem;margin-right:.75rem;flex:0 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis}
        #stockExchange .stk-rng{margin-left:auto}
        #stockExchange .stk-rng>span{cursor:pointer;padding:0 .4rem;margin-left:.125rem;border:.0625rem solid transparent;border-radius:.25rem;font-size:.8125rem}
        #stockExchange .stk-rng>span.on{border-color:currentColor}
        #stockExchange .stk-chart{display:block;width:100%;height:auto;margin:.25rem 0}
        #stockExchange .stk-line{display:flex;flex-wrap:nowrap;margin-top:.125rem;font-size:.875rem;min-height:1.3rem;line-height:1.3rem;overflow:hidden;white-space:nowrap}
        #stockExchange .stk-line>*{margin-right:1.25rem;min-width:0;overflow:hidden;text-overflow:ellipsis}
        #stockExchange .stk-line>.b-tooltip{min-width:8.5rem}
        #stockExchange .stk-alloc{border-collapse:collapse;width:auto;margin:.25rem 0;font-size:.875rem}
        #stockExchange .stk-alloc td{border:0;padding:.125rem 1rem .125rem 0;white-space:nowrap;vertical-align:middle}
        #stockExchange .stk-alloc td:first-child{min-width:5.5rem}
        #stockExchange .stk-alloc .current{min-width:calc(9ch + .75rem);padding:0 .375rem;box-sizing:border-box}
        #stockExchange .stk-btns{margin:.375rem 0 .25rem -.25rem;min-height:2rem}
        #stockExchange .stk-net{cursor:help}
        #stockExchange .stk-title{margin:.5rem 0 .25rem 0;padding-top:.375rem;border-top:.0625rem solid rgba(128,128,128,.4)}
        #stockExchange .market-item.stk-plain{margin:.25rem 0 0 0}
        #stockExchange .stk-orderline{display:flex;align-items:center;font-size:.875rem;margin:.125rem 0 0 0}
        #stockExchange .stk-orderline .order{margin-left:.75rem;min-width:4rem}
        #stockExchange select option{background:#fff;color:#000}
        #stockExchange .stk-depth{border-collapse:collapse;margin:.25rem 0;font-size:.8125rem;width:100%;max-width:16rem}
        #stockExchange .stk-depth th{text-align:left;font-weight:600;padding:0 .75rem .125rem 0;opacity:.75}
        #stockExchange .stk-depth td{padding:.03125rem .75rem .03125rem 0;white-space:nowrap}
        #stockExchange .stk-depth-cell{cursor:pointer}
        #stockExchange .stk-depth-cell:hover{text-decoration:underline}
        #stockExchange .stk-depth-cell.off{cursor:default;text-decoration:none;opacity:.5}
        #stockExchange .stk-sub{margin:.375rem 0 0 0;padding:.375rem 0 0 0;border-top:.03125rem dashed rgba(128,128,128,.35);font-size:.875rem}
        #stockExchange .stk-sub label{margin-right:.5rem;cursor:pointer;white-space:nowrap}
        #stockExchange .stk-modebtn{cursor:pointer;padding:0 .4rem;border:.0625rem solid currentColor;border-radius:.25rem;font-size:.75rem;margin-right:.375rem;white-space:nowrap;flex:none}
        #stockExchange .stk-modebtn.off{opacity:.4}
        #stockExchange .stk-side{margin-bottom:.375rem}
        #stockExchange .stk-side-head{display:flex;align-items:center;flex-wrap:wrap;margin-bottom:.125rem}
        #stockExchange .stk-side-row{display:flex;align-items:center;flex-wrap:nowrap;margin-left:1.35rem}
        #stockExchange .stk-side input{width:4.5rem;margin-right:.375rem;flex:none}
        #stockExchange .stk-side .stk-resolved{white-space:nowrap;min-width:0;overflow:hidden;text-overflow:ellipsis}
        #stockExchange .stk-msg{min-height:1.3rem;line-height:1.3rem;font-size:.875rem;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
    </style>`));
    }

    let wrap = $(`<div id="stockExchange"></div>`);
    $('#miscNew').append(wrap);
    let inputStyle = 'background:transparent;color:inherit;border:1px solid currentColor;border-radius:.25rem;padding:0 .25rem;';

    // Top bar: balance and the wallet toggle
    wrap.append($(`<div class="stk-top"><h3 class="has-text-info">${loc('resource_Ocoin_name')}: <span>{{ ocoinText() }}</span>&nbsp;<span id="stkNet" class="stk-net" :class="netClass()">({{ netText() }})</span></h3>&nbsp;<span v-if="reservedOcoin() > 0" class="has-text-warning">({{ reservedText() }})</span><b-tooltip :label="helpText()" position="is-bottom" size="is-large" multilined animated><span class="stk-help has-text-warning">?</span></b-tooltip><span id="stkGold" role="button" class="stk-gold order has-text-warning" @click="openGold()">${loc('stock_gold_button')}: {{ goldText() }}</span><span role="button" class="stk-toggle" @click="toggleWallet()">{{ s.stockWalletOpen ? '▾' : '▸' }} ${loc('stock_wallet')}</span></div>`));

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

    // Each level is clickable: it buys/sells everything from the best price through that level in one go
    // (you can't fill a deeper level without also taking the ones in front of it), instead of repeating
    // Buy/Sell one keyMultiplier chunk at a time to clear out a level.
    let depth = $(`<table class="stk-depth"><thead><tr><th class="has-text-danger">${loc('stock_asks')}</th><th class="has-text-success">${loc('stock_bids')}</th></tr></thead><tbody></tbody></table>`);
    main.append(depth);
    let depthRow = $(`<tr v-for="(row, i) in d.depth" :key="i"></tr>`);
    depth.find('tbody').append(depthRow);
    depthRow.append($(`<td><b-tooltip :label="askFillTip(i)" position="is-bottom" size="is-small" multilined animated><span role="button" class="has-text-danger stk-depth-cell" :class="{ off: !canFillAsk(i) }" @click="fillAsk(i)">{{ row.ask }}</span></b-tooltip></td>`));
    depthRow.append($(`<td><b-tooltip :label="bidFillTip(i)" position="is-bottom" size="is-small" multilined animated><span role="button" class="has-text-success stk-depth-cell" :class="{ off: !canFillBid(i) }" @click="fillBid(i)">{{ row.bid }}</span></b-tooltip></td>`));
    // These three lines are always there and always one line tall (long text is cut off with an ellipsis and stays readable in
    // the title tooltip), so nothing above the Buy/Sell buttons changes height while you trade.
    main.append($(`<div class="stk-line" :title="d.spreadText"><span>{{ d.spreadText }}</span></div>`));
    main.append($(`<div class="stk-line" :title="d.holdText"><span>{{ d.holdText }}</span></div>`));
    main.append($(`<div class="stk-line" :title="d.plText"><span :class="d.plClass">{{ d.plText }}</span></div>`));
    // Buy/Sell sit right under those fixed-height lines and above everything that grows or shrinks (the allocation table, the
    // take-profit/stop-loss panel that only exists while you hold lots, the order form), so the buttons stay put while you trade.
    let btns = $(`<div class="market-item stk-flow stk-btns"></div>`);
    main.append(btns);
    btns.append($(`<b-tooltip :label="d.buyTip" position="is-bottom" size="is-small" multilined animated><span role="button" class="order has-text-success" :class="{ off: !d.canBuy }" @click="buyLots(false)">{{ d.buyBtn }}</span></b-tooltip>`));
    btns.append($(`<b-tooltip :label="d.buyMaxTip" position="is-bottom" size="is-small" multilined animated><span role="button" class="order has-text-success" :class="{ off: !d.canBuy }" @click="buyLots(true)">${loc('stock_buy_max')}</span></b-tooltip>`));
    btns.append($(`<b-tooltip :label="d.sellTip" position="is-bottom" size="is-small" multilined animated><span role="button" class="order has-text-danger" :class="{ off: !d.canSell }" @click="sellLots(false)">{{ d.sellBtn }}</span></b-tooltip>`));
    btns.append($(`<b-tooltip :label="d.sellAllTip" position="is-bottom" size="is-small" multilined animated><span role="button" class="order has-text-danger" :class="{ off: !d.canSell }" @click="sellLots(true)">${loc('stock_sell_all')}</span></b-tooltip>`));

    // Lots are split between the production bonus and the storage bonus (one or the other per lot). Not for the special
    // stocks (Morale/Power/Birthrate), which have their own flat bonus per lot.
    main.append($(`<table v-if="d.canAlloc" class="stk-alloc"><tbody>
        <tr><td>{{ d.allocProdLabel }}</td><td><span role="button" class="sub" @click="shiftStore(d.res, 1)" :aria-label="d.allocProdLess"><span>&laquo;</span></span><span class="current">{{ d.prodLots }}</span><span role="button" class="add" @click="shiftStore(d.res, -1)" :aria-label="d.allocProdMore"><span>&raquo;</span></span></td><td>{{ d.prodBonus }}</td></tr>
        <tr><td>{{ d.allocStoreLabel }}</td><td><span role="button" class="sub" @click="shiftStore(d.res, -1)" :aria-label="d.allocStoreLess"><span>&laquo;</span></span><span class="current">{{ d.storeLots }}</span><span role="button" class="add" @click="shiftStore(d.res, 1)" :aria-label="d.allocStoreMore"><span>&raquo;</span></span></td><td>{{ d.storeBonus }}</td></tr>
    </tbody></table>`));
    // Take-profit / stop-loss for the lots you already hold. Each side covers only the lots you type in - not
    // necessarily all of them - and can be a price or a % away from your average cost.
    let exitPanel = $(`<div v-if="d.res && (d.lots > d.exitFree || true) && d.lots > 0" class="stk-sub"></div>`);
    main.append(exitPanel);
    exitPanel.append($(`<div style="margin-bottom:.25rem;">${loc('stock_exit_title')} <span class="has-text-warning">{{ d.exitFreeText }}</span></div>`));
    let tpSide = $(`<div class="stk-side"></div>`);
    exitPanel.append(tpSide);
    let tpHead = $(`<div class="stk-side-head"></div>`);
    tpSide.append(tpHead);
    tpHead.append($(`<label class="has-text-success"><input type="checkbox" v-model="ex.tpOn"> ${loc('stock_take_profit')}</label>`));
    tpHead.append($(`<span role="button" class="stk-modebtn" :class="{ off: ex.tpMode !== 'price' }" @click="ex.tpMode = 'price'">${loc('stock_mode_price')}</span>`));
    tpHead.append($(`<span role="button" class="stk-modebtn" :class="{ off: ex.tpMode !== 'pct' }" @click="ex.tpMode = 'pct'">${loc('stock_mode_pct')}</span>`));
    let tpRow = $(`<div v-if="ex.tpOn" class="stk-side-row"></div>`);
    tpSide.append(tpRow);
    tpRow.append($(`<input v-if="ex.tpMode === 'price'" type="number" min="0" step="any" v-model.number="ex.tpPrice" style="${inputStyle}" placeholder="${loc('stock_order_price')}">`));
    tpRow.append($(`<input v-else type="number" min="0" step="any" v-model.number="ex.tpPct" style="${inputStyle}" placeholder="%">`));
    tpRow.append($(`<input type="number" min="1" step="1" v-model.number="ex.tpLots" style="${inputStyle}" placeholder="${loc('stock_order_lots')}">`));
    tpRow.append($(`<span class="stk-resolved has-text-warning">{{ d.tpPriceText }}</span>`));
    let slSide = $(`<div class="stk-side"></div>`);
    exitPanel.append(slSide);
    let slHead = $(`<div class="stk-side-head"></div>`);
    slSide.append(slHead);
    slHead.append($(`<label class="has-text-danger"><input type="checkbox" v-model="ex.slOn"> ${loc('stock_stop_loss')}</label>`));
    slHead.append($(`<span role="button" class="stk-modebtn" :class="{ off: ex.slMode !== 'price' }" @click="ex.slMode = 'price'">${loc('stock_mode_price')}</span>`));
    slHead.append($(`<span role="button" class="stk-modebtn" :class="{ off: ex.slMode !== 'pct' }" @click="ex.slMode = 'pct'">${loc('stock_mode_pct')}</span>`));
    let slRow = $(`<div v-if="ex.slOn" class="stk-side-row"></div>`);
    slSide.append(slRow);
    slRow.append($(`<input v-if="ex.slMode === 'price'" type="number" min="0" step="any" v-model.number="ex.slPrice" style="${inputStyle}" placeholder="${loc('stock_order_price')}">`));
    slRow.append($(`<input v-else type="number" min="0" step="any" v-model.number="ex.slPct" style="${inputStyle}" placeholder="%">`));
    slRow.append($(`<input type="number" min="1" step="1" v-model.number="ex.slLots" style="${inputStyle}" placeholder="${loc('stock_order_lots')}">`));
    slRow.append($(`<span class="stk-resolved has-text-warning">{{ d.slPriceText }}</span>`));
    exitPanel.append($(`<div style="display:flex;align-items:center;flex-wrap:nowrap;"><b-tooltip :label="d.exitTip" position="is-bottom" size="is-small" multilined animated><span role="button" class="order" :class="{ off: !d.exitOk }" @click="placeExit()">${loc('stock_order_place')}</span></b-tooltip></div>`));
    // The "why can't I place this" message has its own always-present one-line slot instead of appearing next to the button, so
    // neither the button nor anything below it moves when the message shows up or changes length (full text on hover).
    exitPanel.append($(`<div class="stk-msg has-text-warning" :title="d.exitErr">{{ d.exitErr }}</div>`));


    // Orders for the selected stock
    main.append($(`<div class="stk-title"><h3 class="has-text-info">${loc('stock_orders')}</h3></div>`));
    let form = $(`<div id="stockOrderForm" class="market-item stk-flow stk-plain"></div>`);
    main.append(form);
    let selectStyle = `margin-right:.5rem;${inputStyle}`;
    form.append($(`<b-tooltip :label="typeHint()" position="is-bottom" size="is-medium" multilined animated><select v-model="st.form.type" @change="resetPrice()" style="${selectStyle}">${ORDER_TYPES.map(t => `<option value="${t}">${orderLabel(t)}</option>`).join('')}</select></b-tooltip>`));
    form.append($(`<span role="button" class="stk-modebtn" :class="{ off: st.form.priceMode !== 'price' }" @click="setPriceMode('price')">${loc('stock_mode_price')}</span>`));
    form.append($(`<span role="button" class="stk-modebtn" :class="{ off: st.form.priceMode !== 'pct' }" @click="setPriceMode('pct')">${loc('stock_mode_pct')}</span>`));
    form.append($(`<input v-if="st.form.priceMode === 'price'" type="number" min="0" step="any" v-model.number="st.form.price" style="width:6.5rem;margin-right:.5rem;${inputStyle}" placeholder="${loc('stock_order_price')}">`));
    form.append($(`<input v-else type="number" min="0" step="any" v-model.number="st.form.pct" style="width:5rem;margin-right:.5rem;${inputStyle}" placeholder="%">`));
    form.append($(`<input type="number" min="1" step="1" v-model.number="st.form.lots" style="width:4.5rem;margin-right:.5rem;${inputStyle}" placeholder="${loc('stock_order_lots')}">`));
    form.append($(`<b-tooltip :label="orderTip()" position="is-bottom" size="is-small" multilined animated><span role="button" class="order has-text-success" :class="{ off: orderError() !== '' }" @click="place()">${loc('stock_order_place')}</span></b-tooltip>`));
    // The notes under the order form (percent resolved to a price, rounding, why the order is not allowed) share one always-present
    // one-line slot, so the order list and the bracket panel below do not jump when a note appears or disappears (full text on hover).
    main.append($(`<div class="stk-note stk-msg has-text-warning" :title="formNote()" style="margin-left:0;">{{ formNote() }}</div>`));

    // Optional take-profit / stop-loss attached to a pending buy: activates once the buy fills, covering whatever
    // it actually bought (all of it - a partially filled buy protects only the part that went through).
    let bracket = $(`<div v-if="st.form.type === 'buyLimit' || st.form.type === 'buyStop'" class="stk-sub"></div>`);
    main.append(bracket);
    let btpSide = $(`<div class="stk-side"></div>`);
    bracket.append(btpSide);
    let btpHead = $(`<div class="stk-side-head"></div>`);
    btpSide.append(btpHead);
    btpHead.append($(`<label class="has-text-success"><input type="checkbox" v-model="st.form.tpOn"> ${loc('stock_attach_tp')}</label>`));
    btpHead.append($(`<span role="button" class="stk-modebtn" :class="{ off: st.form.tpMode !== 'price' }" @click="st.form.tpMode = 'price'">${loc('stock_mode_price')}</span>`));
    btpHead.append($(`<span role="button" class="stk-modebtn" :class="{ off: st.form.tpMode !== 'pct' }" @click="st.form.tpMode = 'pct'">${loc('stock_mode_pct')}</span>`));
    let btpRow = $(`<div v-if="st.form.tpOn" class="stk-side-row"></div>`);
    btpSide.append(btpRow);
    btpRow.append($(`<input v-if="st.form.tpMode === 'price'" type="number" min="0" step="any" v-model.number="st.form.tpPrice" style="${inputStyle}" placeholder="${loc('stock_order_price')}">`));
    btpRow.append($(`<input v-else type="number" min="0" step="any" v-model.number="st.form.tpPct" style="${inputStyle}" placeholder="%">`));
    let bslSide = $(`<div class="stk-side"></div>`);
    bracket.append(bslSide);
    let bslHead = $(`<div class="stk-side-head"></div>`);
    bslSide.append(bslHead);
    bslHead.append($(`<label class="has-text-danger"><input type="checkbox" v-model="st.form.slOn"> ${loc('stock_attach_sl')}</label>`));
    bslHead.append($(`<span role="button" class="stk-modebtn" :class="{ off: st.form.slMode !== 'price' }" @click="st.form.slMode = 'price'">${loc('stock_mode_price')}</span>`));
    bslHead.append($(`<span role="button" class="stk-modebtn" :class="{ off: st.form.slMode !== 'pct' }" @click="st.form.slMode = 'pct'">${loc('stock_mode_pct')}</span>`));
    let bslRow = $(`<div v-if="st.form.slOn" class="stk-side-row"></div>`);
    bslSide.append(bslRow);
    bslRow.append($(`<input v-if="st.form.slMode === 'price'" type="number" min="0" step="any" v-model.number="st.form.slPrice" style="${inputStyle}" placeholder="${loc('stock_order_price')}">`));
    bslRow.append($(`<input v-else type="number" min="0" step="any" v-model.number="st.form.slPct" style="${inputStyle}" placeholder="%">`));
    bracket.append($(`<div class="stk-msg has-text-warning" :title="bracketErr()" style="margin-top:.25rem;">{{ bracketErr() }}</div>`));
    main.append($(`<div v-for="o in orders" :key="o.id" class="market-item stk-orderline"><span>{{ o.text }}</span><span role="button" class="order has-text-danger" @click="cancel(o.id)">${loc('stock_order_cancel')}</span></div>`));

    // Watchlist
    let listCol = $(`<div class="stk-list"><div class="stk-listhead">${loc('stock_watchlist')}</div><div class="stk-listwrap"><div class="stk-listscroll"></div></div></div>`);
    layout.append(listCol);
    listCol.find('.stk-listscroll').append($(`<div v-for="r in list" :key="r.res" class="stk-item" :class="{ on: r.res === cur }" @click="select(r.res)"><div class="stk-row1"><span class="stk-iname">{{ r.name }}</span><span>{{ r.priceText }}</span></div><div class="stk-row2"><span class="stk-badges"><span v-if="r.lots > 0" class="has-text-warning">{{ r.lotsText }}</span><span v-if="r.orderCount > 0">{{ r.ordersText }}</span><b v-if="r.evText" :class="r.evClass">{{ r.evText }}</b></span><span :class="r.chgClass">{{ r.chgText }}</span></div></div>`));
}

export function drawStocks_s2($ctx){
        vBind({
        el: `#stockExchange`,
        data: {
            st: global.stocks,
            mk: global.stocks.market,
            res: global.resource,
            s: global.settings,
            ex: global.stocks.exit,
            hv: -1,
            ranges: $ctx.RANGES
        },
        computed: {
            // The stock shown in the chart (the selected one, or the first listed one)
            cur(){
                let defs = liveStockDefs().filter(listed);
                if (defs.length === 0){
                    return '';
                }
                return defs.some(d => d.res === global.stocks.sel) ? global.stocks.sel : defs[0].res;
            },
            // Watchlist entries
            list(){
                let out = [];
                let range = global.settings.stockRange;
                liveStockDefs().forEach(function(def){
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
                void st.rev;    // the book changes without Vue seeing individual levels come and go
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
                let free = Math.max(0, st.lots - committedSellLots(st));
                let ex = global.stocks.exit;
                let tpPrice = ex.tpMode === 'price' ? ex.tpPrice : (st.spent > 0 ? tpPriceFromPct(st.spent / st.lots, ex.tpPct) : 0);
                let slPrice = ex.slMode === 'price' ? ex.slPrice : (st.spent > 0 ? slPriceFromPct(st.spent / st.lots, ex.slPct) : 0);
                tpPrice = snapPrice(st, tpPrice);
                slPrice = snapPrice(st, slPrice);
                // 'side' has no generic stock_order_err_side string (only per-order-type variants like
                // stock_order_err_side_buyLimit exist, which don't apply here), so it needs its own message -
                // otherwise loc() falls back to returning the raw key as text.
                let exitCode = this.exitError(tpPrice, slPrice);
                let exitErrText = exitCode === '' ? '' : (exitCode === 'side' ? loc('stock_exit_err_side') : loc(`stock_order_err_${exitCode}`,[MAX_ORDERS]));
                return {
                    res: res,
                    name: stockName(res),
                    lots: st.lots,
                    exitFree: free,
                    exitFreeText: loc('stock_exit_free',[fmt(free, 0)]),
                    tpPriceText: ex.tpOn ? loc('stock_pct_resolved') + ' ' + fmt(tpPrice) : '',
                    slPriceText: ex.slOn ? loc('stock_pct_resolved') + ' ' + fmt(slPrice) : '',
                    exitOk: exitCode === '',
                    exitErr: exitErrText,
                    exitTip: loc('stock_exit_tip'),
                    priceText: `${fmt(st.price)} ${loc('resource_Ocoin_name')}`,
                    chgText: `${chg >= 0 ? '▲' : '▼'} ${Math.abs(chg).toFixed(2)}%`,
                    chgClass: chg >= 0 ? 'has-text-success' : 'has-text-danger',
                    evText: st.ev ? loc(st.ev.type === 'boom' ? 'stock_event_boom' : 'stock_event_crash') : '',
                    evClass: st.ev ? (st.ev.type === 'boom' ? 'has-text-success' : 'has-text-danger') : '',
                    depth: this.depthRows(st),
                    // The real current gap between the best ask and best bid, as a % of the mid price - this already
                    // includes any push your own trading left on the book (st.spread alone would understate it).
                    spreadText: loc('stock_spread',[((ask - bid) / st.price * 100).toFixed(2)]),
                    canAlloc: !isSpecial(res) && st.lots > 0,
                    storeLots: fmt(storageLots(st), 0),
                    prodBonus: '+' + +(productionLots(st) * LOT_BONUS * 100).toFixed(2) + '%',
                    storeBonus: '+' + +(storageLots(st) * STORAGE_BONUS * 100).toFixed(2) + '%',
                    prodLots: fmt(productionLots(st), 0),
                    allocProdLabel: loc('stock_alloc_prod'),
                    allocStoreLabel: loc('stock_alloc_store'),
                    allocProdLess: loc('stock_alloc_prod_less'),
                    allocProdMore: loc('stock_alloc_prod_more'),
                    allocStoreLess: loc('stock_alloc_store_less'),
                    allocStoreMore: loc('stock_alloc_store_more'),
                    holdText: res === 'Dividend'
                        ? loc('stock_hold_dividend',[fmt(st.lots, 0), +(st.lots * OCOIN_YIELD_PER_LOT * 100).toFixed(2), fmt(ocoinYield(global.stocks.ocoin, st.lots))])
                        : isSpecial(res)
                        ? loc('stock_hold_special',[fmt(st.lots, 0), fmt(res === 'Army' ? armyCapBonus(st.lots) : st.lots * specialBonusPerLot(res)), loc(`stock_stat_${res}`)])
                        : loc('stock_hold',[fmt(st.lots, 0), +(productionLots(st) * LOT_BONUS * 100).toFixed(2), loc(`resource_${res}_name`)]),
                    plText: st.lots > 0 ? loc('stock_pl',[fmt(st.spent), fmt(value), signed(pl), plPct.toFixed(1)]) : '',
                    plClass: st.lots === 0 ? '' : (pl >= 0 ? 'has-text-success' : 'has-text-danger'),
                    canBuy: buyN > 0,
                    canSell: sellN > 0,
                    buyBtn: `${loc('resource_market_buy')} ×${q}`,
                    sellBtn: `${loc('resource_market_sell')} ×${q}`,
                    buyTip: loc('stock_buy_tip',[fmt(buyShow, 0), fmt(buyQ.cost), fmt(buyQ.avg), fmt(buyQ.next)]),
                    buyMaxTip: loc('stock_buy_tip',[fmt(buyMax, 0), fmt(buyMaxQ.cost), fmt(buyMaxQ.avg), fmt(buyMaxQ.next)]),
                    sellTip: loc('stock_sell_tip',[fmt(sellN, 0), fmt(sellQ.proceeds), fmt(sellQ.avg), fmt(sellQ.next)]),
                    sellAllTip: loc('stock_sell_tip',[fmt(st.lots, 0), fmt(sellAllQ.proceeds), fmt(sellAllQ.avg), fmt(sellAllQ.next)])
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
            // 5-level order-book depth for the chart panel: one row per price level, best price first on both sides.
            depthRows(st){
                let asks = bookLevels(st, 'ask', 5);
                let bids = bookLevels(st, 'bid', 5);
                let cell = function(L){
                    // ★ marks how many of the lots at that price are your own resting orders
                    return L.qty > 0 ? `${fmt(L.price)} ×${fmt(L.qty, 0)}${L.own > 0 ? ` ★${fmt(L.own, 0)}` : ''}` : '–';
                };
                let rows = [];
                for (let i = 0; i < 5; i++){
                    rows.push({ ask: cell(asks[i]), bid: cell(bids[i]) });
                }
                return rows;
            },
            helpText(){
                return [
                    loc('stock_ocoin_rate',[OCOIN_RATE, OCOIN_BUY_FEE * 100]),
                    loc('stock_lot_hint',[LOT_BONUS * 100, STORAGE_BONUS * 100]),
                    loc('stock_special_hint',[MORALE_BONUS_PER_LOT, POWER_BONUS_PER_LOT, BIRTH_BONUS_PER_LOT, ARMY_BONUS_PER_LOT]),
                    loc('stock_dividend_hint',[+(OCOIN_YIELD_PER_LOT * 100).toFixed(2)]),
                    loc('stock_book_hint')
                ].join(' ');
            },
            goldText(){
                return fmt(goldBarCount(global.settings));
            },
            // Popup to swap Ocoin <-> Gold Bar
            openGold(){
                this.$buefy.modal.open({
                    parent: this,
                    component: { template: '<div id="modalBox" class="modalBox"></div>' }
                });
                let checkExist = setInterval(function(){
                    if ($('#modalBox').length > 0){
                        clearInterval(checkExist);
                        drawGoldModal();
                    }
                }, 50);
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
            // dir: +1 moves lots from production to storage, -1 moves them back; one keyMultiplier chunk per click.
            shiftStore(res, dir){
                let st = global.stocks && global.stocks.market && global.stocks.market[res];
                if (st && !isSpecial(res)){
                    setStorageLots(st, storageLots(st) + dir * keyMultiplier());
                }
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
                if (Math.abs(flow) < 1e-9 || (flow < 0 && !global.settings.stockAutoOn)){
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
            netText(){
                let net = ocoinFlow().net;
                return (Math.abs(net) < 1e-9 ? '0' : signed(net)) + '/s';
            },
            netClass(){
                let net = ocoinFlow().net;
                return net > 1e-9 ? 'has-text-success' : net < -1e-9 ? 'has-text-danger' : '';
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
                settleStock(res);
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
                settleStock(res);
            },
            // --- Order-book depth: click level i to buy/sell everything from the best price through that level.
            // Row i is the i-th price level of the book: the lots to fill are everything from the best price through it
            // (the quote walks the same levels, so the numbers match exactly).
            askFillLots(i){
                let res = this.cur;
                if (!res){
                    return 0;
                }
                return bookLevels(global.stocks.market[res], 'ask', i + 1)[i].cum;
            },
            bidFillLots(i){
                let res = this.cur;
                if (!res){
                    return 0;
                }
                return bookLevels(global.stocks.market[res], 'bid', i + 1)[i].cum;
            },
            canFillAsk(i){
                let res = this.cur;
                if (!res){
                    return false;
                }
                let st = global.stocks.market[res];
                return Math.min(this.askFillLots(i), maxBuyLots(st, global.stocks.ocoin)) > 0;
            },
            canFillBid(i){
                let res = this.cur;
                if (!res){
                    return false;
                }
                let st = global.stocks.market[res];
                return Math.min(this.bidFillLots(i), st.lots) > 0;
            },
            askFillTip(i){
                let res = this.cur;
                if (!res){
                    return '';
                }
                let st = global.stocks.market[res];
                let m = Math.min(this.askFillLots(i), maxBuyLots(st, global.stocks.ocoin));
                if (!(m > 0)){
                    return loc('stock_order_err_funds');
                }
                let q = buyQuote(st, m);
                return loc('stock_buy_tip',[fmt(m, 0), fmt(q.cost), fmt(q.avg), fmt(q.next)]);
            },
            bidFillTip(i){
                let res = this.cur;
                if (!res){
                    return '';
                }
                let st = global.stocks.market[res];
                let m = Math.min(this.bidFillLots(i), st.lots);
                if (!(m > 0)){
                    return loc('stock_order_err_holdings');
                }
                let q = sellQuote(st, m);
                return loc('stock_sell_tip',[fmt(m, 0), fmt(q.proceeds), fmt(q.avg), fmt(q.next)]);
            },
            fillAsk(i){
                let res = this.cur;
                if (!res){
                    return;
                }
                let st = global.stocks.market[res];
                let m = Math.min(this.askFillLots(i), maxBuyLots(st, global.stocks.ocoin));
                if (!(m > 0)){
                    return;
                }
                let cost = executeBuy(st, m);
                global.stocks.ocoin = Math.max(0, global.stocks.ocoin - cost);
                settleStock(res);
            },
            fillBid(i){
                let res = this.cur;
                if (!res){
                    return;
                }
                let st = global.stocks.market[res];
                let m = Math.min(this.bidFillLots(i), st.lots);
                if (!(m > 0)){
                    return;
                }
                global.stocks.ocoin += executeSell(st, m);
                settleStock(res);
            },
            // --- Limit / stop orders on the selected stock ---
            fmtPrice(p){
                return fmt(p);
            },
            setPriceMode(mode){
                let f = global.stocks.form;
                if (f.priceMode !== mode){
                    f.priceMode = mode;
                    this.resetPrice();
                }
            },
            resetPrice(){
                let res = this.cur;
                if (!res){
                    return;
                }
                let st = global.stocks.market[res];
                let f = global.stocks.form;
                if (f.priceMode === 'price'){
                    f.price = suggestPrice(st, f.type);
                }
                else {
                    // A sensible default % on the correct side of the current quote for this order type
                    f.pct = 5;
                }
                f.tpPrice = snapPrice(st, askPrice(st) * 1.1);
                f.slPrice = snapPrice(st, askPrice(st) * 0.9);
            },
            // The actual price the form will use: resolves the % mode against the live book, same direction as
            // suggestPrice (buy limit = below the ask, buy stop = above it, sell limit = above the bid, sell stop
            // = below it), so entering the same % always means "that much further from the current quote".
            effPrice(){
                let res = this.cur;
                let f = global.stocks.form;
                if (f.priceMode === 'price'){
                    return f.price;
                }
                if (!res){
                    return 0;
                }
                let st = global.stocks.market[res];
                let pct = f.pct || 0;
                switch (f.type){
                    case 'buyLimit': return askPrice(st) * (1 - pct / 100);
                    case 'buyStop': return askPrice(st) * (1 + pct / 100);
                    case 'sellLimit': return bidPrice(st) * (1 + pct / 100);
                    default: return bidPrice(st) * (1 - pct / 100);
                }
            },
            // The price that will really be placed: the typed price rounded to the nearest price level of this stock
            effSnapPrice(){
                let res = this.cur;
                let p = this.effPrice();
                return res ? snapPrice(global.stocks.market[res], p) : p;
            },
            // Shown when the typed price (or the price a % resolves to) is not exactly on a price level
            roundNote(){
                let res = this.cur;
                if (!res){
                    return '';
                }
                let st = global.stocks.market[res];
                let p = this.effPrice();
                if (!(p > 0) || !isFinite(p)){
                    return '';
                }
                let snapped = snapPrice(st, p);
                if (Math.abs(snapped - p) <= stepOf(st) * 1e-6){
                    return '';
                }
                return loc('stock_price_rounded',[fmt(stepOf(st)), fmt(snapped)]);
            },
            orderError(){
                let res = this.cur;
                let f = global.stocks.form;
                if (!res){
                    return 'type';
                }
                return validateOrder(global.stocks, res, f.type, this.effSnapPrice(), f.lots) || '';
            },
            orderTip(){
                let f = global.stocks.form;
                if (!this.cur){
                    return '';
                }
                let lots = Math.max(0, Math.floor(f.lots || 0));
                return isBuyOrder(f.type)
                    ? loc('stock_order_tip_buy',[fmt(lots, 0), fmt(lots * (this.effSnapPrice() || 0))])
                    : loc('stock_order_tip_sell',[fmt(lots, 0)]);
            },
            // What the chosen order type does (tooltip on the type dropdown)
            typeHint(){
                return loc(`stock_order_hint_${global.stocks.form.type}`);
            },
            // Only shown when the order cannot be placed yet
            // Everything worth saying about the order being typed, as one line (see the single note slot under the form)
            formNote(){
                let parts = [];
                if (global.stocks.form.priceMode === 'pct'){
                    parts.push(loc('stock_pct_resolved') + ' ' + this.fmtPrice(this.effSnapPrice()));
                }
                parts.push(this.roundNote());
                parts.push(this.orderHint());
                return joinNotes(parts);
            },
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
            // Resolves the attach-to-buy TP/SL prices from the form, honoring price/% mode (base = the buy's own price)
            bracketPrices(){
                let f = global.stocks.form;
                if (!isBuyOrder(f.type)){
                    return { tpPrice: null, slPrice: null };
                }
                let buyPrice = this.effSnapPrice();
                let tpPrice = f.tpOn ? (f.tpMode === 'price' ? f.tpPrice : tpPriceFromPct(buyPrice, f.tpPct)) : null;
                let slPrice = f.slOn ? (f.slMode === 'price' ? f.slPrice : slPriceFromPct(buyPrice, f.slPct)) : null;
                return { tpPrice: tpPrice, slPrice: slPrice };
            },
            bracketErr(){
                let f = global.stocks.form;
                if (!isBuyOrder(f.type) || (!f.tpOn && !f.slOn)){
                    return '';
                }
                let { tpPrice, slPrice } = this.bracketPrices();
                let res = this.cur;
                let st = res ? global.stocks.market[res] : null;
                if (st){
                    tpPrice = tpPrice !== null ? snapPrice(st, tpPrice) : null;
                    slPrice = slPrice !== null ? snapPrice(st, slPrice) : null;
                }
                let bad = validateBracket(this.effSnapPrice(), tpPrice, slPrice);
                if (bad === 'tp'){
                    return loc('stock_bracket_err_tp');
                }
                if (bad === 'sl'){
                    return loc('stock_bracket_err_sl');
                }
                return '';
            },
            place(){
                if (this.orderError() !== '' || this.bracketErr() !== ''){
                    return;
                }
                let f = global.stocks.form;
                let res = this.cur;
                let price = this.effSnapPrice();
                let bracket = isBuyOrder(f.type) && (f.tpOn || f.slOn) ? this.bracketPrices() : null;
                let out = placeOrder(global.stocks, res, f.type, price, f.lots, bracket);
                if (out.ok){
                    messageQueue(loc('stock_msg_placed',[stockName(res), orderLabel(f.type), fmt(out.order.lots, 0), fmt(out.order.price)]), 'info', false, ['minor_events']);
                }
            },
            cancel(id){
                let res = this.cur;
                if (res){
                    cancelOrder(global.stocks, res, id);
                }
            },
            // --- Take-profit / stop-loss on the lots you already hold ---
            exitError(tpPrice, slPrice){
                let res = this.cur;
                let ex = global.stocks.exit;
                if (!res || (!ex.tpOn && !ex.slOn)){
                    return '';
                }
                let st = global.stocks.market[res];
                let free = Math.max(0, st.lots - committedSellLots(st));
                if (ex.tpOn && !(ex.tpLots >= 1)){
                    return 'lots';
                }
                if (ex.slOn && !(ex.slLots >= 1)){
                    return 'lots';
                }
                if (ex.tpOn && !(tpPrice > bidPrice(st))){
                    return 'side';
                }
                if (ex.slOn && !(slPrice < bidPrice(st))){
                    return 'side';
                }
                let sameSlice = ex.tpOn && ex.slOn && ex.tpLots === ex.slLots;
                let needed = sameSlice ? ex.tpLots : (ex.tpOn ? ex.tpLots : 0) + (ex.slOn ? ex.slLots : 0);
                if (needed > free){
                    return 'holdings';
                }
                return '';
            },
            placeExit(){
                let res = this.cur;
                let ex = global.stocks.exit;
                if (!res || (!ex.tpOn && !ex.slOn)){
                    return;
                }
                let st = global.stocks.market[res];
                let avg = st.lots > 0 ? st.spent / st.lots : 0;
                let tpPrice = ex.tpOn ? (ex.tpMode === 'price' ? ex.tpPrice : tpPriceFromPct(avg, ex.tpPct)) : null;
                let slPrice = ex.slOn ? (ex.slMode === 'price' ? ex.slPrice : slPriceFromPct(avg, ex.slPct)) : null;
                if (this.exitError(tpPrice, slPrice) !== ''){
                    return;
                }
                let sameSlice = ex.tpOn && ex.slOn && ex.tpLots === ex.slLots;
                let placed = [];
                if (sameSlice){
                    let out = placeExitOrders(global.stocks, res, ex.tpLots, tpPrice, slPrice);
                    if (out.ok){
                        if (out.tp){ placed.push(loc('stock_take_profit')); }
                        if (out.sl){ placed.push(loc('stock_stop_loss')); }
                    }
                }
                else {
                    if (ex.tpOn){
                        let out = placeExitOrders(global.stocks, res, ex.tpLots, tpPrice, null);
                        if (out.ok){ placed.push(loc('stock_take_profit')); }
                    }
                    if (ex.slOn){
                        let out = placeExitOrders(global.stocks, res, ex.slLots, null, slPrice);
                        if (out.ok){ placed.push(loc('stock_stop_loss')); }
                    }
                }
                if (placed.length > 0){
                    messageQueue(loc('stock_msg_exit_placed',[stockName(res), placed.join(' + ')]), 'info', false, ['minor_events']);
                    ex.tpOn = false;
                    ex.slOn = false;
                }
            }
        }
    });
}

export function drawStocks_s3($ctx){
    let netTimer = null;
    popover('stkNet', function(){
        return $(netBreakdownHtml());
    }, {
        elm: '#stkNet',
        classes: 'breakdown has-background-light has-text-dark',
        in: function(){
            // Keep the numbers live while the popover is open
            clearInterval(netTimer);
            netTimer = setInterval(function(){
                let pop = $('#popper');
                if (pop.length === 0 || pop.data('id') !== 'stkNet'){
                    clearInterval(netTimer);
                    return;
                }
                pop.empty().append($(netBreakdownHtml()));
            }, 500);
        },
        out: function(){
            clearInterval(netTimer);
        }
    });

        if (!(global.stocks.form.price > 0)){
        let first = liveStockDefs().filter(listed)[0];
        if (first){
            global.stocks.form.price = suggestPrice(global.stocks.market[first.res], global.stocks.form.type);
        }
    }
}
