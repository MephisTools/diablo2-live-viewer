/* globals customElements */

import { LitElement, html } from 'lit-element'

class InventoryLiveViewer extends LitElement {
  static get properties () {
    return {
      ws: { type: Object },
      table: { type: Object }
    }
  }

  firstUpdated () {
  }

  listenToPackets () {
    this.ws.addEventListener('message', message => {
      /*
      const { name, params } = JSON.parse(message.data)

      if (name === 'D2GS_ITEMACTIONOWNED') {
        document.querySelector('inventory-live-viewer').setAttribute('', '')
      }
      */
    })
  }

  updated (props) {
    if (props.get('ws') !== undefined) {
      this.listenToPackets()
    }
  }

  render () {
    const inventoryWidth = 8
    const inventoryHeight = 8
    let content = html`<table>`
    for (let i = 0; i < inventoryWidth; i++) {
      content += html`<tr>`
      for (let j = 0; j < inventoryHeight; j++) {
        content += html`<td id="${i}-${j}"><img src="itemGrid.png" alt=""></td>`
      }
      content += html`</tr>`
    }
    content += html`</table>`
    return content
  }
}

customElements.define('inventory-live-viewer', InventoryLiveViewer)
