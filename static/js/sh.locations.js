if (typeof sheltr === 'undefined' || !sheltr) {
  var sheltr = {};
}
sheltr.locations = (function ($) {
  var settings = {
        listRoot: $('ul.locations')
      },
      _self;

  function getClass(need) {
    return 'test';
  }

  function buildLocationsHTML(location) {
    var name = location.Name ? location.Name : '',
        addr = location.Address1,
        liClass = getClass(location),
        id =  location.id,
        icon = sheltr.map.selectMarkerIcon(location);
        url = 'l/' + location.id;

    return '<li class="' + liClass + '"><img src="' + icon + '" /><h2><a href="' + url + '">' + name + '</a></h2><address>' + addr + '</address><a href="#map" id="' + id + '">View on map</span></li>';
  }

  _self = {
    list: function (locations) {
      var i,
          locationsLength = locations.result.length,
          locationsHTML = '';

      for (i = 0; i < locationsLength; i++) {
        locationsHTML = locationsHTML + buildLocationsHTML(locations.result[i]);
      }

      settings.listRoot.empty();
      settings.listRoot.addClass('visible');
      settings.listRoot.append(locationsHTML);

      $('ul.locations > li > a').click(function(){
        sheltr.map.zoomToNeedMarker($(this).attr('id'));
      });
    }

  };
  return _self;
})(jQuery);
