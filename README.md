# Obras em Portugal

Interactive map and charts showing building permits (licenciamento) and completed works in Portugal: new construction vs. renovation, by municipality (concelho), district and parish, 2002–2025. For the councils that publish open data, it also shows applications submitted, their outcomes (approved/rejected) and change-of-use applications.

## Run

```sh
cd web
python -m http.server 8765
# open http://127.0.0.1:8765/
```

The URL hash keeps the view state, e.g. `#ano=2024&ind=ren_share&un=pop&lang=en&concelho=1308`
(`un` = units: `abs`, `pop` per 1,000 residents, `dw` per 1,000 dwellings, `bld` per 1,000 residential buildings).
Language (PT/EN) and theme (light/dark) toggles sit top right and are remembered in the browser.

## Refresh the data

```sh
python -m venv .venv && .venv/Scripts/pip install -r requirements.txt
.venv/Scripts/python scripts/fetch_ine.py --refresh   # INE indicators (cached per year in data/raw/ine)
.venv/Scripts/python scripts/fetch_flatin.py          # applications submitted (flatin.pt)
.venv/Scripts/python scripts/fetch_municipal.py       # council open layers (status, change of use)
.venv/Scripts/python scripts/fetch_boundaries.py      # CAOP2025 boundaries -> web/data/municipios.topo.json
.venv/Scripts/python scripts/build_data.py            # -> web/data/*.json
```

## Sources and coverage

| What | Source | Coverage |
|---|---|---|
| Licensed buildings by type of work (new, enlargement, alteration, reconstruction, demolition) | INE 0013242 | all 308 municipalities, 2002–2025 |
| Licensed buildings, new vs. renovation × housing vs. other use | INE 0013234 | municipalities and parishes, 2002–2025 |
| Completed buildings (same splits) | INE 0008330, 0008320 | municipalities, 2011–2025 (2024–25 estimates) |
| Dwellings licensed in new construction, by typology | INE 0013235 | municipalities, 2002–2025 |
| Applications submitted to the council | flatin.pt barometer | Lisboa, Porto, Matosinhos, Lousã (monthly); + Ovar, Póvoa de Varzim, Valongo, Gaia (yearly) |
| Application outcomes | council open layers | Matosinhos, Paredes, Lousã |
| Change of use (alteração de utilização) | council open layers | Matosinhos (with the new use), Paredes |
| Resident population (31 Dec) | INE 0000611 (2002–10), 0008273 (2011–20), 0012918 (2021–25) | municipalities |
| Housing stock: dwellings / residential buildings | INE 0000084 + 0014137 / 0000083 + 0014136 | municipalities, 2002–2022 |
| Boundaries | DGT CAOP2025 | all |

### Caveats

- INE counts **buildings**, while council data counts **processes**. The two can't be compared directly.
- INE doesn't publish rejected applications or changes of use. Its "destino" is the use *after* the work.
- Outcomes are each process's *current* state, grouped by year of entry. Recent years therefore show many pending processes.
- Matosinhos groups preliminary rejections and refusals together.
- Population has a series break in 2021 (estimates revised on the 2021 Census). Housing stock ends in 2022, so rates for 2023–2025 use the 2022 stock, and the app says so.
- Per-1,000 units apply to INE counts only. Council data stay absolute.
- The council fetch requests only categorical fields (type, use, status, date). Names, tax numbers and addresses are never downloaded.
- Before publishing, check the licence/terms of flatin.pt and each council layer.
