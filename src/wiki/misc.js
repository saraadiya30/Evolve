import { loc } from '../core/locale.js';
import { sizeApproximation, affix_list } from '../core/vars.js';
import { infoBoxBuilder, sideMenu } from './functions.js';
import { OCOIN_RATE, OCOIN_BUY_FEE, AETHER_OCOIN_RATE, LOT_BONUS, STORAGE_BONUS, MORALE_BONUS_PER_LOT, BIRTH_BONUS_PER_LOT, ARMY_BONUS_PER_LOT, OCOIN_YIELD_PER_LOT, MAX_ORDERS, AETHER_SOUL_GEM_RATE, AETHER_GENES_RATE } from '../stocks/stocks_core.js';

// Money per Aether (aether_alchemy.js and fast_loop_core.js use this same literal; there is no shared constant yet).
const AETHER_MONEY_RATE = 1e15;
const rateText = n => `${sizeApproximation(n,0)} (${n.toExponential(0).replace('e+','e')})`;

// Wiki page for the Misc tab (Stocks + Aether). Every number comes from the same constants the game uses,
// so this page cannot drift away from the real values.
export function miscPage(content){
    let mainContent = sideMenu('create',content);
    mainContent.append(`<h2 class="header has-text-caution">${loc('wiki_misc')}</h2>`);

    infoBoxBuilder(mainContent,{ name: 'overview', template: 'misc', paragraphs: 2,
        para_data: {
            1: [loc('tab_misc'),loc('tab_aether'),loc('tab_misc_new')],
            2: [loc('tab_aether')]
        }
    });
    sideMenu('add',`misc-gameplay`,'overview',loc('wiki_misc_overview'));

    infoBoxBuilder(mainContent,{ name: 'ocoin', template: 'misc', paragraphs: 5,
        para_data: {
            4: [affix_list.sln.join(', ')],
            1: [loc('resource_Ocoin_name'),OCOIN_RATE,loc('resource_Money_name')],
            2: [loc('resource_Money_name'),loc('resource_Ocoin_name'),OCOIN_BUY_FEE * 100],
            3: [loc('resource_Money_name'),loc('resource_Ocoin_name')]
        }
    });
    sideMenu('add',`misc-gameplay`,'ocoin',loc('wiki_misc_ocoin'));

    infoBoxBuilder(mainContent,{ name: 'companies', template: 'misc', paragraphs: 5,
        para_data: {
            1: [loc('resource_Ocoin_name')],
            4: [MAX_ORDERS],
            5: [loc('resource_Ocoin_name')]
        }
    });
    sideMenu('add',`misc-gameplay`,'companies',loc('wiki_misc_companies'));

    infoBoxBuilder(mainContent,{ name: 'lots', template: 'misc', paragraphs: 4,
        para_data: {
            2: [+(LOT_BONUS * 100).toFixed(2),+(STORAGE_BONUS * 100).toFixed(2),loc('stock_alloc_prod'),loc('stock_alloc_store')]
        }
    });
    sideMenu('add',`misc-gameplay`,'lots',loc('wiki_misc_lots'));

    infoBoxBuilder(mainContent,{ name: 'special', template: 'misc', paragraphs: 5,
        para_data: {
            2: [loc('stock_Morale_name'),MORALE_BONUS_PER_LOT],
            3: [loc('stock_Birthrate_name'),BIRTH_BONUS_PER_LOT],
            4: [loc('stock_Army_name'),ARMY_BONUS_PER_LOT],
            5: [loc('stock_Dividend_name'),+(OCOIN_YIELD_PER_LOT * 100).toFixed(2),loc('resource_Ocoin_name')]
        }
    });
    sideMenu('add',`misc-gameplay`,'special',loc('wiki_misc_special'));

    infoBoxBuilder(mainContent,{ name: 'aether', template: 'misc', paragraphs: 11,
        para_data: {
            1: [loc('resource_Aether_name'),loc('resource_Plasmid_name'),loc('resource_Phage_name')],
            2: [loc('resource_Aether_name')],
            3: [1000,loc('resource_Plasmid_name'),100,loc('resource_Phage_name')],
            4: [loc('resource_Money_name'),rateText(AETHER_MONEY_RATE),loc('resource_Ocoin_name'),rateText(AETHER_OCOIN_RATE)],
            5: ['0.00001','1000'],
            6: ['0.00000000001'],
            7: ['0.000000001'],
            8: ['0.00000000001'],
            9: [loc('aether_speed_label')],
            10: [loc('resource_Soul_Gem_name'),rateText(AETHER_SOUL_GEM_RATE)],
            11: [loc('resource_Genes_name'),rateText(AETHER_GENES_RATE)]
        }
    });
    sideMenu('add',`misc-gameplay`,'aether',loc('resource_Aether_name'));
}
