"""Download official CAOP2025 municipality boundaries (DGT) and build a light TopoJSON.

Mainland municipalities come from the DGT OGC API; the Azores and Madeira only exist
as GeoPackage downloads. Borders are simplified as shared arcs (topojson), so
neighbouring municipalities stay gap-free.
Output: web/data/municipios.topo.json, with an object "municipios" (props: dtmn, nome, distrito).
"""
import io
import json
import pathlib
import sqlite3
import struct
import zipfile

import requests
import shapely
import topojson
from shapely import wkb
from shapely.geometry import mapping, shape

ROOT = pathlib.Path(__file__).resolve().parents[1]
RAW = ROOT / "data" / "raw" / "caop"
OUT = ROOT / "web" / "data" / "municipios.topo.json"
HEADERS = {"User-Agent": "obras-pt data fetcher"}

OGC = "https://ogcapi.dgterritorio.gov.pt/collections/municipios/items"
GPKG = {
    "raa": "https://geo2.dgterritorio.gov.pt/caop/CAOP_RAA_2025-gpkg.zip",
    "ram": "https://geo2.dgterritorio.gov.pt/caop/CAOP_RAM_2025-gpkg.zip",
}


def mainland():
    cache = RAW / "continente.geojson"
    if cache.exists():
        return json.loads(cache.read_text(encoding="utf-8"))["features"]
    feats, offset = [], 0
    while True:
        r = requests.get(OGC, params={"f": "json", "limit": 20, "offset": offset}, headers=HEADERS, timeout=300)
        r.raise_for_status()
        batch = r.json()["features"]
        if not batch:
            break
        feats += batch
        offset += len(batch)
        print(f"  mainland: {offset}")
    cache.write_text(json.dumps({"type": "FeatureCollection", "features": feats}), encoding="utf-8")
    return feats


def gpkg_geom(blob):
    """GeoPackage geometry blob -> shapely geometry (skip the GP header + envelope)."""
    flags = blob[3]
    env_len = {0: 0, 1: 32, 2: 48, 3: 48, 4: 64}[(flags >> 1) & 0b111]
    return wkb.loads(bytes(blob[8 + env_len:]))


def islands(key):
    """Yield (record, geometry, srs) for every municipality in every GeoPackage of the archive."""
    zpath = RAW / f"{key}.zip"
    if not zpath.exists():
        print(f"  downloading {key} gpkg")
        r = requests.get(GPKG[key], headers=HEADERS, timeout=600)
        r.raise_for_status()
        zpath.write_bytes(r.content)
    with zipfile.ZipFile(zpath) as z:
        names = [n for n in z.namelist() if n.endswith(".gpkg")]
        for name in names:
            gpath = RAW / pathlib.Path(name).name
            if not gpath.exists():
                gpath.write_bytes(z.read(name))
            con = sqlite3.connect(gpath)
            table, srs, geom_col = con.execute(
                "select table_name, srs_id, column_name from gpkg_geometry_columns where table_name like '%municipios'").fetchone()
            cols = [r[1] for r in con.execute(f'pragma table_info("{table}")')]
            for row in con.execute(f'select * from "{table}"'):
                rec = dict(zip(cols, row))
                yield rec, gpkg_geom(rec.pop(geom_col)), srs
            con.close()


def to_wgs84(geom, srs):
    if srs == 4326:
        return geom
    from pyproj import Transformer  # only needed if the gpkg is projected

    t = Transformer.from_crs(srs, 4326, always_xy=True)
    return shapely.transform(geom, lambda xy: __import__("numpy").column_stack(t.transform(xy[:, 0], xy[:, 1])))


def main():
    RAW.mkdir(parents=True, exist_ok=True)
    out = []
    for f in mainland():
        p = f["properties"]
        out.append({"type": "Feature", "properties": {"dtmn": p["dtmn"], "nome": p["municipio"], "distrito": p["distrito_ilha"]},
                    "geometry": f["geometry"]})
    for key in GPKG:
        for rec, g, srs in islands(key):
            low = {k.lower(): v for k, v in rec.items()}
            dtmn = str(low.get("dtmn") or low.get("dtmn_cod") or "").zfill(4)
            nome = low.get("municipio") or low.get("concelho")
            distrito = low.get("distrito_ilha") or low.get("ilha") or ("Açores" if key == "raa" else "Madeira")
            out.append({"type": "Feature", "properties": {"dtmn": dtmn, "nome": nome, "distrito": distrito},
                        "geometry": mapping(to_wgs84(g, srs))})
    print(f"total municipalities: {len(out)}")
    # d3-geo wants exterior rings clockwise *on screen* (y down) = counter-clockwise in lon/lat (shapely sign=+1).
    for f in out:
        g = shape(f["geometry"])
        polys = [shapely.geometry.polygon.orient(pg, sign=1.0) for pg in getattr(g, "geoms", [g])]
        f["geometry"] = mapping(shapely.MultiPolygon(polys))
    fc = {"type": "FeatureCollection", "features": out}
    topo = topojson.Topology(fc, object_name="municipios", prequantize=1e6, toposimplify=0.0015, presimplify=False)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(topo.to_json(), encoding="utf-8")
    print(f"wrote {OUT} ({OUT.stat().st_size/1e6:.2f} MB)")


if __name__ == "__main__":
    main()
