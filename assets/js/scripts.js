$(function() {

  var data, queryParams = {}, locations = [];
  var typ, bedrooms, bathrooms;
  var rangeStart = 0;
  var rangeEnd = 10000000;
  var resultView = "card view";
  var dataLoaded = false;
  var map;
  var layer;

  // Load listings based on query string
  loadListings();

  /* 
   * Load page content based on query string
   *
   * Case 1: Query string contains listing id
   * Case 2: Query string contains search params e.g. price
   * Case 3: Query string is empty
   */ 
  function loadListings() {
    $('#js-spinner').show();
    queryParams = parseURL();
    if (queryParams.id) {
      console.info("Request detail page for listing id: " + queryParams.id);
      requestContent();
      adjustSlider();
    } else if (queryParams.price) {
      console.info("Request search results for query: " + JSON.stringify(queryParams));
      requestContent();
      updateSearchFilter(queryParams);
    } else {
      console.info("Request initial listings");
      requestContent();
      adjustSlider();
    }
  }


  /////////////////////////////////////////////////////////////////////////////
  //
  //  Request function
  //

  /* 
   * Request a single listing by Id
   */ 
  function requestContent() {
    var requestType = "query";
    var requestData;
    if(queryParams.id){
      requestType = "id";
      requestData = { id : queryParams.id};
    } else if(queryParams.price) {
      requestData = queryParams;
    } else {
      requestData = { price : rangeStart + ";" + rangeEnd };
    }

      $.ajax({
        type: "POST",
        url: "php/search.php",
        data: requestData,
        success : function(response) {

          $('#js-spinner').hide();

          var responseParsed = JSON.parse(response);         
          if(responseParsed.Listings){
            console.info("Response:");
            console.info(responseParsed.Listings);     

            locations = [];
            for(var key in responseParsed.Listings) {
              var obj = responseParsed.Listings[key];
              locations[key] = [obj.Latitude, obj.Longitude];
            }

            if(requestType == "query"){
              data = responseParsed;
            }

            if(requestType == "id"){
              responseParsed = responseParsed.Listings[0];
            }

            if(resultView == "card view"){
              renderView(responseParsed);
            } else {
              renderMapView();
            }

          } else {
            var error = responseParsed["errorMessages"]["message"];
            $('#js-overview').show();
            $('#js-error-detail').html("Error: " + error);
            $('#js-error').show();
          }

        }
      });
  }

  /////////////////////////////////////////////////////////////////////////////
  //
  //  Render functions
  //

  //  Render listing detail
  function renderView(listingData) {
    clearView();
    var element;
    var template;
    var templateHTML;
    if(!listingData.Listings){
      element = $('#js-panel');
      source = $('#panel-template').filter('#panel-template').html();
      template = Handlebars.compile(source);
      $('#js-detail').show();
    } else {
      element = $('#js-cards');
      source = $('#card-template').filter('#card-template').html();
      template = Handlebars.compile(source);
      $('#js-overview').show();
    }
    templateHTML = template(listingData);
    element.hide().append(templateHTML).promise().done(function() {
        formatListingPrices();
        createSlider();
      });
    element.fadeIn(200);
    if(!listingData.Listings){
      if(listingData["Latitude"] != null && listingData["Longitude"] != null){
        renderMap(listingData["Latitude"], listingData["Longitude"]);
      } else {
        $("#js-map").addClass("error");
        $("#js-map").append("<h3 class='map-error'>: ( &emsp;Sorry, no geolocation available!</h3>");
      }
      $('#js-back-to-overview').show();
    }
  }

  //  Render map
  function renderMapView() {
    if(typeof layer != "undefined") {
      map.removeLayer(layer);
    }

    if(typeof map == "undefined") {
      map = L.map('js-map-search',{
          scrollWheelZoom: false
        });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);
    }

    clearView();
    $('#js-overview-map').show();

    var markers = [];
    for (var i = 0; i < locations.length; i++) {
      markers[i] = L.marker([locations[i][0], locations[i][1]]);
      var url = data.Listings[i]["Images"][0]["Image"] ? data.Listings[i]["Images"][0]["Image"] : "images/no_image.jpg";
      markers[i].bindPopup("<img src='" + url + "'><div class='leaflet-listing-details'><span class='card-property-type'>" + data.Listings[i]["PropertyType"] + "</span><span class='open-detail-view' href='#' id='" + data.Listings[i]["Id"] + "'>" + data.Listings[i]["Name"] + "</span><br>" + data.Listings[i]["Address"] + "<br><strong>" + formatCurrency(data.Listings[i]["Price"]) + "</strong><ul class='item-list cf'><li>" + data.Listings[i]["Size"] + "<br></li><li>" + data.Listings[i]["Bedrooms"] + "<br></li><li>" + data.Listings[i]["Bathrooms"] + "<br></li><li>sqft</li><li>Beds</li><li>Baths</li></ul></div>");
    }
    layer = L.layerGroup(markers);
    map.addLayer(layer);
    var bounds = new L.LatLngBounds(locations);
    map.fitBounds(bounds);
  }

  //  Render map
  function renderMap(latitude, longitude) {
    var map = L.map('js-map',{
      scrollWheelZoom: false
    }).setView([latitude, longitude], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    L.marker([latitude, longitude]).addTo(map);
  }


  // Create Slider
  function createSlider() {
    var slideCount = $('#slider ul li').length;
    var slideWidth = $('.panel-inner').last().width();
    var slideHeight = slideWidth*0.6;
    var sliderFullWidth = slideCount * slideWidth;

    $('#slider ul li').each(function(){
      $(this).css({ width: slideWidth, height: slideHeight });
    })
    
    if(slideCount == 1){
      $('.prev, .next').hide();
    } else {
      $('#slider ul').css({ width: sliderFullWidth, marginLeft: - slideWidth });
      $('#slider ul li:last-child').prependTo('#slider ul');
    }

    $( window ).resize(function() {
      slideCount = $('#slider ul li').length;
      slideWidth = $('.panel-inner').last().width();
      slideHeight = slideWidth*0.6;
      sliderFullWidth = slideCount * slideWidth;

      $('#slider ul li').each(function(){
        $(this).css({ width: slideWidth, height: slideHeight });
      })

      if(slideCount != 1){
        $('#slider ul').css({ width: sliderFullWidth, marginLeft: - slideWidth });
      }
    });

    function moveLeft() {
      $('#slider ul').animate({
        left: + slideWidth
      }, 300, function () {
        $('#slider ul li:last-child').prependTo('#slider ul');
        $('#slider ul').css('left', '');
      });
    };

    function moveRight() {
      $('#slider ul').animate({
        left: - slideWidth
      }, 300, function () {
        $('#slider ul li:first-child').appendTo('#slider ul');
        $('#slider ul').css('left', '');
      });
    };

    $('a.prev').click(function () {
      moveLeft();
    });

    $('a.next').click(function () {
      moveRight();
    });
  }

  /////////////////////////////////////////////////////////////////////////////
  //
  //  Manage browser history
  //

  window.addEventListener('popstate', function(e) {
    clearView();
    if(dataLoaded){
      if(resultView == "card view"){
        renderView(data);
      } else {
        renderMapView();
      }
      dataLoaded = false;
    } else {
      loadListings();
    }
  });

  /////////////////////////////////////////////////////////////////////////////
  //
  //  Action handler
  //

  $('#js-detail').on('click', '#js-back-to-overview', function(e) {
    history.back();
    $('#js-detail').hide();
  });

  $('input[name=view]').on('click', function(e) {
    if($(this)[0].checked) {
      resultView = $(this)[0].value;
      queryParams = parseURL();
      if(!queryParams.id) {
        $('#js-overview').hide();
        $('#js-overview-map').hide();
        $('#js-spinner').show();
        requestContent();
      }
    }
  });

  //  Create range slider
  $( "#js-slider-range" ).slider({
      range: true,
      min: 0,
      step: 1000,
      max: rangeEnd,
      values: [ rangeStart, rangeEnd ],
      slide: function( event, ui ) {
        rangeStart = ui.values[0];
        rangeEnd = ui.values[1];
        $( "#js-amount" ).html( formatCurrency(rangeStart) + " - " + formatCurrency(rangeEnd));
        $( "input[name=price]" ).val( rangeStart + ";" + rangeEnd );
      }
    });

  //  Adjust range slider values
  function adjustSlider(){
    if ( $( "#js-slider-range" ).slider("instance") !== undefined) {
      $("#js-slider-range").slider("values",0,rangeStart);
      $("#js-slider-range").slider("values",1,rangeEnd);
    }
    $( "#js-amount" ).html( formatCurrency(rangeStart) + " - " + formatCurrency(rangeEnd));
    $( "input[name=price]" ).val( rangeStart + ";" + rangeEnd );
  }

  //  Clear entire view
  function clearView(){
    $('#js-cards').empty();
    $('#js-panel').empty();
    $('#js-detail').hide();
    $('#js-overview').hide();
    $('#js-spinner').hide();
    $('#js-overview-map').hide();
    $('#js-back-to-overview').hide();
    $('#js-error').hide();
  }

  //  Submit search request
  $('form[name=search]').submit(function(e) {
      clearView();
      $('#js-overview').show();
      e.preventDefault();
      updateURL("search", $(this).serialize());
      $('#js-spinner').show();
      queryParams = parseURL();
      requestContent();
      updateSearchFilter(queryParams);
  });

  //  Handle click on card
  $('#js-cards').on('click', '.card', function(e) {
    dataLoaded = true;
    $('#js-overview').hide();
    $('#js-detail').show();
    updateURL("detailView", "id=" + $(this).attr('id'));
    queryParams = parseURL();
    renderView(findListingById($(this).attr('id')));
  });

  //  Handle click on map pop-up
  $('#js-overview-map').on('click', '.open-detail-view', function(e) {
    dataLoaded = true;
    $('#js-overview').hide();
    $('#js-detail').show();
    updateURL("detailView", "id=" + $(this).attr('id'));
    queryParams = parseURL();
    renderView(findListingById($(this).attr('id')));
  });

  //  Submit listing request
  $('#js-panel').on('submit', 'form[name=inquiry]', function(e) {
     e.preventDefault();
     $.ajax({
       url : 'php/listing_request.php',
       type : 'post',
       data : $(this).serializeArray(),
       success : function(response) {
          if(response == 'Success'){
            $('#js-inquiry-form').remove();
            $('#js-inquiry-title').html("Thank you! Your inquiry has been sucessfully submitted!<br><br>We will get back to you shortly with more details!");
            $('#js-inquiry-title').addClass('success');
          }else{
            $('#js-inquiry-form').remove();
            $('#js-inquiry-title').html("<h3>: ( &emsp;Sorry, a server error occured, please try again later!</h3>" + response);
          }
       }
     });
  });

  // Toggle general search request form
  $('#js-toggle').on('click', function(e) {
    if($(this).hasClass('toggled')){
      $(this).removeClass('toggled');
      $(this).html('<span><img src="images/arrow-down.svg"></span>');
      $('#js-request-form-container').hide();
    } else {
      $(this).addClass('toggled');
      $('#js-request-form-container').show();
      $(this).html('<span><img src="images/arrow-down.svg"></span>');
    }
  });

  //  Submit general search request
  $('#js-request-form').on('submit', function(e) {
     e.preventDefault();
     $.ajax({
       url : 'php/search_request.php',
       type : 'post',
       data : $(this).serializeArray(),
       success : function(response) {
          if(response == 'Success'){
            $('#js-request-form-container').remove();
            $('#js-toggle').remove();
            $('#js-request-title').html(": ) Thank you! Your request has been sucessfully submitted!<br>We will get back to you shortly with more details!");
            $('#js-inquiry-title').addClass('success');
          }else{
            $('#js-request-form-container').remove();
            $('#js-toggle').remove();
            $('#js-request-title').html(": ( &emsp;Sorry, a server error occured, please try again later! <br>" + response);
          }
       }
     });
  });

  //  Handle selected input fields
  $('select[name=type], select[name=price], select[name=size], select[name=bedrooms], select[name=bathrooms]').change(function(){
    if(this.value != 'default'){
      $(this).addClass('selected');
    } else {  
      $(this).removeClass('selected');
    }
  })

  /////////////////////////////////////////////////////////////////////////////
  //
  //  Helper functions
  //

  function updateSearchFilter(queryParams) {
    // Adjust slider values
    var ranges = queryParams.price.split(';');
    rangeStart = ranges[0];
    rangeEnd = ranges[1];
    adjustSlider(); 
    // Adjust all other search filter values
    if(queryParams.type) {
      $('select[name=type]').val(queryParams.type);
      $('select[name=type]').addClass('selected');
    } else {
      $('select[name=type]').val("default");
    }
    if(queryParams.bedrooms) {
      $('select[name=bedrooms]').val(queryParams.bedrooms);
      $('select[name=bedrooms]').addClass('selected');
    } else {
      $('select[name=bedrooms]').val("default");
    }
    if(queryParams.bathrooms) {
      $('select[name=bathrooms]').val(queryParams.bathrooms);
      $('select[name=bathrooms]').addClass('selected');
    } else {
      $('select[name=bathrooms]').val("default");
    }
  }

  //  Parse URL and extract key value pairs
  function parseURL() {
    queryString = window.location.search;
    var paramsObj = {};
    if(queryString) {
      // Decode query string
      queryString = queryString.replace("%3B", ";");
      // Split query string to array
      var params = queryString.split("?")[1].split("&");
      // Split array to object
      if( typeof params === 'object' ){
        params.forEach(function(param) {
          var c = param.split('=');
          paramsObj[c[0]] = c[1];
        })
      }
    }
    return paramsObj;
  }

  //  Format currency in us dollar notation
  function formatCurrency(value){
    return '$' + value.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
  }

  //  Format listing prices
  function formatListingPrices(){
    $('.card-price, .panel-price').each(function(i){
      $(this).html(formatCurrency($(this).html()));
    })
  }

  //  Update URL query parameter based on page content
  function updateURL(stateData, str) {
    str = str.replace(/([^?&])*?=default[&]*/g, '');
    str = str.replace(/&$/g, '');
    if (history.pushState) {
      var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?' + str;
        history.pushState(stateData, null, newurl);
    }
  }

  //  Find listing by id
  function findListingById(id) {
    if(data.Listings){
      var result = $.grep(data.Listings, function(i){ 
        return i.Id == id;
      });
      return result[0];
    }
  }

});