var max_rotations = Infinity;
var min_rotations = -1 * Infinity;
var rad = 0;
var previous_rad = 0;
var previous_rotations = 0;
let knob_num = 0; // 0 is all locked
const DIAL_UNLOCKED = "Lock In";
const DIAL_LOCKED = "Unlock";
let dial_states = [DIAL_LOCKED, DIAL_LOCKED, DIAL_LOCKED];
let curr_speed = 0;
let speeds = [0,0,0];

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

  if (Math.round(speed * 0.30) === 0) {
    return 0;
  } else {
    return Math.round(speed * 0.30);
  }
}

function set_rotations(rotations) {
  if (!knob_num) {
    return;
  }
  curr_speed = Math.round(Math.abs(rotations_to_speed(rotations)));
  let dialDiv = document.getElementById('foobar'+ knob_num);

  dialDiv.getElementsByClassName('knob_number')[0].textContent = curr_speed;
  dialDiv.getElementsByClassName('knob_gfx')[0].style.transform = 'rotate(' + (rotations * 360) + 'deg)';
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

function updateRotation(boxData) {
  let accelDict = { 'accX': 0.0, 'accY': 0.0, 'accZ': 0.0 };
  // on tilt puzzle
  const accelArray = boxData.split(" ").map(parseFloat);
  
  accelDict['accX'] = accelArray[0];
  accelDict['accY'] = accelArray[1];
  accelDict['accZ'] = accelArray[2];

  // console.log('y=' + accelDict['accY']);
  dial_rotate(accelDict['accY']);
}

function toggleDialLock(buttonElement, dialNum) {
  let state = buttonElement.value;
  if (state === DIAL_UNLOCKED) {
    // if dial is unlocked
    buttonElement.value = DIAL_LOCKED;
    dial_states[dialNum-1] = DIAL_LOCKED;
    speeds[knob_num-1] = curr_speed;
  } else {
    // if dial is locked
    knob_num = dialNum;
    buttonElement.value = DIAL_UNLOCKED;
    // lock the other dials
    dial_states.forEach((dstate, index) => {
      if (index == dialNum-1) {
        dial_states[index] = DIAL_UNLOCKED;
      } else {
        document.getElementById('dial' + (index+1) + '-btn').value = DIAL_LOCKED;
        dial_states[index] = DIAL_LOCKED;
      }
    });
  }

  if(dial_states.every(dstate => dstate === DIAL_LOCKED)) {
    knob_num = 0;
    if (evaluateDials()) {
      setDialsComplete();
    }
  }
}

function setDialsComplete() {
  // slide(-1);
  // setTimeout(() => {
  //     slide(1, 2);
  // }, 1000);
  // hide dials and show image, don't slide
  document.getElementById("dials-div").style.display = "none";
  document.getElementById("behind-dials-div").style.display = "flex";
  puzzle_complete();
}

function evaluateDials() {
  return JSON.stringify(code) === JSON.stringify(speeds);
}

function createDials() {
  const firstDialDiv = document.getElementById("dial-div1");
  const secondDialDiv = document.getElementById("dial-div2");
  const thirdDialDiv = document.getElementById("dial-div3");
  firstDialDiv.appendChild(createDialSvg(1));
  secondDialDiv.appendChild(createDialSvg(2));
  thirdDialDiv.appendChild(createDialSvg(3));
  set_dial_speed(1);
}

function createDialSvg(idNumber) {
  // Create SVG element
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '-6 -6 12 12');
  svg.classList.add('dial');
  svg.id = 'foobar'+idNumber;

  // Create <defs> and gradient
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  const radialGradient = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient');

  const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
  stop1.setAttribute('offset', '0');
  stop1.setAttribute('stop-color', 'gray');

  const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
  stop2.setAttribute('offset', '1');
  stop2.setAttribute('stop-color', 'silver');

  radialGradient.appendChild(stop1);
  radialGradient.appendChild(stop2);
  defs.appendChild(radialGradient);
  svg.appendChild(defs);

  // Create g.knob group
  const gKnob = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  gKnob.classList.add('knob');

  // Center circle
  const centerCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  centerCircle.classList.add('knob_center');
  centerCircle.setAttribute('cx', '0');
  centerCircle.setAttribute('cy', '0');
  centerCircle.setAttribute('r', '0.015625');
  gKnob.appendChild(centerCircle);

  // Create knob_gfx group
  const knobGfx = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  knobGfx.classList.add('knob_gfx');

  const outerCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  outerCircle.setAttribute('cx', '0');
  outerCircle.setAttribute('cy', '0');
  outerCircle.setAttribute('r', '5');

  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.setAttribute('x1', '0');
  line.setAttribute('y1', '-2.5');
  line.setAttribute('x2', '0');
  line.setAttribute('y2', '-4.5');

  knobGfx.appendChild(outerCircle);
  knobGfx.appendChild(line);
  gKnob.appendChild(knobGfx);

  // Text element
  const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  text.classList.add('knob_number');
  gKnob.appendChild(text);

  // Append gKnob to SVG
  svg.appendChild(gKnob);

  return svg;
}