/**
 * The enumeration of states used in the Combat state machine.
 *
 * These names are used as string literals in various other states
 * so as to avoid needing to import the states to know their names
 * and risk creating circular dependencies.
 */
export type CombatStateNames =
  | 'start'
  | 'begin-turn'
  | 'choose-action'
  | 'end-turn'
  | 'defeat'
  | 'victory'
  | 'escape';
