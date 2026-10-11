// Pemasukan uang per tick (rawCash, discharge, pajak warga). Dulu ujung fastLoopCore_s13.
import { global, breakdown, p_on } from '../../core/vars.js';
import { modRes } from '../../functions/resource_mod.js';
import { getShrineBonus } from '../../functions/run_stats_helpers.js';
import { traits, actions } from '../../core/registries.js';
import { govActive } from '../../governor/gov_active.js';
import { govEffect } from '../../civics/gov_effect.js';
import { govCivics } from '../../civics/military/government_operations.js';
import { production } from '../../resources/prod.js';
import { highPopAdjust } from '../../functions/adjusters_basic.js';
import { loc } from '../../core/locale.js';
import { structName } from '../../actions/core/structure_ui.js';
import { workerScale } from '../../civics/jobs/worker_scale.js';
import { faithTempleCount } from '../../resources/aether_alchemy.js';

export function fastLoopIncome($ctx){
        // Income
        $ctx.rawCash = $ctx.FactoryMoney ? $ctx.FactoryMoney * $ctx.global_multiplier * $ctx.hunger : 0;
        if ($ctx.FactoryMoney && global.race['discharge'] && global.race['discharge'] > 0){$ctx.rawCash *= 0.5;}
        if (global.tech['currency'] >= 1){
            let citizens = global.resource[global.race.species].amount + global.civic.garrison.workers - global.civic.unemployed.workers;
            let income_base = citizens;
            if (global.race['high_pop']){
                income_base = highPopAdjust(income_base);
            }
            income_base *= global.race['truepath'] ? 0.2 : 0.4;
            if (global.race['greedy']){
                income_base *= 1 - (traits.greedy.vars()[0] / 100);
            }
            if (global.tech['isolation']){
                income_base *= 15;
            }
            income_base *= production('psychic_cash');

            if ($ctx.fed && global.tech['banking'] && global.tech['banking'] >= 2){
                let impact = +workerScale(global.civic.banker.impact,'banker');
                if (global.tech['banking'] >= 10){
                    impact += 0.02 * global.tech['stock_exchange'];
                }
                if (global.race['truthful']){
                    impact *= 1 - (traits.truthful.vars()[0] / 100);
                }
                if (global.civic.govern.type === 'republic'){
                    impact *= 1 + (govEffect.republic()[0] / 100);
                }
                if (global.race['high_pop']){
                    impact = highPopAdjust(impact);
                }
                income_base *= 1 + (global.civic.banker.workers * impact);
            }
            
            let extra_income = 0;
            if (govActive('extravagant',0) && global.city['apartment']){
                let mult = income_base / citizens;
                let pop = p_on['apartment'] * actions.city.apartment.citizens();
                pop = Math.min(citizens, pop);
                extra_income = pop * mult * (govCivics('tax_cap') / 20); //citizens in mansions pay max taxes always.
                income_base -= pop * mult;
            }
            income_base *= (global.civic.taxes.tax_rate / 20);
            income_base += extra_income;
            if (global.civic.govern.type === 'oligarchy'){
                income_base *= 1 - (govEffect.oligarchy()[0] / 100);
            }
            if (global.civic.govern.type === 'corpocracy'){
                income_base *= 0.5;
            }
            if (global.civic.govern.type === 'socialist'){
                income_base *= 1 - (govEffect.socialist()[3] / 100);
            }
            if (global.race['banana']){
                income_base *= 0.05;
            }

            let temple_mult = 1;
            if (global.tech['anthropology'] && global.tech['anthropology'] >= 4 && !global.race['truepath']){
                temple_mult += faithTempleCount() * 0.025;
            }

            let upkeep = 0;
            if (!global.tech['world_control'] && global.civic.govern.type !== 'federation'){
                for (let i=0; i<3; i++){
                    if (global.civic.foreign[`gov${i}`].buy){
                        upkeep += income_base * 0.2;
                    }
                }
            }

            let getShrineResult = getShrineBonus('tax');

            let delta = (income_base - upkeep) * temple_mult * $ctx.hunger * getShrineResult.mult;
            delta *= $ctx.global_multiplier;

            breakdown.p['Money'][loc('morale_tax')] = (income_base) + 'v';
            if (income_base > 0){
                breakdown.p['Money'][`ᄂ${loc('civics_spy_purchase_bd')}`] = -(upkeep) + 'v';
                breakdown.p['Money'][global.race['cataclysm'] || global.race['orbit_decayed'] ? `ᄂ${loc('space_red_ziggurat_title')}` : `ᄂ${structName('temple')}`] = ((temple_mult - 1) * 100) + '%';
                breakdown.p['Money'][`ᄂ${loc('city_shrine')}`] = ((getShrineResult.mult - 1) * 100) + '%';
            }
            breakdown.p['Money'][loc('city_factory')] = $ctx.FactoryMoney + 'v';
            if (global.race['discharge'] && global.race['discharge'] > 0 && $ctx.FactoryMoney > 0){
                breakdown.p['Money'][`ᄂ${loc('evo_challenge_discharge')}`] = '-50%';
            }
            modRes('Money', +(delta * $ctx.time_multiplier).toFixed(2));
            $ctx.rawCash += delta;
        }
}
