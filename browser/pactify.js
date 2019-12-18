import sortBy from 'lowscore/sortBy'
import sum from './sum'

function clone(thing) {
  return JSON.parse(JSON.stringify(thing))
}

export default function({data, pactedWith = []}) {
  return Object.values(data).map(constituency => {
    const labourResult = constituency.find(({pid}) => pid == 'LAB')

    if (!labourResult) {
      return constituency
    }

    let result = clone(constituency)

    const [bestResult, ...others] = sortBy(result.filter(({pid}) => ['LAB'].concat(pactedWith).includes(pid)), 'votes').reverse()
    bestResult.votes += others.map(other => other.votes).reduce(sum, 0)
    result = result.filter(({pid}) => !others.map(other => other.pid).includes(pid))

    return result
  })
}
