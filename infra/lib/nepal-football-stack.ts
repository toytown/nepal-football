import * as path from 'path';
import {
  Stack,
  StackProps,
  Duration,
  RemovalPolicy,
  CfnOutput,
  CustomResource,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as cr from 'aws-cdk-lib/custom-resources';
import * as logs from 'aws-cdk-lib/aws-logs';

export class NepalFootballStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // ── DynamoDB single-table ────────────────────────────────────────────
    const table = new dynamodb.Table(this, 'DataTable', {
      tableName: 'nepal-football-data',
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      sortKey:      { name: 'SK', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      pointInTimeRecovery: true,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      removalPolicy: RemovalPolicy.RETAIN,
    });

    // ── API Lambda ───────────────────────────────────────────────────────
    const apiLambda = new NodejsFunction(this, 'ApiHandler', {
      entry: path.resolve(__dirname, '../../backend/src/handler.ts'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_20_X,
      architecture: lambda.Architecture.ARM_64,
      memorySize: 256,
      timeout: Duration.seconds(10),
      environment: {
        TABLE_NAME: table.tableName,
      },
      bundling: {
        minify: true,
        sourceMap: true,
        target: 'node20',
        format: lambda.Runtime.NODEJS_20_X.family === lambda.RuntimeFamily.NODEJS ? undefined : undefined,
      },
      logRetention: logs.RetentionDays.ONE_MONTH,
    });
    table.grantReadWriteData(apiLambda);

    // ── HTTP API ─────────────────────────────────────────────────────────
    const httpApi = new apigwv2.HttpApi(this, 'HttpApi', {
      apiName: 'nepal-football-api',
      corsPreflight: {
        allowMethods: [
          apigwv2.CorsHttpMethod.GET,
          apigwv2.CorsHttpMethod.PATCH,
          apigwv2.CorsHttpMethod.OPTIONS,
        ],
        allowHeaders: ['content-type'],
        allowOrigins: ['*'], // restricted at CloudFront layer
      },
    });
    const integration = new HttpLambdaIntegration('LambdaInteg', apiLambda);

    const routes: Array<{ method: apigwv2.HttpMethod; path: string }> = [
      { method: apigwv2.HttpMethod.GET,   path: '/bootstrap' },
      { method: apigwv2.HttpMethod.GET,   path: '/tasks' },
      { method: apigwv2.HttpMethod.PATCH, path: '/tasks/{id}' },
      { method: apigwv2.HttpMethod.GET,   path: '/teams' },
      { method: apigwv2.HttpMethod.GET,   path: '/prep-items' },
      { method: apigwv2.HttpMethod.PATCH, path: '/prep-items/{id}' },
      { method: apigwv2.HttpMethod.GET,   path: '/milestones' },
      { method: apigwv2.HttpMethod.PATCH, path: '/milestones/{id}' },
    ];
    for (const r of routes) {
      httpApi.addRoutes({ path: r.path, methods: [r.method], integration });
    }

    // ── S3 site bucket ───────────────────────────────────────────────────
    const siteBucket = new s3.Bucket(this, 'SiteBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      removalPolicy: RemovalPolicy.RETAIN,
      enforceSSL: true,
    });

    // ── CloudFront distribution ──────────────────────────────────────────
    const apiOrigin = new origins.HttpOrigin(
      `${httpApi.apiId}.execute-api.${this.region}.amazonaws.com`,
    );

    // CloudFront Function to strip the "/api" prefix before forwarding to API
    // Gateway (whose routes are registered without that prefix).
    const stripApiPrefix = new cloudfront.Function(this, 'StripApiPrefix', {
      code: cloudfront.FunctionCode.fromInline(`
function handler(event) {
  var req = event.request;
  if (req.uri.indexOf('/api/') === 0) {
    req.uri = req.uri.substring(4); // remove leading "/api"
  } else if (req.uri === '/api') {
    req.uri = '/';
  }
  return req;
}
      `),
    });

    const distribution = new cloudfront.Distribution(this, 'Distribution', {
      defaultRootObject: 'index.html',
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(siteBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
      additionalBehaviors: {
        '/api/*': {
          origin: apiOrigin,
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
          originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
          functionAssociations: [
            {
              eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
              function: stripApiPrefix,
            },
          ],
        },
      },
      errorResponses: [
        { httpStatus: 403, responseHttpStatus: 200, responsePagePath: '/index.html' },
        { httpStatus: 404, responseHttpStatus: 200, responsePagePath: '/index.html' },
      ],
      minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
    });

    // ── Seed Lambda + Custom Resource ────────────────────────────────────
    const seedLambda = new NodejsFunction(this, 'SeedLambda', {
      entry: path.resolve(__dirname, 'seed-lambda/index.ts'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_20_X,
      architecture: lambda.Architecture.ARM_64,
      memorySize: 256,
      timeout: Duration.seconds(60),
      environment: { TABLE_NAME: table.tableName },
      bundling: { minify: true, sourceMap: true, target: 'node20' },
      logRetention: logs.RetentionDays.ONE_MONTH,
    });
    table.grantReadWriteData(seedLambda);

    const provider = new cr.Provider(this, 'SeedProvider', {
      onEventHandler: seedLambda,
      logRetention: logs.RetentionDays.ONE_MONTH,
    });
    new CustomResource(this, 'SeedResource', {
      serviceToken: provider.serviceToken,
      properties: {
        // Bumping this value forces the custom resource to run on update;
        // the handler is still idempotent (skips writes when table is non-empty).
        seedVersion: '1',
      },
    });

    // ── Deploy SPA assets to S3 + invalidate CloudFront ──────────────────
    const frontendDist = path.resolve(__dirname, '../../frontend/dist');
    new s3deploy.BucketDeployment(this, 'DeploySite', {
      sources: [s3deploy.Source.asset(frontendDist)],
      destinationBucket: siteBucket,
      distribution,
      distributionPaths: ['/*'],
      prune: true,
    });

    // ── Outputs ──────────────────────────────────────────────────────────
    new CfnOutput(this, 'ApiUrl', { value: httpApi.apiEndpoint });
    new CfnOutput(this, 'TableName', { value: table.tableName });
    new CfnOutput(this, 'DistributionDomainName', {
      value: distribution.distributionDomainName,
    });
    new CfnOutput(this, 'SiteBucketName', { value: siteBucket.bucketName });
  }
}
