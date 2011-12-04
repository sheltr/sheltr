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
              zoom: 14,
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
            sheltersLength = shelters.shelters.length;

        for (i=0; i<sheltersLength; i++) {
          lat = shelters.shelters[i].lat;
          lng = shelters.shelters[i].lng;
          latlng = new google.maps.LatLng(lat, lng);

				  _self.createMarker(latlng, shelters.shelters[i].desc);
        }
      },

      createMarker: function (latlng, description, options) {
        var settings = {
              position: latlng,
              map: map,
          };

        if (options) {
          $.extend(settings, options);
        }

        marker = new google.maps.Marker(settings);
        google.maps.event.addListener(marker, 'click', function() {
          infoWindow.close();
          infoWindow.setContent(description);
          infoWindow.open(map,marker);
        });
        
        if (description === 'You!') { //TODO: this is fragile.
          google.maps.event.addListener(marker, 'dragend', function () {
            console.log('dragend event listener worked!');
          });
        }
      },

      orientUser: function () {
        var userLocation = null;

        // Try W3C Geolocation
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function(position) {
            userLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            _self.create({ center: userLocation });
            _self.addShelters(shelters);
            _self.createMarker(userLocation, 'You!', {
              animation: google.maps.Animation.DROP,
              draggable: true
            });
          }, function() {
            _self.create();
          });
        }

        return userLocation;
      },

      updateMapCenter: function (latLongObj) {
        map.setCenter(latLongObj);
      }
    };

    return _self;
  };
})(jQuery);
