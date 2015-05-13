PacmanFigureObjects = function (options) {
  var colors = {
    red: '#D0021B',
    blue: '#A0CCFF',
    pink: '#F5A7B1',
    orange: '#F5A623'
  };
  var container = new THREE.Object3D;
  var texture;
  var color;
  var geometry;
  var material;
  var mesh;

  // handle default options
  options = options || {};
  options.type = options.type !== undefined ? options.type : 'pacman';
  options.radius = options.radius !== undefined ? options.radius : 15;
  options.color = options.color !== undefined ? options.color : colors.red;
  options.isDizzy = options.isDizzy !== undefined ? options.isDizzy : false;

  if (options.type === 'pacman') {
    texture = THREE.ImageUtils.loadTexture("images/pacman_face.png");
    geometry = new THREE.SphereGeometry(options.radius, 32, 32);
    material = new THREE.MeshBasicMaterial({map: texture});
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.y += options.radius;
    container.add(mesh)
  } else if (options.type === 'ghost') {
    switch (options.color) {
      case "red":
        texture = !options.isDizzy ?
            THREE.ImageUtils.loadTexture("images/ghost_red.png") :
            THREE.ImageUtils.loadTexture("images/ghost_red_dizzy.png");
        color = colors.red;
        break;
      case "blue":
        texture = !options.isDizzy ?
            THREE.ImageUtils.loadTexture("images/ghost_blue.png") :
            THREE.ImageUtils.loadTexture("images/ghost_blue_dizzy.png");
        color = colors.blue;
        break;
      case "pink":
        texture = !options.isDizzy ?
            THREE.ImageUtils.loadTexture("images/ghost_pink.png") :
            THREE.ImageUtils.loadTexture("images/ghost_pink_dizzy.png");
        color = colors.pink;
        break;
      default:
        texture = !options.isDizzy ?
            THREE.ImageUtils.loadTexture("images/ghost_orange.png") :
            THREE.ImageUtils.loadTexture("images/ghost_orange_dizzy.png");
        color = colors.orange;
        break;
    }

    // Create the head
    geometry = new THREE.SphereGeometry(options.radius, 32, 32);
    material = new THREE.MeshBasicMaterial({map: texture});
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = options.radius;
    container.add(mesh);

    // Create the body
    geometry = new THREE.CylinderGeometry(options.radius, options.radius, options.radius);
    material = new THREE.MeshBasicMaterial({color: color});
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = options.radius / 2;
    container.add(mesh)
  } else if (options.type === 'eyes') {
    texture = THREE.ImageUtils.loadTexture("images/eye.png");
    // Right eye
    geometry = new THREE.SphereGeometry(options.radius / 4, 32, 32);
    material = new THREE.MeshBasicMaterial({map: texture});
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = options.radius / 2;
    mesh.position.y = options.radius * 1.75;
    container.add(mesh);
    // Left eye
    geometry = new THREE.SphereGeometry(options.radius / 4, 32, 32);
    material = new THREE.MeshBasicMaterial({map: texture});
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = -options.radius / 2;
    mesh.position.y = options.radius * 1.75;
    container.add(mesh);
  }

  container.rotateX(Math.PI / 2);

  return container;
};