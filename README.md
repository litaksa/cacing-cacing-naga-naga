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

1. Root repo harus berisi `package.json`, `vite.config.ts`, `src/`, `scripts/`.
2. Import project di Vercel. Build: `npm run build`.
3. Environment variables:
   - `SECTORS_API_KEY` — wajib
   - `XAI_API_KEY` — opsional
4. Jangan commit `.env`.

## Pakai

Pilih grup (Salim, Astra, Sinar Mas, Barito, …) lalu **Scan grup**, atau ketik `cek INDF` / `scan Sinar Mas`.

## Track 1 Sectors Hackathon

Custom tool pipeline + rumus skor + UI sendiri. Data inti Sectors REST API.
