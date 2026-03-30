import { App } from "aws-cdk-lib";
import { TurnTablePipeline } from "./pipeline/pipeline";

const app = new App();

new TurnTablePipeline(app, 'Pipeline', {env: {
  account: '211026994572',
  region: 'us-west-2',
}});