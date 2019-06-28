cd %~p0\
echo calling npm in %CD%
call ..\..\packages\NodeJSAndNpm\npm install
cd %~p0\
echo calling grunt prebuild
call ..\..\packages\NodeJSAndNpm\node node_modules\grunt-cli\bin\grunt prebuild --no-color
echo end of prebuild script