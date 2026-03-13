import PKG from '../package.json'
import type {
  PoiEquipment,
  PoiEquipmentMaster,
  PoiFleet,
  PoiShip,
  PoiShipMaster,
  PoiShipStat,
  PoiShipTypeMaster,
  PoiState,
} from './poi/types'

export const EQUIPMENT_CSV_HEADERS = [
  'ID (Instance)',
  'Master ID',
  '裝備名稱',
  '類別ID',
  '改修值 (星)',
  '熟練度',
  '索敵',
  '命中',
] as const

export const SHIP_CSV_HEADERS = [
  '艦 ID',
  '艦名',
  '假名',
  '艦隊',
  '出擊海域',
  '艦種',
  '速力',
  '等級',
  '狀態',
  '火力',
  '裸裝火力',
  '裸裝初始火力',
  '裸裝最大火力',
  '雷裝',
  '裸裝雷裝',
  '裸裝初始雷裝',
  '裸裝最大雷裝',
  '對空',
  '裸裝對空',
  '裸裝初始對空',
  '裸裝最大對空',
  '裝甲',
  '裸裝裝甲',
  '裸裝初始裝甲',
  '裸裝最大裝甲',
  '幸運',
  '裸裝幸運',
  '裸裝初始幸運',
  '裸裝最大幸運',
  '火力改修',
  '雷裝改修',
  '對空改修',
  '裝甲改修',
  '幸運改修',
  '迴避',
  '對潛',
  '索敵',
  '裝備0',
  '裝備0 熟練度',
  '裝備0 改修等級',
  '裝備1',
  '裝備1 熟練度',
  '裝備1 改修等級',
  '裝備2',
  '裝備2 熟練度',
  '裝備2 改修等級',
  '裝備3',
  '裝備3 熟練度',
  '裝備3 改修等級',
  '補強增設裝備',
  '補強增設裝備熟練度',
  '補強增設裝備改修等級',
  '鎖定',
  '耐久',
  '最大耐久',
  '損失耐久',
  '修理時間',
  '入渠',
  '後續改造',
] as const

export const INVENTORY_JSON_SCHEMA_VERSION = 'inventory_snapshot_v1' as const

type NullableNumber = number | null

type InventoryStatRange = {
  initial: NullableNumber
  max: NullableNumber
}

type EquipmentOwnership = {
  shipInstanceId: number
  slotIndex: number | null
  isExtraSlot: boolean
}

type InventorySnapshot = {
  schema_version: typeof INVENTORY_JSON_SCHEMA_VERSION
  exported_at: string
  source: {
    package_name: string
    plugin_title: string
    plugin_version: string
    format: 'normalized_json'
  }
  fleets: Array<{
    fleet_id: number
    ship_instance_ids: Array<number | null>
  }>
  ships: Array<{
    instance_id: number
    ship_id: number
    name_ja: string | null
    yomi: string | null
    type_id: number | null
    type_name_ja: string | null
    level: number
    condition: number
    speed: number
    locked: boolean
    fleet_id: number | null
    sortie_area: number
    hp_now: number
    hp_max: number
    hp_lost: number
    ndock_time: number
    in_ndock: boolean
    next_remodel_ship_id: number | null
    next_remodel_name_ja: string | null
    stats: {
      firepower: NullableNumber
      torpedo: NullableNumber
      anti_air: NullableNumber
      armor: NullableNumber
      luck: NullableNumber
      evasion: NullableNumber
      anti_submarine: NullableNumber
      line_of_sight: NullableNumber
    }
    naked_stats: {
      firepower: NullableNumber
      torpedo: NullableNumber
      anti_air: NullableNumber
      armor: NullableNumber
      luck: NullableNumber
    }
    master_stats: {
      firepower: InventoryStatRange
      torpedo: InventoryStatRange
      anti_air: InventoryStatRange
      armor: InventoryStatRange
      luck: InventoryStatRange
    }
    enhancement_bonus: {
      firepower: number
      torpedo: number
      anti_air: number
      armor: number
      luck: number
    }
    slot_instance_ids: Array<number | null>
    extra_slot_instance_id: number | null
  }>
  equipments: Array<{
    instance_id: number
    equip_id: number | null
    name_ja: string | null
    type_id: number | null
    improvement: number
    proficiency: number | null
    stats: {
      line_of_sight: number | null
      accuracy: number | null
    }
    equipped_on_ship_instance_id: number | null
    slot_index: number | null
    is_extra_slot: boolean
  }>
}

type PoiRemote = {
  app?: { getPath?: (name: string) => string }
  dialog?: {
    showSaveDialog?: (options: {
      defaultPath: string
      filters: Array<{ name: string; extensions: string[] }>
    }) => Promise<{ canceled: boolean; filePath?: string }>
  }
  require?: (name: string) => {
    writeFileSync: (path: string, data: string) => void
  }
}

type TextExportOptions = {
  fileTypeName: string
  extension: string
  prependUtf8Bom?: boolean
}

const UTF8_BOM = '\uFEFF'
const PROFICIENCY_TYPE_IDS = new Set([
  6, 7, 8, 9, 10, 11, 25, 26, 41, 45, 47, 48, 56, 57, 58,
])

const toCsvCell = (value: string | number | boolean) => {
  const text = String(value)
  return `"${text.replace(/"/g, '""')}"`
}

const pad2 = (value: number) => String(value).padStart(2, '0')

const toOffsetIsoString = (date: Date) => {
  const offsetMinutes = -date.getTimezoneOffset()
  const sign = offsetMinutes >= 0 ? '+' : '-'
  const absoluteOffsetMinutes = Math.abs(offsetMinutes)
  const offsetHours = Math.floor(absoluteOffsetMinutes / 60)
  const offsetRemainderMinutes = absoluteOffsetMinutes % 60

  return [
    `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`,
    `T${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`,
    `${sign}${pad2(offsetHours)}:${pad2(offsetRemainderMinutes)}`,
  ].join('')
}

export const getEquipmentCsvFileName = (date = new Date()) =>
  `kancolle_equips_${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(
    date.getDate(),
  )}.csv`

export const getShipCsvFileName = (date = new Date()) =>
  `kancolle_kan_${String(date.getFullYear()).slice(-2)}-${pad2(
    date.getMonth() + 1,
  )}-${pad2(date.getDate())}.csv`

export const getInventoryJsonFileName = (date = new Date()) =>
  `kancolle_inventory_${date.getFullYear()}-${pad2(
    date.getMonth() + 1,
  )}-${pad2(date.getDate())}.json`

const getById = <T>(
  collection: Record<string, T> | T[] | undefined,
  id: string | number | null | undefined,
) => {
  if (!collection || id == null) {
    return null
  }

  const key = String(id)
  if (Array.isArray(collection)) {
    return (
      collection.find(
        (item) =>
          String(
            (
              item as T & {
                api_id?: number
                id?: number
              }
            )?.api_id ??
              (
                item as T & {
                  api_id?: number
                  id?: number
                }
              )?.id ??
              '',
          ) === key,
      ) ?? null
    )
  }

  return collection[key] ?? null
}

const currentVal = (value: PoiShipStat | undefined) =>
  Array.isArray(value) ? Number(value[0] ?? 0) : Number(value ?? 0)

const currentValOrNull = (value: PoiShipStat | undefined) =>
  value == null ? null : currentVal(value)

const minMax = (value: PoiShipStat | undefined) => {
  if (Array.isArray(value)) {
    return {
      min: Number(value[0] ?? 0),
      max: Number(value[1] ?? value[0] ?? 0),
    }
  }

  const number = Number(value ?? 0)
  return { min: number, max: number }
}

const toNullableStatRange = (value: PoiShipStat | undefined): InventoryStatRange => {
  if (value == null) {
    return { initial: null, max: null }
  }

  if (Array.isArray(value)) {
    return {
      initial: Number(value[0] ?? 0),
      max: Number(value[1] ?? value[0] ?? 0),
    }
  }

  const number = Number(value)
  return { initial: number, max: number }
}

const getEnhancementValue = (ship: PoiShip, index: number) =>
  Number(ship.api_kyouka?.[index] ?? 0)

const getFleetSources = (state: PoiState) => [
  state.info?.fleets,
  state.info?.decks,
  (state as PoiState & { fleets?: Record<string, PoiFleet> | PoiFleet[] }).fleets,
  (state as PoiState & { decks?: Record<string, PoiFleet> | PoiFleet[] }).decks,
]

const getFleetList = (state: PoiState) => {
  for (const source of getFleetSources(state)) {
    if (!source) {
      continue
    }

    const fleets = Array.isArray(source) ? source : Object.values(source)
    if (fleets.length > 0) {
      return fleets
    }
  }

  return [] as PoiFleet[]
}

const buildFleetMembershipMap = (fleets: PoiFleet[]) => {
  const membershipMap = new Map<number, number>()

  fleets.forEach((fleet, index) => {
    const fleetId = Number(fleet?.api_id ?? index + 1)
    const shipIds = Array.isArray(fleet?.api_ship) ? fleet.api_ship : []

    shipIds.forEach((shipId) => {
      const positiveShipId = toNullablePositiveNumber(shipId)
      if (positiveShipId != null) {
        membershipMap.set(positiveShipId, fleetId)
      }
    })
  })

  return membershipMap
}

const toNullableNumber = (
  value: string | number | null | undefined,
): NullableNumber => {
  if (value == null || value === '') {
    return null
  }

  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

const toNullablePositiveNumber = (
  value: string | number | null | undefined,
): NullableNumber => {
  const number = toNullableNumber(value)
  return number != null && number > 0 ? number : null
}

const getShipTypeName = (
  shipTypes: Record<string, PoiShipTypeMaster> | PoiShipTypeMaster[] | undefined,
  stype: number | undefined,
) => getById(shipTypes, stype)?.api_name ?? String(stype ?? 'NA')

const getEquipmentTypeId = (
  master: PoiEquipmentMaster | null | undefined,
): NullableNumber => toNullableNumber(master?.api_type?.[2])

const getEquipmentProficiencyValue = (
  equipment: PoiEquipment,
  master: PoiEquipmentMaster | null | undefined,
) => {
  const equipmentTypeId = getEquipmentTypeId(master)
  return equipmentTypeId != null && PROFICIENCY_TYPE_IDS.has(equipmentTypeId)
    ? Number(equipment.api_alv ?? 0)
    : null
}

const getEquipmentTriple = (
  equipmentInstanceId: number | undefined,
  ownedEquipments: Record<string, PoiEquipment>,
  equipmentMasters: Record<string, PoiEquipmentMaster>,
) => {
  const instanceId = Number(equipmentInstanceId ?? 0)
  if (!Number.isFinite(instanceId) || instanceId <= 0) {
    return ['NA', 'NA', 'NA'] as const
  }

  const equipment = ownedEquipments[String(instanceId)]
  if (!equipment) {
    return ['NA', 'NA', 'NA'] as const
  }

  const masterId = Number(equipment.api_slotitem_id ?? 0)
  const master = equipmentMasters[String(masterId)]
  if (!master) {
    return ['NA', 'NA', Number(equipment.api_level ?? 0)] as const
  }

  return [
    master.api_name ?? 'NA',
    getEquipmentProficiencyValue(equipment, master) ?? 'NA',
    Number(equipment.api_level ?? 0),
  ] as const
}

const sortShipsByLevel = (left: PoiShip, right: PoiShip) => {
  const levelDifference = Number(right.api_lv ?? 0) - Number(left.api_lv ?? 0)
  if (levelDifference !== 0) {
    return levelDifference
  }

  return Number(left.api_id ?? 0) - Number(right.api_id ?? 0)
}

const buildEquipmentOwnershipMap = (ownedShips: Record<string, PoiShip>) => {
  const ownershipByEquipmentInstanceId = new Map<number, EquipmentOwnership>()

  Object.values(ownedShips).forEach((ship) => {
    const shipInstanceId = toNullablePositiveNumber(ship.api_id)
    if (shipInstanceId == null) {
      return
    }

    const slotInstanceIds = Array.isArray(ship.api_slot) ? ship.api_slot : []
    slotInstanceIds.forEach((slotInstanceId, slotIndex) => {
      const equipmentInstanceId = toNullablePositiveNumber(slotInstanceId)
      if (equipmentInstanceId == null) {
        return
      }

      ownershipByEquipmentInstanceId.set(equipmentInstanceId, {
        shipInstanceId,
        slotIndex,
        isExtraSlot: false,
      })
    })

    const extraSlotInstanceId = toNullablePositiveNumber(ship.api_slot_ex)
    if (extraSlotInstanceId != null) {
      ownershipByEquipmentInstanceId.set(extraSlotInstanceId, {
        shipInstanceId,
        slotIndex: null,
        isExtraSlot: true,
      })
    }
  })

  return ownershipByEquipmentInstanceId
}

export const buildEquipmentCsvFromPoiState = (state: PoiState) => {
  const ownedEquipments = state?.info?.equips
  const equipmentMasters = state?.const?.$equips

  if (!ownedEquipments || !equipmentMasters) {
    throw new Error('Equipment data is not available in the current poi state.')
  }

  const rows = Object.values(ownedEquipments)
    .map((equipment) => {
      const masterId = Number(equipment.api_slotitem_id)
      if (!Number.isFinite(masterId) || masterId <= 0) {
        return null
      }

      const master = equipmentMasters[String(masterId)]
      if (!master) {
        return null
      }

      return [
        Number(equipment.api_id ?? 0),
        masterId,
        toCsvCell(master.api_name ?? ''),
        Number(master.api_type?.[2] ?? 0),
        Number(equipment.api_level ?? 0),
        Number(equipment.api_alv ?? 0),
        Number(master.api_saku ?? 0),
        Number(master.api_houm ?? 0),
      ].join(',')
    })
    .filter((row): row is string => row != null)

  return [EQUIPMENT_CSV_HEADERS.join(','), ...rows].join('\n')
}

export const buildShipCsvFromPoiState = (state: PoiState) => {
  const ownedShips = state?.info?.ships
  const shipMasters = state?.const?.$ships

  if (!ownedShips || !shipMasters) {
    throw new Error('Ship data is not available in the current poi state.')
  }

  const ownedEquipments = state.info?.equips ?? {}
  const equipmentMasters = state.const?.$equips ?? {}
  const shipTypes = state.const?.$shipTypes
  const fleetMembership = buildFleetMembershipMap(getFleetList(state))

  const rows = Object.values(ownedShips)
    .filter(
      (ship) =>
        Number(ship.api_id ?? 0) > 0 && Number(ship.api_ship_id ?? 0) > 0,
    )
    .sort(sortShipsByLevel)
    .map((ship) => {
      const shipId = Number(ship.api_id ?? 0)
      const shipMasterId = Number(ship.api_ship_id ?? 0)
      const master = getById(shipMasters, shipMasterId)
      if (!master) {
        return null
      }

      const fire = minMax(master.api_houg)
      const torpedo = minMax(master.api_raig)
      const antiAir = minMax(master.api_tyku)
      const armor = minMax(master.api_souk)
      const luck = minMax(master.api_luck)

      const nakedFire = fire.min + getEnhancementValue(ship, 0)
      const nakedTorpedo = torpedo.min + getEnhancementValue(ship, 1)
      const nakedAntiAir = antiAir.min + getEnhancementValue(ship, 2)
      const nakedArmor = armor.min + getEnhancementValue(ship, 3)
      const nakedLuck = luck.min + getEnhancementValue(ship, 4)

      const slotIds = Array.isArray(ship.api_slot) ? ship.api_slot : []
      const equipment0 = getEquipmentTriple(
        slotIds[0],
        ownedEquipments,
        equipmentMasters,
      )
      const equipment1 = getEquipmentTriple(
        slotIds[1],
        ownedEquipments,
        equipmentMasters,
      )
      const equipment2 = getEquipmentTriple(
        slotIds[2],
        ownedEquipments,
        equipmentMasters,
      )
      const equipment3 = getEquipmentTriple(
        slotIds[3],
        ownedEquipments,
        equipmentMasters,
      )
      const extraEquipment = getEquipmentTriple(
        ship.api_slot_ex,
        ownedEquipments,
        equipmentMasters,
      )

      const nextRemodelMaster = getById(shipMasters, master.api_aftershipid)
      const nextRemodelName =
        Number(master.api_aftershipid ?? 0) > 0
          ? (nextRemodelMaster?.api_name ?? String(master.api_aftershipid))
          : 'NA'

      return [
        shipId,
        master.api_name ?? 'NA',
        master.api_yomi ?? 'NA',
        fleetMembership.get(shipId) ?? Number(ship.api_deck_id ?? -1),
        Number(ship.api_sally_area ?? 0),
        getShipTypeName(shipTypes, master.api_stype),
        Number(ship.api_soku ?? 0),
        Number(ship.api_lv ?? 0),
        Number(ship.api_cond ?? 0),
        currentVal(ship.api_karyoku),
        nakedFire,
        fire.min,
        fire.max,
        currentVal(ship.api_raisou),
        nakedTorpedo,
        torpedo.min,
        torpedo.max,
        currentVal(ship.api_taiku),
        nakedAntiAir,
        antiAir.min,
        antiAir.max,
        currentVal(ship.api_soukou),
        nakedArmor,
        armor.min,
        armor.max,
        currentVal(ship.api_lucky),
        nakedLuck,
        luck.min,
        luck.max,
        nakedFire - fire.min,
        nakedTorpedo - torpedo.min,
        nakedAntiAir - antiAir.min,
        nakedArmor - armor.min,
        nakedLuck - luck.min,
        currentVal(ship.api_kaihi),
        currentVal(ship.api_taisen),
        currentVal(ship.api_sakuteki),
        ...equipment0,
        ...equipment1,
        ...equipment2,
        ...equipment3,
        ...extraEquipment,
        Number(ship.api_locked ?? 0),
        Number(ship.api_nowhp ?? 0),
        Number(ship.api_maxhp ?? 0),
        Math.max(
          0,
          Number(ship.api_maxhp ?? 0) - Number(ship.api_nowhp ?? 0),
        ),
        Number(ship.api_ndock_time ?? 0),
        String(Number(ship.api_ndock_time ?? 0) > 0),
        nextRemodelName,
      ]
        .map(toCsvCell)
        .join(',')
    })
    .filter((row): row is string => row != null)

  return [SHIP_CSV_HEADERS.join(','), ...rows].join('\n')
}

export const buildInventoryJsonFromPoiState = (
  state: PoiState,
  date = new Date(),
) => {
  const ownedShips = state?.info?.ships
  const shipMasters = state?.const?.$ships
  const ownedEquipments = state?.info?.equips
  const equipmentMasters = state?.const?.$equips

  if (!ownedShips || !shipMasters || !ownedEquipments || !equipmentMasters) {
    throw new Error('Inventory data is not available in the current poi state.')
  }

  const fleetList = getFleetList(state)
  const fleetMembership = buildFleetMembershipMap(fleetList)
  const shipTypes = state.const?.$shipTypes
  const equipmentOwnership = buildEquipmentOwnershipMap(ownedShips)

  const fleets = fleetList
    .map((fleet, index) => ({
      fleet_id: Number(fleet?.api_id ?? index + 1),
      ship_instance_ids: (Array.isArray(fleet?.api_ship) ? fleet.api_ship : []).map(
        (shipInstanceId) => toNullablePositiveNumber(shipInstanceId),
      ),
    }))
    .sort((left, right) => left.fleet_id - right.fleet_id)

  const ships = Object.values(ownedShips)
    .filter(
      (ship) =>
        Number(ship.api_id ?? 0) > 0 && Number(ship.api_ship_id ?? 0) > 0,
    )
    .sort(sortShipsByLevel)
    .map((ship) => {
      const shipInstanceId = Number(ship.api_id ?? 0)
      const shipId = Number(ship.api_ship_id ?? 0)
      const master = getById(shipMasters, shipId)

      const fire = toNullableStatRange(master?.api_houg)
      const torpedo = toNullableStatRange(master?.api_raig)
      const antiAir = toNullableStatRange(master?.api_tyku)
      const armor = toNullableStatRange(master?.api_souk)
      const luck = toNullableStatRange(master?.api_luck)

      const firepowerEnhancement = getEnhancementValue(ship, 0)
      const torpedoEnhancement = getEnhancementValue(ship, 1)
      const antiAirEnhancement = getEnhancementValue(ship, 2)
      const armorEnhancement = getEnhancementValue(ship, 3)
      const luckEnhancement = getEnhancementValue(ship, 4)

      const nextRemodelShipId = toNullablePositiveNumber(master?.api_aftershipid)
      const nextRemodelMaster = getById(shipMasters, nextRemodelShipId)

      return {
        instance_id: shipInstanceId,
        ship_id: shipId,
        name_ja: master?.api_name ?? null,
        yomi: master?.api_yomi ?? null,
        type_id: toNullableNumber(master?.api_stype),
        type_name_ja:
          master?.api_stype != null
            ? getById(shipTypes, master.api_stype)?.api_name ?? null
            : null,
        level: Number(ship.api_lv ?? 0),
        condition: Number(ship.api_cond ?? 0),
        speed: Number(ship.api_soku ?? 0),
        locked: Boolean(ship.api_locked),
        fleet_id:
          fleetMembership.get(shipInstanceId) ??
          toNullablePositiveNumber(ship.api_deck_id),
        sortie_area: Number(ship.api_sally_area ?? 0),
        hp_now: Number(ship.api_nowhp ?? 0),
        hp_max: Number(ship.api_maxhp ?? 0),
        hp_lost: Math.max(
          0,
          Number(ship.api_maxhp ?? 0) - Number(ship.api_nowhp ?? 0),
        ),
        ndock_time: Number(ship.api_ndock_time ?? 0),
        in_ndock: Number(ship.api_ndock_time ?? 0) > 0,
        next_remodel_ship_id: nextRemodelShipId,
        next_remodel_name_ja:
          nextRemodelShipId != null ? nextRemodelMaster?.api_name ?? null : null,
        stats: {
          firepower: currentValOrNull(ship.api_karyoku),
          torpedo: currentValOrNull(ship.api_raisou),
          anti_air: currentValOrNull(ship.api_taiku),
          armor: currentValOrNull(ship.api_soukou),
          luck: currentValOrNull(ship.api_lucky),
          evasion: currentValOrNull(ship.api_kaihi),
          anti_submarine: currentValOrNull(ship.api_taisen),
          line_of_sight: currentValOrNull(ship.api_sakuteki),
        },
        naked_stats: {
          firepower:
            fire.initial != null ? fire.initial + firepowerEnhancement : null,
          torpedo:
            torpedo.initial != null
              ? torpedo.initial + torpedoEnhancement
              : null,
          anti_air:
            antiAir.initial != null
              ? antiAir.initial + antiAirEnhancement
              : null,
          armor:
            armor.initial != null ? armor.initial + armorEnhancement : null,
          luck: luck.initial != null ? luck.initial + luckEnhancement : null,
        },
        master_stats: {
          firepower: fire,
          torpedo,
          anti_air: antiAir,
          armor,
          luck,
        },
        enhancement_bonus: {
          firepower: firepowerEnhancement,
          torpedo: torpedoEnhancement,
          anti_air: antiAirEnhancement,
          armor: armorEnhancement,
          luck: luckEnhancement,
        },
        slot_instance_ids: (Array.isArray(ship.api_slot) ? ship.api_slot : []).map(
          (slotInstanceId) => toNullablePositiveNumber(slotInstanceId),
        ),
        extra_slot_instance_id: toNullablePositiveNumber(ship.api_slot_ex),
      }
    })

  const equipments = Object.values(ownedEquipments)
    .filter((equipment) => Number(equipment.api_id ?? 0) > 0)
    .sort(
      (left, right) => Number(left.api_id ?? 0) - Number(right.api_id ?? 0),
    )
    .map((equipment) => {
      const instanceId = Number(equipment.api_id ?? 0)
      const equipId = toNullablePositiveNumber(equipment.api_slotitem_id)
      const master =
        equipId != null ? equipmentMasters[String(equipId)] ?? null : null
      const ownership = equipmentOwnership.get(instanceId)

      return {
        instance_id: instanceId,
        equip_id: equipId,
        name_ja: master?.api_name ?? null,
        type_id: getEquipmentTypeId(master),
        improvement: Number(equipment.api_level ?? 0),
        proficiency: getEquipmentProficiencyValue(equipment, master),
        stats: {
          line_of_sight:
            master != null ? Number(master.api_saku ?? 0) : null,
          accuracy: master != null ? Number(master.api_houm ?? 0) : null,
        },
        equipped_on_ship_instance_id: ownership?.shipInstanceId ?? null,
        slot_index: ownership?.slotIndex ?? null,
        is_extra_slot: ownership?.isExtraSlot ?? false,
      }
    })

  const snapshot: InventorySnapshot = {
    schema_version: INVENTORY_JSON_SCHEMA_VERSION,
    exported_at: toOffsetIsoString(date),
    source: {
      package_name: PKG.name,
      plugin_title: PKG.poiPlugin.title,
      plugin_version: PKG.version,
      format: 'normalized_json',
    },
    fleets,
    ships,
    equipments,
  }

  return JSON.stringify(snapshot, null, 2)
}

const exportTextToFile = async (
  contents: string,
  fileName: string,
  exportLabel: string,
  options: TextExportOptions,
) => {
  if (!('POI_VERSION' in globalThis)) {
    throw new Error(
      `Failed to export ${exportLabel}. You are not currently in the poi environment.`,
    )
  }

  const remote = (globalThis as { remote?: PoiRemote }).remote

  if (
    !remote?.app?.getPath ||
    !remote.dialog?.showSaveDialog ||
    !remote.require
  ) {
    throw new Error(`Failed to export ${exportLabel}. Save dialog is unavailable.`)
  }

  const defaultPath = `${remote.app.getPath('documents')}/${fileName}`
  const result = await remote.dialog.showSaveDialog({
    defaultPath,
    filters: [{ name: options.fileTypeName, extensions: [options.extension] }],
  })

  if (result.canceled || !result.filePath) {
    return false
  }

  const fs = remote.require('fs')
  const fileContents = options.prependUtf8Bom ? `${UTF8_BOM}${contents}` : contents
  fs.writeFileSync(result.filePath, fileContents)
  return true
}

export const exportEquipmentCsvToFile = async (
  csv: string,
  date = new Date(),
) =>
  exportTextToFile(
    csv,
    getEquipmentCsvFileName(date),
    'equipment CSV',
    {
      fileTypeName: 'CSV',
      extension: 'csv',
      prependUtf8Bom: true,
    },
  )

export const exportShipCsvToFile = async (csv: string, date = new Date()) =>
  exportTextToFile(csv, getShipCsvFileName(date), 'ship CSV', {
    fileTypeName: 'CSV',
    extension: 'csv',
    prependUtf8Bom: true,
  })

export const exportInventoryJsonToFile = async (
  json: string,
  date = new Date(),
) =>
  exportTextToFile(
    json,
    getInventoryJsonFileName(date),
    'inventory JSON',
    {
      fileTypeName: 'JSON',
      extension: 'json',
    },
  )
