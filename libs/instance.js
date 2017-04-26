/**
 * Created by zhangsihao on 2017/4/26.
 */
const _ = require('lodash');
const os = require('os');

class Instance {
    constructor(options) {
        this.opts = _.defaults(options, {
            ip_prefix: '',
            internal_ip: null,
            broadcast: 'redis://localhost/disproxy_broadcast',
            message_queue: 'redis://localhost/disproxy_mq',
            mongo: 'mongodb://localhost/disproxy',
            aliyun_region: '',
            aliyun_access_key: '',
            aliyun_access_secret: ''
        });
    }

    getOptions() {
        return this.opts;
    }

    async getPrivateIp() {
        let nics = os.networkInterfaces();
        let ips = [];

        for (let nic in nics) {
            if (_.startsWith(nic, 'eth') || _.startsWith(nic, 'en')) {
                nics[nic].forEach((address) => {
                    if (address.family === 'IPv4' && !address.internal && _.startsWith(address.address, this.opts.ip_prefix)) {
                        ips.push(address.address);
                    }
                })
            }
        }

        if (ips.length > 0) {
            return ips[0];
        } else {
            return null;
        }
    }
}

module.exports = Instance;