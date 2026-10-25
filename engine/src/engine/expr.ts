import type { CostEntry, CostLibrary, CostVector, Expr, StateFacts } from '../contract';

export interface EvalCtx {
  facts: StateFacts;
  library: CostLibrary;
  /** bangunan yang sedang dihitung: rujukan ke `global.<region>.<structure>.count` memakai `count` di bawah, bukan snapshot. */
  entry: Pick<CostEntry, 'self' | 'props'>;
  count: number;
  /** cost mentah bangunan ini (untuk `rawCosts`, masukan rantai adjuster). */
  rawCosts: CostVector;
  locals: Record<string, unknown>;
}

const dyn = (p: unknown, ctx: EvalCtx): unknown => (p !== null && typeof p === 'object' ? evalExpr(p as Expr, ctx) : p);

export function callLibrary(fn: string, args: unknown[], ctx: EvalCtx): unknown {
  const f = ctx.library[fn];
  if (!f) throw new Error(`fungsi pustaka tidak ada: ${fn}`);
  const locals: Record<string, unknown> = {};
  f.params.forEach((p, i) => { locals[p] = args[i]; });
  return evalExpr(f.body, { ...ctx, locals });
}

/**
 * Evaluator bahasa ekspresi. Ini SATU-SATUNYA kode engine cost: semua aturan (geometrik, modifier pertumbuhan, kondisi, adjuster)
 * adalah data. Semantik operator = JavaScript (sengaja, agar sama persis dengan Evolve).
 */
export function evalExpr(e: Expr, ctx: EvalCtx): any {
  if (e === null || typeof e !== 'object') return e;
  if ('ref' in e) {
    switch (e.ref) {
      case 'local': return ctx.locals[e.name];
      case 'rawCosts': return ctx.rawCosts;
      case 'action': {
        const a: Record<string, unknown> = {};
        if (ctx.entry.props.path) a['path'] = ctx.entry.props.path;
        if (ctx.entry.self) a['struct'] = true;
        return a;
      }
      case 'actionStruct': return ctx.entry.self ? { p: [ctx.entry.self.structure, ctx.entry.self.region] } : undefined;
      case 'global': {
        const path = e.path.map((p) => dyn(p, ctx));
        const s = ctx.entry.self;
        if (s && path.length === 3 && path[0] === s.region && path[1] === s.structure && path[2] === 'count') return ctx.count;
        let cur: any = ctx.facts.global;
        for (const k of path) { if (cur === null || cur === undefined) return undefined; cur = cur[k as any]; }
        return cur;
      }
      case 'pOn': return ctx.facts.pOn[dyn(e.name, ctx) as string];
      case 'supportOn': return ctx.facts.supportOn[dyn(e.name, ctx) as string];
      case 'traitVars': {
        const rank = e.rank === null ? null : evalExpr(e.rank, ctx);
        const key = `${e.table}.${e.name}${rank === null ? '' : `@${rank}`}`;
        if (!(key in ctx.facts.traitVars)) throw new Error(`traitVars hilang di facts: ${key}`);
        return ctx.facts.traitVars[key];
      }
    }
  }
  const a = (e as { args?: Expr[] }).args ?? [];
  switch ((e as { op: string }).op) {
    case 'let': return evalExpr(a[1]!, { ...ctx, locals: { ...ctx.locals, [(e as any).name]: evalExpr(a[0]!, ctx) } });
    case 'dflt': { const v = evalExpr(a[0]!, ctx); return v === undefined ? evalExpr(a[1]!, ctx) : v; }
    case 'lit': return structuredClone((e as any).value);
    case 'obj': { const o: Record<string, unknown> = {}; (e as any).keys.forEach((k: string, i: number) => { o[k] = evalExpr(a[i]!, ctx); }); return o; }
    case 'builtin': { const f = ({ Number, Boolean, isFinite, parseFloat, String } as Record<string, (...x: unknown[]) => unknown>)[(e as any).fn]!; return f(...a.map((x) => evalExpr(x, ctx))); }
    case 'keys': return Object.keys(evalExpr(a[0]!, ctx) ?? {});
    case 'filter': { const arr = evalExpr(a[0]!, ctx) as unknown[]; return arr.filter((x) => evalExpr(a[1]!, { ...ctx, locals: { ...ctx.locals, [(e as any).var]: x } })); }
    case 'toPrecision': return (evalExpr(a[0]!, ctx) as number).toPrecision(evalExpr(a[1]!, ctx) as number);
    case 'lambda': { const ps = (e as any).params as string[]; return (...args: unknown[]) => evalExpr((e as any).body, { ...ctx, locals: { ...ctx.locals, ...Object.fromEntries(ps.map((p, i) => [p, args[i]])) } }); }
    case 'apply': { const f = evalExpr(a[0]!, ctx) as (...x: unknown[]) => unknown; return f(...a.slice(1).map((x) => evalExpr(x, ctx))); }
    case 'undef': return undefined;
    case 'null': return null;
    case 'nil': return [];
    case 'vecNew': return {};
    case '?:': return evalExpr(a[0]!, ctx) ? evalExpr(a[1]!, ctx) : evalExpr(a[2]!, ctx);
    case '&&': { const l = evalExpr(a[0]!, ctx); return l ? evalExpr(a[1]!, ctx) : l; }
    case '||': { const l = evalExpr(a[0]!, ctx); return l ? l : evalExpr(a[1]!, ctx); }
    case '??': { const l = evalExpr(a[0]!, ctx); return l ?? evalExpr(a[1]!, ctx); }
    case '!': return !evalExpr(a[0]!, ctx);
    case 'neg': return -evalExpr(a[0]!, ctx);
    case 'num': return +evalExpr(a[0]!, ctx);
    case 'typeof': return typeof evalExpr(a[0]!, ctx);
    case 'array': return a.map((x) => evalExpr(x, ctx));
    case 'concat': return a.map((x) => String(evalExpr(x, ctx))).join('');
    case 'math': return (Math as any)[(e as any).fn](...a.map((x) => evalExpr(x, ctx)));
    case 'toFixed': return (evalExpr(a[0]!, ctx) as number).toFixed(evalExpr(a[1]!, ctx) as number);
    case 'has': case 'vecHas': { const o = evalExpr(a[0]!, ctx); return o !== null && o !== undefined && Object.prototype.hasOwnProperty.call(o, evalExpr(a[1]!, ctx)); }
    case 'includes': { const o = evalExpr(a[0]!, ctx); return o !== null && o !== undefined && o.includes(evalExpr(a[1]!, ctx)); }
    case 'get': case 'vecGet': { const o = evalExpr(a[0]!, ctx); return o === null || o === undefined ? undefined : o[evalExpr(a[1]!, ctx)]; }
    case 'vecSet': return { ...evalExpr(a[0]!, ctx), [evalExpr(a[1]!, ctx)]: evalExpr(a[2]!, ctx) };
    case 'pair': return [evalExpr(a[0]!, ctx), evalExpr(a[1]!, ctx)];
    case 'cons': return [evalExpr(a[0]!, ctx), ...(evalExpr(a[1]!, ctx) as unknown[])];
    case 'vecFold': {
      // urutan penulisan = urutan kunci vektor sumber; menimpa kunci yang ada mempertahankan posisinya (semantik objek JS, penting untuk flier)
      const out: Record<string, unknown> = { ...evalExpr(a[0]!, ctx) };
      const vec = evalExpr(a[1]!, ctx) as Record<string, unknown>;
      for (const key of Object.keys(vec)) {
        const pairs = evalExpr(a[2]!, { ...ctx, locals: { ...ctx.locals, [(e as any).var]: key } }) as [string, unknown][];
        for (const [k, v] of pairs) out[k] = v;
      }
      return out;
    }
    case 'call': return callLibrary((e as any).fn, a.map((x) => evalExpr(x, ctx)), ctx);
    case 'ext': {
      const args = a.map((x) => evalExpr(x, ctx));
      const key = `${(e as any).name}(${JSON.stringify(args)})`;
      if (!(key in ctx.facts.ext)) throw new Error(`fakta eksternal hilang: ${key}`);
      return ctx.facts.ext[key];
    }
  }
  const l = evalExpr(a[0]!, ctx), r = evalExpr(a[1]!, ctx);
  switch ((e as { op: string }).op) {
    case '+': return l + r;
    case '-': return l - r;
    case '*': return l * r;
    case '/': return l / r;
    case '%': return l % r;
    case '**': return l ** r;
    case '<': return l < r;
    case '<=': return l <= r;
    case '>': return l > r;
    case '>=': return l >= r;
    case '===': return l === r;
    case '!==': return l !== r;
    // eslint-disable-next-line eqeqeq
    case '==': return l == r;
    // eslint-disable-next-line eqeqeq
    case '!=': return l != r;
  }
  throw new Error(`operator tidak dikenal: ${(e as { op: string }).op}`);
}
