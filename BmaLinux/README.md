# BmaLinux

This project can be build as a standalone solution with msbuild on linux or mac.
It does not need the prepare scripts that the main project needs, this directory can be moved somewhere on its own for the build.

Open the solution BioCheckConsoleMulti.sln
 
The executable to run will be built in (release or debug):

BioCheckConsoleMulti/bin/Release/netcoreapp3.1/BioCheckConsoleMulti

An example is to call it from the command line like

./BioCheckConsoleMulti -model ToyModelUnstable.json -engine SCM


