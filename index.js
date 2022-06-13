const calendarFile = "./calendar.txt";
const parser = require("./calendarParser.js");

parser.parseFile(calendarFile).then(() => {
  console.log(
    parser.getInfoAsHumanReadable(parser.createJstToday()),
    parser.getInfoAsHumanReadable(parser.createJst("2022/06/17")),
  );
});
