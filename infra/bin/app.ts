#!/usr/bin/env node
import 'source-map-support/register';
import { App } from 'aws-cdk-lib';
import { NepalFootballStack } from '../lib/nepal-football-stack';

const app = new App();

new NepalFootballStack(app, 'NepalFootballStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION ?? 'eu-central-1',
  },
  description: 'Nepali Europapokal 2026 Manager — SPA + serverless backend',
});
