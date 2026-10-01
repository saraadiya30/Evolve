// Batas populasi dari seluruh tipe perumahan dan struktur penampung (basic housing sampai arcology, embassy, colony, living quarters, habitat, lodge, hovel, outpost).
import { global, breakdown, support_on, p_on, quantum_level } from '../../core/vars.js';
import { actions, hooks } from '../../core/registries.js';
import { housingLabel } from '../../actions/core/structure_ui.js';
import { bank_vault } from '../../actions/core/queue_callbacks.js';
import { loc } from '../../core/locale.js';
import { jobScale } from '../../civics/jobs/job_scale.js';
import { spatialReasoning } from '../../resources/resources.js';
import { planetName } from '../../space/planet_name.js';

export function midLoopHousingCaps($ctx){
        if (global.city['basic_housing']){
            let pop = global.city.basic_housing.count * actions.city.basic_housing.citizens();
            $ctx.caps[global.race.species] += pop;
            breakdown.c[global.race.species][housingLabel('small')] = pop + 'v';
        }
        if (global.tauceti['tau_housing'] && global.tech['isolation']){
            let pop = global.tauceti.tau_housing.count * actions.tauceti.tau_home.tau_housing.citizens();
            $ctx.caps[global.race.species] += pop;
            breakdown.c[global.race.species][housingLabel('small')] = pop + 'v';
        }
        if (global.city['cottage']){
            let pop = global.city.cottage.count * actions.city.cottage.citizens();
            $ctx.caps[global.race.species] += pop;
            breakdown.c[global.race.species][housingLabel('medium')] = pop + 'v';
            if (global.tech['home_safe']){
                let gain = (global.city['cottage'].count * spatialReasoning(global.tech.home_safe >= 2 ? (global.tech.home_safe >= 3 ? 5000 : 2000) : 1000));
                $ctx.caps['Money'] += gain;
                breakdown.c.Money[housingLabel('medium')] = gain+'v';
            }
        }
        if (global.city['apartment']){
            let pop = p_on['apartment'] * actions.city.apartment.citizens();
            $ctx.caps[global.race.species] += pop;
            breakdown.c[global.race.species][housingLabel('large')] = pop + 'v';
            if (global.tech['home_safe']){
                let gain = (p_on['apartment']  * spatialReasoning(global.tech.home_safe >= 2 ? (global.tech.home_safe >= 3 ? 10000 : 5000) : 2000));
                $ctx.caps['Money'] += gain;
                breakdown.c.Money[housingLabel('large')] = gain+'v';
            }
        }
        if (global.eden['rectory']){
            let pop = p_on['rectory'] * actions.eden.eden_asphodel.rectory.citizens();
            $ctx.caps[global.race.species] += pop;
            breakdown.c[global.race.species][loc(`eden_rectory_title`)] = pop + 'v';
        }
        if (p_on['s_gate'] && global.galaxy['consulate'] && global.galaxy.consulate.count >= 1){
            let pop = actions.galaxy.gxy_alien1.consulate.citizens();
            $ctx.caps[global.race.species] += pop;
            breakdown.c[global.race.species][loc('galaxy_consulate')] = pop + 'v';
        }
        if (p_on['s_gate'] && p_on['embassy'] && global.tech.xeno >= 11){
            let pop = actions.galaxy.gxy_gorddon.embassy.citizens();
            $ctx.caps[global.race.species] += pop;
            breakdown.c[global.race.species][loc('galaxy_embassy')] = pop + 'v';
        }
        if (p_on['s_gate'] && p_on['embassy'] && global.galaxy['dormitory']){
            let pop = p_on['dormitory'] * actions.galaxy.gxy_gorddon.dormitory.citizens();
            $ctx.caps[global.race.species] += pop;
            breakdown.c[global.race.species][loc('galaxy_dormitory')] = pop + 'v';
        }
        if (p_on['arcology']){
            let pop = p_on['arcology'] * actions.portal.prtl_ruins.arcology.citizens();
            $ctx.caps[global.race.species] += pop;
            breakdown.c[global.race.species][loc('portal_arcology_title')] = pop + 'v';
            $ctx.lCaps['garrison'] += p_on['arcology'] * actions.portal.prtl_ruins.arcology.soldiers();

            $ctx.caps['Containers'] += (p_on['arcology'] * Math.round(quantum_level) * 10);
            breakdown.c.Containers[loc('portal_arcology_title')] = (p_on['arcology'] * Math.round(quantum_level) * 10) + 'v';
            $ctx.caps['Crates'] += (p_on['arcology'] * Math.round(quantum_level) * 10);
            breakdown.c.Crates[loc('portal_arcology_title')] = (p_on['arcology'] * Math.round(quantum_level) * 10) + 'v';

            let sup = hooks.hellSupression('ruins');
            let money = (p_on['arcology'] * spatialReasoning(bank_vault() * 8 * sup.supress));
            $ctx.caps['Money'] += money;
            breakdown.c.Money[loc('portal_arcology_title')] = money+'v';
        }

        if (global.portal['bazaar'] && global.portal['spire']){
            let containers = (global.portal.bazaar.count * global.portal.spire.count * 8);
            $ctx.caps['Containers'] += containers;
            breakdown.c.Containers[loc('portal_bazaar_title')] = containers + 'v';
            $ctx.caps['Crates'] += containers;
            breakdown.c.Crates[loc('portal_bazaar_title')] = containers + 'v';

            let money = spatialReasoning(bank_vault() * global.portal.spire.count * global.portal.bazaar.count / 3);
            $ctx.caps['Money'] += money;
            breakdown.c.Money[loc('portal_bazaar_title')] = money+'v';
        }

        if (support_on['colony']){
            let containers = global.tech['isolation'] ? 900 : 250;
            $ctx.caps['Containers'] += (support_on['colony'] * containers);
            breakdown.c.Containers[loc('tau_home_colony')] = (support_on['colony'] * containers) + 'v';
            $ctx.caps['Crates'] += (support_on['colony'] * containers);
            breakdown.c.Crates[loc('tau_home_colony')] = (support_on['colony'] * containers) + 'v';

            let pop = support_on['colony'] * actions.tauceti.tau_home.colony.citizens();
            $ctx.caps[global.race.species] += pop;
            breakdown.c[global.race.species][loc('tau_home_colony')] = pop + 'v';
        }
        if (p_on['operating_base']){
            $ctx.lCaps['garrison'] += Math.min(support_on['operating_base'],p_on['operating_base']) * actions.space.spc_enceladus.operating_base.soldiers();
        }
        if (p_on['fob']){
            $ctx.lCaps['garrison'] += actions.space.spc_triton.fob.soldiers();
        }
        if (global.space['living_quarters']){
            let gain = Math.round(support_on['living_quarters'] * actions.space.spc_red.living_quarters.citizens());
            $ctx.caps[global.race.species] += gain;
            $ctx.lCaps['colonist'] += jobScale(support_on['living_quarters']);
            breakdown.c[global.race.species][`${planetName().red}`] = gain + 'v';

            if ((global.race['cataclysm'] || global.race['orbit_decayed']) && global.tech['home_safe']){
                let gain = (support_on['living_quarters'] * spatialReasoning(global.tech.home_safe >= 2 ? (global.tech.home_safe >= 3 ? 100000 : 50000) : 25000));
                $ctx.caps['Money'] += gain;
                breakdown.c.Money[loc('space_red_living_quarters_title')] = gain+'v';
            }
        }
        if (support_on['biodome'] && (global.race['artifical'] || global.race['orbit_decayed'])){
            let gain = support_on['biodome'] * spatialReasoning(global.race['artifical'] ? 500 : 100);
            $ctx.caps['Food'] += gain;
            breakdown.c.Food[loc('space_red_signal_tower_title')] = gain+'v';
        }
        if (global.space['titan_quarters']){
            let gain = Math.round(support_on['titan_quarters'] * actions.space.spc_titan.titan_quarters.citizens());
            $ctx.caps[global.race.species] += gain;
            $ctx.lCaps['titan_colonist'] += jobScale(support_on['titan_quarters']);
            breakdown.c[global.race.species][`${planetName().titan}`] = gain + 'v';
        }

        if (global.interstellar['habitat'] && p_on['habitat']){
            let pop = p_on['habitat'] * actions.interstellar.int_alpha.habitat.citizens();
            $ctx.caps[global.race.species] += pop;
            breakdown.c[global.race.species][loc('interstellar_habitat_title')] = pop + 'v';
        }
        if (global.interstellar['luxury_condo'] && p_on['luxury_condo']){
            let cit = p_on['luxury_condo'] * actions.interstellar.int_alpha.luxury_condo.citizens();
            $ctx.caps[global.race.species] += cit;
            breakdown.c[global.race.species][loc('tech_luxury_condo')] = cit + 'v';
            let gain = (p_on['luxury_condo']  * spatialReasoning(750000));
            $ctx.caps['Money'] += gain;
            breakdown.c.Money[loc('tech_luxury_condo')] = gain+'v';
        }
        if (global.city['lodge']){
            let cit = global.city.lodge.count * actions.city.lodge.citizens();
            $ctx.caps[global.race.species] += cit;
            breakdown.c[global.race.species][loc('city_lodge')] = cit + 'v';
        }
        if (global.portal['hovel']){
            let cit = global.portal.hovel.count * actions.portal.prtl_wasteland.hovel.citizens();
            $ctx.caps[global.race.species] += cit;
            breakdown.c[global.race.species][loc('portal_hovel_title')] = cit + 'v';
        }
        if (global.space['outpost']){
            let gain = global.space['outpost'].count * spatialReasoning(500);
            $ctx.caps['Neutronium'] += gain;
            breakdown.c.Neutronium[loc('space_gas_moon_outpost_title')] = gain+'v';
        }
}
