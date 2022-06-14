const express = require('express');
const app = express();
const calendarFile = "./calendar.txt";
const parser = require("./calendarParser.js");

app.get('/garbage', function(req, res){
   parser.parseFile(calendarFile).then(() => {
      res.send({
         success : true,
         status : 200,
         data : parser.getInfoAsHumanReadable(parser.createJstToday()),
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
