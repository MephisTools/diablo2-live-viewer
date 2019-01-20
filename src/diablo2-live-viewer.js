/* globals customElements, WebSocket */

import { LitElement, html } from '@polymer/lit-element/'
import './diablo2-map.js'
import './packets-live-viewer'
import page from 'page'

class Diablo2LiveViewer extends LitElement {
  constructor () {
    super()
    this.page = 'index'
    this.connect()
  }

  connect () {
    this.ws = new WebSocket('ws://localhost:8080')
    this.ws.addEventListener('close', (err) => {
      console.log('close', err)
      setTimeout(() => {
        this.connect()
      }, 1000)
    })
  }

  static get properties () {
    return { page: { type: String }, ws: { type: Object } }
  }

  firstUpdated () {
    page('/', () => { this.page = 'index' })
    page('/map', () => { this.page = 'map' })
    page('/packets', () => { this.page = 'packets' })
    page()
  }

  render () {
    switch (this.page) {
      case 'index':
        return html`
        <a href="/map">Map</a>
        <br />
        <a href="/packets">Packets</a>
        `
      case 'map':
        return html`<diablo2-map .ws=${this.ws}></diablo2-map>`
      case 'packets':
        return html`<packets-live-viewer .ws=${this.ws}></packets-live-viewer>`
    }
  }
}

customElements.define('diablo2-live-viewer', Diablo2LiveViewer)
