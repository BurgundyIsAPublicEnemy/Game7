const electron = require('electron');
const ipcRenderer = electron.ipcRenderer;

const keywordField = document.getElementById('keyword-field');
const keywordSubmitButton = document.getElementById('keyword-submit');
const keywordList = document.getElementById('keyword-list');

function ipcSubmitForm() {
	keyword = keywordField.value;
	ipcRenderer.send('add-keyword', keyword);
	console.log('Sent ' + keyword);
}

ipcRenderer.on('update-keyword', function (event, arg) {
	keywordList.innerHTML = "";
	
	for (i=0; i < arg.length; i ++) {
		let li = document.createElement('li');
		li.appendChild(document.createTextNode(arg[i]));
		keywordList.appendChild(li);
	}

});

ipcRenderer.on('new-alert', function (event, arg) {
	let myNotification = new Notification(arg.title, {
	  body: arg.description
	});


});

keywordSubmitButton.addEventListener("click", ipcSubmitForm);