// Batas resource khusus universe evil (primitive tech). Dulu bagian dari midLoop_s2.
import { global, breakdown, int_on, support_on, p_on } from '../../core/vars.js';
import { actions } from '../../core/registries.js';
import { templeCount } from '../../functions/temple_count.js';
import { structName } from '../../actions/core/structure_ui.js';
import { loc } from '../../core/locale.js';
import { garrisonSize } from '../../civics/military/garrison.js';
import { petMorale } from '../../systems/morale_core.js';
import { highPopAdjust } from '../../functions/adjusters_basic.js';

export function midLoopEvilUniverseCaps($ctx){
        if (global.race.universe === 'evil' && global.tech['primitive'] && global.tech.primitive >= 3){
            global.resource.Authority.display = true;
            let garrison = garrisonSize() || 0;

            if (global.civic.govern.type === 'autocracy'){
                let gain = 10;
                $ctx.caps.Authority += gain;
                breakdown.c.Authority[loc('govern_autocracy')] = gain+'v';
            }
            else if (global.civic.govern.type === 'oligarchy'){
                let gain = 20;
                $ctx.caps.Authority += gain;
                breakdown.c.Authority[loc('govern_oligarchy')] = gain+'v';
            }
            if (global.city['garrison']){
                let gain = global.city.garrison.on * 0.5;
                $ctx.caps.Authority += gain;
                breakdown.c.Authority[actions.city.garrison.title()] = gain+'v';
            }
            if (global.city['temple'] && !global.race['warlord']){
                let gain = templeCount() * 0.5;
                $ctx.caps.Authority += gain;
                breakdown.c.Authority[structName('temple')] = gain+'v';
            }
            if (global.space['space_barracks']){
                let gain = global.space.space_barracks.on * (global.race['cataclysm'] ? 2 : 1);
                $ctx.caps.Authority += gain;
                breakdown.c.Authority[loc('space_red_space_barracks_title')] = gain+'v';
            }
            if (global.interstellar['cruiser'] && int_on['cruiser']){
                let gain = int_on['cruiser'];
                $ctx.caps.Authority += gain;
                breakdown.c.Authority[loc('interstellar_cruiser_title')] = gain+'v';
            }
            if (global.race['warlord']){
                let gain = global.race?.absorbed?.length || 1;
                $ctx.caps.Authority += gain;
                breakdown.c.Authority[loc('portal_throne_of_evil_title')] = gain+'v';
            }
            if (global.portal['brute']){
                let gain = global.portal.brute.on;
                $ctx.caps.Authority += gain;
                breakdown.c.Authority[loc('portal_brute_bd')] = gain+'v';
            }
            if (global.portal['minions']){
                let gain = global.portal.minions.on;
                $ctx.caps.Authority += gain;
                breakdown.c.Authority[loc('portal_minions_bd')] = gain+'v';
            }
            if (global.race['warlord'] && global.eden['bunker'] && support_on['bunker']){
                let gain = support_on['bunker'];
                $ctx.caps.Authority += gain;
                breakdown.c.Authority[loc('eden_bunker_title')] = gain+'v';
            }
            if (global.race['lone_survivor'] || global.tech['isolation']){
                let gain = p_on['orbital_station'];
                $ctx.caps.Authority += gain;
                breakdown.c.Authority[loc('tau_home_orbital_station')] = gain+'v';
            }

            let pet = 0;
            if (global.race['pet']){
                pet = petMorale(global.race.pet);
                $ctx.caps.Authority += pet;
                breakdown.c.Authority[loc(`event_pet_${global.race.pet.type}_owner`)] = pet+'v';
            }

            global.resource.Authority.amount = global.race['cataclysm'] || global.race['orbit_decayed'] ? 90 : (global.race['lone_survivor'] ? 100 : 80);
            if (global.city.morale.current > 100){
                let excess = global.city.morale.current - 100;
                if (global.civic.govern.type === 'democracy'){
                    excess *= 0.9;
                }
                global.resource.Authority.amount -= excess;
            }

            if (global.civic['garrison']){
                let adjust = 0.7;
                if (global.tech['evil']){
                    adjust += 0.1 * global.tech.evil;
                }
                if (global.portal['fortress']){
                    garrison += global.portal.fortress.garrison - (global.portal.fortress.patrols * global.portal.fortress.patrol_size);
                }
                let gain = highPopAdjust(garrison) * adjust;
                if (global.race['grenadier']){ gain *= 1.75; }
                if (global.civic.govern.type === 'autocracy'){
                    gain *= 1.08;
                }
                else if (global.civic.govern.type === 'dictator'){
                    gain *= 1.12;
                }
                global.resource.Authority.amount += gain;
            }

            if (pet !== 0){
                global.resource.Authority.amount += pet;
            }

            if ((global.race['lone_survivor'] || global.tech['isolation']) && global.tauceti['colony'] && support_on['colony']){
                global.resource.Authority.amount += support_on['colony'] * 5;
            }

            global.resource.Authority.amount = Math.floor(global.resource.Authority.amount);
            if (global.resource.Authority.amount < 0){ global.resource.Authority.amount = 0; }
        }
        else {
            global.resource.Authority.display = false;
        }
}
