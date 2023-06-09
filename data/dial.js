function speed_to_rotations(speed) {
  var sign = speed < 0 ? -1 : 1;
  var abs = Math.abs(speed);

  if (abs < 2) {  // 0..2
    return speed;
  } else if (abs < 4) {  // 2..4
    return sign * ((abs - 2) / 2 + 2);
  } else {  // 4..inf
    return sign * ((abs - 4) / 4 + 3);
  }
}

// Inverse of speed_to_rotations.
function rotations_to_speed(rotations) {
  var sign = rotations < 0 ? -1 : 1;
  var abs = Math.abs(rotations);

  if (rotations < 1 && rotations > 0) {  // 0..2
    test = Math.round(100 * abs);
    bob = Math.round(test * 0.39);
    return bob;
  } else if (rotations <= 0) {
    test = Math.round(100 * abs - (Math.ceil(abs) * 100)) * sign;
    bob = Math.round(test * 0.39);
    return bob;
  } else {
    test = Math.round(100 * abs - (Math.floor(abs) * 100));
    bob = Math.round(test * 0.39);
    return bob;
  }
}

var max_rotations = Infinity;
var min_rotations = -1 * Infinity;

function set_rotations(rotations) {
  let cur_speed = Math.round(Math.abs(rotations_to_speed(rotations)));

  foobar.getElementsByClassName('knob_number')[0].textContent = cur_speed;
  foobar.getElementsByClassName('knob_gfx')[0].style.transform = 'rotate(' + (rotations * 360) + 'deg)';
}

function set_speed(speed) {
  set_rotations(speed_to_rotations(speed));
}


var rad = 0;
var previous_rad = 0;
var previous_rotations = 0;

function dial_rotate(angle) {
  console.log("angle", angle);
  if (angle > 30.0) {
    delta = 0.1611
  } else if (angle < -20.0) {
    delta = -0.1611
    delta += Math.PI * 2;
  } else {
    delta = 0;
  }

  rad += delta;
  let old = previous_rad;
  previous_rad = rad;

  console.assert(delta >= -Math.PI && delta <= Math.PI, { delta: delta, rad: rad, old: old });

  let delta_rotation = delta / Math.PI / 2;
  let rotations = previous_rotations + delta_rotation;
  previous_rotations = rotations;
  set_rotations(rotations);
}

function updateRotation(data) {
  //on tilt puzzle
  let accelArray = data.split(" ").map(parseFloat);
  // console.log(accelArray);
  accelDict['accX'] = accelArray[0];
  accelDict['accY'] = accelArray[1];
  accelDict['accZ'] = accelArray[2];

  dial_rotate(accelDict['accX']);
}


set_speed(1);

