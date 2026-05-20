# Nepali Europapokal 2026 — Event Manager

A dynamic single-page application for managing the Nepali Europapokal 2026 football tournament in Berlin. TypeScript + React frontend on S3/CloudFront, a single AWS Lambda behind API Gateway HTTP API, and a single DynamoDB table — all defined in AWS CDK.

```
nepal-football/
├── frontend/   # Vite + React + React Query SPA
├── backend/    # Lambda handler + routes
├── shared/     # TypeScript types shared across packages
├── infra/      # AWS CDK stack (DynamoDB, Lambda, HttpApi, S3, CloudFront)
└── site/       # original HTML template (reference only)
```

## Prerequisites

- Node.js 20+
- npm 10+ (workspaces)
- AWS credentials with permissions to create the resources in the CDK stack
- AWS CDK bootstrap done in your target region (`npx cdk bootstrap aws://<acct>/<region>`)

## Install

```bash
npm install
```

## Build everything

```bash
npm run build
```

This runs the shared package build, then backend, then frontend in order.

## Test

```bash
npm test
```

Runs Vitest in both `backend` (route handlers via `aws-sdk-client-mock`) and `frontend` (components and views via React Testing Library + MSW).

## Deploy to AWS

```bash
npm run deploy
```

This builds everything, then runs `cdk deploy` in `infra/`. On first deploy the seed Lambda populates DynamoDB with the 15 tasks, 6 teams, 9 prep items, and 9 milestones from the original template. The seed is idempotent — re-deploys do not duplicate data.

CDK outputs include:

- `ApiUrl` — direct API Gateway endpoint
- `DistributionDomainName` — public CloudFront URL (open this in your browser)
- `TableName`, `SiteBucketName`

## Smoke test

After deploy:

```bash
API_URL=https://<api-id>.execute-api.eu-central-1.amazonaws.com npm run smoke
```

`GET /bootstrap`, then PATCH a task and re-fetch to verify persistence.

## Local development

```bash
# In one terminal — point to the deployed API
VITE_API_BASE_URL=https://<api-id>.execute-api.eu-central-1.amazonaws.com npm run dev -w @nepal-football/frontend
```

Dev server runs at `http://localhost:5173`.

## Architecture

```
User → CloudFront → S3 (SPA assets)
                  → /api/* → API Gateway HTTP API → Lambda → DynamoDB
```

- Single Lambda function with route switch on `event.routeKey`
- Single DynamoDB table with `PK` (entity type) + `SK` (UUID); `sortKey` attribute used for stable ordering
- Hash-based router on the SPA so client-side routing works with the S3/CloudFront 404→`/index.html` fallback
- React Query handles all server state with optimistic updates and rollback on error

See `.kiro/specs/nepal-football-spa/design.md` for the full design.

## Trade-offs (v1)

- No authentication. Anyone with the CloudFront URL can toggle items. Acceptable for a small, organizer-only audience.
- Single table, single Lambda, single region. Easy to reason about and operate.
- Date/time fields accept free-form labels like "All Day" and "Now" preserved from the original template.

## Project commands reference

| Command                                | What it does                                   |
|----------------------------------------|------------------------------------------------|
| `npm install`                          | Install all workspace dependencies             |
| `npm run build`                        | Build shared, backend, frontend                |
| `npm test`                             | Run backend + frontend unit tests              |
| `npm run deploy`                       | Build then `cdk deploy`                        |
| `npm run smoke`                        | Run E2E smoke against `API_URL`                |
| `npm run dev -w @nepal-football/frontend` | Vite dev server on :5173                    |
| `npm run synth -w @nepal-football/infra` | CDK synth without deploying                  |
| `npm run destroy -w @nepal-football/infra` | Destroy stack (note: bucket and table are RETAIN policy) |
