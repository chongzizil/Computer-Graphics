PacmanFigureObjects = function (options) {
  var colors = {
    red: '#D0021B',
    blue: '#A0CCFF',
    pink: '#F5A7B1',
    orange: '#F5A623',
    dead: '#2E78CE'
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
    texture = THREE.ImageUtils.loadTexture("homework/project/images/pacman_face.png");
    geometry = new THREE.SphereGeometry(options.radius, 32, 32);
    material = new THREE.MeshBasicMaterial({map: texture});
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.y += options.radius;
    container.add(mesh)
  } else if (options.type === 'ghost') {
    switch (options.color) {
      case "red":
        texture = THREE.ImageUtils.loadTexture("homework/project/images/ghost_red.png");
        color = colors.red;
        break;
      case "blue":
        texture = THREE.ImageUtils.loadTexture("homework/project/images/ghost_blue.png");
        color = colors.blue;
        break;
      case "pink":
        texture = THREE.ImageUtils.loadTexture("homework/project/images/ghost_pink.png");
        color = colors.pink;
        break;
      default:
        texture = THREE.ImageUtils.loadTexture("homework/project/images/ghost_orange.png");
        color = colors.orange;
        break;
    }

    if (options.isDizzy) {
      texture = THREE.ImageUtils.loadTexture("homework/project/images/ghost_dizzy.png");
      color = colors.dead;
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
    texture = THREE.ImageUtils.loadTexture("homework/project/images/eye.png");
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