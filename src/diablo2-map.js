/* globals customElements */

import { LitElement, html } from '@polymer/lit-element/'
import L from 'leaflet'
import css from 'leaflet/dist/leaflet.css'
/* This code is needed to properly load the images in the Leaflet CSS */
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
})

class Diablo2Map extends LitElement {
  firstUpdated () {
    this.displayMap()
  }

  displayMap () {
    const mapElement = this.shadowRoot.querySelector('#map')
    const map = L.map(mapElement, {
      crs: L.CRS.Simple,
      minZoom: -3
    })

    const yx = L.latLng

    const xy = function (x, y) {
      if (L.Util.isArray(x)) { // When doing xy([x, y]);
        return yx(x[1], x[0])
      }
      return yx(y, x) // When doing xy(x, y);
    }

    const bounds = [xy(-25, -26.5), xy(428, 220)]
    L.imageOverlay('assets/Rogue_Encampment_Map.jpg', bounds).addTo(map)

    const sol = xy(175.2, 145.0)
    xy(41.6, 130.1)
    const kruegerZ = xy(13.4, 56.5)
    const deneb = xy(218.7, 8.3)

    const solM = L.marker(sol, { title: 'sol' }).addTo(map).bindTooltip('Test Label',
      {
        permanent: true,
        direction: 'right'
      })
    L.marker(kruegerZ).addTo(map).bindPopup('Krueger-Z')
    L.marker(deneb).addTo(map).bindPopup('Deneb')

    setInterval(() => {
      console.log(solM.getLatLng())
      solM.setLatLng(xy(solM.getLatLng().lng + 20 * (Math.random() - 0.5), solM.getLatLng().lat + 20 * (Math.random() - 0.5)))
    }, 1000)

    map.setView(xy(120, 70), 1)
  }

  render () {
    return html`
    <style>
      :host {
      width: 100%; height:100%; position: fixed
      }
      
      ${css}
    </style>
    <div id="map" style=" width: 100%; height:100%; position: relative;"></div>
    `
  }
}

customElements.define('diablo2-map', Diablo2Map)
