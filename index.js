
    // Array of unit counts. Array indices corresponds to
    // the indices in the UnitStats array. (attackerUnits[1] is the
    // number of attacker tanks for example)
    var attackerUnits = [];
    var defenderUnits = [];
    var defenderAaGun = false;
    var initalUnitCount = 0;

    function changeUnitCount(delta, array, index, textInput) {
        var value = array[index];
        value += delta;
        if (value < 0)
            value = 0;
        array[index] = value;
        textInput.setValue(value);

        console.log("change " + value + textInput.value);

        // FireUnit profiling
        // console.profile();

        //unitsChangeCallback(attackerUnits, defenderUnits, defenderAaGun);

        //console.profileEnd();
        //fireunit.getProfile();
    }

    function setUnitCount(value, array, index) {
        if (value < 0)
            value = 0;
        array[index] = value;
        // unitsChangeCallback(attackerUnits, defenderUnits, defenderAaGun);
    }



var tapHandler = function(button, event) {
    var txt = 'User tapped the ' + button.text + ' button.';
};

var battleTypeGroup = [{
    xtype: 'segmentedbutton',
    allowDepress: true,
    items: [
   {
        text: 'Land Battle',
        handler: tapHandler,
        pressed: true
    }, {
        text: 'Sea Battle',
        handler: tapHandler
    }, {
        text: 'Amphibious Assault',
        handler: tapHandler
    }]
}];

var battleTypeToolBar = [new Ext.Toolbar({
            ui: 'dark',
            dock: 'top',
            items: battleTypeGroup
})];

var unitsCard = new Ext.Panel({
    dockedItems: battleTypeToolBar,
    title: 'Units',
    iconCls: 'favorites',
        layout :  { type: 'vbox',
            align: 'stretch'
        }
});

function createUnitSelector(array, index) {
    array[index] = initalUnitCount;
    var textField = new Ext.form.TextField({
                        flex: 1,
                        value : initalUnitCount,
                        maxWidth : 50,
                        minWidth : 50,
                    });

    return new Ext.Container({
        layout: 'hbox',
        items: [
            new Ext.Spacer({
            }),
            new Ext.Button({
                text : "-",
                handler : function (button, event)
                          { changeUnitCount(-1, array, index, textField); }
            }),
                textField
            ,
            new Ext.Button({
                text : "+",
                handler : function (button, event)
                          { changeUnitCount(1, array, index, textField); }
            }),
            new Ext.Spacer({
            }),
        ]
    });
}

function createUnitSelectors(container, array)
{
    UnitStats.each(function(index, value){
        container.add(createUnitSelector(array, index));
    });

    unitsCard.doLayout();
}

var buildUnitsCard = function() {
    createUnitSelectors(unitsCard, attackerUnits);
};
buildUnitsCard();




var chartsCard = new Ext.Panel({
    title: 'Charts',
    iconCls: 'settings',
    html: 'Charts!',
});


Ext.setup({
    tabletStartupScreen: 'tablet_startup.png',
    phoneStartupScreen: 'phone_startup.png',
    icon: 'carousel.png',
    glossOnIcon: false,
    onReady: function() {
       var tabpanel = new Ext.TabPanel({
            tabBar: {
                dock: 'bottom',
                layout: {
                    pack: 'center'
                }
            },
            fullscreen: true,
            ui: 'dark',
            animation: {
                type: 'cardslide',
                cover: true
            },

            defaults: {
                scroll: 'vertical'
            },
            items: [
                unitsCard, chartsCard
            ]
        });
    }

});
