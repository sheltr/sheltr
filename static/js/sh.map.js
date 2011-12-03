if (typeof SH === 'undefined' || !SH) {
  var SH = {};
}

(function($) {
  SH.map = function () {
    var map,
        infoWindow = new google.maps.InfoWindow(),
        _self;

    _self = {
      create: function (options) {
        var settings = {
            mapId: 'map',
            zoom: 12,
				    center: new google.maps.LatLng(39.95240, -75.16362), 
            mapTypeId: google.maps.MapTypeId.ROADMAP
          };

        if (options) {
          $.extend(settings, options);
        }
			  map = new google.maps.Map(document.getElementById(settings.mapId), settings);

      },

      addShelters: function (shelters) {
        var i,
            lat,
            lng,
            latlng,
            sheltersLength = shelters.length;

        for (i=0; i<sheltersLength;) {
          lat = shelters.shelters[i].lat;
          lng = shelters.shelters[i].lng;
          latlng = new google.maps.LatLng(lat, lng);
          this.createMarker(/*TODO*/);
        }
      },

      createMarker: function () {
        // TODO:
      }
    };

    return _self;
  };
})(jQuery);
