//importScripts('./extends/jquery.min.js');
//importScripts('/socket.io/socket.io.js');
//var socket=io();
var Self=self;
var temp={};
//var $temp=$(temp);
Self.onmessage=function(event){
	var data=event.data;
	console.log(data);
}
