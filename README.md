# @loranrendel/vue-autoscale

Vue 3 component that fits a fixed-size canvas (e.g. 1280×800) into the
available viewport, preserving the aspect ratio and centering it.

- Uses CSS `zoom` when the browser supports it fully — including correct
  inheritance of custom properties on the zoomed element itself (some Safari
  versions lose `var()` inherited from outer ancestors there). This is
  detected at runtime with a probe element.
- Falls back to `transform: scale()` with manual centering otherwise.
  In this mode native `<dialog>` content (top layer, which does not inherit
  the parent's transform) is scaled by a separate CSS rule; daisyUI's
  `.modal-backdrop` is excluded so its click-outside area stays full-screen.
- Rescales on `resize`, `load` and `visualViewport` resize.

## Install

```sh
pnpm add @loranrendel/vue-autoscale
```

## Usage

```vue
<script setup lang="ts">
import { AutoScale } from '@loranrendel/vue-autoscale'
import '@loranrendel/vue-autoscale/style.css'
</script>

<template>
  <AutoScale :width="1280" :height="800">
    <!-- your fixed-size layout -->
  </AutoScale>
</template>
```

### Props

| Prop     | Type     | Description                      |
| -------- | -------- | -------------------------------- |
| `width`  | `number` | Design width of the canvas, px   |
| `height` | `number` | Design height of the canvas, px  |

The current scale factor is exposed as the `--zoom` CSS custom property on
the container element (`.autoscale`).

The component's ancestors (via `:has(.autoscale)`) get `height: 100%`,
`margin: 0` and `position: relative`, so it fills the page out of the box.

## License

MIT
