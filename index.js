'use strict';

var constant = require('./src/constants');
exports.ServiceType = constant.ServiceType;
exports.MessageType = constant.MessageType;
exports.PayloadType = constant.PayloadType;
exports.ResultCode = constant.ResultCode;
exports.RoomType = constant.RoomType;
exports.RequestType = constant.RequestType;

exports.Client = require('./src/client');
