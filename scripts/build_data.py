"""Turn the raw downloads into compact JSON files for the web app (web/data/).

Outputs
  ine.json              national INE series for all 308 municipalities (one array per series, indexed by year)
  parishes/<dtmn>.json  INE licensed buildings by parish (new vs. renovation x housing vs. other), per municipality
  municipal.json        partial-coverage council data: applications submitted (flatin.pt),
                        application outcomes and change-of-use processes (council open layers)
"""
import collections
import csv
import datetime
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parents[1]
RAW = ROOT / "data" / "raw"
WEB = ROOT / "web" / "data"

DISTRITOS = {
    "01": "Aveiro", "02": "Beja", "03": "Braga", "04": "Bragança", "05": "Castelo Branco", "06": "Coimbra",
    "07": "Évora", "08": "Faro", "09": "Guarda", "10": "Leiria", "11": "Lisboa", "12": "Portalegre",
    "13": "Porto", "14": "Santarém", "15": "Setúbal", "16": "Viana do Castelo", "17": "Vila Real", "18": "Viseu",
    "31": "Madeira", "32": "Madeira",
    "41": "Açores", "42": "Açores", "43": "Açores", "44": "Açores", "45": "Açores", "46": "Açores", "47": "Açores",
    "48": "Açores", "49": "Açores",
}

# series key -> (indicator, filter on dim_3, filter on dim_4)
INE_SERIES = {
    # Licensed buildings, by type of work
    "lic_new": ("0013242", "11", None),
    "lic_enl": ("0013242", "12", None),
    "lic_alt": ("0013242", "13", None),
    "lic_rec": ("0013242", "14", None),
    "lic_dem": ("0013242", "21", None),
    # Licensed buildings, new vs. renovation x family housing vs. other use
    "lic_new_hab": ("0013234", "1", "1"),
    "lic_new_oth": ("0013234", "1", "2"),
    "lic_ren_hab": ("0013234", "2", "1"),
    "lic_ren_oth": ("0013234", "2", "2"),
    # Completed buildings, by type of work
    "comp_new": ("0008330", "11", None),
    "comp_enl": ("0008330", "12", None),
    "comp_alt": ("0008330", "13", None),
    "comp_rec": ("0008330", "14", None),
    "comp_dem": ("0008330", "21", None),
    # Completed buildings, new vs. renovation x housing vs. other
    "comp_new_hab": ("0008320", "1", "1"),
    "comp_new_oth": ("0008320", "1", "2"),
    "comp_ren_hab": ("0008320", "2", "1"),
    "comp_ren_oth": ("0008320", "2", "2"),
    # Dwellings licensed in new family-housing construction, by typology
    "dw_t01": ("0013235", "1", None),
    "dw_t2": ("0013235", "2", None),
    "dw_t3": ("0013235", "3", None),
    "dw_t4": ("0013235", "4", None),
}


# Denominators: (series key, [(indicator, first year, last year)], dim filters). Later vintages win on overlap.
DENOMINATORS = {
    "pop": ([("0000611", 2002, 2010), ("0008273", 2011, 2020), ("0012918", 2021, 2100)], {"dim_3": "T", "dim_4": "T"}),
    "stock_dw": ([("0000084", 2002, 2021), ("0014137", 2022, 2100)], {}),
    "stock_bld": ([("0000083", 2002, 2021), ("0014136", 2022, 2100)], {}),
}


# Known gaps. INE footnotes (completed works 0008330/0008320, housing stock 0000083/0000084) say responses were
# incomplete for these municipalities/years; the licensing series (same survey) shows the same gap for Lisboa/Seia
# 2002-2005 (near-zero values followed by a jump in 2006) although its own metadata carries no footnote.
CAVEATS = [
    {"dtmn": ["1106", "0912"], "from": 2002, "to": 2005, "series": ["lic", "comp", "stock"],
     "pt": "O INE não obteve todas as respostas de {m} em 2002–2005: os valores de licenciamento, conclusões e parque habitacional destes anos estão subavaliados (o licenciamento aparece quase a zero em 2003–2005).",
     "en": "INE did not receive all survey responses from {m} for 2002–2005: licensing, completion and housing-stock values for those years are undercounted (licensing shows as almost zero in 2003–2005).",
     "source": ["0008330", "0008320", "0000083", "0000084"]},
    {"dtmn": ["1115"], "from": 2011, "to": 2017, "series": ["comp", "stock"],
     "pt": "O INE não obteve todas as respostas de {m} em 2011–2017: as conclusões de obras e o parque habitacional destes anos estão subavaliados.",
     "en": "INE did not receive all survey responses from {m} for 2011–2017: completions and housing-stock values for those years are undercounted.",
     "source": ["0008330", "0008320", "0014136", "0014137"]},
]


def num(v):
    try:
        return int(float(v))
    except (TypeError, ValueError):
        return None


def load_ine(code):
    folder = RAW / "ine" / code
    meta = json.loads((folder / "meta.json").read_text(encoding="utf-8"))
    years = {}
    for f in folder.glob("[0-9]*.json"):
        years[int(f.stem)] = json.loads(f.read_text(encoding="utf-8"))
    return meta, years


def build_ine(names):
    cache = {code: load_ine(code) for code in {s[0] for s in INE_SERIES.values()}}
    all_years = sorted({y for _, ys in cache.values() for y in ys})
    idx = {y: i for i, y in enumerate(all_years)}
    munis = {d: {k: [None] * len(all_years) for k in INE_SERIES} for d in names}
    parishes = collections.defaultdict(dict)  # dtmn -> {parish code: {name, series}}

    for key, (code, d3, d4) in INE_SERIES.items():
        _, years = cache[code]
        for y, rows in years.items():
            for r in rows:
                if r.get("dim_3") != d3 or (d4 is not None and r.get("dim_4") != d4):
                    continue
                g = r["geocod"]
                if len(g) == 7:
                    dtmn = g[-4:]
                    if dtmn in munis:
                        munis[dtmn][key][idx[y]] = num(r.get("valor"))
                elif len(g) == 9 and code == "0013234":
                    dtmn, fcode = g[3:7], g[3:]
                    p = parishes[dtmn].setdefault(fcode, {"nome": r["geodsg"], "s": {}})
                    p["s"].setdefault(key, [None] * len(all_years))[idx[y]] = num(r.get("valor"))
                    p["nome"] = r["geodsg"]  # keep the latest spelling

    # Population and housing stock, chained across INE vintages; stock carried forward past its last year.
    carried = {}
    for key, (parts, filt) in DENOMINATORS.items():
        for d in munis:
            munis[d][key] = [None] * len(all_years)
        last_year = None
        for code, y0, y1 in parts:
            meta, ys = load_ine(code)
            cache[code] = (meta, ys)
            for y, rows in ys.items():
                if y not in idx or not y0 <= y <= y1:
                    continue
                last_year = max(last_year or y, y)
                for r in rows:
                    if len(r["geocod"]) != 7 or any(r.get(k) != v for k, v in filt.items()):
                        continue
                    if r["geocod"][-4:] in munis:
                        munis[r["geocod"][-4:]][key][idx[y]] = num(r.get("valor"))
        if key.startswith("stock") and last_year and last_year < all_years[-1]:
            carried[key] = last_year
            for d in munis:
                v = munis[d][key][idx[last_year]]
                for y in all_years[idx[last_year] + 1:]:
                    munis[d][key][idx[y]] = v

    sources = {code: {"nome": meta["IndicadorNome"], "atualizado": meta.get("DataUltimaAtualizacao"),
                      "url": f"https://www.ine.pt/xurl/indx/{code}", "nota": meta.get("Nota")}
               for code, (meta, _) in cache.items()}
    out = {"years": all_years, "series": list(INE_SERIES) + list(DENOMINATORS), "sources": sources,
           "stock_carried_from": carried,
           "caveats": CAVEATS,
           "series_source": {**{k: v[0] for k, v in INE_SERIES.items()}, **{k: [c for c, _, _ in v[0]] for k, v in DENOMINATORS.items()}},
           "municipios": {d: {"nome": names[d]["nome"], "distrito": names[d]["distrito"], **munis[d]} for d in sorted(munis)}}
    (WEB / "ine.json").write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")

    pdir = WEB / "parishes"
    pdir.mkdir(exist_ok=True)
    for dtmn, ps in parishes.items():
        # Parishes that no longer exist (2013 merger, 2025 split) only have values for some years.
        (pdir / f"{dtmn}.json").write_text(json.dumps({"years": all_years, "freguesias": ps}, ensure_ascii=False,
                                                      separators=(",", ":")), encoding="utf-8")
    print(f"ine.json: {len(munis)} municipalities, {len(all_years)} years; parishes for {len(parishes)} municipalities")


# ---------------------------------------------------------------- council data

def ms_to_year(ms):
    if ms is None:
        return None
    return (datetime.datetime(1970, 1, 1) + datetime.timedelta(milliseconds=ms)).year


OUTCOME_ORDER = ["aprovado", "rejeitado", "pendente", "desistido", "desconhecido"]


def outcome_matosinhos(label):
    s = (label or "").lower()
    if not s:
        return "desconhecido"
    if "rejeição" in s or "indeferimento" in s or "desfavorável" in s:
        return "rejeitado"
    if "desist" in s or "caducidade" in s or "extinção" in s:
        return "desistido"
    if "sem decisão" in s or "saneamento" in s:
        return "pendente"
    if "emitid" in s or "deferimento" in s or "aprovad" in s:
        return "aprovado"
    return "desconhecido"


def outcome_paredes(label):
    s = (label or "").strip().lower()
    if not s or "georreferencia" in s:
        return "desconhecido"
    if "indeferido" in s:
        return "rejeitado"
    if "caducado" in s or "arquivado" in s:
        return "desistido"
    if "apreciação" in s or "suspenso" in s:
        return "pendente"
    if "deferid" in s or "alvará" in s:
        return "aprovado"
    return "desconhecido"


def outcome_lousa(label):
    s = (label or "").strip().lower()
    return {"deferido": "aprovado", "indeferido": "rejeitado", "rejeitado": "rejeitado", "em análise": "pendente",
            "tramitacao": "pendente", "arquivado": "desistido", "caducado": "desistido", "anulado": "desistido"}.get(s, "desconhecido")


def paredes_year(pid):
    m = re.search(r"/(\d{2})", pid or "")
    if not m:
        return None
    yy = int(m.group(1))
    return 2000 + yy if yy <= datetime.date.today().year % 100 else 1900 + yy


def counter_by_year(items):
    """items: iterable of (year, category) -> {year: {category: n}}"""
    out = collections.defaultdict(collections.Counter)
    for y, c in items:
        if y and 1990 <= y <= datetime.date.today().year:
            out[y][c] += 1
    return {str(y): dict(v) for y, v in sorted(out.items())}


def build_council():
    def load(key):
        return json.loads((RAW / "municipal" / f"{key}.json").read_text(encoding="utf-8"))

    councils = {}

    # Matosinhos: one row per polygon -> dedupe by process number.
    m = load("matosinhos")
    procs = {}
    for r in m["rows"]:
        procs.setdefault(r["NProc"], r)
    works_types = {"Licença administrativa", "Comunicação prévia"}
    cou_types = {"Alteração de utilização", "Comunicação prévia com prazo de alteração de utilização"}
    works, cou = [], []
    for r in procs.values():
        y = ms_to_year(r["DataEntrada"])
        status = re.search(r"- ([^()]+?)\)\s*$", r["Etiqueta"] or "")
        oc = outcome_matosinhos(status.group(1) if status else None)
        if r["TipoProcesso"] in works_types:
            works.append((y, oc))
        elif r["TipoProcesso"] in cou_types:
            cou.append((y, oc, r["Usos"] or "Não indicado"))
    councils["1308"] = {
        "fonte": "Câmara Municipal de Matosinhos — Arquivo Digital de Processos (SIG aberto)",
        "url": m["source_url"], "obtido": m["fetched"],
        "resultados": counter_by_year(works),
        "resultados_nota": {"pt": "Licenças administrativas e comunicações prévias de obras, por ano de entrada. "
                                  "'Rejeitado' junta rejeições liminares e indeferimentos.",
                            "en": "Building permits and prior notifications, by year of entry. "
                                  "'Rejected' includes both preliminary rejections and refusals."},
        "mudanca_uso": counter_by_year((y, u) for y, _, u in cou),
        "mudanca_uso_resultados": counter_by_year((y, oc) for y, oc, _ in cou),
        "mudanca_uso_nota": {"pt": "Pedidos de alteração de utilização (licença e comunicação prévia com prazo), por novo uso pretendido.",
                             "en": "Change-of-use applications (permit and prior notification with deadline), by the new use requested."},
    }

    # Paredes: dedupe by process id; year comes from the id suffix (e.g. 124/13P -> 2013).
    p = load("paredes")
    procs = {}
    for r in p["rows"]:
        procs.setdefault(r["IDProcesso"], r)
    works, cou = [], []
    for r in procs.values():
        kind = (r["Medidata"] or "").split(" - ")[0].strip()
        y, oc = paredes_year(r["IDProcesso"]), outcome_paredes(r["Estado_Processo"])
        if kind in {"P", "LI", "CP"}:
            works.append((y, oc))
        elif kind == "AU":
            use = (r["Utilização_1"] or "").strip() or "Não indicado"
            cou.append((y, oc, use))
    councils["1310"] = {
        "fonte": "Câmara Municipal de Paredes — Gestão Urbanística (SIG aberto)",
        "url": p["source_url"], "obtido": p["fetched"],
        "resultados": counter_by_year(works),
        "resultados_nota": {"pt": "Processos de edificação, licenciamento e comunicação prévia, por ano do número de processo. "
                                  "O estado é o atual (processos antigos podem ter passado por vários estados).",
                            "en": "Building, licensing and prior-notification processes, by the year in the process number. "
                                  "Status is the current one."},
        "mudanca_uso": counter_by_year((y, u) for y, _, u in cou),
        "mudanca_uso_resultados": counter_by_year((y, oc) for y, oc, _ in cou),
        "mudanca_uso_nota": {"pt": "Processos de alteração de utilização, por utilização indicada no processo.",
                             "en": "Change-of-use processes, by the use stated in the process."},
    }

    # Lousã
    lo = load("lousa")
    dom = lo["domains"]
    works = []
    for r in lo["rows"]:
        y = int(r["ano"]) if r["ano"] and r["ano"] < 3000 else ms_to_year(r["dataentrada"])
        works.append((y, outcome_lousa(r["estado"])))
    councils["0607"] = {
        "fonte": "Câmara Municipal da Lousã — Gestão de Processos Urbanísticos (SIG aberto)",
        "url": lo["source_url"], "obtido": lo["fetched"],
        "resultados": counter_by_year(works),
        "resultados_nota": {"pt": "Processos de edificação (licenciamento e comunicação prévia), por ano de entrada.",
                            "en": "Building processes (permit and prior notification), by year of entry."},
    }

    # flatin.pt: applications submitted
    def read_flatin(name):
        with open(RAW / "flatin" / f"{name}.csv", encoding="utf-8") as f:
            return list(csv.DictReader(f))

    for gran, key in (("yearly", "pedidos_ano"), ("monthly", "pedidos_mes")):
        for r in read_flatin(gran):
            if r["measure"] == "undated":
                continue
            c = councils.setdefault(r["municipality_code"].zfill(4), {})
            c.setdefault("nome", r["municipality"])
            series = c.setdefault(key, {})
            series.setdefault(r["period"], {})[r["measure"]] = int(r["cases"])
            if r["provisional"] == "true":
                c.setdefault(key + "_provisorio", []).append(r["period"])
            c.setdefault("pedidos_fonte", r["source_url"])
    for c in councils.values():
        for k in ("pedidos_ano_provisorio", "pedidos_mes_provisorio"):
            if k in c:
                c[k] = sorted(set(c[k]))
        for k in ("pedidos_ano", "pedidos_mes"):
            if k in c:
                c[k] = dict(sorted(c[k].items()))

    out = {"outcome_order": OUTCOME_ORDER,
           "pedidos_fonte": {"nome": "flatin.pt — Barómetro da construção (processos de obras entrados nas câmaras)",
                             "url": "https://flatin.pt/pt/barometro-construcao/",
                             "dados": "https://dados.gov.pt/datasets/processos-de-obras-de-edificacao-entrados-nas-camaras-municipais-contagens-mensais-por-concelho-indicador-flatin-pt"},
           "concelhos": dict(sorted(councils.items()))}
    (WEB / "municipal.json").write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    for d, c in out["concelhos"].items():
        print(f"  {d}: {sorted(k for k in c if not k.endswith(('nota', 'url', 'fonte', 'obtido')))}")


def municipality_names():
    topo = json.loads((WEB / "municipios.topo.json").read_text(encoding="utf-8"))
    names = {}
    for g in topo["objects"]["municipios"]["geometries"]:
        p = g["properties"]
        names[p["dtmn"]] = {"nome": p["nome"], "distrito": DISTRITOS[p["dtmn"][:2]]}
    assert len(names) == 308, len(names)
    return names


def main():
    WEB.mkdir(parents=True, exist_ok=True)
    build_ine(municipality_names())
    build_council()
    for f in sorted(WEB.glob("*.json")):
        print(f"  {f.name}: {f.stat().st_size / 1e3:.0f} kB")


if __name__ == "__main__":
    main()
