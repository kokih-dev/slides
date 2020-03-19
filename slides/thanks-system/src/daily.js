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
