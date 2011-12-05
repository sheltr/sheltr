if (typeof SH === 'undefined' || !SH) {
  var SH = {};
}

SH.needs = (function ($) {
  var settings = {
        listRoot: $('ul.needs')
      },
      _self;

  function getClass(need) {
    return 'test';
  }

  function buildNeedsHTML(need) {
    var name = need.Name ? need.Name : '',
        addr = need.Address1,
        liClass = getClass(need),
        url = 'l/' + need.id;

    return '<li class="' + liClass + '"><img src="/img/shelter.png" /><h2><a href="' + url + '">' + name + '</a></h2><address>' + addr + '</address><a href="">View on map</a></li>';
  }

  _self = {
    list: function (needs) {
      var i,
          needsLength = needs.result.length,
          needsHTML = '';

      for (i = 0; i < needsLength; i++) {
        needsHTML = needsHTML + buildNeedsHTML(needs.result[i]);
      }

      settings.listRoot.empty();
      settings.listRoot.addClass('visible');
      settings.listRoot.append(needsHTML);
    }

  };
  return _self;
})(jQuery);
