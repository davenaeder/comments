
// TODO
// - externalize window event handling
// - externalize camera
// - controls
//    - hide/show stats
//    - rotate camera / camera controls with common functionality
// - util
//    - random range
// - orbit controls
//    - consider using with momentum https://gist.github.com/paulkaplan/5770247

// - is using blur - http://localdev/threedee/threejs/examples/webgl_particles_sprites.html


/**
 * Note: if you notice bad framerate, make sure display is set to "Best For Retina"
 */

if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var container, stats;
var camera, scene, renderer, particles, geometry, lineMaterial, line, nodeMaterial, parameters, i, h, color;
var mouseX = 0, mouseY = 0, scrollPos = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var comments = [];
// createComments(1000);

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
  nodeMaterial = new THREE.SpriteMaterial( {
    color: 0xffffff,
    opacity: 1
  });

  geometry = new THREE.Geometry();

  var particle;
  for ( var i = 0; i < 100; i ++ ) {

    particle = new THREE.Sprite( nodeMaterial );
    particle.position.x = Math.random() * 2 - 1;
    particle.position.y = Math.random() * 2 - 1;
    particle.position.z = Math.random() * 2 - 1;
    particle.position.normalize();
    particle.position.multiplyScalar( Math.random() * 10 + 450 );
    particle.scale.x = particle.scale.y = 10;
    //scene.add( particle );

    geometry.vertices.push( particle.position );

  }

  // lines
  lineMaterial = new THREE.LineBasicMaterial({
    color: 0xffffff,
    opacity: 1,
    transparent: false
  });
  
  line = new THREE.Line( geometry, lineMaterial );
  scene.add( line );





  // geometry = new THREE.Geometry();

  // for ( i = 0; i < 20000; i ++ ) {

  //   var vertex = new THREE.Vector3();
  //   vertex.x = Math.random() * 800 - 400;
  //   vertex.y = Math.random() * 800 - 400;
  //   vertex.z = Math.random() * 800 - 400;

  //   geometry.vertices.push( vertex );

  // }

  // parameters = [
  //   [ [1, 1, 0.5], 5 ],
  //   [ [0.95, 1, 0.5], 4 ],
  //   [ [0.90, 1, 0.5], 3 ],
  //   [ [0.85, 1, 0.5], 2 ],
  //   [ [0.80, 1, 0.5], 1 ]
  // ];

  // for ( i = 0; i < parameters.length; i ++ ) {

  //   color = parameters[i][0];
  //   size  = parameters[i][1];

  //   materials[i] = new THREE.ParticleBasicMaterial( { size: size } );

  //   particles = new THREE.ParticleSystem( geometry, materials[i] );

  //   particles.rotation.x = Math.random() * 6;
  //   particles.rotation.y = Math.random() * 6;
  //   particles.rotation.z = Math.random() * 6;

  //   scene.add( particles );

  // }



  document.addEventListener( 'mousemove', onDocumentMouseMove, false );
  document.addEventListener( 'touchstart', onDocumentTouchStart, false );
  document.addEventListener( 'touchmove', onDocumentTouchMove, false );
  document.addEventListener( 'mousewheel', onDocumentMouseScroll, false );
  //

  window.addEventListener( 'resize', onWindowResize, false );


  // do timer based 'add Comment' ?
  // comment { id, {x, y}, parentRef, [childRefs]}

}

function createComments(count) {
  // loop and create comment objets
  var i, item;
  for(i = 0; i < count; i++) {
    item = {
      id: i,
      parentNode: undefined,
      message: "this is comment " + i
    };

    comments.push(item);
  }

  // loop and apply parent nodes (w/%)
  // parent node can only be from a previous comment
  for(i = 0; i < count; i++) {
    item = comments[i];

    // about 40% of time choose a parent node
    if(i !== 0 && (Math.random() <= 0.4)) {
      parentPosition = Util.randomRangeInt(0, i-1);
      item.parentNode = comments[parentPosition].id;
    }
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

  var time = Date.now() * 0.00005;

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
