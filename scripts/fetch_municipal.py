"""Download non-personal fields from municipal urban-management (gestão urbanística) open layers.

Only categorical/date fields are requested (process type, operation, use, status, entry date).
Names, tax numbers (NIF), addresses and geometry are never requested.
Raw records go to data/raw/municipal/<key>.json; aggregation happens in build_data.py.
"""
import json
import pathlib
import time

import requests

ROOT = pathlib.Path(__file__).resolve().parents[1]
RAW = ROOT / "data" / "raw" / "municipal"
HEADERS = {"User-Agent": "obras-pt data fetcher"}

LAYERS = {
    "matosinhos": {
        "dtmn": "1308",
        "url": "https://infosig.cm-matosinhos.pt/server/rest/services/URBANISMO/URBAN_ArquivoDigitalProcessos/MapServer/0",
        "fields": ["OBJECTID", "NProc", "TipoProcesso", "TipoOperacaoUrb", "Usos", "DataEntrada", "Etiqueta"],
    },
    "lousa": {
        "dtmn": "0607",
        "url": "https://sig.cm-lousa.pt/arcgis/rest/services/GestaoProcessosUrbanisticos/GestaoProcessos/MapServer/3",
        "fields": ["objectid", "nprocesso", "dataentrada", "ano", "tipoconstrucao", "tipodeutilizacao", "procedimento", "estado"],
    },
    "paredes": {
        "dtmn": "1310",
        "url": "https://sig.cm-paredes.pt/server/rest/services/Servicos/AGS_GestaoUrbanistica/MapServer/1",
        "fields": ["OBJECTID", "IDProcesso", "Medidata", "Estado_Processo", "Tipo_Operacao_Urbanistica_1", "Utilização_1",
                   "Tipo_Operacao_Urbanistica_2", "Utilização_2"],
    },
}


def get(url, params, tries=4):
    for attempt in range(tries):
        try:
            r = requests.post(url, data=params, headers=HEADERS, timeout=180)
            r.raise_for_status()
            d = r.json()
            if "error" in d:
                raise RuntimeError(d["error"])
            return d
        except Exception as e:
            if attempt == tries - 1:
                raise
            print(f"    retry ({e})")
            time.sleep(5 * (attempt + 1))


def fetch(key, cfg):
    meta = get(cfg["url"], {"f": "json"})
    domains = {f["name"]: {str(c["code"]): c["name"] for c in f["domain"]["codedValues"]}
               for f in meta.get("fields", []) if f.get("domain") and f["domain"].get("codedValues")}
    ids = get(cfg["url"] + "/query", {"where": "1=1", "returnIdsOnly": "true", "f": "json"})
    oid_field = ids["objectIdFieldName"]
    oids = sorted(ids["objectIds"] or [])
    print(f"{key}: {len(oids)} records")
    rows = []
    for i in range(0, len(oids), 500):
        chunk = oids[i:i + 500]
        d = get(cfg["url"] + "/query", {
            "objectIds": ",".join(map(str, chunk)), "outFields": ",".join(cfg["fields"]),
            "returnGeometry": "false", "f": "json"})
        rows += [f["attributes"] for f in d["features"]]
        print(f"  {len(rows)}/{len(oids)}")
    # Belt and braces: keep only whitelisted fields.
    rows = [{k: r.get(k) for k in cfg["fields"]} for r in rows]
    out = {"key": key, "dtmn": cfg["dtmn"], "source_url": cfg["url"], "domains": domains,
           "fetched": time.strftime("%Y-%m-%d"), "rows": rows}
    (RAW / f"{key}.json").write_text(json.dumps(out, ensure_ascii=False), encoding="utf-8")


def main():
    RAW.mkdir(parents=True, exist_ok=True)
    for key, cfg in LAYERS.items():
        try:
            fetch(key, cfg)
        except Exception as e:
            print(f"!! {key} failed: {e}")


if __name__ == "__main__":
    main()
