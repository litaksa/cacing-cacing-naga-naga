import { createServerFn } from "@tanstack/react-start";
import { CONGLOMERATES, findGroup, lookupTicker } from "@/lib/conglomerates";
import { scoreCcnn, type CcnnScore } from "@/lib/score";
import {
  fetchDaily,
  fetchNagaFlow,
  fetchQuarterly,
  fetchValuation,
  normSymbol,
  sectorsKey,
} from "@/lib/sectors";

export type TickerCard = {
  symbol: string;
  groupId: string;
  groupName: string;
  name: string;
  score: CcnnScore;
};

export type AnalyzeResult =
  | { ok: true; cards: TickerCard[]; narrative: string | null; missingKey: boolean }
  | { ok: false; error: string; missingKey: boolean };

async function analyzeOne(symbol: string): Promise<TickerCard> {
  const sym = normSymbol(symbol);
  const [valuation, daily, flow, quarterly] = await Promise.all([
    fetchValuation(sym),
    fetchDaily(sym),
    fetchNagaFlow(sym),
    fetchQuarterly(sym),
  ]);
  const score = scoreCcnn(valuation, daily as Record<string, unknown>, flow, quarterly);
  const hit = lookupTicker(sym);
  return {
    symbol: sym,
    groupId: hit?.group.id ?? "lain",
    groupName: hit?.group.name ?? "Di luar katalog",
    name: score.metrics.company_name ?? hit?.ticker.name ?? sym,
    score,
  };
}

async function mapPool<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = [];
  for (let i = 0; i < items.length; i += limit) {
    const chunk = items.slice(i, i + limit);
    out.push(...(await Promise.all(chunk.map(fn))));
  }
  return out;
}

function extractTickers(text: string): string[] {
  const known = new Set(CONGLOMERATES.flatMap((g) => g.tickers.map((t) => t.symbol)));
  const found: string[] = [];
  const re = /\b([A-Za-z]{4})\b/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const tok = m[1]!.toUpperCase();
    if (["CEK", "SAMA", "DARI", "YANG", "INI", "ATAU", "SCAN", "GRUP"].includes(tok)) continue;
    if (!found.includes(tok)) found.push(tok);
  }
  const prefer = found.filter((t) => known.has(t));
  return (prefer.length ? prefer : found).slice(0, 5);
}

function extractGroup(text: string) {
  const lower = text.toLowerCase();
  return CONGLOMERATES.find(
    (g) =>
      lower.includes(g.name.toLowerCase()) ||
      lower.includes(g.id) ||
      g.family.toLowerCase().split(" ").some((w) => w.length > 4 && lower.includes(w.toLowerCase())),
  );
}

async function narrate(userText: string, cards: TickerCard[]): Promise<string | null> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey || cards.length === 0) return null;
  const compact = cards.map((c) => ({
    symbol: c.symbol,
    group: c.groupName,
    status: c.score.status,
    score: c.score.score,
    reasons: c.score.reasons,
  }));
  try {
    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "grok-4.5",
        max_tokens: 420,
        temperature: 0.3,
        messages: [
          {
            role: "system",
            content:
              "Kamu agent Cacing Cacing Naga Naga. Jangan ubah status/skor. Jangan suruh beli atau jual. Bahasa Indonesia santai, singkat. Bandingkan nama-nama dalam grup konglomerasi kalau ada lebih dari satu. Tambah 1 kalimat hal yang belum bisa disimpulkan.",
          },
          { role: "user", content: `Pertanyaan: ${userText}\n\nHasil mesin:\n${JSON.stringify(compact)}` },
        ],
      }),
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    return body.choices?.[0]?.message?.content ?? null;
  } catch {
    return null;
  }
}

export const analyzeQuery = createServerFn({ method: "POST" })
  .validator((input: { text?: string; groupId?: string; symbol?: string }) => input)
  .handler(async ({ data }): Promise<AnalyzeResult> => {
    if (!sectorsKey()) {
      return {
        ok: false,
        missingKey: true,
        error: "Set SECTORS_API_KEY di environment (Vercel) untuk menarik data IHSG.",
      };
    }
    let symbols: string[] = [];
    if (data.symbol) {
      symbols = [normSymbol(data.symbol)];
    } else if (data.groupId) {
      const g = findGroup(data.groupId);
      if (!g) return { ok: false, missingKey: false, error: "Grup konglomerasi tidak ketemu." };
      symbols = g.tickers.map((t) => t.symbol);
    } else if (data.text) {
      const g = extractGroup(data.text);
      const tickers = extractTickers(data.text);
      if (g && tickers.length === 0) symbols = g.tickers.map((t) => t.symbol);
      else if (tickers.length) symbols = tickers;
      else if (g) symbols = g.tickers.map((t) => t.symbol);
    }
    if (symbols.length === 0) {
      return {
        ok: false,
        missingKey: false,
        error: "Pilih konglomerasi, atau ketik ticker (contoh: cek INDF / scan Salim).",
      };
    }
    try {
      const cards = await mapPool(symbols, 3, analyzeOne);
      const narrative = data.text ? await narrate(data.text, cards) : null;
      return { ok: true, cards, narrative, missingKey: false };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal analisis";
      return { ok: false, missingKey: false, error: msg };
    }
  });

export const listGroups = createServerFn({ method: "GET" }).handler(async () => {
  return { groups: CONGLOMERATES, defaultId: "salim", hasSectorsKey: Boolean(sectorsKey()) };
});
