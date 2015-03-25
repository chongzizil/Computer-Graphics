/**
 * Created by youlongli on 3/21/15.
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

var moveCell = function (pos, dir) {
  switch (dir) {
    case RIGHT:
      pos.x++;
      break;
    case LEFT:
      pos.x--;
      break;
    case UP:
      pos.y++;
      break;
    default:
      pos.y--;
      break;
  }
};

/************************Greedy Snake Variables************************/
// Direction
var RIGHT = "R";
var LEFT = "L";
var UP = "U";
var DOWN = "D";

// Bound
var X_BOUND = 20;
var Y_BOUND = 11;

// Canvas and matrix
var canvasPlayground = initCanvas('playground');
var matrix = new Matrix();

// Snake
var snake = [];
var snakePos = [];
var snakeTrs = [];
var direction = RIGHT;

// Food
var food = new Parametric(8, 8, uv2xyzSphere);
var foodPos = new Vector3(0, 0, 0);

var initNum = 3;
var speedVar = 3;
var updateCount = 0;
var isGameOngoing = false;


/************************Greedy Snake functions************************/
var initSnake = function () {
  snake = [];
  snakePos = [];
  snakeTrs = [];
  for (var i = 0; i < initNum; i++) {
    snake[i] = new Parametric(10, 10, uv2xyzSphere);
    snakePos[i] = new Vector3(-i, 0, 0);
    snakeTrs[i] = new Vector3(0, 0, 0);
  }
  isGameOngoing = false;
  direction = RIGHT;
};

var isFoodInsideSnake = function () {
  for (var i = 0; i < snakePos.length; i++) {
    if (foodPos.x === snakePos[i].x && foodPos.y === snakePos[i].y) {
      return true;
    }
  }
  return false;
};

var createFood = function () {
  foodPos.x = Math.floor(X_BOUND * Math.random()) * (Math.random() > .5 ? 1 : -1);
  foodPos.y = Math.floor(Y_BOUND * Math.random()) * (Math.random() > .5 ? 1 : -1);
  if (isFoodInsideSnake()) {
    createFood();
  }
};

var checkCollision = function (x, y) {
  for (var i = 0; i < snakePos.length; i++) {
    if (snakePos[i].x == x && snakePos[i].y == y)
      return true;
  }
  return false;
};

document.onkeydown = function (event) {
  if (!event) {
    event = window.event;
  }
  var code = event.keyCode;
  if (event.charCode && code == 0) {
    code = event.charCode;
  }

  isGameOngoing = true;

  switch (code) {
    case 37:
      if (direction !== RIGHT) {
        direction = LEFT;
      }
      break;
    case 38:
      if (direction !== DOWN) {
        direction = UP;
      }
      break;
    case 39:
      if (direction !== LEFT) {
        direction = RIGHT;
      }
      break;
    case 40:
      if (direction !== UP) {
        direction = DOWN;
      }
      break;
  }
  event.preventDefault();
};

/************************Greedy Snake Canvas************************/
initSnake();
createFood();

canvasPlayground.update = function (g) {
  speedVar = $("#playground-difficulty").val();
  updateCount++;

  matrix.identity();
  matrix.scale(.05, .05, .05);

  // Move the snake
  if (updateCount % (12 - speedVar) === 0 && isGameOngoing) {
    updateCount = 0;

    // Get the tail which will become the new head first
    var newHead = new Vector3(snakePos[0].x, snakePos[0].y, snakePos[0].z);
    // Move the new head to the right position according to the direction
    moveCell(newHead, direction);

    // Check if the game ends...
    if (newHead.x == X_BOUND || newHead.x == -X_BOUND
        || newHead.y == Y_BOUND || newHead.y == -Y_BOUND
        || checkCollision(newHead.x, newHead.y)) {
      initSnake();
      createFood();
      return;
    }

    // If the food is eaten add a new body cell, otherwise remvoe the tail
    if (isFoodInsideSnake()) {
      createFood();
      snake.push(new Parametric(10, 10, uv2xyzSphere));
    } else {
      snakePos.pop();
    }

    // Add the new head
    snakePos.unshift(newHead);
  }

  // Update the translate argument
  for (var i = 1; i < snakePos.length; i++) {
    snakeTrs[i] = new Vector3(snakePos[i].x - snakePos[i - 1].x, snakePos[i].y - snakePos[i - 1].y, snakePos[i].z - snakePos[i - 1].z)
  }

  // Move :)
  matrix.translate(snakePos[0].x, snakePos[0].y, snakePos[0].z);
  snake[0].render(this, matrix, g);
  for (var i = 1; i < snakePos.length; i++) {
    matrix.translate(snakeTrs[i].x, snakeTrs[i].y, snakeTrs[i].z);
    snake[i].render(this, matrix, g);
  }

  matrix.identity();
  matrix.scale(.05, .05, .05);
  matrix.translate(foodPos.x, foodPos.y, foodPos.z);

  food.render(this, matrix, g);

  drawBoard(this, g);
};

/************************Slider************************/
$('#playground-difficulty').noUiSlider({
  start: [4],
  step: 1,
  range: {
    'min': [1],
    'max': [10]
  }
});

$('#playground-difficulty')
    .slider({
      max: 10,
      min: 1,
      step: 1
    }).slider('pips', {
      rest: "label"
    }).slider('float');