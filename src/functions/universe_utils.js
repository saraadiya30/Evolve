import { global } from '../core/vars.js';

export function universeAffix(universe){
    universe = universe || global.race.universe;
    switch (universe){
        case 'evil':
            return 'e';
        case 'antimatter':
            return 'a';
        case 'heavy':
            return 'h';
        case 'micro':
            return 'm';
        case 'magic':
            return 'mg';
        default: // Standard
            return 'l';
    }
}

export const universe_affixes = ['l', 'h', 'a', 'e', 'm', 'mg'];
