# Analisis oracle cost: python3 test/diagnostics/cost-analyze.py <cost_dump.json ...>  (uji hukum geometrik dan atribusi faktor adjuster per resource)
import json, sys
from collections import Counter, defaultdict
CS = ['0','1','2','5','10','25','50','100']; CI = [0,1,2,5,10,25,50,100]
for f in sys.argv[1:]:
    d = json.load(open(f)); S = d['structs']
    tested = ok = 0; bad = []; small = 0
    fac = defaultdict(Counter)
    for sid, rec in S.items():
        for res in rec['0']['raw']:
            raw = [rec[c]['raw'].get(res) for c in CS]
            if None in raw or raw[-1] <= 0: continue
            # hanya uji titik dengan nilai >= 200 (pembulatan < 0.25%); m dari dua titik terbesar
            pts = [(c, v) for c, v in zip(CI, raw) if v >= 200]
            if len(pts) < 3: small += 1; continue
            (c1, v1), (c2, v2) = pts[-2], pts[-1]
            if c2 == c1: continue
            m = (v2 / v1) ** (1.0 / (c2 - c1)); worst = 0.0
            for c, v in pts: worst = max(worst, abs(v2 * m ** (c - c2) - v) / v)
            tested += 1
            if worst <= 0.01: ok += 1
            else: bad.append((sid, res, round(m, 4), round(worst, 3)))
        for res in rec['0']['adj']:
            r0 = rec['0']['raw'].get(res); a0 = rec['0']['adj'].get(res)
            if r0 and a0 is not None and abs(a0 / r0 - 1) > 1e-6: fac[round(a0 / r0, 3)][res] += 1
    print(f"\n== {f.split('/')[-1]}")
    print(f"   uji geometrik (hanya nilai >=200, jadi pembulatan diabaikan): {ok}/{tested} lolos <=1%; {small} pasangan terlalu kecil untuk diuji")
    for b in bad[:8]: print('   MELENCENG:', b)
    for r, c in sorted(fac.items(), key=lambda x: -sum(x[1].values())): print(f"   faktor {r}: resource -> {dict(c.most_common(6))}")
