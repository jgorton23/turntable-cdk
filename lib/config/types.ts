export type Stage = 'Beta' | 'Prod';

export interface StageConfig {
  stage: Stage;
  stageProps?: {}
}