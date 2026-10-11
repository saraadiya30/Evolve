// galaxyOffers: tawaran galaksi. Modul daun (core/vars).
import { global } from '../core/vars.js';

export function galaxyOffers(){
    let offers = [
        {
            buy: { res: 'Deuterium', vol: 5 },
            sell: { res: 'Helium_3', vol: 25 }
        },
        {
            buy: { res: 'Neutronium', vol: 2.5 },
            sell: { res: 'Copper', vol: 200 }
        },
        {
            buy: { res: 'Adamantite', vol: 3 },
            sell: { res: 'Iron', vol: 300 }
        },
        {
            buy: { res: 'Elerium', vol: 1 },
            sell: { res: 'Oil', vol: 125 }
        },
        {
            buy: { res: 'Nano_Tube', vol: 10 },
            sell: { res: 'Titanium', vol: 20 }
        },
        {
            buy: { res: 'Graphene', vol: 25 },
            sell: { res: global.race['kindling_kindred'] || global.race['smoldering'] ? (global.race['smoldering'] ? 'Chrysotile' : 'Stone') : 'Lumber', vol: 1000 }
        },
        {
            buy: { res: 'Stanene', vol: 40 },
            sell: { res: 'Aluminium', vol: 800 }
        },
        {
            buy: { res: 'Bolognium', vol: 0.75 },
            sell: { res: 'Uranium', vol: 4 }
        },
        {
            buy: { res: 'Vitreloy', vol: 1 },
            sell: { res: 'Infernite', vol: 1 }
        }
    ];
    return offers;
}
