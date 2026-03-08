#!/usr/bin/env bash
# prepare-frontend-deps.sh
# Downloads frontend vendor dependencies on Linux without Paket/mono.
# Replaces the Windows-only PrepareRepository.ps1 for the frontend build.
#
# Creates the same paket-files/ and packages/ directory structure that the
# Gruntfile.js prebuild task expects, using curl + unzip.
#
# Usage: ./scripts/prepare-frontend-deps.sh
# Prerequisites: curl, unzip

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

TMP_DIR=$(mktemp -d)
trap 'rm -rf "$TMP_DIR"' EXIT

echo "=== Downloading frontend vendor dependencies ==="

# --------------------------------------------------------------------------
# Helper functions
# --------------------------------------------------------------------------

download_github() {
    local owner="$1" repo="$2" commit="$3" filepath="$4"
    local dest_dir="paket-files/${owner}/${repo}/$(dirname "$filepath")"
    local dest_file="paket-files/${owner}/${repo}/${filepath}"

    if [ -f "$dest_file" ]; then
        return 0
    fi

    mkdir -p "$dest_dir"
    local url="https://raw.githubusercontent.com/${owner}/${repo}/${commit}/${filepath}"
    echo "  GitHub: ${owner}/${repo}/${filepath}"
    curl -sfL "$url" -o "$dest_file"
}

download_nuget() {
    local package_id="$1" version="$2"
    local dest_dir="packages/${package_id}"

    if [ -d "$dest_dir/content" ] || [ -d "$dest_dir/Content" ]; then
        return 0
    fi

    local nupkg="${TMP_DIR}/${package_id}.${version}.nupkg"
    local url="https://www.nuget.org/api/v2/package/${package_id}/${version}"
    echo "  NuGet: ${package_id} ${version}"
    curl -sfL "$url" -o "$nupkg"

    mkdir -p "$dest_dir"
    unzip -qo "$nupkg" -d "$dest_dir"
}

# --------------------------------------------------------------------------
# GitHub dependencies (pinned commits from paket.dependencies)
# --------------------------------------------------------------------------

echo ""
echo "--- GitHub files ---"

download_github carhartl jquery-cookie \
    7f88a4e631aba8a8c688fd8999ce6b9bcfd50718 jquery.cookie.js

download_github ChenWenBrian FileSaver.js \
    ec6eb67080ea703509a74e034226597791f27cb0 FileSaver.js

download_github furf jquery-ui-touch-punch \
    4bc009145202d9c7483ba85f3a236a8f3470354d jquery.ui.touch-punch.min.js

download_github gabceb jquery-browser-plugin \
    1efa52dee883e8d3e4929b644ff1350bf203a62b dist/jquery.browser.min.js

download_github jquery jquery-mousewheel \
    18e3cc17657237220c4dbd68a3fe4f6abdbf7ef8 jquery.mousewheel.js
download_github jquery jquery-mousewheel \
    18e3cc17657237220c4dbd68a3fe4f6abdbf7ef8 jquery.mousewheel.min.js

download_github kbwood svg \
    d7a0406f7f68f564cf176089a867c4d20955476c jquery.svg.js
download_github kbwood svg \
    d7a0406f7f68f564cf176089a867c4d20955476c jquery.svg.min.js
download_github kbwood svg \
    d7a0406f7f68f564cf176089a867c4d20955476c jquery.svganim.js
download_github kbwood svg \
    d7a0406f7f68f564cf176089a867c4d20955476c jquery.svganim.min.js
download_github kbwood svg \
    d7a0406f7f68f564cf176089a867c4d20955476c jquery.svgdom.min.js
download_github kbwood svg \
    d7a0406f7f68f564cf176089a867c4d20955476c jquery.svg.css

download_github mar10 jquery-ui-contextmenu \
    4f7c86fa03dc47c57f9a30e86f64397f02ff3b40 jquery.ui-contextmenu.js
download_github mar10 jquery-ui-contextmenu \
    4f7c86fa03dc47c57f9a30e86f64397f02ff3b40 jquery.ui-contextmenu.min.js

download_github svgdotjs svg.js \
    a67f69cd521a6ae000bb729afb3b84fc7a94eab0 dist/svg.js

download_github predictionmachines InteractiveDataDisplay \
    6205dacd87c3494dc652ceee5243ccb31443b624 dist/idd.js
download_github predictionmachines InteractiveDataDisplay \
    6205dacd87c3494dc652ceee5243ccb31443b624 dist/idd.heatmapworker.js
download_github predictionmachines InteractiveDataDisplay \
    6205dacd87c3494dc652ceee5243ccb31443b624 dist/idd.css

download_github kenwheeler slick \
    0f40c9d6a02a5c08b5f4dd80fdada3a854a59bee slick/slick.min.js
download_github kenwheeler slick \
    0f40c9d6a02a5c08b5f4dd80fdada3a854a59bee slick/slick.css
download_github kenwheeler slick \
    0f40c9d6a02a5c08b5f4dd80fdada3a854a59bee slick/slick-theme.css

download_github agrinko jquery-contenteditable \
    beff30522fd780891a24824699b72bf1da17a82c src/jquery-contenteditable.min.js

# --------------------------------------------------------------------------
# NuGet packages (extracted as zip archives)
# --------------------------------------------------------------------------

echo ""
echo "--- NuGet packages ---"

download_nuget JSZip 3.1.5
download_nuget RxJS-Main 4.0.7
download_nuget RxJS-Lite 4.0.7
download_nuget RxJS-Aggregates 4.0.7
download_nuget Modernizr 2.8.3
download_nuget jQuery 2.1.4
download_nuget jQuery.UI.Combined 1.11.4

echo ""
echo "=== Done. Run 'cd src/bma.package && npx grunt prebuild' next. ==="
