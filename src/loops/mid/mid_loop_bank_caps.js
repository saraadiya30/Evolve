// Batas Money dari bank, eternal bank, titan bank, tau ceti colony, casino, resort, dan banking.
import { global, breakdown, int_on, p_on, gal_on } from '../../core/vars.js';
import { structName } from '../../actions/core/structure_ui.js';
import { bank_vault } from '../../actions/core/queue_callbacks.js';
import { casino_vault } from '../../actions/challenge/challenge_rules.js';
import { loc } from '../../core/locale.js';
import { highPopAdjust } from '../../functions/adjusters_basic.js';
import { spatialReasoning } from '../../resources/resources.js';
import { planetName } from '../../space/planet_name.js';

export function midLoopBankCaps($ctx){
        if (global.city['bank'] || (global.race['cataclysm'] && p_on['spaceport'])){
            let vault = global.race['cataclysm'] || global.race['orbit_decayed'] ? bank_vault() * 4 : bank_vault();
            let banks = global.race['cataclysm'] || global.race['orbit_decayed'] ? p_on['spaceport'] : global.city['bank'].count;

            let gain = (banks * spatialReasoning(vault));
            $ctx.caps['Money'] += gain;

            if (global.race['cataclysm'] || global.race['orbit_decayed']){
                breakdown.c.Money[loc('space_red_spaceport_title')] = gain+'v';
            }
            else {
                breakdown.c.Money[loc('city_bank')] = gain+'v';
            }

            if (global.interstellar['exchange']){
                if (global.eden['eternal_bank']){ banks += global.eden.eternal_bank.count * 2; }
                let g_vault = spatialReasoning(int_on['exchange'] * (vault * banks / 18));
                if (global.race['inflation']){
                    g_vault *= 2;
                }
                if (global.tech.banking >= 13){
                    if (global.galaxy['freighter']){
                        g_vault *= 1 + (gal_on['freighter'] * 0.03);
                    }
                    if (global.galaxy['super_freighter']){
                        g_vault *= 1 + (gal_on['super_freighter'] * 0.08);
                    }
                }
                g_vault = Math.round(g_vault);
                $ctx.caps['Money'] += g_vault;
                breakdown.c.Money[loc('interstellar_exchange_bd')] = g_vault+'v';
            }
        }

        if (global.eden['eternal_bank']){
            let vault = bank_vault() * (global.race['warlord'] ? 20 : 10);
            if (global.race['warlord'] && global.eden['corruptor'] && global.tech.asphodel >= 12){
                vault *= 1 + (p_on['corruptor'] || 0) * 0.08;
            }
            let banks = global.eden.eternal_bank.count;
            let gain = (banks * spatialReasoning(vault));
            $ctx.caps['Money'] += gain;
            breakdown.c.Money[loc('eden_eternal_bank_title')] = gain+'v';
        }

        if (global.space['titan_bank']){
            let vault = bank_vault() * 2;
            let banks = global.space.titan_bank.count;
            let gain = (banks * spatialReasoning(vault));
            $ctx.caps['Money'] += gain;
            breakdown.c.Money[`${planetName().titan} ${loc('city_bank')}`] = gain+'v';
        }

        if (global.tauceti['colony'] && global.tech['isolation']){
            let vault = bank_vault() * 25;
            let gain = (global.tauceti.colony.count * spatialReasoning(vault));
            $ctx.caps['Money'] += gain;
            breakdown.c.Money[loc('tau_home_colony')] = gain+'v';
        }

        if (global.city['casino'] || global.space['spc_casino'] || global.tauceti['tauceti_casino'] || global.portal['hell_casino']){
            let casinos = 0;
            if (global.city['casino'] && global.city.casino.count > 0){
                casinos += global.city.casino.count;
            }
            if (global.space['spc_casino'] && global.space.spc_casino.count > 0){
                casinos += global.space.spc_casino.count;
            }
            if (global.tauceti['tauceti_casino'] && global.tauceti.tauceti_casino.count > 0){
                casinos += global.tauceti.tauceti_casino.count;
            }
            if (global.portal['hell_casino'] && global.portal.hell_casino.count > 0){
                casinos += global.portal.hell_casino.count;
            }

            let vault = casinos * casino_vault();
            $ctx.caps['Money'] += vault;
            breakdown.c.Money[structName('casino')] = vault+'v';
        }
        if (global.galaxy['resort']){
            let vault = p_on['resort'] * spatialReasoning(global.tech['world_control'] ? 1875000 : 1500000);
            $ctx.caps['Money'] += vault;
            breakdown.c.Money[loc('galaxy_resort')] = vault+'v';
        }
        if (global.tech['banking'] >= 4){
            let cm = 250;
            if (global.tech.banking >= 14){
                cm = 1000000;
            }
            else if (global.tech.banking >= 11){
                cm = 1000;
            }
            else if (global.tech.banking >= 6){
                cm = 600;
            }
            let gain = cm * (global.resource[global.race.species].amount + global.civic.garrison.workers);
            if (global.race['high_pop']){
                gain = highPopAdjust(gain);
            }
            $ctx.caps['Money'] += gain;
            breakdown.c.Money[global.tech.banking >= 14 ? loc('tech_crypto_currency') : loc('tech_bonds')] = gain+'v';
        }
}
