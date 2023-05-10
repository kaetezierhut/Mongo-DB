const joi = require('joi')

const path = require('path')
const fs = require('fs')

const cors = require('cors')

const express = require('express')

const app = express()

app.use(cors())

app.use(express.urlencoded({ extended: false }))

app.use('/uploads', express.static('./uploads'))

app.use((req, res, next) => {

    res.cc = function(err, status = 1) {
        res.send({
            status,
            message: err instanceof Error ? err.message : err,
        })
    }
    next()
})
/*
app.put('/User/:id', async function(req, res) {
  let user;
  try {
    user = await User.findOneAndUpdate({ _id: req.params.id }, req.body);
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
  return res.json({ user });
});
*/
//--------------------
const Datahandle = require('./router/datahandle') //datahandle is datahandle.js
app.use('/api', Datahandle)

//error handling
//
app.use((err, req, res, next) => {
    res.cc(err)
})
/*
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})
*/


// https.createServer(options, app).listen(3007);
app.listen(3007, () => {
    console.log('api server running at http://127.0.0.1:8080/embedDemo/SensorWeb/Web/templates/SensorWeb.html')
})