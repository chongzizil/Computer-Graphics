/**
 * Created by youlongli on 3/25/15.
 */
var color = [
  'rgb(203,  27,  68)',
  'rgb(250, 214, 137)',
  'rgb(129, 199, 212)',
  'rgb(134, 193, 102)',
  'rgb(139, 129, 195)',
  'rgb(252, 250, 242)',
  'rgb( 12,  12,  12)'
];

var movement = [
  { // 0
    leftElbow: {
      theta: 30,
      length: .13
    },
    leftHand: {
      theta: 50,
      length: .08
    },
    rightElbow: {
      theta: -45,
      length: .13
    },
    rightHand: {
      theta: 30,
      length: .08
    },
    leftKnee: {
      theta: 60,
      length: .13
    },
    leftFoot: {
      theta: -45,
      length: .11
    },
    rightKnee: {
      theta: -20,
      length: .13
    },
    rightFoot: {
      theta: -30,
      length: .13
    }
  },
  { // 1
    leftElbow: {
      theta: 5,
      length: .13
    },
    leftHand: {
      theta: 60,
      length: .08
    },
    rightElbow: {
      theta: -30,
      length: .13
    },
    rightHand: {
      theta: 30,
      length: .08
    },
    leftKnee: {
      theta: 30,
      length: .13
    },
    leftFoot: {
      theta: -45,
      length: .08
    },
    rightKnee: {
      theta: 0,
      length: .13
    },
    rightFoot: {
      theta: -60,
      length: .15
    }
  },
  { // 2
    leftElbow: {
      theta: -30,
      length: .13
    },
    leftHand: {
      theta: 60,
      length: .08
    },
    rightElbow: {
      theta: 0,
      length: .13
    },
    rightHand: {
      theta: 45,
      length: .08
    },
    leftKnee: {
      theta: 5,
      length: .13
    },
    leftFoot: {
      theta: -15,
      length: .08
    },
    rightKnee: {
      theta: 60,
      length: .13
    },
    rightFoot: {
      theta: -90,
      length: .13
    }
  },
  { // 3
    leftElbow: {
      theta: -30,
      length: .13
    },
    leftHand: {
      theta: 30,
      length: .08
    },
    rightElbow: {
      theta: 20,
      length: .13
    },
    rightHand: {
      theta: 80,
      length: .08
    },
    leftKnee: {
      theta: 5,
      length: .13
    },
    leftFoot: {
      theta: -30,
      length: .08
    },
    rightKnee: {
      theta: 70,
      length: .13
    },
    rightFoot: {
      theta: -70,
      length: .13
    }
  },
  { // 4
    leftElbow: {
      theta: -50,
      length: .13
    },
    leftHand: {
      theta: 20,
      length: .08
    },
    rightElbow: {
      theta: 50,
      length: .13
    },
    rightHand: {
      theta: 45,
      length: .08
    },
    leftKnee: {
      theta: -25,
      length: .13
    },
    leftFoot: {
      theta: -15,
      length: .11
    },
    rightKnee: {
      theta: 70,
      length: .13
    },
    rightFoot: {
      theta: -30,
      length: .13
    }
  }
];

/************************Greedy Snake Variables************************/
// Direction
var RIGHT = "R";
var LEFT = "L";
var UP = "U";
var DOWN = "D";

// Canvas and matrix
var canvasPlayground = initCanvas('playground');
var matrix = new Matrix();

var updateCount = 0;
var direction = RIGHT;
var directionVar = 1;
var phase = 4;

document.onkeydown = function (event) {
  if (!event) {
    event = window.event;
  }
  var code = event.keyCode;
  if (event.charCode && code == 0) {
    code = event.charCode;
  }

  switch (code) {
    case 37:
      direction = LEFT;
      directionVar = -1;
    case 38:
      direction = UP;
      directionVar = -2;
      break;
    case 39:
      direction = RIGHT;
      directionVar = 1;
      break;
    case 40:
      direction = DOWN;
      directionVar = 2;
      break;
  }
  event.preventDefault();
};

/************************Canvas************************/
var origin = new Vector3(0, 0, 0);
var head = new Vector3(0, 0, 0);
var shoulder = new Vector3(0, 0, 0);
var leftElbow = new Vector3(0, 0, 0);
var leftHand = new Vector3(0, 0, 0);
var rightElbow = new Vector3(0, 0, 0);
var rightHand = new Vector3(0, 0, 0);
var butt = new Vector3(0, 0, 0);
var leftKnee = new Vector3(0, 0, 0);
var leftFoot = new Vector3(0, 0, 0);
var rightKnee = new Vector3(0, 0, 0);
var rightFoot = new Vector3(0, 0, 0);
var shoulderMatrix;
var buttMatrix;

canvasPlayground.update = function (g) {
  updateCount++;

  if (updateCount % (12 - $('#playground-speed').val()) === 0) {
    updateCount = 0;
    phase++;
    phase = phase % 5;
  }

  g.lineCap = "round";
  g.lineJoin = "round";

  g.fillStyle = 'rgb(220,250,255)';
  g.beginPath();
  g.moveTo(0, 0);
  g.lineTo(this.width, 0);
  g.lineTo(this.width, this.height);
  g.lineTo(0, this.height);
  g.fill();

  g.lineWidth = 10;

  matrix.identity();

  // Head
  matrix.translate(0, -.05, 0);
  matrix.transform(origin, head);

  // Lean body
  matrix.rotateZ(directionVar * -10);

  // Shoulder
  matrix.translate(0, -.1, 0);
  matrix.transform(origin, shoulder);

  // shoulder to elbows to hands
  shoulderMatrix = matrix.clone();
  shoulderMatrix.rotateZ(directionVar * movement[phase].leftElbow.theta);
  shoulderMatrix.translate(0, -movement[phase].leftElbow.length, 0);
  shoulderMatrix.transform(origin, leftElbow);

  shoulderMatrix.rotateZ(directionVar * movement[phase].leftHand.theta);
  shoulderMatrix.translate(0, -movement[phase].leftHand.length, 0);
  shoulderMatrix.transform(origin, leftHand);

  shoulderMatrix = matrix.clone();
  shoulderMatrix.rotateZ(directionVar * movement[phase].rightElbow.theta);
  shoulderMatrix.translate(0, -movement[phase].rightElbow.length, 0);
  shoulderMatrix.transform(origin, rightElbow);

  shoulderMatrix.rotateZ(directionVar * movement[phase].rightHand.theta);
  shoulderMatrix.translate(0, -movement[phase].rightHand.length, 0);
  shoulderMatrix.transform(origin, rightHand);

  // Butt
  matrix.rotateZ(-10);
  matrix.translate(0, -.2, 0);
  matrix.transform(origin, butt);

  // shoulder to knees to feet
  buttMatrix = matrix.clone();
  buttMatrix.rotateZ(directionVar * movement[phase].leftKnee.theta);
  buttMatrix.translate(0, -movement[phase].leftKnee.length, 0);
  buttMatrix.transform(origin, leftKnee);

  buttMatrix.rotateZ(directionVar * movement[phase].leftFoot.theta);
  buttMatrix.translate(0, -movement[phase].leftFoot.length, 0);
  buttMatrix.transform(origin, leftFoot);

  buttMatrix = matrix.clone();
  buttMatrix.rotateZ(directionVar * movement[phase].rightKnee.theta);
  buttMatrix.translate(0, -movement[phase].rightKnee.length, 0);
  buttMatrix.transform(origin, rightKnee);

  buttMatrix.rotateZ(directionVar * movement[phase].rightFoot.theta);
  buttMatrix.translate(0, -movement[phase].rightFoot.length, 0);
  buttMatrix.transform(origin, rightFoot);

  drawCircle(head, 30, this, g);
  drawLine(shoulder, butt, this, g);
  drawLine(shoulder, leftElbow, this, g);
  drawLine(leftElbow, leftHand, this, g);
  drawLine(shoulder, rightElbow, this, g);
  drawLine(rightElbow, rightHand, this, g);
  drawLine(butt, leftKnee, this, g);
  drawLine(leftKnee, leftFoot, this, g);
  drawLine(butt, rightKnee, this, g);
  drawLine(rightKnee, rightFoot, this, g);

  drawBoard(this, g);
};

var drawCircle = function (start, radius, canvas, g) {
  start.viewportTransformation(canvas);

  g.beginPath();
  g.arc(start.x, start.y, radius, 0, Math.PI * 2);
  g.fill();
  g.stroke();
  g.closePath();

  start.viewportReverseTransformation(canvas);
};

var drawLine = function (start, end, canvas, g) {
  start.viewportTransformation(canvas);
  end.viewportTransformation(canvas);

  g.strokeStyle = 'black';
  g.beginPath();
  g.moveTo(start.x, start.y);
  g.lineTo(end.x, end.y);
  g.stroke();

  start.viewportReverseTransformation(canvas);
  end.viewportReverseTransformation(canvas);
};

/************************Slider************************/
$('#playground-speed').noUiSlider({
  start: [4],
  step: 1,
  range: {
    'min': [1],
    'max': [10]
  }
});

$('#playground-speed')
    .slider({
      max: 10,
      min: 1,
      step: 1
    }).slider('pips', {
      rest: "label"
    }).slider('float');