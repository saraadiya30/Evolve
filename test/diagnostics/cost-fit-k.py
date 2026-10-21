# Uji model geometrik + konstanta K: python3 test/diagnostics/cost-fit-k.py <cost_dump.json ...>
import json, sys
from collections import Counter
CS = ['0','1','2','5','10','25','50','100']; CI = [0,1,2,5,10,25,50,100]
def fit(pts, withK):
    best = (9e9, None)
    ms = [1.0 + 0.0005 * i for i in range(1, 2001)]
    for m in ms:
        xs = [m ** c for c, _ in pts]; ys = [v for _, v in pts]
        n = len(xs)
        if withK:
            sx = sum(xs); sy = sum(ys); sxx = sum(x*x for x in xs); sxy = sum(x*y for x, y in zip(xs, ys))
            den = n * sxx - sx * sx
            if abs(den) < 1e-12: continue
            A = (n * sxy - sx * sy) / den; K = (sy - A * sx) / n
        else:
            A = sum(x*y for x, y in zip(xs, ys)) / sum(x*x for x in xs); K = 0.0
        worst = max(abs(A * x + K - y) / max(abs(y), 1.0) for x, y in zip(xs, ys))
        if worst < best[0]: best = (worst, (m, A, K))
    return best
for f in sys.argv[1:]:
    d = json.load(open(f)); S = d['structs']
    res_geo = res_k = res_none = 0; ks = Counter(); none = []
    for sid, rec in S.items():
        for res in rec['0']['raw']:
            raw = [rec[c]['raw'].get(res) for c in CS]
            if None in raw or raw[-1] <= 0: continue
            pts = [(c, v) for c, v in zip(CI, raw) if v >= 200]
            if len(pts) < 4: continue
            w0, p0 = fit(pts, False)
            if w0 <= 0.01: res_geo += 1; continue
            w1, p1 = fit(pts, True)
            if w1 <= 0.01: res_k += 1; ks[round(p1[2] / 50) * 50] += 1
            else: res_none += 1; none.append((sid, res, round(w1, 3)))
    print(f"\n== {f.split('/')[-1]}")
    print(f"   geometrik murni: {res_geo}; geometrik + konstanta K: {res_k}; tidak terjelaskan: {res_none}")
    print(f"   nilai K (dibulatkan ke 50): {dict(ks.most_common(8))}")
    for x in none[:8]: print('   tidak terjelaskan:', x)
