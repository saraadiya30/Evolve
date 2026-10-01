import { loc } from '../../../core/locale.js';
import { payCosts } from '../../../actions/core/action_costs.js';
import { initStruct } from '../../../actions/core/structure_ui.js';
import { actions } from '../../../core/registries.js';
import { swissKnife } from '../../../core/swiss_knife.js';
import { arpa } from '../../../arpa/arpa_projects.js';
import { global } from '../../../core/vars.js';

// Bagian dari techsPart2 (19 entri: steel_vault .. tourism), dipisah dari group_loader.js. Urutan entri sama persis.
export const techsPart2Part4 = {
    steel_vault: {
        title: loc('tech_steel_vault'),
        desc: loc('tech_steel_vault'),
        cost: {
            Money(){ return 30000; },
            Knowledge(){ return 6750; },
            Steel(){ return 3000; }
        },
        effect: loc('tech_steel_vault_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    eebonds: {
        title: loc('tech_eebonds'),
        desc: loc('tech_eebonds'),
        cost: {
            Money(){ return 75000; },
            Knowledge(){ return 18000; }
        },
        effect: loc('tech_eebonds_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    swiss_banking: {
        title: swissKnife(),
        desc: swissKnife(),
        cost: {
            Money(){ return 125000; },
            Knowledge(){ return 45000; }
        },
        effect: loc('tech_swiss_banking_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    safety_deposit: {
        title: loc('tech_safety_deposit'),
        desc: loc('tech_safety_deposit'),
        cost: {
            Money(){ return 250000; },
            Knowledge(){ return 67500; }
        },
        effect: loc('tech_safety_deposit_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    stock_market: {
        title: loc('tech_stock_market'),
        desc: loc('tech_stock_market'),
        cost: {
            Money(){ return 325000; },
            Knowledge(){ return 108000; }
        },
        effect: loc('tech_stock_market_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        post(){
            arpa('Physics');
        }
    },
    hedge_funds: {
        title: loc('tech_hedge_funds'),
        desc: loc('tech_hedge_funds'),
        cost: {
            Money(){ return 375000; },
            Knowledge(){ return 126000; }
        },
        effect: loc('tech_hedge_funds_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    four_oh_one: {
        title: loc('tech_four_oh_one'),
        desc: loc('tech_four_oh_one'),
        cost: {
            Money(){ return 425000; },
            Knowledge(){ return 144000; }
        },
        effect: loc('tech_four_oh_one_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        },
        flair(){
            return loc('tech_four_oh_one_flair');
        }
    },
    exchange: {
        title: loc('tech_exchange'),
        desc: loc('tech_exchange'),
        cost: {
            Money(){ return 1000000; },
            Knowledge(){ return 675000; }
        },
        effect: loc('tech_exchange_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.interstellar.int_alpha.exchange);
                return true;
            }
            return false;
        }
    },
    foreign_investment: {
        title: loc('tech_foreign_investment'),
        desc: loc('tech_foreign_investment'),
        cost: {
            Money(){ return 100000000; },
            Knowledge(){ return 8000000; }
        },
        effect: loc('tech_foreign_investment_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    crypto_currency: {
        title: loc('tech_crypto_currency'),
        desc: loc('tech_crypto_currency'),
        cost: {
            Money(){ return 10000000000; },
            Knowledge(){ return 127500000; },
            Omniscience(){ return 38500; },
        },
        effect: loc('tech_crypto_currency_effect',[loc('tech_bonds')]),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    mythril_vault: {
        title: loc('tech_mythril_vault'),
        desc: loc('tech_mythril_vault'),
        cost: {
            Money(){ return 500000; },
            Knowledge(){ return 150000; },
            Mythril(){ return 750; }
        },
        effect: loc('tech_mythril_vault_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    neutronium_vault: {
        title: loc('tech_neutronium_vault'),
        desc: loc('tech_neutronium_vault'),
        cost: {
            Money(){ return 750000; },
            Knowledge(){ return 280000; },
            Neutronium(){ return 650; }
        },
        effect: loc('tech_neutronium_vault_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    adamantite_vault: {
        title: loc('tech_adamantite_vault'),
        desc: loc('tech_adamantite_vault'),
        cost: {
            Money(){ return 2000000; },
            Knowledge(){ return 560000; },
            Adamantite(){ return 20000; }
        },
        effect: loc('tech_adamantite_vault_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    graphene_vault: {
        title: loc('tech_graphene_vault'),
        desc: loc('tech_graphene_vault'),
        cost: {
            Money(){ return 3000000; },
            Knowledge(){ return 750000; },
            Graphene(){ return 400000; }
        },
        effect: loc('tech_graphene_vault_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    home_safe: {
        title: loc('tech_home_safe'),
        desc: loc('tech_home_safe'),
        cost: {
            Money(){ return 42000; },
            Knowledge(){ return 8000; },
            Steel(){ return 4500; }
        },
        effect: loc('tech_home_safe_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    fire_proof_safe: {
        title: loc('tech_fire_proof_safe'),
        desc: loc('tech_fire_proof_safe'),
        cost: {
            Money(){ return 250000; },
            Knowledge(){ return 120000; },
            Iridium(){ return 1000; }
        },
        effect: loc('tech_fire_proof_safe_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    tamper_proof_safe: {
        title: loc('tech_tamper_proof_safe'),
        desc: loc('tech_tamper_proof_safe'),
        cost: {
            Money(){ return 2500000; },
            Knowledge(){ return 600000; },
            Infernite(){ return 800; }
        },
        effect: loc('tech_tamper_proof_safe_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    monument: {
        title: loc('tech_monument'),
        desc: loc('tech_monument'),
        cost: {
            Knowledge(){ return 120000; }
        },
        effect: loc('tech_monument_effect'),
        action(){
            if (payCosts($(this)[0])){
                global.arpa['m_type'] = arpa('Monument');
                return true;
            }
            return false;
        },
        post(){
            arpa('Physics');
        }
    },
    tourism: {
        title: loc('tech_tourism'),
        desc: loc('tech_tourism'),
        cost: {
            Knowledge(){ return 150000; }
        },
        effect: loc('tech_tourism_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.city.tourist_center);
                return true;
            }
            return false;
        }
    },
};
