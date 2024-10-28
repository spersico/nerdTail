import yargs from 'yargs';

const options = await yargs(process.argv.slice(2))
  .option('contentType', {
    alias: 'ct',
    choices: ['plaintext', 'json'],
    describe: 'Used to give hints to the server on how to parse the log line',
    default: 'plaintext',
  })
  .help()
  .argv;

const lines = [
  '<script>alert(1)</script>',
  'A                    B                        C',
  '200 GET /1/geocode?address=ny',
  '200 GET /1/config',
  '500 GET /1/users/556605ede9fa35333befa9e6/profile',
  '200 POST /1/signin',
  '200 GET /1/users/556605ede9fa35333befa9e6/profile',
  '200 PUT /1/me/gcm_tokens/duUOo8jRIxq547jAaAHvsF9v',
  '200 PUT /1/me/review_status/seen',
  '301 GET /1/config',
  '200 GET /1/users/555f7494e9fa35333befa9ab/profile',
  '200 POST /1/signin',
  '200 GET /1/users/555f7494e9fa35333befa9ab/profile',
  '400 PUT /1/me/gcm_tokens/3G7ggYFcGXIHkIgaGLW16s4sobrkAPA91bGM8t9MJwfDbFA',
  '200 GET /1/me/notifications',
  '200 GET /1/me/picture',
  '200 GET /1/alive'
];

const jsonLines = [
  '{"type":"liberty_message","host":"HOST","ibm_userDir":"/wlp\/usr\/","ibm_serverName":"defaultServer","message":"CWWKF0011I: The defaultServer server is ready to run a smarter planet. The defaultServer server started in 7.967 seconds.","ibm_threadId":"0000003e","ibm_datetime":"2021-10-18T14:50:58.159-0400","ibm_messageId":"CWWKF0011I","module":"com.ibm.ws.kernel.feature.internal.FeatureManager","loglevel":"AUDIT","ibm_sequence":"1634583058159_0000000000009"}',
  '{"type":"liberty_message2","host":"HOST","ibm_userDir":"/wlp\/usr\/","ibm_serverName":"defaultServer","message":"CWWKF0007I: The application nerdTailSub-frontend has started in 0.394 seconds.","ibm_threadId":"0000003e","ibm_datetime":"2021-10-18T14:50:58.554-0400","ibm_messageId":"CWWKF0007I","module":"com.ibm.ws.kernel.feature.internal.FeatureManager","loglevel":"AUDIT","ibm_sequence":"1634583058554_0000000000009"}',
  '{"type":"liberty_message3","host":"HOST","ibm_userDir":"/wlp\/usr\/","ibm_serverName":"defaultServer","message":"CWWKF0008I: The application nerdTailSub-frontend is ready to serve requests.","ibm_threadId":"0000003e","ibm_datetime":"2021-10-18T14:50:58.555-0400","ibm_messageId":"CWWKF0008I","module":"com.ibm.ws.kernel.feature.internal.FeatureManager","loglevel":"AUDIT","ibm_sequence":"1634583058555_0000000000009"}',
  '{"type":"liberty_message4","host":"HOST","ibm_userDir":"/wlp\/usr\/","ibm_serverName":"defaultServer","message":"CWWKF0012I: The server installed the following features: [appSecurity-3.0, cdi-2.0, distributedMap-1.0, el-3.0, jaxrs-2.1, jaxrsClient-2.1, jaxws-2.2, jca-1.7, jndi-1.0, jpa-2.2, jsp-2.3, localConnector-1.0, managedBeans-1.0, servlet-4.0, ssl-1.0, transportSecurity-1.0, websocket-1.1].","ibm_threadId":"0000003e","ibm_datetime":"2021-10-18T14:50:58.555-0400","ibm_messageId":"CWWKF0012I","module":"com.ibm.ws.kernel.feature.internal.FeatureManager","loglevel":"AUDIT","ibm_sequence":"1634583058556_0000000000009"}',
  '{"type":"liberty_message5a","host":"HOST","ibm_userDir":"/wlp\/usr\/","ibm_serverName":"defaultServer","message":"CWWKF0013I: The server defaultServer is ready to run a smarter planet. The defaultServer server started in 0.000 seconds.","ibm_threadId":"0000003e","ibm_datetime":"2021-10-18T14:50:58.556-0400","ibm_messageId":"CWWKF0013I","module":"com.ibm.ws.kernel.feature.internal.FeatureManager","loglevel":"AUDIT","ibm_sequence":"1634583058556_0000000000009"}',
  '{"type":"liberty_message5","host":"HOST","ibm_userDir":"/wlp\/usr\/","ibm_serverName":"defaultServer","message":"CWWKF0011I: The defaultServer server is ready to run a smarter planet. The defaultServer server started in 0.000 seconds.","ibm_threadId":"0000003e","ibm_datetime":"2021-10-18T14:50:58.557-0400","ibm_messageId":"CWWKF0011I","module":"com.ibm.ws.kernel.feature.internal.FeatureManager","loglevel":"AUDIT","ibm_sequence":"1634583058556_0000000000009"}',
  '{"type":"liberty_message7","host":"HOST","ibm_userDir":"/wlp\/usr\/","ibm_serverName":"defaultServer","message":"CWWKF0007I: The application nerdTail has started in 0.000 seconds.","ibm_threadId":"0000003e","ibm_datetime":"2021-10-18T14:50:58.558-0400","ibm_messageId":"CWWKF0007I","module":"com.ibm.ws.kernel.feature.internal.FeatureManager","loglevel":"AUDIT","ibm_sequence":"1634583058556_0000000000009"}',
  '{"type":"liberty_message6","host":"HOST","ibm_userDir":"/wlp\/usr\/","ibm_serverName":"defaultServer","message":"CWWKF0008I: The application nerdTail is ready to serve requests.","ibm_threadId":"0000003e","ibm_datetime":"2021-10-18T14:50:58.557-0400","ibm_messageId":"CWWKF0008I","module":"com.ibm.ws.kernel.feature.internal.FeatureManager","loglevel":"AUDIT","ibm_sequence":"1634583058557_0000000000009"}',
  '{"type":"liberty_message8","host":"HOST","ibm_userDir":"/wlp\/usr\/","ibm_serverName":"defaultServer","message":"[AUDIT   ] CWWKT0016I: Web application available (default_host): http://HOST:9080/nerdTail/","ibm_threadId":"0000003e","ibm_datetime":"2021-10-18T14:50:58.557-0400","ibm_messageId":"CWWKT0016I","module":"com.ibm.ws.kernel.feature.internal.FeatureManager","loglevel":"AUDIT","ibm_sequence":"1634583058557_0000000000099"}',
  '{"type":"liberty_message9","host":"HOST","ibm_userDir":"/wlp\/usr\/","ibm_serverName":"defaultServer","ibm_datetime":"2021-10-18T14:51:00.555-0400","message":"[AUDIT   ] CWWKZ0058I: Monitoring dropins for applications. ","ibm_threadId":"0000003e","ibm_messageId":"CWWKZ0058I","module":"com.ibm.ws.kernel.feature.internal.FeatureManager","loglevel":"AUDIT","ibm_sequence":"1634583060555_0000000000009"}',
  '{"type":"liberty_message99","host":"HOST","ibm_userDir":"/wlp\/usr\/","ibm_serverName":"defaultServer","ibm_datetime":"2021-10-18T14:51:00.556-0400","message":"[AUDIT   ] CWWKZ0001I: Application nerdTail-frontend started in 0.394 seconds.","ibm_threadId":"0000003e","ibm_messageId":"CWWKZ0001I","module":"com.ibm.ws.kernel.feature.internal.FeatureManager","loglevel":"AUDIT","ibm_sequence":"1634583060556_0000000000009"}',
  '{"type":"liberty_message123","host":"HOST","ibm_userDir":"/wlp\/usr\/","ibm_serverName":"defaultServer","ibm_datetime":"2021-10-18T14:51:00.556-0400","message":"[AUDIT   ] CWWKZ0001I: Application nerdTail started in 0.000 seconds.","ibm_threadId":"0000003e","ibm_messageId":"CWWKZ0001I","module":"com.ibm.ws.kernel.feature.internal.FeatureManager","loglevel":"AUDIT","ibm_sequence":"1634583060556_0000000000010"}',
];




const logsToUse = options.contentType ? jsonLines : lines;


setInterval(() => {
  console.log(logsToUse[Math.floor(Math.random() * logsToUse.length)]);
}, 3000);