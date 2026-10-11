// getStructNumActive: jumlah bangunan aktif per jenis. Modul daun (core, requirements, terraform_lab, grid_defs), dipisah dari planet_setup.js supaya action_costs tidak menyeret setup planet.
import { global, p_on, support_on, int_on, gal_on, spire_on } from '../../core/vars.js';
import { checkPowerRequirements } from '../challenge/requirements.js';
import { isStargateOn } from '../../space/terraform_lab.js';
import { gridDefs } from '../../industry/grid_defs.js';

export function getStructNumActive(c_action,wiki){
    let parts = c_action.id.split('-');
    if (!global.hasOwnProperty(parts[0]) || !global[parts[0]].hasOwnProperty(parts[1])){
        return 0;
    }

    // For all 3 struct types (switchable, powered, support), the "on" field is named in the same way
    let num_on = global[parts[0]][parts[1]].on;
    if (!num_on){ // This is also a null check
        return 0;
    }

    // Electricity: production is negative, consumption is positive
    if (c_action.hasOwnProperty('powered') && c_action.powered() > 0) {
        if (global.city.hasOwnProperty('powered') && checkPowerRequirements(c_action)){
            // The p_on struct is empty in the wiki view and right when the page has been reloaded
            if (p_on.hasOwnProperty(parts[1])){
                num_on = Math.min(num_on, p_on[parts[1]]);
            }
        }
        else {
            num_on = 0;
        }
    }

    // Support: production is positive, consumption is negative
    if (c_action.hasOwnProperty('s_type') && c_action.hasOwnProperty('support') && c_action.support() < 0){
        let found_support = false;
        if (support_on.hasOwnProperty(parts[1])){
            found_support = true;
            num_on = Math.min(num_on, support_on[parts[1]]);
        }
        if (int_on.hasOwnProperty(parts[1])){
            found_support = true;
            num_on = Math.min(num_on, int_on[parts[1]]);
        }
        if (gal_on.hasOwnProperty(parts[1])){
            found_support = true;
            num_on = isStargateOn(wiki) ? Math.min(num_on, gal_on[parts[1]]) : 0;
        }
        if (spire_on.hasOwnProperty(parts[1])){
            found_support = true;
            num_on = Math.min(num_on, spire_on[parts[1]]);
        }

        // The support_on structs are empty in the wiki view and right when the page has been reloaded
        // This means that the wiki can be wrong, but we can at least check "max" support
        if (!found_support) {
            let grids = gridDefs();
            let s_r = grids[c_action.s_type].r;
            if (s_r === 'galaxy' && !isStargateOn(wiki)){
                num_on = 0;
            }
            else {
                let s_rs = grids[c_action.s_type].rs;
                let max_s = Math.floor(global[s_r][s_rs].s_max / -c_action.support());
                num_on = Math.min(num_on, max_s);
            }
        }
    }

    return num_on;
}
