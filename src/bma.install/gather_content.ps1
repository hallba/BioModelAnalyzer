
####### ENTER YOUR PATHS HERE ######################
# Copying files to a temporary location
$loc = "C:\tmp\"
$locdir = $loc+"Debug\"
$vsdir = "C:\UCL\github\BioModelAnalyzer\src\bma.selfhost\bin\Debug\"
###################################################


##### 1 ) ####### Compile bma.standalone in debug x86

# Making some paths
$wxs = $loc+"selfhost.wxs"
if (Test-Path $locdir) {Remove-Item $locdir -Recurse}
Copy-Item $vsdir -Destination $locdir -Recurse
# Deleting files we don't want
### directories
$deldir = $locdir + "bma.client\App_Start\"
if (Test-Path $deldir) {Remove-Item $deldir -Recurse}
$deldir = $locdir + "bma.client\bin\"
if (Test-Path $deldir) {Remove-Item $deldir -Recurse}
$deldir = $locdir + "bma.client\obj\"
if (Test-Path $deldir) {Remove-Item $deldir -Recurse}
$deldir = $locdir + "bma.client\installer\"
if (Test-Path $deldir) {Remove-Item $deldir -Recurse}
$deldir = $locdir + "bma.client\Properties\"
if (Test-Path $deldir) {Remove-Item $deldir -Recurse}
### files
$delfile = $locdir + "bma.client\bma.client.csproj"
if (Test-Path $delfile) {Remove-Item $delfile}
$delfile = $locdir + "bma.client\bma.client.csproj.user"
if (Test-Path $delfile) {Remove-Item $delfile}
$delfile = $locdir + "bma.client\.gitignore"
if (Test-Path $delfile) {Remove-Item $delfile}
$delfile = $locdir + "bma.client\web.Release.config"
if (Test-Path $delfile) {Remove-Item $delfile}
$delfile = $locdir + "bma.client\web.Debug.config"
if (Test-Path $delfile) {Remove-Item $delfile}
$delfile = $locdir + "bma.client\web.config"
if (Test-Path $delfile) {Remove-Item $delfile}
$delfile = $locdir + "*.pdb"
if (Test-Path $delfile) {Remove-Item $delfile}

# Running tool for wxs
$loc = Get-Location
cd "C:\Program Files (x86)\WiX Toolset v3.11\bin\"
.\heat.exe dir "c:\tmp\Debug" -gg -sfrag -sreg -var var.bma.selfhost.TargetDir -template fragment -cg selfhostcontent -out $wxs
Set-Location $loc


# Performing some manual changes to the file