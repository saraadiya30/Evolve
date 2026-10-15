// Buku besar listrik: SATU-SATUNYA tempat sumber listrik dihitung. Setiap sumber (pembangkit, megastruktur, Aether, bonus stock)
// dan setiap beban yang dihitung pada fase pembangkitan masuk lewat powerAdd(): ia mengubah $ctx.max_power dan $ctx.power_grid
// sekaligus mencatat barisnya di $ctx.power_parts. Catatan itu dibuat baru setiap tick, jadi sumber yang berhenti (Aether
// dimatikan, pembangkit lenyap) otomatis hilang dari tooltip, tanpa perlu `delete` manual di tempat lain.
// Tooltip listrik hanya menampilkan catatan ini (S.powerParts); power_total adalah jumlah barisnya.
// Fase pemakaian (fast_loop_power_usage.js) membaca $ctx.power_grid yang sudah mencakup semua sumber, jadi bangunan menyala
// berdasarkan listrik yang sama dengan yang ditampilkan. Jangan mengubah $ctx.max_power / $ctx.power_grid langsung dengan +=:
// test/power-ledger.mjs memeriksanya.

export function powerBegin($ctx){
    $ctx.power_grid = 0;
    $ctx.max_power = 0;
    $ctx.power_parts = [];
}

// label: teks sudah dilokalkan. amount: positif = menghasilkan listrik, negatif = beban yang dihitung di fase ini (mis. mill,
// stellar engine). Baris berlabel sama digabung. Baris bernilai 0 tidak dicatat.
export function powerAdd($ctx, label, amount){
    $ctx.max_power -= amount;
    $ctx.power_grid += amount;
    if (amount === 0){
        return;
    }
    let parts = $ctx.power_parts || ($ctx.power_parts = []);
    for (let i = 0; i < parts.length; i++){
        if (parts[i].label === label){
            parts[i].value += amount;
            return;
        }
    }
    parts.push({ label, value: amount });
}
