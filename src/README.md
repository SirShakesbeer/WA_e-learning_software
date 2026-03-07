# Game/src – Module Guide

Quick overview of the current structure and how to extend it.

## Structure

- `main_hub.ts`: Entry script for the main room
- `main_planning.ts`: Entry script for the planning room
- `main_git.ts`: Entry script for the Git/programming room
- `sharedInit.ts`: Shared initialization (language, dialogues, areas, Scripting API Extra)
- `gameplay/`: Game logic (for example box pushing)
- `managers/`: Room/system managers (dialogue, area, target zones)
- `ui/`: UI-focused modules (achievements, language, progress overlay)

## Add a new room script

1. Create a new file in `src`, for example `main_newroom.ts`.
2. In the map (`.tmj`), set the `script` property to `src/main_newroom.ts`.
3. In `WA.onInit()`, call at least `initializeSharedSystems()`.
4. Keep room-specific logic inside the new entry script.

## Extend gameplay

- Put new game rules into `gameplay/`, not directly in entry scripts.
- Keep public functions small and focused (for example `createX`, `checkY`, `destroyZ`).
- Access state through functions instead of freely mutable global arrays.

## Extend managers

- `areaManager.ts`: Register trigger/chat areas.
- `dialogueManager.ts`: Handle dialogue flow and replies.
- `targetZoneManager.ts`: Handle target zones and rule checks for box puzzles.
- New managers should ideally not open UI directly; return state/events instead.

## Extend UI

- `achievement.ts`: Add new achievement IDs and localized labels.
- `languagePreference.ts`: Language logic and overlay behavior.
- `progressOverlay.ts`: Reusable progress widget (planning room).
- `publicUrl.ts`: Central helper for URLs to files in `public/`.

## Important conventions

- Keep room orchestration in `main_*.ts`, domain logic in `gameplay/` and `managers/`.
- Keep teleport/start identifiers consistent (for example `from-hub`, `from-planning`, `from-git`).
- New trigger areas in Tiled must match the code names exactly.