import { State } from '../../../core/state';
import { CombatStateNames } from './states';

/**
 * CombatMachineState is set when the player transitions in to a combat
 * encounter.  This can be any type of triggered encounter, from
 * the map or a feature interaction, or anything else.
 */
export class CombatMachineState extends State<CombatStateNames> {}
