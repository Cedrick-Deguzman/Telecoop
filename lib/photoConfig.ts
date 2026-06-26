// Central business-rule config for the Photo Documentation Module.
// Each operational record type declares which photo categories exist and which are
// required as proof. Both the UI and the API import this — define the rule once, trust it everywhere.

export type PhotoRecordType = 'installation' | 'inventory' | 'inventorySerial';

export interface PhotoRule {
  /** Label shown to operators. */
  label: string;
  /** All categories offered for this record type. */
  categories: readonly string[];
  /** Subset that must each have ≥1 photo before the record is considered complete. */
  required: readonly string[];
}

export const PHOTO_RULES: Record<PhotoRecordType, PhotoRule> = {
  installation: {
    label: 'Installation',
    categories: [
      'House Exterior',
      'Pole Route',
      'NAP Box',
      'Port Used',
      'ONU Serial',
      'Router Installed',
      'Speed Test',
      'Final Cable Routing',
    ],
    // Installations are proof-critical: every category is mandatory.
    required: [
      'House Exterior',
      'Pole Route',
      'NAP Box',
      'Port Used',
      'ONU Serial',
      'Router Installed',
      'Speed Test',
      'Final Cable Routing',
    ],
  },
  // Consumable items (cable, connectors): one photo set for the item/model.
  inventory: {
    label: 'Inventory Item',
    categories: ['Item Condition', 'Packaging', 'Damage Evidence'],
    required: [],
  },
  // Serialized units (modem-router, ONU): photo evidence per physical device.
  inventorySerial: {
    label: 'Serial Unit',
    categories: ['Serial Label', 'Device Condition', 'MAC Label'],
    required: [],
  },
};

export const PHOTO_RECORD_TYPES = Object.keys(PHOTO_RULES) as PhotoRecordType[];

export function isPhotoRecordType(value: unknown): value is PhotoRecordType {
  return typeof value === 'string' && value in PHOTO_RULES;
}

/** Maps a record type to the Photo table's owning foreign-key column. */
export const PHOTO_OWNER_FIELD: Record<PhotoRecordType, 'installationId' | 'inventoryItemId' | 'inventorySerialId'> = {
  installation: 'installationId',
  inventory: 'inventoryItemId',
  inventorySerial: 'inventorySerialId',
};

/** Required categories still missing given the set of categories that have photos. */
export function missingRequiredCategories(
  recordType: PhotoRecordType,
  coveredCategories: Iterable<string>,
): string[] {
  const covered = new Set(coveredCategories);
  return PHOTO_RULES[recordType].required.filter(c => !covered.has(c));
}
