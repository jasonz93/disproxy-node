/**
 * Created by zhangsihao on 2017/4/26.
 */
const Instance = require('../libs/instance');
const {expect} = require('chai');

describe('Test instance', function () {
    it('Test', function () {
        let instance = new Instance();
        expect(instance.opts.ip_prefix).to.be.equal('');
        expect(instance.opts.broadcast).to.be.equal('redis://localhost/disproxy_broadcast');
        expect(instance.opts.message_queue).to.be.equal('redis://localhost/disproxy_mq');
        expect(instance.opts.mongo).to.be.equal('mongodb://localhost/disproxy');
    })
});