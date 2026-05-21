#!/usr/bin/env node
import 'source-map-support/register';
import { App } from 'aws-cdk-lib';
import { NepalFootballStack } from '../lib/nepal-football-stack';

const app = new App();

// The stack must have an explicit account + region so that Route 53 hosted-zone
// lookups (which call the AWS API at synth time) work correctly.
new NepalFootballStack(app, 'NepalFootballStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT ?? '619516733714',
    region:  process.env.CDK_DEFAULT_REGION  ?? 'eu-central-1',
  },
  description: 'Nepali Europapokal 2026 Manager — SPA + serverless backend',
});
