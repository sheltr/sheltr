if (typeof sheltr === 'undefined' || !sheltr) {
  var sheltr = {};
}
sheltr.needs = (function ($) {
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
        id =  need.id,
        icon = sheltr.map.prototype.selectMarkerIcon(need);
        url = 'l/' + need.id;

    return '<li class="' + liClass + '"><img src="' + icon + '" /><h2><a href="' + url + '">' + name + '</a></h2><address>' + addr + '</address><a href="#map" id="' + id + '">View on map</span></li>';
  }

  _self = {
    list: function (needs) {
        alert('got here');
      var i,
          needsLength = needs.result.length,
          needsHTML = '';

      for (i = 0; i < needsLength; i++) {
        needsHTML = needsHTML + buildNeedsHTML(needs.result[i]);
      }

      settings.listRoot.empty();
      settings.listRoot.addClass('visible');
      settings.listRoot.append(needsHTML);

      $('ul.needs > li > a').click(function(){
        sheltr.map.prototype.zoomToNeedMarker($(this).attr('id'));
      });
    }

  };
  return _self;
})(jQuery);
