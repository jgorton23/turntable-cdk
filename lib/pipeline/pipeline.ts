import { Stack, StackProps } from "aws-cdk-lib";
import { CodePipeline, CodePipelineSource, ShellStep } from "aws-cdk-lib/pipelines";
import { Construct } from "constructs";
import { TurnTableStage } from "./stage";
import { STAGE_CONFIGS } from "../config";

export class TurnTablePipeline extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const cdkSource = CodePipelineSource.gitHub('jgorton23/turntable-cdk', 'main');

    const serviceSource = CodePipelineSource.gitHub('jgorton23/turntable-service', 'main');

    const pipeline = new CodePipeline(this, 'Pipeline', {
      pipelineName: 'TurnTablePipeline',
      synth: new ShellStep('Synth', {
        input: cdkSource,
        additionalInputs: {'./turntable-service': serviceSource},
        commands: ['npm ci', 'npm run build', 'npx cdk synth'],
      })
    });

    STAGE_CONFIGS.forEach(config => {
      pipeline.addStage(new TurnTableStage(this, config.stage, {
        stage: config.stage,
        domainName: config.domainName,
        ...config.stageProps,
      }));
    });
  }
}