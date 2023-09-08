const express = require("express")
const cors = require("cors")
const morgan = require('morgan')
require("dotenv").config()
const Person = require('./models/person')

const app = express()

app.use(cors())
app.use(express.static('build'))

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

app.use(express.json())

morgan.token('body', function (req, res) { return JSON.stringify(req.body) })
app.use(morgan(`:method :url :status :res[content-length] - :response-time ms :body`))

app.get("/info", (req, res) => {
  let persons = []
  Person.find({}).then(personList => {
    persons = personList
    console.log(persons.length)
    res.send(
      `<div><p>Phonebook has entries for ${persons.length} people</p><br /><p>${dayMap[day]} ${monthMap[month]} ${date} ${year} ${time} GMT${sign}${hours}${minutes} (${timeZone})</p></div>`
    )
  }) 
})

app.get('/api/persons', (req, res) => {
  Person.find({}).then(persons => {
    res.json(persons)
  }) 
})

app.get('/api/persons/:id', (req, res) => {
  const id = req.params.id
  Person.findById(id).then(person => {
    if (person) {
      res.json(person)
    } else {
      res.status(404).end()
    }
  })
})

app.delete('/api/persons/:id', (req, res) => {
  const id = req.params.id
  const persons = []
  Person.findByIdAndDelete(id).then(personList => {
    res.status(204).end()
  }) 
})

app.post('/api/persons', (req, res) => {
  const person = req.body
  var newPerson = new Person({
    name: person.name,
    number: person.number 
  })
  let persons = []
  Person.find({}).then(personList => {
    persons = personList
    if (person) {
      if (person.name && person.number){
        const present = persons.filter((p) => person.name === p.name)
        console.log(present, person.name)
        if (present.length === 0){
          newPerson.save().then(savedPerson => {
            res.json(savedPerson)
          })
        } 
        else {
          res.status(400)
          res.send({ error: 'name must be unique' })
          res.end()
        }
      }
      else if (!person.name || !person.number){
        res.status(400)
        res.send({ error: 'missing data in request body' })
        res.end()
      }
    }
    else {
      res.status(404).end()
    }
  }) 
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, (err, res) => {console.log(`Server running on port ${PORT}`)
})