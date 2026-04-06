import { Stack, StackProps } from 'aws-cdk-lib';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { Stage } from '../config';

export interface DynamoStackProps extends StackProps {
  stage: Stage;
}

export class DynamoStack extends Stack {
  readonly usersTable: Table;
  readonly friendsTable: Table;
  readonly gamesTable: Table;
  readonly playerGamesTable: Table;
  readonly movesTable: Table;
  readonly chatTable: Table;

  constructor(scope: Construct, id: string, props: DynamoStackProps) {
    super(scope, id, props);

    const { stage } = props;

    this.usersTable = new Table(this, 'UsersTable', {
      tableName: `turntable-${stage.toLowerCase()}-users`,
      partitionKey: { name: 'userId', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
    });

    this.friendsTable = new Table(this, 'FriendsTable', {
      tableName: `turntable-${stage.toLowerCase()}-friends`,
      partitionKey: { name: 'userId', type: AttributeType.STRING },
      sortKey: { name: 'friendId', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
    });

    this.gamesTable = new Table(this, 'GamesTable', {
      tableName: `turntable-${stage.toLowerCase()}-games`,
      partitionKey: { name: 'gameId', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
    });

    this.playerGamesTable = new Table(this, 'PlayerGamesTable', {
      tableName: `turntable-${stage.toLowerCase()}-player-games`,
      partitionKey: { name: 'playerId', type: AttributeType.STRING },
      sortKey: { name: 'gameId', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
    });

    this.movesTable = new Table(this, 'MovesTable', {
      tableName: `turntable-${stage.toLowerCase()}-moves`,
      partitionKey: { name: 'gameId', type: AttributeType.STRING },
      sortKey: { name: 'sk', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
    });

    this.chatTable = new Table(this, 'ChatTable', {
      tableName: `turntable-${stage.toLowerCase()}-chat`,
      partitionKey: { name: 'chatId', type: AttributeType.STRING },
      sortKey: { name: 'sk', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
    });
  }
}
