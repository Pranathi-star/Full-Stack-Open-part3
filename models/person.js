const mongoose = require("mongoose")
mongoose.set("strictQuery", false)

const password = encodeURIComponent(process.env.MONGO_PASSWORD)
const url =   `mongodb+srv://pranathik2001:${password}@cluster0.ptqxg5d.mongodb.net/personApp?retryWrites=true&w=majority`
console.log(url)
mongoose.connect(url)
.then(result => {console.log("Connected to Mongo")})
.catch(err => console.log(err))

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
  })
  
personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})
  
module.exports = mongoose.model("Person", personSchema)
