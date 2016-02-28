var dualShock = require('dualshock-controller');
var sphero = require("sphero")
var orb = sphero("fe:b2:87:2b:cb:42");

var controller = dualShock(
    {
        config : "dualShock4",
        accelerometerSmoothing : true,
        analogStickSmoothing : true
    });
controller.connect();

var lastAng = 0;
var boost = 0;

controller.on('error', function(data) {
  console.log(data);
});

orb.connect(function() {
  console.log("Sphero connected")
  controller.on('left:move', function(data) {
    var ang = getAngle(data);
    var speed = getSpeed(data);

    if(speed == 0 && ang == 179) {
      orb.roll(speed, lastAng);
    }
    else {
      if(boost == 1) {
        speed = 255;
      }
      lastAng = ang;
      orb.roll(speed, ang);
    }
  });

  controller.on('right:move', function(data) {
    var ang = getAngle(data);
    var speed = getSpeed(data);

    if(speed == 0 && ang == 179) {
      orb.setBackLed(0);
      setTimeout(function() {
        orb.setHeading(0, function() {
          orb.roll(0, 0);
        });
      }, 300);
    }
    else {
      lastAng = ang;
      orb.setBackLed(255);
      orb.roll(0, ang);
    }
  });

  controller.on('x:press', function(data) {
      orb.color("blue");
  });

  controller.on('square:press', function(data) {
      orb.color("pink");
  });

  controller.on('circle:press', function(data) {
      orb.color("red");
  });

  controller.on('triangle:press', function(data) {
      orb.color("green");
  });

  controller.on('r1:press', function(data) {
      orb.setBackLed(255);
  });

  controller.on('r1:release', function(data) {
      orb.setBackLed(0);
  });

  controller.on('l1:press', function(data) {
      boost = 1;
  });

  controller.on('l1:release', function(data) {
      boost = 0;
  });

  controller.on('r2Analog:move', function(data) {
    orb.setRawMotors({
       lmode: 0x01,
       lpower: data.x,
       rmode: 0x02,
       rpower: data.x
    });
  });

  controller.on('l2Analog:move', function(data) {
    orb.setRawMotors({
       lmode: 0x02,
       lpower: data.x,
       rmode: 0x01,
       rpower: data.x
    });
  });
});

function getAngle(data) {
  return Math.atan2((256 - data.x) - 128, data.y - 128) * (179.0 / Math.PI) + 179;
}

function getSpeed(data) {
  return Math.sqrt(Math.pow(128 - data.x, 2) + Math.pow(128 - data.y, 2)) * (255/179);
}
