const express = require("express")
const app = express()

let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

let dateTime = new Date()
let year = dateTime.toJSON().slice(0, 4)
let month = dateTime.toJSON().slice(5, 7)
let date = dateTime.toJSON().slice(8, 10)
let time = dateTime.toJSON().slice(11, dateTime.length - 1)
let day = dateTime.getDay();
let timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
let offset = dateTime.getTimezoneOffset()
let sign = offset > 0 ? "-" : "+"
let hours = Math.floor(Math.abs(offset / 60))
let minutes = Math.abs(offset % 60)

let dayMap = {0: "Sun", 1: "Mon", 2: "Tue", 3: "Wed", 4: "Thu", 5: "Fri"}
let monthMap = {"01": "Jan", "02": "Feb", "03": "Mar", "04": "Apr", "05": "May", "06": "Jun", "07": "Jul", "08": "Aug", "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dec"}

app.get("/info", (req, res) => {
  res.send(
    `<div><p>Phonebook has entries for ${persons.length} people</p><br /><p>${dayMap[day]} ${monthMap[month]} ${date} ${year} ${time} GMT${sign}${hours}${minutes} (${timeZone})</p></div>`
  )
})

app.get('/api/persons', (req, res) => {
  res.json(persons)
}) 

app.get('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  const person = persons.find(person => person.id === id)
  if (person) {
    res.json(person)
  } else {
    res.status(404).end()
  }
})

const PORT = 3001
app.listen(PORT, (err, res) => {console.log(`Server running on port ${PORT}`)
})