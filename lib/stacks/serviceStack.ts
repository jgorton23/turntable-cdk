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
import { Construct } from "constructs";
import { Stage } from "../config";

export interface ServiceStackProps extends StackProps {
  stage: Stage;
  domainName: string;
  userPool: UserPool;
  userPoolClient: UserPoolClient;
  userPoolDomain: UserPoolDomain;
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
      },
      publicLoadBalancer: true,
      protocol: ApplicationProtocol.HTTPS,
      certificate,
      redirectHTTP: true,
    });

    fargateService.listener.addAction('CognitoAuth', {
      priority: 1,
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