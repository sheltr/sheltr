var fs = require('fs')
var querystring = require('querystring')
var request = require('request')

var docs = JSON.parse(fs.readFileSync('out.json'))
var keys = Object.keys(docs)
var i = 0
var last = keys.length - 1

function geocode() {
  var key = keys[i]
  var doc = docs[key]
  var qs = querystring.stringify({
    sensor: false,
    address: doc.address1+' '+(doc.address2||'')+' '+doc.city+', '+doc.state+', '+doc.zip
  })
  var url = 'http://maps.googleapis.com/maps/api/geocode/json?'+qs
  console.log(url)
  docs[key] = doc
  request(url, function(err, res, body) {
    var result
    body = JSON.parse(body)
    if (body.results.length > 0) {
      result = body.results[0]
      doc.geocodedAddress = result.formatted_address
      doc.latitude = result.geometry.location.lat
      doc.longitude = result.geometry.location.lng
    }
    docs[key] = doc
    if (i == last) return fs.writeFile('outted.json', JSON.stringify(docs))
    i++
    setTimeout(geocode, 500)
  })
}

geocode()
