// Filter pesan hell dan pengaturan tab portal awal skenario Warlord.
import { global } from '../../core/vars.js';

export function warlordSetupPortalSettings($ctx){
        if (!global.settings.msgFilters.hell.unlocked){
            global.settings.msgFilters.hell.unlocked = true;
            global.settings.msgFilters.hell.vis = true;
        }

        global.settings.showPortal = true;
        global.settings.portal.fortress = false;
        global.settings.portal.badlands = true;
        global.settings.portal.pit = false;
        global.settings.portal.wasteland = true;
        global.settings.portal.ruins = false;
        global.settings.portal.gate = false;
        global.settings.portal.lake = false;
        global.settings.portal.spire = false;
        global.settings.showCargo = false;
        global.settings.spaceTabs = 4;
}
