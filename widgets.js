LabelledInputElement = function(type, container, objectName)
{
    this.elementContainer = $('<div>').attr("id", objectName + "Container");
    this.inputElement = $('<input type="' + type + '" />').attr("id", objectName + "CheckBox");
    this.elementContainer.append(this.inputElement);
    this.label = $('<span>').attr("id", objectName + "CheckBox");
    this.elementContainer.append(this.label);
    container.append(this.elementContainer);
}

CheckBox = function(parentContainer, objectName)
{
    var me = this;
    var labeledInputElement = new LabelledInputElement("checkbox", parentContainer, objectName);

    // public
    this.container = labeledInputElement.elementContainer;
    this.input = labeledInputElement.inputElement;
    this.label = labeledInputElement.label;
    this.value = false;
    this.addChangeCallback = function(callback) {
        me.input.change(callback);
    }
    this.setText = function(text) {
        console.log("setText " + text);
        me.label.html(text);
    }

    // private
    this.addChangeCallback(function() {
        me.value = (me.input.attr("value") == "on") }
    );

    return this;
}

RadioButtonSet = function(parentContainer, objectName, labels) {
    var me = this;

    var buttons = [];

    var i = 0;
    labels.each(function(index, value) {
        console.log("adding " + value)
        var radioButton = $('<input type="radio" id="radio' + i + '" name="' + objectName + '" />');
        var radioLabel =  $('<label for="radio' + i + '">' + labels[i] + '</label>');
        radioButton.button();
        buttons[i] = radioButton;
        parentContainer.append(radioButton);
        parentContainer.append(radioLabel);
        ++i;
    });

    setSelected(0);

    function setSelected(selectedIndex) {
        buttons[selectedIndex][0].checked = true;
        buttons[0].button("refresh");
    }

    function selectedIndex() {
        buttons.each(function(index, value) {} )
    }

    function selectedLabel() {

    }

    return this;
}



//<input type="radio" id="radio2" name="radio" checked="checked" /><label for="radio2">Choice 2</label>
//<input type="radio" id="radio3" name="radio" /><label for="radio3">Choice 3</label>

