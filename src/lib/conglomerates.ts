export type ConglomerateTicker = {
  symbol: string;
  name: string;
};

export type Conglomerate = {
  id: string;
  name: string;
  family: string;
  sector: string;
  tickers: ConglomerateTicker[];
};

export const CONGLOMERATES: Conglomerate[] = [
  {
    id: "salim",
    name: "Salim",
    family: "Anthony Salim",
    sector: "Konsumer & agribisnis",
    tickers: [
      { symbol: "INDF", name: "Indofood Sukses Makmur" },
      { symbol: "ICBP", name: "Indofood CBP" },
      { symbol: "SIMP", name: "Salim Ivomas Pratama" },
      { symbol: "LSIP", name: "PP London Sumatra" },
    ],
  },
  {
    id: "astra",
    name: "Astra",
    family: "Jardine Cycle & Carriage",
    sector: "Otomotif, alat berat, agribisnis",
    tickers: [
      { symbol: "ASII", name: "Astra International" },
      { symbol: "UNTR", name: "United Tractors" },
      { symbol: "AUTO", name: "Astra Otoparts" },
      { symbol: "AALI", name: "Astra Agro Lestari" },
    ],
  },
  {
    id: "sinarmas",
    name: "Sinar Mas",
    family: "Keluarga Widjaja",
    sector: "Agribisnis, properti, energi",
    tickers: [
      { symbol: "SMAR", name: "SMART" },
      { symbol: "BSDE", name: "Bumi Serpong Damai" },
      { symbol: "DMAS", name: "Puradelta Lestari" },
      { symbol: "DSSA", name: "Dian Swastatika" },
      { symbol: "GEMS", name: "Golden Energy Mines" },
    ],
  },
  {
    id: "barito",
    name: "Barito Pacific",
    family: "Prajogo Pangestu",
    sector: "Petrokimia & energi terbarukan",
    tickers: [
      { symbol: "BRPT", name: "Barito Pacific" },
      { symbol: "TPIA", name: "Chandra Asri Pacific" },
      { symbol: "BREN", name: "Barito Renewables" },
    ],
  },
  {
    id: "saratoga",
    name: "Saratoga",
    family: "Edwin Soeryadjaya",
    sector: "Holding, tambang, menara",
    tickers: [
      { symbol: "SRTG", name: "Saratoga Investama" },
      { symbol: "ADRO", name: "Alamtri Resources / Adaro" },
      { symbol: "TBIG", name: "Tower Bersama" },
      { symbol: "MDKA", name: "Merdeka Copper Gold" },
    ],
  },
  {
    id: "lippo",
    name: "Lippo",
    family: "Mochtar Riady",
    sector: "Properti, rumah sakit, media",
    tickers: [
      { symbol: "LPKR", name: "Lippo Karawaci" },
      { symbol: "SILO", name: "Siloam International" },
      { symbol: "BMTR", name: "Global Mediacom" },
      { symbol: "LPPF", name: "Matahari Department Store" },
    ],
  },
  {
    id: "emtek",
    name: "Emtek",
    family: "Keluarga Sariaatmadja",
    sector: "Media & digital",
    tickers: [
      { symbol: "EMTK", name: "Elang Mahkota Teknologi" },
      { symbol: "SCMA", name: "Surya Citra Media" },
    ],
  },
  {
    id: "mnc",
    name: "MNC",
    family: "Hary Tanoesoedibjo",
    sector: "Media & holding",
    tickers: [
      { symbol: "BHIT", name: "MNC Asia Holding" },
      { symbol: "MNCN", name: "Media Nusantara Citra" },
      { symbol: "MSIN", name: "MNC Digital Entertainment" },
    ],
  },
  {
    id: "bakrie",
    name: "Bakrie",
    family: "Keluarga Bakrie",
    sector: "Tambang & energi",
    tickers: [
      { symbol: "BNBR", name: "Bakrie & Brothers" },
      { symbol: "BUMI", name: "Bumi Resources" },
      { symbol: "ELSA", name: "Elnusa" },
    ],
  },
  {
    id: "ciputra",
    name: "Ciputra",
    family: "Keluarga Ciputra",
    sector: "Properti",
    tickers: [{ symbol: "CTRA", name: "Ciputra Development" }],
  },
  {
    id: "pakuwon",
    name: "Pakuwon",
    family: "Alexander Tedja",
    sector: "Mall & properti",
    tickers: [{ symbol: "PWON", name: "Pakuwon Jati" }],
  },
  {
    id: "summarecon",
    name: "Summarecon",
    family: "Keluarga Tan",
    sector: "Properti",
    tickers: [{ symbol: "SMRA", name: "Summarecon Agung" }],
  },
  {
    id: "kalbe",
    name: "Kalbe",
    family: "Keluarga Boenjamin",
    sector: "Farmasi",
    tickers: [{ symbol: "KLBF", name: "Kalbe Farma" }],
  },
  {
    id: "gudanggaram",
    name: "Gudang Garam",
    family: "Wonowidjojo",
    sector: "Rokok",
    tickers: [{ symbol: "GGRM", name: "Gudang Garam" }],
  },
  {
    id: "indika",
    name: "Indika",
    family: "Keluarga Indika / Agus Lasmana",
    sector: "Energi & nikel",
    tickers: [
      { symbol: "INDY", name: "Indika Energy" },
      { symbol: "MBMA", name: "Merdeka Battery Materials" },
    ],
  },
  {
    id: "medco",
    name: "Medco",
    family: "Arifin Panigoro",
    sector: "Migas",
    tickers: [{ symbol: "MEDC", name: "Medco Energi" }],
  },
  {
    id: "panin",
    name: "Panin",
    family: "Mu'min Ali Gunawan",
    sector: "Keuangan",
    tickers: [
      { symbol: "PNBN", name: "Bank Panin" },
      { symbol: "PNIN", name: "Paninvest" },
    ],
  },
  {
    id: "djarum",
    name: "Djarum",
    family: "Hartono",
    sector: "Bank, rokok, data center",
    tickers: [
      { symbol: "BBCA", name: "Bank Central Asia" },
      { symbol: "HMSP", name: "HM Sampoerna" },
      { symbol: "DNET", name: "Indoritel" },
    ],
  },
];

export const DEFAULT_GROUP_ID = "salim";

const TICKER_INDEX = new Map<string, { group: Conglomerate; ticker: ConglomerateTicker }>();
for (const group of CONGLOMERATES) {
  for (const ticker of group.tickers) {
    TICKER_INDEX.set(ticker.symbol, { group, ticker });
  }
}

export function findGroup(idOrName: string): Conglomerate | undefined {
  const q = idOrName.trim().toLowerCase();
  return CONGLOMERATES.find(
    (g) => g.id === q || g.name.toLowerCase() === q || g.family.toLowerCase().includes(q),
  );
}

export function lookupTicker(symbol: string) {
  return TICKER_INDEX.get(symbol.replace(".JK", "").toUpperCase());
}

export function allSymbols(): string[] {
  return CONGLOMERATES.flatMap((g) => g.tickers.map((t) => t.symbol));
}
