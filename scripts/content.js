if (typeof modal_x === 'undefined') {
	let modal_x = "";
	let modal_y = "";
	let styleString = `.chrome-extension-modal-content{background-color:#fefefe;margin:auto;position:absolute;z-index:999998;padding:5px;border:1px solid #888;width:40%;justify-content:center;align-items:center;overflow:auto;max-height:500px}.chrome-extension-modal-content p{padding:30px;font-size:15px;font-family:Calibri,Candara,Segoe,Segoe UI,Optima,Arial,sans-serif}.chrome-extension-modal-loading{display:flex;justify-content:center;align-items:center}.chrome-extension-modal-loading .dot{position:relative;width:.5em;height:.5em;margin:.3em;border-radius:50%;padding:0}.chrome-extension-modal-loading .dot::before{position:absolute;content:"";width:100%;height:100%;background:inherit;border-radius:inherit;animation:wave 2s ease-out infinite}.chrome-extension-modal-loading .dot:nth-child(1){background:#7ef9ff}.chrome-extension-modal-loading .dot:nth-child(1)::before{animation-delay:.2s}.chrome-extension-modal-loading .dot:nth-child(2){background:#89cff0}.chrome-extension-modal-loading .dot:nth-child(2)::before{animation-delay:.4s}.chrome-extension-modal-loading .dot:nth-child(3){background:#4682b4}.chrome-extension-modal-loading .dot:nth-child(3)::before{animation-delay:.6s}.chrome-extension-modal-loading .dot:nth-child(4){background:#0f52ba}.chrome-extension-modal-loading .dot:nth-child(4)::before{animation-delay:.8s}.chrome-extension-modal-loading .dot:nth-child(5){background:navy}.chrome-extension-modal-loading .dot:nth-child(5)::before{animation-delay:1s}@keyframes wave{50%,75%{transform:scale(2.5)}100%,80%{opacity:0}}.chrome-extension-close{color:#aaa;background-color:#fff;float:right;font-size:28px;font-weight:700;padding:10px}.close:focus,.close:hover{color:#000;text-decoration:none;cursor:pointer}`;
	let modal_inner_html_string = `<button class="chrome-extension-close">&times;</button> <br> <br> <br> <br><div class="chrome-extension-modal-loading"><div class="dot"></div><div class="dot"></div><div class="dot"></div><div class="dot"></div><div class="dot"></div></div> <br> <br> <br> <br>`;
	let modal_html_string = `<div class="chrome-extension-modal-content" >` + modal_inner_html_string +` </div>`;
	const dragElement = function(elmnt) {
		var pos1 = 0,
			pos2 = 0,
			pos3 = 0,
			pos4 = 0;
		elmnt.onmousedown = dragMouseDown;
		elmnt.style.left = modal_x + "px";
		elmnt.style.top = modal_y + "px";

		function dragMouseDown(e) {
			e = e || window.event;
			e.preventDefault();
			pos3 = e.clientX;
			pos4 = e.clientY;
			document.onmouseup = closeDragElement;
			document.onmousemove = elementDrag;
		}

		function elementDrag(e) {
			e = e || window.event;
			e.preventDefault();
			pos1 = pos3 - e.clientX;
			pos2 = pos4 - e.clientY;
			pos3 = e.clientX;
			pos4 = e.clientY;
			elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
			elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
		}

		function closeDragElement() {
			document.onmouseup = null;
			document.onmousemove = null;
		}
	}
	const fadeOutLoader = function(callback) {
		var fadeTarget = document.getElementsByClassName("chrome-extension-modal-loading")[0];
		if (fadeTarget === undefined) return;
		if (!fadeTarget.style.opacity) {
			fadeTarget.style.opacity = 1;
		} else
			fadeTarget.style.opacity = 1;
		var fadeEffect = setInterval(function() {
			if (fadeTarget.style.opacity > 0) {
				fadeTarget.style.opacity -= 0.1;
			} else {
				clearInterval(fadeEffect);
				fadeTarget.remove();
				callback();
			}
		}, 100);
	}
	const createElementFromHTML = function(htmlString) {
		var div = document.createElement('div');
		div.innerHTML = htmlString.trim();
		return div.firstChild;
	}
	const addStyle = function(styleString) {
		const style = document.createElement('style');
		style.textContent = styleString;
		document.head.append(style);
	}
	var listener = function(request, options, sendResponse) {
		var display_result = function() {
			var modal_content = document.getElementsByClassName("chrome-extension-modal-content")[0];
			if (request.first_paragraph != "" && request.content != "")
				modal_content.innerHTML = "<button class='chrome-extension-close'>&times;</button>" + "<p>" + request.first_paragraph + "<br><br>" + request.content + "</p>";
			else if (request.content != "")
				modal_content.innerHTML = "<button class='chrome-extension-close'>&times;</button>" + "<p>" + request.content + "</p>";
			var span = document.getElementsByClassName("chrome-extension-close")[0];
			span.onclick = function() {
				console.log("close")
				modal_content.style.display = "none";
			};
		};
		if (request.name == "create_window") {
			addStyle(styleString);
			modal_content = document.getElementsByClassName("chrome-extension-modal-content")[0];
			if (modal_content == null) {
				let modal_element = createElementFromHTML(modal_html_string);
				document.body.append(modal_element);
			} else {
				modal_content.innerHTML = modal_inner_html_string;
			}
			var span = document.getElementsByClassName("chrome-extension-close")[0];
			span.onclick = function() {
				chrome.storage.sync.set({
					in_progress: false
				}, function() {
					console.log("set to false")
				});
				modal_content.style.display = "none";
			};
			var modal_content = document.getElementsByClassName("chrome-extension-modal-content")[0];
			modal_content.style.display = "block";
			dragElement(modal_content);
			sendResponse();
		} else if (request.name == "request_failed") {
			fadeOutLoader(display_result);
			sendResponse();
		} else if (request.name == "request_succeed") {
			fadeOutLoader(display_result);
			sendResponse();
		} else sendResponse();
		return true;
	}
	document.addEventListener("contextmenu", function(event) {
		modal_x = event.pageX;
		modal_y = event.pageY;
		if (!chrome.runtime.onMessage.hasListener(listener)) {
			chrome.runtime.onMessage.addListener(listener);
		}
	});
}