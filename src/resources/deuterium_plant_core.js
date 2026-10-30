// Pure maths for the Deuterium Power Plant (Resources > Deuterium Plant tab). This file must NOT import anything, so it can be
// unit tested outside the browser and imported from the fast loop and the tab without circular imports.
//
// The plant is bought once. After that the player sets how much Deuterium it burns per second (no upper limit); the Watts
// are simply that rate times DEUT_PLANT_WATT_PER_UNIT. Tritium is bred inside the reactor (the neutron from D-T fusion
// splits lithium in the blanket), so Deuterium is the only fuel the player sees.

// 1 Deuterium/s -> 17.6 W. Same ratio as the Alpha Centauri Fusion Reactor (22 W for 1.25 Deuterium/s), and the 17.6 MeV
// that one D-T reaction releases.
export const DEUT_PLANT_WATT_PER_UNIT = 17.6;

// One-time price, same ingredients and base amounts as the first Fusion Reactor (interstellar alpha.js).
export const DEUT_PLANT_COST = { Money: 990000, Iridium: 44000, Infernite: 350, Brick: 18000 };

// The number the player types: anything that is not a finite number >= 0 becomes 0. There is deliberately no upper limit,
// only the stock of Deuterium can stop the plant (see deuteriumPlantStep).
export function sanitizeDeutRate(value){
    let n = Number(value);
    if (!isFinite(n) || n <= 0){
        return 0;
    }
    return n;
}

// One tick of the plant. rate: Deuterium per second the player asked for, available: Deuterium in stock, seconds: length of the
// tick, wattPerUnit: Watts per Deuterium/s (already including power modifiers). When the stock cannot cover the whole tick the
// plant burns what is left and the output drops in the same proportion (so it is 0 once the stock is empty).
// Returns { consumed, rate, watts }: consumed is the Deuterium burned this tick, rate the Deuterium/s really being burned
// and watts the output.
export function deuteriumPlantStep(rate, available, seconds, wattPerUnit){
    rate = sanitizeDeutRate(rate);
    available = Number(available);
    if (!(available > 0) || !isFinite(available) || !(seconds > 0) || !isFinite(seconds) || rate === 0){
        return { consumed: 0, rate: 0, watts: 0 };
    }
    let wanted = rate * seconds;
    let consumed = Math.min(wanted, available);
    let real = consumed / seconds;
    return { consumed: consumed, rate: real, watts: real * wattPerUnit };
}

// What the setting panel shows, from the numbers it already has. rate: what the player set (Deuterium/s), stock: Deuterium in
// stock, net: the Deuterium change per second of the whole stock (the plant's own burn included), wattPerUnit as in the step above.
// state: 'off' (rate 0), 'ok' (burns what was set) or 'limited' (the stock cannot cover the setting); burning: Deuterium/s really
// burned; watts: the output; depletesIn: seconds until the stock is gone while it is shrinking and the plant is on, -1 otherwise.
export function deuteriumPlantSummary(rate, stock, net, wattPerUnit){
    rate = sanitizeDeutRate(rate);
    stock = Number(stock) > 0 && isFinite(Number(stock)) ? Number(stock) : 0;
    net = Number(net);
    let step = deuteriumPlantStep(rate, stock, 1, wattPerUnit);
    let state = rate === 0 ? 'off' : (step.rate < rate ? 'limited' : 'ok');
    let depletesIn = state !== 'off' && stock > 0 && isFinite(net) && net < 0 ? stock / -net : -1;
    return { state: state, burning: step.rate, watts: step.watts, depletesIn: depletesIn };
}
