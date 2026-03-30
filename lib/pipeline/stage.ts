import * as cdk from 'aws-cdk-lib';
import { Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

class PlaceholderStack extends cdk.Stack {}

export class TurnTableStage extends Stage {
  constructor(scope: Construct, id: string, props?: StageProps) {
    super(scope, id, props);

    new PlaceholderStack(this, 'Placeholder');
  }
}
