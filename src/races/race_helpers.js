import { getEaster, getHalloween } from '../functions/functions.js';
import { global } from '../core/vars.js';

// Dipindah dari races.js: dipakai saat LOAD oleh file bagian (races parts), jadi tidak boleh bergantung pada body races.js.

export const date = new Date();

export const easter = getEaster();

export const hallowed = getHalloween();

export function altRace(race,set){
    if (global.settings.boring){
        if (global.race['hrt']){
            delete global.race['hrt'];
        }
        return false;
    }
    switch (race){
        case 'elven':
        case 'capybara':
        case 'centaur':
        case 'wendigo':
        case 'entish':
        case 'yeti':
            {
                if ((date.getMonth() === 11 && date.getDate() >= 17) || (global.race['hrt'] && global.race.hrt === race)){
                    if (set){global.race['hrt'] = race;}
                    return true;
                }
                return false;
            }
        case 'wolven':
        case 'vulpine':
            {
                if (easter.active || (global.race['hrt'] && global.race.hrt === race)){
                    if (set){global.race['hrt'] = race;}
                    return true;
                }
                return false;
            }
        case 'arraak':
            {
                if ((date.getMonth() === 10 && date.getDate() >= 22 && date.getDate() <= 28) || (global.race['hrt'] && global.race.hrt === race)){
                    if (set){global.race['hrt'] = race;}
                    return true;
                }
                return false;
            }
        case 'seraph':
            {
                if ((date.getMonth() === 1 && date.getDate() === 14) || (global.race['hrt'] && global.race.hrt === race)){
                    if (set){global.race['hrt'] = race;}
                    return true;
                }
                return false;
            }
        case 'human':
        case 'tortoisan':
        case 'unicorn':
        case 'junker':
            {
                if (hallowed.active || (global.race['hrt'] && global.race.hrt === race)){
                    if (set){global.race['hrt'] = race;}
                    return true;
                }
                return false;
            }
    }
    return false;
}
