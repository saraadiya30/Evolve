import { loc } from '../../core/locale.js';
import { vBind, popover, clearElement } from '../../functions/functions.js';
import { global } from '../../core/vars.js';
import { traits } from '../races_registry.js';
import { OCULAR_POWER_DISINTEGRATION_BASE, OCULAR_POWER_WOUND_BASE, OCULAR_POWER_TELEKINESIS_BASE, OCULAR_POWER_CHARM_BASE } from '../../config/ocular_power.js';
import { renderSupernatural } from '../trait_logic/ranks_fathom_and_skins.js';
import { psychicBoost, psychicKill, psychicAssault, psychicFinance, psychicCapture, psychicMindBreak } from './psychic_powers_and_blubber.js';
import { majorWish_s1, majorWish_s2, majorWish_s3 } from '../../sections/wishes/major_wish_parts.js';

// Fungsi-fungsi dipindah dari races.js (urutan sumber dipertahankan). races.js tetap mengekspor ulang nama yang tadinya ter-ekspor.


export function majorWish(parent){
    const $ctx = {};
    $ctx.parent = parent;
    majorWish_s1($ctx);
        majorWish_s2($ctx);
        majorWish_s3($ctx);
}

export function ocularPower(parent){
    let container = $(`<div id="ocularPower" class="industry"></div>`);
    parent.append(container);

    container.append($(`<div class="header"><span class="has-text-warning">${loc('trait_ocular_power_name')}</span> - <span v-html="$options.filters.max()"></span></div>`));
    let powers = $(`<div class="flexWrap"></div>`);
    container.append(powers);

    powers.append(`<div id="oculardisintegration" class="chk"><b-checkbox v-model="d" @input="pow('d')">${loc(`ocular_disintegration`)}</b-checkbox></div>`);
    powers.append(`<div id="ocularpetrification" class="chk"><b-checkbox v-model="p" @input="pow('p')">${loc(`ocular_petrification`)}</b-checkbox></div>`);
    powers.append(`<div id="ocularwound" class="chk"><b-checkbox v-model="w" @input="pow('w')">${loc(`ocular_wound`)}</b-checkbox></div>`);
    powers.append(`<div id="oculartelekinesis" class="chk"><b-checkbox v-model="t" @input="pow('t')">${loc(`ocular_telekinesis`)}</b-checkbox></div>`);
    powers.append(`<div id="ocularfear" class="chk"><b-checkbox v-model="f" @input="pow('f')">${loc(`ocular_fear`)}</b-checkbox></div>`);
    powers.append(`<div id="ocularcharm" class="chk"><b-checkbox v-model="c" @input="pow('c')">${loc(`ocular_charm`)}</b-checkbox></div>`);

    vBind({
        el: `#ocularPower`,
        data: global.race.ocularPowerConfig,
        methods: {
            pow(v){
                let active = 0;
                ['d','p','w','t','f','c'].forEach(function(p){
                    if (global.race.ocularPowerConfig[p]){ active++ }
                    if (active > traits.ocular_power.vars()[0] && p !== v){
                        global.race.ocularPowerConfig[p] = false;
                    }
                });
                if (active > traits.ocular_power.vars()[0]){
                    active = 0;
                    ['d','p','w','t','f','c'].reverse().forEach(function(p){
                        if (global.race.ocularPowerConfig[p]){ active++ }
                        if (active > traits.ocular_power.vars()[0] && p !== v){
                            global.race.ocularPowerConfig[p] = false;
                        }
                    });
                    renderSupernatural();
                }
            }
        },
        filters: {
            max(){
                let active = 0;
                ['d','p','w','t','f','c'].forEach(function(p){
                    if (global.race.ocularPowerConfig[p]){ active++ }
                });
                return loc('ocular_max',[active,traits.ocular_power.vars()[0]]);
            },
        }
    });

    ['disintegration','petrification','wound','telekinesis','fear','charm'].forEach(function(power){
        popover(`ocular${power}`,
            function(){
                switch(power){
                    case 'disintegration':
                        let attack = OCULAR_POWER_DISINTEGRATION_BASE * (traits.ocular_power.vars()[1] / 100);
                        return loc(`ocular_${power}_desc`,[attack]);
                    case 'petrification':
                        return loc(`ocular_${power}_desc`,[global.resource.Stone.name]);
                    case 'wound':
                        let hunt = OCULAR_POWER_WOUND_BASE * (traits.ocular_power.vars()[1] / 100);
                        return loc(`ocular_${power}_desc`,[hunt]);
                    case 'telekinesis':
                        let labor = OCULAR_POWER_TELEKINESIS_BASE * (traits.ocular_power.vars()[1] / 100);
                        return loc(`ocular_${power}_desc`,[labor]);
                    case 'fear':
                        return loc(`ocular_${power}_desc`);
                    case 'charm':
                        let trade = OCULAR_POWER_CHARM_BASE * (traits.ocular_power.vars()[1] / 100);
                        return loc(`ocular_${power}_desc`,[trade]);
                }
            },{
                elm: `#ocular${power}`
            }
        );
    });
}

export function renderPsychicPowers(){
    if (!global.settings.tabLoad && (global.settings.civTabs !== 2 || global.settings.govTabs !== 6)){
        return;
    }
    let parent = $(`#psychicPowers`);
    clearElement(parent);

    if (global.race['psychic'] && global.tech['psychic']){
        psychicBoost(parent);
        psychicKill(parent);
        if (global.tech.psychic >= 2){
            psychicAssault(parent);
        }
        if (global.tech.psychic >= 3){
            if (!global.race.psychicPowers['cash']){ global.race.psychicPowers['cash'] = 0 };
            psychicFinance(parent);
        }
        if (global.tech['psychicthrall'] && global.tech['unfathomable'] && global.race['unfathomable']){
            if (global.tech.psychicthrall >= 2){
                psychicCapture(parent);
            }
            psychicMindBreak(parent);
        }
    }
}
