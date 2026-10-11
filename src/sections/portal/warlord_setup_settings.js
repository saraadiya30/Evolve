// Pengaturan UI dan gameplay awal skenario Warlord. Dulu bagian dari warlordSetup_s1/_s2 (pecahan mekanis).
import { global } from '../../core/vars.js';

export function warlordSetupSettings($ctx){
        global.settings.showSpace = false;
        global.settings.showPortal = true;

        global.settings.showCity = false;
        global.settings.showIndustry = true;
        global.settings.showPowerGrid = true;
        global.settings.showResearch = true;
        global.settings.showCivic = true;
        global.settings.showMil = true;
        global.settings.showResources = true;
        global.settings.showMarket = true;
        global.settings.showStorage = true;
        global.settings.civTabs = 1;
        global.settings.spaceTabs = 6;
        global.settings.showGenetics = true;
        global.settings.arpa.physics = true;
        global.settings.arpa.genetics = true
}
