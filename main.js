const electron = require('electron');

//Module to access local filesystem
const fs = require('fs');

// Module to make requests to news api
const net = electron.net;
// Module to let main and renderer talk to one another
const ipcMain = electron.ipcMain;
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const path = require('path');
const url = require('url');

const apiKey = fs.readFileSync('./api-key.txt').toString();
let keywords = ['celtic', 'england'];
let cache = [];

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 330, height: 600, icon: path.join(__dirname, '/icon/png/64x64.png')});

  // hide the browser menu
  mainWindow.setMenu(null);

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));


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
});
		
// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
});


//Things that should be done once, as soon as the program is run
ipcMain.on('init', function (event, arg) {
    event.sender.send('refresh-keyword-list', keywords);
});

//Add and remove keywords from the list of arguments

ipcMain.on('add-keyword', function(event, arg) {
    if (!keywords.includes(arg)) {
        keywords.push(arg);
        event.sender.send('refresh-keyword-list', keywords);
    }
});

ipcMain.on('remove-keyword', function(event, arg) {
    if (keywords.includes(arg)) {
        keywords.splice(keywords.indexOf(arg), 1);
        event.sender.send('refresh-keyword-list', keywords);
    }
});


//Check News API.
ipcMain.on('check-for-updates', function (event, arg) {
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
                    if (articles[i].title.toLowerCase().includes(keywords[j]) || articles[i].description.toLowerCase().includes(keywords[j])) {
                        if (!cache.includes(articles[i].url)) { // Verify that the user has not been alerted to this news already.
                            event.sender.send('news-alert', articles[i]);
                            cache.push(articles[i].url);
                        }
                    }
                }
            }
        });

    });

    request.end()


});

