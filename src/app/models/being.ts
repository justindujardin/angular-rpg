/** Basic model for a life form */
export interface Being {
  readonly name?: string;
  readonly icon?: string;
  readonly level?: number;
  readonly mp?: number;
  readonly maxmp?: number;
  readonly hp?: number;
  readonly maxhp?: number;
}
