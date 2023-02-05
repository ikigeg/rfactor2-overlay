<script setup lang="ts">
import { ref, onMounted, reactive, watch } from "vue";
import VueSlider from "vue-slider-component";
import "vue-slider-component/theme/antd.css";
import type { Coords } from "../tracks";
import {
  Scene,
  PerspectiveCamera,
  OrthographicCamera,
  WebGLRenderer,
  Mesh,
  Euler,
  MeshBasicMaterial,
  LineBasicMaterial,
  BufferGeometry,
  Vector3,
  Line,
  LineSegments,
  Shape,
  ShapeGeometry,
} from "three";

const props = defineProps<{
  track: Coords[];
  pits: Coords[];
  cars: Coords[];
  racers: number;
}>();

const fov = ref(95);
const xPos = ref(0);
const yPos = ref(-40000);
const zPos = ref(0);
const xLook = ref(0);
const yLook = ref(0);
const zLook = ref(0);
const near = ref(0.1);
const far = ref(50000);

const data = reactive({
  fov,
  zPos,
  yPos,
  xPos,
  near,
  far,
  xLook,
  yLook,
  zLook,
});

const experience = ref<HTMLCanvasElement | null>(null);
let renderer: WebGLRenderer;

const width = 500; //window.innerWidth;
const height = 500; //window.innerHeight;

const scene = new Scene();

let cameraType = "ortho";

const distance = 500;
const camera =
  cameraType === "ortho"
    ? new OrthographicCamera(
        -distance,
        distance,
        distance,
        -distance,
        data.near,
        data.far
      )
    : new PerspectiveCamera(data.fov, width / height, data.near, data.far);

scene.add(camera);

const trackMaterial = new LineBasicMaterial({
  color: 0xffffff,
  linewidth: 100,
});

const track = new BufferGeometry().setFromPoints(
  props.track.map(([x, y, z]) => new Vector3(x, y, z))
);
const trackLine = new Line(track, trackMaterial);
// trackLine.rotateZ(90);
scene.add(trackLine);

const pitsMaterial = new LineBasicMaterial({ color: 0x00ff00 });
const pits = new BufferGeometry().setFromPoints(
  props.pits.map(([x, y, z]) => new Vector3(x, y, z))
);
const pitsLine = new LineSegments(pits, pitsMaterial);
scene.add(pitsLine);

const circleRadius = 10;
const circleShape = new Shape()
  .moveTo(0, circleRadius)
  .quadraticCurveTo(circleRadius, circleRadius, circleRadius, 0)
  .quadraticCurveTo(circleRadius, -circleRadius, 0, -circleRadius)
  .quadraticCurveTo(-circleRadius, -circleRadius, -circleRadius, 0)
  .quadraticCurveTo(-circleRadius, circleRadius, 0, circleRadius);
const circleGeometry = new ShapeGeometry(circleShape);
const material = new MeshBasicMaterial({ color: 0x00ff00 });

const triangleShape = new Shape()
  .moveTo(80, 20)
  .lineTo(40, 80)
  .lineTo(120, 80)
  .lineTo(80, 20); // close path
const triangleGeometry = new ShapeGeometry(triangleShape);

const me = () => {
  const thing = new Mesh(triangleGeometry, material);
  thing.position.x = 0;
  thing.position.y = 0;
  thing.position.z = 0;
  thing.geometry.center();
  // thing.visible = false;
  thing.rotateX(90);
  return thing;
};

const driver = () => {
  const thing = new Mesh(circleGeometry, material);
  thing.position.x = 0;
  thing.position.y = 0;
  thing.position.z = 0;
  thing.visible = false;
  thing.rotateX(90);
  return thing;
};

let racerRefs: Record<string, any> = {};
for (let i = 0; i <= props.racers; i += 1) {
  racerRefs[i] = i === 0 ? me() : driver();
  scene.add(racerRefs[i]);
}

const loop = () => {
  updateRenderer();
  updateCamera();

  // console.log(racerRefs[0].rotation.z);
  // racerRefs[0].rotation.z += 0.01;

  renderer.render(scene, camera);

  // racerRefs[0].rotateZ(racerRefs[0].rotation.z + 1);
  // console.log(racerRefs[0].rotation);

  requestAnimationFrame(loop);
};

watch(data, () => {
  updateCamera();
});

function updateRenderer() {
  renderer.setSize(width, height);
}

function updateCamera() {
  // camera.position.set(data.xPos, data.yPos, data.zPos);
  // camera.lookAt(data.xLook, data.yLook, data.zLook);
  // camera.position.x += 10;
}

const r = (radians: number) => {
  return (radians * 180) / Math.PI;
};
function updateCars() {
  xLook.value = props.cars[0][0];
  zLook.value = props.cars[0][2];

  const o = props.cars[0];
  const oldPos = new Vector3(
    racerRefs[0].position.x,
    racerRefs[0].position.z,
    0
  );
  const newPos = new Vector3(o[0], o[2], 0);
  const angle = oldPos.angleTo(newPos);
  // racerRefs[0].rotateZ(r(rot));
  const a = new Euler(0, 1, angle, "XYZ");
  // console.log({ newPos, angle, a, oldPos, deg: (angle * 180) / Math.PI });
  // rot.applyEuler(a);

  racerRefs[0].rotateZ(angle);
  // const ang = oldPos.angleTo(rot);

  // racerRefs[0].up.copy(
  //   new Vector3(
  //     racerRefs[0].position.x,
  //     racerRefs[0].position.x,
  //     racerRefs[0].position.x
  //   )
  // );
  // racerRefs[0].lookAt(new Vector3(o[0], o[1], o[2]));

  props.cars.map((c, i) => {
    racerRefs[i].position.x = c[0];
    racerRefs[i].position.y = c[1];
    racerRefs[i].position.z = c[2];
    racerRefs[i].visible = true;
  });

  // camera.position.set(props.cars[0][0], props.cars[0][1], data.zPos);
  // camera.lookAt(data.xLook, data.yLook, data.zLook);
  camera.position.x = props.cars[0][0];
  camera.lookAt(props.cars[0][0], data.yLook, data.zLook);
}

watch(props.cars, updateCars);

onMounted(() => {
  console.log("mounted");
  renderer = new WebGLRenderer({
    canvas: experience.value as unknown as HTMLCanvasElement,
    antialias: true,
    alpha: true,
  });
  // renderer.setClearColor(0x000000, 0);

  camera.position.set(data.xPos, data.yPos, data.zPos);
  camera.lookAt(data.xLook, data.yLook, data.zLook);

  loop();
});

const sliderMin = -1000;
const sliderMAX = 1000;
</script>

<template>
  <div class="wrapper">
    <div class="controls">
      <!-- <div>fov: <vue-slider v-model="fov" :min="50" :max="120" /></div> -->
      <div>
        xPos: <vue-slider v-model="xPos" :min="sliderMin" :max="sliderMAX" />
      </div>
      <div>yPos: <vue-slider v-model="yPos" :min="-50000" :max="50000" /></div>
      <div>
        zPos: <vue-slider v-model="zPos" :min="sliderMin" :max="sliderMAX" />
      </div>
      <!-- <div>near: <vue-slider v-model="near" :min="sliderMin" :max="sliderMAX" /></div>
      <div>far: <vue-slider v-model="far" :min="sliderMin" :max="sliderMAX" /></div> -->
      <div>
        xLook: <vue-slider v-model="xLook" :min="sliderMin" :max="sliderMAX" />
      </div>
      <div>
        yLook: <vue-slider v-model="yLook" :min="sliderMin" :max="sliderMAX" />
      </div>
      <div>
        zLook: <vue-slider v-model="zLook" :min="sliderMin" :max="sliderMAX" />
      </div>
    </div>
    <canvas ref="experience" />
  </div>
</template>

<style scoped>
.wrapper {
  display: flex;
}
.controls {
  width: 50%;
}
</style>
