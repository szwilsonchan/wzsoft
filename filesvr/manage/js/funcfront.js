function func9957a5e7ebba48c7991bf293de998182(vDate,vAction,vType,vCount){;var dt = gvalnum(vDate);if(vAction=="+"){if(vType=="Day"){dt.setDate(dt.getDate()+gvalnum(vCount));};if(vType=="Month"){dt.setMonth(dt.getMonth()+gvalnum(vCount));};if(vType=="Year"){dt.setYear(dt.getFullYear()+gvalnum(vCount));}};if(vAction=="-"){if(vType=="Day"){dt.setDate(dt.getDate()-gvalnum(vCount));};if(vType=="Month"){dt.setMonth(dt.getMonth()-gvalnum(Count));};if(vType=="Year"){dt.setYear(dt.getFullYear()-gvalnum(Count));}};return dt;;;;
};function func1f0b8925dc8448f8b6e9852faa698521(){;var d=new Date();
return d;;;;
};function func105c6ae2e99b4603811e3641f3d92d33(vDate){ var DateCharString='';;if(vDate instanceof Date)
{
var year = vDate.getFullYear();
var month = vDate.getMonth();
var day = vDate.getDate();
var hours = vDate.getHours();
var min = vDate.getMinutes();
var second = vDate.getSeconds();
if(hours==0&&min==0&&second==0)
{
DateCharString = year + "-" +
((month + 1) > 9 ? (month + 1) : "0" + (month + 1)) + "-" +
(day > 9 ? day : ("0" + day))
}
else
{
DateCharString = year + "-" +
((month + 1) > 9 ? (month + 1) : "0" + (month + 1)) + "-" +
(day > 9 ? day : ("0" + day)) + " " +
(hours > 9 ? hours : ("0" + hours)) + ":" +
(min > 9 ? min : ("0" + min)) + ":" +
(second > 9 ? second : ("0" + second));
}
}
else
{
DateCharString = Date;
}
return DateCharString;;;;
};function funca639236d84714a1a97ab1238b7d7e0f4(vList){;if(Object.prototype.toString.call(vList) === '[object Array]')
{
return vList.length;
}
else if(Object.prototype.toString.call(vList) === '[object String]')
{
var o = JSON.parse(vList);
return o.length;
}
else
{
return vList.size();
}
;;;
};function func8ab373a65c514f5182fcebb030b5ff96(vList,vListIndex){;if(Object.prototype.toString.call(vList) === '[object Array]')
{
vList.splice(vListIndex,1);
return vList;
}
else if(Object.prototype.toString.call(vList) === '[object String]')
{
var o = JSON.parse(vList);
o.splice(vListIndex,1);
return JSON.stringify(o);
}
else
{
vList.remove(vListIndex);
return vList;
};;;
};function func5b2bae7f9b7c4ab1945c2e35627d8c91(vList,vListIndex){;vListIndex=gvalnum(vListIndex);
if(Object.prototype.toString.call(vList) === '[object Array]')
{
return vList[vListIndex];
}
else if(Object.prototype.toString.call(vList) === '[object String]')
{
var o = JSON.parse(vList);
return o[vListIndex];
}
else
{
return vList.get(vListIndex);
};;;
};function funcecaff280bb134b16972ee16ffcaa8346(vChar){;if(Object.prototype.toString.call(vChar)!="[object String]")
{
return vChar;
}
return JSON.parse(vChar);;;;
};function func959c8910b5f24d4bb9c94e72d5f1478a(vJSONObject){;if(Object.prototype.toString.call(vJSONObject)=="[object java.util.ArrayList]")
{
return datalistService.codePubListToStr(vJSONObject);
}
else if(Object.prototype.toString.call(vJSONObject)=="[object java.util.HashMap]")
{
return datalistService.codePubMapToStr(vJSONObject);
}
else if(Object.prototype.toString.call(vJSONObject)=="[object com.alibaba.fastjson.JSONArray]")
{
return datalistService.codePubMapToStr(vJSONObject);
}
else
{return JSON.stringify(vJSONObject);};;;
};function func6e207f5b70144193850bacb97cd71205(Char,Start,End){;Char=Char+'';;;;if(gvalnum(End)==gvalnum('')){return Char.substring(Start);;;;}else{return Char.substring(Start,End);;;;};;
};function funcae57ce38d164429985999115eaeb6624(Char){;Char=Char+'';;;;return Char.length;;;;
};function funcf21c562ddf2d4dc2b4243d91d47d1b23(CharString,Char){;CharString=CharString+'';
Char=Char+'';
return CharString.indexOf(Char);;;;
};function func27c2fedfb8a54d5da1661c3f9e69f039(vNumber){;var n = vNumber.toString();
var i = n.indexOf('.0');
if(i==n.length-2)
{
return n.substring(0,i)
}
else
{
return n;
};;;
};function func7460d824641f4a449ffb3c54d1eeec40(){;var s = [];
var hexDigits = '0123456789abcdef';
for (var i = 0; i < 36; i++) {
s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
}
s[14] = '4';
s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
s[8] = s[13] = s[18] = s[23] = '';
var uuid = s.join('');
return uuid;;;;
};function funcea548495a5b949209287c5ef559ceac5(CharString,SKEY){;CharString=CharString+'';
var t = CharString.split(",");
var r = [];
for(i=0;i<t.length;i++)
{
var o = {};
o[SKEY] = t[i];
r.push(o);
}
return r;;;;
};function func89721ec7ffdc4ee087f0412ef430afb3(PDFID,FileName){;gfileDownload(PDFID,FileName);;;;
};function funca1c744417a9a49f8801c3c7352400899(vObject,vKEY){;delete vObject[vKEY];;;;
};function func08d992f9b0d04eb5a927db49887a865e(FileID,FileName){;gfileDownload(FileID,FileName);;;;
};function func3ead58a900404e7e8de5ee6ec7f27539(vDate,AfterChar,BeforeChar){ var DateCharString='';;if(vDate instanceof Date)
{
var year = vDate.getFullYear();
var month = vDate.getMonth();
var day = vDate.getDate();
var hours = vDate.getHours();
var min = vDate.getMinutes();
var second = vDate.getSeconds();
if(hours==0&&min==0&&second==0)
{
DateCharString = year + "-" +
((month + 1) > 9 ? (month + 1) : "0" + (month + 1)) + "-" +
(day > 9 ? day : ("0" + day))
}
else
{
DateCharString = year + "-" +
((month + 1) > 9 ? (month + 1) : "0" + (month + 1)) + "-" +
(day > 9 ? day : ("0" + day)) + " " +
(hours > 9 ? hours : ("0" + hours)) + ":" +
(min > 9 ? min : ("0" + min)) + ":" +
(second > 9 ? second : ("0" + second));
}
}
else
{
DateCharString = Date;
}
return BeforeChar+DateCharString+AfterChar;;;;
};function funcf659feed943443d89fe36eab1f1129cf(CharString){;CharString=CharString+'';
if(CharString.length>0)
{
return CharString.substring(0,CharString.length-1);
}
else
{
return CharString;
};;;
};function funcffecb5f5d87b43038f3994f7b14cf33f(vDate){;var dt = gvalnum(vDate);
var m=dt.getMonth()+1;
return m+ '.' + dt.getDate();
;;;
};function func138dacee79f240d48487a10eb686d436(Info){;gmodalWinAlert(Info);;;;
};function func4577b1eed9444c99af8bf6fe3fa1d7ce(InputValue){;if(InputValue==null)
{
return '';
}
else
{
return InputValue;
};;;
};