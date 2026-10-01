// Pengaturan UI dan gameplay awal skenario Lone Survivor.
import { global } from '../../core/vars.js';

export function loneSurvivorSettings($ctx){
        global.settings.showSpace = false;
        global.settings.showTau = true;
        global.settings.tau.home = true;

        global.settings.showCity = false;
        global.settings.showIndustry = true;
        global.settings.showPowerGrid = true;
        global.settings.showResearch = true;
        global.settings.showCivic = true;
        global.settings.showResources = true;
        global.settings.showMarket = true;
        global.settings.showStorage = true;
        global.settings.civTabs = 1;
        global.settings.spaceTabs = 6;
        global.settings.showGenetics = true;
        global.settings.arpa.physics = true;
        global.settings.arpa.genetics = true
}
