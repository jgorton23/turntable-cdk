import * as path from "path";
import { Stack, StackProps } from "aws-cdk-lib";
import { ListenerAction, ListenerCondition, ApplicationProtocol } from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { AuthenticateCognitoAction } from "aws-cdk-lib/aws-elasticloadbalancingv2-actions";
import { Vpc } from "aws-cdk-lib/aws-ec2";
import { DockerImageAsset } from "aws-cdk-lib/aws-ecr-assets";
import { Cluster, ContainerImage } from "aws-cdk-lib/aws-ecs";
import { ApplicationLoadBalancedFargateService } from "aws-cdk-lib/aws-ecs-patterns";
import { UserPool, UserPoolClient, UserPoolDomain } from "aws-cdk-lib/aws-cognito";
import { Certificate, CertificateValidation } from "aws-cdk-lib/aws-certificatemanager";
import { Table } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import { Stage } from "../config";

export interface ServiceStackProps extends StackProps {
  stage: Stage;
  domainName: string;
  userPool: UserPool;
  userPoolClient: UserPoolClient;
  userPoolDomain: UserPoolDomain;
  usersTable: Table;
  friendsTable: Table;
  gamesTable: Table;
  playerGamesTable: Table;
  movesTable: Table;
  chatTable: Table;
}

export class ServiceStack extends Stack {
  constructor(scope: Construct, id: string, props: ServiceStackProps) {
    super(scope, id, props);

    const image = new DockerImageAsset(this, 'ServiceImage', {
      directory: path.join(__dirname, '../../turntable-service'),
    });

    const vpc = new Vpc(this, 'Vpc', { maxAzs: 2 });

    const cluster = new Cluster(this, 'Cluster', { vpc });

    const certificate = new Certificate(this, 'Certificate', {
      domainName: props.domainName,
      validation: CertificateValidation.fromDns(),
    });

    const fargateService = new ApplicationLoadBalancedFargateService(this, 'FargateService', {
      cluster,
      cpu: 256,
      memoryLimitMiB: 512,
      desiredCount: 1,
      taskImageOptions: {
        image: ContainerImage.fromDockerImageAsset(image),
        containerPort: 8080,
        environment: {
          AWS_REGION: this.region,
          USERS_TABLE_NAME: props.usersTable.tableName,
          FRIENDS_TABLE_NAME: props.friendsTable.tableName,
          GAMES_TABLE_NAME: props.gamesTable.tableName,
          PLAYER_GAMES_TABLE_NAME: props.playerGamesTable.tableName,
          MOVES_TABLE_NAME: props.movesTable.tableName,
          CHAT_TABLE_NAME: props.chatTable.tableName,
        },
      },
      publicLoadBalancer: true,
      protocol: ApplicationProtocol.HTTPS,
      certificate,
      redirectHTTP: true,
    });

    const tables = [
      props.usersTable,
      props.friendsTable,
      props.gamesTable,
      props.playerGamesTable,
      props.movesTable,
      props.chatTable,
    ];
    tables.forEach(table => table.grantReadWriteData(fargateService.taskDefinition.taskRole));

    fargateService.targetGroup.configureHealthCheck({
      path: '/health',
    });

    fargateService.listener.addAction('HealthCheck', {
      priority: 1,
      conditions: [ListenerCondition.pathPatterns(['/health'])],
      action: ListenerAction.forward([fargateService.targetGroup]),
    });

    fargateService.listener.addAction('CognitoAuth', {
      priority: 2,
      conditions: [ListenerCondition.pathPatterns(['/*'])],
      action: new AuthenticateCognitoAction({
        userPool: props.userPool,
        userPoolClient: props.userPoolClient,
        userPoolDomain: props.userPoolDomain,
        next: ListenerAction.forward([fargateService.targetGroup]),
      }),
    });
  }
}