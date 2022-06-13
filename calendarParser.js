const fs = require("fs");
const readline = require("readline");
const {format} = require('util')

const calendarTxtParser = {

  file : undefined,
  // calendarData : [],
  calendarData : {},
  currentYear : undefined,
  currentMonth : undefined,
  currentCategory : undefined,

  dayOfWeekJpn : ["日", "月", "火", "水", "木", "金", "土"],

  categoryNames : {
     burnable : '燃えるごみ'
    ,plastic : 'プラ容器'
    ,nonburnable : '燃えないごみ'
    ,recyclable : '資源ごみ(ペットボトル・ビン・カン)'
    ,paper : '紙・段ボールごみ'
  },

  parseFile : async function(fp) {
    const fileStream = fs.createReadStream(fp);
    const rl = readline.createInterface({
      input: fileStream,
    });
    for await (const line of rl) {
      let currentMonth = undefined;
      let passedYearHeading = false;
      let passedMonthHeading = false;

      //年の見出しか
      if (!passedYearHeading && this.isTitle(line)) {
        passedYearHeading = true;
      }
      //月の見出しか
      if (!passedMonthHeading && this.isMonthHeading(line)) {
        passedMonthHeading = true;
      }
      //各ゴミの日
      if (
        this.isPlastice(line) || //プラ容器
        this.isNonBurnable(line) || //不燃
        this.isRecyclable(line) || //資源
        this.isPaper(line) //紙・衣類
      ) {
        const days = this.getDays(line);
        const monthNum = this.getCurrentMonth();
        const yearNum = this.getCurrentYear(monthNum);
        const category = this.getCurrentCategory();

        for (var i = 0; i < days.length; i++) {
          let dateYmd = yearNum + "/" + monthNum + "/" + days[i];
          let dateObj = new Date(yearNum, (monthNum-1), days[i]);
          dateObj.setHours(dateObj.getHours() + 9); //to JST

          this.calendarData[dateYmd] = {
            date: dateYmd,
            dateObj : dateObj,
            category : category,
          };
        }
      }
    }
    // console.log(this.calendarData);
  },

  getInfoAsHumanReadable : function(date) {

    let info = '今日は%s曜日。%sの日です。ゴミを出すのを忘れずに。';
    let cate = '';
    let dayofweek = this.dayOfWeekJpn[date.getDay()];
    let dateStr = this.formatDate(date);

    if (this.isBurnableDay(date)) {
      cate = 'burnable';

    } else if (dateStr in this.calendarData) {
      cate = this.calendarData[dateStr].category;

    } else {
      return '今日はゴミの日ではありません。';

    }
    return format(info, dayofweek, this.getCategoryName(cate));
  },

  reiwaToYear : function(reiwaYearNum) {
    const reiwaStart = 2019;
    return reiwaStart + (reiwaYearNum - 1);
  },

  isTitle : function(str) {
    let match = str.match(/.{2}(\d+)年度.*ごみ収集カレンダー/);
    if (match) {
      this.currentYear = this.reiwaToYear(match[1]);
      return true;
    }
    return false;
  },

  isMonthHeading : function(str) {
    let match = str.match(/^(\d+)月/);
    if (match) {
      this.currentMonth = match[1];
    }
    return match;
  },

  getCurrentYear : function(month) {
    // if (month >= 10) {
    //   return this.currentYear;
    // }
    // return this.currentYear + 1;
    return this.currentYear;
  },

  getCurrentMonth : function() {
    return this.currentMonth;
  },

  getCurrentCategory : function() {
    return this.currentCategory;
  },

  isBurnable : function(str) {
    this.currentCategory = 'burnable';
    return str.indexOf("可燃ごみ") != -1;
  },

  isPlastice: function(str) {
    this.currentCategory = 'plastic';
    return str.indexOf("プラ") != -1;
  },

  isNonBurnable : function(str) {
    this.currentCategory = 'nonburnable';
    return str.indexOf("不燃") != -1;
  },

  isRecyclable : function(str) {
    this.currentCategory = 'recyclable';
    return str.indexOf("資源") != -1;
  },

  isPaper : function(str) {
    this.currentCategory = 'paper';
    return str.indexOf("紙・衣類") != -1;
  },

  getDays : function(str) {
    let matches = str.match(/(\d+)日/g);
    matches = matches.map(function (day) {
      return day.replace('日', '');
    });
    return matches;
  },

  getCategoryName : function (category_) {
    return this.categoryNames[category_];
  },

  isToday : function (date_) {
    const today = this.createJstToday();
    return date_.getDate() == today.getDate() &&
      date_.getMonth() == today.getMonth() &&
      date_.getFullYear() == today.getFullYear()
  },

  isMonday : function (dateObj) {
    return dateObj.getDay() == 1;
  },

  isTuesDay : function (dateObj) {
    return dateObj.getDay() == 2;
  },

  isThursday : function (dateObj) {
    return dateObj.getDay() == 4;
  },

  //燃えるゴミの日
  isBurnableDay : function (dateObj) {
    return this.isMonday(dateObj) || this.isThursday(dateObj);
  },

  formatDate : function (dateObj) {
    const y = dateObj.getFullYear();
    const m = dateObj.getMonth()+1;
    const d = dateObj.getDate();
    // const m = ('00' + (dateObj.getMonth()+1)).slice(-2);
    // const d = ('00' + dateObj.getDate()).slice(-2);
    return (y + '/' + m + '/' + d);
  },

  createJst : function (dateYmd) {
    const dt = new Date(dateYmd);
    dt.setHours(dt.getHours() + 9); //to JST
    return dt;
  },

  createJstToday : function () {
    return todayJst = this.createJst(Date.now());
  },

};

module.exports = calendarTxtParser;
