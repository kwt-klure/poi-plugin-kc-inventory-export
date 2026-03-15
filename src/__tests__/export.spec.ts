import {
  buildEquipmentCsvFromPoiState,
  buildInventoryJsonFromPoiState,
  buildShipCsvFromPoiState,
  exportEquipmentCsvToFile,
  exportInventoryJsonToFile,
  exportShipCsvToFile,
  getEquipmentCsvFileName,
  getInventoryJsonFileName,
  getShipCsvFileName,
  INVENTORY_JSON_SCHEMA_VERSION,
  SHIP_CSV_HEADERS,
} from '../export'
import type { PoiState } from '../poi/types'

const basePoiState: PoiState = {
  ui: { activeMainTab: '' },
  plugins: [],
  info: {
    ships: {
      '2001': {
        api_id: 2001,
        api_ship_id: 900,
        api_deck_id: 1,
        api_sally_area: 0,
        api_soku: 10,
        api_lv: 99,
        api_cond: 49,
        api_karyoku: 67,
        api_raisou: 0,
        api_taiku: 84,
        api_soukou: 79,
        api_lucky: 22,
        api_kyouka: [67, 0, 44, 37, 2],
        api_kaihi: 80,
        api_taisen: 0,
        api_sakuteki: 95,
        api_slot: [1001, 1002, 0, -1],
        api_slot_ex: 1004,
        api_locked: 1,
        api_nowhp: 77,
        api_maxhp: 77,
        api_ndock_time: 0,
      },
      '2002': {
        api_id: 2002,
        api_ship_id: 901,
        api_soku: 10,
        api_lv: 12,
        api_cond: 40,
        api_karyoku: 30,
        api_raisou: 59,
        api_taiku: 42,
        api_soukou: 31,
        api_lucky: 14,
        api_kyouka: [5, 20, 7, 6, 4],
        api_kaihi: 52,
        api_taisen: 72,
        api_sakuteki: 18,
        api_slot: [],
        api_locked: 0,
        api_nowhp: 11,
        api_maxhp: 15,
        api_ndock_time: 3600,
      },
    },
    equips: {
      '1001': {
        api_id: 1001,
        api_slotitem_id: 501,
        api_level: 7,
        api_alv: 3,
      },
      '1002': {
        api_id: 1002,
        api_slotitem_id: 502,
        api_alv: 0,
      },
      '1003': {
        api_id: 1003,
        api_slotitem_id: 999,
      },
      '1004': {
        api_id: 1004,
        api_slotitem_id: 503,
        api_level: 2,
      },
    },
    decks: [
      {
        api_id: 1,
        api_ship: [2001, -1, -1, -1, -1, -1],
      },
    ],
  },
  const: {
    $ships: {
      '900': {
        api_name: '赤城改二',
        api_yomi: 'あかぎ',
        api_stype: 11,
        api_aftershipid: 0,
        api_houg: [0, 67],
        api_raig: [0, 0],
        api_tyku: [40, 84],
        api_souk: [42, 79],
        api_luck: [20, 60],
      },
      '901': {
        api_name: '時雨改二',
        api_yomi: 'しぐれ',
        api_stype: 2,
        api_aftershipid: 902,
        api_houg: [12, 52],
        api_raig: [24, 84],
        api_tyku: [24, 72],
        api_souk: [14, 49],
        api_luck: [10, 59],
      },
      '902': {
        api_name: '時雨改三',
      },
    },
    $equips: {
      '501': {
        api_name: '零式艦戦52型',
        api_type: [0, 0, 6],
        api_saku: 0,
        api_houm: 2,
      },
      '502': {
        api_name: '烈風',
        api_type: [0, 0, 6],
        api_saku: 5,
        api_houm: 0,
      },
      '503': {
        api_name: 'Bofors 40mm四連装機関砲',
        api_type: [0, 0, 21],
        api_houm: 1,
      },
    },
    $shipTypes: {
      '2': {
        api_name: '駆逐艦',
      },
      '11': {
        api_name: '正規空母',
      },
    },
  },
}

describe('buildEquipmentCsvFromPoiState', () => {
  test('builds CSV rows with the expected headers and skips missing masters', () => {
    const csv = buildEquipmentCsvFromPoiState(basePoiState)

    expect(csv).toBe(
      [
        'ID (Instance),Master ID,裝備名稱,類別ID,改修值 (星),熟練度,索敵,命中',
        '1001,501,"零式艦戦52型",6,7,3,0,2',
        '1002,502,"烈風",6,0,0,5,0',
        '1004,503,"Bofors 40mm四連装機関砲",21,2,0,0,1',
      ].join('\n'),
    )
  })

  test('throws when poi state does not include equipment data', () => {
    expect(() =>
      buildEquipmentCsvFromPoiState({
        ui: { activeMainTab: '' },
        plugins: [],
      }),
    ).toThrow('Equipment data is not available in the current poi state.')
  })
})

describe('buildShipCsvFromPoiState', () => {
  test('builds ship CSV rows with Japanese ship names and equipment details', () => {
    const csv = buildShipCsvFromPoiState(basePoiState)
    const [header, firstRow, secondRow] = csv.split('\n')

    expect(header).toBe(SHIP_CSV_HEADERS.join(','))
    expect(firstRow).toBe(
      [
        '"2001"',
        '"赤城改二"',
        '"あかぎ"',
        '"1"',
        '"0"',
        '"正規空母"',
        '"10"',
        '"99"',
        '"49"',
        '"67"',
        '"67"',
        '"0"',
        '"67"',
        '"0"',
        '"0"',
        '"0"',
        '"0"',
        '"84"',
        '"84"',
        '"40"',
        '"84"',
        '"79"',
        '"79"',
        '"42"',
        '"79"',
        '"22"',
        '"22"',
        '"20"',
        '"60"',
        '"67"',
        '"0"',
        '"44"',
        '"37"',
        '"2"',
        '"80"',
        '"0"',
        '"95"',
        '"零式艦戦52型"',
        '"3"',
        '"7"',
        '"烈風"',
        '"0"',
        '"0"',
        '"NA"',
        '"NA"',
        '"NA"',
        '"NA"',
        '"NA"',
        '"NA"',
        '"Bofors 40mm四連装機関砲"',
        '"NA"',
        '"2"',
        '"1"',
        '"77"',
        '"77"',
        '"0"',
        '"0"',
        '"false"',
        '"NA"',
      ].join(','),
    )

    expect(secondRow).toBe(
      [
        '"2002"',
        '"時雨改二"',
        '"しぐれ"',
        '"-1"',
        '"0"',
        '"駆逐艦"',
        '"10"',
        '"12"',
        '"40"',
        '"30"',
        '"17"',
        '"12"',
        '"52"',
        '"59"',
        '"44"',
        '"24"',
        '"84"',
        '"42"',
        '"31"',
        '"24"',
        '"72"',
        '"31"',
        '"20"',
        '"14"',
        '"49"',
        '"14"',
        '"14"',
        '"10"',
        '"59"',
        '"5"',
        '"20"',
        '"7"',
        '"6"',
        '"4"',
        '"52"',
        '"72"',
        '"18"',
        '"NA"',
        '"NA"',
        '"NA"',
        '"NA"',
        '"NA"',
        '"NA"',
        '"NA"',
        '"NA"',
        '"NA"',
        '"NA"',
        '"NA"',
        '"NA"',
        '"NA"',
        '"NA"',
        '"NA"',
        '"0"',
        '"11"',
        '"15"',
        '"4"',
        '"3600"',
        '"true"',
        '"時雨改三"',
      ].join(','),
    )
  })

  test('throws when poi state does not include ship data', () => {
    expect(() =>
      buildShipCsvFromPoiState({
        ui: { activeMainTab: '' },
        plugins: [],
      }),
    ).toThrow('Ship data is not available in the current poi state.')
  })
})

describe('buildInventoryJsonFromPoiState', () => {
  test('builds a normalized inventory snapshot with Japanese master names', () => {
    const json = buildInventoryJsonFromPoiState(
      basePoiState,
      new Date(2026, 2, 12, 9, 10, 11),
    )
    const snapshot = JSON.parse(json)

    expect(snapshot.schema_version).toBe(INVENTORY_JSON_SCHEMA_VERSION)
    expect(snapshot.exported_at).toMatch(
      /^2026-03-12T09:10:11[+-]\d{2}:\d{2}$/,
    )
    expect(snapshot.source).toEqual({
      package_name: 'poi-plugin-kc-equipment-export',
      plugin_title: 'KC Inventory Export',
      plugin_version: '0.1.3',
      format: 'normalized_json',
    })
    expect(snapshot.fleets).toEqual([
      {
        fleet_id: 1,
        ship_instance_ids: [2001, null, null, null, null, null],
      },
    ])
    expect(snapshot.ships).toEqual([
      {
        instance_id: 2001,
        ship_id: 900,
        name_ja: '赤城改二',
        yomi: 'あかぎ',
        type_id: 11,
        type_name_ja: '正規空母',
        level: 99,
        condition: 49,
        speed: 10,
        locked: true,
        fleet_id: 1,
        sortie_area: 0,
        hp_now: 77,
        hp_max: 77,
        hp_lost: 0,
        ndock_time: 0,
        in_ndock: false,
        next_remodel_ship_id: null,
        next_remodel_name_ja: null,
        stats: {
          firepower: 67,
          torpedo: 0,
          anti_air: 84,
          armor: 79,
          luck: 22,
          evasion: 80,
          anti_submarine: 0,
          line_of_sight: 95,
        },
        naked_stats: {
          firepower: 67,
          torpedo: 0,
          anti_air: 84,
          armor: 79,
          luck: 22,
        },
        master_stats: {
          firepower: { initial: 0, max: 67 },
          torpedo: { initial: 0, max: 0 },
          anti_air: { initial: 40, max: 84 },
          armor: { initial: 42, max: 79 },
          luck: { initial: 20, max: 60 },
        },
        enhancement_bonus: {
          firepower: 67,
          torpedo: 0,
          anti_air: 44,
          armor: 37,
          luck: 2,
        },
        slot_instance_ids: [1001, 1002, null, null],
        extra_slot_instance_id: 1004,
      },
      {
        instance_id: 2002,
        ship_id: 901,
        name_ja: '時雨改二',
        yomi: 'しぐれ',
        type_id: 2,
        type_name_ja: '駆逐艦',
        level: 12,
        condition: 40,
        speed: 10,
        locked: false,
        fleet_id: null,
        sortie_area: 0,
        hp_now: 11,
        hp_max: 15,
        hp_lost: 4,
        ndock_time: 3600,
        in_ndock: true,
        next_remodel_ship_id: 902,
        next_remodel_name_ja: '時雨改三',
        stats: {
          firepower: 30,
          torpedo: 59,
          anti_air: 42,
          armor: 31,
          luck: 14,
          evasion: 52,
          anti_submarine: 72,
          line_of_sight: 18,
        },
        naked_stats: {
          firepower: 17,
          torpedo: 44,
          anti_air: 31,
          armor: 20,
          luck: 14,
        },
        master_stats: {
          firepower: { initial: 12, max: 52 },
          torpedo: { initial: 24, max: 84 },
          anti_air: { initial: 24, max: 72 },
          armor: { initial: 14, max: 49 },
          luck: { initial: 10, max: 59 },
        },
        enhancement_bonus: {
          firepower: 5,
          torpedo: 20,
          anti_air: 7,
          armor: 6,
          luck: 4,
        },
        slot_instance_ids: [],
        extra_slot_instance_id: null,
      },
    ])
    expect(snapshot.equipments).toEqual([
      {
        instance_id: 1001,
        equip_id: 501,
        name_ja: '零式艦戦52型',
        type_id: 6,
        improvement: 7,
        proficiency: 3,
        stats: {
          line_of_sight: 0,
          accuracy: 2,
        },
        equipped_on_ship_instance_id: 2001,
        slot_index: 0,
        is_extra_slot: false,
      },
      {
        instance_id: 1002,
        equip_id: 502,
        name_ja: '烈風',
        type_id: 6,
        improvement: 0,
        proficiency: 0,
        stats: {
          line_of_sight: 5,
          accuracy: 0,
        },
        equipped_on_ship_instance_id: 2001,
        slot_index: 1,
        is_extra_slot: false,
      },
      {
        instance_id: 1003,
        equip_id: 999,
        name_ja: null,
        type_id: null,
        improvement: 0,
        proficiency: null,
        stats: {
          line_of_sight: null,
          accuracy: null,
        },
        equipped_on_ship_instance_id: null,
        slot_index: null,
        is_extra_slot: false,
      },
      {
        instance_id: 1004,
        equip_id: 503,
        name_ja: 'Bofors 40mm四連装機関砲',
        type_id: 21,
        improvement: 2,
        proficiency: null,
        stats: {
          line_of_sight: 0,
          accuracy: 1,
        },
        equipped_on_ship_instance_id: 2001,
        slot_index: null,
        is_extra_slot: true,
      },
    ])
  })

  test('throws when poi state does not include inventory data', () => {
    expect(() =>
      buildInventoryJsonFromPoiState({
        ui: { activeMainTab: '' },
        plugins: [],
      }),
    ).toThrow('Inventory data is not available in the current poi state.')
  })
})

describe('getEquipmentCsvFileName', () => {
  test('uses local YYYY-MM-DD formatting', () => {
    expect(getEquipmentCsvFileName(new Date(2026, 2, 12))).toBe(
      'kancolle_equips_2026-03-12.csv',
    )
  })
})

describe('getShipCsvFileName', () => {
  test('uses local YY-MM-DD formatting', () => {
    expect(getShipCsvFileName(new Date(2026, 2, 12))).toBe(
      'kancolle_kan_26-03-12.csv',
    )
  })
})

describe('getInventoryJsonFileName', () => {
  test('uses local YYYY-MM-DD formatting', () => {
    expect(getInventoryJsonFileName(new Date(2026, 2, 12))).toBe(
      'kancolle_inventory_2026-03-12.json',
    )
  })
})

describe('exportEquipmentCsvToFile', () => {
  const originalPoiVersion = (globalThis as { POI_VERSION?: string }).POI_VERSION
  const originalRemote = (globalThis as { remote?: unknown }).remote

  beforeEach(() => {
    ;(globalThis as { POI_VERSION?: string }).POI_VERSION = 'test'
  })

  afterEach(() => {
    if (originalPoiVersion == null) {
      delete (globalThis as { POI_VERSION?: string }).POI_VERSION
    } else {
      ;(globalThis as { POI_VERSION?: string }).POI_VERSION = originalPoiVersion
    }

    if (originalRemote == null) {
      delete (globalThis as { remote?: unknown }).remote
    } else {
      ;(globalThis as { remote?: unknown }).remote = originalRemote
    }

    jest.restoreAllMocks()
  })

  test('writes UTF-8 BOM CSV via poi save dialog', async () => {
    const writeFileSync = jest.fn()
    const showSaveDialog = jest.fn().mockResolvedValue({
      canceled: false,
      filePath: '/tmp/kancolle_equips_2026-03-12.csv',
    })

    ;(globalThis as { remote?: unknown }).remote = {
      app: { getPath: jest.fn().mockReturnValue('/documents') },
      dialog: { showSaveDialog },
      require: jest.fn().mockReturnValue({ writeFileSync }),
    }

    const saved = await exportEquipmentCsvToFile(
      'header\nrow',
      new Date(2026, 2, 12),
    )

    expect(saved).toBe(true)
    expect(showSaveDialog).toHaveBeenCalledWith({
      defaultPath: '/documents/kancolle_equips_2026-03-12.csv',
      filters: [{ name: 'CSV', extensions: ['csv'] }],
    })
    expect(writeFileSync).toHaveBeenCalledWith(
      '/tmp/kancolle_equips_2026-03-12.csv',
      '\uFEFFheader\nrow',
    )
  })

  test('returns false when the user cancels the save dialog', async () => {
    ;(globalThis as { remote?: unknown }).remote = {
      app: { getPath: jest.fn().mockReturnValue('/documents') },
      dialog: {
        showSaveDialog: jest.fn().mockResolvedValue({ canceled: true }),
      },
      require: jest.fn(),
    }

    await expect(
      exportEquipmentCsvToFile('header', new Date(2026, 2, 12)),
    ).resolves.toBe(false)
  })
})

describe('exportShipCsvToFile', () => {
  const originalPoiVersion = (globalThis as { POI_VERSION?: string }).POI_VERSION
  const originalRemote = (globalThis as { remote?: unknown }).remote

  beforeEach(() => {
    ;(globalThis as { POI_VERSION?: string }).POI_VERSION = 'test'
  })

  afterEach(() => {
    if (originalPoiVersion == null) {
      delete (globalThis as { POI_VERSION?: string }).POI_VERSION
    } else {
      ;(globalThis as { POI_VERSION?: string }).POI_VERSION = originalPoiVersion
    }

    if (originalRemote == null) {
      delete (globalThis as { remote?: unknown }).remote
    } else {
      ;(globalThis as { remote?: unknown }).remote = originalRemote
    }

    jest.restoreAllMocks()
  })

  test('writes UTF-8 BOM ship CSV via poi save dialog', async () => {
    const writeFileSync = jest.fn()
    const showSaveDialog = jest.fn().mockResolvedValue({
      canceled: false,
      filePath: '/tmp/kancolle_kan_26-03-12.csv',
    })

    ;(globalThis as { remote?: unknown }).remote = {
      app: { getPath: jest.fn().mockReturnValue('/documents') },
      dialog: { showSaveDialog },
      require: jest.fn().mockReturnValue({ writeFileSync }),
    }

    const saved = await exportShipCsvToFile('header\nrow', new Date(2026, 2, 12))

    expect(saved).toBe(true)
    expect(showSaveDialog).toHaveBeenCalledWith({
      defaultPath: '/documents/kancolle_kan_26-03-12.csv',
      filters: [{ name: 'CSV', extensions: ['csv'] }],
    })
    expect(writeFileSync).toHaveBeenCalledWith(
      '/tmp/kancolle_kan_26-03-12.csv',
      '\uFEFFheader\nrow',
    )
  })
})

describe('exportInventoryJsonToFile', () => {
  const originalPoiVersion = (globalThis as { POI_VERSION?: string }).POI_VERSION
  const originalRemote = (globalThis as { remote?: unknown }).remote

  beforeEach(() => {
    ;(globalThis as { POI_VERSION?: string }).POI_VERSION = 'test'
  })

  afterEach(() => {
    if (originalPoiVersion == null) {
      delete (globalThis as { POI_VERSION?: string }).POI_VERSION
    } else {
      ;(globalThis as { POI_VERSION?: string }).POI_VERSION = originalPoiVersion
    }

    if (originalRemote == null) {
      delete (globalThis as { remote?: unknown }).remote
    } else {
      ;(globalThis as { remote?: unknown }).remote = originalRemote
    }

    jest.restoreAllMocks()
  })

  test('writes normalized JSON without a BOM via poi save dialog', async () => {
    const writeFileSync = jest.fn()
    const showSaveDialog = jest.fn().mockResolvedValue({
      canceled: false,
      filePath: '/tmp/kancolle_inventory_2026-03-12.json',
    })

    ;(globalThis as { remote?: unknown }).remote = {
      app: { getPath: jest.fn().mockReturnValue('/documents') },
      dialog: { showSaveDialog },
      require: jest.fn().mockReturnValue({ writeFileSync }),
    }

    const saved = await exportInventoryJsonToFile(
      '{\n  "schema_version": "inventory_snapshot_v1"\n}',
      new Date(2026, 2, 12),
    )

    expect(saved).toBe(true)
    expect(showSaveDialog).toHaveBeenCalledWith({
      defaultPath: '/documents/kancolle_inventory_2026-03-12.json',
      filters: [{ name: 'JSON', extensions: ['json'] }],
    })
    expect(writeFileSync).toHaveBeenCalledWith(
      '/tmp/kancolle_inventory_2026-03-12.json',
      '{\n  "schema_version": "inventory_snapshot_v1"\n}',
    )
  })
})
