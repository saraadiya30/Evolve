// Urutan lengkap setup awal skenario Warlord; dipanggil oleh warlordSetup() di portal/hell/warlord_setup.js.
import { warlordSetupTech } from './warlord_setup_tech.js';
import { warlordSetupSettings } from './warlord_setup_settings.js';
import { warlordSetupResources } from './warlord_setup_resources.js';
import { warlordSetupCivic } from './warlord_setup_civic.js';
import { warlordSetupCitySpace } from './warlord_setup_city_space.js';
import { warlordSetupArpaGarrison } from './warlord_setup_arpa_garrison.js';
import { warlordSetupPortalSettings } from './warlord_setup_portal_settings.js';
import { warlordSetupFortress } from './warlord_setup_fortress.js';
import { warlordSetupJobs } from './warlord_setup_jobs.js';
import { warlordSetupFinish } from './warlord_setup_finish.js';

export function warlordSetupSequence($ctx){
    warlordSetupTech($ctx);
    warlordSetupSettings($ctx);
    warlordSetupResources($ctx);
    warlordSetupCivic($ctx);
    warlordSetupCitySpace($ctx);
    warlordSetupArpaGarrison($ctx);
    warlordSetupPortalSettings($ctx);
    warlordSetupFortress($ctx);
    warlordSetupJobs($ctx);
    warlordSetupFinish($ctx);
}
