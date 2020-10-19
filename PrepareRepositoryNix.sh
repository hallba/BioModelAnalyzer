mkdir .paket
cd .paket
wget https://github.com/fsprojects/Paket/releases/download/5.249.2/paket.bootstrapper.exe
mono paket.bootstrapper.exe --run install
