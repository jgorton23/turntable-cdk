import { Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Stage as StageName } from '../config';
import { ServiceStack } from '../stacks';

export interface TurnTableStageProps extends StageProps {
  stage: StageName;
}

export class TurnTableStage extends Stage {
  constructor(scope: Construct, id: string, props: TurnTableStageProps) {
    super(scope, id, props);

    new ServiceStack(this, 'ServiceStack', {
      stage: props.stage
    });
  }
}
