<?php

///////////////////////////////////////////////////////////////////////////////
//
//  1. Hardcoded variables
//  
//  Uncomment the following lines and insert your endpoints and tokens
//
///////////////////////////////////////////////////////////////////////////////

// $weblisting_endpoint = "https://YOUR_DOMAIN.secure.force.com/pba__WebserviceListingsQuery";
// $weblisting_token = "WEBLISTING_TOKEN";

// $web_to_prospect_endpoint = "https://YOUR_DOMAIN.secure.force.com/services/apexrest/pba/webtoprospect/v1/";
// $web_to_prospect_token = "YOUR_WEB_TO_PROSPECT_TOKEN";

///////////////////////////////////////////////////////////////////////////////
//
//  2. Environment variables
//
//  Uncomment the following lines and your endpoints and tokens are set based 
//  on your environment variables
//
///////////////////////////////////////////////////////////////////////////////

if (getenv("WEBLISTINGS_ENDPOINT") !== false){
  $weblisting_endpoint = getenv("WEBLISTINGS_ENDPOINT");
}

if (getenv("WEBLISTINGS_TOKEN") !== false){
  $weblisting_token = getenv("WEBLISTINGS_TOKEN");
}

if (getenv("WEBTOPROSPECT_ENDPOINT") !== false){
  $web_to_prospect_endpoint = getenv("WEBTOPROSPECT_ENDPOINT");
}

if (getenv("WEBTOPROSPECT_TOKEN") !== false){
  $web_to_prospect_token = getenv("WEBTOPROSPECT_TOKEN");
}

///////////////////////////////////////////////////////////////////////////////
//
//  Accept any server (peer) certificate on dev envs
//
//  Set $dev_env to true on localhost or other dev environments to run this 
//  website without the need for importing SSL certificates.
// 
//  Make sure to set $dev_env back to false on production environments, 
//  otherwise there is the risk of man-in-the-middle attacks! Check if your 
//  server uses SSL encryption and the SSL certificates are set up correctly. 
//  Normally the ca-cert defined in the php.ini is used, so no override is 
//  necessary.
//
//  If you have problems you may have to update your PHP version to support 
//  TLS.
//
///////////////////////////////////////////////////////////////////////////////

$dev_env = false;

?>
