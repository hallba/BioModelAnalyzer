

import os
import subprocess

code_file_location_hry = os.path.dirname(os.path.realpath(__file__)).replace("\\","/").split("/")
print(code_file_location_hry)
root_dir = "/".join(code_file_location_hry[:-1]) + "/" 
print(root_dir)
exe_path = root_dir + "BioCheckConsoleMulti/Bin/Release/netcoreapp3.1/BioCheckConsoleMulti.exe"
print(exe_path)

data_location_path = root_dir + "/MultiTests/"
print(data_location_path)

args_list = []

# Create some test scripts and data
# 1 ############################
args = [exe_path]
args.append("-engine")
args.append("VMCAI")
args.append("-model")
args.append(data_location_path+"RA_fibroblast_complex_corrected_phenotype_corrected_and_homogenized.json")
args.append("-prove")
args.append("stability_analysis1.json")
args.append("-ko")
args.append("58")
args.append("0")
args.append("-ko")
args.append("12")
args.append("1")
args_list.append(args)
# 2 ############################
args = [exe_path]
args.append("-engine")
args.append("VMCAI")
args.append("-model")
args.append(data_location_path+"RA_M1_macrophage_complex_corrected_phenotype_corrected_and_homogenized.json")
args.append("-prove")
args.append("stability_analysis2.json")
args.append("-ko")
args.append("58")
args.append("0")
args.append("-ko")
args.append("12")
args.append("1")
args_list.append(args)
# 3 ############################
args = [exe_path]
args.append("-engine")
args.append("VMCAI")
args.append("-model")
args.append(data_location_path+"RA_M2_macrophage_complex_corrected_phenotype_corrected_and_homogenized.json")
args.append("-prove")
args.append("stability_analysis3.json")
args.append("-ko")
args.append("58")
args.append("0")
args.append("-ko")
args.append("12")
args.append("1")
args_list.append(args)
# 4 ############################
args = [exe_path]
args.append("-engine")
args.append("VMCAI")
args.append("-model")
args.append(data_location_path+"RA_TH1_complex_corrected_phenotype_corrected_and_homogenized.json")
#args.append("-log")
args.append("-prove")
args.append("stability_analysis4.json")
args.append("-ko")
args.append("58")
args.append("0")
args.append("-ko")
args.append("12")
args.append("1")
args_list.append(args)
# 5 ############################
args = [exe_path]
args.append("-engine")
args.append("FIXPOINT")
args.append("-model")
args.append(data_location_path+"RA_fixpoint.json")
#args.append("-log")
args.append("-prove")
args.append("stability_analysis5.json")
args_list.append(args)

# Run the data ############################
for args in args_list:
	print("Checking",args)
	process = subprocess.Popen(args=args, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
	result = process.communicate()
	print(result)

# Check the results #######################
results = []
results.append([data_location_path, "stability_analysis1.json"])
results.append([data_location_path, "stability_analysis2.json"])
results.append([data_location_path, "stability_analysis3.json"])
results.append([data_location_path, "stability_analysis4.json"])
results.append([data_location_path, "stability_analysis5.json"])
results.append([data_location_path, "fixpoints.csv"])

all_same = True
for loc,fl in results:
	this_same = True
	print("Testing",fl)
	res_file = loc + fl
	reg_file = loc + "reg_" + fl
	with open(res_file,"r") as f1:
		res_lines= f1.readlines()
	with open(reg_file,"r") as f2:		
		reg_lines= f2.readlines()
		
	for i in range(max(len(res_lines),len(reg_lines))):		
		reg_ln,res_ln = "",""
		if i < len(res_lines):
			res_ln = res_lines[i]
		if i < len(reg_lines):
			reg_ln = reg_lines[i]
		if (str(res_ln) != str(reg_ln)):			
			print("ERROR",i,res_ln[:10],reg_ln[:10])
			all_same = False
			this_same = False
	if not this_same:
		print("FAILED", loc,fl)

print("###########################")
print("#### RESULTS ##############")
if all_same:
	print("All results are the same as regression results")
else:
	print("!!! There have been errors !!!")
print("###########################")