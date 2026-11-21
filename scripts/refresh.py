"""Refresh all data sources and rebuild web/data — safely.

Used by the monthly GitHub Actions workflow, and fine to run by hand:
    python scripts/refresh.py

Rules
- Each source is fetched independently; one failing source does not stop the others.
- If a source fails and there is no earlier raw copy of it, the rebuild is skipped
  (the published data stays as it was) and the script exits with an error.
- After rebuilding, sanity checks compare the new web/data with the previous one.
  If they fail, the previous files are restored.
Boundaries (CAOP) are not refreshed here: they change rarely; run fetch_boundaries.py by hand.
"""
import json
import pathlib
import shutil
import subprocess
import sys
import tempfile

ROOT = pathlib.Path(__file__).resolve().parents[1]
RAW = ROOT / "data" / "raw"
WEB = ROOT / "web" / "data"
PY = sys.executable

STEPS = [
    ("INE", [PY, "scripts/fetch_ine.py", "--refresh"], lambda: any((RAW / "ine").glob("*/2025.json"))),
    ("flatin.pt", [PY, "scripts/fetch_flatin.py"], lambda: (RAW / "flatin" / "yearly.csv").exists()),
    ("council layers", [PY, "scripts/fetch_municipal.py"], lambda: all((RAW / "municipal" / f"{k}.json").exists() for k in ("matosinhos", "paredes", "lousa"))),
]


def run(name, cmd):
    print(f"\n=== {name}: {' '.join(cmd[1:])}", flush=True)
    r = subprocess.run(cmd, cwd=ROOT)
    return r.returncode == 0


def summary(path):
    d = json.loads((path / "ine.json").read_text(encoding="utf-8"))
    m = json.loads((path / "municipal.json").read_text(encoding="utf-8"))
    return {"years": d["years"], "munis": len(d["municipios"]), "councils": len(m["concelhos"])}


def main():
    problems = []
    for name, cmd, have_raw in STEPS:
        ok = run(name, cmd)
        # fetch_municipal prints failures but exits 0, so also check for the raw files.
        if not ok or not have_raw():
            if have_raw():
                print(f"!! {name} failed — keeping the previous raw data for it")
            else:
                problems.append(f"{name}: fetch failed and no earlier raw data exists")

    if problems:
        print("\nNot rebuilding:\n  " + "\n  ".join(problems))
        sys.exit(1)

    backup = pathlib.Path(tempfile.mkdtemp()) / "data"
    shutil.copytree(WEB, backup)
    before = summary(backup)
    if not run("build", [PY, "scripts/build_data.py"]):
        shutil.rmtree(WEB); shutil.copytree(backup, WEB)
        print("!! build failed — previous web/data restored")
        sys.exit(1)

    after = summary(WEB)
    checks = [
        (after["munis"] == 308, f"expected 308 municipalities, got {after['munis']}"),
        (after["years"][0] == before["years"][0], "first year changed"),
        (after["years"][-1] >= before["years"][-1], "latest year went backwards"),
        (after["councils"] >= before["councils"] - 1, "lost more than one council"),
    ]
    failed = [msg for ok, msg in checks if not ok]
    if failed:
        shutil.rmtree(WEB); shutil.copytree(backup, WEB)
        print("!! sanity checks failed — previous web/data restored:\n  " + "\n  ".join(failed))
        sys.exit(1)
    print(f"\nOK: {before} -> {after}")


if __name__ == "__main__":
    main()
