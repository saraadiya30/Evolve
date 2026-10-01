// Registry kosong yang diisi oleh truepath.js. Dipisah supaya region (tp_*.js) bisa merujuk outerTruth/tauCetiModules
// (mis. tauCetiModules.tau_gas.info.name(i) dari region lain) tanpa circular import ke truepath.js untuk hal itu.
export const outerTruth = {};
export const tauCetiModules = {};
