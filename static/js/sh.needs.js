if (typeof SH === 'undefined' || !SH) {
  var SH = {};
}

SH.needs = (function ($) {
  var _self;

  function buildNeedsHTML(need) {
    var name = need.Name ? need.Name : '',
        addr = need.Address1;

    return '<li><h2>' + name + '</h2><address>' + addr + '</address></li>';
  }

  _self = {
    list: function (needs) {
      var i,
          needsLength = needs.result.length,
          needsHTML = '';

      for (i = 0; i < needsLength; i++) {
        needsHTML = needsHTML + buildNeedsHTML(needs.result[i]);
      }

      $('ul.needs').append(needsHTML);
    }

  };
  return _self;
})(jQuery);
