
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
            title: 'Battle Type',
            ui: 'dark',
            dock: 'top',
            centered: true,
            items: battleTypeGroup
})];

Ext.setup({
    tabletStartupScreen: 'tablet_startup.png',
    phoneStartupScreen: 'phone_startup.png',
    icon: 'carousel.png',
    glossOnIcon: false,
    onReady: function() {
        new Ext.Panel({
            fullscreen: true,
//            layout: {
//                type: 'vbox',
//                align: 'top'
//            },
//            defaults: {
//                flex: 1
//            },

         items: [battleTypeToolBar]
        });
    }
});
