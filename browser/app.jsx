import hyperdom from 'hyperdom'
import styles from './styles.css'
import routes from './routes'
import data from './data.json'
import groupBy from 'lowscore/groupBy'
import max from 'lowscore/max'
import PieChart from './pieChart'
import pactify from './pactify'

export default class App {
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
        },
        render: () => this.render()
      })
    ]
  }

  render() {
    return (
      <main>
        <label>
          <input type="checkbox" binding='this.pactWithLD'/>Pact with LibDems
        </label>
        <label>
          <input type="checkbox" binding='this.pactWithGreens'/>Pact with Greens
        </label>
        {this.renderPieChart()}
      </main>
    )
  }

  renderPieChart() {
    const pieData = this._calculatePieData()
    return new PieChart({data: pieData})
  }

  _calculatePieData() {
    const groupedByConstituency = groupBy(data, 'constituency')
    const winners = Object.values(pactify({data: groupedByConstituency, filters: this})).map(constituency => {
      return max(constituency, 'votes')
    })
    return winners.reduce((result, {pid}) => {
      if (!result[pid]) {
        result[pid] = 1
      } else {
        result[pid]++
      }
      return result
    }, {})
  }
}
