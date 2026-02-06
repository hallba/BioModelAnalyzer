# Task T033: Build Frontend

**Status:** [ ] Pending | [ ] In Progress | [X] Complete
**Effort:** 30m
**Dependencies:** Phase 2 complete
**Phase:** Phase 9 - US7 (Use Existing Frontend)

---

## Implementation

### Full Linux build (from repo root)

```bash
# 1. Download vendor dependencies (replaces Windows PrepareRepository.ps1)
./scripts/prepare-frontend-deps.sh

# 2. Install npm packages and compile TypeScript
cd src/bma.package
npm install
npx tsc

# 3. Create case-sensitivity symlinks for Linux
#    (TypeScript produces PascalCase .js; Gruntfile references lowercase)
ln -sf Commands.js script/commands.js
ln -sf Operation.js script/model/operation.js
ln -sf LTLStatesViewer.js script/widgets/ltl/ltlstatesviewer.js
ln -sf coloredTableViewer.js script/widgets/coloredtableviewer.js

# 4. Copy vendor files + build (concat, less, uglify, copy to bma.client)
npx grunt prebuild
npx grunt
```

### What was created

**`scripts/prepare-frontend-deps.sh`** - Pure bash script that replaces
Paket/mono for downloading frontend vendor dependencies on Linux:
- Downloads GitHub-hosted JS libraries at pinned commits (from `paket.dependencies`)
  via `raw.githubusercontent.com`
- Downloads NuGet packages (RxJS, JSZip, Modernizr, jQuery.UI.Combined)
  via NuGet API and extracts with `unzip`
- Populates `paket-files/` and `packages/` so the existing Gruntfile
  `prebuild` task works unchanged
- Prerequisites: `curl`, `unzip`
- Idempotent: skips files that already exist

**`src/bma.package/tsconfig.json`** - TypeScript config matching the
original `.csproj` settings (target ES5, no modules, in-place output)

### Checklist

- [x] npm install succeeds
- [x] TypeScript compiles (with noEmitOnError: false for type compat issues)
- [x] prepare-frontend-deps.sh downloads all vendor files
- [x] grunt prebuild copies vendor files (152 files)
- [x] grunt default builds tool.js bundle (1.5 MB)
- [x] Output in src/bma.client/ (JS, CSS, vendor libs, Monaco, jQuery UI)

---

**Created:** 2026-01-29
