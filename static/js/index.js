if (typeof sheltr === 'undefined' || !sheltr) {
  sheltr = {};
}

sheltr.state = {}; //global object through which we can share data
sheltr.state.showShelter = true;
sheltr.state.showFood = true;
sheltr.state.showMedical = true;

$(document).ready(function() {
  $.ajax({
    async: false,
    url: 'api/settings',
    success: function(data) {
      data.boundingBox = data.boundingBox && new google.maps.LatLngBounds(new google.maps.LatLng(data.boundingBox[0][0], data.boundingBox[0][1]), new google.maps.LatLng(data.boundingBox[1][0], data.boundingBox[1][1]));
      data.mapCenter = data.mapCenter && new google.maps.LatLng(data.mapCenter[0], data.mapCenter[1]),
      sheltr.state.localSettings = data;
    }
  });

  sheltr.getUserLocation = function(){

    // Try W3C Geolocation
    if (navigator.geolocation) { 
      //geolocation supported
      navigator.geolocation.getCurrentPosition(function(position) {
        var userLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

        //save position
        sheltr.state.userLocation = userLocation;

        $('.addr.text').val('Your Location');

        if (sheltr.state.localSettings.boundingBox.contains(userLocation))  {
          //get locations based on user location
          sheltr.getLocations(userLocation,true);

          //setup map
          sheltr.map.updateMapCenter(userLocation);
          sheltr.map.createMarker(userLocation, 'Your Location', {
            animation: google.maps.Animation.DROP,
            draggable: true,
            icon: '/img/you.png',
            shadow: sheltr.map.markerShadow
          });

        } else {
           $('#userMsg').show().empty().prepend("We detected that you are outside of the " + sheltr.state.localSettings.region + " region.<br>Please search for a " + sheltr.state.localSettings.region + " address.");
          return;
        }

      }, function() { 
        //geolocation denied  
      });
    } else { 
      //geolocation not supported
    }
  };

  sheltr.getLocations = function(userLocation, plot) {

    //filtering
    if($('#checkbox-food').is(':checked')) {
      sheltr.state.showFood = true;
    } else {
      sheltr.state.showFood = false;
    }

    if($('#checkbox-medical').is(':checked')) {
      sheltr.state.showMedical = true;
    } else {
      sheltr.state.showMedical = false;
    }

    if($('#checkbox-shelter').is(':checked')) {
      sheltr.state.showShelter = true;
    } else {
      sheltr.state.showShelter = false;
    }
    
    plot = false || plot;

    var lat = parseFloat(userLocation.lat());
    var lng = parseFloat(userLocation.lng());

    $.ajax({
      url: 'api/near?lat=' + lat + '&lng=' + lng,
      success: function(data) {
        sheltr.state.locations = data;
        if (plot === true) {
          sheltr.map.addLocationsToMap(sheltr.state.locations);
        }
        sheltr.locations.list(sheltr.state.locations);
      },
      error: function(jqXHR, textStatus, errorThrown) {
        console.log('AJAX error: ' + errorThrown);
      }
    });

  };

  sheltr.map.create();
  sheltr.getUserLocation();

  $('button.submit').bind('click', function(){
    if (sheltr.state.userLocation && $('input.addr').val() == 'Your Location') {
      sheltr.getLocations(sheltr.state.userLocation, true);
      return false;
    } else {
      sheltr.map.geocode($('input.addr').val());
      return false;
    }

  });

  $('.addr.text').val('Enter an address, zipcode or intersection.').focus(function() {
    $(this).select();
  });
});
