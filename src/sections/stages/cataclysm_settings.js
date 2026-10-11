// Pengaturan UI dan gameplay awal skenario Cataclysm (tab yang terbuka, ARPA). Dulu bagian dari cataclysm_s1/_s2 (pecahan mekanis).
import { global } from '../../core/vars.js';

export function cataclysmSettings($ctx){
        global.settings.showSpace = true;
        global.settings.space.home = true;
        global.settings.space.moon = true;
        global.settings.space.red = true;
        global.settings.space.hell = true;
        global.settings.space.sun = true;
        global.settings.space.gas = true;
        global.settings.space.gas_moon = true;
        global.settings.space.belt = true;
        global.settings.space.dwarf = true;

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
        global.settings.spaceTabs = 1;
        global.settings.showGenetics = true;
        global.settings.arpa.physics = true;
}
