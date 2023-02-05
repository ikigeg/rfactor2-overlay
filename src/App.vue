<script setup lang="ts">
import { ref, onMounted } from "vue";

import type { Coords, TypedTrackMap } from "./tracks";
import { trackData } from "./tracks";
import TrackMap from "./components/TrackMap.vue";

const c = (n: number) => Math.floor(n);

const pathTrack = ref([] as Coords[]);
const pathPits = ref([] as Coords[]);
const cars = ref([] as number[][]);

const wsControlPanel = new WebSocket(
  "ws://localhost:5397/websocket/controlpanel"
);
let stuff: any[] = [];
wsControlPanel.onopen = (event) => {
  console.log("Successfully connected to the control panel server >", event);
};
wsControlPanel.onmessage = (event) => {
  const { type, body } = JSON.parse(event.data);

  if (type === "standings") {
    const s = Object.values(body) as unknown as {
      carPosition: TypedTrackMap;
      carVelocity: number;
    }[];
    if (!s) {
      return;
    }

    // s.map((b) => console.log(b.carPosition, b.carVelocity));
    const newCars = s.map((b: { carPosition: TypedTrackMap }) => [
      c(b.carPosition.x),
      c(b.carPosition.y),
      c(b.carPosition.z),
    ]);
    cars.value.splice(0, cars.value.length, ...newCars);

    stuff.push(body[0]);
    if (stuff.length === 50) {
      console.log(JSON.stringify(stuff));
      stuff.splice(0, 50);
    }
  }
};

onMounted(async () => {
  const { track, pit } = await trackData();

  if (track) {
    pathTrack.value.splice(0, pathTrack.value.length, ...track);
  }
  if (track) {
    pathPits.value.splice(0, pathPits.value.length, ...pit);
  }
});
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
</template>

<style scoped></style>
