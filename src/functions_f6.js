import { traitSkin, traits } from './races.js';
import { loc } from './locale.js';
import { global } from './vars.js';
import { altTraitDesc, traitExtra } from './functions.js';
import { getTraitVals } from './functions_f5.js';
import { vBind } from './functions_f2.js';

// Fungsi-fungsi dipindah dari functions.js (urutan sumber dipertahankan). functions.js tetap mengekspor ulang nama yang tadinya ter-ekspor.


export function getTraitDesc(info, trait, opts){
    let fanatic = opts['fanatic'] || false;
    let tpage = opts['tpage'] || false; // Trait page (on wiki)
    let rpage = opts['rpage'] || false; // Races page (on wiki)
    let trank = opts['trank'] || false;
    let wiki = opts['wiki'] || false;
    let species = opts['species']; // Intentionally keep undefined, not false, when undefined
    let rank = '';

    let traitName = traitSkin('name', trait, species);
    let traitDesc = traitSkin('desc', trait, species);

    if (tpage && ['genus','major'].includes(traits[trait].type)){
        rank = `<span><span role="button" @click="down()">&laquo;</span><span class="has-text-warning">${loc(`wiki_trait_rank`)} {{ rank }}</span><span role="button" @click="up()">&raquo;</span></span>`;
    }
    if (tpage || rpage){
        info.append(`<div class="type"><h2 class="has-text-warning">${traitName}</h2>${rank}</div>`);
        if (tpage && traits[trait].hasOwnProperty('val')){
            info.append(`<div class="type has-text-caution">${loc(`wiki_trait_${traits[trait].type}`)}<span>${loc(`wiki_trait_value`,[traits[trait].val])}</span></div>`);
        }
        else {
            info.append(`<div class="type has-text-caution">${loc(`wiki_trait_${traits[trait].type}`)}</div>`);
        }
        if (fanatic){
            info.append(`<div class="has-text-danger">${loc(`wiki_trait_fanaticism`,[fanatic])}</div>`);
        }
    }

    info.append(`<div class="desc">${traitDesc}</div>`);

    let color = 'warning';
    if (traits[trait].hasOwnProperty('val')){
        color = traits[trait].val >= 0 ? 'success' : 'danger';
    }
    if (tpage && ['genus','major'].includes(traits[trait].type)){
        info.append(`<div class="has-text-${color} effect" v-html="getTraitDesc(rank)"></div>`);
    }
    else {
        if (wiki || (global.stats.feat['journeyman'] && global.stats.achieve['seeder'] && global.stats.achieve.seeder.l > 0)){
            let trait_desc = '';
            if (trait === 'elemental'){
                trait_desc = loc(`wiki_trait_effect_${trait}_${traits.elemental.vars()[0]}`, getTraitVals(trait, trank, species));
            }
            else if (['catnip','anise'].includes(trait)){
                let rank = trank;
                trait_desc = loc(`wiki_trait_effect_${trait}${rank}`, getTraitVals(trait, trank, species));
            }
            else {
                if (global?.race?.universe === 'evil' && global?.civic?.govern?.type != 'theocracy' && ['spiritual','blasphemous'].includes(trait)){
                    let alt_trait = trait === 'spiritual' ? 'manipulator' : 'blasphemous_evil';
                    trait_desc = loc(`wiki_trait_effect_${alt_trait}`, getTraitVals(trait, trank, species));
                }
                else {
                    let key = altTraitDesc[trait] && global.race.hasOwnProperty(altTraitDesc[trait]) ? altTraitDesc[trait] : 'effect';
                    trait_desc = loc(`wiki_trait_${key}_${trait}`, getTraitVals(trait, trank, species));
                }
            }
            info.append(`<div class="has-text-${color} effect">${trait_desc}</div>`);
        }
    }
    if (traitExtra[trait] && (tpage || rpage)){
        traitExtra[trait].forEach(function(te){
            if (typeof te !== 'string'){
                te = te(opts);
            }
            info.append(`<div class="effect">${te}</div>`);
        });
    }

    if (tpage && ['genus','major'].includes(traits[trait].type)){
        let data = { rank: global.race[trait] || 1 };
        vBind({
            el: `#${traits[trait].type}_${trait}`,
            data: data,
            methods: {
                getTraitDesc(rk){
                    if (trait === 'elemental'){
                        return loc(`wiki_trait_effect_${trait}_${traits.elemental.vars()[0]}`, getTraitVals(trait, rk, species));
                    }
                    else if (['catnip','anise'].includes(trait)){
                        return loc(`wiki_trait_effect_${trait}${rk}`, getTraitVals(trait, rk, species));
                    }
                    else if (global?.race?.universe === 'evil' && global?.civic?.govern?.type != 'theocracy' && ['spiritual','blasphemous'].includes(trait)){
                        let alt_trait = trait === 'spiritual' ? 'manipulator' : 'blasphemous_evil';
                        return loc(`wiki_trait_effect_${alt_trait}`, getTraitVals(trait, rk, species));
                    }
                    let key = altTraitDesc[trait] && global.race.hasOwnProperty(altTraitDesc[trait]) ? altTraitDesc[trait] : 'effect';
                    return loc(`wiki_trait_${key}_${trait}`, getTraitVals(trait, rk, species));
                },
                up(){
                    switch (data.rank){
                        case 0.1:
                            data.rank = 0.25;
                            break;
                        case 0.25:
                            data.rank = 0.5;
                            break;
                        case 0.5:
                            data.rank =  1;
                            break;
                        case 1:
                            data.rank =  2;
                            break;
                        case 2:
                            data.rank =  3;
                            break;
                        case 3:
                            data.rank =  4;
                            break;
                        case 4:
                            data.rank =  4;
                            break;
                    }
                },
                down(){
                    switch (data.rank){
                        case 0.1:
                            data.rank = 0.1;
                            break;
                        case 0.25:
                            data.rank = 0.1;
                            break;
                        case 0.5:
                            data.rank =  0.25;
                            break;
                        case 1:
                            data.rank =  0.5;
                            break;
                        case 2:
                            data.rank =  1;
                            break;
                        case 3:
                            data.rank =  2;
                            break;
                        case 4:
                            data.rank =  3;
                            break;
                    }
                },
            },
        });
    }
}
