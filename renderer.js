const electron = require('electron');

// Module to let main and renderer talk to one another
const ipcRenderer = electron.ipcRenderer;

//Module that lets Electron open links with the default browser
const shell = require('electron').shell;

const keywordField = document.getElementById('keyword-field');
const keywordSubmitButton = document.getElementById('keyword-submit');
const keywordRemoveButton = document.getElementById('keyword-remove');
const keywordList = document.getElementById('keyword-list');

function ipcSubmitForm(channel) {
	let keyword = keywordField.value;
	ipcRenderer.send(channel, keyword);
	console.log('Sent ' + keyword);
}

ipcRenderer.on('refresh-keyword-list', function (event, arg) {
	keywordList.innerHTML = "";
	
	for (i=0; i < arg.length; i ++) {
		let li = document.createElement('li');
		li.appendChild(document.createTextNode(arg[i]));
		keywordList.appendChild(li);
	}

});

ipcRenderer.on('news-alert', function (event, arg) {
    console.log('News update');
    let notification = new Notification(arg.title, {
        body: arg.description
    });

    notification.addEventListener('click', function () {
        shell.openExternal(arg.url);
    });
});


setInterval(function () {
    ipcRenderer.send('check-for-updates');
},60000);

keywordSubmitButton.addEventListener("click", function () {ipcSubmitForm('add-keyword')});
keywordRemoveButton.addEventListener("click", function () {ipcSubmitForm('remove-keyword')});

ipcRenderer.send('init');
ipcRenderer.send('check-for-updates');