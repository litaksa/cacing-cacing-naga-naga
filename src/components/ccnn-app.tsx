import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  LoaderCircle,
  ScanSearch,
  Send,
  TriangleAlert,
} from "lucide-react";
import { analyzeQuery, listGroups, type TickerCard } from "@/lib/ccnn";
import { CONGLOMERATES, DEFAULT_GROUP_ID, type Conglomerate } from "@/lib/conglomerates";
import { cn } from "@/lib/utils";
import type { CcnnStatus } from "@/lib/score";

function statusTone(status: CcnnStatus) {
  if (status === "NAGA KELUAR") return "text-naga border-naga/40 bg-naga/10";
  if (status === "CACING MASUK") return "text-cacing border-cacing/40 bg-cacing/10";
  return "text-netral border-netral/40 bg-netral/10";
}

function mascotFor(status: CcnnStatus) {
  if (status === "NAGA KELUAR") return { src: "/mascot-naga.jpg", alt: "Naga", motion: "bob" };
  if (status === "CACING MASUK") return { src: "/mascot-cacing.jpg", alt: "Cacing", motion: "wiggle" };
  return { src: "/mascot-cacing.jpg", alt: "Netral", motion: "" };
}

function Card({ card, delay }: { card: TickerCard; delay: number }) {
  const s = card.score;
  const mascot = mascotFor(s.status);
  return (
    <article
      className="card-enter relative overflow-hidden rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)]"
      style={{ animationDelay: `${delay}ms` }}
    >
      <img
        src={mascot.src}
        alt=""
        className={cn(
          "pointer-events-none absolute -right-6 -bottom-8 size-36 rounded-full object-cover opacity-35",
          mascot.motion,
        )}
        crossOrigin="anonymous"
      />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-2xl tracking-tight text-fg">{card.symbol}</p>
          <p className="mt-0.5 text-sm text-muted">{card.name}</p>
          <p className="text-xs text-faint">{card.groupName}</p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide",
            statusTone(s.status),
          )}
        >
          {s.status}
        </span>
      </div>
      <p className="relative mt-4 font-display text-4xl tabular-nums leading-none text-fg">
        {s.score}
        <span className="ml-1 text-base text-faint">/100</span>
      </p>
      <div className="relative mt-3 grid grid-cols-4 gap-1 text-center text-[10px] uppercase tracking-wider text-faint">
        <div>
          <p className="tabular-nums text-sm text-fg">{s.breakdown.fundamental}</p>
          Fund
        </div>
        <div>
          <p className="tabular-nums text-sm text-fg">{s.breakdown.volume_tren}</p>
          Vol
        </div>
        <div>
          <p className="tabular-nums text-sm text-fg">{s.breakdown.naga}</p>
          Naga
        </div>
        <div>
          <p className="tabular-nums text-sm text-fg">{s.breakdown.bisnis}</p>
          Bisnis
        </div>
      </div>
      <ul className="relative mt-4 space-y-1.5 text-sm text-muted">
        {(s.reasons.length ? s.reasons : ["Data belum cukup."]).map((r) => (
          <li key={r} className="leading-snug">
            {r}
          </li>
        ))}
      </ul>
    </article>
  );
}

function WormLine() {
  return (
    <svg className="mt-3 h-8 w-full max-w-sm text-crimson" viewBox="0 0 280 32" fill="none" aria-hidden>
      <path
        className="worm-path"
        d="M4 22 C 28 4, 48 28, 72 16 S 112 4, 140 18 S 188 30, 220 12 S 256 8, 276 20"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="272" cy="20" r="3.5" fill="currentColor" />
    </svg>
  );
}

export function CcnnApp() {
  const catalog = useQuery({
    queryKey: ["groups"],
    queryFn: () => listGroups(),
  });

  const groups = catalog.data?.groups ?? CONGLOMERATES;
  const [groupId, setGroupId] = useState(DEFAULT_GROUP_ID);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [missingKey, setMissingKey] = useState(false);
  const [cards, setCards] = useState<TickerCard[]>([]);
  const [narrative, setNarrative] = useState<string | null>(null);

  const group: Conglomerate | undefined = useMemo(
    () => groups.find((g) => g.id === groupId) ?? groups[0],
    [groups, groupId],
  );

  async function run(payload: { text?: string; groupId?: string; symbol?: string }) {
    setBusy(true);
    setError(null);
    try {
      const res = await analyzeQuery({ data: payload });
      if (!res.ok) {
        setMissingKey(res.missingKey);
        setError(res.error);
        return;
      }
      setMissingKey(false);
      setCards(res.cards);
      setNarrative(res.narrative);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <header className="hero-fade relative overflow-hidden border-b border-line">
        <img
          src="/mascot-pair.jpg"
          alt="Karikatur cacing menunggang naga"
          className="pointer-events-none absolute inset-0 size-full object-cover object-[72%_68%]"
          crossOrigin="anonymous"
        />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(244,236,228,0.88)_0%,rgba(244,236,228,0.35)_42%,transparent_70%)]" />
        <div className="relative flex min-h-[280px] items-end justify-between gap-4 px-4 py-7 sm:min-h-[340px] sm:px-8 sm:py-10">
          <div className="max-w-xl rounded-3xl bg-paper/80 p-5 shadow-[var(--shadow-border)] backdrop-blur-[2px] sm:p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-crimson">
              IHSG · konglomerasi
            </p>
            <h1 className="mt-2 font-display text-4xl italic leading-[0.92] text-ink sm:text-6xl">
              Cacing Cacing
              <br />
              Naga Naga
            </h1>
            <WormLine />
            <p className="mt-3 max-w-md text-sm text-muted">
              Alert FOMO per nama grup. PE/PBV, volume, foreign flow, jejak naga. Bukan sinyal jual.
            </p>
            <div className="mt-4 flex sm:hidden">
              <img
                src="/mascot-cacing.jpg"
                alt="Karikatur cacing"
                className="wiggle size-16 rounded-full object-cover outline outline-2 outline-bg"
                crossOrigin="anonymous"
              />
              <img
                src="/mascot-naga.jpg"
                alt="Karikatur naga"
                className="bob -ml-4 size-16 rounded-full object-cover outline outline-2 outline-bg"
                crossOrigin="anonymous"
              />
            </div>
          </div>
          <div className="hidden shrink-0 sm:flex">
            <img
              src="/mascot-cacing.jpg"
              alt="Karikatur cacing"
              className="wiggle relative z-10 size-28 rounded-full object-cover shadow-[var(--shadow-border)] outline outline-2 outline-bg sm:size-32"
              crossOrigin="anonymous"
            />
            <img
              src="/mascot-naga.jpg"
              alt="Karikatur naga"
              className="bob -ml-8 size-28 rounded-full object-cover shadow-[var(--shadow-border)] outline outline-2 outline-bg sm:size-32"
              crossOrigin="anonymous"
            />
          </div>
        </div>
      </header>

      {missingKey || catalog.data?.hasSectorsKey === false ? (
        <div className="mx-4 mt-4 flex gap-3 rounded-2xl border border-cacing/30 bg-cacing/10 px-4 py-3 text-sm text-fg sm:mx-8">
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-cacing" />
          <p>
            Data Sectors belum nyambung. Di Vercel, tambah env <span className="font-semibold">SECTORS_API_KEY</span>{" "}
            lalu redeploy.
          </p>
        </div>
      ) : null}

      <div className="grid gap-0 lg:grid-cols-[280px_1fr]">
        <aside className="border-b border-line lg:border-b-0 lg:border-r">
          <p className="px-4 pt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-faint sm:px-5">
            Konglomerasi
          </p>
          <div className="flex gap-2 overflow-x-auto px-4 py-3 lg:flex-col lg:overflow-visible sm:px-5">
            {groups.map((g) => {
              const active = g.id === group?.id;
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => {
                    setGroupId(g.id);
                    setCards([]);
                    setNarrative(null);
                    setError(null);
                  }}
                  className={cn(
                    "min-h-11 shrink-0 rounded-xl px-3 py-2 text-left transition-[background,transform] duration-150 ease-out active:scale-[0.96]",
                    active ? "bg-crimson text-paper" : "text-muted hover:bg-surface",
                  )}
                >
                  <span className="block text-sm font-semibold">{g.name}</span>
                  <span className="hidden text-xs opacity-80 lg:block">{g.family}</span>
                </button>
              );
            })}
          </div>
        </aside>

        <main className="min-w-0 px-4 py-6 sm:px-8">
          {group ? (
            <section>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="font-display text-3xl italic">{group.name}</h2>
                  <p className="mt-1 text-sm text-muted">
                    {group.family} · {group.sector}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => run({ groupId: group.id })}
                  className="glow-pulse inline-flex min-h-11 items-center gap-2 rounded-full bg-crimson px-4 text-sm font-semibold text-paper transition-transform duration-150 ease-out active:scale-[0.96] disabled:opacity-60"
                >
                  {busy ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : (
                    <ScanSearch className="size-4" />
                  )}
                  Scan grup {group.name}
                </button>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {group.tickers.map((t) => (
                  <button
                    key={t.symbol}
                    type="button"
                    disabled={busy}
                    onClick={() => run({ symbol: t.symbol })}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-surface px-3 text-sm transition-transform duration-150 ease-out hover:border-cacing active:scale-[0.96]"
                  >
                    <span className="font-semibold">{t.symbol}</span>
                    <span className="hidden text-muted sm:inline">{t.name}</span>
                    <ArrowRight className="size-3.5 text-faint" />
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          {error ? (
            <p className="mt-6 rounded-2xl border border-naga/30 bg-naga/10 px-4 py-3 text-sm text-fg">
              {error}
            </p>
          ) : null}

          {narrative ? (
            <p className="mt-6 max-w-2xl font-display text-xl italic leading-snug text-fg">{narrative}</p>
          ) : null}

          {cards.length > 0 ? (
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {cards
                .slice()
                .sort((a, b) => b.score.score - a.score.score)
                .map((c, i) => (
                  <Card key={c.symbol} card={c} delay={i * 90} />
                ))}
            </div>
          ) : (
            <div className="mt-10 flex max-w-md items-start gap-3 text-sm text-muted">
              <p>
                Pilih grup di kiri, lalu scan. Atau ketik ticker di bawah. Salim, Astra, Sinar Mas, Barito —
                bukan default bank biru.
              </p>
            </div>
          )}

          <form
            className="sticky bottom-4 mt-10 flex max-w-full gap-2 rounded-full bg-raised p-1.5 shadow-[var(--shadow-border)]"
            onSubmit={(e) => {
              e.preventDefault();
              const text = draft.trim();
              if (!text) return;
              setDraft("");
              void run({ text });
            }}
          >
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="cek INDF · scan Sinar Mas · bandingkan BRPT vs TPIA"
              className="min-h-11 min-w-0 flex-1 bg-transparent px-4 text-sm text-fg outline-none placeholder:text-faint"
            />
            <button
              type="submit"
              disabled={busy || !draft.trim()}
              className="inline-flex size-11 items-center justify-center rounded-full bg-crimson text-paper transition-transform duration-150 ease-out active:scale-[0.96] disabled:opacity-40"
              aria-label="Kirim"
            >
              <Send className="size-4" />
            </button>
          </form>
          <p className="mt-3 pb-8 text-center text-[11px] text-faint">
            Bukan rekomendasi investasi. Status dihitung di mesin skor, bukan diobrolin model.
          </p>
        </main>
      </div>
    </div>
  );
}
