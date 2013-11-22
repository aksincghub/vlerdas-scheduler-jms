//var config = require('config');
var _ = require('underscore');
var schedule = require('node-schedule');
var java = require('java');
var jmsProps = require('./nodeJMSCfg');
java.classpath.push(__dirname + "/" + 'wlfullclient.jar');

//java.classpath.push("C:/dev-vler/dev-tools/Oracle/Middleware/wlserver_10.3/server/lib/wlfullclient.jar");

//var date = new Date(2013, 11, 12, 13, 22, 0);

var j = schedule.scheduleJob({hour: 10, minute: 00, dayOfWeek: 0}, function(){
    console.log('Begin to Read subscriptions!');
    var MongoClient = require('mongodb').MongoClient;
	var mongoURL = jmsProps.mongoURL;
	if(mongoURL == null)
		mongoURL = 'mongodb://demo_user:demo_password@68.98.137.81:27017/subscription';
		
    MongoClient.connect(mongoURL, function(err, db) {

    	console.log("Reading subscriptions database...");
    	
        db.collection('subscription', function(err, collection) {
            collection.find().toArray(function(err, items) {
            	console.log("Sending Messages to Remote Queue...");
                sendJMSMessage(JSON.stringify(items));
                console.log("Done Sending Messages...");
            });
        });

    });  
	console.log('Done');
});


function sendJMSMessage(items) {
	var wlURL = jmsProps.wlURL;
	var wlUser = jmsProps.wlUser;
	var wlPassword = jmsProps.wlPassword;
	var jmsQueue = jmsProps.jmsQueue;
	
	if(wlURL == null )
		wlURL = 't3://68.98.137.81:7171';
	if(wlUser = null)
		wlUser = 'weblogic';
	if(wlPassword == null )
		wlPassword = 'qXr7#323';
	if(jmsQueue == null)
		jmsQueue = 'jms.das.ComponentInboundDistributedQueue';
		
	var props = java.newInstanceSync("java.util.Hashtable");
	props.putSync('java.naming.factory.initial', 'weblogic.jndi.WLInitialContextFactory');
	props.putSync('java.naming.provider.url', wlURL);
	props.putSync('java.naming.security.principal', wlUser);
	props.putSync('java.naming.security.credentials', wlPassword);
	this.ctx = java.newInstanceSync("javax.naming.InitialContext", props);
	this.queueConnFactory = this.ctx.lookupSync('jms.das.DefaultXAConnectionFactory');
	this.queue = this.ctx.lookupSync(jmsQueue);
	var queueConnection = this.queueConnFactory.createQueueConnectionSync();

	var queueSession = queueConnection.createQueueSessionSync(false, 1);
	var queueSender = queueSession.createSenderSync(this.queue);
	var textMessage = queueSession.createTextMessageSync();
	var message = items;
	textMessage.setTextSync(items);
	queueSender.sendSync(textMessage);
	queueSender.closeSync();
	queueSession.closeSync();
	queueConnection.closeSync();
}