import sortBy from 'lowscore/sortBy'
import sum from './sum'

function clone(thing) {
  return JSON.parse(JSON.stringify(thing))
}

export default function({data, pactedWith = [], tribalIntolerance = 0}) {
  return data.map(constituencyResults => {
    const labourResult = constituencyResults.find(({pid}) => pid == 'LAB')

    if (!labourResult) {
      return constituencyResults
    }

    let result = clone(constituencyResults)

    const [bestResult, ...others] = sortBy(result.filter(({pid}) => ['LAB'].concat(pactedWith).includes(pid)), 'votes').reverse()
    bestResult.votes += Math.floor(
      others.map(other => other.votes).reduce(sum, 0) * (100 - tribalIntolerance) / 100
    )
    result = result.filter(({pid}) => !others.map(other => other.pid).includes(pid))

    return result
  })
}
