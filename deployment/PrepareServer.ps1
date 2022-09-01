
################################################
############## SERVER ##########################
################################################

####### ENTER YOUR INPUTS HERE ######################
$version_major = "1"
$version_minor = "13"
$version_build = "0002"
$gitdir = "C:\UCL\github\BioModelAnalyzer\"
$loctmp = "C:\tmp\"
###################################################
$root = $gitdir+"deployment\"
$sln_server = $gitdir + "sln\BackendFunctions\BackendFunctions.sln"
$versionfile = $gitdir+"src\BackendFunctions\ServerVersion.cs"
###################################################
#  $false or $true
$doPython = $true
$doBuild= $true
###################################################
$pfiles = ${env:PROGRAMFILES(X86)}
$loc = Get-Location
cd $root

########## RUN PYTHON SCRIPT #############
if ($doPython)
{
    python .\PrepareServer.py  $version_major $version_minor $version_build $versionfile
}
############# BUILD PROJECT ####################
if ($doBuild)
{
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
    #################################
    $config = '/p:Configuration=Release'
    $platform = '/p:Platform="x64"'
    $env:errorLevel = 0

    cd $msbuild
    echo "Starting to build" "******************" $msbuild $sln_server $config $platform "*******"
    .\msbuild.exe $sln_server $config $platform '/t:Rebuild'
}
    
#################################
Set-Location $root