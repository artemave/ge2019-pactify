import sortBy from 'lowscore/sortBy'
import sum from './sum'

function clone(thing) {
  return JSON.parse(JSON.stringify(thing))
}

export default function({data, filters: {pactWithLD, pactWithGreens}}) {
  return Object.values(data).map(constituency => {
    let result = clone(constituency)
    const labourResult = result.find(({pid}) => pid == 'LAB')
    const ldResult = result.find(({pid}) => pid == 'LD')
    const greensResult = result.find(({pid}) => pid == 'GRN')

    if (!labourResult) {
      return result
    }

    if (ldResult && pactWithLD && !pactWithGreens) {

      if (labourResult.votes > ldResult.votes) {
        labourResult.votes += ldResult.votes
        result = result.filter(({pid}) => pid != 'LD')
      } else {
        ldResult.votes += labourResult.votes
        result = result.filter(({pid}) => pid != 'LAB')
      }
    }

    if (greensResult && !pactWithLD && pactWithGreens) {

      if (labourResult.votes > greensResult.votes) {
        labourResult.votes += greensResult.votes
        result = result.filter(({pid}) => pid != 'GRN')
      } else {
        greensResult.votes += labourResult.votes
        result = result.filter(({pid}) => pid != 'LAB')
      }
    }

    if (pactWithLD && pactWithGreens) {
      const [bestResult, ...others] = sortBy(result.filter(({pid}) => ['LAB', 'LD', 'GRN'].includes(pid)), 'votes').reverse()
      bestResult.votes += others.map(other => other.votes).reduce(sum, 0)
      result = result.filter(({pid}) => !others.map(other => other.pid).includes(pid))
    }

    return result
  })
}
