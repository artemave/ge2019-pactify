const fs = require('fs')
const parse = require('csv-parse/lib/sync')

const csv = fs.readFileSync('./vote_data.csv', {encoding: 'utf-8'})
const records = parse(csv, {
  columns: true,
  skip_empty_lines: true,
  cast: (value) => {
    if (!value) {
      return
    }

    if (isNaN(value)) {
      if (value.match(/^-?\d+,\d+$/)) {
        const number = Number(value.replace(',', ''))
        return number
      } else {
        return value
      }
    } else {
      return Number(value)
    }
  }
})

// eslint-disable-next-line
console.log(JSON.stringify(records, null, 2))
