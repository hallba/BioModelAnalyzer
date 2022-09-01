

def run(args):
    ###@@@@@@@@@@  USER INPUTS @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    # ENTER THE VERSION NUMBER AND THE LISTS OF SHORT CODES FOR THE UNZIP
    print(args)
    ###@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    filename = "selfhost.wxs"
    fromfile = args[1]+filename
    tofile = args[2]+filename
    version = args[3]
    fromproductfile = args[2]+"Product.wxs"
    toproductfile = args[2]+"Product.wxs"
    #tofile = args[1]+filename + ".txt"
    print(fromfile,tofile)
    ### Read the file in ###
    with open(fromfile) as f:
        lines = f.readlines()
        
    # 1) Change id of DirectoryRef to INSTALLFOLDER
    print("### 1) ###")
    madechange = False
    changedlines = []
    for line in lines:        
        thisline = line.strip()                
        if "<DirectoryRef" in thisline and not madechange:
            madechange = True
            changedlines.append('<DirectoryRef Id="INSTALLFOLDER">')            
            print("line:",thisline)
        else:
            changedlines.append(thisline)

        
    # 2) Add line below <File Id="filA97B85B71F0B0F2BFDBCC218714B7FA4" KeyPath="yes" Source="$(var.bma.selfhost.TargetDir)\Analyze.exe" />
    print("### 2) ###")
    lines = changedlines
    changedlines = []        
    for line in lines:
        thisline = line.strip()      
        #print(thisline)
        if 'KeyPath="yes" Source="$(var.bma.selfhost.TargetDir)\\Analyze.exe"' in thisline:            
            print("line:",thisline)
            changedlines.append(thisline)
            changedlines.append('<File Id="versionexe" KeyPath="no" Source="$(var.bma.selfhost.TargetDir)\\version.txt" />')
        else:
            changedlines.append(thisline)

    #print("### TST ###")
    #for line in changedlines:
    #    if 'KeyPath' in line:        
    #        print(line)

    # 3) Delete second version.txt reference    
    print("### 3) ###")
    remlines = []
    componentmatch = ""
    madechange = False    
    for i in range(len(changedlines)):                
        thisline = changedlines[i].strip()                        
        if '(var.bma.selfhost.TargetDir)\\version.txt' in thisline and not madechange:
            madechange = True                                    
        elif '(var.bma.selfhost.TargetDir)\\version.txt' in thisline and madechange:            
            lastline = changedlines[i-1].strip()            
            lasts = lastline.split(" ")
            componentmatch = lasts[1]
            print("component:",componentmatch)
            remlines = [i-1,i-1,i-1] #pop it 3 times and the i-1,i and i+1 will go            
    for p in remlines:        
        print("pop:",changedlines.pop(p))
    

    # 4) Delete <Directory Id="dir39B22699688E51DCD8DCBB99A47E835B" Name="Debug">
    # which is the line below <DirectoryRef Id="TARGETDIR">
    # and above </DirectoryRef>
    print("### 4) ###")    
    for i in range(len(changedlines)-1):
        thisline = changedlines[i].strip()        
        if '<DirectoryRef' in thisline:
            print("pop:",changedlines.pop(i+1))
    for i in range(len(changedlines)-1):
        thisline = changedlines[i].strip()        
        if '</DirectoryRef' in thisline:
            print("pop:",changedlines.pop(i-1))
                    
    # 5) Add line below <File Id="filA97B85B71F0B0F2BFDBCC218714B7FA4" KeyPath="yes" Source="$(var.bma.selfhost.TargetDir)\Analyze.exe" />
    print("### 5) ###")
    lines = changedlines
    changedlines = []
    madechange = False    
    for line in lines:
        thisline = line.strip()        
        if 'Source="$(var.bma.selfhost.TargetDir)\\bma.selfhost.exe"' in thisline and not madechange:
            madechange = True
            print("line:",thisline)
            newline = line[:-2] + ">"
            print("newline:",newline)
            changedlines.append(newline)

            changedlines.append('<Shortcut Advertise="yes"')
            changedlines.append('Id="bmaShortcut"')
            changedlines.append('Directory="DesktopFolder"')
            changedlines.append('Name="BioModelAnalyzer"')
            changedlines.append('WorkingDirectory="INSTALLFOLDER"')
            changedlines.append('Icon="Icon.exe">')
            changedlines.append('<Icon Id="Icon.exe" SourceFile="BMA.ico" />')
            changedlines.append('</Shortcut>')
            changedlines.append('</File>')      
        else:
            changedlines.append(thisline)

    
    # 6) remove a line I don;t know which file it is: cmpEDF0055FCF80C488CE3C264EDF47753D, row 1692+1
    print("### 6) ###")
    for i in range(len(changedlines)-1):
        try:
            thisline = changedlines[i].strip()        
            if componentmatch in thisline:
                print(changedlines.pop(i))
        except:
            print(i)


    ### Write the file out ###
    with open(tofile,"w") as fw:
        for line in changedlines:
            fw.write(line + '\n')



    ######################################################################################################
    # Change the version in Product WXS
    print("### PRODUCT) ###")
    """
    <?xml version="1.0" encoding="UTF-8"?>
    <Wix xmlns="http://schemas.microsoft.com/wix/2006/wi">
    <Product Id="*" Name="BioModelAnalyzer" Language="1033" Version="1.13.0.1" Manufacturer="Ben Hall" UpgradeCode="bd7bae52-02e5-4e54-a04c-a7baa81c493a">
    <Package InstallerVersion="200" Compressed="yes" InstallScope="perMachine" />
    """
    with open(fromproductfile) as f:
        lines = f.readlines()
    
    changedlines = []
    for i in range(len(lines)):
        thisline = lines[i].strip()
        if 'Name="BioModelAnalyzer"' in thisline:
            splits = thisline.split(" ")
            splits[4] = 'Version="'+version+'"'
            newline = " ".join(splits)
            changedlines.append(newline)            
            print("line:",newline)
        else:
            changedlines.append(thisline)

        with open(toproductfile,"w") as fw:
            for line in changedlines:
                fw.write(line + '\n')


            








 
if __name__ == '__main__':
    import sys
    globals()['run'](sys.argv)   


