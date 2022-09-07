// Copyright (c) Microsoft Research 2016
// License: MIT. See LICENSE
module Stabilize

let check_stability_lazy network =
    Log.log_debug ("Starting check_stability_lazy network={" + (String.concat "," (List.map QN.str_of_node network)) + "}" )
    let seq_counter = ref 0 
    let bounds_history = ref [] // in rev order 

    // An alternative implementation of stabilize_lazy is available at
    // stabilize_lazy_1 and stabilize_lazy_2
    // The two should be benchmarked to decide which is the better one for
    // production but have both been tested.
    (GenLemmas.stabilize_lazy network)
    |> Seq.map 
        (fun (still_working,bounds) -> 
            bounds_history := (!seq_counter,bounds) :: !bounds_history
            if still_working then 
                Log.log_debug ("Bounds@t" + (string(!seq_counter)) + " {" + (QN.str_of_range network bounds) + "}")
                let tmp_history = [ (!seq_counter, bounds) ]
                incr seq_counter; Result.SRNotStabilizing(tmp_history) 
            else 
                let stabilized = Map.forall (fun _ (lower,upper) -> upper = lower) bounds
                if stabilized then 
                    Log.log_debug ("Stabilizing: bounds={" + (QN.str_of_range network bounds) + "}")
                    Result.SRStabilizing(!bounds_history)
                else 
                    Log.log_debug ("Not Stabilizing.")
                    Result.SRNotStabilizing(!bounds_history))

let find_cex_bifurcates qn bounds = 
    Counterexample.find_cex_bifurcation qn bounds 

let find_cex_cycles qn bounds = 
    Counterexample.find_cex_cycle qn bounds 

let find_cex_fixpoint qn bounds = 
    Counterexample.find_cex_fixpoint qn bounds 

///Algorithm 1
//let stabilization_proving_proc network range =
//    let bounds = GenLemmas.stabilize network range
//    if stabilized bounds then 
//        Result.Stabilizing(bounds)
//    else
//        Counterexample.find_counterexample network bounds range
let stabilization_prover model no_sat concurrencyType = 
    let results = check_stability_lazy model
    let results = Seq.toArray results
    let result = results.[results.Length - 1] //Seq.nth ((Seq.length results) - 1) results 
    match result with 
    | Result.SRStabilizing(_) -> 
        (result, None) 
    | Result.SRNotStabilizing(bounds_history) -> 
        let (_last_tick,last_bounds) = List.maxBy (fun (t,_b) -> t) bounds_history
        let cex = Counterexample.find_cex model last_bounds no_sat concurrencyType
        Log.log_debug (cex.ToString())
        (result, Some(cex))
