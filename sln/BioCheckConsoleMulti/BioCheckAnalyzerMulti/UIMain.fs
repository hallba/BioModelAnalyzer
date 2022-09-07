// Copyright (c) Microsoft Research 2016
// License: MIT. See LICENSE
module UIMain

// Alternative entry point for UI, via IAnalyzer interface. 
open System.ComponentModel.Composition
open System.Xml
open System.Xml.Linq

open BioCheckAnalyzerCommon
open BioModelAnalyzer

[<Export(typeof<IAnalyzer>)>]
type Analyzer () = 
    // What kind of a class is it if it has no state? ;-)

    // "The worst-case cost of the stabilization proving procedure using F-New-
    // Lemmas is O(n^2 N^(d+1)) where the network has n variables, of maximal indegree
    // d (N^d results from generating input combinations)." 
    let complexity model = 
            // in case N is not the same for all, we just use the largest
            let N = List.fold (fun n_so_far (n:QN.node) -> max n_so_far (snd n.range)) 0 model
            let n = List.length model
            let d = List.fold (fun d_so_far (n:QN.node) -> max d_so_far (List.length (n.inputs))) 0 model
            (pown n 2 ) * (pown N (d+1))

    let find_cex (model:Model) (notstabilizing_result:AnalysisResult) f_cex = 
            let model = Marshal.QN_of_Model model
            let instability_result = Marshal.stability_result_of_AnalysisResult notstabilizing_result
            let (last_tick,last_bound) = 
                match instability_result with
                | Result.SRNotStabilizing(bounds_history) -> List.maxBy (fun (t,_bounds) -> t) bounds_history
                | _ -> raise(Marshal.MarshalInFailed(4,"FindCEx range argument is not NotStabilizing"))
            let cex_o = f_cex model last_bound 
            cex_o

    interface IAnalyzer with 
        member this.LoggingOn logger = 
            Log.register_log_service logger
            Log.log_debug (sprintf "BioCheck.fs, version %d.%d." Version.major Version.minor)
        
        member this.LoggingOff () = 
            Log.log_debug "Log off."
            Log.deregister_log_service ()

        member this.complexity (input_model:Model) = 
            let network = Marshal.QN_of_Model input_model    
            complexity network

        // 1. VMCAI interface
        member this.checkStability(input_model:Model) = 
            try
                let network = Marshal.QN_of_Model input_model
                let results = Stabilize.check_stability_lazy network
                let results = Seq.toArray results
                let result = results.[results.Length - 1] //Seq.nth ((Seq.length results) - 1) results 
                Marshal.AnalysisResult_of_stability_result result
            with Marshal.MarshalInFailed(id,msg) -> Marshal.AnalysisResult_of_error id msg

        member this.findCExBifurcates(model:Model, analysis_result:AnalysisResult ) = 
            let cex_o = find_cex model analysis_result Stabilize.find_cex_bifurcates            
            match cex_o with 
            | Some(Result.CExBifurcation(fix1,fix2)) -> Some(Marshal.BifurcationCounterExample_of_CExBifurcation fix1 fix2)
            | _ -> None
            //| _ -> failwith "IAnalyzer expected CExBifurcation"

        member this.findCExCycles(model:Model, analysis_result:AnalysisResult ) = 
            let cex_o = find_cex model analysis_result Stabilize.find_cex_cycles
            match cex_o with 
            | Some(Result.CExCycle(cyc)) -> Some(Marshal.CycleCounterExample_of_CExCycle cyc)
            | _ -> None

        member this.findCExFixpoint(model:Model, analysis_result:AnalysisResult ) = 
            let cex_o = find_cex model analysis_result Stabilize.find_cex_fixpoint            
            match cex_o with
            | Some(Result.CExFixpoint(fix)) -> Some(Marshal.FixPointCounterExample_of_CExFixpoint fix)
            | _ -> None

        // SI: Remove xml types from here. 


        // 2. CAV interface
//        member this.checkLTL(input_model:Model, formula:string, num_of_steps:string) = 
//            try
//                let network = Marshal.QN_of_Model input_model
//                let formula = LTL.string_to_LTL_formula formula network true
//                let num_of_steps = (int)num_of_steps 
//                if (formula = LTL.Error) then
//                    Marshal.LTLAnalysisResultDTO_of_error -1 "unable to parse formula"                  
//                else             
//                    let range = Rangelist.nuRangel network
//                    // SI: pass default value of 3rd argument. 
//                    let paths = Paths.output_paths network range 
//                    let padded_paths = Paths.change_list_to_length paths num_of_steps
//
//                    // SI: right now, we're just dumping res,model back to the UI.
//                    // We should structure the data that res,model,model_checked are.
//                    //let (res,model) = BMC.BoundedMC formula network range padded_paths
//                    let (res1,model1,res2,model2) = BMC.DoubleBoundedMCWithSim formula network padded_paths true
//                    let model1_checked = BioCheckPlusZ3.check_model model1 res1 network
//                    let model2_checked = BioCheckPlusZ3.check_model model2 res2 network 
//
//                    Marshal.ltl_result_full res1 model1 (Some(res2,model2))
//
//            with Marshal.MarshalInFailed(id,msg) -> Marshal.LTLAnalysisResultDTO_of_error id msg

        member this.checkLTLSimulation(input_model:Model, formula:string, num_of_steps:string) = 
            try
                let network = Marshal.QN_of_Model input_model
                let formula = LTL.string_to_LTL_formula formula network true
                let num_of_steps = (int)num_of_steps 
                if (formula = LTL.Error) then
                    Some(Marshal.LTLAnalysisResultDTO_of_error -1 "unable to parse formula")                  
                else             
                    let range = Rangelist.nuRangel network

                    // SI: right now, we're just dumping res,model back to the UI.
                    // We should structure the data that res,model,model_checked are.
                    //let (res,model) = BMC.BoundedMC formula network range padded_paths
                    let outcome = BMC.SimulationBasedMC formula network range num_of_steps
                    match outcome with
                    | Some (res, model) -> Some(Marshal.ltl_result_full res model)
                    | None -> None //(false, (0, Map.empty)) // 

                    //Marshal.ltl_result_full res1 model1

            with Marshal.MarshalInFailed(id,msg) -> Some(Marshal.LTLAnalysisResultDTO_of_error id msg)

        member this.checkLTLPolarity(input_model:Model, formula:string, num_of_steps:string, polarity: bool option) = 
            try
                let network = Marshal.QN_of_Model input_model
                let formula = LTL.string_to_LTL_formula formula network true
                let num_of_steps = (int)num_of_steps 
                if (formula = LTL.Error) then
                    (Marshal.LTLAnalysisResultDTO_of_error -1 "unable to parse formula", None)                  
                else             
                    let range = Rangelist.nuRangel network
                    // SI: pass default value of 3rd argument. 
                    let paths = Paths.output_paths network range 
                    let padded_paths = Paths.change_list_to_length paths num_of_steps

                    // SI: right now, we're just dumping res,model back to the UI.
                    // We should structure the data that res,model,model_checked are.
                    //let (res,model) = BMC.BoundedMC formula network range padded_paths
                    
                    //let (res, model) = BMC.SingleSideBoundedMC formula network paths -1 true
                    //Marshal.ltl_double_result_full res model None
                    match polarity with
                    | Some(value) ->
                        let (res, model) = (BMC.SingleSideBoundedMC formula network padded_paths -1 value)
                        Marshal.ltl_double_result_full res model None
                    | None -> 
                        let (res1, model1) = BMC.SingleSideBoundedMC formula network padded_paths -1 true
                        Marshal.ltl_double_result_full res1 model1 (Some (BMC.SingleSideBoundedMC formula network padded_paths -1 false))

                    //Marshal.ltl_double_result_full res model neg

            with Marshal.MarshalInFailed(id,msg) -> (Marshal.LTLAnalysisResultDTO_of_error id msg, None)

////
////        // 3. SYN interface 
////        member this.checkSynth(input_model:Model) = 
////            try 
////                let model = Marshal.QN_of_Model input_model
////                let sug = Suggest.SuggestLoop model
////
////                let result = 
////                   match sug with
////                   | Suggest.Stable(p) -> "Single Stable Point"
////                   | Suggest.NoSuggestion(b) -> "No Suggestion Found"
////                   | Suggest.Edges(edges, nature) -> "Suggested edges:"
////
////                let details = 
////                   match sug with
////                   | Suggest.Stable(p) -> (Expr.str_of_env p)
////                   | Suggest.NoSuggestion(b) -> (QN.str_of_range model b)
////                   | Suggest.Edges(edges, nature) -> (Suggest.edgelist_to_str edges) + " Nature: " + nature.ToString()
////                
////                
////                // SI: stub 
////                //Marshal.xml_of_synth_result result details input_model
////                new XDocument()
////                
////
////            with Marshal.MarshalInFailed(id,msg) -> Marshal.xml_of_error id msg
////            
////        // 4. SCM interface 
////        member this.checkSCM(input_model:Model) = 
////            try
////                let qn = Marshal.QN_of_Model input_model
////                let (stablePoint, cex) = Prover.ProveStability qn
////                let result,details = 
////                    match (stablePoint, cex) with
////                    | (Some p, None) -> 
////                        "SingleStablePoint",  (Expr.str_of_env p)
////                    | (None, Some (Prover.Bifurcation(p1, p2))) -> 
////                        "MultiStablePoints",  ((Expr.str_of_env p1) + "; " + (Expr.str_of_env p2))
////                    | (None, Some (Prover.Cycle(p, len))) -> 
////                        "Cycle", ((Expr.str_of_env p) + ";" + (string)len)
////                    | _ -> 
////                        "UnknownResult", ""
////
////                // SI: stub 
////                //Marshal.xml_of_SCMResult result details
////                new XDocument()
////
////            with Marshal.MarshalInFailed(id,msg) -> Marshal.xml_of_error id msg                
////            
    
        // 5. Simulation interface             
        member this.simulate_tick(model:Model, env:SimulationVariable[]) = 
            let qn = Marshal.QN_of_Model model 

            let mutable m = Map.empty
            for entry in env do
                m <- Map.add entry.Id entry.Value m
            // got an m
            let m' = Simulate.simulate qn m 
            
            let env' : SimulationVariable[] = Array.zeroCreate(Array.length env)
            let idx = ref 0 
            Map.iter 
                (fun k v -> 
                    let i = !idx 
                    let v' = new SimulationVariable ()
                    v'.Id <- k
                    v'.Value <- v
                    env'.[i] <- v'
                    incr idx) 
                m'
            env'

[<Export(typeof<IAnalyzer2>)>]
type Analyzer2() = 
    // What kind of a class is it if it has no state? ;-)

    // "The worst-case cost of the stabilization proving procedure using F-New-
    // Lemmas is O(n^2 N^(d+1)) where the network has n variables, of maximal indegree
    // d (N^d results from generating input combinations)." 
    let complexity model = 
            // in case N is not the same for all, we just use the largest
            let N = List.fold (fun n_so_far (n:QN.node) -> max n_so_far (snd n.range)) 0 model
            let n = List.length model
            let d = List.fold (fun d_so_far (n:QN.node) -> max d_so_far (List.length (n.inputs))) 0 model
            (pown n 2 ) * (pown N (d+1))

    let find_cex (xml_model:XDocument) (xml_notstabilizing_result:XDocument) f_cex = 
            let model = Marshal.model_of_xml xml_model
            let instability_result = Marshal.stabilizing_result_of_xml xml_notstabilizing_result
            let (last_tick,last_bound) = 
                match instability_result with
                | Result.SRNotStabilizing(bounds_history) -> List.maxBy (fun (t,_bounds) -> t) bounds_history
                | _ -> raise(Marshal.MarshalInFailed(4,"FindCEx range argument is not NotStabilizing"))
            match f_cex model last_bound with
            | Some cex -> Marshal.xml_of_cex_result cex
            | None -> null 


    interface IAnalyzer2 with 
        member this.LoggingOn logger = 
            Log.register_log_service logger
            Log.log_debug (sprintf "BioCheck.fs, version %d.%d." Version.major Version.minor)
        
        member this.LoggingOff () = 
            Log.log_debug "Log off."
            Log.deregister_log_service ()

        member this.complexity (input_model:XDocument ) = 
            let network = Marshal.model_of_xml input_model    
            complexity network

        // 1. VMCAI interface
        member this.checkStability(input_model:XDocument) = 
            try
                let network = Marshal.model_of_xml input_model
                let results = Stabilize.check_stability_lazy network
                let results = Seq.toArray results
                let result = results.[results.Length - 1] //Seq.nth ((Seq.length results) - 1) results 
                Marshal.xml_of_stability_result result
            with Marshal.MarshalInFailed(id,msg) -> Marshal.xml_of_error id msg                

        member this.findCExBifurcates(xml_model:XDocument, xml_notstabilizing_result:XDocument ) = 
            find_cex xml_model xml_notstabilizing_result Stabilize.find_cex_bifurcates            

        member this.findCExCycles(xml_model:XDocument, xml_notstabilizing_result:XDocument ) = 
            find_cex xml_model xml_notstabilizing_result Stabilize.find_cex_cycles

        member this.findCExFixpoint(xml_model:XDocument, xml_notstabilizing_result:XDocument ) = 
            find_cex xml_model xml_notstabilizing_result Stabilize.find_cex_fixpoint            

        // 2. CAV interface
        member this.checkLTL(input_model:XDocument, formula:string, num_of_steps:string) = 
            try
                let network = Marshal.model_of_xml input_model
                let formula = LTL.string_to_LTL_formula formula network false
                let num_of_steps = (int)num_of_steps 
                if (formula = LTL.Error) then
                    Marshal.xml_of_error -1 "unable to parse formula"                  
                else             
                    let range = Rangelist.nuRangel network
                    // SI: pass default value of 3rd argument. 
                    let paths = Paths.output_paths network range 
                    let padded_paths = Paths.change_list_to_length paths num_of_steps

                    // SI: right now, we're just dumping res,model back to the UI.
                    // We should structure the data that res,model,model_checked are.
                    let (res1,model1,negative) = BMC.BoundedMC formula network padded_paths false
                    let model_checked = BioCheckPlusZ3.check_model model1 res1 network
//                    let string_model = BioCheckPlusZ3.print_model_to_string model res network true
//                    Marshal.xml_of_ltl_string_result res string_model
//                    Marshal.xml_of_ltl_result res model
                    Marshal.xml_of_ltl_result_full res1 model1

            with Marshal.MarshalInFailed(id,msg) -> Marshal.xml_of_error id msg

        // 3. SYN interface 
        member this.checkSynth(input_model:XDocument) = 
            try 
                let model = Marshal.model_of_xml input_model
                let sug = Suggest.SuggestLoop model

                let result = 
                   match sug with
                   | Suggest.Stable(p) -> "Single Stable Point"
                   | Suggest.NoSuggestion(b) -> "No Suggestion Found"
                   | Suggest.Edges(edges, nature) -> "Suggested edges:"

                let details = 
                   match sug with
                   | Suggest.Stable(p) -> (Expr.str_of_env p)
                   | Suggest.NoSuggestion(b) -> (QN.str_of_range model b)
                   | Suggest.Edges(edges, nature) -> (Suggest.edgelist_to_str edges) + " Nature: " + nature.ToString()
                
                
                Marshal.xml_of_synth_result result details input_model
                
            with Marshal.MarshalInFailed(id,msg) -> Marshal.xml_of_error id msg
            
        // 4. SCM interface 
        member this.checkSCM(input_model:XDocument) = 
            try
                let qn = Marshal.model_of_xml input_model
                let (stablePoint, cex) = Prover.ProveStability qn
                let result,details = 
                    match (stablePoint, cex) with
                    | (Some p, None) -> 
                        "SingleStablePoint",  (Expr.str_of_env p)
                    | (None, Some (Prover.Bifurcation(p1, p2))) -> 
                        "MultiStablePoints",  ((Expr.str_of_env p1) + "; " + (Expr.str_of_env p2))
                    | (None, Some (Prover.Cycle(p, len))) -> 
                        "Cycle", ((Expr.str_of_env p) + ";" + (string)len)
                    | _ -> 
                        "UnknownResult", ""


                Marshal.xml_of_SCMResult result details

            with Marshal.MarshalInFailed(id,msg) -> Marshal.xml_of_error id msg                
            
    
        // 5. Simulation interface             
        member this.simulate_tick(xml_model:XDocument, env:System.Collections.Generic.Dictionary<int,int>) = 
            let qn = 
                try Marshal.model_of_xml xml_model
                with e -> raise(e)

            let mutable m = Map.empty
            for entry in env do
                m <- Map.add entry.Key entry.Value m
            // got an m
            let m' = Simulate.simulate qn m 
            
            let env' = new System.Collections.Generic.Dictionary<int,int>()
            Map.iter (fun k v ->  env'.Add(k,v)) m'
            env'

//open BioModelAnalyzer

//[<Export(typeof<IAnalyzerLTL>)>]
//type AnalyzerLTL () = 
//    // What kind of a class is it if it has no state? ;-)
//
//    // "The worst-case cost of the stabilization proving procedure using F-New-
//    // Lemmas is O(n^2 N^(d+1)) where the network has n variables, of maximal indegree
//    // d (N^d results from generating input combinations)." 
//    let complexity model = 
//            // in case N is not the same for all, we just use the largest
//            let N = List.fold (fun n_so_far (n:QN.node) -> max n_so_far (snd n.range)) 0 model
//            let n = List.length model
//            let d = List.fold (fun d_so_far (n:QN.node) -> max d_so_far (List.length (n.inputs))) 0 model
//            (pown n 2 ) * (pown N (d+1))
//
//    interface IAnalyzerLTL with 
//        member this.LoggingOn logger = 
//            Log.register_log_service logger
//            Log.log_debug (sprintf "BioCheck.fs, version %d.%d." Version.major Version.minor)
//        
//        member this.LoggingOff () = 
//            Log.log_debug "Log off."
//            Log.deregister_log_service ()
//
////        member this.complexity (input_model:Model) = 
////            let network = Marshal.QN_of_Model input_model    
////            complexity network
//
//        member this.checkLTL(input_model:Model, formula:string, num_of_steps:string) = 
//            try
//                let network = Marshal.QN_of_Model input_model
//                let formula = LTL.string_to_LTL_formula formula network
//                let num_of_steps = (int)num_of_steps 
//                if (formula = LTL.Error) then
//                    Marshal.AnalysisResultDTO_of_error -1 "unable to parse formula"                  
//                else             
//                    let range = Rangelist.nuRangel network
//                    // SI: pass default value of 3rd argument. 
//                    let paths = Paths.output_paths network range 
//                    let padded_paths = Paths.change_list_to_length paths num_of_steps
//
//                    // SI: right now, we're just dumping res,model back to the UI.
//                    // We should structure the data that res,model,model_checked are.
//                    let (res,model) = BMC.BoundedMC formula network range padded_paths
//                    let model_checked = BioCheckPlusZ3.check_model model res network
////                    let string_model = BioCheckPlusZ3.print_model_to_string model res network true
////                    Marshal.xml_of_ltl_string_result res string_model
////                    Marshal.xml_of_ltl_result res model
//                    Marshal.xml_of_ltl_result_full res model
//
//            with Marshal.MarshalInFailed(id,msg) -> Marshal.AnalysisResultDTO_of_error id msg
