const express = require('express');
const app = express();
const calendarFile = "./calendar.txt";
const parser = require("./calendarParser.js");

app.get('/garbage/today', function(req, res){
   parser.parseFile(calendarFile).then(() => {
      res.send({
         success : true,
         status : 200,
         data : parser.getInfoAsHumanReadable(parser.createJstToday()),
      });
   });
});
app.get('/garbage/tomorrow', function(req, res){
   parser.parseFile(calendarFile).then(() => {
      res.send({
         success : true,
         status : 200,
         data : parser.getInfoAsHumanReadable(parser.createJstTomorrow()),
      });
   });
});
// app.param('day', /^(\d{4})(\d{2})(\d{2})$/);
app.get(/^\/garbage\/(\d{4})(\d{2})(\d{2})$/, function(req, res){
   parser.parseFile(calendarFile).then(() => {
      res.send({
         success : true,
         status : 200,
         data : parser.getInfoAsHumanReadable(parser.createJst(req.params[0] + '/' + req.params[1] + '/' + req.params[2])),
         debug : req.params,
         dateString : req.params[0] + '/' + req.params[1] + '/' + req.params[2],
      });
   });
});
app.use((req, res, next) => {
  res.status(404).send({
   success : false,
   status : 404,
  });
});

app.listen(3000);
