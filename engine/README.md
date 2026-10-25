# engine (draft Fase 1)

Mesin stat/cost terpusat untuk rebuild Evolve. Kontrak dan hasil uji: `../notes/CONTRACT.md`.

```
npm install
npm test          # vitest: resolver produksi, cap, cost vs oracle Evolve (+ tes unit bahasa ekspresi)
npm run typecheck
```

- `src/contract.ts` tipe kontrak (termasuk bahasa ekspresi deklaratif `Expr`); `src/engine/expr.ts` evaluator (satu-satunya kode aturan cost); `src/engine/cost.ts` resolveCost; `src/engine/ledger.ts` resolveLedger (morale, pembangkitan power).
- `src/data/costs.ast.json` SEMUA aturan cost sebagai data: 1.339 cost, 16 adjuster, modifier pertumbuhan, fungsi pembungkus; diterjemahkan otomatis dari sumber Evolve
  (`test/diagnostics/extract-costs.mjs` + `cost-ast.mjs` di repo Evolve master). `src/data/load.ts` memuatnya saat runtime (JSON-nya terlalu besar untuk sistem tipe).
- `fixtures/oracle/*.json.gz` dump dari Evolve master (breakdown, cost untuk 25 state, dan ledger morale/power untuk 7 state). Dibuat ulang dengan skrip di `test/diagnostics/` repo Evolve master
  (`bd-dump.mjs`, `gen-proto.mjs`, `cost-dump.mjs`, `extract-costs.mjs`); fixture dibekukan supaya tes tidak bergantung pada Evolve.
