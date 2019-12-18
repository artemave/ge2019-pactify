import hyperdom from 'hyperdom'
import Chartist from 'chartist'
import 'chartist-plugin-tooltips-updated'
import '~/../chartist/dist/chartist.css?raw'
import {chartContainer} from './styles.css'
import partyColors from './partyColors.json'
import sum from './sum'

export default class PieChart {
  constructor({data}) {
    const dataArray = Object.keys(data).map(key => [key, data[key]])
    const dataArraySorted = dataArray.sort((a, b) => b[1] - a[1])
    const topData = dataArraySorted.slice(0, 5)
    const rest = dataArraySorted.slice(5)

    this.data = {
      labels: topData.map(([key]) => key).concat('Other'),
      series: topData.map(([, value]) => value).concat(rest.map(([, value]) => value).reduce(sum))
    }
  }

  onrender(el) {
    new Chartist.Pie(el, this.data, {
      labelInterpolationFnc: (value) => {
        return value
      },
      plugins: [
        Chartist.plugins.tooltip()
      ]
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
