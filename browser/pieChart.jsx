import hyperdom from 'hyperdom'
import Chartist from 'chartist'
import {chartContainer} from './styles.css'
import partyColors from './partyColors.json'
import sum from './sum'

const numberToChar = {
  0: 'a',
  1: 'b',
  2: 'c',
  3: 'd',
  4: 'e',
  5: 'f',
  6: 'g',
  7: 'h',
  8: 'i',
  9: 'j',
}

export default class PieChart {
  constructor({data, pieStyle}) {
    const topData = data.slice(0, 5)
    const rest = data.slice(5)

    this.pieStyle = pieStyle
    this.data = {
      labels: topData.map(([key]) => key).concat('Other'),
      series: topData.map(([, value]) => value).concat(rest.map(([, value]) => value).reduce(sum))
    }
  }

  onrender(el) {
    new Chartist.Pie(el, this.data)

    const css = this.data.labels.map((label, i) => {
      return `.ct-series-${numberToChar[i]} .ct-slice-pie { fill: ${partyColors[label]} !important; }`
    }).join('\n')

    this.pieStyle.set(css)
  }

  render() {
    return <div class={`${chartContainer} ct-chart ct-square`} />
  }
}
