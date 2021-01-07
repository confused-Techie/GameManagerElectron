<img src='https://github.com/confused-Techie/Gaming-Gaggle/blob/main/resources/LargeTile.scale-400.png' width="25%">

# Gaming-Gaggle

Gaming Gaggle is aiming to get rid of Multiple Applications Organizing yours games, instead of opening 5 or 6 different programs to find your games they are all within on place, Gaming Gaggle.

With Gaming Gaggle simply adding different storage devices allows your games to be found automatically, letting you see not only all of your games, but descriptions, titles, images, and of course being able to launch them, all in one place.

## Features

### Game Scanning
 * Gaming Gaggle is able to scan any storage device selected and scan 5 hops down within the file system checking every file against a predetermined Database, only saving matching locations locally.
 * If able to find the Epic Games or Battle.net Client programs they will be saved specially to help launch those games in the future.
 * After a game is found, Gaming Gaggle will either check its Database or game providers API's for game data, like description, title, and images.
 
### Game Playing
* Gaming Gaggle will save the 5 most recently played games on the sidebar for quick launching afterwards.
* You are able to search for any saved game by title once added.
* Any game added can be launched regardless if needing to use URI, Command Line, the base program or companion client program.

## Installation

### Download and Install

You can download the installer directly below or click on the relases to the right to discover past releases and see the features of each one.

<a href="https://github.com/confused-Techie/Gaming-Gaggle/releases/download/v1.0.0.0/Gaming.Gaggle.Setup.1.0.0.exe">Gaming Gaggle v1.0.0</a>

### Build From Source

By downloading the GitHub Source Code here or by cloning the repo locally, you can package the app using Electron-Packager or something similar or even run using

```
npm start
```
Within the repo directory.

## Supported Games

Gaming Gaggle should support every single game purchased through Steam right out of the box, as for other applications those require a manual entry into the FingerPrinting Database.

The list of other games supported can be viewed <a href="https://github.com/confused-Techie/Gaming-Gaggle/wiki/Supported-Games">here</a>.

<a href="https://github.com/confused-Techie/Gaming-Gaggle/wiki/Did-Gaming-Gaggle-miss-a-Game%3F">Have a game that doesn't show up?</a>

<img src="https://github.com/confused-Techie/Gaming-Gaggle/blob/main/Resources/github/home.png" width="90%">
<p align="center"><i>Home Page of Gaming Gaggle</i></p>
<img src="https://github.com/confused-Techie/Gaming-Gaggle/blob/main/Resources/github/search.png" width="90%">
<p align="center"><i>Searching by Game Title in Gaming Gaggle</i></p>
<img src="https://github.com/confused-Techie/Gaming-Gaggle/blob/main/Resources/github/setup.png" width="90%">
<p align="center"><i>Initial Setup While adding a Storage Device</i></p>

## Troubleshooting

If having any issues within Gaming Gaggle most error messages should be shown on the screen, or you can click ``` View > Toggle Developer Tools > Console ``` To view error messages in more detail or any that may not be appearing.

While you can always open an issue here, Gaming Gaggle also has some troubleshooting built in if you click ``` Help > Danger Zone! ``` which allows you to <b>Reset Settings <b> or <b>Factory Reset</b>.

### Reset Settings

A Reset of Settings Permanently Deletes the following data:

* Last Time a Game Existance Scan occured.
* Last Time a New Game Scan occured.
* List of Recently Played Games.
* Version of Database Locally downloaded.
* Knowledge of Discord Account Linking.

### Factory Reset 

A Factory Reset Permanently Deletes all data saved by Gaming Gaggle such as:

* List of all Games Saved
* Data for all Games Saved
* Location of Battle.net Client
* Location of Epic Games Client
* List of Recently Played Games.
* Last Time a Game Existance Scan occured.
* Last Time a New Game Scan occured.
* Version of Database Locally downloaded.
* Knowledge of Discord Account Linking.
