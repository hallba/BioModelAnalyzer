

def run(args):
    ###@@@@@@@@@@  USER INPUTS @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@    
    print(args)    
    version_major = str(args[1])
    version_minor = str(args[2])
    version_build = str(args[3])
    versionfile = args[4]
    ###@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@                        
    ### Read the file in ###
    with open(versionfile) as f:
        lines = f.readlines()

    ### Change the file ###
    changedlines = []        
    for line in lines:
        thisline = line.strip()              
        if 'string responseMessage = ' in thisline:            
            print("line:",thisline)
            newline = f'string responseMessage = "BMA Server Version {version_major}.{version_minor}.{version_build}";'
            print(newline)
            changedlines.append(newline)            
        else:
            changedlines.append(thisline)
    
    ### write the file ###
    with open(versionfile,"w") as fw:
        for line in changedlines:
            fw.write(line + '\n')
    
 
if __name__ == '__main__':
    import sys
    globals()['run'](sys.argv)   


