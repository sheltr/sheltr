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
        icon = _self.selectMarkerIcon(location);
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
        sheltr.map.zoomToMarker($(this).attr('id'));
      });
    },

    selectMarkerIcon: function(location) {
      var icon
      
      if (location.HasMeals === "Y") {
        icon = '/img/food.png';
      } 
      if (location.IsShelter === "Y") {
        icon = '/img/shelter.png';
      }
      if (location.IsShelter === "Y" && location.HasMeals === "Y") {
        icon = '/img/shelter_food.png';
      }
      if (location.IsIntake === "Y") {
        icon = '/img/intake.png';
      } else {
        icon = '/img/shelter.png'; //Mill Creek Baptist Church currently doesn't meet any of these conditions. This will give it the shelter icon (I'm assuming its a shelter).
      }
      
      return icon;
    }

  };

  return _self;
})(jQuery);
