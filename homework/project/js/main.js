/*************************************************** Global Variables *************************************************/
var pacmanScene;
var gRadius = 15;
var hasBuiltWall = false;
var pills = [];
var game;

// Figures
var pacman, // PACMAN
    inky, // BASHFUL (Blue)
    blinky, // SHADOW (Red)
    clyde, // POKEY (Orange)
    pinky; // SPEEDY (Pink)

// Meshes for Three.js
var meshes = {
  pacman: new PacmanFigureObjects({
    type: 'pacman',
    radius: gRadius
  }),
  ghosts: {
    inky: {
      normal: new PacmanFigureObjects({
        type: 'ghost',
        color: 'blue',
        isDizzy: false,
        radius: gRadius
      }),
      dizzy: new PacmanFigureObjects({
        type: 'ghost',
        isDizzy: true,
        radius: gRadius
      }),
      eyes: new PacmanFigureObjects({
        type: 'eyes',
        radius: gRadius
      })
    },
    blinky: {
      normal: new PacmanFigureObjects({
        type: 'ghost',
        color: 'red',
        isDizzy: false,
        radius: gRadius
      }),
      dizzy: new PacmanFigureObjects({
        type: 'ghost',
        isDizzy: true,
        radius: gRadius
      }),
      eyes: new PacmanFigureObjects({
        type: 'eyes',
        radius: gRadius
      })
    },
    clyde: {
      normal: new PacmanFigureObjects({
        type: 'ghost',
        color: 'orange',
        isDizzy: false,
        radius: gRadius
      }),
      dizzy: new PacmanFigureObjects({
        type: 'ghost',
        isDizzy: true,
        radius: gRadius
      }),
      eyes: new PacmanFigureObjects({
        type: 'eyes',
        radius: gRadius
      })
    },
    pinky: {
      normal: new PacmanFigureObjects({
        type: 'ghost',
        color: 'pink',
        isDizzy: false,
        radius: gRadius
      }),
      dizzy: new PacmanFigureObjects({
        type: 'ghost',
        isDizzy: true,
        radius: gRadius
      }),
      eyes: new PacmanFigureObjects({
        type: 'eyes',
        radius: gRadius
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

// Score
var Score = function () {
  this.fontMaterial = new THREE.MeshPhongMaterial({color: 0xffffff});
  this.sideMaterial = new THREE.MeshPhongMaterial({color: 0x000000});
  this.materialArray = [this.fontMaterial, this.sideMaterial];
  this.scoreMaterial = new THREE.MeshFaceMaterial(this.materialArray);
  this.scoreGeometry;
  this.scoreMesh;
  this.scale = .75;
  this.score = 0;
  this.mesh;
  this.set = function (i) {
    this.score = i;
    this.refresh();
  };
  this.add = function (i) {
    this.score += i;
    this.refresh();
  };
  this.refresh = function () {
    if (this.scoreMesh !== undefined && this.scoreMesh !== null) {
      pacmanScene.scene.remove(this.scoreMesh);
    }
    this.scoreGeometry = new THREE.TextGeometry("Score: " + this.score,
        {
          size: 30, height: 4, curveSegments: 3,
          font: "helvetiker", weight: "normal", style: "normal",
          bevelThickness: 1, bevelSize: 2, bevelEnabled: true,
          material: 0, extrudeMaterial: 1
        });

    this.scoreMesh = new THREE.Mesh(this.scoreGeometry, this.scoreMaterial);
    this.scoreMesh.scale.set(this.scale, this.scale, this.scale);
    this.scoreMesh.position.set(0, -35, 0);
    pacmanScene.scene.add(this.scoreMesh);
  };
};

// Lives
var Lives = function () {
  this.lives;
  this.avalableLives = 4;
  this.startX = 760;
  this.startY = 620;
  this.scale = .3;

  this.set = function (i) {
    this.avalableLives = i;
    this.refresh();
  };
  this.add = function (i) {
    this.avalableLives += i;
    this.refresh();
  };
  this.minus = function (i) {
    this.avalableLives -= i;
    this.refresh();
  };
  this.isFinalDead = function () {
    return this.avalableLives === 0;
  };
  this.getHeartMesh = function (x, y, z) {
    var heartShape = new THREE.Shape(); // From http://blog.burlock.org/html5/130-paths
    heartShape.moveTo(x + 25, y + 25);
    heartShape.bezierCurveTo(x + 25, y + 25, x + 20, y, x, y);
    heartShape.bezierCurveTo(x - 30, y, x - 30, y + 35, x - 30, y + 35);
    heartShape.bezierCurveTo(x - 30, y + 55, x - 10, y + 77, x + 25, y + 95);
    heartShape.bezierCurveTo(x + 60, y + 77, x + 80, y + 55, x + 80, y + 35);
    heartShape.bezierCurveTo(x + 80, y + 35, x + 80, y, x + 50, y);
    heartShape.bezierCurveTo(x + 35, y, x + 25, y + 25, x + 25, y + 25);
    var extrudeSettings = {
      amount: 8,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 2,
      bevelSize: 1,
      bevelThickness: 1
    };
    var geometry = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
    var mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color: '#f00000'}));
    mesh.position.set(x, y, 0);
    mesh.rotateZ(Math.PI);
    mesh.scale.set(this.scale, this.scale, this.scale);
    return mesh;
  };
  this.refresh = function () {
    if (this.lives !== undefined && this.lives !== null) {
      pacmanScene.scene.remove(this.lives);
    }

    this.lives = new THREE.Object3D();
    for (var i = 0; i < this.avalableLives; i++) {
      this.lives.add(this.getHeartMesh(this.startX - i * 60, this.startY, 0));
    }

    pacmanScene.scene.add(this.lives);
  };
};

// State
var State = function () {
  this.fontMaterial = new THREE.MeshPhongMaterial({color: 0xffffff});
  this.sideMaterial = new THREE.MeshPhongMaterial({color: 0x000000});
  this.materialArray = [this.fontMaterial, this.sideMaterial];
  this.stateMaterial = new THREE.MeshFaceMaterial(this.materialArray);
  this.stateGeometry;
  this.stateMesh;
  this.scale = .75;
  this.score = 0;
  this.mesh;
  this.stateText;
  this.refresh = function () {
    if (game.hasWon) {
      this.stateText = "Good job :)";
    } else if (game.gameOver) {
      this.stateText = "Game Over";
    } else if (game.isPaused) {
      this.stateText = "Paused";
    } else {
      this.stateText = "Eating";
    }

    if (this.stateMesh !== undefined && this.stateMesh !== null) {
      pacmanScene.scene.remove(this.stateMesh);
    }
    this.stateGeometry = new THREE.TextGeometry(this.stateText,
        {
          size: 30, height: 4, curveSegments: 3,
          font: "helvetiker", weight: "normal", style: "normal",
          bevelThickness: 1, bevelSize: 2, bevelEnabled: true,
          material: 0, extrudeMaterial: 1
        });

    this.stateGeometry.computeBoundingBox();
    var textWidth = this.stateGeometry.boundingBox.max.x - this.stateGeometry.boundingBox.min.x;

    this.stateMesh = new THREE.Mesh(this.stateGeometry, this.stateMaterial);
    this.stateMesh.scale.set(this.scale, this.scale, this.scale);
    this.stateMesh.position.set(0, 410, 0);
    pacmanScene.scene.add(this.stateMesh);
  };
};

// State
var Speed = function () {
  this.fontMaterial = new THREE.MeshPhongMaterial({color: 0xffffff});
  this.sideMaterial = new THREE.MeshPhongMaterial({color: 0x000000});
  this.materialArray = [this.fontMaterial, this.sideMaterial];
  this.speedMaterial = new THREE.MeshFaceMaterial(this.materialArray);
  this.speedGeometry;
  this.speedMesh;
  this.scale = .75;
  this.score = 0;
  this.mesh;
  this.refresh = function () {
    if (!angular.isUndefined(this.speedMesh)) {
      pacmanScene.scene.remove(this.speedMesh);
    }

    this.speedGeometry = new THREE.TextGeometry("Speed: " + pacmanScene.gameSpeed,
        {
          size: 30, height: 4, curveSegments: 3,
          font: "helvetiker", weight: "normal", style: "normal",
          bevelThickness: 1, bevelSize: 2, bevelEnabled: true,
          material: 0, extrudeMaterial: 1
        });

    this.speedGeometry.computeBoundingBox();
    var textWidth = this.speedGeometry.boundingBox.max.x - this.speedGeometry.boundingBox.min.x;

    this.speedMesh = new THREE.Mesh(this.speedGeometry, this.speedMaterial);
    this.speedMesh.scale.set(this.scale, this.scale, this.scale);
    this.speedMesh.position.set(540 - textWidth * 3 / 4, -35, 0);
    pacmanScene.scene.add(this.speedMesh);
  };
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

/*************************************************** Helper functions *************************************************/

var between = function (x, min, max) {
  return x >= min && x <= max;
};

/************************************************** Game Constructors *************************************************/
function Game() {
  // Game state
  this.isInitialized = false;
  this.isPaused = true;
  this.gameOver = false;
  this.hasWon = false;
  // Game info
  this.pillCount;
  this.score;
  this.lives;
  this.state;
  this.speed;
  // Ghost state
  this.isGhostFrightened = false;
  this.ghostFrightenedTimer = 240;
  // 0 = Scatter, 1 = Chase
  this.ghostMode = 0;
  // decrements each animationLoop execution
  this.ghostModeTimer = 200;
  // Others
  this.width = 540;
  this.height = 390;
  this.soundfx = 0;
  this.map;

  /* Game Functions */
  this.startGhostFrightened = function () {
    //console.log("Enable ghost frightened...");

    this.isGhostFrightened = true;
    this.ghostFrightenedTimer = 240;
    inky.dazzle();
    pinky.dazzle();
    blinky.dazzle();
    clyde.dazzle();
  };

  this.disableGhostFrightened = function () {
    //console.log("Disabled ghost frightened");

    this.isGhostFrightened = false;
    this.ghostFrigthenedTimer = 240;
    inky.undazzle();
    pinky.undazzle();
    blinky.undazzle();
    clyde.undazzle();
  };

  this.checkGhostMode = function () {
    if (this.isGhostFrightened) {
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
    var maxX = this.width / gRadius * 2 - 1;
    var maxY = this.height / gRadius * 2 - 1;
    if (x < 0) x = maxX + x;
    if (x > maxX) x = x - maxX;
    if (y < 0) y = maxY + y;
    if (y > maxY) y = y - maxY;

    if (!this.map.posY[y].posX[x]) {
      return 'boarder';
    }

    return this.map.posY[y].posX[x].type;
  };

  this.toggleSound = function () {
    this.soundfx == 0 ? this.soundfx = 1 : this.soundfx = 0;
    $('#mute').toggle();
  };

  this.reset = function () {
  };

  this.newGame = function () {
    var res = confirm("Are you sure you want to restart?");
    if (res) {
      this.init();
    }
  };

  this.resume = function () {
    this.isPaused = false;
    this.state.refresh();
  };

  this.pauseOrResume = function () {
    this.isPaused = !this.isPaused;
    this.state.refresh();
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

  this.foreachMapPosition = function (func) {
    var dotPosY;
    $.each(this.map.posY, function () {
      dotPosY = this.row;
      $.each(this.posX, function () {
        func(dotPosY, this.col);
        if (!angular.isUndefined(game.map.posY[dotPosY].posX[this.col].mesh)) {
          game.map.posY[dotPosY].posX[this.col].mesh.position.setZ(Math.sin(dotPosY + this.col + time * 3) * gRadius * .5 + gRadius * .5);
        }
      });
    });
  };

  this.buildWalls = function () {
    if (angular.isUndefined(this.map)) {
      return;
    }

    function buildWall(gridX, gridY) {
      var width = gRadius * 2;
      var height = gRadius * 2;
      var radius = gRadius;

      var wallGeometry = new THREE.BoxGeometry(width, height, radius);
      var wallMaterials = new THREE.MeshPhongMaterial({color: '#106BD6'});
      var wall = new THREE.Mesh(wallGeometry, wallMaterials);
      wall.position.set(gridX * 2 * radius + radius, gridY * 2 * radius + radius, radius / 2);
      pacmanScene.scene.add(wall);
    }

    this.foreachMapPosition(function (row, col) {
      if (game.map.posY[row].posX[col].type === "wall") {
        buildWall(col, row);
      } else if (game.map.posY[row].posX[col].type === 'door') {
        var doorGeometry = new THREE.CylinderGeometry(gRadius / 8, gRadius / 8, 2 * gRadius);
        var doorMaterials = new THREE.MeshPhongMaterial({color: '#106BD6'});
        var door = new THREE.Mesh(doorGeometry, doorMaterials);
        door.rotation.z = Math.PI / 2;
        door.position.set(col * 2 * gRadius + gRadius, row * 2 * gRadius + gRadius, gRadius / 2);
        pacmanScene.scene.add(door);
      }
    });
  };

  this.countPill = function () {
    if (angular.isUndefined(this.map)) {
      return;
    }

    var count = 0;
    this.foreachMapPosition(function (row, col) {
      if (game.map.posY[row].posX[col].type == "pill") {
        count++;
      }
    });

    this.pillCount = count;
  };

  this.fillPills = function () {
    if (angular.isUndefined(this.map)) {
      return;
    }

    var pillGeometry = new THREE.SphereGeometry(gRadius / 4, 32, 32);
    var powerPillGeometry = new THREE.SphereGeometry(gRadius / 2, 32, 32);
    var pillMaterials = new THREE.MeshPhongMaterial({color: '#ffffff'});

    this.foreachMapPosition(function (row, col) {
      var pill;
      if (game.map.posY[row].posX[col].type === "pill") {
        pill = new THREE.Mesh(pillGeometry.clone(), pillMaterials.clone());
        pill.position.set(col * gRadius * 2 + gRadius, row * gRadius * 2 + gRadius, gRadius / 4);
        pacmanScene.scene.add(pill);
      } else if (game.map.posY[row].posX[col].type === "powerpill") {
        pill = new THREE.Mesh(powerPillGeometry.clone(), pillMaterials.clone());
        pill.position.set(col * gRadius * 2 + gRadius, row * gRadius * 2 + gRadius, gRadius / 2);
        pacmanScene.scene.add(pill);
      }

      game.map.posY[row].posX[col].mesh = pill;
    });
  };

  this.clearPill = function () {
    this.foreachMapPosition(function (row, col) {
      pacmanScene.scene.remove(game.map.posY[row].posX[col].mesh);
    });
  };

  this.floatPill = function () {
    if (!angular.isUndefined(this.map)) {
      this.foreachMapPosition(function (row, col) {
        if (!angular.isUndefined(game.map.posY[row].posX[col].mesh)) {
          game.map.posY[row].posX[col].mesh.position.setZ(Math.sin(row + col + time * 3) * gRadius * .5 + gRadius * .5);
        }
      });
    }
  };

  this.init = function () {
    // Clear all old pills in the scene, only if the game is initialized once.
    if (this.isInitialized) {
      this.clearPill();
    }

    // Initialize the map (hard coded)
    this.initMap();

    // Fill the pills to the scene
    this.fillPills();
    this.countPill();

    // Initialize the info and build the wall once
    if (!this.isInitialized) {
      this.score = new Score();
      this.lives = new Lives();
      this.state = new State();
      this.speed = new Speed();
      this.buildWalls();
    }

    this.score.set(0);
    this.lives.set(3);
    this.state.refresh();
    this.speed.refresh();

    // Figures
    if (!this.isInitialized) {
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
    }

    this.hasWon = false;
    this.gameOver = false;
    this.isPaused = true;
    this.isInitialized = true;
    this.isGhostFrightened = false;
    this.ghostFrightenedTimer = 240;
    // 0 = Scatter, 1 = Chase
    this.ghostMode = 0;
    // decrements each animationLoop execution
    this.ghostModeTimer = 200;

    pacman.reset();
    pinky.reset();
    inky.reset();
    blinky.reset();
    clyde.reset();

    // blinky is the first to leave ghostHouse
    blinky.start();
    inky.start();
    pinky.start();
    clyde.start();
  };

  this.checkEndGame = function () {
    if (this.pillCount === 0 && !this.hasWon && !this.gameOver) {
      this.hasWon = true;
      this.gameOver = true;
      this.state.refresh();
    }
  };

  this.toPixelPos = function (gridPos) {
    return gridPos * gRadius * 2 + gRadius;
  };

  this.toGridPos = function (pixelPos) {
    var pos = pixelPos - gRadius;
    return ((pos % (gRadius * 2)) / (gRadius * 2));
  };
}

/*********************************************** Characters Constructors **********************************************/
// Figure Constructor, super class for Pacman and Ghost
function Figure() {
  this.currMesh;
  this.posX;
  this.posY;
  this.dirX = right.dirX;
  this.dirY = right.dirY;
  this.direction;
  this.isStopped = true;
  this.directionWatcher = new directionWatcher();

  this.getNextDirection = function () {
    //console.log("Figure getNextDirection");
  };

  this.checkDirectionChange = function () {
    if ((this.inGrid() && (this.directionWatcher.get() == null)) || this.isStopped) {
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
    var x = this.posX - gRadius;
    var y = this.posY - gRadius;

    if ((x % (gRadius * 2) === 0) && (y % (gRadius * 2) === 0)) return true;
    return false;
  };

  this.getOppositeDirection = function () {
    if (this.direction.equals(up)) return down;
    else if (this.direction.equals(down)) return up;
    else if (this.direction.equals(right)) return left;
    else if (this.direction.equals(left)) return right;
  };

  this.start = function () {
    this.isStopped = false;
  };

  this.stop = function () {
    this.isStopped = true;
  };

  this.getGridPosX = function (posX) {
    if (!posX) {
      posX = this.posX;
    }
    var x = posX - gRadius;
    return (x - (x % (gRadius * 2))) / (gRadius * 2);
  };

  this.getGridPosY = function (posY) {
    if (!posY) {
      posY = this.posY;
    }
    var y = posY - gRadius;
    return (y - (y % (gRadius * 2))) / (gRadius * 2);
  };

  this.setDirection = function (dir) {
    this.dirX = dir.dirX;
    this.dirY = dir.dirY;
    this.direction = dir;
  };

  this.setPosition = function (x, y) {
    this.posX = x;
    this.posY = y;
  }
}

// Pacman Constructor
function Pacman() {
  this.currMesh = meshes.pacman;
  this.posX = gRadius;
  this.posY = 6 * 2 * gRadius + gRadius;
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

  this.getCenterX = function () {
    return this.posX + gRadius;
  };

  this.getCenterY = function () {
    return this.posY + gRadius;
  };

  this.move = function () {
    if (this.beastModeTimer > 0) {
      this.beastModeTimer--;
    }
    if ((this.beastModeTimer == 0) && (this.beastMode == true)) {
      this.disableBeastMode();
    }

    // Appear from the opposite side or simply move forward
    if (this.dirX === 1 && this.posX === game.width - gRadius) {
      this.posX = gRadius;
    } else if (this.dirX === -1 && this.posX === gRadius) {
      this.posX = game.width - gRadius;
    } else if (this.dirY === 1 && this.posY === game.height - gRadius) {
      this.posY = gRadius;
    } else if (this.dirY === -1 && this.posY === gRadius) {
      this.posY = game.height - gRadius;
    } else {
      this.posX += this.speed * this.dirX;
      this.posY += this.speed * this.dirY;
    }

    this.currMesh.position.set(this.posX, this.posY, 0);
  };

  this.checkCollisions = function () {
    // Check it's not stuck and frozen
    if ((this.stuckX == 0) && (this.stuckY == 0) && this.isDead == false) {
      if ((this.dirX === -1 && this.posX === gRadius)
          || (this.dirX === 1 && this.posX === game.width - gRadius)
          || (this.dirY === -1 && this.posY === gRadius)
          || (this.dirY === 1 && this.posY === game.height - gRadius)) {
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
      if ((this.dirX == -1) && ((this.posX - gRadius) % (gRadius * 2) === 0)) gridAheadX -= 1;
      if ((this.dirY == -1) && ((this.posY - gRadius) % (gRadius * 2) === 0)) gridAheadY -= 1;
      var fieldAhead = game.getMapContent(gridAheadX, gridAheadY);

      // Check Pill Collision
      if ((field === "pill") || (field === "powerpill")) {
        var x = game.toPixelPos(gridX);
        var y = game.toPixelPos(gridY);
        if (
            ((this.dirX == 1 || this.dirX == -1) && between(this.posX, x - gRadius * .25, x + gRadius * .25))
            || ((this.dirY == 1 || this.dirY == -1) && between(this.posY, y - gRadius * .25, y + gRadius * .25))
            || (fieldAhead === "wall")
        ) {
          if (field === "powerpill") {
            Sound.play("powerpill");
            this.enableBeastMode();
            game.startGhostFrightened();
          } else {
            Sound.play("waka");
            game.pillCount--;
          }
          game.score.add(1);
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
          if (x <= -1) x = game.width / (gRadius * 2) - 1;
          if (x >= game.width / (gRadius * 2)) x = 0;
          if (y <= -1) x = game.height / (gRadius * 2) - 1;
          if (y >= game.height / (gRadius * 2)) y = 0;

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
    this.dirX = dir.dirX;
    this.dirY = dir.dirY;
    this.direction = dir;
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
    this.posX = gRadius;
    this.posY = 6 * 2 * gRadius + gRadius;
    this.currMesh.position.set(this.posX, this.posY, 0);
    this.setDirection(right);
    this.stuckX = 0;
    this.stuckY = 0;
  };

  this.die = function () {
    Sound.play("die");
    this.reset();
    pinky.reset();
    inky.reset();
    blinky.reset();
    clyde.reset();
    game.lives.minus(1);
    if (game.lives.isFinalDead()) {
      game.gameOver = true;
      game.state.refresh();
    }
  };
}
Pacman.prototype = new Figure();

// Ghost Constructor
function Ghost(name, gridPosX, gridPosY, gridBaseX, gridBaseY) {
  this.meshes;
  switch (name) {
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
  this.eyesMesh = this.meshes.eyes;
  this.name = name;
  this.posX = gridPosX * gRadius * 2 + gRadius;
  this.posY = gridPosY * gRadius * 2 + gRadius;
  this.startPosX = gridPosX * gRadius * 2 + gRadius;
  this.startPosY = gridPosY * gRadius * 2 + gRadius;
  this.gridBaseX = gridBaseX;
  this.gridBaseY = gridBaseY;
  this.speed = 5;
  this.direction = right;
  this.ghostHouse = true;
  this.dazzled = false;

  this.dazzle = function () {
    this.meshContainer.remove(this.normalMesh);
    this.meshContainer.remove(this.eyesMesh);
    this.meshContainer.add(this.dizzyMesh);
    this.changeSpeed(3);
    // ensure ghost doesn't leave grid
    if (this.posX > 0) this.posX = this.posX - this.posX % this.speed;
    if (this.posY > 0) this.posY = this.posY - this.posY % this.speed;
    this.dazzled = true;
  };

  this.undazzle = function () {
    this.meshContainer.remove(this.dizzyMesh);
    this.meshContainer.remove(this.eyesMesh);
    this.meshContainer.add(this.normalMesh);
    // only change speed if ghost is not "dead"
    if (!this.dead) this.changeSpeed(5);
    // ensure ghost doesn't leave grid
    if (this.posX > 0) this.posX = this.posX - this.posX % this.speed;
    if (this.posY > 0) this.posY = this.posY - this.posY % this.speed;
    this.dazzled = false;
  };

  this.getCenterX = function () {
    return this.posX + gRadius;
  };

  this.getCenterY = function () {
    return this.posY + gRadius;
  };

  this.reset = function () {
    this.dead = false;
    this.posX = this.startPosX;
    this.posY = this.startPosY;
    this.ghostHouse = true;
    this.isStopped = false;
    this.meshContainer.remove(this.dizzyMesh);
    this.meshContainer.remove(this.eyesMesh);
    this.meshContainer.add(this.normalMesh);
    this.meshContainer.position.set(this.posX, this.posY, 0);
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
          this.isStopped = true;
        } else {
          this.isStopped = false;
        }
      }
      // Inky starts after 30 pills
      if (this.name === "inky") {
        if ((game.pillCount > 104 - 30)) {
          this.isStopped = true;
        } else {
          this.isStopped = false;
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
      this.isStopped = true;
      if (!this.dazzled) {
        this.reset();
      }
    }

    if (!this.isStopped) {
      // Appear from the opposite side or simply move forward
      if (this.dirX === 1 && this.posX === game.width - gRadius) {
        this.posX = gRadius;
      } else if (this.dirX === -1 && this.posX === gRadius) {
        this.posX = game.width - gRadius;
      } else if (this.dirY === 1 && this.posY === game.height - gRadius) {
        this.posY = gRadius;
      } else if (this.dirY === -1 && this.posY === gRadius) {
        this.posY = game.height - gRadius;
      } else {
        this.posX += this.speed * this.dirX;
        this.posY += this.speed * this.dirY;
      }

      this.meshContainer.position.set(this.posX, this.posY, 0);
    }
  };

  this.checkCollision = function () {
    /* Check Back to Home */
    if (this.dead && (this.getGridPosX() === this.startPosX / (gRadius * 2)) && (this.getGridPosY() === this.startPosY / (gRadius * 2))) {
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
    } else if (game.ghostMode === 0) {
      // Scatter Mode
      targetGridX = this.gridBaseX;
      targetGridY = this.gridBaseY;
    } else if (game.ghostMode === 1) {
      // Chase Mode
      switch (this.name) {
        case "pinky":
          var pacmanDir = pacman.direction;
          var pacmanDirX = pacmanDir.dirX == 0 ? -pacmanDir.dirY : pacmanDir.dirX;
          var pacmanDirY = pacmanDir.dirY == 0 ? -pacmanDir.dirX : pacmanDir.dirY;

          targetGridX = (pacman.getGridPosX() + pacmanDirX * 4);
          targetGridY = (pacman.getGridPosY() + pacmanDirY * 4);
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

    var camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
    camera.position.set(0, 0, 750);
    camera.lookAt(new THREE.Vector3(270, 195, 0));
    this.scene.add(camera);

    ///////////
    // Title //
    ///////////
    var materialFront = new THREE.MeshPhongMaterial({color: 0xffff03});
    var materialSide = new THREE.MeshPhongMaterial({color: 0x000000});
    var materialArray = [materialFront, materialSide];
    var titleGeometry = new THREE.TextGeometry("PACMAN",
        {
          size: 30, height: 4, curveSegments: 3,
          font: "helvetiker", weight: "bold", style: "normal",
          bevelThickness: 1, bevelSize: 2, bevelEnabled: true,
          material: 0, extrudeMaterial: 1
        });

    var titleMaterial = new THREE.MeshFaceMaterial(materialArray);
    var titleMesh = new THREE.Mesh(titleGeometry, titleMaterial);

    titleGeometry.computeBoundingBox();
    var textWidth = titleGeometry.boundingBox.max.x - titleGeometry.boundingBox.min.x;

    titleMesh.position.set(270 - textWidth / 2, 450, 0);
    this.scene.add(titleMesh);

    //////////////
    // Renderer //
    //////////////
    var renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    document.getElementById(name).appendChild(renderer.domElement);

    //////////////
    // Controls //
    //////////////
    this.controls = new THREE.OrbitControls(camera, renderer.domElement);
    THREEx.WindowResize(renderer, camera);
    for (var i = 0; i < 135; i++) {
      this.controls.pan(new THREE.Vector3(1, 0, 0));
    }
    for (var i = 0; i < 70; i++) {
      this.controls.pan(new THREE.Vector3(0, 1, 0));
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

/*************************************************** Pacman's Scene ***************************************************/
function PacmanScene() {
  this.refreshThreshold = 100;
  this.gameSpeed = 50;
  this.refreshCount = 0;

  // Set up the basic stuff which including the light source, the floor and the sky :)
  this.setup = function () {
    ///////////
    // LIGHT //
    ///////////
    var light = new THREE.PointLight(0xffffff);
    light.position.set(0, 0, 1000);
    this.scene.add(light);

    ///////////
    // FLOOR //
    ///////////
    var floorMaterial = new THREE.MeshPhongMaterial({
      color: '#000000',
      side: THREE.DoubleSide
    });
    var floorGeometry = new THREE.PlaneBufferGeometry(540, 390, 1, 1);
    var floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.set(270, 195, -.1);
    this.scene.add(floor);

    /////////
    // SKY //
    /////////
    //var skyBoxGeometry = new THREE.CubeGeometry( 10000, 10000, 10000 );
    //var skyBoxMaterial = new THREE.MeshBasicMaterial( { color: 0x9999ff, side: THREE.BackSide } );
    //var skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
    //this.scene.add(skyBox);

    this.scene.fog = new THREE.FogExp2(0x9999ff, 0.00025);
  };

  this.update = function () {
    this.controls.update();

    this.refreshCount += this.gameSpeed;

    if (this.refreshCount >= this.refreshThreshold && !game.gameOver && !game.isPaused && game.isInitialized) {
      this.refreshCount = 0;

      // Pacman make move
      pacman.move();
      pacman.checkDirectionChange();
      pacman.checkCollisions(); // has to be the LAST method called on pacman

      // Four ghosts make move
      blinky.move();
      inky.move();
      pinky.move();
      clyde.move();

      game.checkGhostMode();


    }

    game.floatPill();

    // Check end game
    game.checkEndGame();
  };

  this.speedUp = function () {
    if (this.gameSpeed < 100) {
      this.gameSpeed += 1;
      game.speed.refresh();
    }
  };

  this.speedDown = function () {
    if (this.gameSpeed > 1) {
      this.gameSpeed -= 1;
      game.speed.refresh();
    }
  }
}
PacmanScene.prototype = new SimpleScene;

/**************************************************** Click Events ****************************************************/
function doKeyDown(evt) {
  switch (evt.keyCode) {
    case 38:	// UP Arrow Key pressed
      evt.preventDefault();
    case 87:	// W pressed
      pacman.directionWatcher.set(up);
      game.resume();
      break;
    case 40:	// DOWN Arrow Key pressed
      evt.preventDefault();
    case 83:	// S pressed
      pacman.directionWatcher.set(down);
      game.resume();
      break;
    case 37:	// LEFT Arrow Key pressed
      evt.preventDefault();
    case 65:	// A pressed
      pacman.directionWatcher.set(left);
      game.resume();
      break;
    case 39:	// RIGHT Arrow Key pressed
      evt.preventDefault();
    case 68:	// D pressed
      pacman.directionWatcher.set(right);
      game.resume();
      break;
    case 78:	// N pressed
      if (!$('#playerName').is(':focus')) {
        game.newGame();
      }
      break;
    case 77:	// M pressed
      game.toggleSound();
      break;
    case 32:	// SPACE pressed -> pause Game
      evt.preventDefault();
      if (!game.gameOver) {
        game.pauseOrResume();
      }
      break;
    case 187: // +
      evt.preventDefault();
      pacmanScene.speedUp();
      break;
    case 189: // -
      evt.preventDefault();
      pacmanScene.speedDown();
      break;
  }
}

/************************************************* Game initialization ************************************************/
$(document).ready(function () {
  // Add event listener for keyboard operation
  window.addEventListener('keydown', doKeyDown, true);

  pacmanScene = new PacmanScene();
  game = new Game();

  pacmanScene.init('pacman');
  game.init();
});