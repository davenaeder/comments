/**
 * TODO
 *
 * Externalize window event handling
 * Camera handling and functionality
 * - drag and spin example: http://localdev/threedee/threejs/examples/webgl_geometry_extrude_shapes.html
 * - normal handling (what is used initially)
 * - this should include all event listeners for camera operations
 * Shaders
 * - http://localdev/threedee/threejs/examples/webgl_custom_attributes_particles2.html
 * - http://www.html5rocks.com/en/tutorials/webgl/million_letters/
 * - blur shader: http://localdev/threedee/threejs/examples/webgl_particles_sprites.html
 * Build OOP way
 * - Comment Class (Node item)
 * Implement TweenMax where necessary
 */

/**
 * Controls
 *
 * hide / show stats
 * reset camera position
 * choose camera type
 * show xyz coordinates in center
 */


/**
 * Sphere Idea
 * All comments are on perimeter of sphere. When a comment is added, the connections that its makes (the conversation) is
 * highlighted.
 */

/**
 * Top Down Idea
 * Comments with no parents are displayed on top. Any child comments are displayed going down in y direction. Lines are
 * drawn to show comment connections
 */

/**
 * Universe Idea
 * A conversation is a cluster (a group of comments). Within each cluster all the nodes organize themselves uniformaly (gravity / spring / repel).
 * In the 'universe' these clusters will organize themselves uniformly. Random comments will 'fill in the gaps'
 */

/**
 * Note: if you notice bad framerate, make sure display is set to "Best For Retina"
 */

if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var container, stats;
var camera, scene, renderer, particles, line, nodeMaterial, parameters, i, h, color;
var mouseX = 0, mouseY = 0, scrollPos = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var comments = [];
createComments(1000);

init();
animate();

function init() {

  // create container div
  container = document.createElement( 'div' );
  document.body.appendChild( container );

  // SCENE
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2( 0x000000, 0.0007 );

  // CAMERA
  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 3000 );
  camera.position.z = scrollPos = 1000;

  // RENDERER
  renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setSize( window.innerWidth, window.innerHeight );
  container.appendChild( renderer.domElement );

  // STATS
  stats = new Stats();
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.top = '0px';
  container.appendChild( stats.domElement );

  // BUILD SCENE
   buildSphereScene()
 // buildTopDownScene()

  document.addEventListener( 'mousemove', onDocumentMouseMove, false );
  document.addEventListener( 'touchstart', onDocumentTouchStart, false );
  document.addEventListener( 'touchmove', onDocumentTouchMove, false );
  document.addEventListener( 'mousewheel', onDocumentMouseScroll, false );
  //

  window.addEventListener( 'resize', onWindowResize, false );


  // do timer based 'add Comment' ?
  // comment { id, {x, y}, parentRef, [childRefs]}

}

function buildTopDownScene() {
  var sprite = THREE.ImageUtils.loadTexture( "img/textures/disc.png" );
  var lineMaterial = new THREE.LineBasicMaterial({
    color: 0xffffff,
    opacity: 0.5,
    transparent: true
  });

  var vertex;
  var lineGeometry;
  var nodeGeometry = new THREE.Geometry();

  for ( var i = 0; i < comments.length; i ++ ) {

    item = comments[i];

    if(item.parentNodeId === undefined) {
      vertex = new THREE.Vector3();
      vertex.x = Math.random() * 2 - 1;
      vertex.z = Math.random() * 2 - 1;
//      vertex.normalize();
      vertex.multiplyScalar( Math.random() * 10 + 650 );

      // say top is 200
      vertex.y = 200

    } else {
      vertex = comments[item.parentNodeId].vertex.clone()
      vertex.x += Util.randomRange(-50, 50);
      vertex.z += Util.randomRange(-50, 50)
      vertex.y -= 100
    }


    // save vertex reference
    comments[i].vertex = vertex;
    nodeGeometry.vertices.push( vertex );

    // add line
    if(comments[i].parentNodeId !== undefined) {
      lineGeometry = new THREE.Geometry();
      lineGeometry.vertices.push( comments[ comments[i].parentNodeId ].vertex );
      lineGeometry.vertices.push( vertex );

      line = new THREE.Line( lineGeometry, lineMaterial );
      scene.add( line );
    }

  }


  // build particle system
  var nodeMaterial = new THREE.ParticleSystemMaterial( { size: 15, sizeAttenuation: false, map: sprite, transparent: true } );
  nodeMaterial.color.setHex( 0x00ff00 );

  particles = new THREE.ParticleSystem( nodeGeometry, nodeMaterial );
  particles.sortParticles = true;
  scene.add( particles );

}


// a sphere where all nodes are positioned on outside and lines are connecting inside
function buildSphereScene() {
  var sprite = THREE.ImageUtils.loadTexture( "img/textures/disc.png" );
  var lineMaterial = new THREE.LineBasicMaterial({
    color: 0xffffff,
    opacity: 0.5,
    transparent: true
  });


  // every vertex is a particle position
  var vertex;
  var lineGeometry;
  var nodeGeometry = new THREE.Geometry();

  for ( var i = 0; i < comments.length; i ++ ) {

    vertex = new THREE.Vector3();
    vertex.x = Math.random() * 2 - 1;
    vertex.y = Math.random() * 2 - 1;
    vertex.z = Math.random() * 2 - 1;
    vertex.normalize();
    vertex.multiplyScalar( Math.random() * 10 + 550 );

    // save vertex reference
    comments[i].vertex = vertex;
    nodeGeometry.vertices.push( vertex );

    // add line
    if(comments[i].parentNodeId !== undefined) {
      lineGeometry = new THREE.Geometry();
      lineGeometry.vertices.push( comments[ comments[i].parentNodeId ].vertex );
      lineGeometry.vertices.push( vertex );

      line = new THREE.Line( lineGeometry, lineMaterial );
      scene.add( line );
    }

  }


  // build particle system
  var nodeMaterial = new THREE.ParticleSystemMaterial( { size: 15, sizeAttenuation: false, map: sprite, transparent: true } );
  nodeMaterial.color.setHex( 0x00ff00 );

  particles = new THREE.ParticleSystem( nodeGeometry, nodeMaterial );
  particles.sortParticles = true;
  scene.add( particles );

}

function createComments(count) {
  // loop and create comment objets
  var i, item;
  for(i = 0; i < count; i++) {

    item = {
      id: i,
      children: [],
      message: "this is comment " + i
    };

    // parent node (a conversation) - about x% of time choose a parent node
    if(i !== 0 && (Math.random() <= 0.6)) {
      console.log("convo")
      item.parentNodeId = Util.randomRangeInt(0, i-1);

      // update parent with data
      comments[item.parentNodeId].children.push(i)
    }

    comments.push(item);
  }

}

function onWindowResize() {

  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}

function onDocumentMouseMove( event ) {

  mouseX = event.clientX - windowHalfX;
  mouseY = event.clientY - windowHalfY;

}

function onDocumentMouseScroll( event ) {
  event.preventDefault();
  scrollPos += event.wheelDeltaY * 0.5;
}

function onDocumentTouchStart( event ) {

  if ( event.touches.length === 1 ) {

    event.preventDefault();

    mouseX = event.touches[ 0 ].pageX - windowHalfX;
    mouseY = event.touches[ 0 ].pageY - windowHalfY;

  }

}

function onDocumentTouchMove( event ) {

  if ( event.touches.length === 1 ) {

    event.preventDefault();

    mouseX = event.touches[ 0 ].pageX - windowHalfX;
    mouseY = event.touches[ 0 ].pageY - windowHalfY;

  }

}

//

function animate() {

  requestAnimationFrame( animate );

  render();
  stats.update();

}

function render() {

//  var time = Date.now() * 0.00005;

  camera.position.x += ( mouseX - camera.position.x ) * 0.05;
  camera.position.y += ( - mouseY - camera.position.y ) * 0.05;

  camera.position.z += ( scrollPos - camera.position.z ) * 0.05;

  // face camera to relook at center (effect)
  camera.lookAt( scene.position );

  //console.log('funky.js :: render', scene.scene.children.length);
  // for ( i = 0; i < scene.children.length; i ++ ) {

  //   var object = scene.children[ i ];

  //   if ( object instanceof THREE.ParticleSystem ) {

  //     // object.rotation.x = time * i + 1; //( i < 4 ? i + 1 : - ( i + 1 ) );
  //     // object.rotation.y = time * i + 1; //( i < 4 ? i + 1 : - ( i + 1 ) );

  //     // object.rotation.z = time * i + 1; //( i < 4 ? i + 1 : - ( i + 1 ) );
  //   }

  // }

  // for ( i = 0; i < materials.length; i ++ ) {

  //   color = parameters[i][0];

  //   h = ( 360 * ( color[0] + time ) % 360 ) / 360;
  //   materials[i].color.setHSL( h, color[1], color[2] );

  // }

  renderer.render( scene, camera );

}
