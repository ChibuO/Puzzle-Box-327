var gyroDict = {'gyroX': 0.0, 'gyroY': 0.0, 'gyroZ': 0.0};

function format_number(number) {
    if (Math.round(Math.abs(number) * 10) >= 10 * 10) {
      return number.toFixed(0);
    } else {
      return number.toFixed(1);
    }
  }
  
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
        test = Math. round(100*abs);
        bob = Math. round(test*0.39); 
        return bob;
    } else if (rotations <= 0){
        test = Math. round(100*abs - (Math.ceil(abs)*100))*sign;
        bob = Math. round(test*0.39); 
        return bob;
      } else {
        test = Math. round(100*abs - (Math.floor(abs)*100));
        bob = Math. round(test*0.39); 
        return bob;
      }
      } 

  
  
  var cur_speed = null;
  var cur_rotations = null;
  var max_rotations = Infinity;
  var min_rotations = -1*Infinity;
  
 function set_rotations(rotations) {
    
    cur_rotations = rotations;
    cur_speed = rotations_to_speed(rotations);
    
    foobar.getElementsByClassName('knob_number')[0].textContent = format_number(cur_speed);
    foobar.getElementsByClassName('knob_gfx')[0].style.transform = 'rotate(' + (cur_rotations * 360) + 'deg)';
  }
  function set_speed(speed) {
    set_rotations(speed_to_rotations(speed));
  }

  
  var knob_gyro_previous_rad = null;
  var knob_gyro_previous_rotations = null;
 
  function dial_rotate() {
    
    var rad = gyroDict['gyroZ'];
    var old = knob_gyro_previous_rad;
    knob_gyro_previous_rad = rad;
    
    var delta = rad - old;
    if (delta < 0) {
      // Because this is a circle
      delta += Math.PI * 2;
    }
    if (delta > Math.PI) {
      // Converting from 0..360 to -180..180.
      delta -= Math.PI * 2;
    }
    console.assert(delta >= -Math.PI && delta <= Math.PI, {delta: delta, rad: rad, old: old});
  
    // var rotation = rad / Math.PI / 2;
    
    var delta_rotation = delta / Math.PI / 2;
    var rotations = knob_gyro_previous_rotations + delta_rotation;
    knob_gyro_previous_rotations = rotations;
    set_rotations(rotations);
  }
  
  function updateRotation(data) {
    let gyroArray = data.split(" ").map(parseFloat);
    // console.log(accelArray);
    gyroDict['gyroX'] = gyroArray[0];
    gyroDict['gyroY'] = gyroArray[1];
    gyroDict['gyroZ'] = gyroArray[2];
    // console.log(accelDict);
    dial_rotate();
  }

  set_speed(1);
  
