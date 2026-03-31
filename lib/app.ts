import { App } from "aws-cdk-lib";
import { TurnTablePipeline } from "./pipeline/pipeline";

const app = new App();

new TurnTablePipeline(app, 'Pipeline');