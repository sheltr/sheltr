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
        console.log('map obj: ', map);
      },

      addShelters: function (shelters) {
        var i,
            lat,
            lng,
            latlng,
            sheltersLength = shelters.shelters.length;

        for (i=0; i<sheltersLength; i++) {
          lat = shelters.shelters[i].lat;
          lng = shelters.shelters[i].lng;
          latlng = new google.maps.LatLng(lat, lng);

				  this.createMarker(latlng, shelters.shelters[i].desc);
        }
      },

      createMarker: function (latlng, description) {
        marker = new google.maps.Marker({
          position: latlng,
          map: map
        });

        google.maps.event.addListener(marker, 'click', function() {
          infowindow.close();
          infowindow.setContent(description);
          infowindow.open(map,marker);
        });
      },

      locateUser: function () {
        var userLocation = null;

        // Try W3C Geolocation
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function(position) {
            userLocation = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
            return userLocation;
          }, function() {
            return userLocation;
          });
        }
      }
    };

    return _self;
  };
})(jQuery);
