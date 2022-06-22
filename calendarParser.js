const fs = require("fs");
const readline = require("readline");
const {format} = require('util');
const dayjs = require('dayjs');
const isToday = require('dayjs/plugin/isToday');
const isTomorrow = require('dayjs/plugin/isTomorrow');
dayjs.extend(isToday);
dayjs.extend(isTomorrow);

const calendarTxtParser = {

  file : undefined,
  calendarData : {},

  monthPointer : undefined,
  yearPointer : undefined,
  categoryPointer : undefined,

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
        const days     = this.getDays(line);
        const monthNum = this.monthPointer;
        const yearNum  = this.yearPointer;
        const category = this.categoryPointer;

        for (var i = 0; i < days.length; i++) {
          let dateYmd = dayjs([yearNum, monthNum, days[i]]).format('YYYYMMDD');
          let dateObj = dayjs([yearNum, (monthNum-1), days[i]]);

          this.calendarData[dateYmd] = {
            date: dateYmd,
            dateObj : dateObj,
            category : category,
          };

        }
      }
    }
  },

  getInfoAsHumanReadable : function(d) {
    let dateComment = '';
    if (d.isToday()) {
      dateComment = '今日';
    } else if (d.isTomorrow()) {
      dateComment = '明日';
    } else {
      dateComment = d.format('YYYY年MM月DD日');
    }
    let info = dateComment + 'は%s曜日。%sの日です。ゴミを出すのを忘れずに。';
    let cate = '';
    let dayofweek = this.dayOfWeekJpn[d.day()];
    let dateKey = d.format('YYYYMMDD');

    if (this.isBurnableDay(d)) {
      cate = 'burnable';

    } else if (dateKey in this.calendarData) {
      cate = this.calendarData[dateKey].category;

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
      this.yearPointer = this.reiwaToYear(match[1]);
      return true;
    }
    return false;
  },

  isMonthHeading : function(str) {
    let match = str.match(/^(\d+)月/);
    if (match) {
      this.monthPointer = match[1];
    }
    return match;
  },

  isBurnable : function(str) {
    this.categoryPointer = 'burnable';
    return str.indexOf("可燃ごみ") != -1;
  },

  isPlastice: function(str) {
    this.categoryPointer = 'plastic';
    return str.indexOf("プラ") != -1;
  },

  isNonBurnable : function(str) {
    this.categoryPointer = 'nonburnable';
    return str.indexOf("不燃") != -1;
  },

  isRecyclable : function(str) {
    this.categoryPointer = 'recyclable';
    return str.indexOf("資源") != -1;
  },

  isPaper : function(str) {
    this.categoryPointer = 'paper';
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

  isMonday : function (d) {
    return d.day() == 1;
  },

  isTuesDay : function (d) {
    return d.day() == 2;
  },

  isThursday : function (d) {
    return d.day() == 4;
  },

  //燃えるゴミの日
  isBurnableDay : function (d) {
    return this.isMonday(d) || this.isThursday(d);
  },

};

module.exports = calendarTxtParser;
