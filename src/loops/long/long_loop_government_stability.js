// Protest, scandal, dan batas pajak pemerintahan per detik.
import { global } from '../../core/vars.js';
import { govCivics } from '../../civics/military/government_operations.js';

export function longLoopGovernmentStability($ctx){
        if (global.civic.govern['protest'] && global.civic.govern.protest > 0){
            global.civic.govern.protest--;
        }
        if (global.civic.govern['scandal'] && global.civic.govern.scandal > 0){
            global.civic.govern.scandal--;
        }

        {
            let tax_cap = govCivics('tax_cap');
            let tax_min = govCivics('tax_cap',true);
            if (global.civic.taxes.tax_rate > tax_cap){
                global.civic.taxes.tax_rate = tax_cap;
            }
            else if (global.civic.taxes.tax_rate < tax_min){
                global.civic.taxes.tax_rate = tax_min;
            }
        }
}
