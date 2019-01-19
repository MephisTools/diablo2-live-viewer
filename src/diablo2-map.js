/* globals customElements */

import monsterNamesRaw from './monster_names.txt'
import { LitElement, html } from '@polymer/lit-element/'
import L from 'leaflet'
import css from 'leaflet/dist/leaflet.css'
import 'leaflet.awesome-markers'
import cssMarkers from 'leaflet.awesome-markers/dist/leaflet.awesome-markers.css'
import 'leaflet-search'
import cssSearch from 'leaflet-search/dist/leaflet-search.src.css'

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
    this.entities = {}
    this.warps = {}
    this.items = {}
    this.displayMap()
  }

  addMarker (pos, color, title) {
    const marker = L.marker(pos, { icon: Diablo2Map.createIcon(color), title })
    this.entitiesLayers.addLayer(marker)
    marker.bindTooltip(title, { permanent: true, direction: 'right' })
    return marker
  }

  displayNpc (x, y, unitId, unitCode) {
    ({ x, y } = transformCoords({ x, y }))
    const pos = xy(x, y)
    const name = (unitCode !== undefined ? (monsterNames[unitCode] !== '' ? monsterNames[unitCode] : ('NPC ' + unitCode)) : 'NPC')
    if (this.entities[unitId] === undefined) {
      this.entities[unitId] = this.addMarker(pos, 'green', name + ' ' + unitId)
    } else {
      this.entities[unitId].setLatLng(pos)
      if (unitCode !== undefined) {
        this.entitiesLayers.removeLayer(this.entities[unitId])
        this.entities[unitId] = this.addMarker(pos, 'green', name + ' ' + unitId)
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
      this.entities[unitId] = this.addMarker(pos, 'blue', 'player ' + unitId)
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
      this.entities[unitId] = this.addMarker(pos, 'red', 'myself')
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
      this.warps[unitId] = this.addMarker(pos, 'orange', 'warp ' + unitId)
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
          this.items[id] = this.addMarker(pos, 'purple', name)
        } else {
          this.items[id] = this.addMarker(pos, 'black', name)
        }
      }
    } catch (error) {
      console.log(error)
    }
  }

  listenToPackets () {
    this.ws.addEventListener('message', message => {
      const { name, params } = JSON.parse(message.data)

      if (name === 'D2GS_NPCMOVE' || name === 'D2GS_NPCSTOP' || name === 'D2GS_ASSIGNNPC') {
        let { x, y, unitId, unitCode } = params
        this.displayNpc(x, y, unitId, unitCode)
      }

      if (name === 'D2GS_PLAYERMOVE') {
        let { targetX: x, targetY: y, unitId } = params
        this.displayPlayerMove(x, y, unitId)
      }

      if (name === 'D2GS_WALKVERIFY') {
        let { x, y } = params
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
    })
  }

  displayMap () {
    const mapElement = this.shadowRoot.querySelector('#map')
    this.map = L.map(mapElement, {
      crs: L.CRS.Simple,
      minZoom: -3
    })
    this.entitiesLayers = new L.LayerGroup([])
    this.map.addLayer(this.entitiesLayers)

    this.map.setView(xy(120, 70), 2)
    this.positionned = false

    this.map.addControl(new L.Control.Search({
      layer: this.entitiesLayers
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
