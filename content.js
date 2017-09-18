//resource collection
var RC = RC || {};
RC.initFlag = false;
// Copyright (c) 2012 Bugrose+Haozi. All rights reserved.
// Developed by bugrose(http://www.bugrose.com)
// Desgined by haozi(http://www.daqianduan.com)

RC.init = function(){
	this.data = {
		"script":{
			"attr" : "src",
			"data" : []
		},
		"link":{
			"attr" : "href",
			"data" : []
		},
		"img":{
			"attr" : "src",
			"data" : []
		}
	};

	for(var key in this.data){
		var attr = this.data[key]["attr"];
		RC.getResourceList(key, attr);
	}

	RC.initFlag = true;

	//RC.setResourceStorage();
}

RC.getResourceList = function(type, attr){
	var arr = [];
	var res = document.getElementsByTagName(type);
	for (var i = res.length - 1; i >= 0; i--) {
		if(res[i].getAttribute(attr) != null){
			//fix css bug
			if(type=="link"){
				if(/\.css$/.test(res[i].getAttribute(attr).split("?")[0])){
					arr.push(res[i].getAttribute(attr));
				}
			}else{
				arr.push(res[i].getAttribute(attr));
			}
			
		}
	};
	this.data[type]["data"] = arr;
}

RC.setResourceStorage = function(){
	for(var key in this.data){
		window.localStorage.setItem(key+"Res", this.data[key]["data"]);
	}
}

window.addEventListener("load", function(){
	setTimeout(function(){
		RC.init();
		chrome.extension.sendMessage({msg: "active"}); 
	},3000);
});

chrome.extension.onMessage.addListener(
        function(request, sender, sendResponse) { 
                if (request.msg == "getResource"){
                	  var arr;
                	  if(!RC.initFlag){RC.init();}
                	  arr = RC.data;
                	  var dir = location.href.substring(0,location.href.lastIndexOf('/'));
                	  sendResponse({urls:arr, dir:dir});
                }
});
chrome.extension.sendMessage({msg: "unactive"}); 


