<?php

require 'config.php';

///////////////////////////////////////////////////////////////////////////////
//
//  Uncomment both lines below to display error messages.
//
///////////////////////////////////////////////////////////////////////////////

// ini_set('display_errors','On');
// error_reporting(E_ALL);

// Sanitize POST array to prevent XSS attacks
$_POST = filter_input_array(INPUT_POST, FILTER_SANITIZE_STRING);

$query = array (
  'prospect' => array(
    'token' => $web_to_prospect_token,
    'contact' => array (
      'LeadSource' => $_POST["LeadSource"],
      'FirstName' => $_POST["FirstName"],
      'LastName' => $_POST["LastName"],
      'Email' => $_POST["Email"],
      'Phone' => $_POST["Phone"]
    ),
  'request' => array (
    'pba__ListingType__c' => $_POST["r_pba__ListingType__c"],
    'pba__ListingPrice_pb_min__c' => is_numeric($_POST["r_pba__ListingPrice_pb_min__c"]) ? $_POST["r_pba__ListingPrice_pb_min__c"] : null ,
    'pba__ListingPrice_pb_max__c' => is_numeric($_POST["r_pba__ListingPrice_pb_max__c"]) ? $_POST["r_pba__ListingPrice_pb_max__c"] : null ,
    'pba__City_pb__c' => $_POST["r_pba__City_pb__c"],
    'pba__PropertyType__c' => empty($_POST["r_pba__PropertyType__c"]) ? null : implode ( ";" , $_POST["r_pba__PropertyType__c"]),
    'View__c' =>  empty($_POST["r_View__c"])  ? null : implode ( ";" , $_POST["r_View__c"])
  ),
  'ownerFields' => array('LastName'),
  'requestFields' => array('Name'),
  'contactFields' => array('Name')
));

$query = json_encode($query); 

$curl = curl_init($web_to_prospect_endpoint);
// Accept any server (peer) certificate on dev envs
if( $dev_env ) {
  curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
}
curl_setopt($curl, CURLOPT_HEADER, false);
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
curl_setopt($curl, CURLOPT_POST, true);
curl_setopt($curl, CURLOPT_POSTFIELDS, $query);
curl_setopt($curl, CURLOPT_HTTPHEADER, array(  "Content-type: application/json"));
$info = curl_getinfo($curl);
$response = curl_exec($curl);

$jsonResponse =  json_decode($response);

curl_close($curl);

if (isset($jsonResponse->{"errorMessage"})) {
  die("Error: " . $jsonResponse->{"errorMessage"});
} else {
  echo "Success";
}

?>
