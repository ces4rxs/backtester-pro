export type OptimizeGoal =
  | { kind: "max_predictedSharpe" }
  | { kind: "min_predictedMDD" }
  | { kind: "max_antiOverfit" }
  | { kind: "custom"; expression: string };

export interface StrategyManifest {
  name: string;
  params: Record<string, number | string | boolean>;
}

export interface Variant extends StrategyManifest { id: string; }
export interface JudgedVariant extends Variant {
  judge: {
    predictedSharpe?: number;
    predictedMDD?: number;
    antiOverfit?: number;
    compositeScore: number;
    meta?: Record<string, unknown>;
  };
}
