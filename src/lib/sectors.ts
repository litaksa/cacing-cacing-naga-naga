const BASE = "https://api.sectors.app/v2";

export function sectorsKey(): string | undefined {
  const v = process.env.SECTORS_API_KEY?.trim();
  return v || undefined;
}

export function normSymbol(symbol: string): string {
  return symbol.replace(/\.JK$/i, "").trim().toUpperCase();
}

async function sectorsGet(path: string, params?: Record<string, string>): Promise<unknown> {
  const key = sectorsKey();
  if (!key) {
    return { error: 401, body: "SECTORS_API_KEY belum di-set", path };
  }
  const url = new URL(`${BASE}${path}`);
  if (params) {
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  }
  const res = await fetch(url, {
    headers: { Authorization: key },
  });
  if (!res.ok) {
    const body = await res.text();
    return { error: res.status, body: body.slice(0, 800), path };
  }
  return res.json();
}

function isErr(x: unknown): x is { error: number } {
  return Boolean(x && typeof x === "object" && "error" in x);
}

export async function fetchValuation(symbol: string) {
  const sym = normSymbol(symbol);
  const [report, screen] = await Promise.all([
    sectorsGet(`/company/report/${sym}/`, { sections: "overview,valuation" }),
    sectorsGet("/companies/", {
      where: `symbol = '${sym}.JK' or symbol = '${sym}'`,
      include_query_values: "true",
      limit: "1",
    }),
  ]);
  return { symbol: sym, report, screen };
}

export async function fetchDaily(symbol: string, days = 70) {
  const sym = normSymbol(symbol);
  const start = new Date();
  start.setDate(start.getDate() - days);
  const raw = await sectorsGet(`/daily/${sym}/`, { start: start.toISOString().slice(0, 10) });
  if (isErr(raw)) return { symbol: sym, error: raw };

  const rows = Array.isArray(raw)
    ? raw
    : ((raw as { data?: unknown[]; results?: unknown[] }).data ??
      (raw as { results?: unknown[] }).results ??
      []);

  const clean: { date: string; close: number; volume: number }[] = [];
  for (const row of rows) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    const close = Number(r.close ?? r.last_close_price);
    if (!Number.isFinite(close) || close === 0) continue;
    clean.push({
      date: String(r.date ?? ""),
      close,
      volume: Number(r.volume ?? 0) || 0,
    });
  }
  clean.sort((a, b) => a.date.localeCompare(b.date));
  const closes = clean.map((x) => x.close);
  const vols = clean.map((x) => x.volume);
  const ma = (n: number) =>
    closes.length >= n ? closes.slice(-n).reduce((a, b) => a + b, 0) / n : null;
  const vol20 = vols.length >= 20 ? vols.slice(-20).reduce((a, b) => a + b, 0) / 20 : null;
  const vol5 = vols.length >= 5 ? vols.slice(-5).reduce((a, b) => a + b, 0) / 5 : null;
  return {
    symbol: sym,
    last_close: closes.at(-1) ?? null,
    ma20: ma(20),
    ma50: ma(50),
    vol5_vs_vol20: vol5 && vol20 ? vol5 / vol20 : null,
    ret_20d: closes.length > 21 ? closes[closes.length - 1]! / closes[closes.length - 21]! - 1 : null,
    n_rows: clean.length,
    tail: clean.slice(-8),
  };
}

export async function fetchNagaFlow(symbol: string, days = 10) {
  const sym = normSymbol(symbol);
  const start = new Date();
  start.setDate(start.getDate() - Math.min(days, 14));
  const startS = start.toISOString().slice(0, 10);
  const endS = new Date().toISOString().slice(0, 10);
  const [broker_top, foreign] = await Promise.all([
    sectorsGet(`/broker-summary/${sym}/top/`, {
      start: startS,
      end: endS,
      n_brokers: "5",
    }),
    sectorsGet(`/foreign-flow/${sym}/`, { start: startS, end: endS }),
  ]);
  return { symbol: sym, start: startS, end: endS, broker_top, foreign };
}

export async function fetchQuarterly(symbol: string) {
  const sym = normSymbol(symbol);
  const quarters = await sectorsGet(`/financials/quarterly/${sym}/`, {
    n_quarters: "4",
    approx: "true",
  });
  return { symbol: sym, quarters };
}
