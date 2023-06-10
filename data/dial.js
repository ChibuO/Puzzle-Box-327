var max_rotations = Infinity;
var min_rotations = -1 * Infinity;
var rad = 0;
var previous_rad = 0;
var previous_rotations = 0;

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
  var abs_rotations = Math.abs(rotations);
  let speed;

  if (rotations > 0 && rotations < 1) {  // 0..1
    speed = Math.round(100 * abs_rotations);
  } else if (rotations <= 0) {
    speed = Math.round(100 * abs_rotations - (Math.ceil(abs_rotations) * 100)) * sign;
  } else { // rotations > 1
    speed = Math.round(100 * abs_rotations - (Math.floor(abs_rotations) * 100));
  }

  if (Math.round(speed * 0.40) === 0) {
    return 0;
  } else {
    return Math.round(speed * 0.40);
  }
}

function set_rotations(rotations) {
  let cur_speed = Math.round(Math.abs(rotations_to_speed(rotations)));

  foobar1.getElementsByClassName('knob_number')[0].textContent = cur_speed;
  foobar1.getElementsByClassName('knob_gfx')[0].style.transform = 'rotate(' + (rotations * 360) + 'deg)';
}

function set_dial_speed(speed) {
  set_rotations(speed_to_rotations(speed));
}

function dial_rotate(angle) {
  if (angle < -20.0) {
    delta = 0.1611
  } else if (angle > 30.0) {
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

  dial_rotate(accelDict['accY']);
}

