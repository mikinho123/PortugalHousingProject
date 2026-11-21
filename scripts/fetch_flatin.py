"""Download flatin.pt's 'barómetro da construção': building applications submitted to councils.

Counts per municipality and period (month and year), split into new build / alteration-extension /
prior information (PIP) / unclassified. Partial coverage: only councils that publish open layers.
"""
import pathlib

import requests

ROOT = pathlib.Path(__file__).resolve().parents[1]
RAW = ROOT / "data" / "raw" / "flatin"
BASE = "https://flatin.pt/api/v1/barometer/series.csv"
HEADERS = {"User-Agent": "obras-pt data fetcher"}


def main():
    RAW.mkdir(parents=True, exist_ok=True)
    for name, params in {"monthly": {}, "yearly": {"granularity": "year"}}.items():
        r = requests.get(BASE, params=params, headers=HEADERS, timeout=120)
        r.raise_for_status()
        (RAW / f"{name}.csv").write_bytes(r.content)
        print(f"{name}: {r.content.count(b'\n') - 1} rows")


if __name__ == "__main__":
    main()
