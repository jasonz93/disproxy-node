/**
 * Created by zhangsihao on 2017/4/26.
 */
'use strict';
const DisproxyCore = require('disproxy-core');
const http = require('http');
const proxy = require('proxy');
const Instance = require('./libs/instance');
const Aliyun = require('disproxy-core').Aliyun;
const ConnectorManager = new DisproxyCore.ConnectorManager();
const _ = require('lodash');
const mongoose = require('mongoose');
const ProxyModel = DisproxyCore.Models.Proxy.AttachModel(mongoose);

const instance = new Instance({
    ip_prefix: process.env.DISPROXY_IP_PREFIX,
    internal_ip: process.env.DISPROXY_INTERNAL_IP,
    broadcast: process.env.DISPROXY_BROADCAST,
    message_queue: process.env.DISPROXY_MESSAGE_QUEUE
});
let opts = instance.getOptions();

const server = proxy(http.createServer());

let ip;

const mq = ConnectorManager.getMessageQueue(opts.message_queue);
const broadcast = ConnectorManager.getBroadcast(opts.broadcast, (msg) => {
    if (msg.type === 'PROXY_CLOSED' && msg.internal_ip === ip) {
        console.log('Closing server...');
        server.close(() => {
            process.exit();
        });
    }
});

let closeCount = 0;

process.on('SIGINT', () => {
    console.log('SIGINT received.');
    if (++closeCount >= 2) {
        server.close(() => {
            process.exit();
        });
    } else {
        broadcast.broadcast({
            type: 'PROXY_OFFLINE_REQUEST',
            internal_ip: ip
        }).then(() => {
            console.log('Requesting to offline this proxy node.');
        });
    }
});

(async () => {
    if (opts.internal_ip) {
        ip = opts.internal_ip;
    } else {
        ip = await instance.getPrivateIp();
    }
    console.log('Your internal ip is', ip, 'or you can set it by environment variable DISPROXY_INTERNAL_IP.');
    if (!ip) {
        console.error('Cannot start a proxy node without internal ip.');
    }
    server.listen(3128, () => {
        let port = server.address().port;
        console.log('Proxy server listening on port %d', port);
        mq.send({
            type: 'PROXY_ONLINE_REQUEST',
            internal_ip: ip,
            port: port,
            protocol: 'http',
            node_type: 'ALIYUN'
        }).then();
    });
})();