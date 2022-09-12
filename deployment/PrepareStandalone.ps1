
################################################
################ STAND ALONE ###################
################################################

####### ENTER YOUR INPUTS HERE ######################
$version = "1.13.0.2"
$gitdir = "C:\UCL\github\BioModelAnalyzer\"
$loctmp = "C:\tmp\"
###################################################
$root = $gitdir+"deployment\"
$vsdir = $gitdir+"src\bma.selfhost\bin\Debug\"
$sln_server = $gitdir+"sln\BackendFunctions\BackendFunctions.sln"
$sln_client = $gitdir+"sln\bmaclient\bmaclient.sln"
$installdir = $gitdir+"sln\bmainstall\"
$srcdir = $gitdir+"src\"
###################################################
#  $false or $true
$doBuild = $true
$doCopy= $true
$doWix = $true
$doPython = $true
$doInstall = $true
$doInstallCopy = $true
###################################################
$pfiles = ${env:PROGRAMFILES(X86)}
$loc = Get-Location
cd $root
$projdir = $srcdir+"bma.install\"
$prj_install = $projdir+"bma.install.wixproj"
$sln_install = $installdir+"bmainstall.sln"
$msi = $projdir+"bin\Release\bma.install.msi"
$output = $srcdir+"bma.client\installer\bma.install.msi"

##### 1 ) ####### Compile bma.standalone in debug x86

function Find-MsBuild([int] $MaxVersion = 2017)
{
    if ([Environment]::Is64BitOperatingSystem) {
        $pfilesl = ${env:PROGRAMFILES(X86)}
    } else {
        $pfilesl = $env:PROGRAMFILES
    }

    $agentPath = $pfilesl + "\Microsoft Visual Studio\2017\BuildTools\MSBuild\15.0\Bin\"
    $devPath = $pfilesl + "\Microsoft Visual Studio\2017\Enterprise\MSBuild\15.0\Bin\"
    $proPath = $pfilesl + "\Microsoft Visual Studio\2017\Professional\MSBuild\15.0\Bin\"
    $communityPath = $pfilesl + "\Microsoft Visual Studio\2017\Community\MSBuild\15.0\Bin\"
    $communityPath2019 = $pfilesl + "\Microsoft Visual Studio\2019\Community\MSBuild\Current\Bin\"
    $fallback2015Path = $pfilesl + "\MSBuild\14.0\Bin\"
    $fallback2013Path = $pfilesl + "\MSBuild\12.0\Bin\"
    
    If ((2019 -le $MaxVersion) -And (Test-Path $communityPath2019)) { return $communityPath2019 } 
    If ((2017 -le $MaxVersion) -And (Test-Path $agentPath)) { return $agentPath } 
    If ((2017 -le $MaxVersion) -And (Test-Path $devPath)) { return $devPath } 
    If ((2017 -le $MaxVersion) -And (Test-Path $proPath)) { return $proPath } 
    If ((2017 -le $MaxVersion) -And (Test-Path $communityPath)) { return $communityPath } 
    If ((2015 -le $MaxVersion) -And (Test-Path $fallback2015Path)) { return $fallback2015Path } 
    If ((2013 -le $MaxVersion) -And (Test-Path $fallback2013Path)) { return $fallback2013Path } 
            
    throw "Unable to find msbuild"
}

$msbuild = Find-MsBuild 2019 
if (!(Test-Path $msbuild)) {
    Write-Error -Message 'ERROR: Failed to locate MSBuild at ' + $msbuild
    exit 1
}

$config = '/p:Configuration=Debug'
$platform = '/p:Platform="x86"'
$env:errorLevel = 0

if ($doBuild)
{
    cd $msbuild
    echo "Starting to build" "******************" $msbuild $sln_server $config $platform "*******"
    .\msbuild.exe $sln_server $config $platform '/t:Rebuild'
    echo "Starting to build" "******************" $msbuild $sln_client $config $platform "*******"
    .\msbuild.exe $sln_client $config $platform '/t:Rebuild'
}

$wxs = $loctmp+"selfhost.wxs"
$loctmbdbg = $loctmp+"debug\"

## Making some paths
if ($doCopy)
{
    echo "Copy to" $loctmbdbg
    Set-Location $loc    
    if (Test-Path $loctmbdbg) {Remove-Item $loctmbdbg -Recurse}
    Copy-Item $vsdir -Destination $loctmbdbg -Recurse
    echo "Copied" $vsdir $loctmbdbg
    ## Deleting files we don't want
    ### directories
    $deldir = $loctmbdbg + "bma.client\App_Start\"
    if (Test-Path $deldir) {Remove-Item $deldir -Recurse}
    $deldir = $loctmbdbg + "bma.client\bin\"
    if (Test-Path $deldir) {Remove-Item $deldir -Recurse}
    $deldir = $loctmbdbg + "bma.client\obj\"
    if (Test-Path $deldir) {Remove-Item $deldir -Recurse}
    $deldir = $loctmbdbg + "bma.client\installer\"
    if (Test-Path $deldir) {Remove-Item $deldir -Recurse}
    $deldir = $loctmbdbg + "bma.client\Properties\"
    if (Test-Path $deldir) {Remove-Item $deldir -Recurse}
    ### files
    $delfile = $loctmbdbg + "bma.client\bma.client.csproj"
    if (Test-Path $delfile) {Remove-Item $delfile}
    $delfile = $loctmbdbg + "bma.client\bma.client.csproj.user"
    if (Test-Path $delfile) {Remove-Item $delfile}
    $delfile = $loctmbdbg + "bma.client\.gitignore"
    if (Test-Path $delfile) {Remove-Item $delfile}
    $delfile = $loctmbdbg + "bma.client\web.Release.config"
    if (Test-Path $delfile) {Remove-Item $delfile}
    $delfile = $loctmbdbg + "bma.client\web.Debug.config"
    if (Test-Path $delfile) {Remove-Item $delfile}
    $delfile = $loctmbdbg + "bma.client\web.config"
    if (Test-Path $delfile) {Remove-Item $delfile}
    $delfile = $loctmbdbg + "*.pdb"
    if (Test-Path $delfile) {Remove-Item $delfile}
}

############ Running tool for wxs ##############################
#$loc = Get-Location
if ($doWix)
{    
    cd "C:\Program Files (x86)\WiX Toolset v3.11\bin\"
    .\heat.exe dir "c:\tmp\Debug" -gg -sfrag -sreg -var var.bma.selfhost.TargetDir -template fragment -cg selfhostcontent -out $wxs
}

################## Performing some manual changes to the file ###################
Set-Location $loc
if ($doPython)
{    
    python .\PrepareStandalone.py $loctmp $projdir $version
}


################## Copying wxs file back over ###################
if ($doInstall)
{
    cd $msbuild
    $config = '/p:Configuration=Release'
    $platform = '/p:Platform="x86"'
    echo "Starting to build" "******************" $msbuild $sln_install $config $platform "*******"
    .\msbuild.exe $sln_install $config $platform '/t:Rebuild'

}

if ($doInstallCopy)
{        
    if (Test-Path $output) {Remove-Item $output}
    Copy-Item $msi -Destination $output
}

# finally return to original location
Set-Location $root