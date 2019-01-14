/* globals customElements */

import { LitElement, html } from '@polymer/lit-element/'
import './diablo2-map.js'

class Diablo2LiveViewer extends LitElement {
  render () {
    return html`<diablo2-map></diablo2-map>`
  }
}

customElements.define('diablo2-live-viewer', Diablo2LiveViewer)
