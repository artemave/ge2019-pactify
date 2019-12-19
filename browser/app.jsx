import hyperdom from 'hyperdom'
import {mainTitle, slider, positive, negative} from './styles.css'
import {style} from 'hobostyle'
import routes from './routes'
import data from './data.json'
import groupBy from 'lowscore/groupBy'
import max from 'lowscore/max'
import PieChart from './pieChart'
import pactify from './pactify'

export default class App {
  constructor() {
    this.tribalIntolerance = 10
    this.pieStyle = style()
  }

  routes() {
    return [
      routes.home({
        bindings: {
          pactWithLD: {
            set: (v) => {
              this.pactWithLD = v === 'true'
            },
            get: () => this.pactWithLD
          },
          pactWithGreens: {
            set: (v) => {
              this.pactWithGreens = v === 'true'
            },
            get: () => this.pactWithGreens
          },
          pactWithPC: {
            set: (v) => {
              this.pactWithPC = v === 'true'
            },
            get: () => this.pactWithPC
          },
          tribalIntolerance: {
            set: (v) => {
              this.pactWithPC = Number(v)
            },
            get: () => this.tribalIntolerance
          },
        },
        render: () => this.render()
      })
    ]
  }

  render() {
    const totalSeatsByParty = this.calculateTotalSeatsByParty()

    return (
      <div class="container">
        <h2 class={`title is-4 has-text-centered is-uppercase ${mainTitle}`}>What if Labour had an election pact</h2>

        <div className="columns is-desktop">
          <div className="column">
            <ul>
              <li>
                <label>
                  <input type="checkbox" binding='this.pactWithLD'/>LibDems
                </label>
              </li>
              <li>
                <label>
                  <input type="checkbox" binding='this.pactWithGreens'/>Greens
                </label>
              </li>
              <li>
                <label>
                  <input type="checkbox" binding='this.pactWithPC'/>Plaid Cymru
                </label>
              </li>
              <li class={slider}>
                <label for="tribalIntolerance">
                  Tribal intolerance
                </label>
                <input type="range" min="0" max="100" id="tribalIntolerance" binding='this.tribalIntolerance'/>
                <div>
                  {this.tribalIntolerance}%
                </div>
              </li>
            </ul>
          </div>
          <div className="column is-two-thirds">
            {this.renderPieChart(totalSeatsByParty)}
          </div>
          <div className="column">
            {this.renderResultTable(totalSeatsByParty)}
          </div>
        </div>
      </div>
    )
  }

  renderPieChart(totalSeatsByParty) {
    return new PieChart({data: totalSeatsByParty, pieStyle: this.pieStyle})
  }

  renderResultTable(totalSeatsByParty) {
    const actualTotalSeatsByParty = this.calculateTotalSeatsByParty({doPactify: false})

    return (
      <table class="table">
        <thead>
          <tr>
            <th>Party</th>
            <th>Seats</th>
            <th>+/-</th>
          </tr>
        </thead>
        <tbody>
          {
            totalSeatsByParty.map(([party, seats]) => {
              const diff = seats - actualTotalSeatsByParty.find(actualPartyResult => actualPartyResult[0] === party)[1]
              let className = ''
              if (diff !== 0) {
                className = diff > 0 ? positive : negative
              }
              return (
                <tr>
                  <td>{party}</td>
                  <td>{seats}</td>
                  <td class={className}>{diff}</td>
                </tr>
              )
            })
          }
        </tbody>
      </table>
    )
  }

  calculateTotalSeatsByParty({doPactify = true} = {}) {
    const pactedWith = [
      this.pactWithLD && 'LD',
      this.pactWithGreens && 'GRN',
      this.pactWithPC && 'PC',
    ].filter(Boolean)

    const groupedByConstituency = Object.values(groupBy(data, 'constituency'))

    const pactifiedData = doPactify
      ? pactify({data: groupedByConstituency, pactedWith, tribalIntolerance: this.tribalIntolerance})
      : groupedByConstituency

    const winners = pactifiedData.map(constituencyResults => {
      return max(constituencyResults, 'votes')
    })

    const winnersTotalByParty = winners.reduce((result, {pid}) => {
      if (!result[pid]) {
        result[pid] = 1
      } else {
        result[pid]++
      }
      return result
    }, {})

    const winnersTotalByPartyArray = Object.keys(winnersTotalByParty).map(key => [key, winnersTotalByParty[key]])
    return winnersTotalByPartyArray.sort((a, b) => b[1] - a[1])
  }
}
