# Changelog

All notable changes to this package are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow [Semantic Versioning](https://semver.org/).

## [0.1.1] - Unreleased

### Changed
- Repository URL in `package.json` now points to the live repository (`https://github.com/tncSean/n8n-nodes-dealflow`). The 0.1.0 package on npm links to a repository that returns 404.
- Added `homepage` and `bugs` fields that match the repository.
- Packages are now published from GitHub Actions on a `v*` tag with npm provenance (`npm publish --provenance`), as n8n community-node verification requires. A CI workflow runs tests and the build on pull requests and on pushes to `main`.

### Added
- The Jest test suite (83 tests) and its configuration are now tracked in the repository. `ts-node` is a dev dependency because `jest.config.ts` needs it.
- README sections for compatibility (Deal Flow plugin 0.9.x, Mautic 7.x) and for four known issues that are fixed in 0.2.0: timeline output shape, zero and empty values dropped, note and task create returning the whole deal, and deal listing limited to the default pipeline.

## [0.1.0] - 2026-03-26

### Added
- Initial release: Deal (create, get, get all, update, move stage), Note (create), Task (create, update), Contact (add to deal), and Timeline (get) operations for the Deal Flow plugin for Mautic.
- Deal Flow API credentials (Mautic base URL, username, password) and dynamic pipeline and stage dropdowns.
