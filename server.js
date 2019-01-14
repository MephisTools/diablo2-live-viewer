const express = require('express')
const app = express()
const path = require('path')

app.use(express.static('dist'))

app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, '/dist/index.html'))
})

app.listen(process.env.PORT || 8000, function () {
  console.log('Express server is running on port 8000')
})
