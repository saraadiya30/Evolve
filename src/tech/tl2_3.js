import { loc } from '../core/locale.js';
import { global } from '../core/vars.js';
import { payCosts, drawTech, initStruct, actions } from '../actions/actions.js';
import { checkControlling } from '../civics/civics.js';
import { defineGovernor } from '../governor/governor.js';
import { vBind } from '../functions/functions.js';
import { drawResourceTab } from '../resources/resources.js';
import { arpa } from '../arpa/arpa.js';

// Bagian dari techsPart2 (25 entri: socialist .. bonds), dipisah dari techs_part2.js. Urutan entri sama persis.
export const techsPart2Part3 = {
    socialist: {
        title: loc('govern_socialist'),
        desc: loc('govern_socialist'),
        condition(){
            return (global.tech['trade'] && global.tech['trade'] >= 2) || global.race['terrifying'] ? true : false;
        },
        cost: {
            Knowledge(){ return 17000; }
        },
        effect: loc('tech_socialist_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    corpocracy: {
        title: loc('govern_corpocracy'),
        desc: loc('govern_corpocracy'),
        cost: {
            Knowledge(){ return 26000; }
        },
        effect: loc('tech_corpocracy_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    technocracy: {
        title: loc('govern_technocracy'),
        desc: loc('govern_technocracy'),
        cost: {
            Knowledge(){ return 26000; }
        },
        effect: loc('tech_technocracy_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    federation: {
        title: loc('govern_federation'),
        desc: loc('govern_federation'),
        condition(){
            return (global.tech['unify'] && global.tech['unify'] >= 2) || checkControlling();
        },
        cost: {
            Knowledge(){ return 30000; }
        },
        effect: loc('tech_federation_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    magocracy: {
        title: loc('govern_magocracy'),
        desc: loc('govern_magocracy'),
        condition(){
            return global.race.universe === 'magic' ? true : false;
        },
        cost: {
            Knowledge(){ return 26000; }
        },
        effect: loc('tech_magocracy_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    governor: {
        title: loc('tech_governor'),
        desc: loc('tech_governor'),
        condition(){
            return global.genes['governor'] && global.civic.govern.type !== 'anarchy' ? true : false;
        },
        cost: {
            Knowledge(){ return 1000; }
        },
        effect: loc('tech_governor_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.settings.showGovernor = true;
                return true;
            }
            return false;
        },
        post(){
            defineGovernor();
        }
    },
    spy: {
        title: loc('tech_spy'),
        desc: loc('tech_spy'),
        cost: {
            Knowledge(){ return 1250; }
        },
        effect: loc('tech_spy_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        post(){
            vBind({el: '#foreign'},'update');
            defineGovernor();
        }
    },
    espionage: {
        title: loc('tech_espionage'),
        desc: loc('tech_espionage'),
        cost: {
            Knowledge(){ return 7500; }
        },
        effect: loc('tech_espionage_effect'),
        action(){
            if (payCosts($(this)[0])){
                if (!global.settings.msgFilters.spy.unlocked){
                    global.settings.msgFilters.spy.unlocked = true;
                    global.settings.msgFilters.spy.vis = true;
                }
                return true;
            }
            return false;
        },
        post(){
            vBind({el: '#foreign'},'update');
            defineGovernor();
        }
    },
    spy_training: {
        title: loc('tech_spy_training'),
        desc: loc('tech_spy_training'),
        cost: {
            Knowledge(){ return 10000; }
        },
        effect: loc('tech_spy_training_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    spy_gadgets: {
        title: loc('tech_spy_gadgets'),
        desc: loc('tech_spy_gadgets'),
        cost: {
            Knowledge(){ return 15000; }
        },
        effect: loc('tech_spy_gadgets_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    code_breakers: {
        title: loc('tech_code_breakers'),
        desc: loc('tech_code_breakers'),
        cost: {
            Knowledge(){ return 55000; }
        },
        effect: loc('tech_code_breakers_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    currency: {
        title: loc('tech_currency'),
        desc: loc('tech_currency_desc'),
        cost: {
            Knowledge(){ return 22; },
            Lumber(){ return 10; }
        },
        effect: loc('tech_currency_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.resource.Money.display = true;
                return true;
            }
            return false;
        }
    },
    market: {
        title: loc('tech_market'),
        desc: loc('tech_market_desc'),
        cost: {
            Knowledge(){ return global.race['banana'] ? 300 : 1800; }
        },
        effect: loc('tech_market_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.settings.showResources = true;
                global.settings.showMarket = true;
                return true;
            }
            return false;
        },
        post(){
            drawResourceTab('market');
        }
    },
    tax_rates: {
        title: loc('tech_tax_rates'),
        desc: loc('tech_tax_rates_desc'),
        cost: {
            Knowledge(){ return 3375; }
        },
        effect: loc('tech_tax_rates_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.civic.taxes.display = true;
                return true;
            }
            return false;
        },
        post(){
            defineGovernor();
        }
    },
    large_trades: {
        title: loc('tech_large_trades'),
        desc: loc('tech_large_trades_desc'),
        cost: {
            Knowledge(){ return 6750; }
        },
        effect: loc('tech_large_trades_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        post(){
            if (global.race['noble']){
                global.tech['currency'] = 5;
                drawTech();
            }
        }
    },
    corruption: {
        title: loc('tech_corruption'),
        desc: loc('tech_corruption_desc'),
        cost: {
            Knowledge(){ return 36000; }
        },
        effect: loc('tech_corruption_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    massive_trades: {
        title: loc('tech_massive_trades'),
        desc: loc('tech_massive_trades_desc'),
        cost: {
            Knowledge(){ return 108000; }
        },
        effect: loc('tech_massive_trades_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    trade: {
        title: loc('tech_trade'),
        desc: loc('tech_trade_desc'),
        cost: {
            Knowledge(){ return global.race['banana'] ? 1200 : 4500; }
        },
        effect: loc('tech_trade_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.trade);
                global.city.market.active = true;
                return true;
            }
            return false;
        },
        post(){
            drawResourceTab('market');
        }
    },
    diplomacy: {
        title: loc('tech_diplomacy'),
        desc: loc('tech_diplomacy_desc'),
        cost: {
            Knowledge(){ return 16200; }
        },
        effect: loc('tech_diplomacy_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    freight: {
        title: loc('tech_freight'),
        desc: loc('tech_freight_desc'),
        cost: {
            Knowledge(){ return 37800; }
        },
        effect: loc('tech_freight_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        post(){
            if (global.tech['high_tech'] >= 6) {
                arpa('Physics');
            }
        }
    },
    wharf: {
        title: loc('tech_wharf'),
        desc: loc('tech_wharf_desc'),
        cost: {
            Knowledge(){ return 44000; }
        },
        effect: loc('tech_wharf_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.wharf);
                return true;
            }
            return false;
        }
    },
    banking: {
        title: loc('tech_banking'),
        desc: loc('tech_banking_desc'),
        cost: {
            Knowledge(){ return 90; }
        },
        effect: loc('tech_banking_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.bank);
                return true;
            }
            return false;
        }
    },
    investing: {
        title: loc('tech_investing'),
        desc: loc('tech_investing_desc'),
        cost: {
            Money(){ return 2500; },
            Knowledge(){ return 900; }
        },
        effect: loc('tech_investing_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.civic.banker.display = true;
                return true;
            }
            return false;
        }
    },
    vault: {
        title: loc('tech_vault'),
        desc: loc('tech_vault_desc'),
        cost: {
            Money(){ return 2000; },
            Knowledge(){ return 3600; },
            Iron(){ return 500; },
            Cement(){ return 750; }
        },
        effect: loc('tech_vault_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    bonds: {
        title: loc('tech_bonds'),
        desc: loc('tech_bonds'),
        cost: {
            Money(){ return 20000; },
            Knowledge(){ return 5000; }
        },
        effect: loc('tech_bonds_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
};
