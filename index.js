const SerialPort = require('serialport');
const Spacebrew = require('@spacebrew/client');

var queryTimeout = 0;
var initComs = [];
SerialPort.list().then(p => {
initComs = p;
console.log("starting ports:");
for(port of initComs){
console.log(port.path);
}
queryPort();
});
var sensor;

process.on('SIGINT', function(){
if (sensor){
console.log('closing socket');
sensor.close(() => {
console.log('exiting');
process.exit();
});
} else {
clearTimeout(queryTimeout);
console.log('exiting');
process.exit();
}
});

function queryPort(){
SerialPort.list().then(p => filterPort(p));
}

function filterPort(ports){
var connected = false;
for(port of ports){
var found = false;
for(cached of initComs){
if (port.path == cached.path){
found = true;
break;
}
}
if (!found || port.path.endsWith('HC-06-DevB__')){
sensor = new SerialPort(port.path, {baudRate:115200});
sensor.on('readable', onReadable);
connected = true;
console.log("connected to " + port.path);
break;
}
}
if (!connected){
queryTimeout = setTimeout(queryPort, 1000);
}
}

function onReadable(){
console.log("Data:", sensor.read());
}

