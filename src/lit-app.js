import { LitElement, html } from '@polymer/lit-element/';
import { styles } from './lit-app-styles.js';
import './hello-world.js';
import L from 'leaflet';
import css from 'leaflet/dist/leaflet.css';
/* This code is needed to properly load the images in the Leaflet CSS */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

class LitApp extends LitElement {
  firstUpdated () {

    var map = L.map(this.shadowRoot.querySelector('#map')).setView([51.505, -0.09], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    L.marker([51.5, -0.09]).addTo(map)
      .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
      .openPopup();

  }

	render() {
		return html`
			<style>
			:host {
			width: 100%; height:100%; position: fixed
			}
			
			${css}
			</style>
			<div id="map" style=" width: 100%; height:100%; position: relative;"></div>
		`;
	}
}

customElements.define('lit-app', LitApp);
