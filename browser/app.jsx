import hyperdom from 'hyperdom'
import {positive, negative, filterContainer} from './styles.css'
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
    const pactedWith = [
      this.pactWithLD && 'LD',
      this.pactWithGreens && 'GRN',
      this.pactWithPC && 'PC',
    ].filter(Boolean)

    const actualData = Object.values(groupBy(data, 'constituency'))
    const pactifiedData = pactify({data: actualData, pactedWith, tribalIntolerance: this.tribalIntolerance})

    const actualTotalSeatsByParty = this.calculateTotalSeatsByParty(actualData)
    const pactifiedTotalSeatsByParty = this.calculateTotalSeatsByParty(pactifiedData)

    return (
      <div class="container">
        <h2 class="title is-4 has-text-centered is-uppercase m-t-lg m-b-xl">What if Labour had an election pact</h2>

        <div class="tile is-ancestor is-vertical">

          <div class="tile">
            <div class="tile is-parent is-3">
              <div class={`tile is-child box ${filterContainer}`}>
                {this.renderFilter()}
              </div>
            </div>
            <div class="tile is-parent is-4">
              <div class="tile is-child has-text-left">
                {this.renderPieChart(pactifiedTotalSeatsByParty)}
              </div>
            </div>
            <div class="tile is-parent is-5">
              <div class="tile is-child">
                {this.renderResultsTotalTable(actualTotalSeatsByParty, pactifiedTotalSeatsByParty)}
              </div>
            </div>
          </div>

          <div class="tile is-parent">
            <div class="tile is-child">
              {this.renderDiffBreakdownTable(actualData, pactifiedData)}
            </div>
          </div>
        </div>
      </div>
    )
  }

  renderFilter() {
    return (
      <fieldset>
        <legend class="m-b-xs has-text-weight-bold">With:</legend>
        <ul>
          <li>
            <label>
              <input type="checkbox" class="m-r-xs" binding='this.pactWithLD'/>LibDems
            </label>
          </li>
          <li>
            <label>
              <input type="checkbox" class="m-r-xs" binding='this.pactWithGreens'/>Greens
            </label>
          </li>
          <li>
            <label>
              <input type="checkbox" class="m-r-xs" binding='this.pactWithPC'/>Plaid Cymru
            </label>
          </li>
          <li class="m-t-md">
            <label for="tribalIntolerance" class="is-block">
              Tribal intolerance&nbsp;<sup data-tooltip="Only voting for their party, or not voting at all">&#63;</sup>
            </label>
            <input type="range" min="0" max="100" id="tribalIntolerance" binding='this.tribalIntolerance'/>
            <div>
              {this.tribalIntolerance}%
            </div>
          </li>
        </ul>
      </fieldset>
    )
  }

  renderDiffBreakdownTable(actualData, pactifiedData) {
    const diff = pactifiedData.reduce((result, pactifiedConstituency, i) => {
      const pactifiedWinner = max(pactifiedConstituency, 'votes')
      const actualWinner = max(actualData[i], 'votes')

      if (actualWinner.pid !== pactifiedWinner.pid) {
        result.push({ actualWinner, pactifiedWinner })
      }
      return result
    }, [])

    return (
      <table class="table">
        <thead>
          <tr>
            <th>Constituency</th>
            <th>Pactified Party</th>
            <th>Pactified MP</th>
            <th>Pactified Votes</th>
            <th>Actual Party</th>
            <th>Actual MP</th>
            <th>Actual Votes</th>
            <th>Added Votes</th>
            <th>Margin</th>
          </tr>
        </thead>
        <tbody>
          {
            diff.map(({actualWinner, pactifiedWinner}) => {
              return (
                <tr>
                  <td>{actualWinner.constituency}</td>
                  <td>{pactifiedWinner.pid}</td>
                  <td>{pactifiedWinner.mp}</td>
                  <td>{pactifiedWinner.votes}</td>
                  <td>{actualWinner.pid}</td>
                  <td>{actualWinner.mp}</td>
                  <td>{actualWinner.votes}</td>
                  <td>{pactifiedWinner.addedVotes}</td>
                  <td>{pactifiedWinner.votes - actualWinner.votes}</td>
                </tr>
              )
            })
          }
        </tbody>
      </table>
    )
  }

  renderPieChart(totalSeatsByParty) {
    return new PieChart({data: totalSeatsByParty, pieStyle: this.pieStyle})
  }

  renderResultsTotalTable(actualTotalSeatsByParty, pactifiedTotalSeatsByParty) {
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
            pactifiedTotalSeatsByParty.map(([party, seats]) => {
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

  calculateTotalSeatsByParty(groupedByConstituency) {
    const winners = groupedByConstituency.map(constituencyResults => {
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
