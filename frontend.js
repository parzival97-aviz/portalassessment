//server.js
const express = require('express');
const path = require('path');
const port = process.env.PORT || 8080;
const app = express();
var errorPg = path.join(__dirname, "./landingpage/404.html");
const cors = require('cors')
app.use(cors())

  
console.log(__dirname);
app.get('/', (req, res) => {
    app.use(express.static('landingpage'));
    res.sendFile(__dirname + '/landingpage/index.html');
})

app.get('/portals', (req, res) => {
  app.use(express.static('landingpage'));
  res.sendFile(__dirname + '/landingpage/portals.html');
})

app.get('/customerportal', (req, res) => {
  app.use('/customerportal', express.static('customerportal/frontend/'));
  res.sendFile(__dirname + '/customerportal/frontend/index.html');
})

app.get('/vendorportal', (req, res) => {
  app.use('/vendorportal',express.static('vendorportal/frontend/'));
  res.sendFile(__dirname + '/vendorportal/frontend/index.html');
})

app.get('/employeeportal', (req, res) => {
  app.use('/employeeportal',express.static('employeeportal/frontend/'));
  res.sendFile(__dirname + '/employeeportal/frontend/index.html');
})

app.get('/ehsmportal', (req, res) => {
  app.use('/ehsmportal',express.static('ehsmportal/frontend/'));
  res.sendFile(__dirname + '/ehsmportal/frontend/index.html');
})

app.get('/maintenanceportal', (req, res) => {
  app.use('/maintenanceportal',express.static('maintenanceportal/frontend/'));
  res.sendFile(__dirname + '/maintenanceportal/frontend/index.html');
})

app.get('/shopfloorportal', (req, res) => {
  app.use('/shopfloorportal',express.static('shopfloorportal/frontend/'));
  res.sendFile(__dirname + '/shopfloorportal/frontend/index.html');
})



app.get('/Qualitycheckportal', (req, res) => {
  app.use('/Qualitycheckportal',express.static('Qualitycheckportal/frontend/'));
  res.sendFile(__dirname + '/Qualitycheckportal/frontend/index.html');
})


app.listen(port, () => {
  console.log('Frontend is ready to rock at ' + port);
});
