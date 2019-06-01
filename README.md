# diablo2-live-viewer
[![NPM version](https://img.shields.io/npm/v/diablo2-live-viewer.svg)](http://npmjs.com/package/diablo2-live-viewer)
[![Build Status](https://img.shields.io/circleci/project/MephisTools/diablo2-live-viewer/master.svg)](https://circleci.com/gh/MephisTools/diablo2-live-viewer)

Display packets and information about a current diablo2 session

**Map**

<img src="images/base_viewer.gif" width="200" height="200"> <img src="images/filters_viewer.gif" width="200" height="200"><img src="images/tp_viewer.gif" width="200" height="200"> <img src="images/mobs_viewer.gif" width="200" height="200">

**Inventory**

<img src="images/inventory1.gif" width="200" height="200"> <img src="images/inventory2.gif" width="200" height="200">

Uses
* [leaflet](https://leafletjs.com/) to display maps
* [jquery datatables](https://datatables.net/) to display packet tables
* [lit-element](https://lit-element.polymer-project.org/) to create light weight web components (no framework !)
* [webpack](https://webpack.js.org/) for bundling
* [create-lit-app](https://github.com/thepassle/create-lit-app) was used as a template to create the initial structure of the project

## Installation

`npm install`

## Usage

First start https://github.com/louis030195/diablo2-protocol 's sniffer or bot then :

`npm start`
