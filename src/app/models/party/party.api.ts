export const LEVEL_EXPERIENCE_REQUIREMENTS = [
  0,
  32,
  96,
  208,
  400,
  672,
  1056,
  1552,
  2184,
  2976
];

export const PARTY_ARMOR_TYPES: string[] = [
  'head', 'body', 'arms', 'feet', 'accessory'
];

export function getXPForLevel(level: number): number {
  if (level == 0) {
    return 0;
  }
  return LEVEL_EXPERIENCE_REQUIREMENTS[level - 1];
}
