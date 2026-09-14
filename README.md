# Cacing Cacing Naga Naga

Agent alert FOMO / distribusi saham IDX, dikelompokkan per **konglomerasi**.

Bukan rekomendasi beli/jual. Status `NAGA KELUAR` / `CACING MASUK` / `NETRAL` dihitung di kode (`src/lib/score.ts`), bukan di prompt.

## Jalankan lokal

```bash
npm install
export SECTORS_API_KEY=isi_key_sectors
npm run dev
```

Opsional: `XAI_API_KEY` untuk narasi chat (kalau tidak ada, kartu skor tetap jalan).

## Deploy Vercel

1. Push repo ini ke GitHub.
2. Import project di Vercel (framework: Vite / Nitro Vercel preset sudah di `vite.config.ts`).
3. Environment variables:
   - `SECTORS_API_KEY` — wajib, dari halaman API Sectors (kredit hackathon, jangan paket Insider berbayar).
   - `XAI_API_KEY` — opsional.
4. Jangan commit key.

## Pakai

Pilih grup (Salim, Astra, Sinar Mas, Barito, …) lalu **Scan grup**, atau ketik `cek INDF` / `scan Sinar Mas`.

## Track 1 Sectors Hackathon

Custom tool pipeline + rumus skor + UI sendiri. Data inti Sectors REST API.
