const express = require("express")
const cors = require("cors")
const morgan = require('morgan')
require("dotenv").config()
const Person = require('./models/person')

const app = express()

app.use(cors())
app.use(express.static('build'))
app.use(express.json())

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

app.get('/api/persons/:id', (req, res, next) => {
  const id = req.params.id
  Person.findById(id)
  .then(person => {
    if (person) {
      res.json(person)
    } else {
      res.status(404).end()
    }
  })
  .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res) => {
  const id = req.params.id
  const persons = []
  Person.findByIdAndDelete(id)
  .then(personList => {
    res.status(204).end()
  })
  .catch(error => next(error))
})

app.post('/api/persons', (req, res, next) => {
  const person = req.body
  var newPerson = new Person({
    name: person.name,
    number: person.number 
  })
  if (person) {
    if (person.name && person.number){
      Person.findOne({
          name: person.name
      })
      .then(existingPerson => {
          if (existingPerson) {
              existingPerson.number = person.number;
              return existingPerson.save()
              .then(updatedPerson => {
                  res.json(updatedPerson);
              })
              .catch(error => next(error));
          } else {
            newPerson.save()
            .then(savedPerson => {res.json(savedPerson)})
            .catch(error => next(error));
          }
      })
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


app.put("api/persons/:id", (req, res, next) => {

  Person.findByIdAndUpdate(req.params.id,
    {
      name: req.body.name,
      number: req.body.number,
    },
    { new: true, runValidators: true, context: 'query' }
  )
  .then(updated => res.json(updated))
  .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, (err, res) => {console.log(`Server running on port ${PORT}`)
})