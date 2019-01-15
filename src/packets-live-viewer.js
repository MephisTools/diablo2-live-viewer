/* globals customElements */

import { LitElement, html } from '@polymer/lit-element/'

import datatablesCss from 'datatables.net-dt/css/jquery.dataTables.min.css'
import $ from 'jquery'
import 'datatables.net'

class PacketsLiveViewer extends LitElement {
  static get properties () {
    return {
      ws: { type: Object }
    }
  }

  constructor () {
    super()
    this.fake = false
  }

  firstUpdated () {
    this.displayPacketsTable()
    this.packetsTable = $(this.shadowRoot.querySelector('#myTable')).DataTable({
      'order': [[ 0, 'desc' ]],
      'columns': [
        null,
        null,
        null,
        { width: '70%' }
      ]
    })
  }

  displayPacketsTable () {
    this.ws.addEventListener('message', message => {
      const { protocol, name, params } = JSON.parse(message.data)
      this.packetsTable.row.add([new Date().toLocaleTimeString(), protocol, name, JSON.stringify(params)]).draw()
      console.log(protocol, name, JSON.stringify(params))
    })
    if (this.fake) {
      setInterval(() => {
        this.packetsTable.row.add([new Date().toLocaleTimeString(), 'lol1', 'lol2', 'lol3']).draw()
      }, 1000)
    }
  }

  render () {
    return html`<style>${datatablesCss}</style>
  <table id="myTable">
      <thead>
        <tr>
            <th>Time</th>
            <th>Protocol</th>
            <th>Name</th>
            <th>Params</th>
        </tr>
    </thead>
    <tbody>
    </tbody>
</table>
  `
  }
}

customElements.define('packets-live-viewer', PacketsLiveViewer)
