
$loc = Get-Location
cd "C:\Program Files (x86)\WiX Toolset v3.11\bin\"
.\heat.exe dir "c:\tmp\Debug" -gg -sfrag -sreg -var var.bma.selfhost.TargetDir -template fragment -cg selfhostcontent -out "C:\tmp\selfhost.wxs"
Set-Location $loc