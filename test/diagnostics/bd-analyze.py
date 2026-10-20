# Analisis oracle breakdown: python3 test/diagnostics/bd-analyze.py <file json dari bd-dump.mjs atau /tmp/gen_bd.json>
# Rekonstruksi cap (jumlah entri v == max) dan produksi (akumulasi berurutan x Global + consume) lalu bandingkan dengan resource.diff.
import json, re, sys
d = json.load(open(sys.argv[1]))

def parse(v):
    if isinstance(v, (int, float)): return ('raw', float(v))
    m = re.fullmatch(r'\s*(-?[0-9.]+(?:e[+-]?\d+)?)\s*([v%]?)\s*', str(v))
    if not m: return ('?', None)
    return ({'v': 'v', '%': '%', '': 'raw'}[m.group(2)], float(m.group(1)))

def predict(ent, gprod, cons):
    S = 0.0; cur = None; mult = 1.0
    def flush():
        nonlocal S, cur, mult
        if cur is not None: S += cur * mult
        cur = None; mult = 1.0
    for lab, v in ent.items():
        k, x = parse(v)
        child = lab.startswith('ᄂ')
        if child:
            if cur is None: continue
            if k == '%': mult *= (1 + x / 100.0)
            elif k in ('v', 'raw'): cur += x
        else:
            if k in ('v', 'raw'): flush(); cur = x
            elif k == '%': flush(); S *= (1 + x / 100.0)
    flush()
    return S * gprod + cons

tot = good = good01 = 0; cap_ok = cap_bad = 0; bad = {}
for si, st in enumerate(d['steps']):
    R, P, C = st['resources'], st['p'], st['c']
    for res, ent in C.items():
        if res in R and isinstance(R[res]['max'], (int, float)) and R[res]['max'] > 0 and isinstance(ent, dict):
            s = sum(parse(v)[1] for v in ent.values() if parse(v)[0] == 'v')
            if abs(s - R[res]['max']) <= max(1.0, 1e-4 * R[res]['max']): cap_ok += 1
            else: cap_bad += 1
    gprod = 1.0
    for v in P.get('Global', {}).values():
        k, x = parse(v)
        if k == '%': gprod *= (1 + x / 100.0)
    for res, ent in P.items():
        if res in ('Global', 'consume') or res not in R or not isinstance(ent, dict): continue
        cons = sum(parse(v)[1] for v in P.get('consume', {}).get(res, {}).values())
        pred = predict(ent, gprod, cons); diff = R[res]['diff']
        if diff == 0 and pred == 0: continue
        tot += 1
        err = 0.0 if abs(pred - diff) <= 0.006 else abs(pred - diff) / max(abs(diff), 1e-9)
        if err <= 0.01: good += 1
        if err <= 0.001: good01 += 1
        if err > 0.01: bad.setdefault(res, []).append((si, round(diff, 3), round(pred, 3)))
print(f"CAP  : {cap_ok} cocok, {cap_bad} tidak cocok (jumlah entri 'v' == max)")
print(f"PROD : {tot} pengecekan (resource aktif x tick); selisih<=1%: {good} ({100*good/tot:.1f}%), selisih<=0.1%: {good01} ({100*good01/tot:.1f}%)")
for r, l in bad.items(): print('  meleset:', r, l[:2], '...' if len(l) > 2 else '')
