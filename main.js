//first electron app
//main.js is the entry point for an application

//importing app and BrowserWindow modules of the elctron package to be able to manage your applications lifecycle events
//as well as create and control browser windows
const { app, BrowserWindow, net, Menu } = require('electron')
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
  const template = [
    {
      label: 'File',
      submenu: [
        { role: 'close' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'copy' },
        { role: 'paste' },
        { type: 'separator' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        { role: 'close' }
      ]
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'GitHub',
          click: async () => {
            const { shell } = require('electron')
            await shell.openExternal('https://electronjs.org')
          }
        },
        {
          label: 'Documentation',
          click: async () => {
            const { shell } = require('electron')
            await shell.openExternal('https://electronjs.org')
          }
        },
        {
          label: 'Danger Zone!',
          submenu: [
            { label: 'Reset Settings',
              click: () => {
                win.webContents.executeJavaScript('resetSettings();')
              }
            },
            { label: 'About Reset Settings',
              click: async () => {
                const { shell } = require('electron')
                await shell.openExternal('https://electronjs.org')
              }
            },
            { label: 'Factory Reset',
              click: () => {
                win.webContents.executeJavaScript('factoryReset();')
              }
            }
          ]
        }
      ]
    },
    {
      label: 'About',
      submenu: [
        { label: 'App Version: '+app.getVersion() },
        { label: 'Settings: '+settings.file() }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
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
