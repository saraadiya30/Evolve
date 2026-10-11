// Rute dagang per tick (beli/jual resource lewat trade route). Dulu bagian dari fastLoopCore_s2.
import { global, breakdown } from '../../core/vars.js';
import { modRes } from '../../functions/resource_mod.js';
import { calc_mastery } from '../../functions/calc_mastery.js';
import { traits } from '../../core/registries.js';
import { fathomCheck } from '../../races/trait_logic/fathom_check.js';
import { govActive } from '../../governor/gov_active.js';
import { loc } from '../../core/locale.js';
import { tradeBuyPrice, tradeSellPrice } from '../../resources/crate_assignment.js';
import { tradeRatio, OCULAR_POWER_CHARM_BASE } from '../../config/constants.js';
import { astroVal } from '../../functions/astrology.js';
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
                        let rate = tradeRatio[res];
                        if (dealVal){
                            rate *= 1 + (dealVal / 100);
                        }
                        if (global.race['persuasive']){
                            rate *= 1 + (traits.persuasive.vars()[0] * global.race['persuasive'] / 100);
                        }
                        if (global.race['merchant']){
                            rate *= 1 + (traits.merchant.vars()[1] / 100);
                        }
                        if (global.race['ocular_power'] && global.race['ocularPowerConfig'] && global.race.ocularPowerConfig.c){
                            let trade = OCULAR_POWER_CHARM_BASE * (traits.ocular_power.vars()[1] / 100);
                            rate *= 1 + (trade / 100);
                        }
                        let fathom = fathomCheck('goblin');
                        if (fathom > 0){
                            rate *= 1 + (traits.merchant.vars(1)[1] / 100 * fathom);
                        }
                        if ($ctx.astroSign === 'capricorn'){
                            rate *= 1 + (astroVal('capricorn')[0] / 100);
                        }
                        if (global.race['devious']){
                            rate *= 1 - (traits.devious.vars()[0] / 100);
                        }
                        if (global.genes['trader']){
                            let mastery = calc_mastery();
                            rate *= 1 + (mastery / 100);
                            if (global.genes.trader >= 2){
                                let coiled = global.prestige.Supercoiled.count;
                                rate *= 1 + (coiled / (coiled + 500));
                            }
                        }
                        if (global.stats.achieve.hasOwnProperty('trade')){
                            let rank = global.stats.achieve.trade.l * 2;
                            if (rank > 10){ rank = 10; }
                            rate *= 1 + (rank / 100);
                        }
                        if (global.race['truepath']){
                            rate *= 1 - (global.civic.foreign.gov3.hstl / 101);
                        }
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
