// Copyright (c) 2012 Bugrose+Haozi. All rights reserved.
// Developed by bugrose(http://www.bugrose.com)
// Desgined by haozi(http://www.daqianduan.com)

chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.msg == "unactive"){
    	chrome.browserAction.setIcon({path:"ico16_unactive.png"});
    	chrome.browserAction.setPopup({popup: ""});
    }else{
       	chrome.browserAction.setIcon({path:"ico16.png"});
       	chrome.browserAction.setPopup({popup: "popup.html"});
       }
  });


