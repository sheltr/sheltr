$(function() {
  $('#settings').show(function() {
    var form = $(this), 
      box = form.find('textarea'), 
      submit = form.find(':submit')
    box.on('focus', function() {
      submit.val('Submit').attr('disabled', false)
    })
    $.ajax('/api/settings', { 
      success: function(data) {
        box.text(JSON.stringify(data, null, 2))
      }, 
      error: function() {
        box.text('{\n  "boundingBox": [\n    [39.8480851, -75.395736],\n    [40.15211, -74.863586]\n  ],\n  "minZoom": 12,\n  "mapCenter": [39.95240, -75.16362],\n  "city": "Philadelphia",\n  "state": "PA"\n}')
      }
    })
    form.on('submit', function() {
      submit.val('Submitting...').attr('disabled', true)
      $.post('/api/settings', JSON.parse(box.val()), function() {
        submit.val('Submitted!')
      })
      return false
    })
  })
})
