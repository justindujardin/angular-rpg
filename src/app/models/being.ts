/** Basic model for a life form */
export interface Being {
  /** Generated unique ID for this being when created */
  readonly eid?: string;
  readonly name?: string;
  readonly icon?: string;
  readonly level?: number;
  readonly mp?: number;
  readonly maxmp?: number;
  readonly hp?: number;
  readonly maxhp?: number;

  // Base attributes
  readonly attack: number;
  readonly defense: number;
  readonly magic: number;
  readonly speed: number;
}
