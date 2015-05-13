/*************************************************** Global Variables *************************************************/
var pacmanScene;
var gameSpeed = 2;
var refreshCount = 0;
var game = new Game();

// Figures
var pacman, // PACMAN
    inky, // BASHFUL (Blue)
    blinky, // SHADOW (Red)
    clyde, // POKEY (Orange)
    pinky; // SPEEDY (Pink)

var PACMAN_RADIUS = 15;

// Meshes for Three.js
var meshes = {
  pacman: new PacmanFigureObjects({
    type: 'pacman',
    radius: this.radius
  }),
  eyes: new PacmanFigureObjects({
    type: 'eyes',
    radius: this.radius
  }),
  ghosts: {
    inky: {
      normal: new PacmanFigureObjects({
        type: 'ghost',
        color: 'blue',
        isDizzy: false,
        radius: this.radius
      }),
      dizzy: new PacmanFigureObjects({
        type: 'ghost',
        color: 'blue',
        isDizzy: true,
        radius: this.radius
      })
    },
    blinky: {
      normal: new PacmanFigureObjects({
        type: 'ghost',
        color: 'red',
        isDizzy: false,
        radius: this.radius
      }),
      dizzy: new PacmanFigureObjects({
        type: 'ghost',
        color: 'red',
        isDizzy: true,
        radius: this.radius
      })
    },
    clyde: {
      normal: new PacmanFigureObjects({
        type: 'ghost',
        color: 'orange',
        isDizzy: false,
        radius: this.radius
      }),
      dizzy: new PacmanFigureObjects({
        type: 'ghost',
        color: 'orange',
        isDizzy: true,
        radius: this.radius
      })
    },
    pinky: {
      normal: new PacmanFigureObjects({
        type: 'ghost',
        color: 'pink',
        isDizzy: false,
        radius: this.radius
      }),
      dizzy: new PacmanFigureObjects({
        type: 'ghost',
        color: 'pink',
        isDizzy: true,
        radius: this.radius
      })
    }
  }
};

// BGM
var Sound = new Object();
Sound.play = function (sound) {
    if (game.soundfx == 1) {
        var audio = document.getElementById(sound);
        (audio != null) ? audio.play() : console.log(sound + " not found");
    }
};

// Directions
var Direction = function (name, dirX, dirY) {
    this.name = name;
    this.dirX = dirX;
    this.dirY = dirY;
    this.equals = function (dir) {
        return JSON.stringify(this) == JSON.stringify(dir);
    }
};

var up = new Direction("up", 0, 1);		 // UP
var left = new Direction("left", -1, 0);	 // LEFT
var down = new Direction("down", 0, -1);    // DOWN
var right = new Direction("right", 1, 0);	 // RIGHT

/*************************************************** Helper functions *************************************************/

// DirectionWatcher which monitor the control input
var directionWatcher = function () {
    this.dir = null;
    this.set = function (dir) {
        this.dir = dir;
    };
    this.get = function () {
        return this.dir;
    }
};

// Helper function
var between = function (x, min, max) {
  return x >= min && x <= max;
};

var buildWalls = function () {
  function buildWall(gridX, gridY) {
    var width = PACMAN_RADIUS * 2;
    var height = PACMAN_RADIUS * 2;
    var radius = PACMAN_RADIUS;

    var wallGeometry = new THREE.BoxGeometry(width, height, radius);
    var wallMaterials = new THREE.MeshBasicMaterial({color: '#106BD6'});
    var wall = new THREE.Mesh( wallGeometry, wallMaterials );
    wall.position.set(gridX * 2 * radius + radius, gridY * 2 * radius + radius, radius / 2);
    pacmanScene.scene.add(wall);
  }

  var dotPosY;
  $.each(game.map.posY, function (i, item) {
    dotPosY = this.row;
    $.each(this.posX, function () {
      if (this.type === "wall") {
        buildWall(this.col, dotPosY);
      } else if (this.type === 'door') {
        var doorGeometry = new THREE.CylinderGeometry(PACMAN_RADIUS / 8, PACMAN_RADIUS / 8, 2 * PACMAN_RADIUS);
        var doorMaterials = new THREE.MeshBasicMaterial({color: '#106BD6'});
        var door = new THREE.Mesh( doorGeometry, doorMaterials );
        door.rotation.z = Math.PI / 2;
        door.position.set(this.col * 2 * PACMAN_RADIUS + PACMAN_RADIUS, dotPosY * 2 * PACMAN_RADIUS + PACMAN_RADIUS, PACMAN_RADIUS / 2);
        pacmanScene.scene.add(door);
      }
    });
  });
};

var fillPills = function () {
  var dotPosY;
  var pillGeometry = new THREE.SphereGeometry(PACMAN_RADIUS / 4, 32, 32);
  var powerPillGeometry = new THREE.SphereGeometry(PACMAN_RADIUS / 2, 32, 32);
  var pillMaterials = new THREE.MeshBasicMaterial({color: '#ffffff'});
  $.each(game.map.posY, function (i, item) {
    dotPosY = this.row;
    $.each(this.posX, function () {
      var pill;
      if (this.type === "pill") {
        pill = new THREE.Mesh( pillGeometry.clone(), pillMaterials.clone() );
        pill.position.set(this.col * PACMAN_RADIUS * 2 + PACMAN_RADIUS, dotPosY * PACMAN_RADIUS * 2 + PACMAN_RADIUS, PACMAN_RADIUS / 4);
        pacmanScene.scene.add(pill);
      } else if (this.type === "powerpill") {
        pill = new THREE.Mesh( powerPillGeometry.clone(), pillMaterials.clone() );
        pill.position.set(this.col * PACMAN_RADIUS * 2 + PACMAN_RADIUS, dotPosY * PACMAN_RADIUS * 2 + PACMAN_RADIUS, PACMAN_RADIUS / 2);
        pacmanScene.scene.add(pill);
      }
      game.map.posY[dotPosY].posX[this.col].mesh = pill;
    });
  });
};

function renderContent() {
  // Figures
  pacman = new Pacman();
  pinky = new Ghost("pinky", 7, 7, 2, 2);
  inky = new Ghost("inky", 8, 7, 13, 11);
  blinky = new Ghost("blinky", 9, 7, 13, 0);
  clyde = new Ghost("clyde", 10, 7, 2, 11);

  pacmanScene.scene.add(pacman.currMesh);
  pacmanScene.scene.add(pinky.meshContainer);
  pacmanScene.scene.add(blinky.meshContainer);
  pacmanScene.scene.add(inky.meshContainer);
  pacmanScene.scene.add(clyde.meshContainer);

  // Pills
  fillPills();

  // Walls
  buildWalls();
}

// Click events
function doKeyDown(evt) {
  switch (evt.keyCode) {
    case 38:	// UP Arrow Key pressed
      evt.preventDefault();
    case 87:	// W pressed
      pacman.directionWatcher.set(up);
      break;
    case 40:	// DOWN Arrow Key pressed
      evt.preventDefault();
    case 83:	// S pressed
      pacman.directionWatcher.set(down);
      break;
    case 37:	// LEFT Arrow Key pressed
      evt.preventDefault();
    case 65:	// A pressed
      pacman.directionWatcher.set(left);
      break;
    case 39:	// RIGHT Arrow Key pressed
      evt.preventDefault();
    case 68:	// D pressed
      pacman.directionWatcher.set(right);
      break;
    case 78:	// N pressed
      if (!$('#playerName').is(':focus')) {
        game.pause = 1;
        game.newGame();
      }
      break;
    case 77:	// M pressed
      game.toggleSound();
      break;
    case 32:	// SPACE pressed -> pause Game
      evt.preventDefault();
      if (!(game.gameOver == true)
          && $('#game-content').is(':visible')
      )  game.pauseResume();
      break;
    case 13: 	// ENTER pressed
      if ($('#game-content').is(':visible')) addHighscore();
  }
}

/************************************************** Game Constructors *************************************************/
function Game() {
  this.isInitialized = false;
  this.soundfx = 0;
  this.map;
  this.pillCount;				// number of pills
  this.gameOver = false;
  this.width = 540;
  this.height = 390;

  this.ghostFrightened = false;
  this.ghostFrightenedTimer = 240;
  this.ghostMode = 0;			// 0 = Scatter, 1 = Chase
  this.ghostModeTimer = 200;	// decrements each animationLoop execution

  /* Game Functions */
  this.startGhostFrightened = function () {
    console.log("Enable ghost frightened...");

    this.ghostFrightened = true;
    this.ghostFrightenedTimer = 240;
    inky.dazzle();
    pinky.dazzle();
    blinky.dazzle();
    clyde.dazzle();
  };

  this.disableGhostFrightened = function () {
    console.log("Disabled ghost frightened");

    this.ghostFrightened = false;
    this.ghostFrigthenedTimer = 240;
    inky.undazzle();
    pinky.undazzle();
    blinky.undazzle();
    clyde.undazzle();
  };

  this.checkGhostMode = function () {
    if (this.ghostFrightened) {
      this.ghostFrightenedTimer--;
      if (this.ghostFrightenedTimer == 0) {
        this.disableGhostFrightened();
      }
    } else {
      this.ghostModeTimer--;
      if (this.ghostModeTimer == 0) {
        console.log("ghostMode=" + this.ghostMode);
        this.ghostMode ^= 1;
        this.ghostModeTimer = 200 + this.ghostMode * 450;
      }
    }
  };

  this.getMapContent = function (x, y) {
    var maxX = this.width / PACMAN_RADIUS * 2 - 1;
    var maxY = this.height / PACMAN_RADIUS * 2 - 1;
    if (x < 0) x = maxX + x;
    if (x > maxX) x = x - maxX;
    if (y < 0) y = maxY + y;
    if (y > maxY) y = y - maxY;

    if (!this.map.posY[y].posX[x]) {
      return 'boarder';
    }

    return this.map.posY[y].posX[x].type;
  };

  this.setMapContent = function (x, y, val) {
    this.map.posY[y].posX[x].type = val;
  };

  this.toggleSound = function () {
    this.soundfx == 0 ? this.soundfx = 1 : this.soundfx = 0;
    $('#mute').toggle();
  };

  this.reset = function () {
  };

  this.newGame = function () {
    var r = confirm("Are you sure you want to restart?");
    if (r) {
      console.log("new Game");
      this.init(0);
    }
    this.pauseResume();
  };

  this.pauseResume = function () {
    if (!this.running) {
      this.pause = false;
      this.running = true;
    } else if (this.pause) {
      this.pause = false;
    } else {
    }
  };

  this.initMap = function () {
    game.map = {
      "posY": [
        {
          "row": 0,
          "posX": [
            {"col": 0, "type": "wall", "mesh": null},
            {"col": 1, "type": "wall", "mesh": null},
            {"col": 2, "type": "wall", "mesh": null},
            {"col": 3, "type": "wall", "mesh": null},
            {"col": 4, "type": "wall", "mesh": null},
            {"col": 5, "type": "wall", "mesh": null},
            {"col": 6, "type": "wall", "mesh": null},
            {"col": 7, "type": "wall", "mesh": null},
            {"col": 8, "type": "wall", "mesh": null},
            {"col": 9, "type": "wall", "mesh": null},
            {"col": 10, "type": "wall", "mesh": null},
            {"col": 11, "type": "wall", "mesh": null},
            {"col": 12, "type": "wall", "mesh": null},
            {"col": 13, "type": "wall", "mesh": null},
            {"col": 14, "type": "wall", "mesh": null},
            {"col": 15, "type": "wall", "mesh": null},
            {"col": 16, "type": "wall", "mesh": null},
            {"col": 17, "type": "wall", "mesh": null}
          ]
        },
        {
          "row": 1,
          "posX": [
            {"col": 0, "type": "wall", "mesh": null},
            {"col": 1, "type": "powerpill", "mesh": null},
            {"col": 2, "type": "pill", "mesh": null},
            {"col": 3, "type": "pill", "mesh": null},
            {"col": 4, "type": "wall", "mesh": null},
            {"col": 5, "type": "wall", "mesh": null},
            {"col": 6, "type": "pill", "mesh": null},
            {"col": 7, "type": "pill", "mesh": null},
            {"col": 8, "type": "pill", "mesh": null},
            {"col": 9, "type": "pill", "mesh": null},
            {"col": 10, "type": "pill", "mesh": null},
            {"col": 11, "type": "pill", "mesh": null},
            {"col": 12, "type": "wall", "mesh": null},
            {"col": 13, "type": "wall", "mesh": null},
            {"col": 14, "type": "pill", "mesh": null},
            {"col": 15, "type": "pill", "mesh": null},
            {"col": 16, "type": "powerpill", "mesh": null},
            {"col": 17, "type": "wall", "mesh": null}
          ]
        },
        {
          "row": 2,
          "posX": [
            {"col": 0, "type": "wall", "mesh": null},
            {"col": 1, "type": "pill", "mesh": null},
            {"col": 2, "type": "wall", "mesh": null},
            {"col": 3, "type": "pill", "mesh": null},
            {"col": 4, "type": "pill", "mesh": null},
            {"col": 5, "type": "pill", "mesh": null},
            {"col": 6, "type": "pill", "mesh": null},
            {"col": 7, "type": "wall", "mesh": null},
            {"col": 8, "type": "wall", "mesh": null},
            {"col": 9, "type": "wall", "mesh": null},
            {"col": 10, "type": "wall", "mesh": null},
            {"col": 11, "type": "pill", "mesh": null},
            {"col": 12, "type": "pill", "mesh": null},
            {"col": 13, "type": "pill", "mesh": null},
            {"col": 14, "type": "pill", "mesh": null},
            {"col": 15, "type": "wall", "mesh": null},
            {"col": 16, "type": "pill", "mesh": null},
            {"col": 17, "type": "wall", "mesh": null}
          ]
        },
        {
          "row": 3,
          "posX": [
            {"col": 0, "type": "wall", "mesh": null},
            {"col": 1, "type": "pill", "mesh": null},
            {"col": 2, "type": "pill", "mesh": null},
            {"col": 3, "type": "pill", "mesh": null},
            {"col": 4, "type": "wall", "mesh": null},
            {"col": 5, "type": "wall", "mesh": null},
            {"col": 6, "type": "pill", "mesh": null},
            {"col": 7, "type": "pill", "mesh": null},
            {"col": 8, "type": "pill", "mesh": null},
            {"col": 9, "type": "pill", "mesh": null},
            {"col": 10, "type": "pill", "mesh": null},
            {"col": 11, "type": "pill", "mesh": null},
            {"col": 12, "type": "wall", "mesh": null},
            {"col": 13, "type": "wall", "mesh": null},
            {"col": 14, "type": "pill", "mesh": null},
            {"col": 15, "type": "pill", "mesh": null},
            {"col": 16, "type": "pill", "mesh": null},
            {"col": 17, "type": "wall", "mesh": null}
          ]
        },
        {
          "row": 4,
          "posX": [
            {"col": 0, "type": "wall", "mesh": null},
            {"col": 1, "type": "wall", "mesh": null},
            {"col": 2, "type": "pill", "mesh": null},
            {"col": 3, "type": "wall", "mesh": null},
            {"col": 4, "type": "wall", "mesh": null},
            {"col": 5, "type": "wall", "mesh": null},
            {"col": 6, "type": "wall", "mesh": null},
            {"col": 7, "type": "wall", "mesh": null},
            {"col": 8, "type": "pill", "mesh": null},
            {"col": 9, "type": "pill", "mesh": null},
            {"col": 10, "type": "wall", "mesh": null},
            {"col": 11, "type": "wall", "mesh": null},
            {"col": 12, "type": "wall", "mesh": null},
            {"col": 13, "type": "wall", "mesh": null},
            {"col": 14, "type": "wall", "mesh": null},
            {"col": 15, "type": "pill", "mesh": null},
            {"col": 16, "type": "wall", "mesh": null},
            {"col": 17, "type": "wall", "mesh": null}
          ]
        },
        {
          "row": 5,
          "posX": [
            {"col": 0, "type": "wall", "mesh": null},
            {"col": 1, "type": "wall", "mesh": null},
            {"col": 2, "type": "pill", "mesh": null},
            {"col": 3, "type": "wall", "mesh": null},
            {"col": 4, "type": "wall", "mesh": null},
            {"col": 5, "type": "pill", "mesh": null},
            {"col": 6, "type": "pill", "mesh": null},
            {"col": 7, "type": "pill", "mesh": null},
            {"col": 8, "type": "pill", "mesh": null},
            {"col": 9, "type": "pill", "mesh": null},
            {"col": 10, "type": "pill", "mesh": null},
            {"col": 11, "type": "pill", "mesh": null},
            {"col": 12, "type": "pill", "mesh": null},
            {"col": 13, "type": "wall", "mesh": null},
            {"col": 14, "type": "wall", "mesh": null},
            {"col": 15, "type": "pill", "mesh": null},
            {"col": 16, "type": "wall", "mesh": null},
            {"col": 17, "type": "wall", "mesh": null}
          ]
        },
        {
          "row": 6,
          "posX": [
            {"col": 0, "type": "pill", "mesh": null},
            {"col": 1, "type": "pill", "mesh": null},
            {"col": 2, "type": "pill", "mesh": null},
            {"col": 3, "type": "pill", "mesh": null},
            {"col": 4, "type": "pill", "mesh": null},
            {"col": 5, "type": "pill", "mesh": null},
            {"col": 6, "type": "wall", "mesh": null},
            {"col": 7, "type": "wall", "mesh": null},
            {"col": 8, "type": "wall", "mesh": null},
            {"col": 9, "type": "wall", "mesh": null},
            {"col": 10, "type": "wall", "mesh": null},
            {"col": 11, "type": "wall", "mesh": null},
            {"col": 12, "type": "pill", "mesh": null},
            {"col": 13, "type": "pill", "mesh": null},
            {"col": 14, "type": "pill", "mesh": null},
            {"col": 15, "type": "pill", "mesh": null},
            {"col": 16, "type": "pill", "mesh": null},
            {"col": 17, "type": "pill", "mesh": null}
          ]
        },
        {
          "row": 7,
          "posX": [
            {"col": 0, "type": "wall", "mesh": null},
            {"col": 1, "type": "wall", "mesh": null},
            {"col": 2, "type": "pill", "mesh": null},
            {"col": 3, "type": "wall", "mesh": null},
            {"col": 4, "type": "wall", "mesh": null},
            {"col": 5, "type": "pill", "mesh": null},
            {"col": 6, "type": "wall", "mesh": null},
            {"col": 7, "type": "null", "mesh": null},
            {"col": 8, "type": "null", "mesh": null},
            {"col": 9, "type": "null", "mesh": null},
            {"col": 10, "type": "null", "mesh": null},
            {"col": 11, "type": "wall", "mesh": null},
            {"col": 12, "type": "pill", "mesh": null},
            {"col": 13, "type": "wall", "mesh": null},
            {"col": 14, "type": "wall", "mesh": null},
            {"col": 15, "type": "pill", "mesh": null},
            {"col": 16, "type": "wall", "mesh": null},
            {"col": 17, "type": "wall", "mesh": null}
          ]
        },
        {
          "row": 8,
          "posX": [
            {"col": 0, "type": "wall", "mesh": null},
            {"col": 1, "type": "pill", "mesh": null},
            {"col": 2, "type": "pill", "mesh": null},
            {"col": 3, "type": "wall", "mesh": null},
            {"col": 4, "type": "pill", "mesh": null},
            {"col": 5, "type": "pill", "mesh": null},
            {"col": 6, "type": "pill", "mesh": null},
            {"col": 7, "type": "wall", "mesh": null},
            {"col": 8, "type": "door", "mesh": null},
            {"col": 9, "type": "door", "mesh": null},
            {"col": 10, "type": "wall", "mesh": null},
            {"col": 11, "type": "pill", "mesh": null},
            {"col": 12, "type": "pill", "mesh": null},
            {"col": 13, "type": "pill", "mesh": null},
            {"col": 14, "type": "wall", "mesh": null},
            {"col": 15, "type": "pill", "mesh": null},
            {"col": 16, "type": "pill", "mesh": null},
            {"col": 17, "type": "wall", "mesh": null}
          ]
        },
        {
          "row": 9,
          "posX": [
            {"col": 0, "type": "wall", "mesh": null},
            {"col": 1, "type": "pill", "mesh": null},
            {"col": 2, "type": "wall", "mesh": null},
            {"col": 3, "type": "wall", "mesh": null},
            {"col": 4, "type": "pill", "mesh": null},
            {"col": 5, "type": "wall", "mesh": null},
            {"col": 6, "type": "pill", "mesh": null},
            {"col": 7, "type": "pill", "mesh": null},
            {"col": 8, "type": "pill", "mesh": null},
            {"col": 9, "type": "pill", "mesh": null},
            {"col": 10, "type": "pill", "mesh": null},
            {"col": 11, "type": "pill", "mesh": null},
            {"col": 12, "type": "wall", "mesh": null},
            {"col": 13, "type": "pill", "mesh": null},
            {"col": 14, "type": "wall", "mesh": null},
            {"col": 15, "type": "wall", "mesh": null},
            {"col": 16, "type": "pill", "mesh": null},
            {"col": 17, "type": "wall", "mesh": null}
          ]
        },
        {
          "row": 10,
          "posX": [
            {"col": 0, "type": "wall", "mesh": null},
            {"col": 1, "type": "pill", "mesh": null},
            {"col": 2, "type": "wall", "mesh": null},
            {"col": 3, "type": "pill", "mesh": null},
            {"col": 4, "type": "pill", "mesh": null},
            {"col": 5, "type": "pill", "mesh": null},
            {"col": 6, "type": "wall", "mesh": null},
            {"col": 7, "type": "wall", "mesh": null},
            {"col": 8, "type": "pill", "mesh": null},
            {"col": 9, "type": "pill", "mesh": null},
            {"col": 10, "type": "wall", "mesh": null},
            {"col": 11, "type": "wall", "mesh": null},
            {"col": 12, "type": "pill", "mesh": null},
            {"col": 13, "type": "pill", "mesh": null},
            {"col": 14, "type": "pill", "mesh": null},
            {"col": 15, "type": "wall", "mesh": null},
            {"col": 16, "type": "pill", "mesh": null},
            {"col": 17, "type": "wall", "mesh": null}
          ]
        },
        {
          "row": 11,
          "posX": [
            {"col": 0, "type": "wall", "mesh": null},
            {"col": 1, "type": "powerpill", "mesh": null},
            {"col": 2, "type": "pill", "mesh": null},
            {"col": 3, "type": "pill", "mesh": null},
            {"col": 4, "type": "wall", "mesh": null},
            {"col": 5, "type": "pill", "mesh": null},
            {"col": 6, "type": "pill", "mesh": null},
            {"col": 7, "type": "pill", "mesh": null},
            {"col": 8, "type": "pill", "mesh": null},
            {"col": 9, "type": "pill", "mesh": null},
            {"col": 10, "type": "pill", "mesh": null},
            {"col": 11, "type": "pill", "mesh": null},
            {"col": 12, "type": "pill", "mesh": null},
            {"col": 13, "type": "wall", "mesh": null},
            {"col": 14, "type": "pill", "mesh": null},
            {"col": 15, "type": "pill", "mesh": null},
            {"col": 16, "type": "powerpill", "mesh": null},
            {"col": 17, "type": "wall", "mesh": null}
          ]
        },
        {
          "row": 12,
          "posX": [
            {"col": 0, "type": "wall", "mesh": null},
            {"col": 1, "type": "wall", "mesh": null},
            {"col": 2, "type": "wall", "mesh": null},
            {"col": 3, "type": "wall", "mesh": null},
            {"col": 4, "type": "wall", "mesh": null},
            {"col": 5, "type": "wall", "mesh": null},
            {"col": 6, "type": "wall", "mesh": null},
            {"col": 7, "type": "wall", "mesh": null},
            {"col": 8, "type": "wall", "mesh": null},
            {"col": 9, "type": "wall", "mesh": null},
            {"col": 10, "type": "wall", "mesh": null},
            {"col": 11, "type": "wall", "mesh": null},
            {"col": 12, "type": "wall", "mesh": null},
            {"col": 13, "type": "wall", "mesh": null},
            {"col": 14, "type": "wall", "mesh": null},
            {"col": 15, "type": "wall", "mesh": null},
            {"col": 16, "type": "wall", "mesh": null},
            {"col": 17, "type": "wall", "mesh": null}
          ]
        }
      ]
    };
  };

  this.countPill = function () {
    var count = 0;
    $.each(this.map.posY, function (i, item) {
      $.each(this.posX, function () {
        if (this.type == "pill") {
          count++;
        }
      });
    });
    return count;
  };

  this.init = function (state) {
    this.initMap();

    // Count pills
    this.pillCount = this.countPill();

    if (state == 0) {
      game.gameOver = false;
    }

    this.isInitialized = true;
    this.ghostFrightened = false;
    this.ghostFrightenedTimer = 240;
    this.ghostMode = 0;			// 0 = Scatter, 1 = Chase
    this.ghostModeTimer = 200;	// decrements each animationLoop execution

    renderContent();

    // initalize Ghosts, avoid memory flooding
    if (pinky === null || pinky === undefined) {
      pacman = new Pacman();
      pinky = new Ghost("pinky", 7, 5, 2, 2);
      inky = new Ghost("inky", 8, 5, 13, 11);
      blinky = new Ghost("blinky", 9, 5, 13, 0);
      clyde = new Ghost("clyde", 10, 5, 2, 11);
    } else {
      //console.log("ghosts reset");
      pacman.reset();
      pinky.reset();
      inky.reset();
      blinky.reset();
      clyde.reset();
    }

    blinky.start();	// blinky is the first to leave ghostHouse
    inky.start();
    pinky.start();
    clyde.start();
  };

  this.check = function () {
    if ((this.pillCount == 0) && game.running) {
      // todo: end game
    }
  };

  this.win = function () {
  };

  this.gameover = function () {
  };

  this.toPixelPos = function (gridPos) {
    return gridPos * PACMAN_RADIUS * 2 + PACMAN_RADIUS;
  };

  this.toGridPos = function (pixelPos) {
    var pos = pixelPos - PACMAN_RADIUS;
    return ((pos % (PACMAN_RADIUS * 2)) / (PACMAN_RADIUS * 2));
  };
}

/*********************************************** Characters Constructors **********************************************/
// Figure Constructor, super class for Pacman and Ghost
function Figure() {
  this.currMesh;
  this.posX;
  this.posY;
  this.speed;
  this.dirX = right.dirX;
  this.dirY = right.dirY;
  this.direction;
  this.radius;
  this.hasStopped = true;
  this.directionWatcher = new directionWatcher();

  this.getNextDirection = function () {
    console.log("Figure getNextDirection");
  };

  this.checkDirectionChange = function () {
    if ((this.inGrid() && (this.directionWatcher.get() == null)) || this.hasStopped ){
      this.getNextDirection();
      this.start();
    }
    if (this.directionWatcher.get() !== null && this.directionWatcher.get() !== undefined && this.inGrid()) {
      this.setDirection(this.directionWatcher.get());
      this.directionWatcher.set(null);
    }
  };

  // Check if the figure is in the grid perfectly
  this.inGrid = function () {
    var x = this.posX - PACMAN_RADIUS;
    var y = this.posY - PACMAN_RADIUS;

    if ((x % (PACMAN_RADIUS * 2) === 0) && (y % (PACMAN_RADIUS * 2) === 0)) return true;
    return false;
  };

  this.getOppositeDirection = function () {
    if (this.direction.equals(up)) return down;
    else if (this.direction.equals(down)) return up;
    else if (this.direction.equals(right)) return left;
    else if (this.direction.equals(left)) return right;
  };

  this.start = function () {
      this.hasstopped = false;
  };

  this.stop = function () {
    this.hasstopped = true;
  };

  this.getGridPosX = function (posX) {
    if (!posX) {
      posX = this.posX;
    }
    var x = posX - PACMAN_RADIUS;
    return (x - (x % (PACMAN_RADIUS * 2))) / (PACMAN_RADIUS * 2);
  };

  this.getGridPosY = function (posY) {
    if (!posY) {
      posY = this.posY;
    }
    var y = posY - PACMAN_RADIUS;
    return (y - (y % (PACMAN_RADIUS * 2))) / (PACMAN_RADIUS * 2);
  };

  this.setDirection = function (dir) {
    this.dirX = dir.dirX;
    this.dirY = dir.dirY;
    this.direction = dir;
  };

  //TODO: ???
  this.setPosition = function (x, y) {
    this.posX = x;
    this.posY = y;
  }
}

// Pacman Constructor
function Pacman() {
  this.currMesh = meshes.pacman;
  this.radius = PACMAN_RADIUS;
  this.posX = PACMAN_RADIUS;
  this.posY = 6 * 2 * PACMAN_RADIUS + PACMAN_RADIUS;
  this.speed = 5;
  this.dirX = right.dirX;
  this.dirY = right.dirY;
  this.stuckX = 0;
  this.stuckY = 0;
  this.isDead = false;
  this.directionWatcher = new directionWatcher();
  this.direction = right;
  this.beastMode = false;
  this.beastModeTimer = 0;

  this.currMesh.position.set(this.posX, this.posY, 0);

  this.getCenterX = function () {
    return this.posX + this.radius;
  };
  this.getCenterY = function () {
    return this.posY + this.radius;
  };

  this.move = function () {
    if (!this.frozen) {
      if (this.beastModeTimer > 0) {
        this.beastModeTimer--;
      }
      if ((this.beastModeTimer == 0) && (this.beastMode == true)) {
        this.disableBeastMode();
      }

      // Appear from the opposite side or simply move forward
      if (this.dirX === 1 && this.posX === game.width - PACMAN_RADIUS) {
        this.posX = PACMAN_RADIUS;
      } else if (this.dirX === -1 && this.posX === PACMAN_RADIUS) {
        this.posX = game.width - PACMAN_RADIUS;
      } else if (this.dirY === 1 && this.posY === game.height - PACMAN_RADIUS) {
        this.posY = PACMAN_RADIUS;
      } else if (this.dirY === -1 && this.posY === PACMAN_RADIUS) {
        this.posY = game.height - PACMAN_RADIUS;
      } else {
        this.posX += this.speed * this.dirX;
        this.posY += this.speed * this.dirY;
      }

      this.currMesh.position.set(this.posX, this.posY, 0);
    }
  };

  this.checkCollisions = function () {
    // Check it's not stuck and frozen
    if ((this.stuckX == 0) && (this.stuckY == 0) && this.isDead == false) {
      if ((this.dirX === -1 && this.posX === PACMAN_RADIUS)
          || (this.dirX === 1 && this.posX === game.width - PACMAN_RADIUS)
          || (this.dirY === -1 && this.posY === PACMAN_RADIUS)
          || (this.dirY === 1 && this.posY === game.height - PACMAN_RADIUS)) {
        return;
      }

      // Get the Grid Position of Pac
      var gridX = this.getGridPosX();
      var gridY = this.getGridPosY();
      var gridAheadX = gridX;
      var gridAheadY = gridY;

      var field = game.getMapContent(gridX, gridY);

      // get the field 1 ahead to check wall collisions
      if ((this.dirX == 1) && (gridAheadX < 17)) gridAheadX += 1;
      if ((this.dirY == 1) && (gridAheadY < 12)) gridAheadY += 1;
      if ((this.dirX == -1) && ((this.posX - PACMAN_RADIUS) % (PACMAN_RADIUS * 2) === 0)) gridAheadX -= 1;
      if ((this.dirY == -1) && ((this.posY - PACMAN_RADIUS) % (PACMAN_RADIUS * 2) === 0)) gridAheadY -= 1;
      var fieldAhead = game.getMapContent(gridAheadX, gridAheadY);

      // Check Pill Collision
      if ((field === "pill") || (field === "powerpill")) {
        if (
            (this.dirX == 1 && this.posX === game.toPixelPos(gridX))
            || (this.dirX == -1 && this.posX === game.toPixelPos(gridX))
            || (this.dirY == 1 && this.posY === game.toPixelPos(gridY))
            || (this.dirY == -1 && this.posY === game.toPixelPos(gridY))
            || (fieldAhead === "wall")
        ) {
          var s;
          if (field === "powerpill") {
            Sound.play("powerpill");
            this.enableBeastMode();
            game.startGhostFrightened();
          }
          else {
            Sound.play("waka");
            game.pillCount--;
          }
          game.map.posY[gridY].posX[gridX].type = "null";
          pacmanScene.scene.remove(game.map.posY[gridY].posX[gridX].mesh);
        }
      }

      //	Check Wall Collision
      if ((fieldAhead === "wall") || (fieldAhead === "door")) {
        this.stuckX = this.dirX;
        this.stuckY = this.dirY;
        pacman.stop();
      }
    }
  };

  this.checkDirectionChange = function () {
    //if (this.inGrid()) {
    //  console.log(true);
    //}
    if (this.directionWatcher.get() != null) {
      if ((this.stuckX == 1) && this.directionWatcher.get() == right) {
        this.directionWatcher.set(null);
      } else {
        // reset stuck events
        this.stuckX = 0;
        this.stuckY = 0;

        // only allow direction changes inside the grid
        if ((this.inGrid())) {
          // check if possible to change direction without getting stuck
          var x = this.getGridPosX() + this.directionWatcher.get().dirX;
          var y = this.getGridPosY() + this.directionWatcher.get().dirY;
          if (x <= -1) x = game.width / (this.radius * 2) - 1;
          if (x >= game.width / (this.radius * 2)) x = 0;
          if (y <= -1) x = game.height / (this.radius * 2) - 1;
          if (y >= game.height / (this.radius * 2)) y = 0;

          var nextTile = game.map.posY[y].posX[x].type;

          if (nextTile != "wall") {
            this.setDirection(this.directionWatcher.get());
            this.directionWatcher.set(null);
          }
        }
      }
    }
  };

  this.setDirection = function (dir) {
    if (!this.frozen) {
      this.dirX = dir.dirX;
      this.dirY = dir.dirY;
      this.direction = dir;
    }
  };

  this.enableBeastMode = function () {
    this.beastMode = true;
    this.beastModeTimer = 240;

    inky.dazzle();
    pinky.dazzle();
    blinky.dazzle();
    clyde.dazzle();
  };

  this.disableBeastMode = function () {
    this.beastMode = false;

    inky.undazzle();
    pinky.undazzle();
    blinky.undazzle();
    clyde.undazzle();
  };

  this.stop = function () {
    this.dirX = 0;
    this.dirY = 0;
  };

  this.reset = function () {
    this.isDead = false;
    this.posX = this.radius;
    this.posY = 6 * 2 * this.radius + this.radius;
    this.setDirection(right);
    this.stuckX = 0;
    this.stuckY = 0;
  };

  this.die = function () {
    if (!this.isDead) {
      Sound.play("die");
      this.freeze();
      blinky.stop();
      inky.stop();
      pinky.stop();
      clyde.stop();
    }
  };

  this.dieFinal = function () {
    this.reset();
    pinky.reset();
    inky.reset();
    blinky.reset();
    clyde.reset();
  };
}
Pacman.prototype = new Figure();

// Ghost Constructor
function Ghost(name, gridPosX, gridPosY, gridBaseX, gridBaseY) {
  this.meshes;
  switch(name) {
    case 'inky':
      this.meshes = meshes.ghosts.inky;
      break;
    case 'blinky':
      this.meshes = meshes.ghosts.blinky;
      break;
    case 'clyde':
      this.meshes = meshes.ghosts.clyde;
      break;
    default:
      this.meshes = meshes.ghosts.pinky;
      break;
  }
  this.meshContainer = new THREE.Object3D;
  this.normalMesh = this.meshes.normal;
  this.dizzyMesh = this.meshes.dizzy;
  this.eyesMesh = meshes.eyes;
  this.name = name;
  this.posX = gridPosX * PACMAN_RADIUS * 2 + PACMAN_RADIUS;
  this.posY = gridPosY * PACMAN_RADIUS * 2 + PACMAN_RADIUS;
  this.startPosX = gridPosX * PACMAN_RADIUS * 2 + PACMAN_RADIUS;
  this.startPosY = gridPosY * PACMAN_RADIUS * 2 + PACMAN_RADIUS;
  this.gridBaseX = gridBaseX;
  this.gridBaseY = gridBaseY;
  this.speed = 5;
  this.direction = right;
  this.radius = PACMAN_RADIUS;
  this.ghostHouse = true;
  this.dazzled = false;

  this.meshContainer.add(this.normalMesh);
  this.meshContainer.position.set(this.posX, this.posY, 0);

  this.dazzle = function () {
    this.meshContainer.remove(this.normalMesh);
    this.meshContainer.add(this.dizzyMesh);
    this.changeSpeed(3);
    // ensure ghost doesn't leave grid
    if (this.posX > 0) this.posX = this.posX - this.posX % this.speed;
    if (this.posY > 0) this.posY = this.posY - this.posY % this.speed;
    this.dazzled = true;
  };

  this.undazzle = function () {
    this.meshContainer.remove(this.dizzyMesh);
    this.meshContainer.add(this.normalMesh);
    // only change speed if ghost is not "dead"
    if (!this.dead) this.changeSpeed(5);
    // ensure ghost doesn't leave grid
    if (this.posX > 0) this.posX = this.posX - this.posX % this.speed;
    if (this.posY > 0) this.posY = this.posY - this.posY % this.speed;
    this.dazzled = false;
  };

  this.getCenterX = function () {
    return this.posX + this.radius;
  };

  this.getCenterY = function () {
    return this.posY + this.radius;
  };

  this.reset = function () {
    this.meshContainer.remove(this.eyesMesh);
    this.meshContainer.remove(this.dizzyMesh);
    this.meshContainer.add(this.normalMesh);
    this.dead = false;
    this.posX = this.startPosX;
    this.posY = this.startPosY;
    this.ghostHouse = true;
    this.hasStopped = false;
    this.undazzle();
  };

  this.stop = function () {
    this.dirX = 0;
    this.dirY = 0;
  };

  this.die = function () {
    this.dead = true;
    this.meshContainer.remove(this.normalMesh);
    this.meshContainer.remove(this.dizzyMesh);
    this.meshContainer.add(this.eyesMesh);
    this.changeSpeed(5);
  };

  this.changeSpeed = function (s) {
    // adjust gridPosition to new speed
    this.posX = Math.round(this.posX / s) * s;
    this.posY = Math.round(this.posY / s) * s;
    this.speed = s;
  };

  this.move = function () {
    this.checkDirectionChange();
    this.checkCollision();

    // leave Ghost House
    if (this.ghostHouse == true) {
      // Clyde does not start chasing before 2/3 of all pills are eaten
      if (this.name === "clyde") {
        if ((game.pillCount > 104 / 3)) {
          this.hasStopped = true;
        } else {
          this.hasStopped = false;
        }
      }
      // Inky starts after 30 pills
      if (this.name === "inky") {
        if ((game.pillCount > 104 - 30)) {
          this.hasStopped = true;
        } else {
          this.hasStopped = false;
        }
      }

      if ((this.getGridPosY() == 7) && this.inGrid()) {
        if ((this.getGridPosX() == 7)) this.setDirection(right);
        if ((this.getGridPosX() == 8) || this.getGridPosX() == 9) this.setDirection(up);
        if ((this.getGridPosX() == 10)) this.setDirection(left);
      }
      if ((this.getGridPosY() == 9) && ((this.getGridPosX() == 8) || (this.getGridPosX() == 9)) && this.inGrid()) {
        this.ghostHouse = false;
      }
    }

    if (this.dead && this.posX === this.startPosX && this.posY === this.startPosY) {
      this.hasStopped = true;
      if (!this.dazzled) {
        this.reset();
      }
    }

    if (!this.hasStopped) {
      // Appear from the opposite side or simply move forward
      if (this.dirX === 1 && this.posX === game.width - PACMAN_RADIUS) {
        this.posX = PACMAN_RADIUS;
      } else if (this.dirX === -1 && this.posX === PACMAN_RADIUS) {
        this.posX = game.width - PACMAN_RADIUS;
      } else if (this.dirY === 1 && this.posY === game.height - PACMAN_RADIUS) {
        this.posY = PACMAN_RADIUS;
      } else if (this.dirY === -1 && this.posY === PACMAN_RADIUS) {
        this.posY = game.height - PACMAN_RADIUS;
      } else {
        this.posX += this.speed * this.dirX;
        this.posY += this.speed * this.dirY;
      }

      this.meshContainer.position.set(this.posX, this.posY, 0);
    }
  };

  this.checkCollision = function () {
    /* Check Back to Home */
    if (this.dead && (this.getGridPosX() === this.startPosX / (PACMAN_RADIUS * 2)) && (this.getGridPosY() === this.startPosY / (PACMAN_RADIUS * 2))) {
      this.reset();
    } else {
      /* Check Ghost / Pacman Collision			*/
      if ((between(pacman.getCenterX(), this.getCenterX() - 10, this.getCenterX() + 10))
          && (between(pacman.getCenterY(), this.getCenterY() - 10, this.getCenterY() + 10))) {
        if ((!this.dazzled) && (!this.dead)) {
          pacman.die();
        } else {
          this.die();
        }
      }
    }
  };

  this.getNextDirection = function () {
    // get next field
    var gridX = this.getGridPosX();
    var gridY = this.getGridPosY();
    var targetGridX;
    var targetGridY;

    // get target
    if (this.dead) {
      // go Home
      targetGridX = this.getGridPosX(this.startPosX);
      targetGridY = this.getGridPosX(this.startPosY);
    } else if (game.ghostMode == 0) {
      // Scatter Mode
      targetGridX = (this.gridBaseX - PACMAN_RADIUS) / (PACMAN_RADIUS * 2);
      targetGridY = (this.gridBaseY - PACMAN_RADIUS) / (PACMAN_RADIUS * 2);
    } else if (game.ghostMode == 1) {
      // Chase Mode
      switch (this.name) {
        case "pinky":
          var pacmanDir = pacman.direction;
          var pacmanDirX = pacmanDir.dirX == 0 ? -pacmanDir.dirY : pacmanDir.dirX;
          var pacmanDirY = pacmanDir.dirY == 0 ? -pacmanDir.dirX : pacmanDir.dirY;

          targetGridX = (pacman.getGridPosX() + pacmanDirX * 4) % (game.width / pacman.radius + 1);
          targetGridY = (pacman.getGridPosY() + pacmanDirY * 4) % (game.height / pacman.radius + 1);
          break;
        case "blinky":
          targetGridX = pacman.getGridPosX();
          targetGridY = pacman.getGridPosY();
          break;
        case "inky":
          targetGridX = pacman.getGridPosX() + 2 * pacman.direction.dirX;
          targetGridY = pacman.getGridPosY() + 2 * pacman.direction.dirY;
          var vX = targetGridX - blinky.getGridPosX();
          var vY = targetGridY - blinky.getGridPosY();
          targetGridX = Math.abs(blinky.getGridPosX() + vX * 2);
          targetGridY = Math.abs(blinky.getGridPosY() + vY * 2);
          break;
        case "clyde":
          targetGridX = pacman.getGridPosX();
          targetGridY = pacman.getGridPosY();
          var dist = Math.sqrt(Math.pow((gridX - targetGridX), 2) + Math.pow((gridY - targetGridY), 2));

          if (dist < 5) {
            targetGridX = this.gridBaseX;
            targetGridY = this.gridBaseY;
          }
          break;
      }
    }

    var dirs = [{}, {}, {}, {}];
    dirs[0].field = game.getMapContent(gridX, gridY + 1);
    dirs[0].dir = up;
    dirs[0].distance = Math.sqrt(Math.pow((gridX - targetGridX), 2) + Math.pow((gridY + 1 - targetGridY), 2));

    dirs[1].field = game.getMapContent(gridX, gridY - 1);
    dirs[1].dir = down;
    dirs[1].distance = Math.sqrt(Math.pow((gridX - targetGridX), 2) + Math.pow((gridY - 1 - targetGridY), 2));

    dirs[2].field = game.getMapContent(gridX + 1, gridY);
    dirs[2].dir = right;
    dirs[2].distance = Math.sqrt(Math.pow((gridX + 1 - targetGridX), 2) + Math.pow((gridY - targetGridY), 2));

    dirs[3].field = game.getMapContent(gridX - 1, gridY);
    dirs[3].dir = left;
    dirs[3].distance = Math.sqrt(Math.pow((gridX - 1 - targetGridX), 2) + Math.pow((gridY - targetGridY), 2));

    // Sort possible directions by distance
    function compare(a, b) {
      if (a.distance < b.distance)
        return -1;
      if (a.distance > b.distance)
        return 1;
      return 0;
    }

    var sortedDirs = dirs.sort(compare);

    var direction = this.dir;

    if (this.dead) {
      for (var i = sortedDirs.length - 1; i >= 0; i--) {
        if ((sortedDirs[i].field != "wall") && !(sortedDirs[i].dir.equals(this.getOppositeDirection()))) {
          direction = sortedDirs[i].dir;
        }
      }
    } else {
      for (var i = sortedDirs.length - 1; i >= 0; i--) {
        if ((sortedDirs[i].field != "wall") && (sortedDirs[i].field != "door") && !(sortedDirs[i].dir.equals(this.getOppositeDirection()))) {
          direction = sortedDirs[i].dir;
        }
      }
    }

    this.directionWatcher.set(direction);
  };
}
Ghost.prototype = new Figure();

/************************************************* Game initialization ************************************************/
$(document).ready(function () {
  // --------------- Control
  // Keyboard
  window.addEventListener('keydown', doKeyDown, true);
  $('#canvas-container').click(function () {
    if (!(game.gameOver == true))  game.pauseResume();
  });
  // Menu
  $(document).on('click', '.button#newGame', function (event) {
    game.newGame();
  });
  // toggleSound
  $(document).on('click', '.controlSound', function (event) {
    game.toggleSound();
  });

  //game.initMap();
  pacmanScene = new PacmanScene();
  pacmanScene.init('pacman');

  // Initialize the game
  game.init(0);
});

/************************************************ Support Three.js code ***********************************************/
window.time = 0;
window.SimpleScene = function () {
  this.init = function (name) {
    ///////////
    // Scene //
    ///////////
    this.scene = new THREE.Scene();

    ////////////
    // Camera //
    ////////////
    var SCREEN_WIDTH = window.innerWidth;
    var SCREEN_HEIGHT = window.innerHeight;
    var VIEW_ANGLE = 50;
    var ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT;
    var NEAR = 0.1;
    var FAR = 20000;

    // set up camera
    var camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
    camera.position.set(0, 0, 1000);
    camera.lookAt(new THREE.Vector3(270, 195, 0));
    this.scene.add(camera);

    //////////////
    // Renderer //
    //////////////
    var renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    document.getElementById(name).appendChild(renderer.domElement);

    //////////////
    // Controls //
    //////////////
    this.controls = new THREE.OrbitControls( camera, renderer.domElement );
    for (var i = 0; i < 135; i++) {
      this.controls.pan(new THREE.Vector3(1, 0, 0));
    }

    // CALL THE USER'S SETUP FUNCTION JUST ONCE.
    this.setup();

    // START THE ANIMATION LOOP.
    var that = this;
    (function tick() {
      time = (new Date().getTime()) / 1000;
      that.update();
      renderer.render(that.scene, camera);
      requestAnimationFrame(tick);
    })();
  }
};

function PacmanScene() {
  this.setup = function () {
    ///////////
    // LIGHT //
    ///////////
    var light = new THREE.PointLight(0xffffff);
    light.position.set(0,0,250);
    this.scene.add(light);
    var ambientLight = new THREE.AmbientLight(0x111111);

    ///////////
    // FLOOR //
    ///////////
    var floorMaterial = new THREE.MeshBasicMaterial( {color: '#000000', side: THREE.DoubleSide} );
    var floorGeometry = new THREE.PlaneGeometry(540, 390, 1, 1);
    var floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.set(270, 195, -.1);
    //floor.rotation.x = Math.PI / 2;
    this.scene.add(floor);

    /////////
    // SKY //
    /////////
    // recommend either a skybox or fog effect (can't use both at the same time)
    // without one of these, the scene's background color is determined by webpage background
    // make sure the camera's "far" value is large enough so that it will render the skyBox!
    var skyBoxGeometry = new THREE.CubeGeometry( 10000, 10000, 10000 );
    // BackSide: render faces from inside of the cube, instead of from outside (default).
    var skyBoxMaterial = new THREE.MeshBasicMaterial( { color: 0x9999ff, side: THREE.BackSide } );
    var skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
    this.scene.add(skyBox);

    // fog must be added to scene before first render
    //this.scene.fog = new THREE.FogExp2( 0x9999ff, 0.00025 );
  };

  this.update = function () {
    this.controls.update();

    refreshCount++;
    if (refreshCount >= gameSpeed && !game.gameOver && game.isInitialized) {
      refreshCount = 0;
      // Make changes before next loop
      pacman.move();
      pacman.checkDirectionChange();
      pacman.checkCollisions();		// has to be the LAST method called on pacman

      blinky.move();
      inky.move();
      pinky.move();
      clyde.move();

      game.checkGhostMode();
    }

    // All dots collected?
    game.check();
  };
}
PacmanScene.prototype = new SimpleScene;
