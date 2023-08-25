import express from 'express'


const app = express()
const PORT = 3020

app.listen(PORT, () => {
  console.log(`app running on ${PORT} port`)
})

app.get('/', (req, res) => {
  res.send('sdfsdfds')
})
