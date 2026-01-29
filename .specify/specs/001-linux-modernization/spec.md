# Feature Specification: Linux Modernization

## Overview

Modernize BioModelAnalyzer to run as a self-contained application on Linux VMs, enabling biologists to perform model analysis without Windows infrastructure.

## Problem Statement

The current BioModelAnalyzer web application requires:
- Windows Server with IIS
- .NET Framework 4.7.2
- COM interop for Excel export
- Azure Storage for job scheduling

This limits deployment options and increases infrastructure costs. Research groups often have Linux-based compute infrastructure where they want to run BMA.

## User Stories

### US-001: Run BMA on Linux Server
**As a** research IT administrator
**I want to** deploy BioModelAnalyzer on our existing Linux servers
**So that** researchers can use BMA without requiring Windows infrastructure

**Acceptance Criteria:**
- Application runs on Ubuntu 22.04+ without .NET SDK installed
- Single executable or Docker container deployment
- Starts serving requests within 30 seconds of launch
- Accessible via web browser on local network

### US-002: Analyze Biological Models
**As a** biologist
**I want to** perform stability analysis on my biological models
**So that** I can verify my models behave as expected

**Acceptance Criteria:**
- POST `/api/Analyze` returns stability analysis results
- Results match existing Windows version for same input
- Timeout after 2 minutes with appropriate response (204)
- Error messages are clear and actionable

### US-003: Find Counter-Examples
**As a** biologist
**I want to** find counter-examples when my model is unstable
**So that** I can understand why and fix the model

**Acceptance Criteria:**
- POST `/api/FurtherTesting` returns bifurcation, cycle, and fixpoint counter-examples
- Counter-example visualization works in the frontend
- Results match existing Windows version

### US-004: Run Simulations
**As a** biologist
**I want to** simulate my model step by step
**So that** I can observe its behavior over time

**Acceptance Criteria:**
- POST `/api/Simulate` returns next state given current state
- Frontend simulation visualization works correctly
- Performance comparable to Windows version

### US-005: LTL Formula Checking
**As a** biologist
**I want to** verify temporal properties of my model using LTL formulas
**So that** I can check complex behavioral requirements

**Acceptance Criteria:**
- POST `/api/AnalyzeLTLSimulation` finds satisfying simulations
- POST `/api/AnalyzeLTLPolarity` performs polarity analysis
- Results match existing Windows version

### US-006: Export to Excel
**As a** biologist
**I want to** export simulation results to Excel
**So that** I can analyze data in spreadsheet tools

**Acceptance Criteria:**
- Export produces valid .xlsx files
- Works on Linux without Microsoft Office installed
- File structure matches existing export format

### US-007: Use Existing Frontend
**As a** biologist
**I want to** use the same familiar web interface
**So that** I don't have to learn a new tool

**Acceptance Criteria:**
- Existing TypeScript/HTML5 frontend works unchanged
- All UI features function correctly
- No visible difference from Windows deployment

### US-008: Long-Running Analysis Jobs
**As a** biologist
**I want to** submit long-running LTL analysis jobs
**So that** complex analyses can complete without timeout

**Acceptance Criteria:**
- POST `/api/lra/{appId}` schedules jobs
- GET `/api/lra/{appId}?jobId=X` returns job status
- DELETE `/api/lra/{appId}?jobId=X` cancels jobs
- Works without Azure Storage dependency

## Out of Scope

- Mobile-specific UI optimizations
- New analysis algorithms
- Authentication/authorization (existing behavior preserved)
- Cloud-specific features (OneDrive integration optional)
- Performance improvements beyond parity with Windows

## Dependencies

- Existing `BmaLinux/` .NET Core 3.1 codebase (to be upgraded)
- Existing TypeScript frontend (to be served unchanged)
- Existing API specification (`docs/ApiServer.yaml`)
- Test models in `src/BmaTests.Common/`

## Success Metrics

1. All API endpoints pass contract tests against OpenAPI spec
2. Analysis results match Windows version for all test models
3. Application runs on fresh Ubuntu 22.04 VM without .NET SDK
4. Frontend works identically to Windows deployment
