import { global } from '../../core/vars.js';

export function mechCost(size,infernal,standardize){
    let soul = 9999;
    let cost = 10000000;
    switch (size){
        case 'small':
            {
                let baseCost = global.blood['prepared'] && global.blood.prepared >= 2 ? 50000 : 75000;
                cost = infernal ? baseCost * 2.5 : baseCost;
                soul = infernal ? 20 : 1;
            }
            break;
        case 'medium':
            {
                cost = infernal ? 450000 : 180000;
                soul = infernal ? 100 : 4;
            }
            break;
        case 'large':
            {
                cost = infernal ? 925000 : 375000;
                soul = infernal ? 500 : 20;
            }
            break;
        case 'titan':
            {
                cost = infernal ? 1500000 : 750000;
                soul = infernal ? 1500 : 75;
            }
            break;
        case 'collector':
            {
                let baseCost = global.blood['prepared'] && global.blood.prepared >= 2 ? 8000 : 10000;
                cost = infernal ? baseCost * 2.5 : baseCost;
                soul = 1;
            }
            break;
        case 'minion':
            {
                let baseCost = global.blood['prepared'] && global.blood.prepared >= 2 ? 30000 : 50000;
                cost = infernal ? baseCost * 2.5 : baseCost;
                soul = infernal ? 10 : 1;
            }
            break;
        case 'fiend':
            {
                cost = infernal ? 300000 : 125000;
                soul = infernal ? 40 : 4;
            }
            break;
        case 'cyberdemon':
            {
                cost = infernal ? 625000 : 250000;
                soul = infernal ? 120 : 12;
            }
            break;
        case 'archfiend':
            {
                cost = infernal ? 1200000 : 600000;
                soul = infernal ? 250 : 25;
            }
            break;
    }
    if (standardize){
        return {
            Soul_Gem(){ return soul; },
            Supply(){ return cost; }
        };
    }
    return { s: soul, c: cost };
}
