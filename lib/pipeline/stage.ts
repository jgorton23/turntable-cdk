import { Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AppleIdPConfig, GoogleIdPConfig, Stage as StageName } from '../config';
import { CognitoStack, DynamoStack, ServiceStack } from '../stacks';

export interface TurnTableStageProps extends StageProps {
  stage: StageName;
  domainName: string;
  idpConfig?: {
    apple?: AppleIdPConfig;
    google?: GoogleIdPConfig;
  }
}

export class TurnTableStage extends Stage {
  constructor(scope: Construct, id: string, props: TurnTableStageProps) {
    super(scope, id, props);

    const cognito = new CognitoStack(this, 'CognitoStack', {
      stage: props.stage,
      domainName: props.domainName,
      idpConfig: props.idpConfig,
    });

    const dynamo = new DynamoStack(this, 'DynamoStack', {
      stage: props.stage,
    });

    new ServiceStack(this, 'ServiceStack', {
      stage: props.stage,
      domainName: props.domainName,
      userPool: cognito.userPool,
      userPoolClient: cognito.userPoolClient,
      userPoolDomain: cognito.userPoolDomain,
      usersTable: dynamo.usersTable,
      friendsTable: dynamo.friendsTable,
      gamesTable: dynamo.gamesTable,
      playerGamesTable: dynamo.playerGamesTable,
      movesTable: dynamo.movesTable,
      chatTable: dynamo.chatTable,
    });
  }
}
