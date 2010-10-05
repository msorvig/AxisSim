// Battle simulator for Axis&Allies 1942
// "What's a battle?" - Ralph Wiggum
//
// Copyright 2010 Morten Johan Sørvig
// Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php

// Unit stats.
// Array of: [Unit Name, Attack Rating, Defence Rating, IPC Cost, Flying,
//               Participates in Land Battles, Participates Sea Battles]


var UnitStats = [
    ["Infantry",            1, 2, 3, false, true, false],
    ["Mechanized Infantry", 1, 2, 4, false, true, false],
    ["Artillery",           2, 2, 4, false, true, false],
    ["Tank",                3, 3, 6, false, true, false],
    ["Fighter",             3, 4, 10, true, true, false],
    ["Tactical Bomber",     3, 3, 11, true, true, false],
    ["Bomber",              4, 1, 11, true, true, false],
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
    var defenderAaGun = false;

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

        var aaGun = new CheckBox($("#aaGunSelector"), "aaGun");
        aaGun.setText("AA Gun");
        aaGun.addChangeCallback(function () {
            defenderAaGun = aaGun.value;
            unitsChangeCallback(attackerUnits, defenderUnits, defenderAaGun);
        });
        aaGun.container.attr("align", "right");
        //jCreate(aaGun, "aaGun", "aaGunSelector")
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

        unitsChangeCallback(attackerUnits, defenderUnits, defenderAaGun);

        //console.profileEnd();
        //fireunit.getProfile();
    }

    function setUnitCount(value, array, index) {
        if (value < 0)
            value = 0;
        array[index] = value;
        unitsChangeCallback(attackerUnits, defenderUnits, defenderAaGun);
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
