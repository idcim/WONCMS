//数据库处理文件
var settings = require('../settings'),
	Db = require('mongodb').Db,
	Connection = require('mongodb').Connection,
	Server = require('mongodb').Server;
module.exports = new Db(settings.db, new Server(settings.host, settings.port),{safe:true});
