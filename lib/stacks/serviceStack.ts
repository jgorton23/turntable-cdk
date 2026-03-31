import * as path from "path";
import { Stack, StackProps } from "aws-cdk-lib";
import { DockerImageAsset } from "aws-cdk-lib/aws-ecr-assets";
import { Construct } from "constructs";
import { Stage } from "../config";

export interface ServiceStackProps extends StackProps {
  stage: Stage;
}

export class ServiceStack extends Stack {
  readonly image: DockerImageAsset;

  constructor(scope: Construct, id: string, props: ServiceStackProps) {
    super(scope, id, props);

    this.image = new DockerImageAsset(this, 'ServiceImage', {
      directory: path.join(__dirname, '../../turntable-service'),
    });
  }
}