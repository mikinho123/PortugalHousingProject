/* Obras em Portugal / Building works in Portugal — map + detail panel.
   Data: data/ine.json (INE, all municipalities), data/municipal.json (partial council data),
         data/parishes/<dtmn>.json (INE by parish), data/municipios.topo.json (CAOP2025). */
(() => {
  "use strict";

  // ------------------------------------------------------------ i18n
  const I18N = {
    pt: {
      title: "Obras em Portugal",
      subtitle: "Construção nova e renovação licenciadas e concluídas, por concelho e distrito, 2002–2025",
      metaDesc: "Licenciamento e conclusão de obras de construção e renovação por concelho e distrito, com população, parque habitacional e dados municipais de pedidos, decisões e alterações de utilização.",
      year: "Ano", mapMetric: "Indicador no mapa", units: "Unidades", search: "Procurar concelho", searchPh: "ex.: Matosinhos",
      levelMun: "Concelhos", levelDist: "Distritos", levelAria: "Nível geográfico", filtersAria: "Filtros",
      light: "Claro", dark: "Escuro", themeAria: "Tema", langAria: "Idioma",
      unitAbs: "Valores absolutos", unitPop: "Por 1.000 habitantes", unitDw: "Por 1.000 alojamentos", unitBld: "Por 1.000 edifícios de habitação",
      sufPop: "por 1.000 hab.", sufDw: "por 1.000 alojamentos", sufBld: "por 1.000 edif. habitação",
      mapAria: "Mapa de Portugal", byMun: "por concelho", byDist: "por distrito / região autónoma",
      noData: "sem dados", ringNote: "Concelhos com dados municipais (pedidos entrados, decisões ou alterações de utilização). Clique num território para ver o detalhe; clique de novo para voltar a Portugal.",
      kindCountry: "País", kindMun: "Concelho · distrito de {d}", kindDist: "Distrito / região autónoma", back: "← Portugal",
      m_lic_total: "Edifícios licenciados (total)", m_lic_new: "Licenciados — construção nova",
      m_lic_ren: "Licenciados — renovação (ampliação, alteração, reconstrução)", m_ren_share: "Peso da renovação no licenciamento (%)",
      m_lic_ren_oth: "Renovações licenciadas para usos não habitacionais", m_lic_dem: "Demolições licenciadas",
      m_comp_total: "Edifícios concluídos (total, desde 2011)", m_dw_total: "Fogos licenciados em construção nova",
      m_pop: "População residente", m_pop_change: "Variação da população face ao ano anterior (%)",
      m_stock_dw: "Alojamentos familiares (parque habitacional)", m_stock_bld: "Edifícios de habitação (parque habitacional)",
      m_dw_per_1000: "Alojamentos por 1.000 habitantes",
      tLicensed: "Edifícios licenciados em {y}", vsPrev: "vs {y}", tRenShare: "Peso da renovação", tRenShareSub: "ampliação, alteração e reconstrução",
      tCompleted: "Edifícios concluídos em {y}", seriesFrom2011: "série começa em 2011", tDwell: "Fogos licenciados (construção nova)", tDwellSub: "habitação familiar",
      tPop: "População residente, {y}", tStock: "Alojamentos (parque), {y}", stockCarried: "parque de {y} (último disponível)",
      perPop: "{v} por 1.000 habitantes",
      newB: "Construção nova", enl: "Ampliação", alt: "Alteração", rec: "Reconstrução", total: "Total", yearCol: "Ano",
      table: "Tabela", chart: "Gráfico",
      cTypes: "Edifícios licenciados por tipo de obra", cTypesD: "Número de edifícios com licença ou comunicação prévia admitida, por ano.",
      cLC: "Licenciado vs. concluído", cLCD: "Edifícios (construção nova + renovação). As conclusões chegam tipicamente 2–3 anos depois do licenciamento.",
      licensed: "Licenciados", completed: "Concluídos", licensedS: "licenciados", completedS: "concluídos",
      cLCNote: "INE: conclusões de 2024–2025 são estimativas; dados preliminares a partir de 2021.",
      cUse: "Para que uso se renova?", cUseD: "Edifícios licenciados em ampliação, alteração ou reconstrução, pelo destino final da obra.",
      renHab: "Renovação — habitação familiar", renOth: "Renovação — outros usos", newOth: "Construção nova — outros usos",
      renHabS: "habitação", renOthS: "outros usos", newOthS: "nova, outros",
      cUseNote: "O INE publica o destino depois da obra, não o anterior — por isso estes números não medem mudanças de uso. As mudanças de uso propriamente ditas só existem nos dados municipais (abaixo).",
      cDw: "Fogos licenciados em construção nova, por tipologia", cDwD: "Habitações (não edifícios) em construções novas para habitação familiar.", t4: "T4 ou mais",
      cPop: "População residente", cPopD: "Estimativas anuais do INE a 31 de dezembro.",
      cPopNote: "Quebra de série em 2021: os anos 2021+ seguem as estimativas revistas com base nos Censos 2021 (que captam melhor a imigração recente); 2002–2020 vêm de séries anteriores.",
      cStock: "Parque habitacional", cStockD: "Alojamentos familiares clássicos e edifícios de habitação familiar clássica existentes.",
      dwellings: "Alojamentos", resBuildings: "Edifícios de habitação", dwellingsS: "alojamentos", resBuildingsS: "edifícios",
      cStockNote: "O INE publica o parque até {y}; para anos posteriores usa-se o valor de {y} nas taxas. Quebra de série em 2022 (nova base, Censos 2021).",
      normNote: "Valores por 1.000 {u} do mesmo ano.", normNoteCarry: " Para {ys} usa-se o parque de {y}.",
      uPop: "habitantes", uDw: "alojamentos", uBld: "edifícios de habitação",
      councilTitle: "Pedidos, decisões e mudanças de uso",
      councilNone: "Não existem dados nacionais sobre pedidos entrados, indeferimentos ou alterações de utilização. Alguns municípios publicam os seus processos em dados abertos — escolha um para ver o detalhe:",
      tagApps: "pedidos entrados", tagOutcomes: "decisões", tagCou: "mudanças de uso",
      councilHead: "Dados municipais", councilHeadD: "Contagens de processos (não de edifícios), a partir dos dados abertos de gestão urbanística da câmara. Valores absolutos. Não são diretamente comparáveis com os números do INE acima.",
      cApps: "Pedidos de obras entrados na câmara", cAppsD: "Processos de obras de edificação entrados, por ano.", provisional: "provisório",
      appsNew: "Construção nova", appsAlt: "Alteração / ampliação", appsUnc: "Não classificado", pip: "Informação prévia (PIP)",
      cAppsNote: "Fonte: flatin.pt, a partir da camada municipal. Pedidos de informação prévia (PIP) não incluídos no gráfico.",
      cOut: "O que aconteceu aos pedidos", cOutD: "Estado atual dos processos de obras, por ano de entrada. {a}–{b}: {ap} aprovados e {rj} rejeitados",
      cOutRate: " — {r}% de rejeição entre os decididos.", entryYear: "Ano de entrada", source: "Fonte", fetched: "obtido",
      o_aprovado: "Aprovado / título emitido", o_rejeitado: "Rejeitado / indeferido", o_pendente: "Em apreciação",
      o_desistido: "Desistência / caducidade / arquivo", o_desconhecido: "Sem estado",
      cCou: "Mudanças de uso: para que uso?", cCouD: "Pedidos de alteração de utilização {a}–{b}, pelo novo uso pretendido. Total: {n}.",
      restUses: "Restantes {n} usos", newUse: "Novo uso", applications: "Pedidos",
      cCouY: "Mudanças de uso por ano", cCouYD: "Pedidos de alteração de utilização entrados, por ano e estado atual.",
      parishT: "Por freguesia, {y}", parishD: "Edifícios licenciados (INE), valores absolutos. As freguesias seguem a divisão em vigor em cada ano (agregação de 2013, reposição de 2025).",
      parishNone: "Sem dados por freguesia para este ano.", parish: "Freguesia",
      pNewHab: "Nova — habitação", pNewOth: "Nova — outros", pRenHab: "Renovação — habitação", pRenOth: "Renovação — outros",
      sourcesT: "Fontes e notas", updated: "atualizado", flatinSrc: " — processos de obras entrados nas câmaras (cobertura parcial).",
      caop: "Limites administrativos: CAOP2025, Direção-Geral do Território.",
      notes: "Notas: “renovação” = ampliação + alteração + reconstrução. Valores do INE contam edifícios; dados municipais contam processos. Os indeferimentos e as mudanças de uso não são publicados a nível nacional. Taxas por habitante usam a população residente a 31 de dezembro; taxas por alojamento/edifício usam o parque habitacional do mesmo ano (ou o último disponível).",
      district: "Distrito", councilData: "Dados municipais", yes: "sim", loadErr: "Erro a carregar os dados: ",
      licence: "Dados: INE, DGT (CAOP2025) e flatin.pt, sob licença CC BY 4.0 — agregados, recombinados e simplificados por este projeto. Dados municipais: câmaras municipais de Matosinhos, Paredes e Lousã (contagens agregadas; nenhum dado pessoal é usado).",
      caveatLabel: "Dados incompletos", caveatTip: "dados incompletos neste ano", caveatSrc: "Nota do INE nos indicadores",
      caveatDist: "Este total inclui {m}; ",
    },
    en: {
      title: "Building works in Portugal",
      subtitle: "New construction and renovation licensed and completed, by municipality and district, 2002–2025",
      metaDesc: "Building permits and completions for new construction and renovation by municipality and district, with population, housing stock and council data on applications, decisions and changes of use.",
      year: "Year", mapMetric: "Map indicator", units: "Units", search: "Find a municipality", searchPh: "e.g. Matosinhos",
      levelMun: "Municipalities", levelDist: "Districts", levelAria: "Geographic level", filtersAria: "Filters",
      light: "Light", dark: "Dark", themeAria: "Theme", langAria: "Language",
      unitAbs: "Absolute numbers", unitPop: "Per 1,000 residents", unitDw: "Per 1,000 dwellings", unitBld: "Per 1,000 residential buildings",
      sufPop: "per 1,000 residents", sufDw: "per 1,000 dwellings", sufBld: "per 1,000 res. buildings",
      mapAria: "Map of Portugal", byMun: "by municipality", byDist: "by district / autonomous region",
      noData: "no data", ringNote: "Municipalities with council data (applications, decisions or changes of use). Click an area to see details; click again to go back to Portugal.",
      kindCountry: "Country", kindMun: "Municipality · {d} district", kindDist: "District / autonomous region", back: "← Portugal",
      m_lic_total: "Licensed buildings (total)", m_lic_new: "Licensed — new construction",
      m_lic_ren: "Licensed — renovation (enlargement, alteration, reconstruction)", m_ren_share: "Renovation share of licensing (%)",
      m_lic_ren_oth: "Renovations licensed for non-residential use", m_lic_dem: "Demolitions licensed",
      m_comp_total: "Completed buildings (total, from 2011)", m_dw_total: "Dwellings licensed in new construction",
      m_pop: "Resident population", m_pop_change: "Population change vs previous year (%)",
      m_stock_dw: "Dwellings (housing stock)", m_stock_bld: "Residential buildings (housing stock)",
      m_dw_per_1000: "Dwellings per 1,000 residents",
      tLicensed: "Licensed buildings in {y}", vsPrev: "vs {y}", tRenShare: "Renovation share", tRenShareSub: "enlargement, alteration and reconstruction",
      tCompleted: "Completed buildings in {y}", seriesFrom2011: "series starts in 2011", tDwell: "Dwellings licensed (new construction)", tDwellSub: "family housing",
      tPop: "Resident population, {y}", tStock: "Dwellings (stock), {y}", stockCarried: "{y} stock (latest available)",
      perPop: "{v} per 1,000 residents",
      newB: "New construction", enl: "Enlargement", alt: "Alteration", rec: "Reconstruction", total: "Total", yearCol: "Year",
      table: "Table", chart: "Chart",
      cTypes: "Licensed buildings by type of work", cTypesD: "Buildings with a permit or accepted prior notification, per year.",
      cLC: "Licensed vs. completed", cLCD: "Buildings (new construction + renovation). Completions typically follow licensing by 2–3 years.",
      licensed: "Licensed", completed: "Completed", licensedS: "licensed", completedS: "completed",
      cLCNote: "INE: completions for 2024–2025 are estimates; data are preliminary from 2021.",
      cUse: "What is renovated for?", cUseD: "Buildings licensed for enlargement, alteration or reconstruction, by use after the work.",
      renHab: "Renovation — family housing", renOth: "Renovation — other uses", newOth: "New construction — other uses",
      renHabS: "housing", renOthS: "other uses", newOthS: "new, other",
      cUseNote: "INE publishes the use after the work, not before — so these numbers do not measure changes of use. Actual changes of use are only available in council data (below).",
      cDw: "Dwellings licensed in new construction, by size", cDwD: "Dwellings (not buildings) in new construction for family housing. T1 = one bedroom, etc.", t4: "T4 or more",
      cPop: "Resident population", cPopD: "INE annual estimates at 31 December.",
      cPopNote: "Series break in 2021: 2021+ uses the estimates revised on the 2021 Census (which better capture recent immigration); 2002–2020 come from earlier series.",
      cStock: "Housing stock", cStockD: "Existing classic family dwellings and classic family residential buildings.",
      dwellings: "Dwellings", resBuildings: "Residential buildings", dwellingsS: "dwellings", resBuildingsS: "buildings",
      cStockNote: "INE publishes the stock up to {y}; later years use the {y} value in rates. Series break in 2022 (new base, 2021 Census).",
      normNote: "Values per 1,000 {u} in the same year.", normNoteCarry: " {ys} use the {y} stock.",
      uPop: "residents", uDw: "dwellings", uBld: "residential buildings",
      councilTitle: "Applications, decisions and changes of use",
      councilNone: "There is no national data on applications submitted, refusals or changes of use. Some councils publish their planning processes as open data — pick one to see the details:",
      tagApps: "applications", tagOutcomes: "decisions", tagCou: "changes of use",
      councilHead: "Council data", councilHeadD: "Counts of processes (not buildings), from the council's open planning data. Absolute numbers. Not directly comparable with the INE figures above.",
      cApps: "Building applications submitted to the council", cAppsD: "Building-works processes submitted, per year.", provisional: "provisional",
      appsNew: "New construction", appsAlt: "Alteration / enlargement", appsUnc: "Unclassified", pip: "Prior information (PIP)",
      cAppsNote: "Source: flatin.pt, from the council layer. Prior-information requests (PIP) are not included in the chart.",
      cOut: "What happened to applications", cOutD: "Current status of building processes, by year of entry. {a}–{b}: {ap} approved and {rj} rejected",
      cOutRate: " — {r}% rejected among decided ones.", entryYear: "Year of entry", source: "Source", fetched: "retrieved",
      o_aprovado: "Approved / permit issued", o_rejeitado: "Rejected / refused", o_pendente: "Under review",
      o_desistido: "Withdrawn / lapsed / archived", o_desconhecido: "No status",
      cCou: "Changes of use: to what?", cCouD: "Change-of-use applications {a}–{b}, by the new use requested. Total: {n}.",
      restUses: "Remaining {n} uses", newUse: "New use", applications: "Applications",
      cCouY: "Changes of use per year", cCouYD: "Change-of-use applications submitted, by year and current status.",
      parishT: "By parish, {y}", parishD: "Licensed buildings (INE), absolute numbers. Parishes follow the boundaries in force each year (2013 merger, 2025 split).",
      parishNone: "No parish data for this year.", parish: "Parish",
      pNewHab: "New — housing", pNewOth: "New — other", pRenHab: "Renovation — housing", pRenOth: "Renovation — other",
      sourcesT: "Sources and notes", updated: "updated", flatinSrc: " — building applications submitted to councils (partial coverage).",
      caop: "Administrative boundaries: CAOP2025, Direção-Geral do Território.",
      notes: "Notes: “renovation” = enlargement + alteration + reconstruction. INE figures count buildings; council data count processes. Refusals and changes of use are not published nationally. Per-resident rates use the resident population at 31 December; per-dwelling/building rates use the housing stock of the same year (or the latest available).",
      district: "District", councilData: "Council data", yes: "yes", loadErr: "Error loading data: ",
      licence: "Data: INE, DGT (CAOP2025) and flatin.pt, under CC BY 4.0 — aggregated, recombined and simplified by this project. Council data: Matosinhos, Paredes and Lousã municipal councils (aggregated counts; no personal data is used).",
      caveatLabel: "Incomplete data", caveatTip: "incomplete data this year", caveatSrc: "INE footnote on indicators",
      caveatDist: "This total includes {m}; ",
    },
  };
  // Council use categories come from the source in Portuguese; translate the common ones.
  const USE_EN = {
    "Para habitação": "To housing", "Comércio/Serviços": "Commerce/services", "Comércio/Serviços S1": "Commerce/services S1",
    "Comércio/Serviços S2": "Commerce/services S2", "Instalações desportivas": "Sports facilities", "Restauração/Bebidas": "Food & drink",
    "Turismo": "Tourism", "Outros": "Other", "Equipamento": "Facilities", "Indústria": "Industry", "Armazém": "Warehouse",
    "Moradia isolada": "Detached house", "Coletiva até RC+2": "Apartments (≤3 floors)", "Coletiva RC+N": "Apartments (4+ floors)",
    "Coletiva/Comércio RC+N": "Apartments + shops (4+ floors)", "Coletiva/Comércio até RC+2": "Apartments + shops (≤3 floors)",
    "Multifunções RC+N": "Mixed use (4+ floors)", "Multifunções até RC+2": "Mixed use (≤3 floors)", "Habitação Unifamiliar": "Single-family housing",
    "Habitação coletiva": "Multi-family housing", "Comércio": "Commerce", "Serviços": "Services", "Comércio e Serviços": "Commerce and services",
    "Restauração e bebidas": "Food & drink", "Não indicado": "Not stated", "Espaços de Jogos e Recreio": "Play & leisure spaces",
    "Posto de combustível/lavagem": "Fuel/car-wash station",
  };

  const state = { year: null, metric: "lic_total", level: "mun", sel: null, norm: "abs", lang: "pt" };
  const t = (k, vars) => {
    let s = I18N[state.lang][k] ?? I18N.pt[k] ?? k;
    if (vars) for (const [a, b] of Object.entries(vars)) s = s.split(`{${a}}`).join(b);
    return s;
  };
  const useLabel = (u) => (state.lang === "en" ? USE_EN[u] || u : u);
  const loc = () => (state.lang === "en" ? "en-GB" : "pt-PT");
  let fmt, fmtPct, fmtCompact, fmtRate;
  function setFormatters() {
    fmt = new Intl.NumberFormat(loc());
    fmtPct = new Intl.NumberFormat(loc(), { maximumFractionDigits: 0 });
    fmtCompact = new Intl.NumberFormat(loc(), { notation: "compact", maximumFractionDigits: 1 });
    fmtRate = (v) => new Intl.NumberFormat(loc(), { maximumFractionDigits: Math.abs(v) < 10 ? 2 : Math.abs(v) < 100 ? 1 : 0 }).format(v);
  }

  const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  const $ = (s) => document.querySelector(s);
  const el = (tag, attrs = {}, text) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    if (text != null) n.textContent = text;
    return n;
  };

  // ------------------------------------------------------------ series, units & metrics
  const sum = (...xs) => (xs.every((x) => x == null) ? null : xs.reduce((a, x) => a + (x || 0), 0));
  const UNITS = [
    { id: "abs", label: "unitAbs" },
    { id: "pop", label: "unitPop", denom: "pop", suffix: "sufPop", noun: "uPop" },
    { id: "dw", label: "unitDw", denom: "stock_dw", suffix: "sufDw", noun: "uDw" },
    { id: "bld", label: "unitBld", denom: "stock_bld", suffix: "sufBld", noun: "uBld" },
  ];
  const unit = () => UNITS.find((u) => u.id === state.norm);

  // kind: "count" (can be expressed per 1,000), "pct", "level" (population/stock — always absolute), "rate"
  const METRICS = [
    { id: "lic_total", kind: "count", f: (s, i) => sum(s.lic_new[i], s.lic_enl[i], s.lic_alt[i], s.lic_rec[i]) },
    { id: "lic_new", kind: "count", f: (s, i) => s.lic_new[i] },
    { id: "lic_ren", kind: "count", f: (s, i) => sum(s.lic_enl[i], s.lic_alt[i], s.lic_rec[i]) },
    { id: "ren_share", kind: "pct",
      f: (s, i) => { const r = sum(s.lic_enl[i], s.lic_alt[i], s.lic_rec[i]); const tt = sum(r, s.lic_new[i]); return tt ? (100 * r) / tt : null; } },
    { id: "lic_ren_oth", kind: "count", f: (s, i) => s.lic_ren_oth[i] },
    { id: "lic_dem", kind: "count", f: (s, i) => s.lic_dem[i] },
    { id: "comp_total", kind: "count", f: (s, i) => sum(s.comp_new[i], s.comp_enl[i], s.comp_alt[i], s.comp_rec[i]) },
    { id: "dw_total", kind: "count", f: (s, i) => sum(s.dw_t01[i], s.dw_t2[i], s.dw_t3[i], s.dw_t4[i]) },
    { id: "pop", kind: "level", f: (s, i) => s.pop[i] },
    { id: "pop_change", kind: "pct", diverging: true,
      f: (s, i) => (i > 0 && s.pop[i] != null && s.pop[i - 1] ? (100 * (s.pop[i] - s.pop[i - 1])) / s.pop[i - 1] : null) },
    { id: "stock_dw", kind: "level", f: (s, i) => s.stock_dw[i] },
    { id: "stock_bld", kind: "level", f: (s, i) => s.stock_bld[i] },
    { id: "dw_per_1000", kind: "rate", f: (s, i) => (s.pop[i] ? (1000 * s.stock_dw[i]) / s.pop[i] : null) },
  ];
  const metric = (id = state.metric) => METRICS.find((m) => m.id === id);
  const normalized = (m) => m.kind === "count" && state.norm !== "abs";
  const metricLabel = (m) => t("m_" + m.id) + (normalized(m) ? ` — ${t(unit().suffix)}` : "");

  // Value of a metric for a series bundle at year index i, honouring the units selector.
  function mval(m, s, i) {
    const v = m.f(s, i);
    if (v == null || !normalized(m)) return v;
    const d = s[unit().denom][i];
    return d ? (1000 * v) / d : null;
  }
  // Normalise a whole yearly array (for charts).
  const normArr = (s, arr) => {
    if (state.norm === "abs") return arr;
    const d = s[unit().denom];
    return arr.map((v, i) => (v == null || !d[i] ? null : (1000 * v) / d[i]));
  };
  const fmtFor = (m) => (v) => fvm(v, m);
  function fvm(v, m) {
    if (v == null) return "—";
    if (m.kind === "pct") return (m.diverging && v > 0 ? "+" : "") + (m.diverging ? fmtRate(v) : fmtPct.format(v)) + "%";
    if (m.kind === "rate" || normalized(m)) return fmtRate(v);
    return fmt.format(Math.round(v));
  }
  const countFmt = () => (state.norm === "abs" ? (v) => fmt.format(Math.round(v)) : fmtRate);
  const fv = (v) => (v == null ? "—" : fmt.format(Math.round(v)));

  let INE, MUN, TOPO, years, features, distFeatures, districtOf = {};
  const aggCache = new Map();
  function aggregate(codes, cacheKey) {
    if (cacheKey && aggCache.has(cacheKey)) return aggCache.get(cacheKey);
    const out = {};
    for (const k of INE.series) out[k] = years.map((_, i) => sum(...codes.map((c) => INE.municipios[c][k][i])));
    if (cacheKey) aggCache.set(cacheKey, out);
    return out;
  }
  const allCodes = () => Object.keys(INE.municipios);
  const codesOfDistrict = (d) => allCodes().filter((c) => INE.municipios[c].distrito === d);
  const seriesOfDistrict = (d) => aggregate(codesOfDistrict(d), "D:" + d);
  function seriesOf(sel) {
    if (!sel) return aggregate(allCodes(), "PT");
    if (sel.type === "mun") return INE.municipios[sel.id];
    return seriesOfDistrict(sel.id);
  }
  const carriedFrom = () => (state.norm === "dw" ? INE.stock_carried_from.stock_dw : state.norm === "bld" ? INE.stock_carried_from.stock_bld : null);
  // Known data gaps (from INE footnotes) affecting a set of municipality codes.
  function caveatsFor(codes) {
    const set = new Set(codes);
    return (INE.caveats || []).map((c) => ({ ...c, hit: c.dtmn.filter((d) => set.has(d)) })).filter((c) => c.hit.length);
  }
  const selCodes = (sel) => (!sel ? [] : sel.type === "mun" ? [sel.id] : codesOfDistrict(sel.id)); // national total: effect is <2%
  const names = (codes) => codes.map((d) => INE.municipios[d].nome).join(state.lang === "en" ? " and " : " e ");
  function renderCaveats() {
    const host = $("#caveats"); host.replaceChildren();
    for (const c of caveatsFor(selCodes(state.sel))) {
      const box = el("div", { class: "caveat", role: "note" });
      const head = el("div", { class: "caveat-head" });
      head.append(el("span", { class: "caveat-icon", "aria-hidden": "true" }, "!"), el("b", {}, `${t("caveatLabel")} · ${c.from}–${c.to}`));
      const txt = (state.sel.type === "dist" ? t("caveatDist", { m: names(c.hit) }) : "") + c[state.lang].replace("{m}", names(c.hit));
      const p = el("p", {}, txt + " ");
      p.append(el("span", { class: "muted" }, `${t("caveatSrc")} ${c.source.join(", ")}.`));
      box.append(head, p);
      host.append(box);
    }
  }

  function normNote() {
    if (state.norm === "abs") return "";
    let s = t("normNote", { u: t(unit().noun) });
    const cf = carriedFrom();
    if (cf && years[years.length - 1] > cf) s += t("normNoteCarry", { ys: `${cf + 1}–${years[years.length - 1]}`, y: cf });
    return s;
  }

  // ------------------------------------------------------------ tooltip
  const tip = $("#tooltip");
  function showTip(evt, title, rows) {
    tip.replaceChildren();
    tip.append(el("div", { class: "tt-title" }, title));
    for (const r of rows) {
      const row = el("div", { class: "tt-row" });
      const k = el("span", { class: "k" });
      if (r.color) { const i = el("i"); i.style.background = r.color; k.append(i); }
      k.append(document.createTextNode(r.label));
      row.append(k, el("b", {}, r.value));
      tip.append(row);
    }
    tip.hidden = false;
    const pad = 14, w = tip.offsetWidth, h = tip.offsetHeight;
    let x = evt.clientX + pad, y = evt.clientY + pad;
    if (x + w > innerWidth - 8) x = evt.clientX - w - pad;
    if (y + h > innerHeight - 8) y = evt.clientY - h - pad;
    tip.style.left = Math.max(8, x) + "px";
    tip.style.top = Math.max(8, y) + "px";
  }
  const hideTip = () => { tip.hidden = true; };

  // ------------------------------------------------------------ map
  const mapBox = $("#map");
  let mapLayers;
  const SEQ = ["--seq-0", "--seq-1", "--seq-2", "--seq-3", "--seq-4", "--seq-5", "--seq-6"];
  const DIV = ["--div-n3", "--div-n2", "--div-n1", "--div-0", "--div-p1", "--div-p2", "--div-p3"];

  function buildMap() {
    mapBox.replaceChildren();
    const W = 500, H = 625;
    const svg = d3.select(mapBox).append("svg").attr("viewBox", `0 0 ${W} ${H}`).attr("role", "img").attr("aria-label", t("mapAria"));
    const isAz = (c) => c.startsWith("4"), isMa = (c) => c.startsWith("3");
    const groups = [
      { name: "Continente", filter: (c) => !isAz(c) && !isMa(c), box: [200, 10, 290, 605] },
      { name: "Açores", filter: isAz, box: [10, 330, 180, 130] },
      // Selvagens are left out of the frame so Madeira stays legible.
      { name: "Madeira", filter: isMa, box: [30, 480, 150, 110], fit: { type: "MultiPoint", coordinates: [[-17.3, 32.6], [-16.25, 33.12]] } },
    ];
    mapLayers = groups.map((g) => {
      const fs = features.filter((f) => g.filter(f.properties.dtmn));
      const dfs = distFeatures.filter((f) => g.filter(f.properties.anyCode));
      const [x, y, w, h] = g.box;
      const proj = d3.geoMercator().fitExtent([[x + 6, y + 6], [x + w - 6, y + h - 6]], g.fit || { type: "FeatureCollection", features: fs });
      const path = d3.geoPath(proj);
      const layer = svg.append("g");
      if (g.name !== "Continente") {
        const id = "clip-" + g.name.normalize("NFD").replace(/[^a-z]/gi, "");
        svg.append("clipPath").attr("id", id).append("rect").attr("x", x).attr("y", y).attr("width", w).attr("height", h).attr("rx", 6);
        layer.attr("clip-path", `url(#${id})`);
        layer.append("rect").attr("class", "inset-frame").attr("x", x).attr("y", y).attr("width", w).attr("height", h).attr("rx", 6);
        layer.append("text").attr("class", "inset-label").attr("x", x + 8).attr("y", y + 16).text(g.name);
      }
      const munG = layer.append("g"), distG = layer.append("g"), lines = layer.append("g"), rings = layer.append("g");
      munG.selectAll("path").data(fs).join("path").attr("class", "area").attr("d", path).attr("tabindex", 0).attr("aria-label", (f) => f.properties.nome);
      distG.selectAll("path").data(dfs).join("path").attr("class", "area").attr("d", path).attr("tabindex", 0).attr("aria-label", (f) => f.properties.code);
      if (g.name === "Continente") {
        lines.append("path").attr("class", "district-line")
          .attr("d", path(topojson.mesh(TOPO, TOPO.objects.municipios, (a, b) => a !== b && districtOf[a.properties.dtmn] !== districtOf[b.properties.dtmn])));
      }
      rings.selectAll("circle").data(fs.filter((f) => MUN.concelhos[f.properties.dtmn])).join("circle")
        .attr("class", "council").attr("r", 4).attr("cx", (f) => path.centroid(f)[0]).attr("cy", (f) => path.centroid(f)[1]);
      return { munG, distG, rings };
    });
    const bind = (sel, kind) => sel
      .on("pointermove", (e, f) => hoverArea(e, kind, f))
      .on("pointerleave", hideTip)
      .on("click", (e, f) => clickArea(kind, f))
      .on("keydown", (e, f) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); clickArea(kind, f); } })
      .on("focus", function (e, f) { const r = this.getBoundingClientRect(); hoverArea({ clientX: r.right, clientY: r.top }, kind, f); })
      .on("blur", hideTip);
    for (const l of mapLayers) { bind(l.munG.selectAll("path"), "mun"); bind(l.distG.selectAll("path"), "dist"); }
  }

  const featSeries = (kind, f) => (kind === "mun" ? INE.municipios[f.properties.dtmn] : seriesOfDistrict(f.properties.code));

  function hoverArea(e, kind, f) {
    const i = years.indexOf(state.year), m = metric();
    const s = featSeries(kind, f);
    const rows = [{ label: metricLabel(m), value: fvm(mval(m, s, i), m) }];
    if (m.id !== "lic_total") rows.push({ label: metricLabel(metric("lic_total")), value: fvm(mval(metric("lic_total"), s, i), metric("lic_total")) });
    if (m.id !== "pop") rows.push({ label: t("m_pop"), value: fv(s.pop[i]) });
    if (kind === "mun") {
      rows.push({ label: t("district"), value: INE.municipios[f.properties.dtmn].distrito });
      if (MUN.concelhos[f.properties.dtmn]) rows.push({ label: t("councilData"), value: t("yes") });
      if (caveatsFor([f.properties.dtmn]).some((c) => state.year >= c.from && state.year <= c.to)) rows.push({ label: "⚠", value: t("caveatTip") });
    }
    showTip(e, `${kind === "mun" ? f.properties.nome : f.properties.code} · ${state.year}`, rows);
  }

  function clickArea(kind, f) {
    const id = kind === "mun" ? f.properties.dtmn : f.properties.code;
    state.sel = state.sel && state.sel.type === kind && state.sel.id === id ? null : { type: kind, id };
    hideTip();
    renderMapSelection();
    renderDetail();
  }

  function renderMap() {
    const i = years.indexOf(state.year), m = metric(), kind = state.level;
    const feats = kind === "mun" ? features : distFeatures;
    const valOf = (f) => mval(m, featSeries(kind, f), i);
    const vals = feats.map(valOf).filter((v) => v != null).sort(d3.ascending);
    let breaks, colors;
    if (m.diverging) {
      // Symmetric classes around zero: gray midpoint, blue = growth, red = decline.
      const ext = Math.max(0.5, d3.quantile(vals.map(Math.abs).sort(d3.ascending), 0.9) || 1);
      const st = niceStep(ext / 3);
      breaks = [-2.5 * st, -1.5 * st, -0.5 * st, 0.5 * st, 1.5 * st, 2.5 * st].map((b) => +b.toFixed(3));
      colors = DIV.map(css);
    } else {
      breaks = d3.range(1, 6).map((q) => d3.quantile(vals, q / 6));
      breaks = Array.from(new Set(breaks.map((b) => niceRound(b, m)))).filter((b, k, a) => b > (m.kind === "count" && state.norm === "abs" ? 0 : -Infinity) && (k === 0 || b > a[k - 1]));
      colors = SEQ.slice(SEQ.length - breaks.length - 1).map(css);
    }
    const scale = d3.scaleThreshold().domain(breaks).range(colors);
    const fill = (f) => { const v = valOf(f); return v == null ? css("--nodata") : scale(v); };
    for (const l of mapLayers) {
      l.munG.style("display", kind === "mun" ? null : "none");
      l.distG.style("display", kind === "dist" ? null : "none");
      (kind === "mun" ? l.munG : l.distG).selectAll("path").attr("fill", fill);
      l.rings.style("display", kind === "mun" ? null : "none");
    }
    $("#map-title").textContent = metricLabel(m);
    let sub = `${state.year} · ${t(kind === "mun" ? "byMun" : "byDist")}`;
    const cf = carriedFrom();
    if ((normalized(m) && cf && state.year > cf) || (m.id.startsWith("stock") && INE.stock_carried_from[m.id] < state.year) ||
        (m.id === "dw_per_1000" && INE.stock_carried_from.stock_dw < state.year)) {
      sub += " · " + t("stockCarried", { y: INE.stock_carried_from.stock_dw });
    }
    $("#map-sub").textContent = sub;

    // Legend: one swatch per class, threshold values printed at the boundaries between swatches.
    const leg = $("#map-legend");
    leg.replaceChildren();
    const lf = (v) => legendFmt(v, m);
    const bar = el("div", { class: "lg-bar" });
    colors.forEach((c) => { const sw = el("div", { class: "sw" }); sw.style.background = c; bar.append(sw); });
    const ticks = el("div", { class: "lg-ticks" });
    breaks.forEach((b, k) => {
      const tk = el("span", {}, lf(b));
      tk.style.left = `${((k + 1) / colors.length) * 100}%`;
      ticks.append(tk);
    });
    const main = el("div", { class: "lg-main" });
    main.append(bar, ticks);
    const nd = el("div", { class: "lg-nd" });
    const sw = el("div", { class: "sw" }); sw.style.background = css("--nodata");
    nd.append(sw, el("span", {}, t("noData")));
    leg.append(main, nd);
    renderMapSelection();
  }
  function legendFmt(v, m) {
    if (m.kind === "pct") return (m.diverging && v > 0 ? "+" : "") + fmtRate(v) + "%";
    if (m.kind === "rate" || normalized(m)) return fmtRate(v);
    return v >= 10000 ? fmtCompact.format(v) : fmt.format(v);
  }
  function niceStep(v) {
    const p = Math.pow(10, Math.floor(Math.log10(v)));
    const n = v / p;
    return (n < 1.5 ? 1 : n < 3.5 ? 2 : n < 7.5 ? 5 : 10) * p;
  }
  function niceRound(v, m) {
    if (v == null) return v;
    if (m.kind === "pct") return Math.round(v);
    if (Math.abs(v) < 10 && (m.kind !== "count" || state.norm !== "abs")) {
      const p = Math.pow(10, Math.floor(Math.log10(Math.abs(v) || 1)) - 1);
      return Math.round(v / p) * p;
    }
    if (v < 10) return Math.max(1, Math.round(v));
    const p = Math.pow(10, Math.floor(Math.log10(v)) - 1);
    return Math.round(v / p) * p;
  }
  function renderMapSelection() {
    if (!mapLayers) return;
    for (const l of mapLayers) {
      l.munG.selectAll("path").classed("selected", (f) => state.sel?.type === "mun" && state.sel.id === f.properties.dtmn).filter(".selected").raise();
      l.distG.selectAll("path").classed("selected", (f) => state.sel?.type === "dist" && state.sel.id === f.properties.code).filter(".selected").raise();
    }
  }

  // ------------------------------------------------------------ charts
  function chartCard(host, { title, desc, note, legend, draw, table }) {
    host.replaceChildren();
    const head = el("header");
    const tt = el("div");
    tt.append(el("h3", {}, title));
    if (desc) tt.append(el("p", { class: "desc" }, desc));
    const btn = el("button", { class: "ghost small", type: "button", "aria-pressed": "false" }, t("table"));
    head.append(tt, btn);
    host.append(head);
    if (legend && legend.length) {
      const lg = el("div", { class: "legend" });
      for (const s of legend) {
        const sp = el("span"); const i = el("i", s.line ? { class: "line" } : {}); i.style.background = css(s.color);
        sp.append(i, document.createTextNode(s.label)); lg.append(sp);
      }
      host.append(lg);
    }
    const box = el("div", { class: "chart" });
    const tbl = el("div", { class: "table-wrap" }); tbl.hidden = true;
    host.append(box, tbl);
    for (const n of [].concat(note || []).filter(Boolean)) host.append(el("p", { class: "note" }, n));
    btn.addEventListener("click", () => {
      const on = tbl.hidden; tbl.hidden = !on; box.hidden = on; btn.setAttribute("aria-pressed", String(on));
      btn.textContent = on ? t("chart") : t("table");
      if (on && !tbl.firstChild) tbl.append(buildTable(table()));
    });
    let lastW = 0;
    const ro = new ResizeObserver(() => { const w = box.clientWidth; if (!box.hidden && w && w !== lastW) { lastW = w; draw(box, w); } });
    ro.observe(box);
  }

  function buildTable({ cols, rows }) {
    const tb = el("table", { class: "data" });
    const thead = el("thead"), tr = el("tr");
    cols.forEach((c) => tr.append(el("th", { scope: "col" }, c)));
    thead.append(tr); tb.append(thead);
    const body = el("tbody");
    for (const r of rows) { const row = el("tr"); r.forEach((v, k) => row.append(el(k ? "td" : "th", k ? {} : { scope: "row" }, v))); body.append(row); }
    tb.append(body);
    return tb;
  }

  const M = { t: 12, r: 12, b: 26, l: 48 };
  function yAxis(g, y, w) {
    const ticks = y.ticks(4);
    const big = y.domain()[1] >= 10000;
    g.append("g").attr("class", "grid").selectAll("line").data(ticks).join("line").attr("x1", M.l).attr("x2", w - M.r).attr("y1", y).attr("y2", y);
    g.append("g").attr("class", "axis").attr("transform", `translate(${M.l},0)`)
      .call(d3.axisLeft(y).tickValues(ticks).tickSize(0).tickPadding(6).tickFormat((v) => (big ? fmtCompact.format(v) : fmt.format(v))))
      .call((a) => a.select(".domain").remove());
  }
  function xAxisYears(g, x, h, yrs, w) {
    const [r0, r1] = x.range();
    const pxPerYear = Math.abs(r1 - r0) / Math.max(1, yrs.length - 1);
    const every = Math.max(1, Math.ceil((w < 520 ? 28 : 40) / pxPerYear));
    g.append("g").attr("class", "axis").attr("transform", `translate(0,${h - M.b})`)
      .call(d3.axisBottom(x).tickValues(yrs.filter((_, k) => (yrs.length - 1 - k) % every === 0)).tickSize(0).tickPadding(8)
        .tickFormat((v) => (w < 520 ? "’" + String(v).slice(2) : v)));
  }
  const focusPoint = (tg) => { const r = tg.getBoundingClientRect(); return { clientX: r.left + r.width / 2, clientY: r.top }; };
  function roundedTop(x, y, w, h, r) {
    if (h <= 0) return "";
    r = Math.min(r, w / 2, h);
    return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`;
  }

  function stackedColumns(box, w, { yrs, series, height = 220, tipTitle = (y) => String(y), valueFmt = (v) => fmt.format(v) }) {
    box.replaceChildren();
    const h = height;
    const svg = d3.select(box).append("svg").attr("viewBox", `0 0 ${w} ${h}`).attr("height", h);
    const totals = yrs.map((_, i) => series.reduce((a, s) => a + (s.values[i] || 0), 0));
    const y = d3.scaleLinear().domain([0, d3.max(totals) || 1]).nice().range([h - M.b, M.t]);
    const x = d3.scaleBand().domain(yrs).range([M.l, w - M.r]).paddingInner(0.25).paddingOuter(0.1);
    const g = svg.append("g");
    yAxis(g, y, w);
    const bw = Math.min(24, x.bandwidth()), off = (x.bandwidth() - bw) / 2;
    yrs.forEach((yr, i) => {
      let acc = 0;
      const visible = series.filter((s) => (s.values[i] || 0) > 0);
      const col = g.append("g");
      visible.forEach((s, k) => {
        const v = s.values[i];
        const y0 = y(acc), y1 = y(acc + v);
        acc += v;
        const hgt = Math.max(0, y0 - y1 - (k > 0 ? 2 : 0)); // 2px surface gap between segments
        col.append("path").attr("class", "mark").attr("fill", css(s.color))
          .attr("d", roundedTop(x(yr) + off, y1, bw, hgt, k === visible.length - 1 ? Math.min(4, hgt) : 0));
      });
      col.append("rect").attr("x", x(yr)).attr("y", M.t).attr("width", x.bandwidth()).attr("height", h - M.b - M.t)
        .attr("fill", "transparent").attr("tabindex", 0).attr("aria-label", `${yr}: ${valueFmt(totals[i])}`)
        .on("pointermove focus", (e) => {
          col.selectAll(".mark").classed("hot", true);
          showTip(e.type === "focus" ? focusPoint(e.target) : e, tipTitle(yr),
            [...series].reverse().map((s) => ({ label: s.label, value: s.values[i] == null ? "—" : valueFmt(s.values[i]), color: css(s.color) }))
              .concat([{ label: t("total"), value: valueFmt(totals[i]) }]));
        })
        .on("pointerleave blur", () => { col.selectAll(".mark").classed("hot", false); hideTip(); });
    });
    xAxisYears(g, x, h, yrs, w);
  }

  function lines(box, w, { yrs, series, height = 220, valueFmt = (v) => fmt.format(v), zero = true }) {
    box.replaceChildren();
    const h = height;
    const svg = d3.select(box).append("svg").attr("viewBox", `0 0 ${w} ${h}`).attr("height", h);
    const all = series.flatMap((s) => s.values.filter((v) => v != null));
    const rightPad = w < 480 ? 12 : 96;
    const x = d3.scalePoint().domain(yrs).range([M.l + 6, w - M.r - rightPad]);
    const lo = zero ? 0 : d3.min(all) * 0.97;
    const y = d3.scaleLinear().domain([lo, d3.max(all) || 1]).nice().range([h - M.b, M.t]);
    const g = svg.append("g");
    yAxis(g, y, w - rightPad);
    xAxisYears(g, x, h, yrs, w);
    const surface = css("--surface");
    for (const s of series) {
      const pts = yrs.map((yr, i) => [yr, s.values[i]]);
      const ln = d3.line().defined((d) => d[1] != null).x((d) => x(d[0])).y((d) => y(d[1]));
      g.append("path").attr("fill", "none").attr("stroke", css(s.color)).attr("stroke-width", 2)
        .attr("stroke-linejoin", "round").attr("stroke-linecap", "round").attr("d", ln(pts));
      const last = [...pts].reverse().find((d) => d[1] != null);
      s._end = null;
      if (last) {
        g.append("circle").attr("cx", x(last[0])).attr("cy", y(last[1])).attr("r", 4).attr("fill", css(s.color)).attr("stroke", surface).attr("stroke-width", 2);
        s._end = { x: x(last[0]), y: y(last[1]), v: last[1] };
      }
    }
    if (rightPad > 20) {
      const ends = series.filter((s) => s._end).sort((a, b) => a._end.y - b._end.y);
      if (ends.every((s, k) => k === 0 || s._end.y - ends[k - 1]._end.y > 26)) for (const s of ends) {
        const tx = g.append("text").attr("class", "endlabel").attr("x", s._end.x + 10).attr("y", s._end.y - 2);
        tx.append("tspan").text(valueFmt(s._end.v)).attr("font-weight", 600).attr("fill", css("--text"));
        tx.append("tspan").attr("x", s._end.x + 10).attr("dy", 13).text(s.short || s.label);
      }
    }
    const cross = g.append("line").attr("class", "crosshair").attr("y1", M.t).attr("y2", h - M.b).style("display", "none");
    const dots = g.append("g");
    svg.append("rect").attr("x", M.l).attr("y", M.t).attr("width", w - M.l - M.r).attr("height", h - M.t - M.b).attr("fill", "transparent")
      .on("pointermove", (e) => {
        const [mx] = d3.pointer(e);
        const yr = yrs.reduce((best, yy) => (Math.abs(x(yy) - mx) < Math.abs(x(best) - mx) ? yy : best), yrs[0]);
        const i = yrs.indexOf(yr);
        cross.attr("x1", x(yr)).attr("x2", x(yr)).style("display", null);
        dots.selectAll("circle").data(series.filter((s) => s.values[i] != null)).join("circle")
          .attr("cx", x(yr)).attr("cy", (s) => y(s.values[i])).attr("r", 4).attr("fill", (s) => css(s.color)).attr("stroke", surface).attr("stroke-width", 2);
        showTip(e, String(yr), series.map((s) => ({ label: s.label, value: s.values[i] == null ? "—" : valueFmt(s.values[i]), color: css(s.color) })));
      })
      .on("pointerleave", () => { cross.style("display", "none"); dots.selectAll("*").remove(); hideTip(); });
  }

  function hbars(box, w, { items, color = "--s1", valueFmt = (v) => fmt.format(v) }) {
    box.replaceChildren();
    const row = 26, h = items.length * row + 4;
    const labelW = Math.min(210, w * 0.44);
    const svg = d3.select(box).append("svg").attr("viewBox", `0 0 ${w} ${h}`).attr("height", h);
    const x = d3.scaleLinear().domain([0, d3.max(items, (d) => d.value) || 1]).range([0, w - labelW - 56]);
    items.forEach((d, k) => {
      const g = svg.append("g").attr("transform", `translate(0,${k * row})`);
      g.append("text").attr("class", "hbar-label").attr("x", labelW - 8).attr("y", row / 2 + 4).attr("text-anchor", "end").text(truncate(d.label, labelW));
      const bw = Math.max(1, x(d.value)), bh = 14, y0 = (row - bh) / 2, r = Math.min(4, bw);
      g.append("path").attr("class", "mark").attr("fill", css(color))
        .attr("d", `M${labelW},${y0}H${labelW + bw - r}Q${labelW + bw},${y0} ${labelW + bw},${y0 + r}V${y0 + bh - r}Q${labelW + bw},${y0 + bh} ${labelW + bw - r},${y0 + bh}H${labelW}Z`);
      g.append("text").attr("class", "hbar-val").attr("x", labelW + bw + 6).attr("y", row / 2 + 4).text(valueFmt(d.value));
      g.append("rect").attr("width", w).attr("height", row).attr("fill", "transparent")
        .on("pointermove", (e) => showTip(e, d.label, [{ label: t("applications"), value: valueFmt(d.value) }]))
        .on("pointerleave", hideTip);
    });
  }
  const truncate = (s, px) => { const max = Math.floor(px / 6.6); return s.length > max ? s.slice(0, max - 1) + "…" : s; };

  // ------------------------------------------------------------ URL state
  function writeHash() {
    const p = new URLSearchParams();
    p.set("ano", state.year); p.set("ind", state.metric);
    if (state.norm !== "abs") p.set("un", state.norm);
    if (state.level !== "mun") p.set("nivel", state.level);
    if (state.lang !== "pt") p.set("lang", state.lang);
    if (state.sel) p.set(state.sel.type === "mun" ? "concelho" : "distrito", state.sel.id);
    history.replaceState(null, "", "#" + p.toString());
  }
  function readHash() {
    const p = new URLSearchParams(location.hash.slice(1));
    if (years.includes(+p.get("ano"))) state.year = +p.get("ano");
    if (METRICS.some((m) => m.id === p.get("ind"))) state.metric = p.get("ind");
    if (UNITS.some((u) => u.id === p.get("un"))) state.norm = p.get("un");
    if (p.get("nivel") === "dist") state.level = "dist";
    if (I18N[p.get("lang")]) state.lang = p.get("lang");
    if (INE.municipios[p.get("concelho")]) state.sel = { type: "mun", id: p.get("concelho") };
    else if (p.get("distrito") && allCodes().some((c) => INE.municipios[c].distrito === p.get("distrito"))) state.sel = { type: "dist", id: p.get("distrito") };
  }

  // ------------------------------------------------------------ detail panel
  function renderDetail() {
    writeHash();
    const sel = state.sel, s = seriesOf(sel);
    const i = years.indexOf(state.year);
    const cfmt = countFmt();
    $("#sel-kind").textContent = !sel ? t("kindCountry") : sel.type === "mun" ? t("kindMun", { d: INE.municipios[sel.id].distrito }) : t("kindDist");
    $("#sel-name").textContent = !sel ? "Portugal" : sel.type === "mun" ? INE.municipios[sel.id].nome : sel.id;
    $("#sel-reset").hidden = !sel;
    renderCaveats();

    // tiles
    const tiles = $("#tiles"); tiles.replaceChildren();
    const tile = (lab, v, delta) => {
      const d = el("div", { class: "tile" });
      d.append(el("div", { class: "lab" }, lab), el("div", { class: "val" }, v));
      if (delta) d.append(el("div", { class: "delta" }, delta));
      tiles.append(d);
    };
    const mt = metric("lic_total");
    const total = mval(mt, s, i), prev = i > 0 ? mval(mt, s, i - 1) : null;
    const ch = total != null && prev ? ((total - prev) / prev) * 100 : null;
    const unitSub = state.norm === "abs" ? "" : t(unit().suffix);
    const join = (...xs) => xs.filter(Boolean).join(" · ");
    tile(t("tLicensed", { y: state.year }), fvm(total, mt), join(unitSub, ch == null ? "" : `${ch >= 0 ? "+" : "−"}${fmtPct.format(Math.abs(ch))}% ${t("vsPrev", { y: state.year - 1 })}`));
    tile(t("tRenShare"), fvm(metric("ren_share").f(s, i), metric("ren_share")), t("tRenShareSub"));
    tile(t("tCompleted", { y: state.year }), state.year >= 2011 ? fvm(mval(metric("comp_total"), s, i), metric("comp_total")) : "—",
      state.year < 2011 ? t("seriesFrom2011") : unitSub);
    tile(t("tDwell"), fvm(mval(metric("dw_total"), s, i), metric("dw_total")), unitSub || t("tDwellSub"));
    const pc = metric("pop_change").f(s, i);
    tile(t("tPop", { y: state.year }), fv(s.pop[i]), pc == null ? "" : `${pc >= 0 ? "+" : "−"}${fmtRate(Math.abs(pc))}% ${t("vsPrev", { y: state.year - 1 })}`);
    const cf = INE.stock_carried_from.stock_dw;
    tile(t("tStock", { y: state.year }), fv(s.stock_dw[i]),
      join(state.year > cf ? t("stockCarried", { y: cf }) : "", s.pop[i] ? t("perPop", { v: fmtRate((1000 * s.stock_dw[i]) / s.pop[i]) }) : ""));

    const unitTitle = (title) => (state.norm === "abs" ? title : `${title} — ${t(unit().suffix)}`);
    const NN = normNote();

    // licensed by type
    const TYPES = [
      { key: "new", label: t("newB"), color: "--s1" }, { key: "enl", label: t("enl"), color: "--s2" },
      { key: "alt", label: t("alt"), color: "--s3" }, { key: "rec", label: t("rec"), color: "--s4" },
    ];
    const tSeries = TYPES.map((x) => ({ label: x.label, color: x.color, values: normArr(s, s["lic_" + x.key]) }));
    chartCard($("#c-types"), {
      title: unitTitle(t("cTypes")), desc: t("cTypesD"), note: NN,
      legend: TYPES.map((x) => ({ label: x.label, color: x.color })),
      draw: (box, w) => stackedColumns(box, w, { yrs: years, series: tSeries, valueFmt: cfmt }),
      table: () => ({ cols: [t("yearCol"), ...TYPES.map((x) => x.label), t("total")],
        rows: years.map((y, k) => [String(y), ...tSeries.map((x) => (x.values[k] == null ? "—" : cfmt(x.values[k]))), fvm(mval(mt, s, k), mt)]) }),
    });

    // licensed vs completed
    const yrs11 = years.filter((y) => y >= 2011), o = years.indexOf(2011);
    const lc = [
      { label: t("licensed"), short: t("licensedS"), color: "--s1", values: yrs11.map((_, k) => mval(mt, s, k + o)) },
      { label: t("completed"), short: t("completedS"), color: "--s2", values: yrs11.map((_, k) => mval(metric("comp_total"), s, k + o)) },
    ];
    chartCard($("#c-licvscomp"), {
      title: unitTitle(t("cLC")), desc: t("cLCD"), note: [t("cLCNote"), NN],
      legend: lc.map((x) => ({ label: x.label, color: x.color, line: true })),
      draw: (box, w) => lines(box, w, { yrs: yrs11, series: lc, valueFmt: cfmt }),
      table: () => ({ cols: [t("yearCol"), t("licensed"), t("completed")],
        rows: yrs11.map((y, k) => [String(y), ...lc.map((x) => (x.values[k] == null ? "—" : cfmt(x.values[k])))]) }),
    });

    // renovation by use
    const use = [
      { label: t("renHab"), short: t("renHabS"), color: "--s1", values: normArr(s, s.lic_ren_hab) },
      { label: t("renOth"), short: t("renOthS"), color: "--s2", values: normArr(s, s.lic_ren_oth) },
      { label: t("newOth"), short: t("newOthS"), color: "--s3", values: normArr(s, s.lic_new_oth) },
    ];
    chartCard($("#c-use"), {
      title: unitTitle(t("cUse")), desc: t("cUseD"), note: [t("cUseNote"), NN],
      legend: use.map((x) => ({ label: x.label, color: x.color, line: true })),
      draw: (box, w) => lines(box, w, { yrs: years, series: use, valueFmt: cfmt }),
      table: () => ({ cols: [t("yearCol"), ...use.map((u) => u.label)], rows: years.map((y, k) => [String(y), ...use.map((u) => (u.values[k] == null ? "—" : cfmt(u.values[k])))]) }),
    });

    // dwellings by typology
    const DW = [
      { key: "dw_t01", label: "T0–T1", color: "--s1" }, { key: "dw_t2", label: "T2", color: "--s2" },
      { key: "dw_t3", label: "T3", color: "--s3" }, { key: "dw_t4", label: t("t4"), color: "--s4" },
    ];
    const dws = DW.map((d) => ({ label: d.label, color: d.color, values: normArr(s, s[d.key]) }));
    chartCard($("#c-dwell"), {
      title: unitTitle(t("cDw")), desc: t("cDwD"), note: NN,
      legend: DW.map((d) => ({ label: d.label, color: d.color })),
      draw: (box, w) => stackedColumns(box, w, { yrs: years, series: dws, valueFmt: cfmt }),
      table: () => ({ cols: [t("yearCol"), ...DW.map((d) => d.label)], rows: years.map((y, k) => [String(y), ...dws.map((d) => (d.values[k] == null ? "—" : cfmt(d.values[k])))]) }),
    });

    // population
    const popS = [{ label: t("cPop"), short: "", color: "--s1", values: s.pop }];
    chartCard($("#c-pop"), {
      title: t("cPop"), desc: t("cPopD"), note: t("cPopNote"),
      draw: (box, w) => lines(box, w, { yrs: years, series: popS, zero: false, height: 200 }),
      table: () => ({ cols: [t("yearCol"), t("cPop"), t("m_pop_change")],
        rows: years.map((y, k) => [String(y), fv(s.pop[k]), fvm(metric("pop_change").f(s, k), metric("pop_change"))]) }),
    });

    // housing stock (years up to the last published one; no carried-forward values drawn)
    const lastStock = INE.stock_carried_from.stock_dw;
    const yrsS = years.filter((y) => y <= lastStock), oS = 0;
    const stockS = [
      { label: t("dwellings"), short: t("dwellingsS"), color: "--s1", values: yrsS.map((_, k) => s.stock_dw[k + oS]) },
      { label: t("resBuildings"), short: t("resBuildingsS"), color: "--s2", values: yrsS.map((_, k) => s.stock_bld[k + oS]) },
    ];
    chartCard($("#c-stock"), {
      title: t("cStock"), desc: t("cStockD"), note: t("cStockNote", { y: lastStock }),
      legend: stockS.map((x) => ({ label: x.label, color: x.color, line: true })),
      draw: (box, w) => lines(box, w, { yrs: yrsS, series: stockS, height: 200 }),
      table: () => ({ cols: [t("yearCol"), t("dwellings"), t("resBuildings"), t("m_dw_per_1000")],
        rows: yrsS.map((y, k) => [String(y), fv(stockS[0].values[k]), fv(stockS[1].values[k]), s.pop[k] ? fmtRate((1000 * s.stock_dw[k]) / s.pop[k]) : "—"]) }),
    });

    renderCouncil();
    renderParishes();
  }

  // ------------------------------------------------------------ council (partial) data
  const OUTCOMES = [
    { key: "aprovado", color: "--good" }, { key: "rejeitado", color: "--critical" }, { key: "pendente", color: "--warning" },
    { key: "desistido", color: "--neutral" }, { key: "desconhecido", color: "--neutral-2" },
  ];
  const oLabel = (o) => t("o_" + o.key);
  const FLATIN = [
    { key: "new_build", label: "appsNew", color: "--s1" }, { key: "alter_extend", label: "appsAlt", color: "--s2" },
    { key: "unclassified", label: "appsUnc", color: "--s3" },
  ];
  const noteText = (n) => (n && typeof n === "object" ? n[state.lang] || n.pt : n || "");

  function renderCouncil() {
    const host = $("#council"); host.replaceChildren();
    const sel = state.sel;
    if (!sel || sel.type !== "mun" || !MUN.concelhos[sel.id]) {
      const list = Object.keys(MUN.concelhos).filter((c) => !sel || sel.type !== "dist" || INE.municipios[c].distrito === sel.id);
      const card = el("article", { class: "card" });
      card.append(el("h3", {}, t("councilTitle")), el("p", { class: "desc muted" }, t("councilNone")));
      const chips = el("div", { class: "chips" });
      for (const c of (list.length ? list : Object.keys(MUN.concelhos))) {
        const b = el("button", { class: "chip", type: "button" }, INE.municipios[c].nome);
        const mc = MUN.concelhos[c];
        b.title = [mc.pedidos_ano && t("tagApps"), mc.resultados && t("tagOutcomes"), mc.mudanca_uso && t("tagCou")].filter(Boolean).join(", ");
        b.addEventListener("click", () => { state.sel = { type: "mun", id: c }; renderMapSelection(); renderDetail(); });
        chips.append(b);
      }
      card.append(chips);
      host.append(card);
      return;
    }
    const c = MUN.concelhos[sel.id];
    const head = el("div", { class: "council-head" });
    head.append(el("h3", {}, t("councilHead")), el("p", {}, t("councilHeadD")));
    host.append(head);
    const srcNote = (n) => [noteText(n), `${t("source")}: ${c.fonte} (${t("fetched")} ${c.obtido}).`].filter(Boolean).join(" ");

    if (c.pedidos_ano) {
      const yrs = Object.keys(c.pedidos_ano).map(Number);
      const prov = new Set(c.pedidos_ano_provisorio || []);
      const ser = FLATIN.map((f) => ({ label: t(f.label), color: f.color, values: yrs.map((y) => c.pedidos_ano[y]?.[f.key] ?? null) }));
      const card = el("article", { class: "card chart-card" }); host.append(card);
      chartCard(card, {
        title: t("cApps"), desc: t("cAppsD") + (prov.size ? ` ${[...prov].join(", ")}: ${t("provisional")}.` : ""),
        legend: FLATIN.map((f) => ({ label: t(f.label), color: f.color })),
        draw: (box, w) => stackedColumns(box, w, { yrs, series: ser, height: 200, tipTitle: (y) => (prov.has(String(y)) ? `${y} (${t("provisional")})` : String(y)) }),
        table: () => ({ cols: [t("yearCol"), ...FLATIN.map((f) => t(f.label)), t("pip")],
          rows: yrs.map((y) => [String(y) + (prov.has(String(y)) ? "*" : ""), ...FLATIN.map((f) => fv(c.pedidos_ano[y]?.[f.key])), fv(c.pedidos_ano[y]?.pip)]) }),
        note: t("cAppsNote"),
      });
    }

    if (c.resultados) {
      const yrs = Object.keys(c.resultados).map(Number).filter((y) => y >= 2010);
      const ser = OUTCOMES.map((o) => ({ label: oLabel(o), color: o.color, values: yrs.map((y) => c.resultados[y]?.[o.key] ?? 0) }));
      const tot = (keys, from, to) => yrs.filter((y) => y >= from && y <= to).reduce((a, y) => a + keys.reduce((b, k) => b + (c.resultados[y]?.[k] || 0), 0), 0);
      const lastFull = Math.min(new Date().getFullYear() - 1, yrs[yrs.length - 1]);
      const from = Math.max(yrs[0], lastFull - 4);
      const ap = tot(["aprovado"], from, lastFull), rj = tot(["rejeitado"], from, lastFull);
      const card = el("article", { class: "card chart-card" }); host.append(card);
      chartCard(card, {
        title: t("cOut"),
        desc: t("cOutD", { a: from, b: lastFull, ap: fmt.format(ap), rj: fmt.format(rj) }) + (ap + rj ? t("cOutRate", { r: fmtPct.format((100 * rj) / (ap + rj)) }) : "."),
        legend: OUTCOMES.map((o) => ({ label: oLabel(o), color: o.color })),
        draw: (box, w) => stackedColumns(box, w, { yrs, series: ser, height: 200 }),
        table: () => ({ cols: [t("entryYear"), ...OUTCOMES.map(oLabel)], rows: yrs.map((y) => [String(y), ...OUTCOMES.map((o) => fv(c.resultados[y]?.[o.key] ?? 0))]) }),
        note: srcNote(c.resultados_nota),
      });
    }

    if (c.mudanca_uso) {
      const yrs = Object.keys(c.mudanca_uso).map(Number).filter((y) => y >= 2010);
      const byUse = {};
      for (const y of yrs) for (const [u, n] of Object.entries(c.mudanca_uso[y])) byUse[u] = (byUse[u] || 0) + n;
      const sorted = Object.entries(byUse).sort((a, b) => b[1] - a[1]);
      const top = sorted.slice(0, 7).map(([label, value]) => ({ label: useLabel(label), value }));
      const rest = sorted.slice(7).reduce((a, [, n]) => a + n, 0);
      if (rest) top.push({ label: t("restUses", { n: sorted.length - 7 }), value: rest });
      const totals = yrs.map((y) => Object.values(c.mudanca_uso[y]).reduce((a, n) => a + n, 0));
      const card = el("article", { class: "card chart-card" }); host.append(card);
      chartCard(card, {
        title: t("cCou"), desc: t("cCouD", { a: yrs[0], b: yrs[yrs.length - 1], n: fmt.format(totals.reduce((a, n) => a + n, 0)) }),
        draw: (box, w) => hbars(box, w, { items: top }),
        table: () => ({ cols: [t("newUse"), t("applications")], rows: sorted.map(([u, n]) => [useLabel(u), fmt.format(n)]) }),
        note: noteText(c.mudanca_uso_nota),
      });
      const card2 = el("article", { class: "card chart-card" }); host.append(card2);
      const res = c.mudanca_uso_resultados || {};
      const ser = OUTCOMES.map((o) => ({ label: oLabel(o), color: o.color, values: yrs.map((y) => res[y]?.[o.key] ?? 0) }));
      chartCard(card2, {
        title: t("cCouY"), desc: t("cCouYD"),
        legend: OUTCOMES.map((o) => ({ label: oLabel(o), color: o.color })),
        draw: (box, w) => stackedColumns(box, w, { yrs, series: ser, height: 180 }),
        table: () => ({ cols: [t("yearCol"), ...OUTCOMES.map(oLabel), t("total")], rows: yrs.map((y, k) => [String(y), ...OUTCOMES.map((o) => fv(res[y]?.[o.key] ?? 0)), fv(totals[k])]) }),
      });
    }
  }

  // ------------------------------------------------------------ parishes
  const parishCache = new Map();
  async function renderParishes() {
    const host = $("#parishes");
    const sel = state.sel;
    if (!sel || sel.type !== "mun") { host.hidden = true; return; }
    const id = sel.id;
    let d = parishCache.get(id);
    if (!d) {
      try { d = await (await fetch(`data/parishes/${id}.json`)).json(); parishCache.set(id, d); }
      catch { host.hidden = true; return; }
    }
    if (state.sel?.id !== id) return;
    const i = d.years.indexOf(state.year);
    const rows = Object.values(d.freguesias).map((p) => {
      const v = (k) => p.s[k]?.[i] ?? null;
      const r = [v("lic_new_hab"), v("lic_new_oth"), v("lic_ren_hab"), v("lic_ren_oth")];
      return { nome: p.nome, r, t: sum(...r) };
    }).filter((x) => x.t != null).sort((a, b) => b.t - a.t);
    host.replaceChildren();
    host.hidden = false;
    host.append(el("h3", {}, t("parishT", { y: state.year })), el("p", { class: "desc muted" }, t("parishD")));
    if (!rows.length) { host.append(el("p", { class: "muted small" }, t("parishNone"))); return; }
    const wrap = el("div", { class: "table-wrap" });
    wrap.append(buildTable({
      cols: [t("parish"), t("pNewHab"), t("pNewOth"), t("pRenHab"), t("pRenOth"), t("total")],
      rows: rows.map((x) => [x.nome, ...x.r.map(fv), fv(x.t)]),
    }));
    host.append(wrap);
  }

  // ------------------------------------------------------------ sources
  function renderSources() {
    $("#sources-title").textContent = t("sourcesT");
    const host = $("#sources"); host.replaceChildren();
    const ul = el("ul");
    for (const [code, s] of Object.entries(INE.sources)) {
      const li = el("li");
      li.append(el("a", { href: s.url, target: "_blank", rel: "noopener" }, `INE ${code}`), document.createTextNode(` — ${s.nome} (${t("updated")} ${s.atualizado})`));
      ul.append(li);
    }
    const li = el("li");
    li.append(el("a", { href: MUN.pedidos_fonte.url, target: "_blank", rel: "noopener" }, "flatin.pt"), document.createTextNode(t("flatinSrc")));
    ul.append(li);
    for (const c of Object.values(MUN.concelhos)) if (c.fonte) {
      const l = el("li"); l.append(el("a", { href: c.url, target: "_blank", rel: "noopener" }, c.fonte), document.createTextNode(` (${t("fetched")} ${c.obtido}).`)); ul.append(l);
    }
    ul.append(el("li", {}, t("caop")));
    const lic = el("p", {});
    lic.append(document.createTextNode(t("licence") + " "),
      el("a", { href: "https://creativecommons.org/licenses/by/4.0/", target: "_blank", rel: "noopener license" }, "CC BY 4.0"));
    host.append(ul, el("p", {}, t("notes")), lic);
  }

  // ------------------------------------------------------------ chrome: language, theme, controls
  function applyStaticText() {
    document.documentElement.lang = state.lang;
    document.title = t("title");
    document.querySelector('meta[name="description"]').setAttribute("content", t("metaDesc"));
    document.querySelectorAll("[data-i18n]").forEach((n) => { n.textContent = t(n.dataset.i18n); });
    document.querySelectorAll("[data-i18n-aria]").forEach((n) => n.setAttribute("aria-label", t(n.dataset.i18nAria)));
    $("#f-search").placeholder = t("searchPh");
    const mSel = $("#f-metric"); mSel.replaceChildren();
    METRICS.forEach((m) => mSel.append(el("option", { value: m.id }, t("m_" + m.id))));
    mSel.value = state.metric;
    const uSel = $("#f-units"); uSel.replaceChildren();
    UNITS.forEach((u) => uSel.append(el("option", { value: u.id }, t(u.label))));
    uSel.value = state.norm;
    syncSeg("[data-lang]", (b) => b.dataset.lang === state.lang);
    syncSeg("[data-level]", (b) => b.dataset.level === state.level);
  }
  const syncSeg = (sel, on) => document.querySelectorAll(sel).forEach((b) => b.setAttribute("aria-checked", String(on(b))));
  function currentTheme() {
    const th = document.documentElement.dataset.theme;
    return th || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  }
  function syncTheme() { syncSeg("[data-theme-btn]", (b) => b.dataset.themeBtn === currentTheme()); }
  function rerenderAll() { buildMap(); renderMap(); renderDetail(); renderSources(); }

  async function init() {
    const [ine, mun, topo] = await Promise.all(["data/ine.json", "data/municipal.json", "data/municipios.topo.json"].map((u) => fetch(u).then((r) => r.json())));
    INE = ine; MUN = mun; TOPO = topo; years = INE.years;
    // Islets that collapse during simplification can come out inverted (covering the globe): drop those parts.
    const clean = (g) => {
      if (!g) return g;
      const polys = (g.type === "Polygon" ? [g.coordinates] : g.coordinates).filter((c) => d3.geoArea({ type: "Polygon", coordinates: c }) < 2 * Math.PI);
      return { type: "MultiPolygon", coordinates: polys };
    };
    features = topojson.feature(TOPO, TOPO.objects.municipios).features.map((f) => ({ ...f, geometry: clean(f.geometry) }));
    for (const f of features) districtOf[f.properties.dtmn] = INE.municipios[f.properties.dtmn].distrito;
    const byDist = d3.group(TOPO.objects.municipios.geometries, (g) => districtOf[g.properties.dtmn]);
    distFeatures = [...byDist].map(([code, geoms]) => ({ type: "Feature", properties: { code, anyCode: geoms[0].properties.dtmn }, geometry: clean(topojson.merge(TOPO, geoms)) }));

    state.year = years[years.length - 1];
    try { const l = localStorage.getItem("lang"); if (I18N[l]) state.lang = l; } catch {}
    readHash();
    setFormatters();
    applyStaticText();
    syncTheme();

    const ySel = $("#f-year");
    [...years].reverse().forEach((y) => ySel.append(el("option", { value: y }, y)));
    ySel.value = state.year;
    ySel.addEventListener("change", () => { state.year = +ySel.value; renderMap(); renderDetail(); });
    $("#f-metric").addEventListener("change", (e) => { state.metric = e.target.value; renderMap(); writeHash(); });
    $("#f-units").addEventListener("change", (e) => { state.norm = e.target.value; renderMap(); renderDetail(); });
    document.querySelectorAll("[data-level]").forEach((b) => b.addEventListener("click", () => {
      state.level = b.dataset.level; syncSeg("[data-level]", (x) => x === b); renderMap(); writeHash();
    }));
    document.querySelectorAll("[data-lang]").forEach((b) => b.addEventListener("click", () => {
      if (state.lang === b.dataset.lang) return;
      state.lang = b.dataset.lang;
      try { localStorage.setItem("lang", state.lang); } catch {}
      setFormatters(); applyStaticText(); rerenderAll();
    }));
    document.querySelectorAll("[data-theme-btn]").forEach((b) => b.addEventListener("click", () => {
      document.documentElement.dataset.theme = b.dataset.themeBtn;
      try { localStorage.setItem("theme", b.dataset.themeBtn); } catch {}
      syncTheme(); rerenderAll();
    }));
    matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
      if (!document.documentElement.dataset.theme) { syncTheme(); rerenderAll(); }
    });
    const dl = $("#muni-list");
    Object.entries(INE.municipios).sort((a, b) => a[1].nome.localeCompare(b[1].nome, "pt")).forEach(([, m]) => dl.append(el("option", { value: m.nome })));
    $("#f-search").addEventListener("change", (e) => {
      const q = e.target.value.trim().toLowerCase();
      const hit = Object.entries(INE.municipios).find(([, m]) => m.nome.toLowerCase() === q);
      if (hit) { state.sel = { type: "mun", id: hit[0] }; renderMapSelection(); renderDetail(); }
    });
    $("#sel-reset").addEventListener("click", () => { state.sel = null; renderMapSelection(); renderDetail(); });

    rerenderAll();
  }

  try { const th = localStorage.getItem("theme"); if (th === "light" || th === "dark") document.documentElement.dataset.theme = th; } catch {}
  init().catch((e) => { document.body.append(el("p", { class: "card" }, (I18N[state.lang] || I18N.pt).loadErr + e.message)); console.error(e); });
})();
