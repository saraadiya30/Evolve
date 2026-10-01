import { global } from '../core/vars.js';
import { loc } from '../core/locale.js';

export function eventActive(event,val){
    switch(event){
        case 'easter':
            return getEaster();
        case 'halloween':
            return getHalloween();
        case 'fool':
            {
                const date = new Date();
                if (!global.settings.boring && date.getMonth() === 3 && date.getDate() === 1){
                    if (val){
                        return date.getFullYear() === val ? true : false;
                    }
                    else {
                        return true;
                    }
                }
                return false;
            }
        case 'launch_day':
            {
                const date = new Date();
                if (!global.settings.boring && date.getMonth() === 4 && date.getDate() === 6){
                    return true;
                }
                return false;
            }
        case 'summer':
            {
                const date = new Date();
                if (!global.settings.boring && date.getMonth() === 5 && [20,21,22].includes(date.getDate())){
                    if (global.city.hasOwnProperty('foundry') && !global.city.foundry.hasOwnProperty('Thermite')){
                        global.city.foundry['Thermite'] = 0;
                    }
                    if (!global.resource.hasOwnProperty('Thermite')){
                        global.resource['Thermite'] = {
                            name: loc(`resource_Thermite_name`),
                            display: false,
                            value: 0,
                            amount: 0,
                            crates: 0,
                            diff: 0,
                            delta: 0,
                            max: -1,
                            rate: 0
                        };
                    }
                    return true;
                }
                else if (global.city.hasOwnProperty('foundry') && global.city.foundry.hasOwnProperty('Thermite')){
                    global.city.foundry.crafting -= global.city.foundry['Thermite'];
                    global.civic.craftsman.workers -= global.city.foundry['Thermite'];
                    global.civic[global.civic.d_job].workers += global.city.foundry['Thermite'];
                    delete global.city.foundry['Thermite'];
                }
                return false;
            }
        case 'firework':
            {
                const date = new Date();
                if (!global.settings.boring && date.getMonth() === 6 && [1,2,3,4].includes(date.getDate()) ){
                    let region = global.race['cataclysm'] || global.race['orbit_decayed'] ? 'space' : 'city';
                    if (!global[region].hasOwnProperty('firework')){
                        global[region]['firework'] = {
                            count: 0,
                            on: 0
                        };
                    }
                    return true;
                }
                else if (global.city.hasOwnProperty('firework') || global.space.hasOwnProperty('firework')){
                    delete global.city['firework'];
                    delete global.space['firework'];
                }
                return false;
            }
    }
    return false;
}

export function getEaster(){
    const date = new Date();
    let year = date.getFullYear();

    if (!global.special.egg.hasOwnProperty(year)){
        global.special.egg[year] = {
            egg1: false,
            egg2: false,
            egg3: false,
            egg4: false,
            egg5: false,
            egg6: false,
            egg7: false,
            egg8: false,
            egg9: false,
            egg10: false,
            egg11: false,
            egg12: false
        };
    }

    if (global.special.egg.hasOwnProperty(year) && !global.special.egg[year].hasOwnProperty('egg13')){
        global.special.egg[year]['egg13'] = false;
        global.special.egg[year]['egg14'] = false;
        global.special.egg[year]['egg15'] = false;
    }

    if (global.special.egg.hasOwnProperty(year) && !global.special.egg[year].hasOwnProperty('egg16')){
        global.special.egg[year]['egg16'] = false;
        global.special.egg[year]['egg17'] = false;
        global.special.egg[year]['egg18'] = false;
    }

    // `month` is the 1-12 month when easter ends, `day` the 1-31 day it begins. Easter event has constant number of days.
	let f = Math.floor,
		// Golden Number - 1
		G = year % 19,
		C = f(year / 100),
		// related to Epact
		H = (C - f(C / 4) - f((8 * C + 13)/25) + 19 * G + 15) % 30,
		// number of days from 21 March to the Paschal full moon
		I = H - f(H/28) * (1 - f(29/(H + 1)) * f((21-G)/11)),
		// weekday for the Paschal full moon
		J = (year + f(year / 4) + I + 2 - C + f(C / 4)) % 7,
		// number of days from 21 March to the Sunday on or before the Paschal full moon
		L = I - J,
		month = 3 + f((L + 40)/44),
        day = L + 28 - 31 * f(month / 4);

    let easter = {
        date: [month-1,day],
        active: false,
        endDate: [month-1,day],
        hint: false,
        hintDate: [month-1,day],
        solve: false,
        solveDate: [month-1,day]
    };

    if (global.settings.boring){
        return easter;
    }

    easter.endDate[1] += 10;
    if ((easter.endDate[0] === 2 && easter.endDate[1] > 31) || (easter.endDate[0] === 3 && easter.endDate[1] > 30)){
        easter.endDate[1] -= easter.endDate[0] === 2 ? 31 : 30;
        easter.endDate[0]++;
    }
    easter.hintDate[1] += 1;
    if ((easter.hintDate[0] === 2 && easter.hintDate[1] > 31) || (easter.hintDate[0] === 3 && easter.hintDate[1] > 30)){
        easter.hintDate[1] -= easter.hintDate[0] === 2 ? 31 : 30;
        easter.hintDate[0]++;
    }
    easter.solveDate[1] += 3;
    if ((easter.solveDate[0] === 2 && easter.solveDate[1] > 31) || (easter.solveDate[0] === 3 && easter.solveDate[1] > 30)){
        easter.solveDate[1] -= easter.solveDate[0] === 2 ? 31 : 30;
        easter.solveDate[0]++;
    }

    let cur_day = date.getDate();
    let cur_month = date.getMonth();

    const isAfterBeginning = cur_month > easter.date[0] || (cur_month === easter.date[0] && cur_day >= easter.date[1]);
    const isBeforeEnd = cur_month < easter.endDate[0] || (cur_month === easter.endDate[0] && cur_day <= easter.endDate[1]);
    if (isAfterBeginning && isBeforeEnd){
        easter.active = true;
        if (cur_month >= easter.hintDate[0] && cur_day >= easter.hintDate[1] && cur_month <= easter.endDate[0] && cur_day <= easter.endDate[1]){
            easter.hint = true;
        }
        if (cur_month >= easter.solveDate[0] && cur_day >= easter.solveDate[1] && cur_month <= easter.endDate[0] && cur_day <= easter.endDate[1]){
            easter.solve = true;
        }
    }

    return easter;
}

export function getHalloween(){
    const date = new Date();
    let year = date.getFullYear();

    if (!global.special.trick.hasOwnProperty(year)){
        global.special.trick[year] = {
            trick1: false,
            trick2: false,
            trick3: false,
            trick4: false,
            trick5: false,
            trick6: false,
            trick7: false,
            treat1: false,
            treat2: false,
            treat3: false,
            treat4: false,
            treat5: false,
            treat6: false,
            treat7: false
        };
    }

    let halloween = {
        date: [9,28],
        active: false,
        endDate: [10,4],
        hint: false,
        hintDate: [9,29],
        solve: false,
        solveDate: [9,31]
    };

    if (global.settings.boring){
        return halloween;
    }

    let start = new Date(`${halloween.date[0]+1}/${halloween.date[1]}/${year}`);
    let end = new Date(`${halloween.endDate[0]+1}/${halloween.endDate[1]}/${year}`);

    if (date >= start && date <= end){
        halloween.active = true;
        let hint = new Date(`${halloween.hintDate[0]+1}/${halloween.hintDate[1]}/${year}`);
        if (date >= hint && date <= end){
            halloween.hint = true;
        }
        let sol = new Date(`${halloween.solveDate[0]+1}/${halloween.solveDate[1]}/${year}`);
        if (date >= sol && date <= end){
            halloween.solve = true;
        }
    }

    return halloween;
}
