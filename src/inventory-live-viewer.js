/* globals customElements */

import { LitElement, html, css } from 'lit-element'

class InventoryLiveViewer extends LitElement {
  static get properties () {
    return {
      ws: { type: Object }
    }
  }
  static get styles () {
    return css`
    div {
      display: inline-block;
      margin:10px;
      background-color:grey;
    }`
  }

  firstUpdated () {
  }

  displayItemData (data) {
    console.log(data)
  }

  listenToPackets () {
    // TODO : hover = stats
    this.ws.addEventListener('message', message => {
      const { name, params } = JSON.parse(message.data)
      if (name === 'D2GS_ITEMACTIONOWNED' || name === 'D2GS_ITEMACTIONWORLD') {
        switch (params['action']) { // TODO: handle other containers (trade etc)
          case 1: // inventory opened -> ground -> hand
            console.log('g -> h')
            break
          case 2: // drop to ground
            console.log('h -> g')
            break
          case 5: // inventory opened -> inventory -> hand OR inventory -> belt
          case 15: // belt -> inventory
            // this.shadowRoot.getElementById(`${params['x']};${params['y']}`).src = 'assets/itemGrid.png'
            for (let w = 0; w < params['width']; w++) {
              for (let h = 0; h < params['height']; h++) {
                try {
                  let x = params['x'] + w
                  let y = params['y'] + h
                  const e = this.shadowRoot.getElementById(`${params['container']}${x};${y}`)
                  e.src = 'assets/itemGrid.png'
                  e.addEventListener('mouseover', () => { this.displayItemData(params) })
                } catch (exception) {
                  console.log(`Failed ${JSON.stringify(params)}`)
                }
              }
            }
            break
          case 8: // unequip TODO: handle case when removing belt (it drop potions into inventory non-equipped)
            const e = this.shadowRoot.getElementById(`e${params['x']};${params['y']}`)
            e.src = 'assets/itemGrid.png'
            e.removeEventListener('mouseover', () => { this.displayItemData(params) })
            break
          case 4: // -> inventory non-equipped
          case 6: // whatever -> equipped
          case 14: // inventory closed -> ground -> inventory OR inventory -> belt
            if (params['equipped'] === 1) {
              const e = this.shadowRoot.getElementById(`e${params['x']};${params['y']}`)
              e.src = 'assets/itemGrid_filled.png'
              e.addEventListener('mouseover', () => { this.displayItemData(params) })
            } else {
              for (let w = 0; w < params['width']; w++) {
                for (let h = 0; h < params['height']; h++) {
                  try {
                    let x = params['x'] + w
                    let y = params['y'] + h
                    const e = this.shadowRoot.getElementById(`${params['container']}${x};${y}`)
                    e.src = 'assets/itemGrid_filled.png'
                    e.removeEventListener('mouseover', () => { this.displayItemData(params) })
                  } catch (exception) {
                    console.log(`Failed ${JSON.stringify(params)}`)
                  }
                }
              }
            }
            break
        }
      }
    })
  }

  updated (props) {
    // if (props.get('ws') !== undefined) {
    this.listenToPackets()
    // }
  }

  render () {
    const inventoryWidth = 10
    const inventoryHeight = 10
    const stashWidth = 10
    const stashHeight = 10
    const beltWidth = 4 // TODO: get belt size from packets
    const beltHeight = 4
    /*
    Containers btw
    unspecified: 0,
    inventory: 2,
    trader_offer: 4,
    for_trade: 6,
    cube: 8,
    stash: 0x0A,
    belt: 0x20,
    item: 0x40,
    armor_tab: 0x82,
    weapon_tab_1: 0x84,
    weapon_tab_2: 0x86,
    misc_tab: 0x88
    */

    return html`
    <!-- TODO: use diablo images for inventory (make same interface than diablo) -->
    <div>
    <h1>Equipped</h1>
    <img id="e0;0" src="assets/itemGrid.png" alt=""> <!-- ? -->
    <img id="e1;0" src="assets/itemGrid.png" alt=""> <!-- hat -->
    <img id="e2;0" src="assets/itemGrid.png" alt=""> <!-- amu -->
    <img id="e3;0" src="assets/itemGrid.png" alt=""> <!-- armor -->
    <img id="e4;0" src="assets/itemGrid.png" alt=""> <!-- weapon1 -->
    <img id="e5;0" src="assets/itemGrid.png" alt=""> <!-- weapon2 -->
    <img id="e6;0" src="assets/itemGrid.png" alt=""> <!-- ring1 -->
    <img id="e7;0" src="assets/itemGrid.png" alt=""> <!-- ring2 -->
    <img id="e8;0" src="assets/itemGrid.png" alt=""> <!-- belt -->
    <img id="e9;0" src="assets/itemGrid.png" alt=""> <!-- boots -->
    <img id="e10;0" src="assets/itemGrid.png" alt=""> <!-- glove -->
    <img id="e11;0" src="assets/itemGrid.png" alt=""> <!-- swap1 -->
    <img id="e12;0" src="assets/itemGrid.png" alt=""> <!-- swap2 -->
    </div>

    <div>
    <h1>Stash</h1>
    <table>${Array(stashHeight) // Stash
    .fill()
    .map((a, c) => html`<tr>${Array(stashWidth)
      .fill() // id = [container][row];[column]
      .map((a, r) => html`<td><img id="10${r};${c}" src="assets/itemGrid.png" alt=""></td>`)}</tr>`)}</table>
    </div>

    <div>
    <h1>Inventory</h1>
    <table>${Array(inventoryHeight) // Inventory non-equipped (when you press i)
    .fill()
    .map((a, c) => html`<tr>${Array(inventoryWidth)
      .fill() // id = [container][row];[column]
      .map((a, r) => html`<td><img id="2${r};${c}" src="assets/itemGrid.png" alt=""></td>`)}</tr>`)}</table>
    </div>

    <div>
    <h1>Belt</h1>
    <table>${Array(beltHeight) // Belt
    .fill()
    .map((a, c) => html`<tr>${Array(beltWidth)
      .fill() // id = [container][row];[column]
      .map((a, r) => html`<td><img id="32${r};${c}" src="assets/itemGrid.png" alt=""></td>`)}</tr>`)}</table>
    </div>`
  }
}

customElements.define('inventory-live-viewer', InventoryLiveViewer)
