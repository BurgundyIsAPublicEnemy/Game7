const electron = require('electron')

//Module to access local filesystem
const fs = require('fs')

// Module to make requests to news api
const net = electron.net
// Module to let main and renderer talk to one another
const ipcMain = electron.ipcMain
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')

const apiKey = fs.readFileSync('./api-key.txt').toString()
let keywords = ['celtic', 'England'];
let cache = new Array;

console.log(apiKey);

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 800, height: 600})

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function() {
	createWindow();
	
	
	setTimeout(function() {
		const request = net.request('https://newsapi.org/v1/articles?source=bbc-sport&sortBy=top&apiKey=' + apiKey);
		let body = new String;

		request.on('response', (response) => {
			response.on('data', (chunk) => {
				body += chunk;
			});

			response.on('end', () => {
				let articles = JSON.parse(body)["articles"];
				for (i = 0; i < articles.length; i++) {
					for (j = 0; j < keywords.length; j++) {
						if (articles[i].title.includes(keywords[j]) || articles[i].description.includes(keywords[j])) {
							console.log(articles[i].title + ' has ' + keywords[j])
							if (!cache.includes(articles[i])) {
								ipcMain.send('new-alert', articles[i]);
							}
						}
					}
				}
			});
				
		});
		
		request.end()
	}, 1);
	
});
		
// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

ipcMain.on('add-keyword', function(event, arg) {
  console.log('added kw ' + arg);
  keywords.push(arg);
  event.sender.send('update-keyword', keywords);
});

