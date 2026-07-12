# KC Inventory Export

`KC Inventory Export` is a standalone [Poi](https://github.com/poooi/poi) plugin for exporting your current KanColle inventory into machine-friendly files.

For Poi compatibility, the npm package name remains `poi-plugin-kc-equipment-export`.

## What it does

- Export ship inventory as CSV
- Export equipment inventory as CSV
- Export a normalized inventory snapshot as JSON
- Export ship CSV and equipment CSV together from one button
- Auto-refresh ship CSV, equipment CSV, and inventory JSON into a fixed local folder whenever Poi inventory state changes
- Keep ship and equipment names in Japanese master-data naming

## Export formats

### Ship CSV

Default filename:

- `kancolle_kan_YY-MM-DD.csv`

Current output includes:

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

Current columns:

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

Current shape:

- top-level `schema_version`, `exported_at`, `source`
- normalized `fleets`, `ships`, and `equipments`
- ID-based links between ships and equipments
- `null` for missing values
- schema version `inventory_snapshot_v1`

## Install

Install the npm package through Poi's plugin manager using:

```text
poi-plugin-kc-equipment-export
```

For a direct npm install, run this from Poi's plugin directory:

```sh
npm install poi-plugin-kc-equipment-export@latest
```

On macOS, Poi's plugin directory is usually:

```text
~/Library/Application Support/poi/plugins
```

Restart Poi after installation. Do not symlink this repository into Poi
`node_modules`.

### Local development install

For unreleased development builds, create and install a tarball:

```sh
cd /path/to/poi-plugin-kc-inventory-export
npm install
npm run build
npm pack --pack-destination dist --cache "$TMPDIR/poi-inventory-export-cache"

cd "/path/to/poi/plugins"
npm install "/path/to/poi-plugin-kc-inventory-export/dist/poi-plugin-kc-equipment-export-VERSION.tgz"
```

## Update

Use Poi's plugin update flow, or update directly from Poi's plugin directory:

```sh
npm install poi-plugin-kc-equipment-export@latest
```

Restart Poi after the package is updated.

## Uninstall

```sh
cd "/path/to/poi/plugins"
npm uninstall poi-plugin-kc-equipment-export
```

## Usage

1. Start Poi and let game data finish loading.
2. Open `KC Inventory Export`.
3. Choose one action:
   - `Export ship + equipment CSVs`
   - `Export ship CSV`
   - `Export inventory JSON`
   - `Export equipment CSV`
4. Choose save locations in Poi's file dialog.

Background auto-export also keeps these files in:

```text
~/Documents/Mira-Workspace/archive/poi-inventory-exports
```

If that archive lane is unavailable, for example because `archive` points to an
unmounted external volume, the plugin writes the same files to:

```text
~/Documents/Mira-Workspace/local-fallback/poi-inventory-exports
```

The plugin refreshes the same-day ship CSV, equipment CSV, and inventory JSON files in that folder whenever Poi inventory state changes.

## Development

```sh
cd /path/to/poi-plugin-kc-inventory-export
npm install
npm run typeCheck
npm test -- --runInBand
```

## Notes

- The plugin reads Poi inventory state for manual exports and watches relevant
  inventory references for debounced background refreshes while Poi is running.
- The UI follows Poi / Blueprint light-dark theme behavior.
- CSV output is written with UTF-8 BOM for spreadsheet compatibility.
- JSON output is written without BOM for easier machine parsing.
