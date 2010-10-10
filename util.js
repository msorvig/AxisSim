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
