if (typeof SH === 'undefined' || !SH) {
  var SH = {};
}

(function($) {
  SH.needs = function () {
    var _self;

    _self = {
      list: function (needs) {
        return needs;
      }

    };
    return _self;
  };
})(jQuery);
