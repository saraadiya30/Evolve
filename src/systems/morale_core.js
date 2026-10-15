// Pure morale calculation functions. Like stocks_core.js, these functions contain no DOM/jQuery
// access -- they take explicit inputs and return a number, so they can be unit-tested outside
// the browser. The total itself is built by the ledger at the bottom of this file (moraleAdd).
import { PET_BASE_BONUS, PET_EVENT_BONUS, PET_TYPE_BONUS } from '../config/constants.js';

// Morale bonus/penalty from owning a pet. `pet` is global.race.pet (or a falsy value if the
// player has no pet). The morale tick calls this and records the result in the ledger below.
export function petMorale(pet){
    if (!pet){
        return 0;
    }
    let bonus = PET_BASE_BONUS;
    if (pet.event > 0){
        bonus += PET_EVENT_BONUS;
    }
    if (pet.pet > 0){
        bonus += pet.type === 'cat' ? PET_TYPE_BONUS.cat : PET_TYPE_BONUS.other;
    }
    else if (pet.pet < 0){
        bonus -= pet.type === 'cat' ? PET_TYPE_BONUS.cat : PET_TYPE_BONUS.other;
    }
    return bonus;
}

// ---- Buku besar morale ---------------------------------------------------------------------------------------------------
// SATU-SATUNYA tempat total morale dihitung. Setiap modifier masuk lewat moraleAdd(): ia menambah $ctx.morale (jumlah yang
// dipakai game) sekaligus mencatat barisnya di $ctx.moraleParts. Tooltip morale hanya menampilkan catatan itu (S.moraleParts)
// dan Total-nya adalah `potential` yang dibaca governor, jadi tooltip, potential, dan Current tidak bisa lagi berbeda hitungan.
// Menambah efek morale baru = satu panggilan moraleAdd() di tick; tidak ada daftar kedua yang perlu disamakan.
// Jangan mengubah $ctx.morale langsung dengan += / -=: test/morale-ledger.mjs memeriksa Total = 100 + jumlah barisnya.

export const MORALE_BASE = 100;
export const MORALE_LABEL_CHEESE = 'morale_cheese'; // nama label bergantung ras (swissKnife), diselesaikan oleh tooltip

export function moraleBegin($ctx){
    $ctx.morale = MORALE_BASE;
    $ctx.moraleParts = [];
}

// label: kunci loc. value: perubahan morale (negatif = pengurangan). Baris berlabel sama digabung (mis. pajak = tarif dasar +
// pajak tinggi + oligarki). Baris bernilai 0 tidak dicatat.
// opts (opsional, hanya memengaruhi tampilan): prec = jumlah desimal (default 1); shown = nilai yang ditampilkan bila beda dari
// value; sub = { label, text, prefix } baris keterangan di bawahnya.
export function moraleAdd($ctx, label, value, opts){
    $ctx.morale += value;
    if (value === 0){
        return;
    }
    let parts = $ctx.moraleParts || ($ctx.moraleParts = []);
    for (let i = 0; i < parts.length; i++){
        if (parts[i].label === label){
            parts[i].value += value;
            return;
        }
    }
    parts.push({ label, value, opts });
}
