let slider = document.getElementById("myRange");
chrome.storage.sync.get('length', function(data) {
	if (data.length == undefined) {
		chrome.storage.sync.set({
			length: 2
		}, function() {});
		return;
	}
	let length_value = data.length;
	let text = document.querySelector(".short-text");
	text.innerHTML = "Relative Length - " + length_value;
	slider.setAttribute('value', length_value);
});
slider.oninput = function() {
	let text = document.querySelector(".short-text");
	text.innerHTML = "Relative Length - " + this.value;
	chrome.storage.sync.set({
		length: this.value
	}, function() {});
}