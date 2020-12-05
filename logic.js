//var addLibrary = document.getElementById("addLibrary");
const { dialog } = require('electron').remote
const { net } = require('electron').remote
const { BrowserWindow } = require('electron').remote
const settings = require('electron-settings');
const fetch = require('node-fetch');
const keytar = require('keytar');

//this is for handling all search features
var searchInputElement = document.getElementById("searchTextField");
var searchIconElement = document.getElementById("searchTextIcon");
searchInputElement.addEventListener("keyup",
function (event) {
  if (event.keyCode === 13) {
    event.preventDefault();
    search();
  }
});



//This is the startup function, loading needed elements
function startFunction() {
  initSettings();
  sidebarVis();
  gameLibraryVis();

  //this is for loading the searchList
  searchList();
}

function initSettings() {
  //this will be for creating first time settings that need to be there
  if (!settings.hasSync('discordLink')) {
    //discord linking hasn't been declared,
    //so declare as false
    settings.setSync('discordLink', {
      status: false
    });
  }

}

function searchList() {
  var searchListData = "";
  if (settings.hasSync('SteamAppId')) {
    //executed if steam apps have been Saved
    var tempSteamAppIDList = settings.getSync('SteamAppId.list').split(",");
    var u;
    for (u=0;u<tempSteamAppIDList.length;u++) {
      var tempAddToList = settings.getSync(tempSteamAppIDList[u]+'.details.name');
      searchListData += "<option value='"+tempAddToList+"'>";
    }
  }
  document.getElementById('gamesSearch').innerHTML += searchListData;
}

function gameLibraryVis() {
  //this is made simply to look at the saved apps and create the main HTML page for it.

  //first create an array of the ID's for Steam,
  var displaySteamIds;
  try {
    displaySteamIds = (settings.getSync('SteamAppId.list')).split(",");
    console.log("Parsed App ID's for Display: "+displaySteamIds.length);
  } catch {
    console.log("No Steam ID's Saved...");
  }

  //now to create the element to insert in the page.
  var steamDataToInsert = "";
  var i;
  for (i = 0; i < displaySteamIds.length; i++) {
    var applicationIdentity = displaySteamIds[i];
    var insertName = settings.getSync(applicationIdentity+'.details.name');
    var insertDescription = settings.getSync(applicationIdentity+'.details.description');
    var insertImg = settings.getSync(applicationIdentity+'.details.img');

    steamDataToInsert += "<div class='grid-item' id='"+insertName+"'><div class='card'><div class='card-body'><div class='card-title'>";
    steamDataToInsert += "<a href='steam://rungameid/"+applicationIdentity+"'><img src='./data/images/play.svg' style='float:right; background-color:#212121;'></a>"+insertName;
    steamDataToInsert += "</div><p class='card-text'>"+insertDescription+"</p>";
    steamDataToInsert += "<div class='card-footer text-muted'><img src='"+insertImg+"'/>";
    steamDataToInsert += "</div></div></div></div>";
  }
  document.getElementById('game-container').innerHTML += steamDataToInsert;

}

function sidebarVis() {
  //First tab will be saved Libraries
  if (settings.hasSync('SavedLibraries')) {
    var displaySavedLibrary = (settings.getSync('SavedLibraries.fullList')).split(",");

    var libraryDataToInsert = "";
    var i;
    libraryDataToInsert += "<div class='sidebar-item'><dl><dt>Libraries</dt><hr>";
    for (i = 0; i < displaySavedLibrary.length; i++) {
      var insertLibrary = displaySavedLibrary[i];
      libraryDataToInsert += "<dd>"+insertLibrary+"</dd>";
    }
    libraryDataToInsert += "<dd><a href='#' onclick='addLibrary()'><img src='./data/images/folder-plus.svg' style='width:20px;'></a>";
    libraryDataToInsert += "<img src='./data/images/folder-minus.svg' style='width:20px;margin-left:10px;'></dd>";
    libraryDataToInsert += "</dl></div>";
    document.getElementById('sidebar-container').innerHTML += libraryDataToInsert;
  } else {
    console.log('No Saved libraries');
    var libraryDataToInsert = "";
    libraryDataToInsert += "<div class='sidebar-item'><div><dl><dt>Libraries</dt><hr>";
    libraryDataToInsert += "<dd><a href='#' onclick='addLibrary()'><img src='./data/images/folder-plus.svg' style='width:20px;'></a>";
    libraryDataToInsert += "<img src='./data/images/folder-minus.svg' style='width:20px;margin-left:10px;'></dd>";
    libraryDataToInsert += "</dl></div>";
    document.getElementById('sidebar-container').innerHTML += libraryDataToInsert;
  }

  if (settings.getSync('discordLink.status')) {
    console.log("Discord Successfully Linked");
    try {
      var discordDataToInsert = "";
      DiscordAPI("user_name").then(retreivedUser => {
        console.log("Retreived Username for Sidebar: "+retreivedUser);
        discordDataToInsert += "<div class='sidebar-item'><dl><dt>Discord</dt><hr>";
        discordDataToInsert += "<dd>"+retreivedUser+"</dd>";
        discordDataToInsert += "</dl></div>";
        document.getElementById('sidebar-container').innerHTML += discordDataToInsert;
      });
    }
    catch(ex) {
      console.log("Unable to access saved Discord Data: "+ex);
    }
  } else {
    console.log("Discord has not been linked");
    document.getElementById('sidebar-container').innerHTML += "<div onclick='linkDiscord()'>Link your Discord!</div>";
  }

}

function linkDiscord() {
  var authWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    titleBarStyle: 'hidden',
    webPreferences: {
      nodeIntegration: false,
    },
  });
  var discordURL = 'https://discord.com/api/oauth2/authorize?client_id=782700649439166504&redirect_uri=http%3A%2F%2Flocalhost&response_type=code&scope=identify';

  authWindow.loadURL(discordURL);
  authWindow.show();

  //to properly get the redirect and XMLpost, i may have to register
  //a URI for Game Gaggle,

  authWindow.webContents.on('will-navigate', function(event, url) {
    console.log("Will-Navigate Returned URL...");
    if (url.includes("code")) {
      //includes the access code
      authWindow.destroy();
      var tempURLSplit = url.split("=");
      var discordAccessCode = tempURLSplit[1];
      //now time to make the Post request to exchange the Access Code wtih a User's Access Token
      const discordExchangeData = {
        client_id: SEC_Discord_client_id,
        client_secret: SEC_Discord_client_secret,
        grant_type: 'authorization_code',
        redirect_uri: SEC_Discord_redirect_uri,
        code: discordAccessCode,
        scope: 'identify',
      };

      fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        body: new URLSearchParams(discordExchangeData),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }).then(res => res.json())
      .then(info => {
        //mark the time the original call was made.
        var created_time = new Date();
        //console.log(info.token_type);
        //console.log(info.access_token);
        try {
          keytar.setPassword("Gaming Gaggle", "DiscordAccessToken", info.access_token);
          keytar.setPassword("Gaming Gaggle", "DiscordRefreshToken", info.refresh_token);
          console.log("Successfully saved credentials to keychain.");
          settings.setSync('discordLink', {
            status: true
          });
          //finally after successfully saving credentials change discord to true for linking
          //then save the non-secret discord link data.
          //since the expires_in value is based on seconds from the time the request is made
          //that also needs to be saved
          settings.setSync('discordLinkData', {
            expires_in: info.expires_in,
            scope: info.scope,
            token_type: info.token_type,
            created_at: created_time.getTime(),
          });
          console.log("Successfully saved Non-Secret Discord Data");
        }
        catch(ex) {
          console.log("There was an error saving to the keychain: "+ex);
        }
      });


    } else if (url.includes("error")) {
      //includes an error
      authWindow.destroy();
      console.log("Error with Discord Integration: "+url);
    } else {
      //generic error
      console.log("Generic Error");
    }
  });

  //Reset the authWindow on close
  authWindow.on(
    'close',
    function() {
      authWindow = null;
    },
    false
  );
}

function DiscordAPI(option) {
  //I will wrap this function around a promise to properly use it as a promise elsewhere
  return new Promise(function(resolve, reject) {
    var discordLinkedSettings = settings.getSync("discordLinkData");
    const DiscordAccessToken = keytar.getPassword('Gaming Gaggle', 'DiscordAccessToken');
    const DiscordRefreshToken = keytar.getPassword('Gaming Gaggle', 'DiscordRefreshToken');
    //we need the current time to compare to
    var expiry = new Date();

    if ( (((discordLinkedSettings.created_at / 1000) + Number(discordLinkedSettings.expires_in)) - 86400)
          > (expiry.getTime() / 1000) ) { //this will return false if expired, or a day from expiry, so every 6 days

      if (option == "user_name") {
        console.log("Fetching username of Discord Account...");
        DiscordAccessToken.then((DiscordAccessTokenPromise) => {
          fetch('https://discord.com/api/users/@me', {
            headers: {
              authorization: `${discordLinkedSettings.token_type} ${DiscordAccessTokenPromise}`,
            },
          })
          .then(temp => temp.json())
          .then(res => {
            resolve(res.username);
          });
        });
      }
      else if (option == "user_icon") {

      }
    } else {
      //refresh the token
      console.log("Token has expired or is nearly expired");

    }
  });
}

function search() {
  console.log("search() accessed; Value: "+document.getElementById("searchTextField").value);

  try {
    document.getElementById(document.getElementById("searchTextField").value).scrollIntoView();
  } catch(ex) {
    console.log("Couldn't navigate to search: "+ex);
    console.log("Text: "+document.getElementById("searchTextField").value);
  }
  //window.open("#"+document.getElementById("searchTextField").value);
  //document.getElementById("searchTextOutput").value = document.getElementById("searchTextField").value;
  //console.log(document.getElementById("searchTextField").value);
}

function filterSearch() {

}

function addLibrary() {

  result = dialog.showOpenDialogSync({
    title: "Add Game Library",
    buttonLabel: "Add Library",
    properties: ['openDirectory', "dontAddToRecent"]
  });
  if (result === undefined) {
    console.log("No Directory Selected");
    return;
  } else {
    console.log("Result of Library Pick: "+ result[0]);
    //await scanForGames(result[0]);
    //console.log("Result of Test Provider Check: " + detectProvider(result[0]));
    //check providers
    var providerDetected = detectProvider(result[0]);
    console.log("Detected Provider: "+providerDetected);
    if (providerDetected == "Steam") {
      //now we need the AppID
      var steamAppIDCollection = collectSteamIds(result[0]);
      console.log("Received Apps: "+steamAppIDCollection);

      //save the known Libraries
      if (settings.hasSync('SavedLibraries')) {
        console.log("Saved Library Settings, do exist. Adding...");
        var previousSavedLibraries = settings.getSync('SavedLibraries');
        settings.setSync('SavedLibraries', {
          fullList: previousSavedLibraries.fullList+","+result[0],
        });
        settings.setSync(result[0], {
          Ids: steamAppIDCollection+""
        });
      } else {
        console.log("Saved Library settings, does not exist.");
        settings.setSync('SavedLibraries', {
          fullList: result[0],
        });
        settings.setSync(result[0], {
          Ids: steamAppIDCollection+""
        });
      }
      //now loop through API's and save them.
      var q;
      for (q = 0; q < steamAppIDCollection.length; q++) {
        steamApi(steamAppIDCollection[q]);

      }
      //after they are all saved, then save a var to store all app Ids.
      if (settings.hasSync('SteamAppId')) {
        console.log("SteamAppID already exists, adding to List...");
        var previousSteamAppId = settings.getSync('SteamAppId.list');
        settings.setSync('SteamAppId', {
          list: previousSteamAppId + ","+ steamAppIDCollection
        });
      } else {
        console.log("Settings do not exist. Creating Settings...");
        settings.setSync('SteamAppId', {
          //set to save the steamID list seperated by commas
          //adding the empty string ensures this isn't saved as an Array, so that only one parser has to be made
          list: steamAppIDCollection+""
        });
      }

      //now that ideally the whole library has been uploaded, time to reload
      //location.reload(); //Calling here interrupts the other functions

    }
    else if (providerDetected == "None") {
      console.log("No Supported Provider Found");
    }
    //await settings.set('test', {
    //  location: result[0]
    //});
    //console.log(await settings.get('test.location'));
  }
}

function detectProvider(directory) {
  const fs = require('fs');
  const root = fs.readdirSync(directory);
  console.log("Root Directory detected: "+root);
  var i;
  for (i=0; i < root.length; i++) {
    console.log("Dir being scanned: " +root[i]);
    if (root[i] == "steamapps") {
      //loops thorugh everything in the root of the provided dir
      //and if it matches steam to return that
      return "Steam";
      break;
    }
  }

  console.log("No supported Library detected...");
  return "None";
}

function collectSteamIds(directory) {
  const fs = require('fs');
  const root = fs.readdirSync(directory);
  var steamRoot;
  var tempAppId = new Array();

  var i;
  for (i = 0; i < root.length; i++) {
    if (root[i] == "steamapps") {
      steamRoot = fs.readdirSync(directory+"\\"+root[i]);

    }
  }

  var y;
  for (y=0; y<steamRoot.length; y++) {
    if (steamRoot[y].includes("acf")) {
      tempAppId.push(steamRoot[y].replace(/\D/g, ''));
      console.log("Found Game: "+tempAppId[y]);
    }
  }
  console.log("tempAppId within collectSteamIds: " + tempAppId);
  return tempAppId;
  //this should return an array of App Ids
}

function steamApi(applicationid) {
  console.log("Provided ID: " + applicationid);

 const request = net.request('http://store.steampowered.com/api/appdetails/?appids='+applicationid);
   request.on('response', (response) => {
     response.on('data', (chunk) => {
       var jsonResult;
       try {
          jsonResult = JSON.parse(chunk);
       } catch(err) {
         console.log("Failed to Parse JSON Content of Game: "+err);
       }
      console.log("Attempting Save: " +jsonResult[applicationid].data.name);

      var tempName = jsonResult[applicationid].data.name;
      var tempDescription = jsonResult[applicationid].data.short_description;
      var tempImage = jsonResult[applicationid].data.header_image;


      settings.setSync(applicationid, {
        details: {
          name: tempName,
          appid: applicationid,
          provider: "Steam",
          description: tempDescription,
          img: tempImage
        }
      });
      console.log("Settings Saved ");

    });
  });
  request.on('error', (response) => {
    console.log("Error: " + response);
    //return false;
  });
  request.end();
  console.log("true");

  //location.reload();
  //return true;
}
