# garbage_notify

群馬県のゴミ収集カレンダーをパースしてjsonで返すapi  
https://www.city.maebashi.gunma.jp/soshiki/kankyo/gomiseisaku/gyomu/2_2/1/16920.html

- カレンダーはプレーンテキストでサーバーサイドに配置する。（時期になったら自分で更新すべし）
- サーバーを走らせたらlocalhost:3000からアクセスを確かめましょう。

## api

`GET /garbage/today` - 今日のゴミ出し情報
`GET /garbage/tomorrow` - 明日のゴミ出し情報
`GET /garbage/[YYYYMMDD]` - YYYY年MM月DD日のゴミ出し情報
