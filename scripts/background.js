let failure_message = "Unable to summarize text.";
let failure_message_blank = "To generate a summary, increase the summary length through the extension toolbar settings.";
let url = "";
let request;
let injected_tabs = []
chrome.runtime.onInstalled.addListener(function() {
	let contextMenuItem = {
		id: "summarize",
		title: "Blinknotes",
		contexts: ["page", "selection"]
	};
	chrome.contextMenus.create(contextMenuItem);
});
chrome.contextMenus.onClicked.addListener(function(info, tab) {
	let length = "0.1";
	chrome.storage.sync.get('length', function(data) {
		length = (data.length / 20).toString();
	});
	chrome.tabs.query({
		active: true,
		lastFocusedWindow: true
	}, tabs => {
		url = tabs[0].url;
	});
	if (info.menuItemId == "summarize") {
		chrome.storage.sync.get('in_progress', function(data) {
			if (data.in_progress == undefined || data.in_progress == false) {
				chrome.storage.sync.set({
					in_progress: true
				}, function() {
					chrome.tabs.sendMessage(tab.id, {
						name: "create_window",
						content: {}
					}, {}, function(res) {});
					chrome.tabs.executeScript({
						code: "window.getSelection().toString();"
					}, function(selection) {
						if (isNaN(length)) length = "0.1";
						if (selection == "") {
							request = new XMLHttpRequest();
							request.open("POST", "https://text-summarize-api.herokuapp.com/url/", true);
							request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
							let params = "url=" + url + "&length=" + length;
							request.send(params);
							request.onreadystatechange = function() {
								if (request.readyState == 4 && request.status == 200) {
									var response = request.responseText;
									let a = response.split("\n");
									let first_paragraph = "";
									if (a[1] == "") {
										first_paragraph = a[0];
										response = "";
										for (let i = 1; i < a.length; i++) response += a[i];
									}
									if (first_paragraph != "")
										first_paragraph = first_paragraph.replace(/(\r\n|\n|\r)/gm, "");
									response = response.replace(/(\r\n|\n|\r)/gm, "");
									if (response == "" && first_paragraph == "")
										chrome.tabs.sendMessage(tab.id, {
											name: "request_succeed",
											first_paragraph: "",
											content: failure_message_blank
										}, {}, function(res) {
											chrome.storage.sync.set({
												in_progress: false
											}, function() {});
										});
									else
										chrome.tabs.sendMessage(tab.id, {
											name: "request_succeed",
											first_paragraph: first_paragraph,
											content: response
										}, {}, function(res) {
											chrome.storage.sync.set({
												in_progress: false
											}, function() {});
										});
								} else if (request.readyState == 4) {
									chrome.tabs.sendMessage(tab.id, {
										name: "request_failed",
										first_paragraph: "",
										content: failure_message
									}, {}, function(res) {
										chrome.storage.sync.set({
											in_progress: false
										}, function() {});
									});
								}
							}
						} else {
							if (isNaN(length)) length = "0.1"
							request = new XMLHttpRequest();
							request.open("POST", "https://text-summarize-api.herokuapp.com/text/", true);
							request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
							let params = "text=" + encodeURIComponent(selection) + "&length=" + length;
							request.send(params);
							request.onreadystatechange = function() {
								if (request.readyState == 4 && request.status == 200) {
									var response = request.responseText;
									response = response.replace(/(\r\n|\n|\r)/gm, "");
									if (response == "")
										chrome.tabs.sendMessage(tab.id, {
											name: "request_succeed",
											first_paragraph: "",
											content: failure_message_blank
										}, {}, function(res) {
											chrome.storage.sync.set({
												in_progress: false
											}, function() {});
										});
									else
										chrome.tabs.sendMessage(tab.id, {
											name: "request_succeed",
											first_paragraph: "",
											content: response
										}, {}, function(res) {
											chrome.storage.sync.set({
												in_progress: false
											}, function() {});
										});
								} else if (request.readyState == 4) {
									chrome.tabs.sendMessage(tab.id, {
										name: "request_failed",
										first_paragraph: "",
										content: failure_message
									}, {}, function(res) {
										chrome.storage.sync.set({
											in_progress: false
										}, function() {});
									});
								}
							}
						}
					});
				});
			}
		});
	}
});
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	if (injected_tabs.includes(tabId)) return;
	chrome.storage.sync.set({
		in_progress: false
	}, function() {});
	injected_tabs.push(tabId)
	chrome.tabs.executeScript({
		file: 'scripts/content.js'
	}, _ => {
		chrome.runtime.lastError;
		injected_tabs = injected_tabs.filter(item => item !== tabId)
	})
});
chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
	injected_tabs = injected_tabs.filter(item => item !== tabId)
});