"""Download INE (Statistics Portugal) building-permit and completed-works indicators.

Every indicator is fetched one reference year at a time through the public JSON API
and cached in data/raw/ine/<code>/<year>.json, so reruns only fetch what is missing.
Use --refresh to download the last two years again (INE revises preliminary data).
"""
import argparse
import json
import pathlib
import time

import requests

ROOT = pathlib.Path(__file__).resolve().parents[1]
RAW = ROOT / "data" / "raw" / "ine"

INDICATORS = {
    # Licensed buildings by municipality and detailed type of work (new, enlargement, alteration, reconstruction, demolition).
    "0013242": "Edifícios licenciados por município e tipo de obra (anual)",
    # Licensed buildings by parish, type of work (new vs. enlargement/alteration/reconstruction) and use (family housing vs. other).
    "0013234": "Edifícios licenciados por freguesia, tipo de obra e destino (anual)",
    # Completed buildings by municipality and detailed type of work.
    "0008330": "Edifícios concluídos por município e tipo de obra (anual)",
    # Completed buildings by municipality, type of work and use.
    "0008320": "Edifícios concluídos por município, tipo de obra e destino (anual)",
    # Dwellings licensed in new construction for family housing, by municipality.
    "0013235": "Fogos licenciados em construções novas para habitação familiar (anual)",
    # Resident population (31 Dec estimates); three vintages chained in build_data.py.
    "0000611": "População residente 1991-2013 (NUTS 2002)",
    "0008273": "População residente 2011-2023 (NUTS 2013)",
    "0012918": "População residente 2021- (NUTS 2024)",
    # Housing stock: classic family dwellings and residential buildings.
    "0000084": "Alojamentos familiares clássicos 2001-2021",
    "0014137": "Alojamentos familiares clássicos 2022-",
    "0000083": "Edifícios de habitação familiar clássica 2001-2021",
    "0014136": "Edifícios de habitação familiar clássica 2022-",
}

# Only download the years each vintage is used for (older vintages overlap newer ones).
YEAR_RANGE = {"0000611": (2002, 2010), "0008273": (2011, 2020), "0000084": (2002, 2021), "0000083": (2002, 2021)}

META_URL = "https://www.ine.pt/ine/json_indicador/pindicaMeta.jsp"
DATA_URL = "https://www.ine.pt/ine/json_indicador/pindica.jsp"
HEADERS = {"User-Agent": "obras-pt data fetcher"}


def get_json(url, params, tries=4):
    for attempt in range(tries):
        try:
            r = requests.get(url, params=params, headers=HEADERS, timeout=180)
            r.raise_for_status()
            return r.json()
        except Exception as e:  # network hiccups and INE timeouts are common
            if attempt == tries - 1:
                raise
            wait = 5 * (attempt + 1)
            print(f"    retry in {wait}s ({e.__class__.__name__})")
            time.sleep(wait)


def years_for(code):
    meta = get_json(META_URL, {"varcd": code, "lang": "PT"})[0]
    (RAW / code).mkdir(parents=True, exist_ok=True)
    (RAW / code / "meta.json").write_text(json.dumps(meta, ensure_ascii=False), encoding="utf-8")
    first, last = int(meta["PrimeiroPeriodo"]), int(meta["UltimoPeriodo"])
    return meta["IndicadorNome"], list(range(first, last + 1))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--refresh", action="store_true", help="re-download the two most recent years")
    ap.add_argument("codes", nargs="*", default=list(INDICATORS))
    args = ap.parse_args()

    for code in args.codes:
        name, years = years_for(code)
        print(f"{code}: {name}\n  years {years[0]}-{years[-1]}")
        lo, hi = YEAR_RANGE.get(code, (years[0], years[-1]))
        for y in years:
            if not lo <= y <= hi:
                continue
            out = RAW / code / f"{y}.json"
            if out.exists() and not (args.refresh and y >= years[-1] - 1):
                continue
            d = get_json(DATA_URL, {"op": "2", "varcd": code, "Dim1": f"S7A{y}", "lang": "PT"})[0]
            rows = d.get("Dados", {}).get(str(y), [])
            out.write_text(json.dumps(rows, ensure_ascii=False), encoding="utf-8")
            print(f"  {y}: {len(rows)} rows")


if __name__ == "__main__":
    main()
