

$(document).ready(function() {
    $("#fullscreen").html("Fullscreen: " + window.navigator.standalone);


    $("#touch").ontouchmove = function(e){
      if(e.touches.length == 1){ // Only deal with one finger
        var touch = e.touches[0]; // Get the information for finger #1
        var node = touch.target; // Find the node the drag started from
        node.style.position = "absolute";
        node.style.left = touch.pageX + "px";
        node.style.top = touch.pageY + "px";
      }
    }


});

