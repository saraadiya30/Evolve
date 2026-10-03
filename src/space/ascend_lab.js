import { global } from '../core/vars.js';
import { traits } from '../races/races.js';
import { clearElement, calcGenomeScore, vBind, popover, getTraitDesc } from '../functions/functions.js';
import { loc } from '../core/locale.js';
import { geneCost } from './gene_cost_and_terraform_lab.js';
import { ascendLab_s1, ascendLab_s2 } from '../sections/stages/ascend_lab_parts.js';

// Fungsi-fungsi dipindah dari space.js (urutan sumber dipertahankan). space.js tetap mengekspor ulang nama yang tadinya ter-ekspor.


export function ascendLab(hybrid,wiki){
    const $ctx = {};
    $ctx.hybrid = hybrid;
    $ctx.wiki = wiki;
    $ctx.summaryTab = summaryTab;
    { const $r = ascendLab_s1($ctx); if ($r) return $r.$r; }
    ascendLab_s2($ctx);

    function summaryTab(tab){
        if (tab === 4 || tab == 5){
            let container = tab === 4 ? $(`#traitSummary`) : $(`#allSum`);
            clearElement(container);

            let negative_sum = '';
            let summary = `<div class="trait_selection summary">`;
            $ctx.genome.traitlist.sort().forEach(function (trait){
                if (traits.hasOwnProperty(trait) && traits[trait].type === 'major'){
                    if (traits[trait].val >= 0){
                        summary += `<div class="field t${trait}">`;
                        summary += `<b-checkbox :input="geneEdit()" v-model="g.traitlist" native-value="${trait}"><span class="has-text-success">${loc(`trait_${trait}_name`)}</span></b-checkbox>`;
                        summary += `<span>[<span class="rc"><span class="has-text-warning">${loc(`wiki_calc_cost`)}</span> <span>{{ '${trait}' | cost }}</span>, <span class="has-text-warning">${loc(`genelab_rank`)}</span> <span>{{ '${trait}' | tRank }}</span>`;
                        summary += `<span v-html="$options.filters.empower(t.empowered,'${trait}')"></span></span>]`;
                        summary += `<span role="button" aria-label="${loc(`genelab_rank_lower`,[loc(`trait_${trait}_name`)])}" class="sub has-text-danger" @click="reduce('${trait}')"><span>-</span></span>`;
                        summary += `<span role="button" aria-label="${loc(`genelab_rank_higher`,[loc(`trait_${trait}_name`)])}" class="add has-text-success" @click="increase('${trait}')"><span>+</span></span>`;
                        summary += `</span></div>`;
                    }
                    else {
                        negative_sum += `<div class="field t${trait}">`;
                        negative_sum += `<b-checkbox :input="geneEdit()" v-model="g.traitlist" native-value="${trait}"><span class="has-text-danger">${loc(`trait_${trait}_name`)}</span></b-checkbox>`;
                        negative_sum += `<span>[<span class="rc"><span class="has-text-warning">${loc(`wiki_calc_cost`)}</span> <span>{{ '${trait}' | cost }}</span>, <span class="has-text-warning">${loc(`genelab_rank`)}</span> <span>{{ '${trait}' | tRank }}</span>`;
                        negative_sum += `<span v-html="$options.filters.empower(t.empowered,'${trait}')"></span></span>]`;
                        negative_sum += `<span role="button" aria-label="${loc(`genelab_rank_lower`,[loc(`trait_${trait}_name`)])}" class="sub has-text-danger" @click="reduce('${trait}')"><span>-</span></span>`;
                        negative_sum += `<span role="button" aria-label="${loc(`genelab_rank_higher`,[loc(`trait_${trait}_name`)])}" class="add has-text-success" @click="increase('${trait}')"><span>+</span></span>`;
                        negative_sum += `</span></div>`;
                    }
                }
            });
            summary += negative_sum + `</div>`;
            container.append(summary);

            vBind({
                el: tab === 4 ? '#traitSummary .trait_selection' : '#allSum .trait_selection',
                data: {
                    g: $ctx.genome,
                    t: $ctx.tRanks
                },
                methods: {
                    geneEdit(){
                        let newRanks = $ctx.genome.traitlist.map(x => $ctx.tRanks[x] ? { [x]: $ctx.tRanks[x] } : { [x]: 1 });
                        let ranks = {};
                        newRanks.forEach(function(k){ Object.keys(k).forEach(function(t){ ranks[t] = k[t] }) });
                        $ctx.tRanks = ranks;
                        $ctx.genome.genes = calcGenomeScore($ctx.genome,($ctx.isWiki ? $ctx.wikiVars : false),$ctx.tRanks);
                    },
                    reduce(t){
                        let unlock = global.stats.achieve[`extinct_${traits[t].origin}`] && global.stats.achieve[`extinct_${traits[t].origin}`].l || 0;
                        switch ($ctx.tRanks[t]){
                            case 0.25:
                                if (unlock >= 5){
                                    $ctx.tRanks[t] = 0.1;
                                }
                                break;
                            case 0.5:
                                if (unlock >= 4){
                                    $ctx.tRanks[t] = 0.25;
                                }
                                break;
                            case 1:
                                if (unlock >= 3){
                                    $ctx.tRanks[t] = 0.5;
                                }
                                break;
                            case 2:
                                $ctx.tRanks[t] = 1;
                                break;
                            case 3:
                                $ctx.tRanks[t] = 2;
                                break;
                            case 4:
                                $ctx.tRanks[t] = 3;
                                break;
                        }
                        if (tab === 4 ){
                            vBind({el: `#traitSummary .trait_selection`},'update');
                        }
                        else {
                            vBind({el: `#allSum .trait_selection`},'update');
                        }
                        let desc = $(`#traitLabActiveDesc`);
                        clearElement(desc);
                        let opts = {
                            trank: $ctx.tRanks[t] || 1,
                            wiki: $ctx.isWiki
                        }
                        getTraitDesc(desc, t, opts);
                    },
                    increase(t){
                        let unlock = global.stats.achieve[`extinct_${traits[t].origin}`] && global.stats.achieve[`extinct_${traits[t].origin}`].l || 0;
                        switch ($ctx.tRanks[t]){
                            case 0.1:
                                $ctx.tRanks[t] = 0.25;
                                break;
                            case 0.25:
                                $ctx.tRanks[t] = 0.5;
                                break;
                            case 0.5:
                                $ctx.tRanks[t] = 1;
                                break;
                            case 1:
                                if (unlock >= 3){
                                    $ctx.tRanks[t] = 2;
                                }
                                break;
                            case 2:
                                if (unlock >= 4){
                                    $ctx.tRanks[t] = 3;
                                }
                                break;
                            case 3:
                                if (unlock >= 5){
                                    $ctx.tRanks[t] = 4;
                                }
                                break;
                        }
                        if (tab === 4 ){
                            vBind({el: `#traitSummary .trait_selection`},'update');
                        }
                        else {
                            vBind({el: `#allSum .trait_selection`},'update');
                        }
                        let desc = $(`#traitLabActiveDesc`);
                        clearElement(desc);
                        let opts = {
                            trank: $ctx.tRanks[t] || 1,
                            wiki: $ctx.isWiki
                        }
                        getTraitDesc(desc, t, opts);
                    }
                },
                filters: {
                    cost(trait){
                        return geneCost($ctx.genome,trait,$ctx.tRanks);
                    },
                    tRank(trait){
                        return $ctx.tRanks[trait];
                    },
                    empower(e,t){
                        let valid_empower = traits[t].val >= traits.empowered.vars($ctx.tRanks['empowered'] || 1)[0] && traits[t].val <= traits.empowered.vars($ctx.tRanks['empowered'] || 1)[1] && !['empowered','catnip','anise'].includes(t) && $ctx.genome.traitlist.includes('empowered');
                        return valid_empower ? `, <span class="has-text-caution">E</span>` : ``;
                    }
                }
            });

            let popAnchor = tab === 4 ? '#traitSummary' : '#allSum';

            $ctx.genome.traitlist.sort().forEach(function (trait){
                if (traits.hasOwnProperty(trait) && traits[trait].type === 'major'){
                    popover(`celestialLabtraitSelection${trait}Sum`, function(){
                        let desc = $(`<div id="traitLabActiveDesc"></div>`);
                        let opts = {
                            trank: $ctx.tRanks[trait] || 1,
                            wiki: $ctx.isWiki
                        }
                        getTraitDesc(desc, trait, opts);
                        return desc;
                    },{
                        elm: `${popAnchor} .summary .t${trait}`,
                        classes: `w30`,
                        wide: true
                    });
                }
            });
        }
    }
}
