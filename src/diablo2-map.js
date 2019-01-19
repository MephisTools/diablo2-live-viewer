/* globals customElements */

import monsterNamesRaw from './monster_names.txt'
import objectsRaw from './objects.txt'
import { LitElement, html } from '@polymer/lit-element/'
import L from 'leaflet'
import css from 'leaflet/dist/leaflet.css'
import 'leaflet.awesome-markers'
import cssMarkers from 'leaflet.awesome-markers/dist/leaflet.awesome-markers.css'
import 'leaflet-search'
import cssSearch from 'leaflet-search/dist/leaflet-search.src.css'

function loadCsv (txt) {
  const lines = txt.split('\n')
  const header = lines.shift().split('\t')
  return lines
    .map(line => line.split('\t'))
    .map(arr => arr.reduce((acc, e, i) => {
      acc[header[i]] = e
      return acc
    }, {}))
}

const objects = loadCsv(objectsRaw)

const objectsById = objects.reduce((acc, object) => {
  acc[parseInt(object['Id'])] = object
  return acc
}, {})

/* This code is needed to properly load the images in the Leaflet CSS */
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
})

const monsterNames = monsterNamesRaw.split('\n')

function transformCoords ({ x, y }) {
  return { x: x - 4400, y: -y + 4700 }
}

const yx = L.latLng

const xy = function (x, y) {
  if (L.Util.isArray(x)) { // When doing xy([x, y]);
    return yx(x[1], x[0])
  }
  return yx(y, x) // When doing xy(x, y);
}

class Diablo2Map extends LitElement {
  static get properties () {
    return {
      ws: { type: Object }
    }
  }

  firstUpdated () {
    this.displayMap()
  }

  static addMarker (layer, pos, color, title, permanent = true) {
    const marker = L.marker(pos, { icon: Diablo2Map.createIcon(color), title })
    layer.addLayer(marker)
    marker.bindTooltip(title, { permanent, direction: 'right' })
    return marker
  }

  displayNpc (x, y, unitId, unitCode) {
    ({ x, y } = transformCoords({ x, y }))
    const pos = xy(x, y)
    const name = (unitCode !== undefined ? (monsterNames[unitCode] !== '' ? monsterNames[unitCode] : ('NPC ' + unitCode)) : 'NPC')
    if (this.entities[unitId] === undefined) {
      this.entities[unitId] = Diablo2Map.addMarker(this.npcLayer, pos, 'green', name + ' ' + unitId, false)
    } else {
      this.entities[unitId].setLatLng(pos)
      if (unitCode !== undefined) {
        this.npcLayer.removeLayer(this.entities[unitId])
        this.entities[unitId] = Diablo2Map.addMarker(this.npcLayer, pos, 'green', name + ' ' + unitId, false)
      }
    }
    if (!this.positionned) {
      this.map.panTo(pos)
      this.positionned = true
    }
  }

  displayPlayerMove (x, y, unitId) {
    ({ x, y } = transformCoords({ x, y }))
    const pos = xy(x, y)
    if (this.entities[unitId] === undefined) {
      this.entities[unitId] = Diablo2Map.addMarker(this.playerLayer, pos, 'blue', 'player ' + unitId)
    } else {
      this.entities[unitId].setLatLng(pos)
    }

    if (!this.positionned) {
      this.map.panTo(pos)
      this.positionned = true
    }
  }

  displayWalkVerify (x, y) {
    ({ x, y } = transformCoords({ x, y }))
    const unitId = 99999
    const pos = xy(x, y)
    if (this.entities[unitId] === undefined) {
      this.entities[unitId] = Diablo2Map.addMarker(this.playerLayer, pos, 'red', 'myself')
    } else {
      this.entities[unitId].setLatLng(pos)
    }
    this.map.panTo(pos)
    this.positionned = true
  }

  displayWarp (x, y, unitId) {
    ({ x, y } = transformCoords({ x, y }))
    const pos = xy(x, y)
    if (this.warps[unitId] === undefined) {
      this.warps[unitId] = Diablo2Map.addMarker(this.warpLayer, pos, 'orange', 'warp ' + unitId)
    }
  }

  static createIcon (myCustomColour) {
    return L.AwesomeMarkers.icon({
      markerColor: myCustomColour
    })
  }

  displayItem (x, y, id, name, quality, ground) {
    try {
      if (!ground) {
        return
      }
      ({ x, y } = transformCoords({ x, y }))
      const pos = xy(x, y)
      if (this.items[id] === undefined) {
        if (quality === 'unique') {
          this.items[id] = Diablo2Map.addMarker(this.itemLayer, pos, 'purple', name)
        } else {
          this.items[id] = Diablo2Map.addMarker(this.itemLayer, pos, 'black', name)
        }
      }
    } catch (error) {
      console.log(error)
    }
  }

  displayObject (x, y, objectId, objectType) {
    ({ x, y } = transformCoords({ x, y }))
    const pos = xy(x, y)
    if (this.objects[objectId] === undefined) {
      const objectName = objectsById[objectType] === undefined ? 'object ' + objectType : objectsById[objectType]['description - not loaded']
      this.objects[objectId] = Diablo2Map.addMarker(this.objectLayer, pos, 'cadetblue', objectName + ' ' + objectId, false)
    }
  }

  listenToPackets () {
    this.ws.addEventListener('message', message => {
      const { name, params } = JSON.parse(message.data)

      if (name === 'D2GS_NPCMOVE' || name === 'D2GS_NPCSTOP' || name === 'D2GS_ASSIGNNPC' || name === 'D2GS_NPCMOVETOTARGET') {
        let { x, y, unitId, unitCode } = params
        this.displayNpc(x, y, unitId, unitCode)
      }

      if (name === 'D2GS_PLAYERMOVE') {
        let { targetX: x, targetY: y, unitId } = params
        this.displayPlayerMove(x, y, unitId)
      }

      if (name === 'D2GS_REASSIGNPLAYER') {
        let { x, y, unitId } = params
        if (unitId === 1) { this.displayWalkVerify(x, y) } else { this.displayPlayerMove(x, y, unitId) }
      }

      if (name === 'D2GS_WALKVERIFY') {
        let { x, y } = params
        this.displayWalkVerify(x, y)
      }

      if (name === 'D2GS_RUNTOLOCATION' || name === 'D2GS_WALKTOLOCATION') {
        let { xCoordinate: x, yCoordinate: y } = params
        this.displayWalkVerify(x, y)
      }

      if (name === 'D2GS_ASSIGNLVLWARP') {
        let { x, y, unitId } = params
        this.displayWarp(x, y, unitId)
      }

      if (name === 'D2GS_ITEMACTIONWORLD') {
        let { x, y, id, name, quality, ground } = params
        this.displayItem(x, y, id, name, quality, ground)
      }

      if (name === 'D2GS_WORLDOBJECT') {
        let { xCoordinate: x, yCoordinate: y, objectId, objectUniqueCode } = params
        this.displayObject(x, y, objectId, objectUniqueCode)
      }
    })
  }

  displayMap () {
    this.entities = {}
    this.warps = {}
    this.items = {}
    this.objects = {}

    const mapElement = this.shadowRoot.querySelector('#map')
    this.playerLayer = L.layerGroup()
    this.npcLayer = L.layerGroup()
    this.itemLayer = L.layerGroup()
    this.objectLayer = L.layerGroup()
    this.warpLayer = L.layerGroup()
    const baseMaps = {
    }

    const overlayMaps = {
      'player': this.playerLayer,
      'npc': this.npcLayer,
      'item': this.itemLayer,
      'object': this.objectLayer,
      'warp': this.warpLayer
    }

    this.map = L.map(mapElement, {
      crs: L.CRS.Simple,
      minZoom: -3,
      layers: Object.values(overlayMaps)
    })
    L.control.layers(baseMaps, overlayMaps).addTo(this.map)

    this.map.setZoom(2)
    this.positionned = false

    const searchLayer = L.layerGroup(Object.values(overlayMaps))
    this.map.addControl(new L.Control.Search({
      layer: searchLayer
    }))

    this.listenToPackets()
  }

  render () {
    return html`
    <style>
      :host {
      width: 100%; height:100%; position: fixed
      }
      
      ${css}
      ${cssMarkers}
      ${cssSearch}
    </style>
    <div id="map" style=" width: 100%; height:100%; position: relative;"></div>
    `
  }
}

customElements.define('diablo2-map', Diablo2Map)
