# BioModelAnalyzer
BioModelAnalyzer is a user-friendly tool for constructing biological models and verifying them

This version is a prototype for the multi-platform version specially designed for Linux and HPC parallelisation.

### Overview 
This project can be build as a standalone solution with msbuild on linux or mac.

### In Windows

Open the solution BioCheckConsoleMulti.sln
 
The executable to run will be built in (release or debug):

BioCheckConsoleMulti/bin/Release/netcoreapp3.1/BioCheckConsoleMulti

### Mac/Linux

Instructions on installing the dotnet runtime: https://learn.microsoft.com/en-us/dotnet/core/install/linux-ubuntu
Instructions on installing mono: https://www.mono-project.com/docs/getting-started/install/linux/
Run the prepare script
```.\PrepareRepositoryNix.sh```
Build the project
```
msbuild BioCheckConsoleMulti.sln /p:Configuration=Release /p:Platform="x64" /t:Rebuild
```


### Simple Example 
An example is to call it from the command line like

./BioCheckConsoleMulti -model ToyModelUnstable.json -engine SCM

### Further info on WIKI
https://github.com/hallba/BioModelAnalyzer/wiki/LinuxBuild





