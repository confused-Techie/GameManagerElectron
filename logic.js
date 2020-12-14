//var addLibrary = document.getElementById("addLibrary");
const { dialog } = require('electron').remote
const { net } = require('electron').remote
const { BrowserWindow } = require('electron').remote
const settings = require('electron-settings');
const fetch = require('node-fetch');
const keytar = require('keytar');
const fs = require('fs');
const { spawn } = require('child_process');

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
  //sidebarVis();
  gameLibraryVis();

  //this is for loading the searchList
  //searchList();
  //searchList will be disabled while moving everything to V2 structure
  //as well as sidebarVis will be disbaled until V2
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
  try {
    if (settings.hasSync('SteamAppId')) {
      console.log("Adding Steam Games to Search List...");
      //executed if steam apps have been Saved
      var tempSteamAppIDList = settings.getSync('SteamAppId.list').split(",");
      var u;
      for (u=0;u<tempSteamAppIDList.length;u++) {
        var tempAddToList = settings.getSync(tempSteamAppIDList[u]+'.details.name');
        searchListData += "<option value='"+tempAddToList+"'>";
      }
    }
  } catch(ex) {
    console.log("Attempted to Add Steam Games to Search List: "+ex);
  }
  try {
    if (settings.hasSync('EpicGamesAppId')) {
      console.log("Adding Epic Games to Search List...");
      var tempEpicAppIDList = settings.getSync('EpicGamesAppId.list').split(",");
      for (let u=0; u<tempEpicAppIDList.length; u++) {
        var tempAddToList = settings.getSync(tempEpicAppIDList[u]+'.details.name');
        searchListData += "<option value='"+tempAddToList+"'>'";
        console.log("Added "+tempAddToList+" to Epic Games Search List");
      }
    }
  } catch(ex) {
    console.log("Attempted to Add Epic Games to Search List: "+ex);
  }
  document.getElementById('gamesSearch').innerHTML += searchListData;
}

function gameLibraryVis() {
  //this is made simply to look at the saved apps and create the main HTML page for it.
  document.getElementById('game-container').innerHTML = ""; //fixes an issue where calling from a finished API may display data twice

  //this will be V2 of displaying the games with the new settings framework
  var displayData = "";
  if (settings.hasSync('game_list')) {
    //ensure the game list exists
    try {
      gameIDs = (settings.getSync('game_list.list')).split(",");
      for (let i = 0; i < gameIDs.length; i++) {
        try {
          game_item = settings.getSync(gameIDs[i]);
          var insertName = game_item.details.name;
          var insertIdentity = game_item.details.appid;
          var insertDescription = game_item.details.description;
          var insertImage = game_item.details.img;
          var insertLaunch= "";

          //now to check how to launch the game itself
          if (game_item.details.launch_type == "uri") {
            //the uri is simply a normal link on the play button.
            insertLaunch = "<a href='"+game_item.details.launch_cmd+"''><img src='./data/images/play.svg' style='float:right;background-color:#212121;'></a>";
          } else if (game_item.details.launch_type == "cmd") {
            insertLaunch = "<a href='#' onclick='consoleGameLaunch("+game_item.details.launch_cmd+")'><img src='./data/images/play.svg' style='float:right;background-color:#212121;'></a>";
          }

          if (insertLaunch != "") {
            //confirm the insertLaunch is set
            displayData += "<div class='grid-item' id='"+insertName+"'><div class='card'><div class='card-body'><div class='card-title'>";
            displayData += insertLaunch+insertName;
            displayData += "</div><p class='card-text'>"+insertDescription+"</p>";
            displayData += "<div class='card-footer text-muted'><img src='"+insertImage+"'/>";
            displayData += "</div></div></div></div>";
          } else {
            console.log("Unrecognized Launch Settings, skipping: "+game_item.details.name);
          }
        } catch(err) {
          console.log("There was an error accessing settings for: "+gameIDs[i]);
        }
      }
    } catch(err) {
      console.log("There was an error accessing Game Data");
    }
  } else {
    console.log("No Saved games");
    displayData += "<div class='grid-item' id='no-data'><div class='card'><div class='card-body'><div class='card-title'>";
    displayData += "Looks like you haven't added any Games yet";
    displayData += "</div><p class='card-text'>To add some games just click the folder icon on the left! Or read more about it here.</p>";
    displayData += "<div class='card-footer text-muted'>";
    displayData += "</div></div></div></div>";
  }

  document.getElementById('game-container').innerHTML += displayData;

  //first create an array of the ID's for Steam,
  //var displaySteamIds;
  //try {
  //  displaySteamIds = (settings.getSync('SteamAppId.list')).split(",");
  //  console.log("Parsed App ID's for Display: "+displaySteamIds.length);
  //} catch {
  //  console.log("No Steam ID's Saved...");
  //}

  //now to create the element to insert in the page.
  //var steamDataToInsert = "";
  //var i;
  //for (i = 0; i < displaySteamIds.length; i++) {
  //  var applicationIdentity = displaySteamIds[i];
  //  var insertName = settings.getSync(applicationIdentity+'.details.name');
  //  var insertDescription = settings.getSync(applicationIdentity+'.details.description');
  //  var insertImg = settings.getSync(applicationIdentity+'.details.img');

  //  steamDataToInsert += "<div class='grid-item' id='"+insertName+"'><div class='card'><div class='card-body'><div class='card-title'>";
  //  steamDataToInsert += "<a href='steam://rungameid/"+applicationIdentity+"'><img src='./data/images/play.svg' style='float:right; background-color:#212121;'></a>"+insertName;
  //  steamDataToInsert += "</div><p class='card-text'>"+insertDescription+"</p>";
  //  steamDataToInsert += "<div class='card-footer text-muted'><img src='"+insertImg+"'/>";
  //  steamDataToInsert += "</div></div></div></div>";
  //}
  //document.getElementById('game-container').innerHTML += steamDataToInsert;

  //now to check for Epic Games content
  //if (settings.hasSync('EpicGamesAppId')) {
  //  var displayEpicGameIds;
  //  try {
  //    displayEpicGameIds = (settings.getSync('EpicGamesAppId.list')).split(",");
  //    console.log("Parsed App ID's for Display: "+displayEpicGameIds.length);
  //  } catch(err) {
  //    console.log("Unable to access Saved Ids: "+err);
  //  }
  //  var epicDataToInsert = "";
  //  for (let i =0; i < displayEpicGameIds.length; i++) {
  //    var applicationIdentity = displayEpicGameIds[i];
  //    var insertName = settings.getSync(applicationIdentity+'.details.name');
  //    var insertDescription = settings.getSync(applicationIdentity+'.details.description');
  //    var insertImg = settings.getSync(applicationIdentity+'.details.img');
  //    var insertLaunch = settings.getSync(applicationIdentity+'.details.launch');

  //    epicDataToInsert += "<div class='grid-item' id='"+insertName+"'><div class='card'><div class='card-body'><div class='card-title'>";
  //    epicDataToInsert += "<a href='"+insertLaunch+"'><img src='./data/images/play.svg' style='float:right;background-color:#212121;'></a>"+insertName;
  //    epicDataToInsert += "</div><p class='card-text'>"+insertDescription+"</p>";
  //    epicDataToInsert += "<div class='card-footer text-muted'><img src='"+insertImg+"'/>";
  //    epicDataToInsert += "</div></div></div></div>";
  //  }
  //  document.getElementById('game-container').innerHTML += epicDataToInsert;
  //}

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
    }                                                //normally addLibrary()
    libraryDataToInsert += "<dd><a href='#' onclick='GameInspectorV2()'><img src='./data/images/folder-plus.svg' style='width:20px;'></a>";
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
        DiscordAPI("user_icon").then(discordIcon => {
          discordDataToInsert += "<div class='sidebar-item'><dl><dt>Discord</dt><hr>";
          discordDataToInsert += `<div class="imgCenter"><img src='${discordIcon}' alt="Discord Profile Icon" style='height:30px;width:30px;float:left;'></div>`;
          discordDataToInsert += "<dd>"+retreivedUser+"</dd>";
          discordDataToInsert += "</dl></div>";
          document.getElementById('sidebar-container').innerHTML += discordDataToInsert;
        });
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
  var discordURL = 'https://discord.com/api/oauth2/authorize?client_id='+SEC_Discord_client_id+'&redirect_uri=http%3A%2F%2Flocalhost&response_type=code&scope=identify';

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
        //before attemtping to get the avatar we first need to check if it exists.
        var discordAvatarLoc = "./data/cache/discordAvatar.png";
        if (!fs.existsSync(discordAvatarLoc)) {
          //to get the avatar we first need to get the standard user details
          console.log("Fetching User Details to assist with User Avatar Fetch...");
          try {
            DiscordAccessToken.then((DiscordAccessTokenPromise) => {
              try {
                fetch('https://discord.com/api/users/@me', {
                  headers: {
                    authorization: `${discordLinkedSettings.token_type} ${DiscordAccessTokenPromise}`,
                  },
                })
                .then(temp => temp.json())
                .then(res => {
                  //now with user data time to request specific avatar data
                  try {
                    fetch(`https://cdn.discordapp.com/avatars/${res.id}/${res.avatar}.png`, {
                      headers: {
                        authorization: `${discordLinkedSettings.token_type} ${DiscordAccessTokenPromise}`,
                        'Content-Type': 'image/png',
                      },
                    }).then(resIcon => {
                      const fileStream = fs.createWriteStream("./data/cache/discordAvatar.png");
                      resIcon.body.pipe(fileStream);
                      resIcon.body.on("error", reject);
                      fileStream.on("finish", () => { resolve("./data/cache/discordAvatar.png"); });
                    });
                  } catch(ex) { console.log("Unable to grab Discord Avatar: "+ex); }
                });
              } catch(ex) { console.log("Unable to access Network Request for Discord user Data: "+ex); }
            });
          } catch(ex) { console.log("Unable to access Keychain Data: "+ex); }
        }
        else {  //discordAvatar file does exists
          console.log("Discord Avatar is already cached...");
          resolve(discordAvatarLoc);
        }
      }
    } else {
      //refresh the token
      console.log("Token has expired or is nearly expired");

      DiscordRefreshToken.then((DiscordRefreshTokenPromise) => {
        const discordRefreshData = {
          client_id: SEC_Discord_client_id,
          client_secret: SEC_Discord_client_secret,
          grant_type: 'refresh_token',
          refresh_token: DiscordRefreshTokenPromise,
          redirect_uri: SEC_Discord_redirect_uri,
          scope: 'identify',
        };

        fetch('https://discord.com/api/oauth2/token', {
          method: 'POST',
          body: new URLSearchParams(discordRefreshData),
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }).then(res => res.json())
        .then(info => {
          var refresh_created_time = new Date();

          //now save all related Settings
          try {
            keytar.setPassword("Gaming Gaggle", "DiscordAccessToken", info.access_token);
            keytar.setPassword("Gaming Gaggle", "DiscordRefreshToken", info.refresh_token);
            console.log("Successfully saved Refreshed credentials to keychain...");
            settings.setSync('discordLink', {
              status: true
            });

            //refer to initial Authorization code exchange for Access Token for documentation
            settings.setSync('discordLinkData', {
              expires_in: info.expires_in,
              scope: info.scope,
              token_type: info.token_type,
              created_at: refresh_created_time.getTime(),
            });
            console.log("Successfully saved Non-Secret Refresh Discord Data...");
            DiscordAPI(option).then(resolve);
          }
          catch(ex) {
            console.log("There was an error saving to the keychain: "+ex);
            reject("There was an error saving to keychain: "+ex);
          }

        });
      });

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

function consoleGameLaunch(cmd) {
  let bat = spawn("cmd.exe", [
    "/c",   //argument for cmd.exe to carry out the script
    "",     //path to file
    "",     //first argument
    "",     //n-th argument
  ]);

  bat.stdout.on("data", (data) => {
    //handle data 
  });

  bat.stderr.on("data", (err) => {
    //handle error...
  });

  bat.on("exit", (code) => {
    //handle exit...
  });
}

function GameInspectorV2() {
  //Generation 2 of the Game Scanning logic.
  //In hopes of reducing complexity and resource usage.

  folderResult = dialog.showOpenDialogSync({
    title: "Add Game Library",
    buttonLabel: "Add Library",
    properties: ['openDirectory', 'dontAddToRecent']
  });
  if (folderResult === undefined) {
    console.log("No Directory Selected");
    return;
  } else {
    console.log("Result of Library Pick: "+folderResult[0]);
    try {
      DirInspectorV2(folderResult[0]).then(DirIResult => {
        if (DirIResult == "true") {
          console.log("Successfully scanned Folder");
          //save directory
        }
      }).catch(ErrorCatch => {
        console.log("Error Occured: "+ErrorCatch);
      });
    }
    catch(ex) {
      console.log("Unable to call DirScan: " + ex);
    }
  }
}

function DirInspectorV2(startDir) {
  console.log("DirInspectorV2 access");
  return new Promise(function(resolve, reject) {
    const Root = fs.readdirSync(startDir);

    //this will handle the 5 hops down
    for (let i = 0; i < Root.length; i++) {
      //this will loop through every folder in the selected root
      var root_check = startDir+"/"+Root[i];
      //this defines our working directory,
      MatchCheckV2(Root[i], root_check, startDir);
      //calls MatchCheck with working directory, and the folder name
      var root_lstat_check;
      //this will help avoid the exception thrown by lstatSync
      try {
        root_lstat_check = fs.lstatSync(root_check).isDirectory();
      } catch(ex) {
        root_lstat_check = false;
      }
      //this will check for having access to the file
      var root_access_check=true;
      //try {
      //  if (fs.accessSync(root_check, fs.constants.R_OK) == "undefined") {
      //    root_access_check = true;
      //  }
      //} catch(ex) {
      //  console.log("Access Denied: "+root_check+": Error: "+ex);
      //}
      if (fs.existsSync(root_check) && root_lstat_check && root_access_check) {

        const secondary_R = fs.readdirSync(root_check);
        for (let u = 0; u < secondary_R.length; u++) {
          var secondary_check = root_check+"/"+secondary_R[u];
          MatchCheckV2(secondary_R[u], secondary_check, startDir);
          var secondary_lstat_check;
          try {
            secondary_lstat_check = fs.lstatSync(secondary_check).isDirectory();
          } catch(ex) {
            secondary_lstat_check = false;
          }
          if (fs.existsSync(secondary_check) && secondary_lstat_check) {

            const tertiary_R = fs.readdirSync(secondary_check);
            for (let y = 0; y < tertiary_R.length; y++) {
              var tertiary_check = secondary_check+"/"+tertiary_R[y];
              MatchCheckV2(tertiary_R[y], tertiary_check, startDir);
              var tertiary_lstat_check;
              try {
                tertiary_lstat_check = fs.lstatSync(tertiary_check).isDirectory();
              } catch(ex) {
                tertiary_lstat_check = false;
              }
              if (fs.existsSync(tertiary_check) && tertiary_lstat_check) {

                const quaternary_R = fs.readdirSync(tertiary_check);
                for (let t = 0; t < quaternary_R.length; t++) {
                  var quaternary_check = tertiary_check+"/"+quaternary_R[t];
                  MatchCheckV2(quaternary_R[t], quaternary_check, startDir);
                  var quaternary_lstat_check;
                  try {
                    quaternary_lstat_check = fs.lstatSync(quaternary_check).isDirectory();
                  } catch(ex) {
                    quaternary_lstat_check = false;
                  }
                  if (fs.existsSync(quaternary_check) && quaternary_lstat_check) {

                    const quinary_R = fs.readdirSync(quaternary_check);
                    for (let r = 0; r < quinary_R.length; r++) {
                      var quinary_check = quaternary_check+"/"+quinary_R[r];
                      MatchCheckV2(quinary_R[r], quinary_check, startDir);
                      //at this point this is 5 hops down, and should be enough of a check.
                      resolve("true");
                    }
                  } //else { console.log("DirInspectorV2 Quaternary failure"); }
                }
              } //else { console.log("DirInspectorV2 Tertiary Failure"); }
            }
          } //else { console.log("DirInspectorV2 Secondary Failure"); }
        }
      } //else { console.log("DirInspectorV2 Root Failure");}
    }
  });
}

function MatchCheckV2(fileToScan, workingDir, chosenLibrary) {
  //sanity checks
  //console.log("Provided File: "+fileToScan);
  //console.log("Provided Directory: "+workingDir);

  //now to check the passed files and directories for game data

  //in all of these there need to be checks to ensure no duplicates are saved
  //Steam Check
  if (fileToScan.includes("acf") && workingDir.includes("steamapps")) {
    var foundSteamId = fileToScan.replace(/\D/g, '');
    console.log("Steam Game: "+foundSteamId);
    steamApiV2(foundSteamId, workingDir, chosenLibrary)
    .then(res => {
      console.log(res);
    })
    .catch(err => {
      console.log(err);
    });
  }

  //epic check
  else if (fileToScan.includes("mancpn") && workingDir.includes(".egstore")) {
    fs.readFile(workingDir, 'utf8', function (err, data) {
      if (err) {
        console.log("Error occured reading file: "+err);
      }
      let res = JSON.parse(data);
      console.log("Epic Game: "+res.AppName);
      epicApiV2(res.AppName, workingDir, chosenLibrary)
      .then(res => {
        console.log(res);
      })
      .catch(err => {
        console.log(err);
      });
    });
  }

  //Minecraft Java Check
  else if (fileToScan == "MinecraftLauncher.exe" && workingDir.includes("Minecraft Launcher")) {
    console.log("Minecraft Java Edition Found");
    //tesst by scanning Program Files (x86)
  }

  //CoD Black Ops Cold War Check
  else if (fileToScan.includes("BlackOpsColdWar") && workingDir.includes("Call of Duty Black Ops Cold War")) {
    console.log("Call of Duty Black Ops Cold War Found");
  }

  //CoD Modern Warfare Check
  else if (fileToScan.includes("Modern Warfare Launcher.exe") && workingDir.includes("Call of Duty Modern Warfare")) {
    console.log("Call of Duty Modern Warfare Found");
  }

  //Valorant Check
  else if (fileToScan.includes("VALORANT.exe") && workingDir.includes("VALORANT")) {
    console.log("Valorant Found");
  }

  //League of Legends Check
  else if (fileToScan.includes("LeagueClient") && workingDir.includes("League of Legends")) {
    console.log("League of Legends Found");
  }

  //Final Fantasy XIV - A Realm Reborn Check
  else if (fileToScan.includes("ffxiv.exe") && workingDir.includes("SquareEnix")) {
    console.log("Final Fantasy XIV - A Realm Reborn Found");
  }

}

function steamApiV2(applicationID, loc, chosenLibrary) {
  console.log("SteamApiV2 Accessed");
  return new Promise(function(resolve, reject) {
    //firstly to make the API request for game data
    try {
      fetch('http://store.steampowered.com/api/appdetails/?appids='+applicationID)
      .then(temp => temp.json())
      .then(res => {
        if (res[applicationID].success) {
          try {
            if (!settings.hasSync(applicationID)) {
              //put the rest of the logic for sving here
              resolve("Successfully Saved SteamAPI Settings: "+res[applicationID].data.name);
            } else {
              console.log("This SteamID is already saved: "+res[applicationID].data.name);
              reject("Already Saved This SteamID: "+res[applicationID].data.name);
            }
            resolve("Successfully Saved SteamAPi Settings: "+res[applicationID].data.name);
          } catch(err) {
            console.log("Error: Saving Settings: "+err);
            reject("Error: Saving Settings: "+err);
          }
        } else {
          console.log("Error: Reaching Steam API Server: "+res.status+"::"+res.statusText);
          reject("Error: Reaching Steam API Server: "+res.status+"::"+res.statusText);
        }
      });
    } catch(err) {
      console.log("Steam API Error: "+err);
      reject("Steam API Error: "+err);
    }
  });
}

function epicApiV2(applicationID, loc, chosenLibrary) {
  return new Promise(function(resolve, reject) {
    //first to retreive the fingerprintDB
    try {
      fs.readFile("./data/fingerprinting_db.json", 'utf8', function(err, data) {
        if (err) {
          reject("Error occured reading Database: "+err);
        }
        let FingerPrintDB = JSON.parse(data);
        //loop through every game within the db
        for (y in FingerPrintDB.games) {
          if (FingerPrintDB.games[y].search_method == "epic_games") {
            //take only ones matching epic
            if (FingerPrintDB.games[y].unique_id == applicationID) {
              try {
                if (!settings.hasSync(applicationID)) {
                  //confirm it hasn't already been saved
                  //rest of save logic here
                  resolve("Successfully Saved EpicApi Settings for: "+applicationID);
                } else {
                  reject("Already Saved This Epic ID: "+applicationID);
                }
              } catch(ex) {
                reject("Error: Saving Settings: "+ex);
              }
            }
          }
        }
      })
    } catch(err) {
      reject("Error occured reading Fingerprint Database: "+err);
    }
  });
}

function otherApiV1(applicationID, loc, chosenLibrary) {
  //while there was never an OtherV1, I'm naming this V2
  //to keep in line with the new methodalogy
  return new Promise(function(resolve, reject) {
    try {
      fs.readFile("./data/fingerprinting_db.json", 'utf8', function(err, data) {
        if (err) {
          reject("Error occured reading Database: "+err);
        }
        let FingerPrintDB = JSON.parse(data);
        for (y in FingerPrintDB.games) {
          if (FingerPrintDB.games[y].search_method != "epic_games") {
            //since I want search method to contain the provider, they will differ during other calls
            if (FingerPrintDB.games[y].unique_id == applicationID) {
              try {
                if (!settings.hasSync(applicationID)) {
                  //confirm it hasn't already been saved
                  //rest of save logic here
                  resolve("Successfully Saved This Game ID: "+applicationID + "/"+FingerPrintDB.games[y].name);
                } else {
                  reject("Already Saved This Game ID: "+applicationID +"/"+FingerPrintDB.games[y].name);
                }
              } catch(err) {
                reject("Error Checking Saved Status: "+err);
              }
            }
          }
        }
      });
    } catch(err) {
      reject("Error: During Reading Database: "+err);
    }
  });
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
    else if (providerDetected == "Epic_Games") {
      if (settings.hasSync('SavedLibraries')) {
        console.log("Saved Library Settings do exist. Adding...");
        var previousSavedLibraries = settings.getSync('SavedLibraries');
        settings.setSync('SavedLibraries', {
          fullList: previousSavedLibraries.fullList+","+result[0],
        });
        collectEpicIds(result[0]).then(epicAppIDCollection => {
          settings.setSync(result[0], {
            Ids: epicAppIDCollection+""
          });
          epic_gamesApi(epicAppIDCollection).then(epic_gamesApi_Res => {
            //this is where a refresh should happen, or really once the api requests are all done
            if (epic_gamesApi_Res == 'true') {
              gameLibraryVis();
            }
          });
        });
      } else {
        //no saved library settings
        console.log("Saved Library Settings does not exists. Creating...");
        settings.setSync('SavedLibraries', {
          fullList: result[0],
        });
        collectEpicIds(result[0]).then(epicAppIDCollection => {
          console.log("IDs returned: "+epicAppIdCollection);
          settings.setSync(result[0], {
            Ids: epicAppIDCollection+""
          });

          epic_gamesApi(epicAppIdCollection).then(epic_gamesApi_Res => {
            //this is where a refresh should happen, or really once the api requests are all done.
            if (epic_gamesApi_Res == 'true') {
              //since I know all games have been saved fully and this will return while all async is done, I can call library vis
              gameLibraryVis();
            }
          });
        });
      }

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
    else {
      //executes if the root directory doesn't match any known providers.
      const twoRoot = fs.readdirSync(directory+"/"+root[i]);
      console.log("Detected Folders: "+twoRoot);
      for (let y=0;y<twoRoot.length;y++) {
        if (twoRoot[y] == ".egstore") {
          console.log("Epic games Game Folder Detected");
          return "Epic_Games";
          break;
        }
        else if (twoRoot[y] == "Minecraft Launcher") {  //default name for the minecraft java folder

        }
      }
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

function collectEpicIds(directory) {
  return new Promise(function(resolve, reject) {
    const root = fs.readdirSync(directory);
    var epicParentDir = new Array();
    var epicTempId = new Array();
    var amountOfGames = 100;  //this will be used to ensure all games are added before resolve()
    //setting amount of games so high, ensures it doesn't resolve right away with a value of 0
    var gameSavedCheck = new Array(); //again used to ensure all games are added before resolve()

    for (let x=0; x<root.length;x++) {
      epicParentDir.push(directory+"/"+root[x]);
      console.log(epicParentDir[x]);
      amountOfGames = epicParentDir.length; //this will set the amount of games to how many have been added,
                                            //which once done will be the total amount of games
    }
    for (let y=0; y<epicParentDir.length; y++) {
      const tempDirScan = fs.readdirSync(epicParentDir[y]);
      for (let u=0; u<tempDirScan.length;u++) {
        if (tempDirScan[u] == ".egstore") {
          const egstoreScan = fs.readdirSync(epicParentDir[y]+"/"+tempDirScan[u]);
          for (let q=0;q<egstoreScan.length;q++) {
            if (egstoreScan[q].includes("mancpn")) {
              //this would mean one of the mancpn files have been found.
              console.log("Mancpn file found: "+egstoreScan[q]);
              fs.readFile(epicParentDir[y]+"/"+tempDirScan[u]+"/"+egstoreScan[q], 'utf8', function (err, data) {
                if (err) {
                  console.log("Error occured reading file: "+err);
                  reject();
                }
                let res = JSON.parse(data);
                console.log("Unique Id Found: "+res.AppName);
                epicTempId.push(res.AppName);
                gameSavedCheck.push('true');  //shows a completed save of game
                console.log("Game Saved Check: "+gameSavedCheck.length+" :: Amount OF Games: "+amountOfGames);
                if (amountOfGames == gameSavedCheck.length) {
                  console.log("Resolving with: "+epicTempId);
                  resolve(epicTempId);
                }
              });
            }
          }
        }
      }
    }
    if (amountOfGames == gameSavedCheck.length) {
      console.log("Resolving with: "+epicTempId);
      resolve(epicTempId);
      //for some unknown reason this is never returned after adding if, so return added in for with same checks.
    }

  });
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

function epic_gamesApi(applicationidArray) {
  return new Promise(function(resolve, reject) {
    //add method to check if all games have been saved.
    var gameSavedCheck = new Array();
    var amountOfGames = applicationidArray.length;
    //first we need to get the fingerprinting database
    fs.readFile("./data/fingerprinting_db.json", 'utf8', function(err, data) {
      if (err) {
        console.log("Error occured reading database: "+err);
        reject();
      }
      let FingerPrintDB = JSON.parse(data);
      for (let i=0; i < applicationidArray.length; i++) {
        for (y in FingerPrintDB.games) {
          if (applicationidArray[i] == FingerPrintDB.games[y].unique_id) {
            console.log("Attempting Save: "+FingerPrintDB.games[y].name);
            var tempLaunchLink = "";
            if (FingerPrintDB.games[y].launch.method != "URI") {
              //if command line or something else that can be here
            } else {
              tempLaunchLink = FingerPrintDB.games[y].launch.cmd;
            }
            try {
              settings.setSync(applicationidArray[i], {
                details: {
                  name: FingerPrintDB.games[y].name,
                  appid: applicationidArray[i],
                  provider: "Epic Games",
                  description: FingerPrintDB.games[y].meta_data.description,
                  img: FingerPrintDB.games[y].meta_data.img,
                  launch: tempLaunchLink
                }
              });
              //after successful save add to savedcheck Array
              gameSavedCheck.push('true');
              if (amountOfGames == gameSavedCheck.length) {
                if (settings.hasSync('EpicGamesAppId')) {
                  console.log("EpicGamesAppId already exists, adding...");
                  var previousEpicGamesAppId = settings.getSync('EpicGamesAppId.list');
                  settings.setSync('EpicGamesAppId', {
                    list: previousEpicGamesAppId + "," + applicationidArray
                  });
                } else {
                  console.log("EpicGamesAppId doesn't exists, creating...");
                  settings.setSync('EpicGamesAppId', {
                    list: applicationidArray+""
                  });
                }
                console.log("Done Saving data for all games.");
                resolve('true');
              }
            }
            catch(err) {
              console.log("Couldn't save settings: "+err);
              reject();
            }
          } else {
            //this would happen if the game found isn't supported yet by the fingerprint database.
            //so simply this will be printed, and taken from the total games to be saved
            //amountOfGames = amountOfGames-1;
            console.log("Unsupported Game found: "+applicationidArray[i]);
            console.log("Amount of Games to Add now: "+amountOfGames);
            console.log("Saved so far: "+gameSavedCheck.length);

            //it seems if the supported games are out of order, could lead to an instance where this never resolves,
            //never saving the list so that it can be properly viewed, and confirmed that all games are saved.

            //TODO:
            //because this grabs on found title and checks it against a match to every title in the db
            //when one of the db titles ins't the same as scanned it removes 1 from amountOfGames, even though
            //this just means that single instance of the db didn't match, not that none match. Removing the subtraction for now
          }
        }
      }
    });
  });
}

function removeEpicGamesData(areYouSure) {
  //this is used to permentantly delete all Epic Games data.
  if (areYouSure == "true") {
    try {
      var allLibraries = settings.getSync('SavedLibraries.fullList');
      for (let i = 0; i < allLibraries.length; i++) {
        if (allLibraries[i].contains("Epic") || allLibraries[i].contains("epic")) {
          //now with a library we can use that to find its corrosponding Ids
          try {

          } catch(err) {

          }
          console.log("Permentantly Deleting Game Library Entry: "+allLibraries[i]);
          settings.unsetSync(allLibraries[i]);

        }
      }
    } catch(err) {
      console.log("Unable to Find Library File. You may need to delete data manually. Error: "+err);
    }
  }
}
