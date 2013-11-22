/**
 * Application Properties
 */
var nodeJMSCfg =
{
	scheduleHour: 10,
	scheduleMin: 30,
	mongoURL: 'mongodb://demo_user:demo_password@68.98.137.81:27017/subscription',
	wlURL: 't3://68.98.137.81:7171',
    wlUser: 'weblogic',
    wlPassword: 'qXr7#323',
	jmsQueue: 'jms.das.ComponentInboundDistributedQueue'
};

module.exports = nodeJMSCfg;
