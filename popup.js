// Copyright (c) 2012 Bugrose+Haozi. All rights reserved.
// Developed by bugrose(http://www.bugrose.com)
// Desgined by haozi(http://www.daqianduan.com)


var blobBuilder, blob, BlobBuilder = this.WebKitBlobBuilder || this.MozBlobBuilder || this.BlobBuilder;

var global_zipWriter;
var URL = this.webkitURL || this.mozURL || this.URL;

var g_resData = {}; //所有资源信息
var g_downResData = [];//所有勾选的要下载的资源信息
var g_downResData_Flag = false;//是否下载完毕的标记
var g_fileName = [];

String.prototype.trim = function () {
	return this.replace(/^\s+/, "").replace(/\s+$/, "");
}

Number.prototype.fixZero = function () {
	if (this < 10) {
		return "0" + this;
	}
	return this;
}

function arrayUnique(arr) {
	var tempArr = arr;
	var finalArr = [];
	for (var i = 0, l = tempArr.length; i < l; i++) {
		if (finalArr.indexOf(tempArr[i]) == -1) {
			finalArr.push(tempArr[i]);
		}
	}
	return finalArr;
}

function onerror(message) {
	console.error(message);
}


function initPopEvents() {
	var last = document.getElementById("scriptbox");
	var lastLink = document.getElementById("menu").getElementsByTagName("a")[0];

	//switch button
	document.getElementById("menu").addEventListener("click", function (e) {
		var target = e.target;
		if (target.tagName == "A") {
			var dataType = target.getAttribute("data-type");
			last.style.display = "none";
			document.getElementById(dataType).style.display = "";
			last = document.getElementById(dataType);

			lastLink.className = "";
			target.className = "cur";
			lastLink = target;
		}
	}, false);

	//select content
	document.getElementById("content").addEventListener("click", function (e) {
		var target = e.target;
		if (target.tagName == "A" || target.tagName == "IMG") {
			target = target.parentNode.getElementsByTagName("INPUT")[0];
		} else if (target.tagName == "LABEL" || target.tagName == "LI") {
			target = target.getElementsByTagName("INPUT")[0];
		}

		if (target.tagName == "INPUT") {
			var checked = target.checked;
			var i = target.getAttribute("data-id");

			if (checked) {
				var v = target.getAttribute("data-src");
				var k = target.getAttribute("data-type");
				var l = target.getAttribute("data-link");
				var t = "";
				if (k == "script") {
					t = "application/x-javascript";
				} else if (k == "link") {
					t = "text/css";
				} else if (k == "img") {
					t = "image/" + v.split(".")[0];
				}
				g_downResData[i] = [k, t, v, false, false, l]; //["script", "application/x-javascript","http://xxxx.js",null/blob, ispackaged,"link/data"];

				if (l == "link") {
					g_downResData_Flag = false;
					var request = new XMLHttpRequest();
					request.addEventListener("load", function () {
						if (request.status == 200) {
							var blob = new Blob([request.response], { type: t });
							g_downResData[i][3] = blob;
							g_downResData_Flag = true;
						}
					}, false);
					request.open("GET", v);
					request.responseType = 'blob';
					request.send();
				} else if (l == "data") {
					g_downResData[i][3] = v;
					g_downResData_Flag = true;
				}
			} else {
				delete g_downResData[i];
			}

		}
	}, false);
}

//获取尚未打包的文件
function getUnPackageInfo() {
	for (var i in g_downResData) {
		if (!g_downResData[i][4] && g_downResData[i][3] != false) {
			return g_downResData[i];
		}
		continue;
	}
	return false;
}

function resetPackageStatus() {
	for (var i in g_downResData) {
		g_downResData[i][4] = false;
	}
}

function getProperName(type, name) {
	var t = {
		"script": ".js",
		"link": ".css",
		"img": ".gif"
	};
	//get real name
	var url = name.split("?")[0];
	var pos = url.lastIndexOf("/");
	if (pos == -1) pos = url.lastIndexOf("\\")
	var filename = url.substr(pos + 1);

	if (filename.trim() == "") { filename = (new Date()).getTime() + ""; }

	var tArr = filename.split(".");
	if (tArr.length == 1) {
		filename = filename + t[type];
	}

	if (g_fileName.indexOf(filename) == -1) {
		g_fileName.push(filename);
	} else {
		filename = filename.replace(/([^.]+)\./, "$1_" + (new Date()).getTime() + ".");
		g_fileName.push(filename);
	}

	return filename;
}
function nextFile(downloadButton, event) {
	if (g_downResData_Flag) {
		var info = getUnPackageInfo();
		if (!info) {
			triggerDownload(downloadButton, event);
			return false;
		}
		//var filename = info[2].replace(/.+\/(\w+\.\w+)(?:\?.+)?/g, '$1');

		// http://fancyapps.com/
		// fancybox/3/fancybox/jquery.fancybox.min.js?v=1505281921

		var filename = getProperName(info[0], info[2]);
		filename = makeFinallyFileName(info[2], filename);
		var blob = info[3];
		var linktype = info[5];

		event.preventDefault();

		if (linktype == "link") {
			global_zipWriter.add(filename, new zip.BlobReader(blob), function () {
				info[4] = true;
				nextFile(downloadButton, event);
			});
		} else {
			global_zipWriter.add(filename, new zip.Data64URIReader(blob), function () {
				info[4] = true;
				nextFile(downloadButton, event);
			});
		}
	} else {
		event.preventDefault();
		setTimeout("nextFile", 500);
	}
}

// 生成最终文件名
function makeFinallyFileName(url, fileName) {
	console.log(url)
	var name = url.replace(/http:|https:/, "");
	name = name.substring(name.indexOf("/") + 2, name.lastIndexOf("/") + 1) + fileName;
	// return name + "/" + fileName;
	var fanllyName = url.substring(0, url.indexOf("/") - 1) + "/" + name;
	console.log(fanllyName)
	return fanllyName;
}

function getDownloadName() {
	var n = new Date();
	var m = n.getMonth().fixZero();
	var d = n.getDate().fixZero();
	var h = n.getHours().fixZero();
	var mi = n.getMinutes().fixZero();

	return "downfaster_" + [m, d, h, mi].join("") + ".zip";
}
function triggerDownload(downloadButton, event) {
	if (!downloadButton.download) {
		global_zipWriter.close(function (blob) {
			var blobURL = URL.createObjectURL(blob);

			var clickEvent = document.createEvent("MouseEvent");
			clickEvent.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
			downloadButton.href = blobURL;
			downloadButton.download = getDownloadName();
			downloadButton.dispatchEvent(clickEvent);

			/*downloadButton.href="";
			downloadButton.download = "";
			resetPackageStatus();*/

			setTimeout(function () {
				URL.revokeObjectURL(blobURL);
				downloadButton.setAttribute("href", "#");
				downloadButton.download = "";
				resetPackageStatus();
				global_zipWriter = null;
				g_fileName = [];
			}, 1);

			zipWriter = null;
		});
		event.preventDefault();
	}

}

window.onload = function () {
	initPopEvents();

	var downloadButton = document.getElementById("download");
	downloadButton.addEventListener("click", function (event) {
		var cEvent = event;
		zip.createWriter(new zip.BlobWriter(), function (zipWriter) {
			global_zipWriter = zipWriter;
			nextFile(downloadButton, cEvent);
		}, onerror);
	}, false);
};


chrome.tabs.getSelected(null, function (tab) {
	chrome.tabs.sendMessage(tab.id, { msg: "getResource" }, function (response) {
		var data = response.urls;
		if (typeof data == "undefined") {
			document.getElementById("default_msg").style.display = "";
			document.getElementById("mainContainer").style.display = "none";
		} else {
			document.getElementById("default_msg").style.display = "none";
			document.getElementById("mainContainer").style.display = "";
		}
		var dir = response.dir;
		var domain = dir.replace(/(^http:\/\/[^\/]+)(\/.+)/g, '$1');
		for (var key in data) {
			if (typeof key == "string") {
				var arr = data[key]["data"];
				var str = "";

				arr = arrayUnique(arr.sort());



				for (var i = 0; i < arr.length; i++) {
					var link = arr[i].trim();
					var link_type = "link";
					if (/^\/\//.test(link)) {
						arr[i] = "http:" + arr[i];
					} else if (/^\//.test(link)) {
						arr[i] = domain + arr[i];
					} else if (/^data:image\/[^;]*;base64,/.test(link)) { //data:image/jpeg;base64,/9j/4A
						arr[i] = arr[i];
						link_type = "data";
					} else if (!/^http/.test(link)) {
						arr[i] = dir + "/" + arr[i];
					}

					if (key == "img") {
						str += "<li><label><input type='checkbox' data-type='" + key + "' data-id='" + key + i + "' data-src='" + arr[i] + "' data-link='" + link_type + "' /><img src='" + arr[i] + "' /></label></li>";
					} else {
						str += "<li><label><input type='checkbox' data-type='" + key + "' data-id='" + key + i + "' data-src='" + arr[i] + "' data-link='" + link_type + "' />" + arr[i] + "<a href='" + arr[i] + "' target='blank'></a></label></li>";
					}

				};
				document.getElementById(key + "box").innerHTML = str;
			}
		}
	});
});
