# KC Inventory Export

`KC Inventory Export` is a standalone [Poi](https://github.com/poooi/poi) plugin for exporting your current KanColle inventory into machine-friendly files.

For Poi compatibility, the npm package name remains `poi-plugin-kc-equipment-export`.

## What it does

- Export ship inventory as CSV
- Export equipment inventory as CSV
- Export a normalized inventory snapshot as JSON
- Export ship CSV and equipment CSV together from one button
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

Poi plugins should be installed through Poi's own plugin npm directory.
Do not symlink this repo into Poi `node_modules`.

### 1. Build a tarball

```sh
cd /path/to/poi-plugin-kc-inventory-export
npm install
npm run build
npm pack --pack-destination dist --cache "$TMPDIR/poi-inventory-export-cache"
```

This creates a tarball like:

```text
dist/poi-plugin-kc-equipment-export-0.1.3.tgz
```

### 2. Install into Poi

```sh
cd "/path/to/poi/plugins"
npm install "/path/to/poi-plugin-kc-inventory-export/dist/poi-plugin-kc-equipment-export-0.1.3.tgz"
```

On macOS, Poi's plugin directory is usually:

```text
~/Library/Application Support/poi/plugins
```

### 3. Restart Poi

After installation, restart Poi and open:

```text
KC Inventory Export
```

## Update

When you update the plugin:

1. pull the latest code
2. rebuild the tarball
3. reinstall the new `.tgz` into Poi's plugin directory
4. restart Poi

Example:

```sh
cd /path/to/poi-plugin-kc-inventory-export
npm install
npm run build
npm pack --pack-destination dist --cache "$TMPDIR/poi-inventory-export-cache"

cd "/path/to/poi/plugins"
npm install "/path/to/poi-plugin-kc-inventory-export/dist/poi-plugin-kc-equipment-export-0.1.3.tgz"
```

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

## Development

```sh
cd /path/to/poi-plugin-kc-inventory-export
npm install
npm run typeCheck
npm test -- --runInBand
```

## Notes

- The plugin reads Poi state only when an export action is clicked.
- The UI follows Poi / Blueprint light-dark theme behavior.
- CSV output is written with UTF-8 BOM for spreadsheet compatibility.
- JSON output is written without BOM for easier machine parsing.
