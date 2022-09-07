// Copyright (c) Microsoft Research 2016
// License: MIT. See LICENSE

(* 

    New Z3 manipulation functions required for BioCheckPlus

*)

module BioCheckPlusZ3

open Microsoft.Z3
open VariableEncoding

open Expr
open QN

type VariableRange = Map<QN.var, int list>

// A variable ranging over values i_1,...,i_n can be encoded by n-1 Boolean variables with
// unary encoding.
// If the values are i_1,...,i_n
// and that Boolean variables are v_1,...,v_{n-1}
// The Boolean variables are constrained so that v_j -> v_{j+1}
// So there are actually n possible truth assignments: 
// all are true, n-2 are true, ..., none are true
// The all true encodes the first value in the list (i_1)
// If v_j,...,v_{n-1} are true then the value is i_j
// If all are false then the value is i_n
// In particular, if there is only one possible value there is no need for Boolean variables at all
// If there are two possible values then one Boolean variable suffices. When it is true
// it indicates the first value and when it is false it indicates the second value


let my_floor real_input = int (real_input)
let my_ceil real_input = 
    let int_floor = int (real_input)
    let float_floor = float (int_floor) * 1.0
    if float_floor = real_input then int_floor else int_floor + 1
let my_round real_input = 
    let int_round = int (real_input + 0.5)
    int_round

// Convert an expression to a real value based on map from variables to values
let rec expr_to_real (qn : QN.node list) (node : QN.node) expr var_values = 
    let rec tr expr = 
        match expr with
        | Var v -> 
            let node_min,node_max = node.range 
            let v_defn = List.find (fun (n:QN.node) -> n.var = v) qn
            let v_min,v_max = v_defn.range 
            let scale,displacement = 
                if (v_min <> v_max) then
                    let t = float (node_max - node_min)
                    let b = float (v_max - v_min)
                    (t/b,float (node_min-v_min))
                else (1.0,0.0)
            let var_value = Map.find v var_values
            (float (var_value))*scale + displacement
        | Const c -> float (c)
        | Plus(e1,e2) -> (tr e1) + (tr e2)
        | Minus(e1,e2) -> (tr e1) - (tr e2)
        | Times(e1,e2) -> (tr e1) * (tr e2)
        | Div(e1,e2) -> (tr e1) / (tr e2)
        | Max(e1,e2) -> 
            if (tr e1) > (tr e2) then (tr e1)
            else (tr e2) 
        | Min(e1,e2) -> 
            if (tr e1) < (tr e2) then (tr e1)
            else (tr e2) 
        | Ceil e1 -> ceil(tr e1)
        | Abs e1 -> abs(tr e1)
        | Floor e1 -> floor (tr e1)
        | Ave exprs ->
            let sum = List.fold (fun cur_sum e1 -> cur_sum + (tr e1)) 0.0 exprs
            float (sum) / (float (List.length exprs))
        | Sum exprs ->
            List.fold (fun cur_sum e1 -> cur_sum + (tr e1)) 0.0 exprs
    tr expr

// Allocate Bollean variables per all the values except the last one
let allocate_bool_vars (node : QN.node) (list_of_poss_values : int list) (time :int) (z : Context) =
    let make_var_name item = enc_z3_bool_var_at_time_in_val node time item
    let allocate_z3_bool_var item =  make_z3_bool_var (make_var_name(item)) z
    if list_of_poss_values.IsEmpty then 
        []
    else
        let reversed_list_of_poss_values = List.rev(list_of_poss_values)
        let list_of_poss_values_except_last = List.rev(reversed_list_of_poss_values.Tail)
        List.map allocate_z3_bool_var list_of_poss_values_except_last

let allocate_loop_vars (z : Context) length = 
    if length < 2 then 
        []
    else
        let times  = [ 0 .. length-2 ]
        let allocate_z3_bool_var item =  make_z3_bool_var (enc_z3_bool_var_loop_at_time(item)) z
        List.map allocate_z3_bool_var times
        

let assert_values_for_bool_vars list_of_bool_vars list_of_bool_vals (z : Context) (s : Solver) = 
    if ((List.length list_of_bool_vars) < 2) then
        ()
    else
        let create_assignment variable truth_val =
            if truth_val then
                s.Assert [|variable|]
            else 
                s.Assert(z.MkNot(variable))
        List.iter2 create_assignment list_of_bool_vars list_of_bool_vals

// For every pair of Boolean variables in the list add the constraint that the
// first implies the second
let create_implication_for_bool_vars list_of_bool_vars (z : Context) (s : Solver) = 
    if ((List.length list_of_bool_vars) < 2) then
        ()
    else 
        let create_implication_and_return_second item1 item2 =
            s.Assert(z.MkImplies(item1, item2))
            item2
        List.reduce create_implication_and_return_second list_of_bool_vars
        |> ignore
    
// Create the list of Z3 constraints that correspond to the variable
// having a certain value.
//
// The constraint corresponding to the value i_1 is v_1 
// The constraint corresponding to the value i_j is (and v_j (not v_{j-1}))
// The constraint corresponding to the value v_n is (not v_{n-1})
//
// So we create the lists
// true (not v1) ... (not vn-2) (not vn-1)
//  v1     v2    ...    vn-1       true
// and producing the conjunction of every two matching elements in the two lists
// is the required constraint
//
// Notice that given an empty list this will produce the single constraint (and true true), 
// which is exactly what we want.
let create_value_constraint_list list_of_bool_vars (z : Context) =
    let list_of_negations = List.map (fun item -> z.MkNot(item)) list_of_bool_vars
    let negated_list_with_true_start = z.MkTrue() :: list_of_negations
    let list_with_true_end = List.rev(z.MkTrue() :: List.rev(list_of_bool_vars))
    List.map2 (fun item1 item2 -> z.MkAnd(item1,item2)) negated_list_with_true_start list_with_true_end

// Get the current value of a variable and its target and compute the next value
let apply_target_function value target min  max =
    if value < target && value < max then value + 1
    elif value > target && value > min then value - 1
    else value

// Create the constraint that says that the valuation at time1 is the same as that in time2
// For each variable
let constraint_for_valuation_of_vars_is_equivalent (range1 : VariableRange) time1 (range2 : VariableRange) time2 (z : Context) =
    // Create a pair of the ranges of a single variable
    let var_ranges (variable : var) =
        let r1 = Map.find variable range1
        let r2 = Map.find variable range2
        (r1, r2)

    let value_of_var_at_time_is_val varname time prev curr last = 
        match prev with
        | -1 -> if curr = last then z.MkTrue() 
                else make_z3_bool_var (enc_z3_bool_var_at_time_in_val_from_var varname time curr) z
        | _ -> if curr = last then z.MkNot(make_z3_bool_var (enc_z3_bool_var_at_time_in_val_from_var varname time prev) z)
               else
                    let z3_var = make_z3_bool_var (enc_z3_bool_var_at_time_in_val_from_var varname time curr) z
                    let z3_var_prev = make_z3_bool_var (enc_z3_bool_var_at_time_in_val_from_var varname time prev) z
                    z.MkAnd( z.MkNot(z3_var_prev), z3_var)

    let value_of_var_at_time_is_not_val varname time prev curr last = 
        z.MkNot(value_of_var_at_time_is_val varname time prev curr last)

    let value_of_var_at_time_and_time_is_same varname time1 time2 prev1 prev2 curr1 curr2 last1 last2 = 
        z.MkIff((value_of_var_at_time_is_val varname time1 prev1 curr1 last1),
                (value_of_var_at_time_is_val varname time2 prev2 curr2 last2))

    let pair_of_ranges_to_constraint_list (varname : var) ((range1 : int list), (range2 : int list)) =
        let rec annotate_with_prev list prev = 
            match list with
            | [] -> []
            | x::xs -> (prev,x)::(annotate_with_prev xs x)
        let range1wp = annotate_with_prev range1 -1
        let range2wp = annotate_with_prev range2 -1
        let last1 = range1.[range1.Length-1] //List.nth range1 (range1.Length-1)
        let last2 = range2.[range2.Length-1] //List.nth range2 (range2.Length-1)

        let rec create_constraint_list list1 list2 = 
            match list1 with
            | [] -> List.map (fun (prev2,curr2) -> value_of_var_at_time_is_not_val varname time2 prev2 curr2 last2) list2
            | (prev1,curr1)::xs -> match list2 with
                                   | [] -> List.map (fun (prev1,curr1)-> value_of_var_at_time_is_not_val varname time1 prev1 curr1 last1) list1
                                   | (prev2,curr2)::ys ->
                                        if curr1<curr2 then 
                                           let new_constraint = value_of_var_at_time_is_not_val varname time1 prev1 curr1 last1
                                           (new_constraint::(create_constraint_list xs list2))
                                        elif curr2<curr1 then 
                                            let new_constraint = value_of_var_at_time_is_not_val varname time2 prev2 curr2 last2
                                            (new_constraint::(create_constraint_list list1 ys))
                                        else 
                                            let new_constraint = value_of_var_at_time_and_time_is_same varname time1 time2 prev1 prev2 curr1 curr2 last1 last2 
                                            (new_constraint::(create_constraint_list xs ys))
        create_constraint_list range1wp range2wp

    let variables = List.map (fun (name, range) -> name) (Map.toList range1)
    let variable_ranges = List.map (fun name -> (var_ranges name)) variables

    let constraints_list_list = List.map2 (pair_of_ranges_to_constraint_list) variables variable_ranges
    let constraints_list = List.fold (fun target_list source_list -> List.append target_list source_list) ([]) constraints_list_list
    let final_constraint = List.fold (fun t1 t2 -> z.MkAnd(t1, t2)) (z.MkTrue()) constraints_list
    final_constraint

// The inputs are:
// node - the node for which the constraint on next time point is added
// inputnodes - the list of nodes that are inputs to this node (including itself at the head)
// listOfValues - the list of possible values for the node at current time point
// previousrange - a map from node names to their possible values in previous time step
// current - current time step
// prev -  previous time step
// z - the Z3 context
let constraint_for_target_function_boolean (qn:QN.node list) (node : QN.node) inputnodes listOfValues previousRange current prev (z : Context) (s : Solver) = 
    // 1. Prepare constraints for the node in current time:
    // ====================================================
    // prepare a map from the possible values of node
    // to the constraints that describe that this node gets this value in the current time step
    let bool_vars_for_output = allocate_bool_vars node listOfValues current z
    let value_constraints_for_output = create_value_constraint_list bool_vars_for_output z
    let map_output_values_to_constraints = Map.ofList(List.zip listOfValues value_constraints_for_output)

    // 2. Prepare constraints for the inputs and the node in previous time
    // ===================================================================

    // A funtion getting a node and returning a map from the possible values of that node
    // in the previous time step to the constraints that describe that the variable
    // takes that value in the previous time step
    let create_map_from_elem (elem : QN.node) = 
        let range = Map.find elem.var previousRange // Find the possible ranges of the variable
        let bool_vars = allocate_bool_vars elem range prev z // find the names of boolean variables corresnoding to these values
        let constraints = create_value_constraint_list bool_vars z // create a list of the constraints corresponding to these values
        Map.ofList(List.zip range constraints)

    // Create a list of the maps from possible values of variables to the constraints describing these values
    let list_of_maps_of_constraints = 
        List.map 
            (fun elem -> create_map_from_elem elem) inputnodes
    let map_of_input_vars_to_map_of_values_to_constraints = Map.ofList(List.zip inputnodes list_of_maps_of_constraints)

    // 3. Prepare the list of all possible input values and all possible target values matching them
    //    and all the actual next values matching them
    // =============================================================================================
    // Create a list containing all possible ranges for all inputs
    let nodevar = node.var
    let nodetargetf = node.f
    let list_of_ranges = List.fold (fun acc node -> (Map.find node.var previousRange)::acc) [] inputnodes
    // Create a list of all possible combinations of values for all inputs
    let list_of_possible_combinations = 
        List.rev list_of_ranges |> Seq.fold (fun acc xs -> [for x in xs do for ac in acc -> List.rev(x::(List.rev ac))]) [[]]  
              

    // Get a list of variables and list of values and create a map from variables to values
    let create_map_from_var_to_values list_of_nodes (list_of_values : int list) = 
        let node_to_var (node : QN.node) = node.var
        let convert_node_list_to_var_list node_list = List.map node_to_var node_list
        List.zip (convert_node_list_to_var_list list_of_nodes) list_of_values |> Map.ofList

    let list_of_targets = 
        List.map (fun elem -> expr_to_real qn node nodetargetf (create_map_from_var_to_values inputnodes elem)) list_of_possible_combinations 
    let list_of_int_targets = 
        List.map my_round list_of_targets
    let list_of_actual_next_vals = 
        let compute_actual_next_val target_val inputs_vals = 
            let min,max = node.range
            apply_target_function (List.head inputs_vals) target_val min max 
        List.map2 compute_actual_next_val list_of_int_targets list_of_possible_combinations

    // 4. Create the actual constraints that say that the values of variables respect the "follow the target function" in their changes.
    // ==================================================================================================================================
    // Create the constraint corresponding to one entry in the table of the target function
    // Allocate a Boolean variable for this constraint
    // Assert the constraint
    // return the new Bool var
    let create_transition_option_var list_of_vals next_val = 
        // Allocate a Boolean z3 variable for this transitions
        let make_var_name item = enc_z3_bool_var_trans_of_var_from_time_to_time_uniqueid node prev current item
        let allocate_z3_bool_var item =  make_z3_bool_var (make_var_name(item)) z
        let new_var = allocate_z3_bool_var (gensym "")
        
        // Create a list of constraints corresponding to the values of the inputs in previous time step
        let constraint_from_input_and_val (input : QN.node) value = Map.find value (Map.find input map_of_input_vars_to_map_of_values_to_constraints)
        let list_of_input_constraints = List.fold2 (fun previous_list input value -> (constraint_from_input_and_val input value)::previous_list) [] inputnodes list_of_vals 

        // Create a constraint corresponding to the value of the output in current time step
        let constraint_on_output_from_val value = try Map.find value map_output_values_to_constraints with _ -> z.MkFalse() 
        let output_constraint = constraint_on_output_from_val next_val

        // List of all the constraints on output and inputs
        let joint_list = output_constraint :: list_of_input_constraints
 
        // Add the implication, assert it, and return the new variable
        let implication = z.MkImplies(new_var,z.MkAnd(Array.ofList joint_list))
        s.Assert(implication)
        new_var

    let list_of_new_transition_option_vars = 
        List.map2 create_transition_option_var list_of_possible_combinations list_of_actual_next_vals

    // Reduce the list of constraints to thos that are required:
    // If the list of possible next values does not match the range of possible values
    // then reduce the list of constraints to those that match possible values and take the disjunction of those
    // Otherwise -- the list of possible next values matches the range of possible values --
    // If there is just one possible value then add no constraints
    // If there are multiple possible values then add their disjunction 
    let vals_in_list = List.sort (list_of_actual_next_vals |> Seq.distinct |> List.ofSeq)
    if not ((List.length vals_in_list) = (List.length listOfValues)) || (List.exists2 (fun i j -> not (i=j)) vals_in_list listOfValues) then
        let comb_list = List.zip list_of_new_transition_option_vars list_of_actual_next_vals
        let short_comb_list = List.filter (fun (c, v) -> List.exists (fun lv -> lv=v) listOfValues) comb_list
        let short_constraint_list = List.map (fun (c, v) -> c) short_comb_list
        z.MkOr(Array.ofList short_constraint_list)
    else 
        if List.length vals_in_list = 1 then
            z.MkTrue()
        else
            z.MkOr(Array.ofList list_of_new_transition_option_vars)

// If time and last are the same then there
// is one time point on the loop and the loop must
// close on that time point
// Otherwise, to encode time 0 all variables must be true
// ---> the constraint is l0
// Otherwise, to encode time last all variables must be false
// ----> the constraint is !l(last-1)
// Otherwise, the constraint is !l(time-1) /\ l(time)
let constraint_for_loop_at_time time last (z : Context) =
    let z3_loop_var_t = 
        if (time = last) then
            z.MkTrue ()
        else 
            let loop_var_t = enc_z3_bool_var_loop_at_time time
            make_z3_bool_var loop_var_t z

    if (time = 0) then
        z3_loop_var_t
    else 
        let loop_var_t_min_1 = enc_z3_bool_var_loop_at_time (time-1)
        let z3_loop_var_t_min_1 =  make_z3_bool_var loop_var_t_min_1 z
        let not_z3_loop_var_t_min_1 = z.MkNot(z3_loop_var_t_min_1)
        z.MkAnd(not_z3_loop_var_t_min_1,z3_loop_var_t)

// Constraint that says that time time is inside the loop
let constraint_for_time_is_part_of_loop time last (z : Context) = 
    let z3_loop_var_t =
        if (time = last) then
            z.MkTrue()
        else
            let loop_var_t = enc_z3_bool_var_loop_at_time time
            make_z3_bool_var loop_var_t z
    z3_loop_var_t

// Constraint that says that the loop closes at the last time
// This assumes that time is the last time and does not check it!
let constraint_for_loop_closes_at_last time (z : Context) =
    if time = 0 then
        z.MkTrue()
    else
        let loop_var_t_minus_1 = enc_z3_bool_var_loop_at_time (time - 1)
        let z3_loop_var_t_minus_1 = make_z3_bool_var loop_var_t_minus_1 z
        z.MkNot(z3_loop_var_t_minus_1)

type BoolVarType = 
    | VarEncode of int * int * int // variable id * time * value
    | TransEncode of int * int * int * int // variable id * fromTime * toTime * value
    | FormulaEncode of int list * int // location in formula tree * time
    | LoopEncode of int // time
    | BadEncode


let IsAVar (s : string) =  s.StartsWith("v")
let IsATran (s : string) = s.StartsWith("tv")
let IsALoop (s : string) = s.StartsWith("l")
let IsAFormula (s : string) = s.StartsWith("f")

// The three types of variables that need handling are:
// %s^%d^%d" node.name time value 
// "l%d" time
// "t%s^%d^%d^%d" node.name from_time to_time value
let string_to_BoolVarType (s : string) = 
    if (IsATran(s)) then 
        let substring = s.Substring(2)
        let l = substring.Split [| '^' |]
        let id = (int) l.[0]
        let from_time = (int) l.[1]
        let to_time = (int) l.[2]
        let value = (int) l.[3]
        TransEncode (id, from_time, to_time, value)
    elif (IsAVar(s)) then 
        let substring = s.Substring(1)
        let l = substring.Split [| '^' |]
        let id = (int) l.[0]
        let time = (int) l.[1]
        let value = (int) l.[2]
        VarEncode (id, time, value)
    elif (IsALoop(s)) then
        let substring = s.Substring(2)
        let time = (int) substring
        LoopEncode (time)
    elif (IsAFormula(s)) then
        let substring = s.Substring(1)
        let l = substring.Split [| '^' |]
        let values_list = Array.toList l
        let location_list = List.rev(List.tail(List.rev values_list))
        let time_string = List.head((List.rev values_list)) 
        let time = (int) time_string
        let location_list_without_empty_strings = List.collect (fun string -> if string = "" then [] else [string]) location_list
        let location = 
            if (location_list_without_empty_strings.IsEmpty)
            then
                []
            else
                List.map (fun (s:string) -> (int) s) location_list_without_empty_strings
        FormulaEncode (location, time)
    else
        BadEncode

let convertMapToBool map =    
    let res = map |> Map.map(fun _ -> System.Int32.Parse)
    map |> Map.map(fun _ -> System.Boolean.Parse)

let z3_model_to_loop (model : Model) (paths : Map<QN.var,int list> list) = 
    // Analyze the model
    // ===================================================

    // *loop* is a map from times to bool
    // The value of loop[time] is the truth value of 'l'time
    // *vars* is a map from times to map from varid to map from value to truth values
    // The value of ((vars[time])[id])[value] is the truth value of 'v'id^time^value    
    let fixpoint = Z3Util.model_to_fixpoint model |> convertMapToBool
    let loop, vars =
        fixpoint 
        |> Map.fold(fun (loop,vars) z3_var_name truth_val ->
            match string_to_BoolVarType z3_var_name with 
            | BadEncode _
            | TransEncode _
            | FormulaEncode _ -> loop, vars

            | VarEncode (id, time, value)  -> 
                let map_of_var = 
                    match vars |> Map.tryFind time with
                    | Some m -> m
                    | None -> Map.empty
                let map_of_val = 
                    match map_of_var |> Map.tryFind id with
                    | Some m -> m
                    | None -> Map.empty
                let new_map_of_val = map_of_val |> Map.add value truth_val 
                let new_map_of_var = map_of_var |> Map.add id new_map_of_val 
                loop, vars |> Map.add time new_map_of_var

            | LoopEncode (time) -> 
                loop |> Map.add time truth_val, vars
                
            ) (Map.empty, Map.empty)
    
    // Analyze the maps consructed above
    // =================================
    // Check where the loop closes
    let loop_close = ref 0 
    // If path length is 1 then the loop closes at time 0.
    // Otherwise, the loop closes at the point of the first
    // variable that is true.
    // So, go over all possible loop variables in order.
    // Whenever finding one that is false (or does not exist)
    // increase the loop_close
    if (paths.Length > 1) then
        for i in 0..(paths.Length - 2) do
            // Notice that the model is not necessarily comprehensive
            // If a truth value of some var does not appear in the model I decide
            // to assign this var false
            if not (Map.containsKey i loop) then
                incr loop_close
            elif not (Map.find i loop) then
                incr loop_close
        ()
    
    // Check the values of all variables
    let time = ref 0
    let map_of_time_to_map_of_var_to_value = ref Map.empty
    for path in paths do
        let current_map = 
            // The model does not contain information for this time
            if not (Map.containsKey !time vars) then
                Map.empty
            else
                Map.find !time vars
        let map_of_var_to_value = ref Map.empty
        for entry in path do
            let ((var : QN.var), (l: int list)) = (entry.Key,entry.Value)
            let actual_value = 
                if not (Map.containsKey ((int) var) current_map) then
                    l.Head
                else
                    let values = Map.find ((int) var) current_map
                    // Recall that the encoding is as follows:
                    // v_1 is true then the value is the head of l
                    // v_{j-1} is false and v_j is true then the value is the j-th value in l
                    // v_{n} is false then the value is the last value in l
                    let temp_actual_value = ref l.Head
                    let previous_value = ref l.Head
                    for value in (List.tail l) do
                        // Notice that the model is not necessarily comprehensive
                        // If a truth value of some var does not appear in the model I decide
                        // to assign this var false
                        if not (Map.containsKey !previous_value values) then
                            temp_actual_value := value
                        elif not (Map.find !previous_value values) then
                            temp_actual_value := value
                        // else
                        //    break // does not exist in F#
                        previous_value := value
                    !temp_actual_value
            map_of_var_to_value := Map.add var actual_value !map_of_var_to_value
        map_of_time_to_map_of_var_to_value := Map.add !time !map_of_var_to_value !map_of_time_to_map_of_var_to_value
        incr time
  
    let temp_loop_close = !loop_close
    let temp_map = !map_of_time_to_map_of_var_to_value
    temp_loop_close, temp_map
    // (!loop_close, !map_of_time_to_map_of_var_to_value)

let print_model (model : (int * Map<int, Map<var,int>>)) (sat : bool) (network : QN.node list) (output_model : bool) = 
    let (loop_close ,map_time_to_map) = model 
    if not (sat) 
    then
        Log.log_debug "Unsatisfiable!"
    elif (output_model) then 
        Log.log_debug "The model is (csv):"
        // print a line with the names of all the variables
        let mutable all_vars = "time"
        for var in network do
            all_vars <- all_vars + "," + var.name

        Log.log_debug all_vars

        let i = ref 0
        while (Map.containsKey !i map_time_to_map) do

            let mutable line = sprintf "%d" !i
            
            let map_var_to_value = Map.find !i map_time_to_map
            for var in network do 
                if Map.containsKey var.var map_var_to_value
                then 
                    let the_value = Map.find var.var map_var_to_value 
                    let the_value_string = sprintf "%d" the_value
                    line <- line + "," + the_value_string
                else
                    line <- line + ",?"

            if loop_close = !i then
                line <- line + ",<---"
                
            Log.log_debug line 
            
            incr i
    else
        Log.log_debug "Satisfiable!"

let check_model (model : (int * Map<int, Map<var,int>>)) (sat : bool) (network : QN.node list) = 
    let result_true = ref true
    let check_all_nodes (previous_time : Map<var,int>) (current_time : Map<var,int>) (previous_step : int) (current_step : int) =
        for node in network do
            let computed_target_value = expr_to_real network node node.f previous_time 
            let rounded_target_value = my_round computed_target_value
            let min,max = node.range
            let next_value = apply_target_function (Map.find node.var previous_time) rounded_target_value min max
            let current_output_value = Map.find node.var current_time
            if not (current_output_value = next_value)
            then
                Log.log_debug ("At transition from time " + (string)previous_step + " to time " + (string)current_step + " the value of " + node.name + " is wrong!!!!!")
                result_true := false

    let (loop_close ,map_time_to_map) = model 
    if not (sat) 
    then
        Log.log_debug "Can't check a nonexistent model"
        ()
    else
        let i = ref 0
        let previous_time = ref Map.empty
        let loop_closure = ref Map.empty
        while (Map.containsKey !i map_time_to_map) do

            let current_time = Map.find !i map_time_to_map

            if (loop_close = !i)
            then
                loop_closure := current_time

            if not (!previous_time).IsEmpty
            then
                check_all_nodes !previous_time current_time (!i - 1) !i
            ()

            previous_time := current_time 
            incr i

        // After completion of the loop previous_time is a ref to the last 
        // map in the list and i is the first index not in the map
        check_all_nodes !previous_time !loop_closure (!i - 1) loop_close
    
        if !result_true
        then
            Log.log_debug "Checked the model and it seems fine!"
        ()
