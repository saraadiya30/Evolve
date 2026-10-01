// Kalender per detik: hari, musim, cuaca, dan efek waktu.
import { global } from '../../core/vars.js';
import { traits } from '../../core/registries.js';
import { orbitLength } from '../../races/trait_logic/trait_ranks.js';
import { setWeather } from '../../systems/seasons.js';

export function longLoopCalendar($ctx){
        if (global.city.calendar.day > 0){
            // Time
            global.city.calendar.day++;
            global.stats.days++;
            if (global.city.calendar.day > orbitLength()){
                global.city.calendar.day = 1;
                global.city.calendar.year++;
            }

            if (global.race['cataclysm'] || global.race['orbit_decayed']){
                global.city.calendar.season = -1;
            }
            else {
                let s_segments = global.city.ptrait.includes('elliptical') ? 6 : 4;
                let season_length = Math.round(orbitLength() / s_segments);
                let days = global.city.calendar.day;
                let season = 0;
                while (days > season_length){
                    days -= season_length;
                    season++;
                }
                if (global.city.ptrait.includes('elliptical')){
                    switch (season){
                        case 0:
                            global.city.calendar.season = 0;
                            break;
                        case 1:
                        case 2:
                            global.city.calendar.season = 1;
                            break;
                        case 3:
                            global.city.calendar.season = 2;
                            break;
                        default:
                            global.city.calendar.season = 3;
                            break;
                    }
                }
                else {
                    global.city.calendar.season = season;
                }
            }

            // Weather
            if (global.race['cataclysm'] || global.race['orbit_decayed']){
                global.city.calendar.wind = 0;
                global.city.calendar.temp = 1;
                global.city.calendar.weather = -1;
            }
            else if (Math.rand(0,5) === 0){
                let temp = Math.rand(0,3);
                let sky = Math.rand(0,5);
                let wind = Math.rand(0,3);
                switch(global.city.biome){
                    case 'oceanic':
                    case 'swamp':
                        if (Math.rand(0,2) === 0 && sky > 0){
                            sky--;
                        }
                        break;
                    case 'tundra':
                    case 'taiga':
                        if (global.city.calendar.season === 3){
                            temp = 0;
                        }
                        else if (Math.rand(0,2) === 0 && temp > 0){
                            temp--;
                        }
                        break;
                    case 'desert':
                        if (Math.rand(0,2) === 0 && sky < 4){
                            sky++;
                        }
                        break;
                    case 'ashland':
                        if (Math.rand(0,2) === 0){
                            if (sky < 1){
                                sky++;
                            }
                            else if (sky > 2){
                                sky--;
                            }
                        }
                    case 'volcanic':
                        if (global.city.calendar.season === 1){
                            temp = 2;
                        }
                        else if (Math.rand(0,2) === 0 && temp < 2 && !global.city.ptrait.includes('permafrost')){
                            temp++;
                        }
                        break;
                    default:
                        break;
                }

                switch(global.city.calendar.season){
                    case 0: // Spring
                        if (Math.rand(0,3) === 0 && sky > 0){
                            sky--;
                        }
                        break;
                    case 1: // Summer
                        if (Math.rand(0,3) === 0 && temp < 2){
                            temp++;
                        }
                        break;
                    case 2: // Fall
                        if (Math.rand(0,3) === 0 && wind > 0){
                            wind--;
                        }
                        break;
                    case 3: // Winter
                        if (Math.rand(0,3) === 0 && temp > 0){
                            temp--;
                        }
                        break;
                    default:
                        break;
                }

                if (global.city.ptrait.includes('stormy') && wind > 0){
                    if (global.race['rejuvenated'] || Math.rand(0,2) === 0){
                        wind--;
                    }
                }

                if (sky === 0){
                    if (global.race['rainbow']){
                        global.race['rainbow_active'] = 1;
                    }
                    global.city.calendar.weather = 0;
                }
                else if (sky >= 1 && sky <= 2){
                    if (global.race['rainbow']){
                        global.race['rainbow_active'] = 1;
                    }
                    global.city.calendar.weather = 1;
                }
                else {
                    if (global.race['rainbow'] && global.city.calendar.weather === 0){
                        global.race['rainbow_active'] = Math.rand(10,20);
                    }
                    global.city.calendar.weather = 2;
                    if (global.race['darkness']){
                        if (Math.rand(0, 7 - traits.darkness.vars()[0]) === 0){
                            global.city.calendar.weather = 1;
                        }
                    }
                }
                if (temp === 0){ // Get colder
                    let new_temp = global.city.calendar.temp - 1;
                    if (new_temp < 0){
                        new_temp = 0;
                    }
                    if (global.city.calendar.season === 1 && new_temp === 0){
                        new_temp = 1;
                    }
                    if (new_temp === 0 && global.city.biome === 'hellscape' && !global.city.ptrait.includes('permafrost')){
                        new_temp = 1;
                    }
                    if (new_temp === 0 && global.city.biome === 'eden' && global.city.calendar.season !== 3){
                        new_temp = 1;
                    }
                    global.city.calendar.temp = new_temp;
                }
                else if (temp === 2){ // Get hotter
                    let new_temp = global.city.calendar.temp + 1;
                    if (new_temp > 2){
                        new_temp = 2;
                    }
                    if (global.city.calendar.season === 3 && new_temp === 2){
                        new_temp = 1;
                    }
                    if (new_temp === 2 && global.city.biome === 'eden' && global.city.calendar.season !== 1){
                        new_temp = 1;
                    }
                    global.city.calendar.temp = new_temp;
                }

                global.city.calendar.wind = wind === 0 ? 1 : 0;
            }

            if (global.city.calendar.weather === 2){
                global.city.sun++;
            }
            else {
                global.city.sun = 0;
            }
            if (global.city.calendar.temp === 0){
                global.city.cold++;
            }
            else {
                global.city.cold = 0;
            }
            if (global.city.calendar.temp === 2){
                global.city.hot++;
            }
            else {
                global.city.hot = 0;
            }

            // Moon Phase
            if (!global.race['orbit_decayed']){
                if (global.city.ptrait.includes('retrograde')){
                    global.city.calendar.moon--;
                    if (global.city.calendar.moon < 0){
                        global.city.calendar.moon = 27;
                    }
                }
                else {
                    global.city.calendar.moon++;
                    if (global.city.calendar.moon > 27){
                        global.city.calendar.moon = 0;
                    }
                }
            }

            setWeather();
        }
}
