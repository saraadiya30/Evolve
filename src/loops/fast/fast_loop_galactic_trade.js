// Dagang galaksi per tick (freighter dan super freighter).
import { global, breakdown, gal_on } from '../../core/vars.js';
import { modRes, timeScale } from '../../functions/resource_mod.js';
import { stockFlags } from '../../stocks/stocks_core.js';
import { TRADE_ROUTE_MULT } from '../../config/constants.js';
import { calc_mastery } from '../../functions/calc_mastery.js';
import { piracy } from '../../space/space_requirements.js';
import { traits } from '../../core/registries.js';
import { fathomCheck } from '../../races/trait_logic/fathom_check.js';
import { loc } from '../../core/locale.js';
import { galaxyOffers } from '../../resources/galaxy_offers.js';
import { astroVal } from '../../functions/astrology.js';

// How many of `routes` identical routes can each pay `cost` out of `available` (the rest cannot be paid). A route that costs
// nothing is always fulfilled; no routes means none.
export function affordableRoutes(routes, available, cost){
    if (!(routes > 0)){
        return 0;
    }
    if (!(cost > 0)){
        return routes;
    }
    return Math.min(routes, Math.max(0, Math.floor(available / cost)));
}

export function fastLoopGalacticTrade($ctx){
        if (global.galaxy['trade'] && (gal_on.hasOwnProperty('freighter') || gal_on.hasOwnProperty('super_freighter'))){
            let cap = 0;
            if (global.galaxy['freighter']){
                cap += gal_on['freighter'] * 2 * TRADE_ROUTE_MULT;
            }
            if (global.galaxy['super_freighter']){
                cap += gal_on['super_freighter'] * 5 * TRADE_ROUTE_MULT;
            }
            global.galaxy.trade.max = cap;

            let used = 0;
            let offers = galaxyOffers();
            for (let i=0; i<offers.length; i++){
                let exprt_res = offers[i].sell.res;
                let exprt_vol = offers[i].sell.vol;
                let imprt_res = offers[i].buy.res;
                let imprt_vol = offers[i].buy.vol;
                let exp_total = 0;
                let imp_total = 0;

                if (global.race['persuasive']){
                    imprt_vol *= 1 + (global.race['persuasive'] / 100);
                }
                if (global.race['merchant']){
                    imprt_vol *= 1 + (traits.merchant.vars()[1] / 100);
                }
                let fathom = fathomCheck('goblin');
                if (fathom > 0){
                    imprt_vol *= 1 + (traits.merchant.vars(1)[1] / 100 * fathom);
                }
                if ($ctx.astroSign === 'capricorn'){
                    imprt_vol *= 1 + (astroVal('capricorn')[0] / 100);
                }
                if (global.race['devious']){
                    imprt_vol *= 1 - (traits.devious.vars()[0] / 100);
                }
                if (global.genes['trader']){
                    let mastery = calc_mastery();
                    imprt_vol *= 1 + (mastery / 100);
                }
                if (global.stats.achieve.hasOwnProperty('trade')){
                    let rank = global.stats.achieve.trade.l;
                    if (rank > 5){ rank = 5; }
                    imprt_vol *= 1 + (rank / 50);
                    exprt_vol *= 1 - (rank / 100);
                }

                used += global.galaxy.trade[`f${i}`];
                if (used > cap){
                    global.galaxy.trade[`f${i}`] -= used - cap;
                    if (global.galaxy.trade[`f${i}`] < 0){
                        global.galaxy.trade[`f${i}`] = 0;
                    }
                }

                let pirate = piracy('gxy_gorddon');
                // Every route of an offer trades the same amount, so they are settled together instead of one by one: a ship
                // gives hundreds of routes (TRADE_ROUTE_MULT) and one modRes call per route would make this loop that much heavier.
                const routes = global.galaxy.trade[`f${i}`];
                if (routes > 0){
                    const cost = exprt_vol * $ctx.time_multiplier;
                    // modRes multiplies production-loop amounts by timeScale(), so affordability has to use that same amount
                    const seen = cost * (stockFlags.prod ? timeScale() : 1);
                    const done = affordableRoutes(routes, global.resource[exprt_res].amount, seen);
                    exp_total += exprt_vol * routes;
                    if (done > 0){
                        modRes(exprt_res,-(cost * done));
                        modRes(imprt_res,imprt_vol * $ctx.time_multiplier * pirate * done);
                        imp_total += imprt_vol * done;
                    }
                    if (done < routes){
                        // The first route that cannot be paid drains what is left, as it did when routes were settled one by one
                        modRes(exprt_res,-cost);
                    }
                }

                if (exp_total > 0){
                    if (breakdown.p.consume[exprt_res][loc('trade')]){
                        breakdown.p.consume[exprt_res][loc('trade')] -= exp_total;
                    }
                    else {
                        breakdown.p.consume[exprt_res][loc('trade')] = -(exp_total);
                    }
                }

                if (imp_total > 0){
                    if (breakdown.p.consume[imprt_res][loc('trade')]){
                        breakdown.p.consume[imprt_res][loc('trade')] += imp_total;
                    }
                    else {
                        breakdown.p.consume[imprt_res][loc('trade')] = imp_total;
                    }
                }

                if (pirate < 1){
                    if (breakdown.p.consume[imprt_res][loc('galaxy_piracy')]){
                        breakdown.p.consume[imprt_res][loc('galaxy_piracy')] += -((1 - pirate) * imp_total);
                    }
                    else {
                        breakdown.p.consume[imprt_res][loc('galaxy_piracy')] = -((1 - pirate) * imp_total);
                    }
                }

                if (breakdown.p.consume[exprt_res][loc('trade')] === 0){
                    delete breakdown.p.consume[exprt_res][loc('trade')]
                }
                if (breakdown.p.consume[imprt_res][loc('trade')] === 0){
                    delete breakdown.p.consume[imprt_res][loc('trade')]
                }
            }
            global.galaxy.trade.cur = used;
        }
}
