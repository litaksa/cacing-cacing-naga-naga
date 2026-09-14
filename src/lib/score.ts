export type CcnnStatus = "NAGA KELUAR" | "CACING MASUK" | "NETRAL";

export type CcnnScore = {
  status: CcnnStatus;
  score: number;
  breakdown: {
    fundamental: number;
    volume_tren: number;
    naga: number;
    bisnis: number;
  };
  metrics: {
    pe: number | null;
    pb: number | null;
    pe_peer: number | null;
    pb_peer: number | null;
    last_close: number | null;
    ma20: number | null;
    vol5_vs_vol20: number | null;
    net_foreign: number | null;
    company_name: string | null;
  };
  reasons: string[];
  disclaimer: string;
};

function firstNumber(...vals: unknown[]): number | null {
  for (const v of vals) {
    if (typeof v === "boolean" || v == null) continue;
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function walk(obj: unknown, keys: string[]): unknown {
  let cur: unknown = obj;
  for (const k of keys) {
    if (!cur || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[k];
  }
  return cur;
}

function fromScreen(valuation: { screen?: unknown }, field: string): unknown {
  const screen = valuation.screen as Record<string, unknown> | undefined;
  const results = (screen?.results ?? screen?.data) as unknown;
  if (Array.isArray(results) && results[0] && typeof results[0] === "object") {
    const row = results[0] as Record<string, unknown>;
    const qv = (row.query_values ?? row) as Record<string, unknown>;
    return qv[field];
  }
  return undefined;
}

function pickPePb(valuation: { report?: unknown; screen?: unknown }) {
  const report = valuation.report as Record<string, unknown> | undefined;
  const hist = walk(report, ["valuation", "historical_valuation"]);
  const last =
    Array.isArray(hist) && hist.length ? (hist[hist.length - 1] as Record<string, unknown>) : {};
  const overview = (report?.overview ?? report?.valuation ?? {}) as Record<string, unknown>;
  return {
    pe: firstNumber(last.pe, overview.forward_pe, fromScreen(valuation, "pe_ttm"), fromScreen(valuation, "pe")),
    pb: firstNumber(last.pb, fromScreen(valuation, "pb_mrq"), fromScreen(valuation, "pb")),
    pe_peer: firstNumber(last.pe_peer_avg, fromScreen(valuation, "pe_peer_avg")),
    pb_peer: firstNumber(last.pb_peer_avg, fromScreen(valuation, "pb_peer_avg")),
    company_name: typeof report?.company_name === "string" ? report.company_name : null,
  };
}

function sumForeign(flow: { foreign?: unknown }): number | null {
  const foreign = flow.foreign as Record<string, unknown> | undefined;
  if (foreign && "error" in foreign) return null;
  const data = (foreign?.data ?? foreign?.results ?? []) as unknown;
  if (!Array.isArray(data)) return null;
  let total = 0;
  let n = 0;
  for (const row of data) {
    if (!row || typeof row !== "object") continue;
    const val = (row as Record<string, unknown>).net_foreign_inflow;
    const num = Number(val);
    if (!Number.isFinite(num)) continue;
    total += num;
    n += 1;
  }
  return n ? total : null;
}

function numeric(v: unknown): number | null {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function arrayByKey(obj: Record<string, unknown>, keys: string[]): unknown[] {
  for (const k of keys) {
    const v = obj[k];
    if (Array.isArray(v)) return v;
  }
  return [];
}

function netOf(row: unknown): number | null {
  if (!row || typeof row !== "object") return null;
  const r = row as Record<string, unknown>;
  return numeric(r.net ?? r.net_value ?? r.net_buy ?? r.value ?? r.total);
}

function hasDistribution(flow: { broker_top?: unknown }): boolean {
  const top = flow.broker_top;
  if (!top || typeof top !== "object" || "error" in top) return false;
  const obj = top as Record<string, unknown>;
  const nested =
    obj.data && typeof obj.data === "object" && !Array.isArray(obj.data)
      ? (obj.data as Record<string, unknown>)
      : obj;
  const dist = arrayByKey(nested, ["distributing", "top_distributing", "sellers", "top_sellers"]);
  const acc = arrayByKey(nested, ["accumulating", "top_accumulating", "buyers", "top_buyers"]);
  const distNet = dist.reduce((s, row) => s + Math.abs(netOf(row) ?? 0), 0);
  const accNet = acc.reduce((s, row) => s + Math.abs(netOf(row) ?? 0), 0);
  if (dist.length && acc.length && distNet + accNet > 0) return distNet > accNet * 1.15;
  if (dist.length && !acc.length) return true;
  return false;
}

function earningsSoft(quarterly: { quarters?: unknown }): boolean {
  const raw = quarterly.quarters;
  const rows = Array.isArray(raw)
    ? raw
    : ((raw as { data?: unknown[] } | undefined)?.data ?? []);
  const earns: number[] = [];
  for (const row of rows) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    const val = firstNumber(r.earnings, r.revenue);
    if (val != null) earns.push(val);
  }
  if (earns.length < 3) return false;
  return earns[earns.length - 1]! < earns[0]!;
}

export function scoreCcnn(
  valuation: { report?: unknown; screen?: unknown },
  daily: Record<string, unknown>,
  flow: { foreign?: unknown; broker_top?: unknown },
  quarterly: { quarters?: unknown },
): CcnnScore {
  let fund = 0;
  let tech = 0;
  let naga = 0;
  let bisnis = 0;
  const reasons: string[] = [];

  const { pe, pb, pe_peer, pb_peer, company_name } = pickPePb(valuation);
  if (pe && pe_peer && pe > pe_peer * 1.3) {
    fund += 15;
    reasons.push(`PE ${pe.toFixed(1)} lebih mahal dari peer ${pe_peer.toFixed(1)}`);
  } else if (pe && pe_peer) {
    reasons.push(`PE ${pe.toFixed(1)} vs peer ${pe_peer.toFixed(1)}`);
  }
  if (pb && pb_peer && pb > pb_peer * 1.3) {
    fund += 15;
    reasons.push(`PBV ${pb.toFixed(2)} lebih mahal dari peer ${pb_peer.toFixed(2)}`);
  } else if (pb && pb_peer) {
    reasons.push(`PBV ${pb.toFixed(2)} vs peer ${pb_peer.toFixed(2)}`);
  }

  const last = firstNumber(daily.last_close);
  const ma20 = firstNumber(daily.ma20);
  const volRatio = firstNumber(daily.vol5_vs_vol20);
  const ret20 = firstNumber(daily.ret_20d);
  if (last && ma20 && last > ma20) {
    tech += 10;
    reasons.push("Harga di atas MA20");
  }
  if (volRatio && volRatio >= 1.5) {
    tech += 20;
    reasons.push(`Volume 5 hari ${volRatio.toFixed(1)}x rata-rata 20 hari`);
  }
  if (ret20 && ret20 >= 0.15) {
    tech += 5;
    reasons.push(`Naik ${(ret20 * 100).toFixed(1)}% dalam 20 hari`);
  }

  const netF = sumForeign(flow);
  if (netF != null && netF < 0) {
    naga += 15;
    reasons.push("Foreign flow netto negatif");
  }
  if (hasDistribution(flow)) {
    naga += 15;
    reasons.push("Ada jejak broker distribusi");
  }

  if (earningsSoft(quarterly)) {
    bisnis += 10;
    reasons.push("Laba/revenue 4 kuartal cenderung melemah");
  }

  if (daily.error || (valuation.report && typeof valuation.report === "object" && "error" in valuation.report)) {
    reasons.push("Sebagian data Sectors gagal ditarik — skor bisa kurang lengkap");
  }

  const total = Math.min(100, fund + tech + naga + bisnis);
  const status: CcnnStatus = total >= 65 ? "NAGA KELUAR" : total >= 40 ? "CACING MASUK" : "NETRAL";

  return {
    status,
    score: total,
    breakdown: { fundamental: fund, volume_tren: tech, naga, bisnis },
    metrics: {
      pe,
      pb,
      pe_peer,
      pb_peer,
      last_close: last,
      ma20,
      vol5_vs_vol20: volRatio,
      net_foreign: netF,
      company_name,
    },
    reasons: reasons.slice(0, 6),
    disclaimer: "Bukan sinyal jual/beli. Alert risiko nyangkut saja.",
  };
}
