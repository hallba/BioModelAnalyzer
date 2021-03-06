// Copyright (c) Microsoft Research 2016
// License: MIT. See LICENSE
/*
 * Condition.h
 *
 *  Created on: 18 Mar 2014
 *      Author: np183
 */

#ifndef CONDITION_H_
#define CONDITION_H_

#include <iosfwd>
#include <map>

class Condition;

#include "State.h"
#include "Simulation.h"
#include "Expression/BoolExp.h"

class Condition {
public:
	Condition()=delete;
	Condition(const std::string& initializer);
	Condition(const Condition&);
	Condition(Condition&&);

	virtual ~Condition();

	bool isDef() const;

	void addCellCycle(const std::string& cellCycle);

	// Returns a pair of values:
	// 1. Is the condition satisfied by the state
	// 2. What is the satisfaction value
	// If the condition is default it is satisfied by
	// every state with the value 0.
	// Otherwise, the value is the number of conjuncts that are
	// satisfied.
	// The simulation is needed in order to evaluate conditions on other Cells.
	std::pair<bool,unsigned int> evaluate(const State* st, const Simulation* sim, float from, float to) const;

	// Should be identical
	bool operator==(const Condition& other) const;

	// One condition is smaller than the other if:
	// 1. Default is the minimum
	// 2. The first conjunct that is different is either
	//    with smaller string or false vs true.
	bool operator<(const Condition& other) const;

	friend std::ostream& operator<< (std::ostream&, const Condition&);
private:
	bool _def;
	BoolExp* _conjunction;

	// bool _generalCondition(const std::string &) const;
};

#endif /* CONDITION_H_ */
