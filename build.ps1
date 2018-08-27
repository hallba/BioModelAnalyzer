# Copyright (c) Microsoft Research 2016
# License: MIT. See LICENSE
if ([Environment]::Is64BitOperatingSystem) {
    $pfiles = ${env:PROGRAMFILES(X86)}
    $platform = '/p:Platform="x64"'
} else {
    $pfiles = $env:PROGRAMFILES
    $platform = '/p:Platform="x86"'
}

function Find-MsBuild([int] $MaxVersion = 2017)
{
    if ([Environment]::Is64BitOperatingSystem) {
        $pfilesl = ${env:PROGRAMFILES(X86)}
    } else {
        $pfilesl = $env:PROGRAMFILES
    }

    $agentPath = $pfilesl + "\Microsoft Visual Studio\2017\BuildTools\MSBuild\15.0\Bin\msbuild.exe"
    $devPath = $pfilesl + "\Microsoft Visual Studio\2017\Enterprise\MSBuild\15.0\Bin\msbuild.exe"
    $proPath = $pfilesl + "\Microsoft Visual Studio\2017\Professional\MSBuild\15.0\Bin\msbuild.exe"
    $communityPath = $pfilesl + "\Microsoft Visual Studio\2017\Community\MSBuild\15.0\Bin\msbuild.exe"
    $fallback2015Path = $pfilesl + "\MSBuild\14.0\Bin\MSBuild.exe"
    $fallback2013Path = $pfilesl + "\MSBuild\12.0\Bin\MSBuild.exe"
    $fallbackPath = ${env:windir} + "\Microsoft.NET\Framework\v4.0.30319"
		
    If ((2017 -le $MaxVersion) -And (Test-Path $agentPath)) { return $agentPath } 
    If ((2017 -le $MaxVersion) -And (Test-Path $devPath)) { return $devPath } 
    If ((2017 -le $MaxVersion) -And (Test-Path $proPath)) { return $proPath } 
    If ((2017 -le $MaxVersion) -And (Test-Path $communityPath)) { return $communityPath } 
    If ((2015 -le $MaxVersion) -And (Test-Path $fallback2015Path)) { return $fallback2015Path } 
    If ((2013 -le $MaxVersion) -And (Test-Path $fallback2013Path)) { return $fallback2013Path } 
    If (Test-Path $fallbackPath) { return $fallbackPath } 
        
    throw "Unable to find msbuild"
}

$msbuild = Find-MsBuild 2017 
if (!(Test-Path $msbuild)) {
    Write-Error -Message 'ERROR: Failed to locate MSBuild at ' + $msbuild
    exit 1
}
$solution = '.\sln\bmaclient\bmaclient.sln'
if (!(Test-Path $solution)) {
    Write-Error -Message 'ERROR: Failed to locate solution file at ' + $solution
    exit 1
}
$fsharpdll = $pfiles + '\Reference Assemblies\Microsoft\FSharp\.NETFramework\v4.0\4.3.1.0\FSharp.Core.dll'
if (!(Test-Path $fsharpdll)) {
    Write-Warning ('WARNING: ' + $fsharpdll + ' is missing. Please, ensure, that F# tools are present on your machine.')
}
if (!(Test-Path '.\paket-files')) {
    echo 'paket-files folder was not found, running repository preparation script...'
    .\PrepareRepository.ps1
    if (!$?) {
        Write-Error -Message 'ERROR: Repository preparation script (PrepareRepository.ps1) ended with an error'
        exit 1
    }
}
$config = '/p:Configuration=Release'
$env:errorLevel = 0
$proc = Start-Process $msbuild $solution,$config,$platform,'/t:Rebuild' -NoNewWindow -PassThru
$handle = $proc.Handle #workaround for not-working otherwise exit code
$proc.WaitForExit()
if ($env:errorLevel -ne 0 -or $proc.ExitCode -ne 0) {
    Write-Error -Message 'BUILD FAILED'
    exit 1
} else {
    echo 'BUILD SUCCEEDED'
    exit 0
}