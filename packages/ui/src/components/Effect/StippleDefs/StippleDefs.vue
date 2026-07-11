<script setup lang="ts">
// FIG.05 - grain/stipple filter defs. Speckle mask: color comes from the
// element the filter is applied to, alpha comes from fractal noise. Two-to-three
// seeds so two inks stipple differently and mix optically. Lower baseFrequency
// = coarser riso. Render once per page; reference via filter: url(#bc-stipple-a).
const filters = [
  { id: 'bc-stipple-a', seed: 7, freq: 0.65, amp: 1.9, exp: 1.6 },
  { id: 'bc-stipple-b', seed: 31, freq: 0.65, amp: 1.9, exp: 1.6 },
  { id: 'bc-stipple-c', seed: 12, freq: 0.6, amp: 1.8, exp: 1.5 },
]
</script>

<template>
  <svg
    width="0"
    height="0"
    style="position: absolute"
    aria-hidden="true"
  >
    <defs>
      <filter
        v-for="f in filters"
        :id="f.id"
        :key="f.id"
        x="-30%"
        y="-30%"
        width="160%"
        height="160%"
      >
        <feTurbulence
          type="fractalNoise"
          :baseFrequency="f.freq"
          numOctaves="3"
          :seed="f.seed"
          stitchTiles="stitch"
          result="n"
        />
        <feColorMatrix
          in="n"
          type="luminanceToAlpha"
          result="na"
        />
        <feComponentTransfer
          in="na"
          result="nm"
        >
          <feFuncA
            type="gamma"
            :amplitude="f.amp"
            :exponent="f.exp"
            offset="0"
          />
        </feComponentTransfer>
        <feComposite
          in="SourceGraphic"
          in2="nm"
          operator="in"
        />
      </filter>
    </defs>
  </svg>
</template>
