# Match Mode — Implementation Plan

## Game Design

- Two-column board: left = N front tiles (shuffled), right = N back tiles (shuffled)
- Click a front tile to select it (highlights), click a back tile to attempt a match
- Correct pair → both tiles animate out and disappear
- Wrong pair → both flash red, reset after ~600ms
- Win condition → all pairs matched → show completion screen with elapsed time
- Setup screen before game starts: stepper to choose card count (2–20, clamped to deck size), default `min(8, deck.length)`

## Files to Create

### `packages/client/src/hooks/useMatchModeState.ts`

State shape:
```typescript
type TileStatus = 'idle' | 'selected' | 'matched' | 'wrong'
type Tile = {
  id: string       // unique tile ID (e.g. "pair-0-front")
  pairId: string   // shared between front/back pair — used to check match
  content: string
  side: 'front' | 'back'
  status: TileStatus
}
type MatchModeState = {
  frontTiles: Tile[]
  backTiles: Tile[]
  selectedId: string | null
  isDone: boolean
  elapsedSeconds: number
  selectTile: (id: string) => void
}
```

Init logic:
- Pick N random cards from the deck (shuffle, slice to N)
- Create 2N tiles: one front + one back per card, each with the same `pairId`
- Shuffle front tiles independently, shuffle back tiles independently
- Track `startTime` (set on first `selectTile` call)

`selectTile(id)` logic:
1. Nothing selected → mark tile as `selected`, set `selectedId`
2. Same tile clicked → deselect, clear `selectedId`
3. Same side as selected tile → swap selection to new tile
4. Opposite side → compare `pairId`:
   - Match → set both to `matched`, clear `selectedId`
   - No match → set both to `wrong`, after 600ms reset both to `idle`, clear `selectedId`
5. After each match, check if all tiles are `matched` → set `isDone = true`, record elapsed time

### `packages/client/src/components/study/MatchMode.tsx`

Props:
```typescript
type MatchModeProps = {
  cards: { front: string; back: string }[]
  onExit: () => void
}
```

Subcomponents (unexported, co-located, under 30 lines each):
- `MatchTile` — renders a single tile with status-based styling

Layout:
- Setup screen (when `cardCount === null`): number stepper + Start button
- Game screen: two-column grid (fronts left, backs right), progress indicator (X / N matched), Exit button
- Completion screen: elapsed time, Back to Deck button

Tile styling by status:
- `idle` → default card style
- `selected` → amber background + thicker border
- `matched` → sage background, pointer-events none, fade out (CSS opacity transition)
- `wrong` → coral background, brief flash

## Files to Modify

### `packages/client/src/pages/StudyPage.tsx`

1. Add `'match'` to `StudyMode` type
2. Add match mode option to `modeOptions` array:
   ```typescript
   {
     id: 'match',
     label: 'Match',
     icon: '🔗',
     description: 'Matching game',
     detail: 'Match each term to its definition. All pairs shown at once — clear the board as fast as you can.',
   }
   ```
3. Import `MatchMode` and add the conditional render alongside `ClassicMode`

## Notes

- No extra dependencies needed — pure React state, no drag library
- `RichContent` component should be used inside `MatchTile` to render HTML card content correctly
- Tile height should be fixed (e.g. `min-h-[80px]`) so the grid doesn't shift when tiles disappear — use `visibility: hidden` + keep layout space, then remove after transition ends
- On mobile (< sm), stack columns vertically with fronts on top, backs on bottom
