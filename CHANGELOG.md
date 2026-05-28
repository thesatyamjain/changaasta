# Changelog

## Unreleased

### Added

- Save/resume support with `localStorage`.
- Bot difficulty selector: Easy, Normal, and Smart.
- Rules guide overlay.
- Turn/result toast messages.
- Victory stats for turns, rolls, captures, moves, time, and board size.
- PWA manifest and service worker for install/offline play over HTTP.
- Dependency-free Node sanity tests for board/path rules.

### Changed

- Computer mode now defaults to one human player and the rest bots.
- Mobile kaudi/result controls were resized and balanced.
- Mobile board positioning was tuned for the toss-power section.
- README links now use portable relative paths.

### Fixed

- Three consecutive high/extra rolls now correctly advance the turn.
- Game logs now render player-provided text safely instead of using `innerHTML`.
- Tablet layout switches to flex correctly under 1000px.
- Added missing MIT `LICENSE`.
