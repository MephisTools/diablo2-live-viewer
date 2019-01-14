/* globals customElements */

import { LitElement, html } from '@polymer/lit-element/'

class PacketsLiveViewer extends LitElement {
  static get properties () {
    return {
      ws: { type: Object }
    }
  }

  firstUpdated () {
    this.entities = {}
    this.displayPacketsTable()
  }

  displayPacketsTable () {
    console.log(this.ws)
    this.ws.addEventListener('message', message => {
      const { protocol, name, params } = JSON.parse(message.data)
      console.log(protocol, name, JSON.stringify(params))
    })
  }

  render () {
    return html`I view`
  }
}

customElements.define('packets-live-viewer', PacketsLiveViewer)
