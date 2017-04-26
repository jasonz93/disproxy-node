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
    message_queue: process.env.DISPROXY_MESSAGE_QUEUE,
    aliyun_region: process.env.DISPROXY_ALIYUN_REGION,
    aliyun_access_key: process.env.DISPROXY_ALIYUN_ACCESS_KEY,
    aliyun_access_secret: process.env.DISPROXY_ALIYUN_ACCESS_SECRET
});
let opts = instance.getOptions();
mongoose.connect(opts.mongo);
const aliyun = new Aliyun(opts.aliyun_region, opts.aliyun_access_key, opts.aliyun_access_secret);

const server = proxy(http.createServer());

process.on('SIGINT', () => {
    console.log('SIGINT received.');
    server.close(() => {
        process.exit();
    });
});

(async () => {
    if (opts.internal_ip) {
        let ip = opts.internal_ip;
    } else {
        let ip = await instance.getPrivateIp();
    }
    server.listen(3128, () => {
        const mq = ConnectorManager.getMessageQueue(opts.broadcast, (msg) => {

        });
        let port = server.address().port;
        console.log('Your internal ip is', ip, 'or you can set it by environment variables.');
        console.log('Proxy server listening on port %d', port);
        mq.send({
            type: 'PROXY_ONLINE_REQUEST',
            internal_ip: ip
        });
    });
})();