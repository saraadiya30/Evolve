// Rute dagang per tick (beli/jual resource lewat trade route).
import { global, breakdown } from '../../core/vars.js';
import { modRes } from '../../functions/resource_mod.js';
import { govActive } from '../../governor/gov_active.js';
import { loc } from '../../core/locale.js';
import { tradeBuyPrice, tradeSellPrice, tradeBuyRate } from '../../resources/crate_assignment.js';
import { tradeRatio } from '../../config/constants.js';
import { steelCheck } from '../long/long_loop.js';

export function fastLoopTradeRoutes($ctx){
        breakdown.p.consume.Money[loc('trade')] = 0;

        // trade routes
        if (global.tech['trade'] || (global.race['banana'] && global.tech['primitive'] && global.tech.primitive >= 3)){
            let used_trade = 0;
            let dealVal = govActive('dealmaker',0);
            if (dealVal){
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
                if (exporting < importing){
                    Object.keys(global.resource).forEach(function(res){
                        global.resource[res].trade = 0;
                    });
                }
            }
            Object.keys(global.resource).forEach(function (res){
                let routes = global.resource[res].trade;
                if (routes > 0){
                    used_trade += routes;
                    let price = tradeBuyPrice(res);
                    const affordable_routes = Math.floor(global.resource.Money.amount / (price * $ctx.time_multiplier));
                    routes = Math.min(routes, affordable_routes);

                    if (routes > 0){
                        price *= routes;
                        let rate = tradeBuyRate(res, $ctx.astroSign);
                        modRes(res,routes * $ctx.time_multiplier * rate, false, true);
                        modRes('Money', -(price * $ctx.time_multiplier));
                        breakdown.p.consume.Money[loc('trade')] -= price;
                        breakdown.p.consume[res][loc('trade')] = routes * rate;
                    }
                    steelCheck();
                }
                else if (routes < 0){
                    used_trade -= routes;

                    let rate = tradeRatio[res];
                    if (global.stats.achieve.hasOwnProperty('trade')){
                        let rank = global.stats.achieve.trade.l;
                        if (rank > 5){ rank = 5; }
                        rate *= 1 - (rank / 100);
                    }

                    const affordable_routes = Math.floor(global.resource[res].amount / (rate * $ctx.time_multiplier));
                    routes = Math.max(routes, -affordable_routes);
                    if (routes < 0){
                        let price = tradeSellPrice(res) * routes;
                        modRes(res,routes * $ctx.time_multiplier * rate);
                        modRes('Money', -(price * $ctx.time_multiplier), false, true);
                        breakdown.p.consume.Money[loc('trade')] -= price;
                        breakdown.p.consume[res][loc('trade')] = routes * rate;
                    }
                    steelCheck();
                }
            });
            global.city.market.trade = used_trade;
        }
        if (breakdown.p.consume.Money[loc('trade')] === 0){
            delete breakdown.p.consume.Money[loc('trade')];
        }
}
