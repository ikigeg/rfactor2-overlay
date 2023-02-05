<script setup lang="ts">
import { ref, onMounted } from "vue";
// import { RouterLink, RouterView } from "vue-router";

import type { Coords, TypedTrackMap } from "./tracks";
import { trackData } from "./tracks";
// import HelloWorld from "./components/HelloWorld.vue";
import TrackMap from "./components/TrackMap.vue";
// import { data, paths } from "./tracks/track1";
// console.log(data);
// console.log(paths);

// const c = (n: number) => Math.floor(n * 10);
const c = (n: number) => Math.floor(n);
// let minX = 0;
// let minY = 0;
// let maxX = 0;
// let maxY = 0;
// let minZ = 0;
// let maxZ = 0;
// const coords = ({ x, y, z }: Coords) => ({
//   x: c(x),
//   y: c(y),
//   z: c(z),
// });

// const pathMapper = (pathset: Coords, index: number) => {
//   const { x, y } = coords(pathset);
//   minX = x < minX ? x : minX;
//   minY = y < minY ? y : minY;
//   maxX = x > maxX ? x : maxX;
//   maxY = y > maxY ? y : maxY;
//   return `${index === 0 ? "M" : "L"} ${x} ${y}`;
// };
// const vectorMapper = (pathset: Coords) => {
//   const { x, y, z } = coords(pathset);
//   minX = x < minX ? x : minX;
//   minY = y < minY ? y : minY;
//   minZ = y < minZ ? z : minZ;
//   maxX = x > maxX ? x : maxX;
//   maxY = y > maxY ? y : maxY;
//   maxZ = z > maxZ ? y : maxZ;
//   return [x, y, z];
// };

// const path0 = paths[0].map(pathMapper).join(" ");
// const path1 = paths[1].map(pathMapper).join(" ");
const pathTrack = ref([] as Coords[]); // paths[0].map(vectorMapper);
const pathPits = ref([] as Coords[]); // paths[1].map(vectorMapper);
const cars = ref([] as number[][]);
const imageSrc = ref("");

// const rd = reactive({
//   cars,
// });

// const bounds = `${minX} ${minY} ${maxX + Math.abs(minX)} ${
//   maxY + Math.abs(minY)
// }`;
// console.log("Starting connection to WebSocket Servers", paths[1]);

const wsControlPanel = new WebSocket(
  "ws://localhost:5397/websocket/controlpanel"
);

wsControlPanel.onopen = (event) => {
  console.log("Successfully connected to the control panel server >", event);
};
wsControlPanel.onmessage = (event) => {
  const { type, body } = JSON.parse(event.data);
  // console.log("wsControlPanel >", type, body);
  if (type === "standings") {
    const newCars = (
      Object.values(body) as unknown as { carPosition: TypedTrackMap }[]
    ).map((b: { carPosition: TypedTrackMap }) => [
      c(b.carPosition.x),
      c(b.carPosition.y),
      c(b.carPosition.z),
    ]);
    cars.value.splice(0, cars.value.length, ...newCars);
  }
};

const wsUi = new WebSocket("ws://localhost:5397/websocket/ui");
wsUi.onopen = (event) => {
  console.log("Successfully connected to the ui server >", event);
};
wsUi.onmessage = (event) => {
  // console.log("wsUi >", JSON.parse(event.data));
};

onMounted(async () => {
  const { track, pit } = await trackData();

  if (track) {
    pathTrack.value.splice(0, pathTrack.value.length, ...track); // ts-ignore
  }
  if (track) {
    pathPits.value.splice(0, pathPits.value.length, ...pit); // ts-ignore
  }
  // pathTrack.value.splice(0, pathTrack.value.length, ...(paths || [])[0]);
  // console.log(image, paths && paths[0]);
});

// export default {
//   components: { Box, Camera, LambertMaterial, PointLight, Renderer, Scene },
// };
</script>

<template>
  <div>
    <TrackMap
      v-if="pathTrack.length"
      :track="pathTrack"
      :pits="pathPits"
      :cars="cars"
      :racers="10"
    />
  </div>
  <img v-if="imageSrc" :src="`http://localhost:5397${imageSrc}`" />
  <!-- <svg
    width="500"
    height="500"
    :viewBox="bounds"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path :d="path0" stroke="black" stroke-width="20" />
    <path :d="path1" stroke="red" stroke-width="20" />
  </svg> -->
</template>

<style scoped></style>
