# Tumble's Utility Bot

# Setting up
```bash
#Setup node
nvm install # this will use .nvmrc automatically
#setup yarn
npm install yarn --global
yarn
# setup config file
cp tumbot.base.json tumbot.json
# now edit tumbot.json

# start the bot
yarn start
```

## Config Types
* Global Config (tumbot.json)
* Runtime Config (Dynamic Module Data)
* Guild Config (Webpanel Settings)

## Ideas

* Interview System
* Custom Command
* JSON Tracker
* Vote system
* Phone Bot
* Quiz?
* Languages
* Permissions
	* Role based
	* Channel Based
	* User Based
* Web front end

## Servers and Apps
* Database
* Discord Bot
* Web Panel
* Discord Auth Handler Server

## Database Layout
* Managers
	* Discord ID
	* Rank
* Servers
	* Managers
* Modules or Features

## Hosting Options
* Database -  Either Firebase, Supabase or MongoDB Atlas
* Web Panel - Hopefully GitHub Pages and Jekyll
* Discord Bot - Figure out if firebase has hosting, if not then use Raspberry Pi or Heroku

## Stack
### Frontend
* TypeScript
* Jekyll
* React
* SCSS
* DiscordJS - Discord Bot
### API

### Backend
* NodeJS
* Yarn
* GitHub Pages
* Jekyll

* Either Firebase
or
* Supabase
or
* MongoDB Atlas
* Heroku or Raspberry Pi
