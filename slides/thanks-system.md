class: middle center
# 日々感謝する仕組み作りと、集計自動化

author: koki.h (mail: koki.h.dev *at* gmail)

date: 19.Mar.20

---

# TL;DR / 要約ではなく、背景などの説明

とあるセミナーで「感謝」の話になりました。
※怪しい話・会ではない。

「この24時間で、誰かに感謝した話をしてください」と言われて発表する機会がありました。思った以上に自分が他者への感謝を認識していないことが判明しました。
自分は一般的なレベルで（公私・社内外含め）他者と関わりながら暮らしているはずなのに、「感謝」を認識する機会はあるにも関わらず、そこに意識が向いていないと感じました。

そこで、

- 「24hごとに感謝する」というアクションを習慣化すると、いくつかの効果がありそうだ、と判断した
- 自分はずぼらなので、ずぼらでも習慣化できるように UI を整えた
- 集計するのが面倒くさいので、自動で集計されるようにした

---
layout: true
.center[ ## 「感謝」は、そこまで認識・意識する必要があるのか]

---
まず、モチベーションを整理しておきます。

そもそも、「感謝」を（なんらかのコストを割いてまで）明確化・認識するべきか？

いくつかの状況・関係性について考えてみました。

---
.left-column[
### 仕事関係
]
.right-column[
上司・同僚・後輩との関係について考えました。

人には承認欲求があり、例えば「自分が今何をしているか」を上役が認識・意識しているかどうかには、わりと敏感であったりします。
「こないだのアレ、お疲れ様。どうだった？」の一言で、一気に表情が明るくなったりします。
このように「相手を承認・認知すること」は、実は評価制度の基礎となるのでは…？（もっと前段階として、人間関係の基礎かもしれない）
]
---
.left-column[
### 仕事関係
### 社外
]
.right-column[
社外のお客様や仕入先との関係について考えました。

「感謝」に注目してみると相手について興味を持つきっかけにもなるし、２回目に会う人に「こないだ伺ったxxの件、ありがとうございました。調べてみたんですけど～」なんて流れは、話の入りとしては鉄板。
]
---
.left-column[
### 仕事関係
### 社外
### プライベート
]
.right-column[
プライベートについて考えました。

知り合い～親友・家族まで、関係性は多様にありますが、距離感が縮めば縮むほど改めて感謝を意識しにくいように思えます。
]
---
.left-column[
### 仕事関係
### 社外
### プライベート
### 結論
]
.right-column[
長く書きましたが、結論「めんどくさくないなら、やってもいいんじゃね」
]

---
layout: false
# プレ設計
実装を考え始める前に、大方針を決めておきます。

---
## 実行の方針
実行方法は多数・多種ありそうですが、特に以下の観点で方法を考えました。

- 実行コストは安いほうがよい
  - めんどくさくないこと
  - 実施タイミングが明確であること

例えば「手帳の日付ページの端に書く」でも目的は達成されるのだが、コストが高くて得意の『三日坊主』を発動する可能性が高い。

- 書くのが面倒くさい => 書かなくなる
- 集計するのが面倒くさい => 集計しなくなる

---
## 解決案

人的なルールは 2 つだけに絞る。

1. 会社からの帰宅時、車を駐車場に止めたら、入力する
  - 入力はスマホで、必要時間 1 分以内
2. その流れで、集計結果を確認する

他はシステム側で対応する。

- 入力画面は選択式をメインにし、自由記述を(基本的に)なくす
- 集計は自動
- 集計結果の通知は、Webページを見るだけ

---
# 設計
## システム全体像

使用するサービスは、以下の通りです。

|サービス名|用途|
|:--|:--|
|[Google アカウント](https://accounts.google.com/signup)||
|[Google Forms](https://docs.google.com/forms)|「感謝」の入力に使用。|
|[iPhone の Google アプリ](https://apps.apple.com/jp/app/google-%E3%82%A2%E3%83%97%E3%83%AA/id284815942)|Google Forms からの入力に利用|
|[Google Sheet](https://docs.google.com/spreadsheets)|データ格納先|
|[Google App Script(GAS)](https://developers.google.com/apps-script)|集計処理の実行部|
|[Google データポータル](https://datastudio.google.com/)|データ表示（グラフ等）|

---
## 使用の流れ/ユースケース

- 入力する
- 参照する

---
.left-column[
## 使用の流れ
### 入力する
]
.right-column[
+ 退勤後、駐車場に車を止めたら、携帯で Google Forms を開く (Googleアプリから一発で開けるようにしておく)
+ 「日付」は入力可能だが、入力不要 (登録ボタンを押した日が記録されるようにする)
+ 「感謝対象」を選択 (名前を事前登録済み。複数可。未登録だった場合は、「その他」に入れておいて、後で追加登録する)
+ 「感謝度」を選択（1～5まで。深く考えないために、5段階程度にしました。プラスのみ）
+ 備考（特に記載したいことがあれば。後から振り返るのであれば、メモは合ったほうが良さそう）
+ 登録ボタンを押下
]
---
.left-column[
## 使用の流れ
### 入力する
### 参照する
]
.right-column[

+ Google データポータルを開く
+ 更新ボタンを押す
+ 参照する
]

---
.left-column[
## 使用の流れ
### 入力する
### 参照する
### 自動処理
]
.right-column[
### 集計
- データ登録時に、集計スクリプトを自動実行
  - スプレッドシート更新にトリガを仕掛けて、GAS 実行
]

---
# 構築

ここから、構築していきます。

---
## 構築するもの

- Google アカウント .red[*]
- Google Forms
- Google Sheet
- Google Apps script
- Google Data Portal

.footnote[.red[*] 事前にご用意下さい]

---
.left-column[
## Google Forms
]
.right-column[
データを入力するための画面を作ります。
]

---
.left-column[
## Google Forms
- 日付
]
.right-column[
- 日付欄を作成します。入力は省略可とします
  - 「必須」にしない
- <img src="https://kokih-dev.github.io/slides/slides/thanks-system/images/Google Forms/クリップボード05_GoogleForm_1 日付.png" width="60%">
]

---
.left-column[
## Google Forms
- 日付 .red[完成!]
- 感謝度
]
.right-column[
- 感謝度
  - 感謝度の入力欄を作成します
  - 入力は「必須」です
  - 値の範囲は、1 から 5 とします
  - 1 と 5 の値の説明を入力できるので、それぞれ「助かった」「命の恩人」にしておきます
- <img src="https://kokih-dev.github.io/slides/slides/thanks-system/images/Google Forms/クリップボード06_GoogleForm_2 感謝度.png" width="60%">
]

---
.left-column[
## Google Forms
- 日付 .red[完成!]
- 感謝度 .red[完成!]
- 対象
]
.right-column[
- 感謝対象を登録しておきます
  - 入力は「必須」です
  - 複数選択可能なチェックボックスにします
  - 「その他」を有りにしておきます
- <img src="https://kokih-dev.github.io/slides/slides/thanks-system/images/Google Forms/クリップボード07_GoogleForm_3 対象.png" width="60%">
]

---
.left-column[
## Google Forms
- 日付 .red[完成!]
- 感謝度 .red[完成!]
- 対象 .red[完成!]
- 備考
]
.right-column[
- 備考欄を作成します
  - 入力は必須ではありません
- <img src="https://kokih-dev.github.io/slides/slides/thanks-system/images/Google Forms/クリップボード08_GoogleForm_4 備考.png" width="60%">

]
---
.left-column[
## Google Forms
- 日付 .red[完成!]
- 感謝度 .red[完成!]
- 対象 .red[完成!]
- 備考 .red[完成!]
]
.right-column[
- これで、Google Forms は完成です
]

---
.left-column[
## Google Sheet
- データ保存先
]
.right-column[
- データの保存先を作成します。
  - ここでは「新規スプレッドシートを作成」しました。
- <img src="https://kokih-dev.github.io/slides/slides/thanks-system/images/Google Forms/クリップボード10_GoogleForm_回答 入力先作成.png" width="60%">
]

---
.left-column[
## Google Sheet
- データ保存先 .red[完成!]
- 集計用シート
]
.right-column[
- Google Forms のデータ入力先として作成したスプレッドシートに、集計用・処理用のシートを追加します。
  - 入力先になる「フォームの回答１」は自動的に作成されるのでそのままにします。
  - 集計処理したデータを格納するシート「DATA1」「DATA2」を作ります。
  - 感謝対象となる人名のリストを格納するシート「対象リスト」を作ります。
     - 「対象リスト」内には、人名のリストを格納しておきます。
- <img src="https://kokih-dev.github.io/slides/slides/thanks-system/images/Google Sheet/クリップボード_作成するシート.png" width="60%">

]
---
.left-column[
## Google Sheet
- データ保存先 .red[完成!]
- 集計用シート .red[完成!]
]
.right-column[
- 以上で、Google Sheet が完成しました。
]

---
.left-column[
## Google App Script
- スクリプト作成
]
.right-column[
- データ入力先のシートから、スクリプト編集画面を開きます。
  - 「ツール」「スクリプトエディタ」を選択します
- <img src="https://kokih-dev.github.io/slides/slides/thanks-system/images/GoogleAppScript/クリップボード11_GoogleSpreadSheet_回答データ先.png" width="60%">
]

---
.left-column[
## Google App Script
- スクリプト作成
]
.right-column[
- スクリプト編集画面が開きましたら、集計処理スクリプトを作ります。

- <img src="https://kokih-dev.github.io/slides/slides/thanks-system/images/GoogleAppScript/クリップボード12_GoogleAppScript_データ集計スクリプト.png" width="60%">
]

---
.left-column[
## Google App Script
- スクリプト作成
]
.right-column[
- スクリプトは [ソースコード](slides/thanks-system/src/daily.js) を参照下さい
  - 定期的に呼び出される関数 doDaily() と、集計関数 make_DATA1、make_DATA2 が主な内容です。

```Javascript:daily.gs
// Google App Scripts
//
// 感謝システムのバックエンド側処理スクリプト
//
// "runtimeVersion": "V8"
//

// ####################
// 定数
// ####################

// データSpreadSheet 内の、列情報
const COL_TIMESTAMP = 1 // 自動入力されるタイムスタンプ
const COL_TIME = 2 // 入力される年月日
const COL_VALUE = 3 // 値
const COL_TARGETS = 4 // 対象
const COL_MEMO = 5 // 備考メモ

// 各データが格納されているシート名
const SS_FORM = 'フォームの回答 1'
const SS_DATA1 = 'DATA1'
const SS_DATA2 = 'DATA2'
const SS_LIST = '対象リスト'

// ####################
// SpreadSheet 起動時の処理
// ####################
// 
// SpreadSheet に "処理メニュー" というメニュー項目を追加。デバッグ用
//
function onOpen() {
  var ssAS = SpreadsheetApp.getActiveSpreadsheet();
  ssAS.addMenu("デバッグ",
               [
                 {name: "毎日の処理", functionName: "doDaily"},
                 {name: "1_時刻修正", functionName: "debug_correctTime"} 
               ]);
}

// ####################
// 毎日実行される関数
// ####################
function doDaily(){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ss_form  = ss.getSheetByName(SS_FORM);
  var ss_data1 = ss.getSheetByName(SS_DATA1);
  var ss_data2 = ss.getSheetByName(SS_DATA2);
  var ss_list = ss.getSheetByName(SS_LIST);
 
  // 自動タイムスタンプから日付データを作成
  pre_correctTime(ss_form);
  
  // DATA1作成: 複数対象が選択されている元データから、一行１対象のデータに分割
  pre_makeDATA1(ss_form, ss_data1);
  
  // DATA2作成: 感謝度合い分布データを作成
  pre_makeDATA2(ss_data1, ss_data2, ss_list);  
}

// ####################
// 前処理: 時刻データ修正
function pre_correctTime(ss_form){
  // 現在開いているスプレッドシートを取得
  var lastRow = ss_form.getLastRow();
  
  for (i = 2; i <= lastRow; i++) {
    var time_stamp = ss_form.getRange(i, COL_TIMESTAMP).getValue();
    var time_input = ss_form.getRange(i, COL_TIME).getValue();
    
    if(time_input == ""){
      ss_form.getRange(i, COL_TIME).setValue(time_stamp);
    }
  }
}

function debug_correctTime(){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ss_form  = ss.getSheetByName(SS_FORM); 
  // 自動タイムスタンプから日付データを作成
  pre_correctTime(ss_form);
}

// ####################
// データ１作成
function pre_makeDATA1(ss_form, ss_data){
  // データ格納先をクリア
  ss_data.clear();
  
  var sd_lastColumn = ss_form.getLastColumn(); // データの最終列
  var sd_lastRow = ss_form.getLastRow(); // データの最終行
  
  // キャプション行を記載
  ss_data.getRange(1, COL_TIME).setValue("年月日");
  ss_data.getRange(1, COL_VALUE).setValue("度合い");
  ss_data.getRange(1, COL_TARGETS).setValue("対象");
  ss_data.getRange(1, COL_MEMO).setValue("備考");
  
  // データをなめる
  var index_output_row = 2;
  for (i = 2; i <= sd_lastRow; i++) {
    var val_time = ss_form.getRange(i, COL_TIME).getValue(); // 日時
    var val_value = ss_form.getRange(i, COL_VALUE).getValue(); // 値
    var val_names = ss_form.getRange(i, COL_TARGETS).getValue(); // 対象
    var val_memo = ss_form.getRange(i, COL_MEMO).getValue(); // メモ
    
    // 名前分割
    var splitArr = val_names.split(",")
    for (k = 0; k < splitArr.length; k++){
      var targetName = _trimString(splitArr[k]);
      
      ss_data.getRange(index_output_row, COL_TIME).setValue(val_time);
      ss_data.getRange(index_output_row, COL_VALUE).setValue(val_value);
      ss_data.getRange(index_output_row, COL_TARGETS).setValue(targetName);
      ss_data.getRange(index_output_row, COL_MEMO).setValue(val_memo);
      
      index_output_row++;
    }
  }
  
  // 日時でソート
  ss_data.getRange(2, 1, index_output_row, COL_MEMO).sort(COL_TIME);
}

// ####################
// データ２作成
function pre_makeDATA2(ss_data1, ss_data2, ss_list){
  ss_data2.clear();
  
  // キャプション行を記載
  ss_data2.getRange(1, 1).setValue("名前");
  ss_data2.getRange(1, 2).setValue("値合計");
  ss_data2.getRange(1, 3).setValue("回数合計");
  ss_data2.getRange(1, 4).setValue("回数1");
  ss_data2.getRange(1, 5).setValue("回数2");
  ss_data2.getRange(1, 6).setValue("回数3");
  ss_data2.getRange(1, 7).setValue("回数4");
  ss_data2.getRange(1, 8).setValue("回数5");

  // 集計データを格納する配列
  // {"john due":
  //    sum: 15,
  //    count: 5,
  //    num[1]: 0 
  //    num[2]: 1
  //    num[3]: 3
  //    num[4]: 1
  //    num[5]: 0
  // }
  var outputArr = {};
  
  // outputArr を初期化する
  for(i = 1; i <= ss_list.getLastRow(); i++){
    // ここに名前が入る。名前を連想配列のキーとして扱う
    var outputKey = _trimString(ss_list.getRange(i, 1).getValue());
    if(outputArr[outputKey] == null){
      outputArr[outputKey] = {"name": outputKey, "sum": 0, "values": [], "num": {"1":0,"2":0,"3":0,"4":0,"5":0,}};
    }
  }
  
  // DATA1 を行ごとになめていき、outputArr を作成する
  var sd_lastRow = ss_data1.getLastRow(); // データの最終行
  for (i = 2; i <= sd_lastRow; i++) {
    var val_value = ss_data1.getRange(i, COL_VALUE).getValue(); // 値
    var val_name = ss_data1.getRange(i, COL_TARGETS).getValue(); // 対象
    var val_memo = ss_data1.getRange(i, COL_MEMO).getValue(); // メモ
    
    var outputKey = _trimString(val_name); // ここに名前が入る。名前を連想配列のキーとして扱う
    if(outputArr[outputKey] == null){
      outputArr[outputKey] = {"name": outputKey, "sum": 0, "values": [], "num": {"1":0,"2":0,"3":0,"4":0,"5":0,}};
    }
    outputArr = _put_data(outputArr, outputKey, val_value);
  }
  
  // DATA2 へ出力していく
  var index_row = 2;
  Object.keys(outputArr).forEach(function(key) {
    var val = this[key]; // this は outputArr

    ss_data2.getRange(index_row, 1).setValue(val["name"]);
    ss_data2.getRange(index_row, 2).setValue(val["sum"]);
    ss_data2.getRange(index_row, 3).setValue(val["values"].length);
    ss_data2.getRange(index_row, 4).setValue(val["num"]["1"]);
    ss_data2.getRange(index_row, 5).setValue(val["num"]["2"]);
    ss_data2.getRange(index_row, 6).setValue(val["num"]["3"]);
    ss_data2.getRange(index_row, 7).setValue(val["num"]["4"]);
    ss_data2.getRange(index_row, 8).setValue(val["num"]["5"]);
    
    index_row++;
  }, outputArr);
  
}

// ####################
// サブルーチン: データセット作成
function _put_data(outputArr, outputKey, val_value){
  outputArr[outputKey]["name"] = outputKey;
  outputArr[outputKey]["sum"] = outputArr[outputKey]["sum"] + val_value;
  outputArr[outputKey]["values"].push(val_value);
  outputArr[outputKey]["num"][val_value] += 1;
  return outputArr;
}

// ####################
// サブルーチン: 文字列の前後から空白を削除
function _trimString(src){
  if (src == null || src == undefined){
    return "";
  }
  return src.replace(/(^\s+)|(\s+$)/g, "");
}


```
]

---
.left-column[
## Google App Script
- スクリプト作成 .red[完成!]
- 自動実行設定
]
.right-column[
- 定期的に実行する設定を行います。
- スクリプト編集画面で、メニューから「編集」「現在のプロジェクトのトリガー」を選択します。

- <img src="https://kokih-dev.github.io/slides/slides/thanks-system/images/GoogleAppScript/クリップボード35_現在のプロジェクトのトリガー.png" width="60%">
]

---
.left-column[
## Google App Script
- スクリプト作成 .red[完成!]
- 自動実行設定
]
.right-column[
- 「トリガーを追加」を押下します。
- <img src="https://kokih-dev.github.io/slides/slides/thanks-system/images/GoogleAppScript/クリップボード36_トリガーを追加.png" width="60%">

]

---
.left-column[
## Google App Script
- スクリプト作成 .red[完成!]
- 自動実行設定
]
.right-column[
- トリガーの登録画面が開きます。
- 実行する関数に「doDaily」を選択します。
  - イベントのソースは「スプレッドシート」にします。
  - イベントの種類を「フォーム送信時」にします。
- この設定により、Google Forms の入力完了でスプレッドシートの内容が更新されると、関数 doDaily が実行されるようになります。
- <img src="https://kokih-dev.github.io/slides/slides/thanks-system/images/GoogleAppScript/クリップボード37_起動設定.png" height="50%">

]

---
.left-column[
## Google App Script
- スクリプト作成 .red[完成!]
- 自動実行設定 .red[完成!]
]
.right-column[
- これで、Google App Script も完成です。
]

---
.left-column[
## Google Data Portal
]
.right-column[
- 集計結果を見るためのダッシュボードを作ります。
  - [レポートサンプルはこちら](https://datastudio.google.com/reporting/7be71e00-f388-4c5e-b32f-979d6245b3ef)

- 作成イメージ
  - <img src="https://kokih-dev.github.io/slides/slides/thanks-system/images/データポータル/2020-03-19 10.32.19_300_.png" width="60%">

]

---
.left-column[
## Google Data Portal
- 新しいレポート作成
]
.right-column[
- [Google データポータル](https://datastudio.google.com/) を開きます。

- 「空のレポート」を押下して、新しいレポートを作成します。
  - <img src="https://kokih-dev.github.io/slides/slides/thanks-system/images/データポータル/クリップボード31_Googleデータポータル.png" width="60%">

]

---
.left-column[
## Google Data Portal
  - 新しいレポート作成 .red[完成!]
  - ツリーマップの配置
]
.right-column[
- 新しいレポートに、表示を追加してレポートを構築します。
  - 例として、ツリーマップを配置してみます。

]

---
.left-column[
## Google Data Portal
  - 新しいレポート作成 .red[完成!]
  - ツリーマップの配置
]
.right-column[
- メニューから「グラフの追加」「ツリーマップ」を選択します。
- <img src="https://kokih-dev.github.io/slides/slides/thanks-system/images/データポータル/クリップボード03.png" height="60%">

]

---
.left-column[
## Google Data Portal
  - 新しいレポート作成 .red[完成!]
  - ツリーマップの配置
]
.right-column[
- レポートに配置した後、設定を画像のように変更します。
- <img src="https://kokih-dev.github.io/slides/slides/thanks-system/images/データポータル/クリップボード02.png" width="60%">
]

---
.left-column[
## Google Data Portal
  - 新しいレポート作成 .red[完成!]
  - ツリーマップの配置
]
.right-column[
    - 「ディメンジョン」を「名前」に変更
    - 「指標」に参照したいデータを選択。ここでは「合計値」など。
]
---
.left-column[
## Google Data Portal
  - 新しいレポート作成 .red[完成!]
  - ツリーマップの配置 .red[完成!]
]
.right-column[
- 自動的に、各列内で高い値の色が濃く表示されます。
- <img src="https://kokih-dev.github.io/slides/slides/thanks-system/images/データポータル/クリップボード01.png" width="60%">
]

---
.left-column[
## Google Data Portal
  - 新しいレポート作成 .red[完成!]
  - ツリーマップの配置 .red[完成!]
  - ご自由に...
]
.right-column[
- 必要な表やグラフを追加して、レポートを完成させてください。
]

---
.left-column[
## 構築完了
- Google Forms       .red[完成!]
- Google Sheet       .red[完成!]
- Google Apps script .red[完成!]
- Google Data Portal .red[完成!]
]
.right-column[
すべての構築が完了しました。
]

---
# やらないこと
構築中、いくつかアイデアが浮かびましたが、排除しました。
供養のため、アイデアとその理由をまとめておきます。

---
## 「感謝度」にマイナスを選べるようにする
- アイデア
  - 「評価」情報として、情報蓄積や、上司から部下へのコメント・フィードバックに使えそう
- デメリット
  - 登録時に感謝とは逆方向の感情が混ざってきて、「感謝」ではなく「愚痴・説教」になりがち
  - 「評価」なら真面目に、かつ、客観的な基準に基づいて実施しないといけない

---
## 「感謝度」を複数項目に分ける
- アイデア
  - 同じ感謝でもカテゴリが色々あるので、それぞれ入力できるようにしてみるのはどうか
- デメリット
  - 入力項目が増える（めんどくさい）
  - 感謝の「内容」を分析・分解して入力する必要が生じるが、入力時にそこまで考えたくない

---
# 結果分析:結果をどう見るか

基本、ポジティブな結果として分析することが重要です。
ポジティブ情報しか入力しておらずネガティブ情報は入力していないので、裏や逆に読んでネガティブに捉えるのはやめましょう。

|相手|考察|次のAction|
|:--|:--|:--|
|「感謝が多い」|素直に頼っている相手|さらに感謝しつつ、負担をかけ過ぎていないかに注意|
|「感謝が少ない」|自分が関わりきれていないか、知れていない相手|積極的に雑談しに行く|

---
# まとめ

- 今回は、日々の感謝を登録するシステムを構築しました。
  - 基本的な重要なコンセプトは、「入力らくちん」「直感」「ポジティブ」

## 気づき

### 「感謝が少ない相手」には、話しかけに行く
「感謝が少ない相手」に関する気付きは、目から鱗でした。
感謝できる範囲は濃厚接触するような範囲に限られがちということなので、ちょこちょこと話しかけに行くように心がけています。

### 「感謝が多い相手」には、過剰に甘えたり依存しないように気をつける
同じ内容での感謝が多い相手には、甘えているかもしれないと思いました。

---
## 今後の展望
(実施機会があるかは不明…）

集計結果の解析は、色々な余地があると思っています。

- 感謝数・量が「"比較的" 多い/少ない」人についてはどう考えるべき？
  - 解析対象モデルとして「多い人」「少ない人」「その他」の3軸で考えたが、それだけでよいのか？
- 感謝の内容が同じ事が続いている場合、頼り過ぎじゃないか？
  - いつもありがとうね、で済ませて良いのか？
  - 属人化や暗黙の業務が隠れていないか？
  - 負担分担や省力化のきっかけにできないか？

---
# 残課題・未実装など
|状態|内容|対応|
|:--|:--|:--|
|仕様|GoogleForms から自動入力されるシートの内容を直接書き換えると、上書きされることがある|GoogleFormsの仕様です。Sheetsの対象のシートは編集しないことと、入力はFormから行うこと。|
|未実装|月次で集計したい||
|未実装|集計データを退避したい||

---
class: middle center
以上、ありがとうございました。

---
# その他、参考にしたページ

- [プログラミングが苦手な方はGASがおススメ](https://tokyopwa.bitbucket.io/slidemake/remarkkokai1.html?slideb=ffffff&slidem=000000&slidet=2&slidef=slide20181010.txt&slideg=a3d5c9de3e69d83c2ef299c28fe53d58#2)


