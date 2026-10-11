// soulForgeSoldiers: jumlah prajurit soul forge. Modul daun (core, jobs/job_scale, adjusters_basic, registries.hooks), dipisah dari fortress_defense.js supaya army_rating tidak mengimpor layar benteng.
import { global, p_on } from '../../core/vars.js';
import { jobScale } from '../../civics/jobs/job_scale.js';
import { hooks } from '../../core/registries.js';
import { highPopAdjust } from '../../functions/adjusters_basic.js';

export function soulForgeSoldiers(wiki){
    let base = global.race['warlord'] ? 400 : 650;
    let num_gun_emplacement = wiki ? (global.portal?.gun_emplacement?.on ?? 0) : p_on['gun_emplacement'];
    let num_soldiers_saved = num_gun_emplacement * (global.tech.hell_gun >= 2 ? jobScale(2) : jobScale(1));

    // To avoid divide-by-0 type issues, force the average soldier combat rating to be at least 1
    let avg_rating = Math.max(hooks.armyRating(1, 'hellArmy'), highPopAdjust(1));
    let soldiers = Math.ceil(base / avg_rating);
    soldiers = Math.max(0, soldiers - num_soldiers_saved);

    if (global.race['hivemind']){
        // Permit actual soldiers to count as a group for combat rating adjustment
        // Gun emplacements use the combat rating of the remaining soldiers
        // Both soldiers=0 and soldiers=1 cases use the combat rating of 1 soldier alone
        soldiers = 0;
        while ((soldiers + num_soldiers_saved) * avg_rating < base){
            soldiers++;
            avg_rating = hooks.armyRating(soldiers, 'hellArmy') / soldiers;
            avg_rating = Math.max(avg_rating, highPopAdjust(1));
        }
    }

    return soldiers;
}
