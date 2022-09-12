# Copyright (c) Microsoft Research 2016
# License: MIT. See LICENSE


# First delete obj files that are causing conflict from multiple build environments
if (Test-Path "src/ApiServer/obj/") {Remove-Item "src/ApiServer/obj/" -Recurse}
if (Test-Path "src/ApiServer/bin/") {Remove-Item "src/ApiServer/bin/" -Recurse}
if (Test-Path "src/BackendFunctions/obj/") {Remove-Item "src/BackendFunctions/obj/" -Recurse}
if (Test-Path "src/BackendFunctions/bin/") {Remove-Item "src/BackendFunctions/bin/" -Recurse}
if (Test-Path "src/BackEndTests/obj/") {Remove-Item "src/BackEndTests/obj/" -Recurse}
if (Test-Path "src/BackendUtilities/obj/") {Remove-Item "src/BackendUtilities/obj/" -Recurse}
if (Test-Path "src/BioCheckAnalyzer/obj/") {Remove-Item "src/BioCheckAnalyzer/obj/" -Recurse}
if (Test-Path "src/BioCheckAnalyzerCommon/obj/") {Remove-Item "src/BioCheckAnalyzerCommon/obj/" -Recurse}
if (Test-Path "src/BioCheckConsole/obj/") {Remove-Item "src/BioCheckConsole/obj/" -Recurse}
if (Test-Path "src/bma.client/obj/") {Remove-Item "src/bma.client/obj/" -Recurse}
if (Test-Path "src/bma.package/obj/") {Remove-Item "src/bma.package/obj/" -Recurse}
if (Test-Path "src/bma.selfhost/obj/") {Remove-Item "src/bma.selfhost/obj/" -Recurse}
if (Test-Path "src/BmaBioCheckAnalyzer/obj/") {Remove-Item "src/BmaBioCheckAnalyzer/obj/" -Recurse}
if (Test-Path "src/BmaJobsTests/obj/") {Remove-Item "src/BmaJobsTests/obj/" -Recurse}
if (Test-Path "src/BmaJobsTests/out/") {Remove-Item "src/BmaJobsTests/out/" -Recurse}
if (Test-Path "src/BmaTests.Common/obj/") {Remove-Item "src/BmaTests.Common/obj/" -Recurse}
if (Test-Path "src/BMAWebApi/obj/") {Remove-Item "src/BMAWebApi/obj/" -Recurse}
if (Test-Path "src/ClientStat/obj/") {Remove-Item "src/ClientStat/obj/" -Recurse}

if (Test-Path "src/FairShareScheduler/obj/") {Remove-Item "src/FairShareScheduler/obj/" -Recurse}
if (Test-Path "src/FairShareScheduler.Common/obj/") {Remove-Item "src/FairShareScheduler.Common/obj/" -Recurse}
if (Test-Path "src/FairShareScheduler.Mockup.Service/obj/") {Remove-Item "src/FairShareScheduler.Mockup.Service/obj/" -Recurse}
if (Test-Path "src/FairShareScheduler.Mockup.Worker/obj/") {Remove-Item "src/FairShareScheduler.Mockup.Worker/obj/" -Recurse}
if (Test-Path "src/FairShareScheduler.Tests/obj/") {Remove-Item "src/FairShareScheduler.Tests/obj/" -Recurse}
if (Test-Path "src/FairShareWorker/obj/") {Remove-Item "src/FairShareWorker/obj/" -Recurse}

if (Test-Path "src/Jobs/Analyze/obj/") {Remove-Item "src/Jobs/Analyze/obj/" -Recurse}
if (Test-Path "src/Jobs/AnalyzeLTL/obj/" ) {Remove-Item "src/Jobs/AnalyzeLTL/obj/" -Recurse}
if (Test-Path "src/Jobs/FurtherTesting/obj/") {Remove-Item "src/Jobs/FurtherTesting/obj/" -Recurse}
if (Test-Path "src/Jobs/JobsRunner/obj/") {Remove-Item "src/Jobs/JobsRunner/obj/" -Recurse}
if (Test-Path "src/Jobs/JobsRunner/out/") {Remove-Item "src/Jobs/JobsRunner/out/" -Recurse}
if (Test-Path "src/Jobs/Simulate/obj/") {Remove-Item "src/Jobs/Simulate/obj/" -Recurse}
if (Test-Path "src/Jobs/SimulateLTL/obj/") {Remove-Item "src/Jobs/SimulateLTL/obj/" -Recurse}
if (Test-Path "src/LraWebApiTests/obj/") {Remove-Item "src/LraWebApiTests/obj/" -Recurse}
if (Test-Path "src/LTLCheckRole/obj/") {Remove-Item "src/LTLCheckRole/obj/" -Recurse}
if (Test-Path "src/WebApiTests/obj/") {Remove-Item "src/WebApiTests/obj/" -Recurse}
if (Test-Path "src/Z3test/obj/") {Remove-Item "src/Z3test/obj/" -Recurse}