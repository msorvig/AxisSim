// Battle simulator for Axis&Allies 1942
// "What's a battle?" - Ralph Wiggum
//
// Copyright 2010 Morten Johan Sørvig
// Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php

// Unit stats.
// Array of: [Unit Name, Attack Rating, Defence Rating, IPC Cost]
var UnitStats = [
    ["Infantery", 1, 2, 3],
    ["Tank",      3, 3, 6],
    ["Fighter",   3, 4, 11]
];

// Unit selector
// Input:
//      selectorDivElement - the div element that should contain the unit selector ui
//      fightCallback - callback function - simulate the battle when this is called
UnitSelector = function (params) {
    var selectorDivElement = params.selectorDivElement;
    var fightCallback = params.fightCallback;

    //sole.log("UnitSelector " + selectorDivElement);
    $("#fightButton").click( function (){
        fightCallback(attackerUnits.slice(0), defenderUnits.slice(0));
    });

    // Array of unit counts. Array indices corresponds to
    // the indices in the UnitStats array. (attackerUnits[1] is the
    // number of attacker tanks for example)
    var attackerUnits = [];
    var defenderUnits = [];

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
        unitArray[index] = 0;
        var lineEdit = $('<input type="text" />')
                       .attr("value", 0)
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
    }

    function setUnitCount(value, array, index) {
        if (value < 0)
            value = 0;
        array[index] = value;
    }

    return {
        "buildSelector" : buildSelector
    };
};

BattleSimulator = function(params) {
    var updateResultCallback = params.updateResultCallback;
    var battleIterations = 1;

    var unitRemovalPriority = createRemovalPriorityArray(); // sorted array of unit indices, starting with lowest-value unit (infantry)

    var attackerUnits = [];
    var attackerUnitCount = 0;
    var defenderUnits = [];
    var defenderUnitCount = 0;

    var resultString = "";

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

    function simulateBattle(newAttackerUnits, newDefenderUnits) {
        // console.log("Fight!");

        attackerUnits = newAttackerUnits;
        attackerUnitCount = countUnits(attackerUnits);
        defenderUnits = newDefenderUnits;
        defenderUnitCount = countUnits(defenderUnits);

        resultString = "";
        var  i = 1;

        //sole.log("Unit count: " + attackerUnits + " " + defenderUnits);

        while (attackerUnitCount > 0 && defenderUnitCount > 0) {
            resultString += "Round " + i++ + " <br>";
            simulateBattleRound();
            resultString += "Units Left: " + attackerUnits + " " + defenderUnits + " <br>";
            // sole.log("Unit count: " + attackerUnits + " " + defenderUnits);

        }

        if (attackerUnitCount == 0 && defenderUnitCount == 0)
            resultString += "Mutal Annhiliation!";
        else if (attackerUnitCount == 0)
            resultString += "Defender Wins!";
        else if (defenderUnitCount == 0)
            resultString += "Attacker Wins!";

        updateResultCallback(resultString, "");
    };

    function countUnits(unitArray) {
        var unitCount = 0;
        $.each(unitArray, function(index, value) {
            unitCount += value;
        });
        return unitCount;
    }

    // Runs one round of battle simultaion ( attacker fires, defender fires, casulties removed etc.)
    function simulateBattleRound()
    {
        var attackerHits = simulateUnitFire(attackerUnits, 1);
        var defenderHits = simulateUnitFire(defenderUnits, 2);

        //sole.log("hits " + attackerHits + " " + defenderHits);
        resultString += "Hits:" + attackerHits + " " + defenderHits + "  ";

        attackerUnitCount = removeCasulties(attackerUnits, attackerUnitCount, defenderHits);
        defenderUnitCount = removeCasulties(defenderUnits, defenderUnitCount, attackerHits);
    }

    // In: an array of unit counts, which stat index to use (attacker or defender)
    // returns the number of hits.
    function simulateUnitFire(units, statIndex)
    {
        var hits = 0;
        $.each(units, function(unitIndex, count) {
            for (var i = 0; i < count; ++i) {
                var toHit = UnitStats[unitIndex][statIndex];
                var dieRoll = Math.floor(Math.random()*6) + 1;
                //sole.log("die " + dieRoll + "tohit " + toHit)
                if (dieRoll <= toHit)
                    ++hits;
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
        $.each(unitRemovalPriority, function(index, value) {
            if (hits == 0)
                return false;
            var currentUnitCount = units[value];
            if (currentUnitCount == 0)
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
        "simulateBattle" : simulateBattle
    };

};

// Main function
$(document).ready(function() {
    // ### move to class?
    function updatePercentages(attacker, defender)
    {
        $("#attackerWin").html(attacker);
        $("#defenderWin").html(defender);
    }

    var battlesimulator = new BattleSimulator(
        { "updateResultCallback": updatePercentages }
    );

    var unitSelector = new UnitSelector(
        {"selectorDivElement": $("#unitSelector"),
         "fightCallback": battlesimulator.simulateBattle });
    unitSelector.buildSelector();
});
