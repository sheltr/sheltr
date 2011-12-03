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
            mapTypId: google.maps.MapTypeId.ROADMAP
          };
        console.log(document.getElementById(settings.mapId));

        if (options) {
          $.extend(settings, options);
        }
			  map = new google.maps.Map(document.getElementById(settings.mapId), settings);

      },

      anotherMethod: function () {
        
      }
    };

    return _self;
  };
})(jQuery);
