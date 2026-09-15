# Ranking Architecture

This document describes the ranking architecture for the Local SEO SaaS Platform.

## 1. Overview
The ranking module generates deterministic geographic grids centered on business locations, coordinates ranking checks for tracked keywords across these grids, and manages the execution lifecycle using BullMQ workers.

## 2. Tenant Isolation
Every resource (Configs, Grid Points, Jobs, Runs) is strictly isolated by `organization_id`. Database constraints, Express middlewares, and service methods enforce that no query spans multiple organizations. The primary access control resides in `req.params.organizationId`.

## 3. Geo-Grid Algorithm
The `GeoGridService` dynamically generates grids of odd sizes (3x3 up to 11x11). 
- **Center Point**: Explicitly aligns with the business location.
- **Determinism**: Grid sizes and distances are generated using Flat Earth approximations suitable for short geographic distances (using ~111.32km per degree).
- **Symmetry**: Generates exact bounds mapping directly to `rowIndex` and `columnIndex`.

## 4. BullMQ Flow and Worker Lifecycle
- **Queueing**: A single run can enqueue $K \times N$ jobs (e.g. 5 keywords $\times$ 49 grid points = 245 jobs). Jobs are enqueued into a Redis-backed BullMQ `rank-tracking-jobs` queue.
- **Worker Execution**: The worker extracts jobs, validates tenant context, resolves the configured provider, and attempts to fetch the rank.
- **Run Progress**: Run status (`QUEUED`, `RUNNING`, `PARTIAL`, `COMPLETED`, `FAILED`) is recalculated at the completion of each job.

## 5. Provider Abstraction
The system uses a `RankingProviderRegistry`.
- **Interface**: `RankingProvider` ensures providers return standard positional data or `NULL` (if unranked).
- **Noop Provider**: Currently configured out-of-the-box. It deliberately fails with `RANKING_PROVIDER_NOT_CONFIGURED` without hallucinating fake Google rankings.

## 6. Local Visibility Score (v1)
A proprietary metric (labeled explicitly as Local Visibility, distinct from Google's internal scoring) evaluating the distribution of ranks across the grid.
- Top 3 = 100%
- Positions 4-10 = 80%
- Positions 11-20 = 60%
- Positions 21-50 = 40%
- Positions 51-100 = 20%
- Unranked = 0%

## 7. MapLibre and OpenStreetMap
The interactive `PositionMap` component uses MapLibre GL JS with OpenStreetMap tiles. 
**Important Note:** MapLibre strictly provides the visual map layer. It does *not* provide ranking data or interface with Google APIs. Live positions must eventually be supplied by a third-party ranking API mapped to the `RankingProvider` interface.
