// Alkimia per tick (konversi resource lewat mana). Dulu bagian dari fastLoopCore_s2.
import { global, breakdown } from '../../core/vars.js';
import { modRes } from '../../functions/resource_mod.js';
import { loc } from '../../core/locale.js';
import { tradeRatio } from '../../config/constants.js';
import { unlockAchieve } from '../../achievements/achievement_logic.js';

export function fastLoopAlchemy($ctx){
        // alchemy
        if (global.tech['alchemy']){
            let totMana = 0;
            let totCrystal = 0;
            let totTransmute = 0;
            Object.keys(global.race.alchemy).forEach(function (res){
                if (global.race.alchemy[res] > 0){
                    let trasmute = Number(global.race.alchemy[res]);
                    if (global.resource.Mana.amount < trasmute){
                        trasmute = global.resource.Mana.amount;
                    }
                    if (global.resource.Crystal.amount < trasmute * 0.15){
                        trasmute = Math.floor(global.resource.Crystal.amount * (1/0.15));
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
