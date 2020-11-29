//first electron app
//main.js is the entry point for an application

//importing app and BrowserWindow modules of the elctron package to be able to manage your applications lifecycle events
//as well as create and control browser windows
const { app, BrowserWindow, net } = require('electron')
const settings = require('electron-settings');

//this creates a new browser window, with node integration enabled,
//then loads index.html into the window, and opens developer tools
function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true
    }
  })

  win.loadFile('index.html')
  //win.webContents.openDevTools()
}

//createss the new browser window by invoking creaateWindow once electron is initialized
app.whenReady().then(createWindow)

//a listener that tries to quit when no windows are open
//this will not happen on macOS due to the OS's window management behavior
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

//add a listener that creates a new browser window only if the application has no visible windows after being activated
//such as first time launch or re-launching the alreayd running app
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
