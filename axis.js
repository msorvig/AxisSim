// Battle simulator for Axis&Allies 1942
// "What's a battle?" - Ralph Wiggum
//
// Copyright 2010 Morten Johan Sørvig
// Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php

// Unit stats.
// Array of: [Unit Name, Attack Rating, Defence Rating, IPC Cost]
var UnitStats = [
    ["Infantry", 1, 2, 3],
    ["Mechanized Infantry", 1, 2, 4],
    ["Artillery", 2, 2, 4],
    ["Tank",      3, 3, 6],
    ["Fighter",   3, 4, 10],
    ["Tactical Bomber", 3, 3, 11],
    ["Bomber",    4, 1, 11],
];

// Unit selector
// Input:
//      selectorDivElement - the div element that should contain the unit selector ui
//      fightCallback - callback function - simulate the battle when this is called
UnitSelector = function (params) {
    var selectorDivElement = params.selectorDivElement;
    var unitsChangeCallback = params.unitsChangeCallback;
    var fightCallback = params.fightCallback;

    //sole.log("UnitSelector " + selectorDivElement);
    $("#fightButton").click( function (){
        fightCallback();
    });

    // Array of unit counts. Array indices corresponds to
    // the indices in the UnitStats array. (attackerUnits[1] is the
    // number of attacker tanks for example)
    var attackerUnits = [];
    var defenderUnits = [];

    var results;

    function buildSelector() {
        var attackSelectors = createUnitSelectors(attackerUnits, "Attacker");
        var unitList = createUnitList();
        var defenceSelectors = createUnitSelectors(defenderUnits, "Defender");


        selectorDivElement.maxSize({width : 700}); // ### need to set here as well in the css for some reason.
        selectorDivElement.layout({
            type: 'grid',
            columns: 3,
            fill : "vertical",
            items : attackSelectors + unitList + defenceSelectors
        });
    }

    // Creates unit selectors for the attacker or defender
    // Returns an array of div elements - one for each row
    // The selectors are linked up to unitArray, which stores
    // the count for each unit.
    function createUnitSelectors(unitArray, header)
    {
        var array = [];

        var newElement = $('<div>').html(header).css("text-align", "center");
        array.push(newElement);
        selectorDivElement.append(newElement);

        $.each(UnitStats, function(index, value) {
            var newElement = createUnitSelectorLine(index, unitArray);
            array.push(newElement);
            selectorDivElement.append(newElement);
        });
        return array;
    }

    function createUnitSelectorLine(index, unitArray)
    {
        var inititalUnitCount = 0;

        unitArray[index] = inititalUnitCount;
        var lineEdit = $('<input type="text" />')
                       .attr("value", inititalUnitCount)
                       .css("text-align", "center")
                       .maxSize({width : 30})
                       .change(function(event) {
                            setUnitCount(Number(lineEdit.attr("value")), unitArray, index);
                        });

        var minusButton = $('<input type="button" />')
                          .attr("value", "-")
                          .css("text-align", "center")
                          .attr("tabIndex", -1)
                          .click(function(event) {
                                changeUnitCount(-1, unitArray, index, lineEdit);
                           });
        var plusButton = $('<input type="button" />')
                         .attr("value", "+")
                         .css("text-align", "center")
                         .attr("tabIndex", -1)
                         .click(function(event) {
                                changeUnitCount(1, unitArray, index, lineEdit);
                          });
        var newElement = $('<div>').append(minusButton)
                                   .append(lineEdit)
                                   .append(plusButton)
                                   .css("text-align", "center");
        return newElement;
    }

    function createUnitList()
    {
        var array = [];

        var newElement = $('<div>').html(" "); // empty element to fill the grid cell between "Attacker" and "Defender"
        array.push(newElement);
        selectorDivElement.append(newElement);

        $.each(UnitStats, function(index, value) {
            var newElement = createUnitListLine(value[0]);
            array.push(newElement);
            selectorDivElement.append(newElement);
        });
        return array;
    }

    function createUnitListLine(name)
    {
        var newElement = $('<div>').html(name).css("text-align", "center");
        return newElement;
    }

    function changeUnitCount(delta, array, index, textInput) {
        var value = array[index];
        value += delta;
        if (value < 0)
            value = 0;
        array[index] = value;
        textInput.attr("value", value);

        // FireUnit profiling
        // console.profile();

        unitsChangeCallback(attackerUnits, defenderUnits);

        //console.profileEnd();
        //fireunit.getProfile();
    }

    function setUnitCount(value, array, index) {
        if (value < 0)
            value = 0;
        array[index] = value;
        unitsChangeCallback(attackerUnits, defenderUnits);
    }

    function createStandardChart(chartDivName, title)
    {
        Highcharts.setOptions({
            colors: ['#353F3E', '#50B432', '#ED561B', '#DDDF00', '#24CBE5', '#64E572', '#FF9655', '#FFF263', '#6AF9C4']
        });


        var chartDiv = $("#" + chartDivName);
        chartDiv.css("height", "200px");
        chartDiv.css("width", "325px");
        return new Highcharts.Chart({
      chart: {
         renderTo: chartDivName,
         defaultSeriesType: 'column',
         margin: [ 30, 10, 30, 60],
      },
      title: {
         text: title,
         style: {
                font: 'normal 12px Verdana, sans-serif'
         }
      },
      xAxis: {
         categories: [],
         labels: {
            align: 'center',
            style: {
                font: 'normal 8px Verdana, sans-serif'
                    }
         }
      },
      yAxis: {
         min: 0,
         title: {
            text: 'Likelihood (%)'
         }
      },
      legend: {
         enabled: false
      },
      tooltip: {
         formatter: function() {
           var unit = "units";
           if (this.x == 1)
               unit = "unit";

           return '<b>'+ this.x + ' ' + unit + ' remaining after battle</b><br/>'+
                'Likelihood: '+ Highcharts.numberFormat(this.y, 1) + "%";
         }
      },
           series: [{
         name: 'Likelihood',
         data: [],
         animation : false,
         dataLabels: {
            enabled: false,
            color: '#FFFFFF',
            y: 10,
            formatter: function() {
               return this.y + "%";
            },
            style: {
               font: 'normal 12px Verdana, sans-serif'
            }
         }
      }]
   });

    }


    function updateChart(chart, data) {
        chart.xAxis[0].setCategories(data.reduce([], function(initial, index) { initial.push(index); }), false);
        chart.series[0].setData(data.reduce([], function(initial, index, value) {
                                        initial.push(value / results.simulationCount * 100);
                                        }));
        chart.redraw();

    }

    var attackerRemaingChart = createStandardChart("attackerRemainingUnits", "Attacker Unit Survival");
    var defenderRemaningChart = createStandardChart("defenderRemainingUnits", "Defender Unit Survival");
    var attackerIpcLossChart = createStandardChart("attackerIpcLoss", "Attacker IPC Loss");
    var defenderIpcLossChart = createStandardChart("defenderIpcLoss", "Defender IPC Loss");
    var battleRoundsChart =  createStandardChart("battleRounds", "Rounds Of Battle");

    $("#costs").maxSize({width : 700});
    $("#costs").layout({
            type: 'grid',
            columns: 3,
        });

    $("#results").maxSize({width : 700});
    $("#results").layout({
            type: 'grid',
            columns: 3,
        });

    $("#charts").maxSize({width : 700});
    $("#charts").layout({
            type: 'grid',
            columns: 2
     });

    function updateResults(newResults) {
        results = newResults;
        $("#attackerCost").html("Attacker IPC Cost: " + results.attackerUnitCost);
        $("#defenderCost").html("Defender IPC Cost: " + results.defenderUnitCost);
        $("#attackerWin").html("Attacker Wins: " + Math.round(results.attackerWins / results.simulationCount * 100.0) + "%");
        $("#defenderWin").html("Defender Wins: " + Math.round(results.defenderWins / results.simulationCount * 100.0) + "%");
        $("#mutalAnhiliation").html("Mutal Anhiliation: " + Math.round(results.mutalAnhiliation / results.simulationCount * 100.0) + "%");

        updateChart(attackerRemaingChart, results.attackerRemaningUnitCount);
        updateChart(defenderRemaningChart, results.defenderRemaningUnitCount);
        updateChart(attackerIpcLossChart, results.attackerIpcLoss);
        updateChart(defenderIpcLossChart, results.defenderIpcLoss);
        updateChart(battleRoundsChart, results.battleRounds);

/*
        updateResultCallback(" Attacker Win: " + Math.round(results.attackerWins / results.simulationCount * 100.0) + "%" +
                             " Defender Win: " + Math.round(results.defenderWins / results.simulationCount * 100.0) + "%" +
                             " Mutal Anhiliation " + Math.round(results.mutalAnhiliation / results.simulationCount * 100.0) + "%<br>" +
                             " Attacker Unit IPC cost: " + initalAttackerUnitCost +
                             " Defender Unit IPC cost: " + initalDefenderUnitCost + "<br>" +
                             " <br> Simulated Battles: " + results.simulationCount +
                             " <br>" +
                             " <br> Attacker Remaning Units: " + prettyPrintSparseArray(results.attackerRemaningUnitCount) +
                             " <br> Defender Remaning Units: " + prettyPrintSparseArray(results.defenderRemaningUnitCount) +
                             " <br> Attacker IPC loss: " + prettyPrintSparseArray(results.attackerIpcLoss) +
                             " <br> Defender IPC loss: " + prettyPrintSparseArray(results.defenderIpcLoss) +
                             " <br> Battle Rounds: " + prettyPrintSparseArray(results.battleRounds) +
                             " <br>",
                             " <br> Battle Example: <br>" + results.simulatedBattleLogs[0]);
*/


    }

    return {
        "buildSelector" : buildSelector,
        "updateResults" : updateResults
    };
};

// Array Remove - By John Resig (MIT Licensed)
Array.remove = function(array, from, to) {
  var rest = array.slice((to || from) + 1 || array.length);
  array.length = from < 0 ? array.length + from : from;
  return array.push.apply(array, rest);
};

Array.prototype.each = function(callBack) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] !== undefined) {
            var ret = callBack(i, this[i]);
            if (ret === false)
                return;
        }
    }
/*
    sloow.. but correct. foorlop-and-skip (abowe) looks faster,
    at least for my arrays.

    for (var property in this) {
        if (String(property >>> 0) == property
            && property >>> 0 != 0xffffffff) {
            var ret = callBack(property, this[property]);
            if (ret === false)
                return;
        }
    }
*/
};

Array.prototype.map = function(callBack) {
    var mapped = [];
    this.each(function (index, value){
        mapped[index] = callBack(value, index);
    });
    return mapped;
};

Array.prototype.reduce = function(initial, callBack) {
    this.each(function (index, value){
        callBack(initial, index, value);
    });
    return initial;
};

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

    function countUnits(unitArray) {
        //console.log("countUnits " + unitArray);
        var unitCount = 0;
        unitArray.each(function(index, count) {
            //console.log("countUnits at " + index + " " + count);
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


    function simulateNewBattle(newAttackerUnits, newDefenderUnits) {
        initialAttackerUnits = createSparseUnitArrayCopy(newAttackerUnits);
        initialAttackerUnitCount = countUnits(initialAttackerUnits);
        initalAttackerUnitCost = calculateUnitCost(initialAttackerUnits);
        initialDefenderUnits = createSparseUnitArrayCopy(newDefenderUnits);
        initialDefenderUnitCount = countUnits(initialDefenderUnits);
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
    }

    function simulateOneBattle() {
        //results.defenderIpcLoss("Fight!");
        carriedHits = [];

        var roundCounter = 1;

        //results.defenderIpcLoss("first Unit count: " + attackerUnits + " " + defenderUnits);
        results.battleLog += "Start ";
        results.battleLog += "Units Left: " + attackerUnitCount + " " + defenderUnitCount+ " <br>";

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

    function removeCasulties(units, unitCount, hits)
    {
       // sole.log("removeCasulties " + unitCount);
        unitCount = Math.max(0, unitCount - hits);

        // remove units from the units array, starting at the
        // cheapest ones. Keep going until all hits have been
        // taken or we run out of units.
        unitRemovalPriority.each(function(index, value) {
            if (hits == 0)
                return false;
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

// Main function
$(document).ready(function() {

    var battlesimulator = new BattleSimulator(
        { "updateResultCallback": updateResults }
    );

    var unitSelector = new UnitSelector(
         {"selectorDivElement": $("#unitSelector"),
         "unitsChangeCallback": battlesimulator.simulateNewBattle,
         "fightCallback": battlesimulator.simulateBattle });
    unitSelector.buildSelector();

    function updateResults(results) {
        unitSelector.updateResults(results);
    }

});
