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
