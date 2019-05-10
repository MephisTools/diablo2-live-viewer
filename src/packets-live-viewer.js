/* globals customElements */

import { LitElement, html } from 'lit-element'

import 'wct-datatables-net'

class PacketsLiveViewer extends LitElement {
  static get properties () {
    return {
      ws: { type: Object },
      table: { type: Object }
    }
  }

  constructor () {
    super()
    this.fake = false
  }

  firstUpdated () {
    this.displayPacketsTable()
    // document.querySelector('packets-live-viewer').setAttribute('', '')
    // document.getElementById('output').innerHTML = document.querySelector('div span').innerHTML
    this.shadowRoot.getElementById('send').onclick = () => {
      console.log(`Sent packet ${this.shadowRoot.getElementById('packet').value}`)
      this.ws.send(this.shadowRoot.getElementById('packet').value)
    }
  }

  displayPacketsTable () {
    this.listenToPackets()
    if (this.fake) {
      setInterval(() => {
        this.packetsTable.row.add([new Date().toLocaleTimeString(), 'lol1', 'lol2', 'lol3']).draw('full-hold')
      }, 1000)
    }
  }

  listenToPackets () {
    this.ws.addEventListener('message', message => {
      const data = JSON.parse(message.data)
      if (data.protocol === 'event') {
        return
      }
      const { protocol, name, params } = data
      this.packetsTable.row.add([new Date().toLocaleTimeString(), protocol, name, JSON.stringify(params)]).draw('full-hold')
      console.log(protocol, name, JSON.stringify(params))
    })
  }

  updated (props) {
    if (props.get('ws') !== undefined) {
      this.listenToPackets()
    }
  }

  render () {
    return html`
    <data-table .options=${{
    'order': [[ 0, 'desc' ]],
    'columns': [
      { title: 'Time' },
      { title: 'Protocol' },
      { title: 'Name' },
      { title: 'Params', width: '70%' }
    ]
  }} @table-created=${e => { this.packetsTable = e.detail.table }}></data-table>
  Send packet: <input id="packet" type="text" placeholder="raw json packet"><br>
  <input id="send" type="submit" value="Submit">
  `
  }
}

customElements.define('packets-live-viewer', PacketsLiveViewer)
