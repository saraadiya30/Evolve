import { global } from '../core/vars.js';
import { loc } from '../core/locale.js';
import { clearElement } from '../functions/dom_helpers.js';
import { easterEgg } from '../functions/icons_easter_eggs.js';
import { astrologySign, astroVal } from '../functions/astrology.js';

export function setWeather(){
    // Moon Phase
    switch(global.city.calendar.moon){
        case 0:
            global.city.ptrait.includes('retrograde')
                ? $('#moon').removeClass('wi-moon-waxing-crescent-1')
                : $('#moon').removeClass('wi-moon-waning-crescent-6');
            $('#moon').addClass('wi-moon-new');
            break;
        case 1:
            global.city.ptrait.includes('retrograde')
                ? $('#moon').removeClass('wi-moon-waxing-crescent-2')
                : $('#moon').removeClass('wi-moon-new');
            $('#moon').addClass('wi-moon-waxing-crescent-1');
            break;
        case 2:
            global.city.ptrait.includes('retrograde')
                ? $('#moon').removeClass('wi-moon-waxing-crescent-3')
                : $('#moon').removeClass('wi-moon-waxing-crescent-1');
            $('#moon').addClass('wi-moon-waxing-crescent-2');
            break;
        case 3:
            global.city.ptrait.includes('retrograde')
                ? $('#moon').removeClass('wi-moon-waxing-crescent-4')
                : $('#moon').removeClass('wi-moon-waxing-crescent-2');
            $('#moon').addClass('wi-moon-waxing-crescent-3');
            break;
        case 4:
            global.city.ptrait.includes('retrograde')
                ? $('#moon').removeClass('wi-moon-waxing-crescent-5')
                : $('#moon').removeClass('wi-moon-waxing-crescent-3');
            $('#moon').addClass('wi-moon-waxing-crescent-4');
            break;
        case 5:
            global.city.ptrait.includes('retrograde')
                ? $('#moon').removeClass('wi-moon-waxing-crescent-6')
                : $('#moon').removeClass('wi-moon-waxing-crescent-4');
            $('#moon').addClass('wi-moon-waxing-crescent-5');
            break;
        case 6:
            global.city.ptrait.includes('retrograde')
                ? $('#moon').removeClass('wi-moon-first-quarter')
                : $('#moon').removeClass('wi-moon-waxing-crescent-5');
            $('#moon').addClass('wi-moon-waxing-crescent-6');
            break;
        case 7:
            global.city.ptrait.includes('retrograde')
                ? $('#moon').removeClass('wi-moon-waxing-gibbous-1')
                : $('#moon').removeClass('wi-moon-waxing-crescent-6');
            $('#moon').addClass('wi-moon-first-quarter');
            break;
        case 8:
            global.city.ptrait.includes('retrograde')
                ? $('#moon').removeClass('wi-moon-waxing-gibbous-2')
                : $('#moon').removeClass('wi-moon-first-quarter');
            $('#moon').addClass('wi-moon-waxing-gibbous-1');
            break;
        case 9:
            global.city.ptrait.includes('retrograde')
                ? $('#moon').removeClass('wi-moon-waxing-gibbous-3')
                : $('#moon').removeClass('wi-moon-waxing-gibbous-1');
            $('#moon').addClass('wi-moon-waxing-gibbous-2');
            break;
        case 10:
            global.city.ptrait.includes('retrograde')
                ? $('#moon').removeClass('wi-moon-waxing-gibbous-4')
                : $('#moon').removeClass('wi-moon-waxing-gibbous-2');
            $('#moon').addClass('wi-moon-waxing-gibbous-3');
            break;
        case 11:
            global.city.ptrait.includes('retrograde')
                ? $('#moon').removeClass('wi-moon-waxing-gibbous-5')
                : $('#moon').removeClass('wi-moon-waxing-gibbous-3');
            $('#moon').addClass('wi-moon-waxing-gibbous-4');
            break;
        case 12:
            global.city.ptrait.includes('retrograde')
                ? $('#moon').removeClass('wi-moon-waxing-gibbous-6')
                : $('#moon').removeClass('wi-moon-waxing-gibbous-4');
            $('#moon').addClass('wi-moon-waxing-gibbous-5');
            break;
        case 13:
            clearElement($('#moon'));
            global.city.ptrait.includes('retrograde')
                ? $('#moon').removeClass('wi-moon-full')
                : $('#moon').removeClass('wi-moon-waxing-gibbous-5');
            $('#moon').addClass('wi-moon-waxing-gibbous-6');
            break;
        case 14:
            global.city.ptrait.includes('retrograde')
                ? $('#moon').removeClass('wi-moon-waning-gibbous-1')
                : $('#moon').removeClass('wi-moon-waxing-gibbous-6');
            let egg = easterEgg(2);
            if (egg.length > 0){
                $('#moon').append(egg);
            }
            else {
                $('#moon').addClass('wi-moon-full');
            }
            break;
        case 15:
            clearElement($('#moon'));
            global.city.ptrait.includes('retrograde')
                ? $('#moon').removeClass('wi-moon-waning-gibbous-2')
                : $('#moon').removeClass('wi-moon-full');
            $('#moon').addClass('wi-moon-waning-gibbous-1');
            break;
        case 16:
            global.city.ptrait.includes('retrograde')
                ? $('#moon').removeClass('wi-moon-waning-gibbous-3')
                : $('#moon').removeClass('wi-moon-waning-gibbous-1');
            $('#moon').addClass('wi-moon-waning-gibbous-2');
            break;
        case 17:
            global.city.ptrait.includes('retrograde')
                ? $('#moon').removeClass('wi-moon-waning-gibbous-4')
                : $('#moon').removeClass('wi-moon-waning-gibbous-2');
            $('#moon').addClass('wi-moon-waning-gibbous-3');
            break;
        case 18:
            global.city.ptrait.includes('retrograde')
                ? $('#moon').removeClass('wi-moon-waning-gibbous-5')
                : $('#moon').removeClass('wi-moon-waning-gibbous-3');
            $('#moon').addClass('wi-moon-waning-gibbous-4');
            break;
        case 19:
            global.city.ptrait.includes('retrograde')
                ? $('#moon').removeClass('wi-moon-waning-gibbous-6')
                : $('#moon').removeClass('wi-moon-waning-gibbous-4');
            $('#moon').addClass('wi-moon-waning-gibbous-5');
            break;
        case 20:
            global.city.ptrait.includes('retrograde')
                ? $('#moon').removeClass('wi-moon-third-quarter')
                : $('#moon').removeClass('wi-moon-waning-gibbous-5');
            $('#moon').addClass('wi-moon-waning-gibbous-6');
            break;
        case 21:
            global.city.ptrait.includes('retrograde')
                ? $('#moon').removeClass('wi-moon-waning-crescent-1')
                : $('#moon').removeClass('wi-moon-waning-gibbous-6');
            $('#moon').addClass('wi-moon-third-quarter');
            break;
        case 22:
            global.city.ptrait.includes('retrograde')
                ? $('#moon').removeClass('wi-moon-waning-crescent-2')
                : $('#moon').removeClass('wi-moon-third-quarter');
            $('#moon').addClass('wi-moon-waning-crescent-1');
            break;
        case 23:
            global.city.ptrait.includes('retrograde')
                ? $('#moon').removeClass('wi-moon-waning-crescent-3')
                : $('#moon').removeClass('wi-moon-waning-crescent-1');
            $('#moon').addClass('wi-moon-waning-crescent-2');
            break;
        case 24:
            global.city.ptrait.includes('retrograde')
                ? $('#moon').removeClass('wi-moon-waning-crescent-4')
                : $('#moon').removeClass('wi-moon-waning-crescent-2');
            $('#moon').addClass('wi-moon-waning-crescent-3');
            break;
        case 25:
            global.city.ptrait.includes('retrograde')
                ? $('#moon').removeClass('wi-moon-waning-crescent-5')
                : $('#moon').removeClass('wi-moon-waning-crescent-3');
            $('#moon').addClass('wi-moon-waning-crescent-4');
            break;
        case 26:
            global.city.ptrait.includes('retrograde')
                ? $('#moon').removeClass('wi-moon-waning-crescent-6')
                : $('#moon').removeClass('wi-moon-waning-crescent-4');
            $('#moon').addClass('wi-moon-waning-crescent-5');
            break;
        case 27:
            global.city.ptrait.includes('retrograde')
                ? $('#moon').removeClass('wi-moon-new')
                : $('#moon').removeClass('wi-moon-waning-crescent-5');
            $('#moon').addClass('wi-moon-waning-crescent-6');
            break;
    }

    // Temp
    $('#temp').removeClass('wi-thermometer');
    $('#temp').removeClass('wi-thermometer-exterior');
    if (global.city.calendar.temp === 0){
        $('#temp').addClass('wi-thermometer-exterior');
    }
    else if (global.city.calendar.temp === 2){
        $('#temp').addClass('wi-thermometer');
    }

    // Sky
    $('#weather').removeClass('wi-day-sunny');
    $('#weather').removeClass('wi-day-windy');
    $('#weather').removeClass('wi-cloud');
    $('#weather').removeClass('wi-cloudy-gusts');
    $('#weather').removeClass('wi-rain');
    $('#weather').removeClass('wi-storm-showers');
    $('#weather').removeClass('wi-snow');
    $('#weather').removeClass('wi-snow-wind');

    let weather;
    if (global.city.calendar.weather === 0){
        if (global.city.calendar.temp === 0){
            weather = global.city.calendar.wind === 0 ? 'wi-snow' : 'wi-snow-wind';
        }
        else {
            weather = global.city.calendar.wind === 0 ? 'wi-rain' : 'wi-storm-showers';
        }
    }
    else if (global.city.calendar.weather === 1){
        weather = global.city.calendar.wind === 0 ? 'wi-cloud' : 'wi-cloudy-gusts';
    }
    else if (global.city.calendar.weather === 2){
        weather = global.city.calendar.wind === 0 ? 'wi-day-sunny' : 'wi-day-windy';
    }
    $('#weather').addClass(weather);
}

export function seasonDesc(type){
    switch (type){
        case 'moon':
            return moonDescription();
        case 'weather':
            return weatherDescription();
        case 'temp':
            return tempDescription();
        case 'sign':
            return astrologyDescription();
        case 'astrology':
            return astrologySymbol();
        case 'season':
            return seasonDescription();
    }
}

function moonDescription(){
    if (global.race['orbit_decayed']){
        return loc('moon0'); // New Moon
    }
    else if (global.city.calendar.moon === 0){
        return loc('moon1'); // New Moon
    }
    else if (global.city.calendar.moon > 0 && global.city.calendar.moon < 7){
        return loc('moon2'); // Waxing Crescent Moon
    }
    else if (global.city.calendar.moon === 7){
        return loc('moon3'); // First Quarter Moon
    }
    else if (global.city.calendar.moon > 7 && global.city.calendar.moon < 14){
        return loc('moon4'); // Waxing Gibbous Moon
    }
    else if (global.city.calendar.moon === 14){
        return loc('moon5'); // Full Moon
    }
    else if (global.city.calendar.moon > 14 && global.city.calendar.moon < 21){
        return loc('moon6'); // Waning Gibbous Moon
    }
    else if (global.city.calendar.moon === 21){
        return loc('moon7'); // Third Quarter Moon
    }
    else if (global.city.calendar.moon > 21){
        return loc('moon8'); // Waning Crescent Moon
    }
}

function weatherDescription(){
    switch(global.city.calendar.weather){
        case 0:
            if (global.city.calendar.temp === 0){
                return global.city.calendar.wind === 1 ? loc('snowstorm') : loc('snow');
            }
            else {
                return global.city.calendar.wind === 1 ? loc('thunderstorm') : loc('rain');
            }
        case 1:
            return global.city.calendar.wind === 1 ? loc('cloudy_windy') : loc('cloudy');
        case 2:
            return global.city.calendar.wind === 1 ? loc('sunny_windy') : loc('sunny');
    }
}

function tempDescription(){
    switch(global.city.calendar.temp){
        case 0:
            return loc('cold');// weather, cold weather may reduce food output.';
        case 1:
            return loc('moderate');
        case 2:
            return loc('hot');// weather, hot weather may reduce worker productivity.';
    }
}



function astrologyDescription(){
    let sign = astrologySign();
    let desc = `<div>${loc(`sign_description`,[loc(`sign_${sign}`),loc(`sign_${sign}_desc`)])}</div>`;
    desc += `<div>${astroEffect(sign)}</div>`;
    return desc;
}

function astroEffect(sign){
    if (sign === 'pisces' || sign === 'cancer'){
        return global.race['unfavored'] ? loc(`sign_${sign}_unfavored`) : loc(`sign_${sign}_effect`);
    }
    else if (sign === 'scorpio' && global.race['unfavored']){
        return loc(`sign_${sign}_unfavored`,[-(astroVal(sign)[0])]);
    }
    else {
        return global.race['unfavored'] ? loc(`sign_${sign}_unfavored`,[astroVal(sign)[0]]) : loc(`sign_${sign}_effect`,[astroVal(sign)[0]]);
    }
}

function astrologySymbol(){
    let sign = astrologySign();
    return loc(`sign_${sign}_symbol`);
}

function seasonDescription() {
    switch (global.city.calendar.season) {
        case 0:
            return loc('season_spring');
        case 1:
            return loc('season_summer');
        case 2:
            return loc('season_autumn');
        case 3:
            return loc('season_winter');
    }
}
