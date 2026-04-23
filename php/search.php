<?php

require 'config.php';

//ini_set('display_errors','On');
//error_reporting(E_ALL);

$search_params = [];

// Store search parameters
if(isset($_POST["id"]) && $_POST["id"] != null){
  $search_params["id"] = $_POST["id"];
}
if(isset($_POST["featured"]) && $_POST["featured"] != "default"){
  $search_params["featured"] = $_POST["featured"];
}
if(isset($_POST["type"]) && $_POST["type"] != "default"){
  $search_params["type"] = $_POST["type"];
}
if(isset($_POST["price"]) && $_POST["price"] != "default"){
  $search_params["price"] = $_POST["price"];
}
if(isset($_POST["bedrooms"]) && $_POST["bedrooms"] != "default"){
  $search_params["bedrooms"] = $_POST["bedrooms"];
}
if(isset($_POST["bathrooms"]) && $_POST["bathrooms"] != "default"){
  $search_params["bathrooms"] = $_POST["bathrooms"];
}

// Query variables
$result = "";
$error_message = "";

// Define request
$requestArray = [
  "token" => $weblisting_token,
  "fields" => "ID;name;pba__Description_pb__c;pba__Address_pb__c;pba__ListingPrice_pb__c;pba__Bedrooms_pb__c;pba__FullBathrooms_pb__c;pba__TotalArea_pb__c;pba__Latitude_pb__c;pba__Longitude_pb__c;pba__PropertyType__c;pba__City_pb__c;pba__StateCode_pb__c;pba__PostalCode_pb__c;MonthlyRent__c",
  "itemsperpage" => "9",
  "orderby" => "pba__ListingPrice_pb__c;ASC",
  "getimages" => "true",
  "pba__Status__c"  => "in(Available;Active)",
  "debugmode" => "true"
];

// Add search parmeters to query
foreach ($search_params as $key => $value) {
  switch ($key) {
    case "featured":
      $requestArray["Featured_on_Website__c"] = $value;
    break;
    case "id":
      $requestArray["Id"] = $value;
    break;
    case "type":
      $requestArray["recordtypes"] = $value;
      break;
    case "price":
      if(isset($search_params["type"]) && $search_params["type"] == "Rent") {
        $requestArray["MonthlyRent__c"] = '[' . $value . ']';
      } else {
        $requestArray["pba__ListingPrice_pb__c"] = '[' . $value . ']';
      }
      break;
    case "bedrooms":
      $requestArray["pba__Bedrooms_pb__c"] = $value;
      break;
    case "bathrooms":
      $requestArray["pba__FullBathrooms_pb__c"] = $value;
      break;
    default:
      break;
  }
}

// Build query
$query = $weblisting_endpoint . '?' . http_build_query($requestArray);

//  Initiate curl
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $query);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 15);
if( $dev_env ) {
  curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
}
$info = curl_getinfo($ch);
$xml_result = curl_exec($ch);
curl_close($ch);

$xml_result = new SimpleXMLElement($xml_result);

// Extract data from response
if (!isset($xml_result->listings->listing)) {
  $error_data['errorMessages'] = $xml_result->errorMessages;
  echo json_encode($error_data);
} else {
  // Build JSON
  $array = array("Listings" => array());

  foreach($xml_result->listings->listing as $listing) {
    $array_temp['Id'] = (string) $listing->data->id;
    $array_temp['Name'] = (string) $listing->data->name;
    $array_temp['Description'] = (string) $listing->data->pba__description_pb__c;
    $array_temp['PropertyType'] = (string) $listing->data->pba__propertytype__c;
    $array_temp['Size'] = (string) $listing->data->pba__totalarea_pb__c;
    $array_temp['Address'] = (string) $listing->data->pba__address_pb__c;
    $array_temp['City'] = (string) $listing->data->pba__city_pb__c;
    $array_temp['StateCode'] = (string) $listing->data->pba__statecode_pb__c;
    $array_temp['PostalCode'] = (string) $listing->data->pba__postalcode_pb__c;
    if(isset($search_params["type"]) && $search_params["type"] == "Rent") {
      $array_temp['Price'] = (string) $listing->data->monthlyrent__c;
    } else {
      $array_temp['Price'] = (string) $listing->data->pba__listingprice_pb__c;
    }
    $array_temp['Bedrooms'] = (string) $listing->data->pba__bedrooms_pb__c;
    $array_temp['Bathrooms'] = (string) $listing->data->pba__fullbathrooms_pb__c;
    $array_temp['Latitude'] = (string) $listing->data->pba__latitude_pb__c;
    $array_temp['Longitude'] = (string) $listing->data->pba__longitude_pb__c;
    if(isset($listing->media->images->image->url)) {
      $array_temp['Image'] = (string) $listing->media->images->image->url;
    } else {
      $array_temp['Image'] = 'images/no_image.jpg';
    }
    array_push($array['Listings'],$array_temp);
  }

  // Convert to JSON
  echo json_encode($array, JSON_PRETTY_PRINT);
}

?>
