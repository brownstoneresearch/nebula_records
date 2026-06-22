
let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,0.1,1000);
let renderer = new THREE.WebGLRenderer({canvas:document.querySelector('#bg')});

renderer.setSize(window.innerWidth,window.innerHeight);

let stars = [];
for(let i=0;i<1000;i++){
let geometry = new THREE.SphereGeometry(0.1);
let material = new THREE.MeshBasicMaterial({color:0xffffff});
let star = new THREE.Mesh(geometry,material);

star.position.x = (Math.random()-0.5)*200;
star.position.y = (Math.random()-0.5)*200;
star.position.z = (Math.random()-0.5)*200;

scene.add(star);
stars.push(star);
}

camera.position.z = 50;

function animate(){
requestAnimationFrame(animate);
scene.rotation.y += 0.001;
renderer.render(scene,camera);
}
animate();

// AUDIO
let audio = new Audio();
audio.src = "track.mp3";

function play(){audio.play();}
function pause(){audio.pause();}
