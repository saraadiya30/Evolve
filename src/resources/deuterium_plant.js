// Contains: loadDeuteriumPlant()
// The setting panel of the Deuterium Power Plant (interstellar Alpha Centauri building, global.interstellar.deut_plant). It is
// shown in the tile's gear modal and in the Industry tab (like the Graphene Plant's panel): how much Deuterium per second the
// plant burns (+/- buttons or typing, no upper limit) and what that gives. The maths are in deuterium_plant_core.js, the power
// itself is added in fast_loop_power_generation.js.
import { global, keyMultiplier } from '../core/vars.js';
import { vBind } from '../functions/dom_helpers.js';
import { loc } from '../core/locale.js';
import { timeFormat } from '../functions/time_format.js';
import { powerModifier } from '../functions/power_modifiers.js';
import { aetherFormat } from './aether_alchemy.js';
import { DEUT_PLANT_WATT_PER_UNIT, sanitizeDeutRate, deuteriumPlantSummary } from './deuterium_plant_core.js';

// parent: the Industry panel div (created by defineIndustry) or the gear modal body, bind: its selector (none in the modal).
// The panel div is created by us, not by the Buefy tab, so it can be bound directly (same as #iGraphene).
export function loadDeuteriumPlant(parent, bind){
    let plant = global.interstellar['deut_plant'];
    if (!plant){
        return;
    }
    // Every key must exist before the first vBind (Vue 2 only makes the keys that exist at bind time reactive)
    plant.rate = sanitizeDeutRate(plant.rate);

    // Top: the setting. Below: what it does, as label / value rows. Layout is inline style so no stylesheet has to be rebuilt.
    parent.append($(`<div class="deutPlant" style="margin-top:0.25rem">
        <div style="display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:0.4rem">
            <span class="has-text-warning">${loc('deut_plant_burn')}:</span>
            <span role="button" class="sub" @click="sub" aria-label="decrease Deuterium"><span>&laquo;</span></span>
            <input type="number" min="0" step="any" v-model.number="p.rate" @change="clamp" aria-label="${loc('deut_plant_burn')}" style="width:7rem;text-align:center;background:#1a1a1a;color:inherit;border:1px solid #555;border-radius:2px;padding:0.1rem 0.3rem">
            <span role="button" class="add" @click="add" aria-label="increase Deuterium"><span>&raquo;</span></span>
            <span class="has-text-caution">{{ d.name }}/s</span>
        </div>
        <div style="display:grid;grid-template-columns:auto auto;justify-content:center;gap:0.15rem 1.5rem;margin-top:0.6rem;text-align:left">
            <span class="has-text-warning">${loc('deut_plant_stock')}</span><span>{{ stock() }}</span>
            <span class="has-text-warning">${loc('deut_plant_net')}</span><span :class="netClass()">{{ net() }}</span>
            <span class="has-text-warning">${loc('deut_plant_burning')}</span><span :class="burnClass()">{{ burning() }}</span>
            <span class="has-text-warning">${loc('deut_plant_output')}</span><span :class="outClass()">{{ output() }}</span>
            <span class="has-text-warning" v-show="s().depletesIn >= 0">${loc('deut_plant_depletes')}</span><span class="has-text-danger" v-show="s().depletesIn >= 0">{{ depletes() }}</span>
        </div>
        <div class="has-text-danger" v-show="s().state === 'limited'" style="margin-top:0.4rem;text-align:center">${loc('deut_plant_limited')}</div>
    </div>`));

    vBind({
        el: bind ? bind : '#specialModal',
        data: { p: plant, d: global.resource.Deuterium },
        methods: {
            clamp(){
                this.p.rate = sanitizeDeutRate(this.p.rate);
            },
            add(){
                this.p.rate = sanitizeDeutRate(+(this.p.rate + keyMultiplier()).toFixed(6));
            },
            sub(){
                this.p.rate = sanitizeDeutRate(+(this.p.rate - keyMultiplier()).toFixed(6));
            },
            // What the plant really does with the current stock: it is the setting only while the Deuterium lasts
            s(){
                return deuteriumPlantSummary(this.p.rate, this.d.amount, this.d.diff, powerModifier(DEUT_PLANT_WATT_PER_UNIT));
            },
            stock(){
                return aetherFormat(this.d.amount);
            },
            net(){
                let diff = Number(this.d.diff) || 0;
                return `${diff > 0 ? '+' : ''}${aetherFormat(diff)}/s`;
            },
            netClass(){
                let diff = Number(this.d.diff) || 0;
                return diff > 0 ? 'has-text-success' : (diff < 0 ? 'has-text-danger' : '');
            },
            burning(){
                let s = this.s();
                if (s.state === 'off'){
                    return loc('deut_plant_off');
                }
                return s.state === 'limited' ? `${aetherFormat(s.burning)} / ${aetherFormat(this.p.rate)} ${this.d.name}/s` : `${aetherFormat(s.burning)} ${this.d.name}/s`;
            },
            burnClass(){
                let state = this.s().state;
                return state === 'limited' ? 'has-text-danger' : (state === 'off' ? 'has-text-caution' : '');
            },
            output(){
                return `${aetherFormat(this.s().watts)} W`;
            },
            outClass(){
                let state = this.s().state;
                return state === 'ok' ? 'has-text-success' : (state === 'limited' ? 'has-text-danger' : 'has-text-caution');
            },
            depletes(){
                return timeFormat(this.s().depletesIn);
            }
        }
    });
}
