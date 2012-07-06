if (typeof sheltr === 'undefined' || !sheltr) {
  var sheltr = {};
}
sheltr.locations = (function ($) {
  var settings = {
        listRoot: $('ul.locations')
      },
      _self;

  function hasStatus(stat) {
    if (stat) {
      return '<p>Status: ' + stat + '</p>';
    } else {
      return '';
    }
  }

  function buildLocationsHTML(location) {
    var name = location.name || '',
        addr = location.address1,
        id =  location.id,
        icon = _self.selectMarkerIcon(location),
        url = location.id,
        stat = location.status || '',
        distance = _self.distanceFromUser(location),
        beds = '';
  
    if (location.totalBeds) {
      beds = '<p>Available beds: ' + location.openBeds + '</p>';
    }

    return '<li><img src="' + icon + '" /><h2><a href="' + url + '">' + name + '</a></h2><address>' + addr + '</address>'+ beds + '<p>Distance: ' + distance + ' miles</p>' + hasStatus(stat) + '<a href="#map" id="' + id + '">(View map)</a></li>';
  }

  _self = {
    list: function (locations) {
      var locationsHTML = '';
      _.each(locations, function(loc) {
        if (sheltr.state.showFood == true && loc.isFood ||
          sheltr.state.showMedical == true && loc.isMedical ||
          sheltr.state.showShelter == true && loc.isShelter) {
          locationsHTML += buildLocationsHTML(loc);
        }
      });
      if (sheltr.state.showFood == false && sheltr.state.showShelter == false && sheltr.state.showMedical == false) {
        $('#userMsg').show().empty().prepend("Please select Shelter, Food, or Medical to see nearby locations.");
      }
      settings.listRoot.empty();
      settings.listRoot.addClass('visible');
      settings.listRoot.append(locationsHTML);

      $('ul.locations > li > a').click(function(){
        sheltr.map.zoomToMarker($(this).attr('id'));
        window.location.hash = '#map';
      });
    },

    selectMarkerIcon: function(location) {
      var icon

      if (location.isShelter && location.isFood) {
        icon = '/img/shelter_food.png';
      } else if (location.isIntake) {
        icon = '/img/intake.png';
      } else if (location.isShelter) {
        icon = '/img/shelter.png';
      } else if (location.isFood) {
        icon = '/img/food.png';
      } else if (location.isMedical) {
        icon = '/img/medical.png';
      } else {
        icon = '/img/shelter.png'; //Mill Creek Baptist Church currently doesn't meet any of these conditions. This will give it the shelter icon (I'm assuming its a shelter).
      }
      return icon;
    },

    distanceFromUser: function(loc) {
      var cleanDistance = Math.round(loc.distance*10)/10
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
