import { genus_def, traits, races, biomes, planetTraits } from './races.js';
import { global, webWorker, save, keyMultiplier, p_on } from './vars.js';
import { unlockAchieve, unlockFeat, universeAffix } from './achieve.js';
import { clearElement, deepClone, vBind } from './functions.js';
import { loc } from './locale.js';
import { terraform } from './resets.js';

// Fungsi-fungsi dipindah dari space.js (urutan sumber dipertahankan). space.js tetap mengekspor ulang nama yang tadinya ter-ekspor.


export function geneCost(genome,trait,tRanks){
    let max_complexity = 1;

    let active_genus = genome.genus === 'hybrid' ? genome.hybrid : [genome.genus];
    let oppose_genus = [];
    active_genus.forEach(function(g){
        oppose_genus = oppose_genus.concat(genus_def[g].oppose);
    });

    let taxonomy = traits[trait].taxonomy;
    let gene_cost = traits[trait].val;

    let complexity = { utility: 0, resource: 0, production: 0, combat: 0 };
    let neg_complexity = { utility: 0, resource: 0, production: 0, combat: 0 };
    for (let i=0; i<genome.traitlist.length; i++){
        if (traits[genome.traitlist[i]].val >= 0){
            complexity[traits[genome.traitlist[i]].taxonomy]++;
        }
        else {
            neg_complexity[traits[genome.traitlist[i]].taxonomy]++;
        }
    }
    if (traits[trait].val >= 0){
        if (genome.traitlist.includes(trait)){
            complexity[taxonomy]--;
        }
        if (complexity[taxonomy] > max_complexity){
            gene_cost += complexity[taxonomy] - max_complexity;
        }
    }
    else {
        if (genome.traitlist.includes(trait)){
            neg_complexity[taxonomy]--;
        }
        if (neg_complexity[taxonomy] >= max_complexity){
            gene_cost += neg_complexity[taxonomy];
        }
    }

    if (tRanks[trait] && tRanks[trait] !== 1){
        if (traits[trait].val >= 0){
            switch (tRanks[trait]){
                case 0.1:
                    gene_cost -= 3;
                    break;
                case 0.25:
                    gene_cost -= 2;
                    break;
                case 0.5:
                    gene_cost--;
                    break;
                case 2:
                    gene_cost = Math.max(Math.round(gene_cost * 1.5), gene_cost + 1);
                    break;
                case 3:
                    gene_cost = Math.max(Math.round(gene_cost * 2), gene_cost + 2);
                    break;
                case 4:
                    gene_cost = Math.max(Math.round(gene_cost * 2.5), gene_cost + 3);
                    break;
            }
            if (gene_cost < 1){ gene_cost = 1; }
        }
        else {
            switch (tRanks[trait]){
                case 0.1:
                    gene_cost -= 3;
                    break;
                case 0.25:
                    gene_cost -= 2;
                    break;
                case 0.5:
                    gene_cost--;
                    break;
                case 2:
                    gene_cost++;
                    break;
                case 3:
                    gene_cost += 2;
                    break;
                case 4:
                    gene_cost += 3;
                    break
            }
        }
    }

    let genus_origin = races[traits[trait].origin].type === 'hybrid' ? races[traits[trait].origin].hybrid : [races[traits[trait].origin].type];
    if (active_genus.filter(x => genus_origin.includes(x)).length > 0){ active_genus.filter(x => genus_origin.includes(x)).length === 1 ? gene_cost-- : gene_cost -= 2; }
    if (oppose_genus.filter(x => genus_origin.includes(x)).length > 0){ oppose_genus.filter(x => genus_origin.includes(x)).length === 1 ? gene_cost++ : gene_cost += 2; }

    return gene_cost;
}

export function terraformLab(wiki){
    if (!wiki && !global.race['noexport']){
        if (webWorker.w){
            webWorker.w.terminate();
        }
        if (!global['sim']){
            save.setItem('evolveBak',LZString.compressToUTF16(JSON.stringify(global)));
        }

        let genusType = races[global.race.species].type === 'hybrid' ? global.race.maintype : races[global.race.species].type;
        unlockAchieve(`biome_${global.city.biome}`);
        unlockAchieve(`genus_${genusType}`);
        unlockAchieve(`lamentis`);
        if (global.race.species === 'junker'){
            unlockFeat('the_misery');
        }
        global.race['noexport'] = `Planet`;
        clearElement($(`#city`));
        global.settings.showCity = true;
        global.settings.showCivic = false;
        global.settings.showResearch = false;
        global.settings.showResources = false;
        global.settings.showGenetics = false;
        global.settings.showSpace = false;
        global.settings.showDeep = false;
        global.settings.showGalactic = false;
        global.settings.showPortal = false;
        global.settings.spaceTabs = 0;
    }

    let lab = $(`<div id="celestialLab" class="celestialLab"></div>`);

    let wikiVars = {
        ascended: {},
        lamentis: global.stats.achieve['lamentis'] && global.stats.achieve.lamentis.l ? global.stats.achieve.lamentis.l : 0
    };

    if (wiki){
        wiki.append(lab);
    }
    else {
        $(`#city`).append(lab);
    }

    lab.append(`<div><h3 class="has-text-danger">${loc('planetlab_title')}</h3> - <span class="has-text-warning">${loc('planetlab_points')} {{ p.pts }}</span></div>`);

    let pBiome = $(`<div class="sequence"></div>`);
    lab.append(pBiome);

    let dBiome = false;
    let biome = `<div class="genus_selection"><div class="has-text-caution">${loc('wiki_planet_biome')}</div><template><section>`;
    Object.keys(biomes).forEach(function (type){
        if (wiki || (global.stats.achieve[`biome_${type}`] && global.stats.achieve[`biome_${type}`].l > 0)){
            if (!dBiome){ dBiome = type; }
            biome = biome + `<div class="field ${type}"><b-radio v-model="p.biome" native-value="${type}">${biomes[type].label}</b-radio></div>`;
        }
    });
    biome = biome + `</section></template></div>`;
    pBiome.append($(biome));

    let trait_list = `<div class="planet_selection"><div class="has-text-warning">${loc('wiki_planet_trait')}</div><template><section>`;
    Object.keys(planetTraits).forEach(function (trait){
        if (
            wiki
                ||
            (global.stats.achieve[`atmo_${trait}`] && global.stats.achieve[`atmo_${trait}`].l > 0)
            ){
            trait_list = trait_list + `<div class="field t${trait}"><b-checkbox :input="pEdit()" v-model="p.traitlist" native-value="${trait}"><span class="has-text-success">${planetTraits[trait].label}</span></b-checkbox></div>`;
        }
    });
    trait_list = trait_list + `</section></template></div>`;
    pBiome.append($(trait_list));

    let geology = {};
    let geoList = ['Copper','Iron','Aluminium','Coal','Oil','Titanium','Uranium'];
    if (global.stats.achieve['whitehole']){
        geoList.push('Iridium');
    }

    let geo_list = `<div class="res_selection"><div class="has-text-warning">${loc('planetlab_res')}</div><template><section>`;
    geoList.forEach(function (res){
        geology[res] = 0;
        geo_list += `<div class="field t${res}"><div>${global.resource[res].name}</div><div>`;
        geo_list += `<span role="button" aria-label="export ${res}" class="sub has-text-danger" @click="less('${res}')"><span>-</span></span>`;
        geo_list += `<span class="current" v-html="$options.filters.res('${res}')"></span>`;
        geo_list += `<span role="button" aria-label="import ${res}" class="add has-text-success" @click="more('${res}')"><span>+</span></span>`;
        geo_list += `</div></div>`;
    });
    geo_list = geo_list + `</section></template></div>`;
    pBiome.append($(geo_list));

    let planet = {
        biome: dBiome,
        pts: 0,
        traitlist: [],
        geology: geology,
        orbit: global.city.calendar.orbit,
    };

    if (global.custom.hasOwnProperty('planet')){
        let uni = universeAffix();
        if (global.custom.planet.hasOwnProperty(uni)){
            let type = 's';
            if (global.custom.planet[uni][type]){
                planet = deepClone(global.custom.planet[uni][type]);
                planet.orbit = global.city.calendar.orbit;
                geoList.forEach(function (res){
                    if (planet.geology.hasOwnProperty(res)){
                        planet.geology[res] *= 100;
                    }
                    else {
                        planet.geology[res] = 0;
                    }
                });
            }
        }
    }

    planet.pts = terraformScore(planet,(wiki ? wikiVars : false));

    let buttons = `<div class="buttons">
        <div class="reset">
            <button class="button" @click="reset()">${loc('genelab_reset')}</button>
        </div>
    `;
    if (!wiki){
        buttons += `
            <div class="create">
                <button class="button" @click="setPlanet()">${loc('planetlab_create')}</button>
            </div>
        `;
    }
    buttons += `</div>`;
    lab.append(buttons);

    vBind({
        el: '#celestialLab',
        data: {
            p: planet,
            w: wikiVars
        },
        methods: {
            pEdit(){
                planet.pts = terraformScore(planet,(wiki ? wikiVars : false));
            },
            setPlanet(){
                if (terraformScore(planet) >= 0){
                    Object.keys(planet.geology).forEach(function (res){
                        if (planet.geology[res] === 0){
                            delete planet.geology[res];
                        }
                        else {
                            planet.geology[res] /= 100;
                        }
                    });
                    if (!global.custom.hasOwnProperty('planet')){
                        global.custom['planet'] = {};
                    }
                    let universe = universeAffix();
                    if (!global.custom.planet.hasOwnProperty(universe)){
                        global.custom.planet[universe] = {s: false};
                    }
                    let type = 's';
                    global.custom.planet[universe][type] = deepClone(planet);
                    delete global.custom.planet[universe][type].pts;
                    terraform(planet);
                }
            },
            reset(){
                planet.traitlist = [];
                Object.keys(planet.geology).forEach(function (res){
                    planet.geology[res] = 0;
                });
                planet.pts = terraformScore(planet,(wiki ? wikiVars : false));
            },
            less(r){
                planet.geology[r] -= keyMultiplier();
                if (planet.geology[r] < -20){
                    planet.geology[r] = -20;
                }
            },
            more(r){
                planet.geology[r] += keyMultiplier();
                let max = 30;
                if (global.stats.achieve['whitehole']){
                    max += global.stats.achieve['whitehole'].l * 5;
                }
                if (planet.biome === 'eden'){
                    max += 5;
                }
                if (planet.geology[r] > max){
                    planet.geology[r] = max;
                }
            }
        },
        filters: {
            res(r){
                return planet.geology[r];
            }
        }
    });
}

export function terraformScore(planet,wiki){
    let pts = (planet.biome === 'eden' ? 0 : 10) + (global.stats.achieve['lamentis'] ? global.stats.achieve.lamentis.l * 10 : 0);
    if (global.race['truepath']){ pts *= 2; }
    pts -= planet.traitlist.length ** 3;
    let ts = 0;
    Object.keys(planet.geology).forEach(function (res){
        if (planet.geology[res] !== 0){
            pts -= planet.geology[res];
            ts++;
        }
    });
    if (ts > 3){
        pts -= (ts - 3) ** 2;
    }
    return pts;
}

export function isStargateOn(wiki){
    if (wiki){
        if (global.interstellar?.s_gate?.count){
            return Boolean(global.interstellar.s_gate.on);
        }
        return true; // If no stargate built yet, then act like it is on to show more information
    }
    return Boolean(p_on['s_gate']);
}
