# engine (draft Fase 1)

Mesin stat/cost terpusat untuk rebuild Evolve. Kontrak dan hasil uji: `../notes/CONTRACT.md`.

```
npm install
npm test          # vitest: resolver produksi, cap, cost vs oracle Evolve
npm run typecheck
```

- `src/contract.ts` tipe kontrak; `src/engine/*` resolver; `src/data/costs.generated.json` definisi cost hasil ekstraksi otomatis dari sumber Evolve.
- `fixtures/oracle/` dump dari Evolve master (breakdown dan cost). Dibuat ulang dengan skrip di `test/diagnostics/` repo Evolve master
  (`bd-dump.mjs`, `gen-proto.mjs`, `cost-dump.mjs`, `extract-costs.mjs`); fixture ini dibekukan supaya tes tidak bergantung pada Evolve.
