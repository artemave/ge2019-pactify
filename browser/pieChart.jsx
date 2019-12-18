import hyperdom from 'hyperdom'
import Chartist from 'chartist'
import '~/../chartist/dist/chartist.css?raw' // eslint-disable-line
import {chartContainer} from './styles.css'
import partyColors from './partyColors.json'
import sum from './sum'

export default class PieChart {
  constructor({data}) {
    const topData = data.slice(0, 5)
    const rest = data.slice(5)

    this.data = {
      labels: topData.map(([key]) => key).concat('Other'),
      series: topData.map(([, value]) => value).concat(rest.map(([, value]) => value).reduce(sum))
    }
  }

  onrender(el) {
    new Chartist.Pie(el, this.data, {
      labelInterpolationFnc: (value) => {
        return value
      }
    })

    setTimeout(() => {
      const slices = document.querySelectorAll('.ct-slice-pie')
      this.data.labels.forEach((label, i) => {
        slices[i].style.fill = partyColors[label]
      })
    })
  }

  render() {
    return <div class={`${chartContainer} ct-chart ct-square`} />
  }
}
