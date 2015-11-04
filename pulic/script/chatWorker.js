/*importScripts('/script/extends/jquery.min.js');
importScripts('/socket.io/socket.io.js');*/
var socket=io();
var Self=self;
Self.onmessage=function(event){
	var data=event.data;
	console.log(data);
}
