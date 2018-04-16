const electron = require('electron');
const url = require('url');
const path = require('path');

const {app, BrowserWindow, Menu, ipcMain} = electron;

// set env

process.env.NODE_ENV = 'production';


let mainWindow;
let addWindow;

//listen for the app to be ready

app.on('ready', function(){
	//create new window
	mainWindow = new BrowserWindow({});
	//load the html file

	mainWindow.loadURL(url.format({
		pathname: path.join(__dirname, 'mainWindow.html'),
		protocol: 'file:',
		slashes: true
	}));

	//quit the app when mainwindow is closed
	mainWindow.on('closed', function(){
		app.quit();
	});

	//build menu form template
	const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);

	//insert menu
	Menu.setApplicationMenu(mainMenu);
});

//handle create add window

function createAddWindow(){
	//create new window
	addWindow = new BrowserWindow({
    width: 300,
    height:200,
    title:'Add Shopping List Item'
  });
	//load the html file

	addWindow.loadURL(url.format({
		pathname: path.join(__dirname, 'addWindow.html'),
		protocol: 'file:',
		slashes: true
	}));

	//garbage collection handle
	addWindow.on('close', function(){
		addWindow = null;
	});

}

// catch item:add
ipcMain.on('item:add', function(e, item){
	mainWindow.webContents.send('item:add', item);
	addWindow.close();
});


//create menu template

const mainMenuTemplate = [
	{
    label: 'File',
    submenu:[
      {
        label:'Add Item',
        click(){
          createAddWindow();
        }
      },
      {
        label:'Clear Items',
        click(){
          mainWindow.webContents.send('item:clear');
        }
      },
      {
        label: 'Quit',
        accelerator:process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
        click(){
          app.quit();
        }
      }
    ]
  }
];

//if mac add empty object to menu

if(process.platform == 'darwin'){
	mainMenuTemplate.unshift({});
}

//add developer tool items if not in production

if(process.env.NODE_ENV !== 'production'){
	mainMenuTemplate.push({
		label: 'Developer Tools',
		submenu:[
      {
        role: 'reload'
      },
      {
        label: 'Toggle DevTools',
        accelerator:process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
        click(item, focusedWindow){
          focusedWindow.toggleDevTools();
        }
      }
      ]
	});

}