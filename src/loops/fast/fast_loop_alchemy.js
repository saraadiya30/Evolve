// Alkimia per tick (konversi resource lewat mana).
import { global, breakdown, tmp_vars } from '../../core/vars.js';
import { modRes, timeScale } from '../../functions/resource_mod.js';
import { stockFlags } from '../../stocks/stocks_core.js';
import { loc } from '../../core/locale.js';
import { tradeRatio } from '../../config/constants.js';
import { unlockAchieve } from '../../achievements/achievement_logic.js';

// Alchemy spends Mana/Crystal after they are produced in the same loop. The resource buffer (resetResBuffer) only leaves room for
// max + amount, so when one loop stands for several ticks (accelerated time) and the allocation is bigger than the storage cap,
// production got clipped before alchemy could use it. Reserve exactly what alchemy will draw this loop on top of the buffer.
export function reserveAlchemyBuffer($ctx){
    if (!global.tech['alchemy'] || !global.race.alchemy){
        return;
    }
    let total = 0;
    Object.keys(global.race.alchemy).forEach(function (res){
        let alloc = Number(global.race.alchemy[res]);
        if (alloc > 0){
            total += alloc;
        }
    });
    if (total <= 0){
        return;
    }
    let draw = total * $ctx.time_multiplier * (stockFlags.prod ? timeScale() : 1);
    if (tmp_vars.resource.Mana && tmp_vars.resource.Mana.temp_max > 0){
        tmp_vars.resource.Mana.temp_max += draw;
    }
    if (tmp_vars.resource.Crystal && tmp_vars.resource.Crystal.temp_max > 0){
        tmp_vars.resource.Crystal.temp_max += draw * 0.15;
    }
}

export function fastLoopAlchemy($ctx){
        // alchemy
        if (global.tech['alchemy']){
            let totMana = 0;
            let totCrystal = 0;
            let totTransmute = 0;
            // Everything else that eats Mana is paid first (rituals, Mana-fuelled power plants, ...): breakdown.p.consume.Mana is rebuilt every
            // loop and already holds their per second cost, so keep that much for the next loop. Otherwise an allocation bigger than the
            // production (the Mana surplus is no longer a limit) would drain the storage and starve them.
            let upstreamReserve = 0;
            if (breakdown.p.consume && breakdown.p.consume.Mana){
                let rScale = $ctx.time_multiplier * (stockFlags.prod ? timeScale() : 1);
                Object.keys(breakdown.p.consume.Mana).forEach(function (src){
                    if (src !== loc('tab_alchemy')){
                        upstreamReserve += Math.abs(Number(breakdown.p.consume.Mana[src]) || 0) * rScale;
                    }
                });
                // tiny margin: those consumers compare their cost one by one, so the floating point sum must not end up a hair below it
                upstreamReserve *= 1.000001;
            }
            Object.keys(global.race.alchemy).forEach(function (res){
                if (global.race.alchemy[res] > 0){
                    let trasmute = Number(global.race.alchemy[res]);
                    // trasmute is a rate per second, but this loop only draws trasmute * time_multiplier * timeScale() from storage.
                    // Comparing the per-second rate with the stored amount cut the output whenever the allocation was larger than
                    // the storage cap (e.g. 6400/s allocated, 3400 Mana storage), even though one loop only needs a fraction of it.
                    let loopScale = $ctx.time_multiplier * (stockFlags.prod ? timeScale() : 1);
                    let manaLeft = Math.max(0, global.resource.Mana.amount - upstreamReserve) / loopScale;
                    if (manaLeft < trasmute){
                        trasmute = manaLeft;
                    }
                    let crystalLeft = global.resource.Crystal.amount / (0.15 * loopScale);
                    if (crystalLeft < trasmute){
                        trasmute = Math.floor(crystalLeft);
                    }
                    totTransmute += trasmute;

                    if (trasmute >= $ctx.time_multiplier){
                        let rate = global.resource[res].basic && global.tech.alchemy >= 2 ? tradeRatio[res] * 8 : tradeRatio[res] * 2;
                        if (global.race['witch_hunter']){ rate *= 3; }
                        if (global.stats.achieve['soul_sponge'] && global.stats.achieve.soul_sponge['mg']){
                            rate *= global.stats.achieve.soul_sponge.mg + 1;
                        }
                        modRes(res,trasmute * $ctx.time_multiplier * rate);
                        modRes('Mana', -(trasmute * $ctx.time_multiplier));
                        modRes('Crystal', -(trasmute * 0.15 * $ctx.time_multiplier));
                        totMana -= trasmute;
                        totCrystal -= trasmute * 0.15;
                        breakdown.p.consume[res][loc('tab_alchemy')] = trasmute * rate;
                        if (global.race.universe === 'magic' && !global.resource[res].basic && global.tech.alchemy >= 2){
                            unlockAchieve('fullmetal');
                        }
                    }
                }
            });
            global.race['totTransmute'] = totTransmute;
            breakdown.p.consume.Mana[loc('tab_alchemy')] = totMana;
            breakdown.p.consume.Crystal[loc('tab_alchemy')] = totCrystal;
        }
}
