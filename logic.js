//var addLibrary = document.getElementById("addLibrary");
const { dialog } = require('electron').remote
const { net } = require('electron').remote
const settings = require('electron-settings');

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
  sidebarVis();
  gameLibraryVis();

  //this is for loading the searchList
  searchList();
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
