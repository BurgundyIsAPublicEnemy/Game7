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
	let li = document.createElement('li');
	li.appendChild(document.createTextNode(arg));
	keywordList.appendChild(li);
	console.log(li.innerText);

});

keywordSubmitButton.addEventListener("click", ipcSubmitForm);