import { global } from '../core/vars.js';
import { traits } from '../core/registries.js';

export function astroVal(sign){
    let boosted = global.race['wish'] && global.race['wishStats'] && global.race.wishStats.astro ? true : false;
    let multiplier = 1;
    if (global.race['astrologer']){
        multiplier += global.race['unfavored'] ? -(traits.astrologer.vars()[0] / 100) : traits.astrologer.vars()[0] / 100;
    }
    if (global.race['unfavored']){
        multiplier *= -(traits.unfavored.vars()[0] / 100);
    }
    switch (sign){
        case 'aries': // Combat Rating
            return [boosted ? Math.round(12 * multiplier) : Math.round(10 * multiplier)];
        case 'taurus': // Unification Bonus
            return [+(boosted ? 3 * multiplier : 2 * multiplier).toFixed(2)];
        case 'gemini': // Knowledge
            return [boosted ? Math.round(30 * multiplier) : Math.round(20 * multiplier)];
        case 'cancer': // Soldier Healing
            return [boosted ? Math.round(8 * multiplier) : Math.round(5 * multiplier)];
        case 'leo': // Power
            return [boosted ? 5 * multiplier : 4 * multiplier];
        case 'virgo': // Food Bonus
            return [boosted ? Math.round(20 * multiplier) : Math.round(15 * multiplier)];
        case 'libra': // Pop growth rate
            return [boosted ? Math.round(40 * multiplier) : Math.round(25 * multiplier)];
        case 'scorpio': // Cheaper and more effective spies
            return boosted ? [Math.round(20 * multiplier),2] : [Math.round(12 * multiplier),1];
        case 'sagittarius': // Entertainer Morale
            return [boosted ? 6 * multiplier : 5 * multiplier];
        case 'capricorn': // Trade gains
            return [boosted ? Math.round(20 * multiplier) : Math.round(10 * multiplier)];
        case 'aquarius': // Boosts tourism revenue
            return [boosted ? Math.round(30 * multiplier) : Math.round(20 * multiplier)];
        case 'pisces': // Random Events are more common
            return boosted 
                ? [Math.round(79 * multiplier),Math.round(45 * multiplier)] 
                : [Math.round(49 * multiplier),Math.round(25 * multiplier)];
    }
}

export function astrologySign(){
    const date = new Date();
    if ((date.getMonth() === 0 && date.getDate() >= 20) || (date.getMonth() === 1 && date.getDate() <= 18)){
        return 'aquarius';
    }
    else if ((date.getMonth() === 1 && date.getDate() >= 19) || (date.getMonth() === 2 && date.getDate() <= 20)){
        return 'pisces';
    }
    else if ((date.getMonth() === 2 && date.getDate() >= 21) || (date.getMonth() === 3 && date.getDate() <= 19)){
        return 'aries';
    }
    else if ((date.getMonth() === 3 && date.getDate() >= 20) || (date.getMonth() === 4 && date.getDate() <= 20)){
        return 'taurus';
    }
    else if ((date.getMonth() === 4 && date.getDate() >= 21) || (date.getMonth() === 5 && date.getDate() <= 21)){
        return 'gemini';
    }
    else if ((date.getMonth() === 5 && date.getDate() >= 22) || (date.getMonth() === 6 && date.getDate() <= 22)){
        return 'cancer';
    }
    else if ((date.getMonth() === 6 && date.getDate() >= 23) || (date.getMonth() === 7 && date.getDate() <= 22)){
        return 'leo';
    }
    else if ((date.getMonth() === 7 && date.getDate() >= 23) || (date.getMonth() === 8 && date.getDate() <= 22)){
        return 'virgo';
    }
    else if ((date.getMonth() === 8 && date.getDate() >= 23) || (date.getMonth() === 9 && date.getDate() <= 22)){
        return 'libra';
    }
    else if ((date.getMonth() === 9 && date.getDate() >= 23) || (date.getMonth() === 10 && date.getDate() <= 22)){
        return 'scorpio';
    }
    else if ((date.getMonth() === 10 && date.getDate() >= 23) || (date.getMonth() === 11 && date.getDate() <= 21)){
        return 'sagittarius';
    }
    else if ((date.getMonth() === 11 && date.getDate() >= 22) || (date.getMonth() === 0 && date.getDate() <= 19)){
        return 'capricorn';
    }
    else {
        return 'time itself is broken';
    }
}
