// Karma configuration for BMA frontend Jasmine tests.
// Mirrors the load order from Chutzpah.json, replacing Chutzpah's built-in
// Jasmine runtime with karma-jasmine. Run with:
//   npx karma start --single-run karma.conf.js
//
// Prerequisites (run from repo root first):
//   bash scripts/prepare-frontend-deps.sh
//   npm install --legacy-peer-deps
//   npx tsc -p tsconfig.test.json || true
//   npx grunt prebuild
//   npx grunt
module.exports = function (config) {
    config.set({
        basePath: '',
        frameworks: ['jasmine'],

        // Load order mirrors Chutzpah.json References then Tests.
        // Files that come from 'grunt prebuild' (e.g. rx.lite.min.js,
        // jquery-ui-1.11.4.js) must exist before karma starts — run the
        // full build sequence first.
        files: [
            // jQuery core
            'Scripts/jquery-2.1.4.min.js',
            // jQuery UI (copied from packages/jQuery.UI.Combined by grunt prebuild)
            'Scripts/jquery-ui-1.11.4.js',
            // RxJS (copied from packages/RxJS-* by grunt prebuild)
            'Scripts/rx.lite.min.js',
            'Scripts/rx.aggregates.min.js',
            // jQuery plugins (copied from paket-files by grunt prebuild)
            'js/jquery.mousewheel.min.js',
            'js/jquery.ui-contextmenu.js',
            'js/jquery.svg.js',
            'js/jquery.cookie.js',
            // InteractiveDataDisplay (copied by grunt prebuild)
            'js/idd.js',
            // Misc vendor
            'js/FileSaver.js',
            // Main BMA app bundle (produced by 'grunt' default task)
            'tool.js',
            // Monaco editor pre-setup (stubs require() for Monaco modules)
            'test/pre/monacotest_pre.js',
            // Monaco editor (from node_modules after npm install)
            'node_modules/monaco-editor/min/vs/loader.js',
            'node_modules/monaco-editor/min/vs/editor/editor.main.nls.js',
            'node_modules/monaco-editor/min/vs/editor/editor.main.js',
            // Code editor widget (compiled TypeScript)
            'script/widgets/codeeditor.js',
            // Shared test helpers (compiled from test/TestComponents/*.ts)
            'test/TestComponents/*.js',
            // Test specs (compiled from test/*.ts by tsconfig.test.json)
            'test/*.js'
        ],

        reporters: ['progress'],
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: false,

        browsers: ['ChromeHeadlessNoSandbox'],
        customLaunchers: {
            ChromeHeadlessNoSandbox: {
                base: 'ChromeHeadless',
                // --no-sandbox is required on Linux CI runners
                flags: ['--no-sandbox', '--disable-gpu']
            }
        },

        singleRun: true,
        concurrency: Infinity
    });
};
