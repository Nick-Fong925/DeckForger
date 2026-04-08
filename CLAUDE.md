# DeckForge — Project Context

This file is loaded automatically as context for every Claude Code session on this project.

## Project

DeckForge is a full-stack flashcard generation app (TypeScript + React + Express + Firebase Auth + Firestore + GCP). It is being built as a structured learning project. See the planning report for full architecture, phased implementation plan, and gotchas.

## Required Reading

@.claude/planning-report.md
@.claude/coding-practices.md

## Current Phase

Phase 1 — TypeScript monorepo + Zod schemas (not started)

Update this line when a phase is complete.

## Key Decisions (do not relitigate without good reason)

- Firebase Auth for authentication (Google sign-in via popup)
- Firestore for all persistent data (users, uploads, decks); server uses Admin SDK, ownership enforced via server-side uid checks
- Zod schemas live in `packages/shared` and are imported by both server and client
- Local development uses `multer` + local disk instead of GCS; `child_process.spawn()` instead of Cloud Run Jobs
- The webhook interface (`POST /webhooks/job-complete`) must be kept even in local dev — do not shortcut with blocking awaits on Python jobs
- Three separate Python jobs (extractor, generator, packager) — do not merge them

## Coding Standards

All code must follow `.claude/coding-practices.md`. No exceptions without explicit user approval.
