# Onboarding Development for BioModelAnalyzer @ UCL-ARC

This document is intended to help developers at UCL's Advanced Research Computing centre with support, development and maintence of the BioModelAnalyzer application


## Installation
- Clone BioModelAnalyser
- Open the terminal powershell within visual studio
- Run the three powershell scripts:
- - .\PrepareRepository.ps1
- - .\build.ps1
- - .\run.ps1


## First Run - sanity check
- Run will start a server and open an html page, once happy shut them down.

## Regresssion tests - sanity check
- Open the sln in bma.client
- Choose x64 if in Windows 10
- Clean
- Rebuild solution
- In Tests folder, right click and Run Tests on BackEndTests 18 should pass


## Development - quick overview


### Stye sheets and web pages

- The html pages are located in solution bma.client in the main folder or the html folder.
- The css style sheets are in fact less sheets located in, from the main folder
- - src/bma.package/css/ then eg website.less is the front page css sheet.


### Funtional code
- The bug fix for initial deploy is in
- - src/BioCheckAnalyzer/Expr.fs

## Deployment
Watch the video: https://web.microsoftstream.com/video/e8a3b377-c26c-4fa4-96fe-33d276cc90a0

On Azure it runs on a single dedicated virtual machine.

19:0 on video shows downloading a the publish profile from Azure

20:0 shows editing the config with onedrive private key

1. Locally
Run the 3 powershell scripts, or just the all-in-one:
- .\BuildAndRun.ps1

2. Version number

3. Release notes
Manually change the release notes
https://bmainterfacetest.azurewebsites.net/ReleaseNotes.html

4. Standalone version
From bma.client compile bma.selfhost


4. Staging


5. Production
- Create a tag (shown at 2:24 on video)
- Online application:
- - On Azure is bmainterface

- Offline application:
(BackEndFunctions sln) (5:16 on video)
- - On Azure is bmafunctionscore

6. WebConfig update POST RELEASE
- The Webconfig onedrive key is private and not in github

7. Deployment checks


