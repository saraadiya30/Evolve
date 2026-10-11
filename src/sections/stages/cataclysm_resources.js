// Resource awal skenario Cataclysm: display, max, crates, dan containers. Dulu bagian dari cataclysm_s1/_s2 (pecahan mekanis).
import { global } from '../../core/vars.js';

export function cataclysmResources($ctx){
        global.resource[global.race.species].display = true;
        global.resource.Knowledge.display = true;
        global.resource.Money.display = true;
        global.resource.Food.display = true;

        global.resource.Stone.display = true;
        global.resource.Furs.display = true;
        global.resource.Copper.display = true;
        global.resource.Iron.display = true;
        global.resource.Aluminium.display = true;
        global.resource.Coal.display = true;
        global.resource.Oil.display = true;
        global.resource.Uranium.display = true;
        global.resource.Steel.display = true;
        global.resource.Titanium.display = true;
        global.resource.Alloy.display = true;
        global.resource.Polymer.display = true;
        global.resource.Iridium.display = true;
        global.resource.Helium_3.display = true;
        global.resource.Brick.display = true;
        global.resource.Wrought_Iron.display = true;
        global.resource.Sheet_Metal.display = true;
        global.resource.Mythril.display = true;
        global.resource.Crates.display = true;
        global.resource.Containers.display = true;

        if (!global.race['flier']){
            global.resource.Cement.display = true;
            global.resource.Cement.max = 75000;
            global.resource.Cement.amount = 75000;
        }
        if (!global.race['kindling_kindred'] && !global.race['smoldering']){
            global.resource.Lumber.display = true;
            global.resource.Plywood.display = true;
            global.resource.Lumber.max = 90000;
            global.resource.Lumber.amount = 90000;
            global.resource.Plywood.amount = 50000;
        }
        if (global.race['smoldering']){
            global.resource.Chrysotile.display = true;
            global.resource.Chrysotile.max = 90000;
            global.resource.Chrysotile.amount = 90000;
        }

        global.resource[global.race.species].max = 8;
        global.resource[global.race.species].amount = 8;
        global.resource.Crates.amount = 20;
        global.resource.Containers.amount = 20;
        global.resource.Money.max = 225000;
        global.resource.Money.amount = 225000;
        global.resource.Food.max = 1000;
        global.resource.Food.amount = 1000;
        global.resource.Oil.max = 1000;
        global.resource.Oil.amount = 1000;
        global.resource.Helium_3.max = 1000;
        global.resource.Helium_3.amount = 1000;
        global.resource.Uranium.max = 1000;
        global.resource.Uranium.amount = 1000;
        global.resource.Stone.max = 90000;
        global.resource.Stone.amount = 90000;
        global.resource.Furs.max = 40000;
        global.resource.Furs.amount = 40000;
        global.resource.Copper.max = 75000;
        global.resource.Copper.amount = 75000;
        global.resource.Iron.max = 75000;
        global.resource.Iron.amount = 75000;
        global.resource.Steel.max = 75000;
        global.resource.Steel.amount = 75000;
        global.resource.Aluminium.max = 75000;
        global.resource.Aluminium.amount = 75000;
        global.resource.Titanium.max = 75000;
        global.resource.Titanium.amount = 75000;
        global.resource.Coal.max = 10000;
        global.resource.Coal.amount = 10000;
        global.resource.Alloy.max = 20000;
        global.resource.Alloy.amount = 20000;
        global.resource.Polymer.max = 20000;
        global.resource.Polymer.amount = 20000;
        global.resource.Iridium.max = 1000;
        global.resource.Iridium.amount = 1000;
        global.resource.Brick.amount = 50000;
        global.resource.Wrought_Iron.amount = 50000;
        global.resource.Sheet_Metal.amount = 50000;
        global.resource.Mythril.amount = 8000;

        global.resource.Iridium.crates = 5;
        global.resource.Iridium.containers = 5;
}
