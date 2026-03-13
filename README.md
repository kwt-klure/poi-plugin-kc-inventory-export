# poi-plugin-kc-equipment-export

`poi-plugin-kc-equipment-export` is a lightweight [poi](https://github.com/poooi/poi) plugin that exports your current KanColle ship and equipment inventory as CSV files or normalized JSON.

The package name stays the same for compatibility, but the current plugin title in Poi is `KC Inventory Export`.

## Overview

This plugin replaces manual DevTools snippets with a Poi UI that exports:

- ship CSV
- equipment CSV
- inventory JSON
- both files in one run

Design goals:

- read Poi state only when export is clicked
- avoid reactive inventory subscriptions
- write Excel-friendly UTF-8 BOM CSV files
- write machine-friendly normalized JSON without a BOM
- keep ship and equipment names in Japanese master-data naming

## Exported Files

### Ship CSV

Default filename:

- `kancolle_kan_YY-MM-DD.csv`

Current output shape:

- 59 columns
- includes:
  - ship instance ID
  - Japanese ship name
  - reading
  - fleet membership
  - sortie area
  - stats
  - equipped items
  - extra slot item
  - lock / HP / repair state
  - next remodel name

### Equipment CSV

Default filename:

- `kancolle_equips_YYYY-MM-DD.csv`

Current output shape:

- `ID (Instance)`
- `Master ID`
- `裝備名稱`
- `類別ID`
- `改修值 (星)`
- `熟練度`
- `索敵`
- `命中`

### Inventory JSON

Default filename:

- `kancolle_inventory_YYYY-MM-DD.json`

Current output shape:

- top-level `schema_version`, `exported_at`, `source`
- normalized `fleets`, `ships`, and `equipments` arrays
- ship and equipment relationships expressed via instance/master IDs
- schema version is currently `inventory_snapshot_v1`
- uses `null` for missing values instead of `NA`
- keeps ship and equipment names in Japanese master-data naming

## Build

```sh
cd /path/to/repo
npm install
npm run build
npm pack --pack-destination dist --cache "$TMPDIR/poi-inventory-export-cache"
```

`npm run build` currently runs type checking so the package can be validated before packing.

## Install

Install into Poi using its own plugin npm directory. Do not symlink plugin folders into Poi `node_modules`.

```sh
cd "/path/to/poi/plugins"
npm install "/path/to/repo/dist/poi-plugin-kc-equipment-export-0.17.1.tgz"
```

To remove it:

```sh
cd "/path/to/poi/plugins"
npm uninstall poi-plugin-kc-equipment-export
```

## Use

1. Start Poi and let game data finish loading.
2. Open `KC Inventory Export`.
3. Choose one action:
   `Export ship + equipment CSVs`
   `Export ship CSV`
   `Export inventory JSON`
   `Export equipment CSV`
4. Pick save locations in Poi's file dialog.

## Validation Checklist

Recommended validation order:

1. Poi boots normally.
2. The plugin opens normally.
3. Each export action opens the save dialog.
4. Ship CSV contains the expected 59 columns and the expected ship count.
5. Equipment CSV contains the expected 8 columns and the expected equipment count.
6. Inventory JSON contains `fleets`, `ships`, and `equipments` with stable IDs.
7. Canceling any save dialog exits cleanly without freezing Poi.
