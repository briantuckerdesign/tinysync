# tinySync

**Airtable → Webflow sync via CLI**
**_Alpha release: use at your own risk_**

- One-directional manual sync
- Command-line interface
- Free & open source
- Granular sync control
- All field types supported
- No record limits\*
    - <sub>\*We are all beholden to the limits of Airtable/Webflow/APIs 🧘</sub>

## Quick start

- Download the latest [release](https://github.com/briantuckerdesign/tinySync/releases)
- Make sure you have NPM installed
- Unzip the folder and open it in a terminal window
- Run `npm i`
- Run `npm start`

---

## Requirements

There are a few things you'll need to get started:

- A computer with Node.js installed
- OR the ability to install Node.js on your computer
- An Airtable account
- A Webflow account

### Airtable

- Airtable account
- Base with a table that matches a Webflow collection
- API token with access to your base with read/write permissions
- Four required fields These can be created for you, or select an existing field.
    - `State` (single select): `Not synced`,`Queued for sync`,`Always sync`, `Staging`
      _Note that the options for "State" must be exact._
    - `Last Published` (date/time)
    - `Webflow Item ID` (single line text)
    - `Slug` (single line text)

### Webflow

- Webflow account
- Site with a collection that matches an Airtable table
- Access token with access to your site with read/write permissions in CMS and Sites

---

## Installation and Setup

### Install

**Node.js**
First things first, you need Node.js on your computer. If you don't have it, you can download it [here](https://nodejs.org/en/download/). I recommend the latest LTS version.

If you're not sure if you have it already, open a terminal window and type:
`node -v`

**Install tinySync**
Download or clone this repo to your computer.

### Setup

**Install dependencies.**
Navigate to the tinySync folder in your terminal window using `cd` and run:
`npm install`

**Start tinySync**
Run `npm start` to start tinySync.

It will ask you to make a password. Don't forget it, as there is no way to recover it nor your data.

Your passwords and access tokens are stored, encrypted, on your computer and can only be decrypted with this password. _There is no way to recover your config or password if you lose it._

---

## Usage

Follow the prompts to set up your sync. If your sync utilizes linked records, you must have another sync set up for the linked table so that the linked records have Webflow IDs to utilize.

### Airtable State Options

- `Not synced` or blank: Will not be sent to Webflow. If `Delete records` is enabled, will also delete previously created items in Webflow
- `Queued for sync`: On next sync, this record will be sent to Webflow and then State will change to `Staging`.
- `Always sync`: This record will be synced on every run.
- `Staging`: For records that are already published, but you don't want changes made to the record going live on next sync.

---

## Disclaimers

I am a hobbyist developer. I have made best-effort attempts to make this software as secure and stable as possible, but I make no guarantees. Use at your own risk. For corporate users, I highly recommend amazing paid tools out there like [WhaleSync](https://whalesync.com/), [Flowmonk](https://flowmonk.com/), or [PowerImporter](https://https://www.powerimporter.com/).

This is an early release, there may be errors. Please report any issues you find. I have a lot of ideas for features and improvements, but I'm a one-person team and I have a day job. If you'd like to contribute, please reach out!

---

## Built with

- [clack](https://github.com/natemoo-re/clack)
- [axios](https://github.com/axios/axios)
- [figlet.js](https://github.com/patorjk/figlet.js)
- [showdown](https://github.com/showdownjs/showdown)
- [uuid](https://github.com/uuidjs/uuid)
