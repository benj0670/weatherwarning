const axios = require('axios');
const cheerio = require('cheerio');
const Jetty = require("jetty");
const log = require('single-line-log').stdout;

var Pushover = require( 'pushover-js').Pushover;
const pushover = new Pushover('benj0670@gmail.com', 'u75kfcthv31nnz823tick1c1ao5213')

var jetty = new Jetty(process.stdout);
jetty.clear();

var now = new Date();
var minute = 50;
var site = "https://www.gov.nl.ca/";

checkTime();

function checkTime() {
  var now = new Date();
  var millisTill5 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 13, minute, 0, 0) - now;
  if (millisTill5 < 0) {
       millisTill5 += 86400000;
  }
  setTimeout(function()
  {
    checkSite();
  }, millisTill5);
}

function checkSite() {
  axios(site)
    .then(response => {
      const body = response.data;
      const $ = cheerio.load(body)
      const infoStructure = $('body');

      infoStructure.each(function () {  
        notify = $(this).find('section.homepage-notifications').text();
        if (notify.includes("Adverse Weather Warning")) {
          notificationTitle = $(this).find('div.homepage-notification.blue > div.homepage-notification-text > h1').text();
          notificationBody = $(this).find('div.homepage-notification.blue > div.homepage-notification-text > p').text();
          console.log(notificationTitle.trim() + ": " + notificationBody);
          pushover.send(notificationTitle.trim(), notificationBody).then(console.log).catch(console.error)
        } else {
          console.log("There are no weather warnings.");
        }
      });
    }).catch(console.error);
  minute = minute + 1;
  console.log(minute);
  checkTime();
}