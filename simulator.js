BattleSimulator = function(params) {
    var updateResultCallback = params.updateResultCallback;

    // static data (never changes)
    var unitRemovalPriority = createRemovalPriorityArray(); // sorted array of unit indices, starting with lowest-value unit (infantry)
    // Config options:
    var battleIterations = 1000;
    var useDice = true; // set to false to simulate an "ideal" no-luck battle.
    // unit indices for lookups
    var artilleryIndex = findUnit("Artillery");
    var infantryIndex = findUnit("Infantry");
    var mechanizedInfantryIndex = findUnit("Mechanized Infantry");
    var tankIndex = findUnit("Tank");
    var fighterIndex = findUnit("Fighter");
    var tacticalBomberIndex = findUnit("TacticalBomber");

    // per-battle data (changes when the user changes the unit count and simulateNewBattle is called)
    var initialAttackerUnits = [];
    var initialAttackerUnitCount = 0;
    var initalAttackerUnitCost = 0;
    var initialDefenderUnits = [];
    var initialDefenderUnitCount = 0;
    var initalDefenderUnitCost = 0;

    // per-simulation data, reset before and changes during each simulation round.
    var attackerUnits = [];
    var attackerUnitCount = 0;
    var defenderUntis = [];
    var defenderUnitCount = 0;
    var carriedHits = []; // carries fractional hits to the next battle round when useDice is false;


    // output data, accumulates as the simulations are run.
    var results = {
        simulationCount : 0,
        attackerWins : 0,
        defenderWins : 0,
        mutalAnhiliation : 0,

        // frequency counts in sparse arrays. arr[x] gives the number of times x has occured.
        attackerIpcLoss : [],
        attackerRemaningUnitCount : [],
        defenderIpcLoss : [],
        defenderRemaningUnitCount : [],
        battleRounds : [],

        idealBattleLog : "",
        simulatedBattleLogs : [],
        battleLog : ""
    }

    function findUnit(unitName) {
        var foundIndex = -1;
        UnitStats.each(function(index, value) {
            if (value[0] == unitName) {
                foundIndex = index;
                return false;
            }
        });
        return foundIndex;
    }

    function createRemovalPriorityArray()
    {
        var i = 0;
        var array = [];
        $.each(UnitStats, function(index, value) { array.push(i++); });

        // sort based on the IPC cost unit stat
        array.sort(function(a,b){return UnitStats[a][3] - UnitStats[b][3]});
        // console.log(array);
        return array;
    }

    // creates a sparse unit array by only inlcuding indices with a positive unit count.
    function createSparseUnitArrayCopy(array)
    {
        var newArray = [];
        $.each(array, function(index, value) {
            if (value > 0)
                newArray[index] = value;
        });
        return newArray;
    }

    function countUnits(unitArray, planesOnly) {
        //console.log("countUnits " + unitArray);
        var unitCount = 0;
        if (planesOnly === undefined)
            planesOnly = false;
        unitArray.each(function(index, count) {
            //console.log("countUnits at " + index + " " + count);
            if (!planesOnly || UnitStats[index][4] == true)
                unitCount += count;
        });
        //console.log("countUnits " + unitCount);
        return unitCount;
    }

    function calculateUnitCost(unitArray) {
        var unitCost = 0;
        unitArray.each(function(index, count) {
            unitCost += count * UnitStats[index][3];
        });
        return unitCost;
    }

    function sparseArrayToString(array, appendage) {
        if (appendage == undefined)
            appendage = "";
        var string1 = "";
        array.each(function(index, count) {
            string1 += (index + ":" + count + appendage + " ")
        });
        return string1;
    }


    function simulateNewBattle(newAttackerUnits, newDefenderUnits, newDefenderAAGun) {
        initialAttackerUnits = createSparseUnitArrayCopy(newAttackerUnits);
        initialAttackerUnitCount = countUnits(initialAttackerUnits);
        initalAttackerUnitCost = calculateUnitCost(initialAttackerUnits);
        initialDefenderUnits = createSparseUnitArrayCopy(newDefenderUnits);
        initialDefenderUnitCount = countUnits(initialDefenderUnits);
        initialDefenderAAGun = newDefenderAAGun;
        initalDefenderUnitCost = calculateUnitCost(initialDefenderUnits);

        results.attackerUnitCost = initalAttackerUnitCost;
        results.defenderUnitCost = initalDefenderUnitCost

        results.simulationCount = 0;
        results.attackerWins = 0;
        results.defenderWins = 0;
        results.mutalAnhiliation = 0;

        results.attackerIpcLoss = [];
        results.attackerRemaningUnitCount = [];
        results.defenderIpcLoss = [];
        results.defenderRemaningUnitCount = [];
        results.battleRounds = [];

        results.idealBattleLog = "";
        results.simulatedBattleLogs = [];
        results.battleLog = "";

        simulateBattle();
    }

    function simulateBattle() {
        results.battleLog = "";

        for (var i = 0; i < battleIterations; ++i) {
            setupSimData();
            simulateOneBattle();
            results.simulatedBattleLogs[i] = results.battleLog;
        }

        function prettyPrintSparseArray(array) {
            return sparseArrayToString(array.map(
                function (value){
                    return Math.round((value / results.simulationCount) * 100.0)
                 }
             ), "%");
        }
        updateResultCallback(results);
  }



    function setupSimData()
    {
        attackerUnits = initialAttackerUnits.slice(0);
        attackerUnitCount = initialAttackerUnitCount;
        defenderUnits = initialDefenderUnits.slice(0);
        defenderUnitCount = initialDefenderUnitCount;
        defenderAAGun = initialDefenderAAGun;
    }

    function simulateOneBattle() {
        //results.defenderIpcLoss("Fight!");
        carriedHits = [];

        var roundCounter = 1;

        //results.defenderIpcLoss("first Unit count: " + attackerUnits + " " + defenderUnits);
        results.battleLog += "Start ";
        results.battleLog += "Units Left: " + attackerUnitCount + " " + defenderUnitCount+ " <br>";

        if (defenderAAGun == true)
            simulateAAGunFire();

        // Run battle rounds until one side is out of units.
        while (attackerUnitCount > 0 && defenderUnitCount > 0) {
            results.battleLog += "Round " + roundCounter++ + " ";
            // results.defenderIpcLoss("begin while loop");
            simulateBattleRound();
            results.battleLog += "Units Left: " + attackerUnitCount + " " + defenderUnitCount + " "
                         + attackerUnits + " " + defenderUnits + " <br>";

            // results.defenderIpcLoss("Unit count: " + attackerUnits + " " + defenderUnits);

        }

        function incrementArrayValue(array, index)
        {
           if (array[index] == undefined)
                array[index] = 1;
           else
                ++array[index];
        }

        // Determine winner, update output data
        ++results.simulationCount;
        incrementArrayValue(results.battleRounds, roundCounter);
        incrementArrayValue(results.defenderIpcLoss, initalDefenderUnitCost - calculateUnitCost(defenderUnits));
        incrementArrayValue(results.defenderRemaningUnitCount, defenderUnitCount);
        incrementArrayValue(results.attackerIpcLoss, initalAttackerUnitCost - calculateUnitCost(attackerUnits));
        incrementArrayValue(results.attackerRemaningUnitCount, attackerUnitCount);

        if (attackerUnitCount == 0 && defenderUnitCount == 0) {
            results.battleLog += "Mutal Annhiliation!";
            ++results.mutalAnhiliation;
        } else if (attackerUnitCount == 0) {
            results.battleLog += "Defender Wins!";
            ++results.defenderWins;
        } else if (defenderUnitCount == 0) {
            results.battleLog += "Attacker Wins!";
            ++results.attackerWins;
        }
    };

    function simulateAAGunFire()
    {
        var planeCount = countUnits(attackerUnits, true /* planes only*/);
        var hits = 0;

        for (var i = 0; i < planeCount; ++i) {
            var dieRoll = Math.floor(Math.random()*6) + 1;
            if (dieRoll == 1)
                ++hits;
        }

        removeCasulties(attackerUnits, attackerUnitCount, hits,  true /* planes only*/)
    }

    // Runs one round of battle simultaion ( attacker fires, defender fires, casulties removed etc.)
    function simulateBattleRound()
    {
        //results.defenderIpcLoss("simulateBattleRound");
        var attackerHits = simulateUnitFire(attackerUnits, 1);
        var defenderHits = simulateUnitFire(defenderUnits, 2);

        //results.defenderIpcLoss("hits " + attackerHits + " " + defenderHits);
        results.battleLog += "Hits:" + attackerHits + " " + defenderHits + "  ";

        attackerUnitCount = removeCasulties(attackerUnits, attackerUnitCount, defenderHits);
        defenderUnitCount = removeCasulties(defenderUnits, defenderUnitCount, attackerHits);
    }

    // In: an array of unit counts, which stat index to use (attacker or defender).
    // Returns the number of hits. Uses simulated die rolls if useDice is true,
    // otherwise computes the "ideal" number of hits.
    // Some special cases follows from the Axis&Allies rules:
    //    - Artillery upgrades infantery and mech. infantery in attack.
    //    - Tanks or fighters upgrades tactical bombers in attack.
    function simulateUnitFire(units, statIndex)
    {
        //results.defenderIpcLoss("simulateUnitFire " +units);
        var hits = 0;

        var artilleryUpgrades = units[artilleryIndex] === undefined ? 0 : units[artilleryIndex];
        var fighterUpgrades = units[fighterIndex] === undefined ? 0 : units[fighterIndex];
        var tankUpgrades = units[tankIndex] === undefined ? 0 : units[tankIndex];

        units.each(function(unitIndex, count) {
            if (useDice) {
               for (var i = 0; i < count; ++i) {
                  var toHit = UnitStats[unitIndex][statIndex];

                  // Upgrades:
                  if (statIndex == 1) { // attack only
                  if (artilleryUpgrades > 0 && (unitIndex == infantryIndex || unitIndex == mechanizedInfantryIndex)) {
                    ++toHit;
                    --artilleryUpgrades;
                  } else if (fighterUpgrades > 0 && unitIndex == tacticalBomberIndex) {
                    ++toHit;
                    --fighterUpgrades;
                  } else if (tankUpgrades > 0 && unitIndex == tacticalBomberIndex) {
                    ++toHit;
                    --tankUpgrades;
                } }

                  var dieRoll = Math.floor(Math.random()*6) + 1;
                  // results.defenderIpcLoss("die " + dieRoll + "tohit " + toHit)
                  if (dieRoll <= toHit)
                    ++hits;
                }
             } else { // no dice
                var computedHits = carryHits[statIndex] + toHit.map('/ 6.0').reduce('+');
                var floorHits = Math.floor(computedHits);
                carryHits[statIndex] = computedHits - floorHits;
                hits = floorHits;
             }
        });
        return hits;
    }


    function removeCasulties(units, unitCount, hits, planesOnly)
    {
       // sole.log("removeCasulties " + unitCount);
        unitCount = Math.max(0, unitCount - hits);

        // remove units from the units array, starting at the
        // cheapest ones. Keep going until all hits have been
        // taken or we run out of units.
        unitRemovalPriority.each(function(index, value) {
            if (hits == 0)
                return false;
            if (planesOnly && UnitStats[value][4] == false)
                return true;
            var currentUnitCount = units[value];
            if (currentUnitCount == undefined || currentUnitCount == 0)
                return true;
            if (hits > currentUnitCount) {
                units[value] = 0;
                hits -= currentUnitCount;
            } else {
                units[value] = currentUnitCount - hits;
                hits = 0;
                //sole.log("currentUnitCount " + currentUnitCount + " " + hits);
                return false;
            }
        });

        return unitCount;
    }

    return {
        "simulateBattle" : simulateBattle,
        "simulateNewBattle": simulateNewBattle
    };

};
