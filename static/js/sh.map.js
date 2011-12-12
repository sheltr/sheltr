if (typeof sheltr === 'undefined' || !sheltr) {
  var sheltr = {};
}

sheltr.map = (function ($) {
  var map,
      infoWindow = new google.maps.InfoWindow(),
      geocoder = new google.maps.Geocoder(),
      youMarkerCollection = [],
      locationsMarkerCollection = [],
      userLocation,
      _self;

  var localSettings = {
    "boundingBox" : boundingBox = new google.maps.LatLngBounds(new google.maps.LatLng(39.8480851,-75.395736), new google.maps.LatLng(40.15211,-74.863586)),
    "minZoom": 12,
    "mapCenter" : new google.maps.LatLng(39.95240, -75.16362),
    "city" : "Philadelphia",
    "state" : "PA"
  };   

  var markerShadow = new google.maps.MarkerImage('/img/marker_shadow.png',
    new google.maps.Size(51, 37),
    new google.maps.Point(0, 0),
    new google.maps.Point(16, 37));

  _self = {
    create: function (options) {
      var settings = {
            mapId: 'map',
            zoom: 14,
            center: localSettings.mapCenter,
            mapTypeId: google.maps.MapTypeId.ROADMAP
          };

      if (options) {
        $.extend(settings, options);
      }
      map = new google.maps.Map(document.getElementById(settings.mapId), settings);

      map.minZoom = localSettings.minZoom;

      google.maps.event.addListener(map, "drag", function() {
        _self.boundingBoxCheck(localSettings.boundingBox);
      });

    },

    getLocations: function (userLocation, plot) {
      plot = true || plot;

      var lat = parseFloat(userLocation.lat());
      var lng = parseFloat(userLocation.lng());

      $.ajax({
        url: '_map?lat=' + lat + '&long=' + lng,
        success: function(data) {
          if (!data.error || data.error !== 'Unauthorized') { // NOTE: what other error scenarios do we need to consider?
            sheltr.state.locations = data;
            if (plot === true && data.error !== 'Unauthorized') {
              _self.addLocationsToMap(data);
            }
            sheltr.locations.list(data);
          }
        },
        error: function() {
          if (window.console) {
            console.log('AJAX error!');
          }
        }
      });

    },

    addLocationsToMap: function (locations) {
      var i,
          lat,
          lng,
          latlng,
          options,
          icon,
          description,
          locationsLength = locations.result.length;

      _self.removeMarkers(locationsMarkerCollection);

      for (i=0; i<locationsLength; i++) {
        lat = locations.result[i].Latitude;
        lng = locations.result[i].Longitude;
        latlng = new google.maps.LatLng(lat, lng);

        description = locations.result[i].Name + "<br>" + locations.result[i].Address1 + "<br><a href='http://www.google.com/maps?q=to:" + locations.result[i].Address1 + ",+Philadelphia,+PA'>Get Directions</a>"

        icon = sheltr.locations.selectMarkerIcon(locations.result[i]);
        options = {icon: icon, shadow: markerShadow};

        _self.createMarker(latlng, description, options, locations.result[i].id);
      }
    },

    createMarker: function (latlng, description, options, id) {
      var settings = {
            position: latlng,
            map: map,
        };

      if (options) {
        $.extend(settings, options);
      }

      var marker = new google.maps.Marker(settings);

      google.maps.event.addListener(marker, 'click', function() {
        infoWindow.close();
        infoWindow.setContent(description);
        infoWindow.open(map,marker);
      });
      
      if (description === 'Your Location') { //TODO: this is fragile.
        google.maps.event.addListener(marker, 'dragend', function () {
          _self.getLocations(marker.getPosition(),false);
          _self.updateMapCenter(marker.getPosition());
        });
        
        _self.removeMarkers(youMarkerCollection)
        youMarkerCollection.push({"id": 'you', "marker": marker}); 
      } else {
        locationsMarkerCollection.push({"id": id, "marker": marker});
      }
    },

    updateMapCenter: function (latLongObj) {
      map.setCenter(latLongObj);
    },

    geocode: function (addr, description) {
      var lat,
          lng,
          latlng;

      addr = addr + ", " + localSettings.city + ", " + localSettings.state; 

      geocoder.geocode({
        'address': addr, 'bounds': localSettings.boundingBox
      }, function (results, status) {

        if (status === google.maps.GeocoderStatus.OK) {
          
          if (boundingBox.contains(results[0].geometry.location)) {
            _self.createMarker(results[0].geometry.location, 'Your Location',  {
              animation: google.maps.Animation.DROP,
              draggable: true,
              icon: '/img/you.png',
              shadow: markerShadow
            });
            _self.updateMapCenter(results[0].geometry.location);
            _self.getLocations(results[0].geometry.location,false);
          } else {
            alert("Please restrict your search to the " + localSettings.city + " area.")
          }
        } else {
          alert("Search was not successful for the following reason: " + status);
        }
      });
    },

    removeMarkers: function(markerArray) {
      var i;

      if (markerArray) {
        for (i in markerArray) {
          markerArray[i].marker.setMap(null);
        }
        markerArray.length = 0;
      }
    },

    boundingBoxCheck: function(boundingBox) {
      if (boundingBox.contains(map.getCenter())) {
        return;
      } else {
        var c = map.getCenter();
        var x = c.lng();
        var y = c.lat();
        
        var boundMaxX = boundingBox.getNorthEast().lng()
        var boundMaxY = boundingBox.getNorthEast().lat()
        var boundMinX = boundingBox.getSouthWest().lng()
        var boundMinY = boundingBox.getSouthWest().lat()
        
        if (x < boundMinX) {x = boundMinX;}
        if (x > boundMaxX) {x = boundMaxX;}
        if (y < boundMinY) {y = boundMinY;}
        if (y > boundMaxY) {y = boundMaxY;}

        map.setCenter(new google.maps.LatLng(y,x));
      }
    },

    zoomToMarker: function (locationID) {
      var i,
      locationsLength = locationsMarkerCollection.length;

      for (i = 0; i < locationsLength; i++) {
        if(locationID == locationsMarkerCollection[i].id) {
          map.setCenter(locationsMarkerCollection[i].marker.getPosition());
          map.setZoom(18)
          break;
        }
      }    
    }

  };

  return _self;
})(jQuery);
