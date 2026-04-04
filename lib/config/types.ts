export type Stage = 'Beta' | 'Prod';

export interface AppleIdPConfig {
  clientId: string;
  teamId: string;
  keyId: string;
  privateKeySecretName: string;
}

export interface GoogleIdPConfig {
  clientId: string;
  clientSecretName: string;
}

export interface StageConfig {
  stage: Stage;
  domainName: string;
  apple?: AppleIdPConfig;
  google?: GoogleIdPConfig;
  stageProps?: {}
}