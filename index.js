
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

   var tabs = new Ext.Container({
        layout: 'hbox',
        items: [
            new Ext.Spacer({
            }),
            new Ext.Button({
                text : "-",
            }),
            new Ext.form.TextField({
                flex: 1,
                maxWidth : 50,
                minWidth : 50,
            }),
            new Ext.Button({
                text : "+",
            }),
            new Ext.Spacer({
            }),
        ]
    });

var buildUnitsCard = function() {

    unitsCard.add(tabs);
    unitsCard.doLayout();
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
