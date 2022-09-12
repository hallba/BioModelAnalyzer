

def run(args):
    ###@@@@@@@@@@  USER INPUTS @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@    
    print(args)    
    version_major = args[1]
    version_minor = args[2]
    version_build = args[3]
    versionfile = args[4]
    ###@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    version_line = f'{{"major":"{version_major}","minor":"{version_minor}","build":"{version_build}"}}'
    print(version_line)
    
    with open(versionfile,"w") as fw:    
        fw.write(version_line)
    
 
if __name__ == '__main__':
    import sys
    globals()['run'](sys.argv)   


