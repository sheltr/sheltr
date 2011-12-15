if (typeof sheltr === 'undefined' || !sheltr) {
  var sheltr = {};
}
sheltr.locations = (function ($) {
  var settings = {
        listRoot: $('ul.locations')
      },
      _self;

  function buildLocationsHTML(location) {
    var name = location.Name ? location.Name : '',
        addr = location.Address1,
        id =  location.id,
        icon = _self.selectMarkerIcon(location);
        url = 'l/' + location.id;
        distance = _self.distanceFromUser(location);

    return '<li><img src="' + icon + '" /><h2><a href="' + url + '">' + name + '</a></h2><address>' + addr + '</address>Distance: ' + distance + ' miles <a href="#map" id="' + id + '">(View map)</span></li>';
  }

  _self = {
    list: function (locations) {
      var i,
          locationsLength = locations.result.length,
          locationsHTML = '';

      if (sheltr.state.showFood == true && sheltr.state.showShelter == true) { //NOTE: not the most elegant solution. setting this up for demo purposes

        for (i = 0; i < locationsLength; i++) {
          locationsHTML = locationsHTML + buildLocationsHTML(locations.result[i]);
        }

      } else if (sheltr.state.showFood == false && sheltr.state.showShelter == true) {
        
        for (i = 0; i < locationsLength; i++) {
          if (locations.isFood == 'N') {
            locationsHTML = locationsHTML + buildLocationsHTML(locations.result[i]);
          }
        }  

      } else if (sheltr.state.showShelter == false && sheltr.state.showFood == true) {
        
        for (i = 0; i < locationsLength; i++) {
          if (locations.isShelter == 'N') {
            locationsHTML = locationsHTML + buildLocationsHTML(locations.result[i]);
          }
        }  

      }  else {
        $('#userMsg').show().empty().prepend("Please select Shelter and/or Food to see nearby locations.");
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
    },

    distanceFromUser: function(location) {
      var distance;

      distance = _self.distance(sheltr.state.userLocation.lat(),sheltr.state.userLocation.lng(), location.Latitude, location.Longitude);

      cleanDistance = Math.round(distance*10)/10

      return cleanDistance.toString();
    },

    /* Calculates distance between two points, original from: http://www.barattalo.it/examples/ruler.js */
    distance: function(lat1,lon1,lat2,lon2) {
      var R = 3959; // m (change this constant to get miles)
      var dLat = (lat2-lat1) * Math.PI / 180;
      var dLon = (lon2-lon1) * Math.PI / 180; 
      var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180 ) * Math.cos(lat2 * Math.PI / 180 ) * 
        Math.sin(dLon/2) * Math.sin(dLon/2); 
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
      var d = R * c;
      return d;
    }

  };

  return _self;
})(jQuery);
