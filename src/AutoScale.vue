<script setup lang="ts">
import { computed, onMounted, onUnmounted, useTemplateRef } from 'vue'

const container = useTemplateRef('container')

const { width, height } = defineProps<{ width: number, height: number }>()

// Проверяет, поддерживает ли браузер CSS zoom полноценно: не только само
// свойство, но и корректное наследование кастомных свойств элементом, на
// который сам zoom навешан — на части версий Safari именно элемент с zoom
// теряет var() от внешних предков, из-за чего calc() внутри него ломается.
// Поэтому переменная объявляется СНАРУЖИ, а zoom и calc() — на одном и том
// же (внутреннем) элементе.
function detectZoomSupport (): boolean {
  const probe = document.createElement('div')
  probe.style.setProperty('--supports-zoom-test', '10')
  document.body.appendChild(probe)

  const child = document.createElement('div')
  Object.assign(child.style, { position: 'absolute', visibility: 'hidden', zoom: '0.5' })
  child.style.width = 'calc(var(--supports-zoom-test) * 10px)'
  probe.appendChild(child)

  // Ожидаем 50px: 10 * 10px = 100px, уменьшенные zoom:0.5 до 50px. Если zoom
  // не поддержан вовсе или var() не унаследовалась на элементе с zoom —
  // получим либо 100 (zoom проигнорирован), либо 0/иное (calc не сработал).
  const measuredWidth = child.getBoundingClientRect().width
  document.body.removeChild(probe)

  return Math.round(measuredWidth) === 50
}

const useZoom = detectZoomSupport()

function autoScale () {
  const id = container.value!
  const viewportWidth = visualViewport?.width ?? innerWidth
  const viewportHeight = visualViewport?.height ?? innerHeight

  const zoom = Math.min(viewportWidth / id.offsetWidth, viewportHeight / id.offsetHeight)
  id.style.setProperty('--zoom', `${zoom}`)

  if (!useZoom) {
    const offsetLeft = (viewportWidth - id.offsetWidth * zoom) / 2
    const marginTop = (viewportHeight - id.offsetHeight * zoom) / 2
    id.style.translate = `${Math.floor(offsetLeft)}px ${Math.floor(marginTop)}px`
  }
}

const style = computed(() => ({
  width: `${width}px`,
  height: `${height}px`,
  aspectRatio: width / height
}))

onMounted(() => {
  addEventListener('load', autoScale)
  addEventListener('resize', autoScale)
  visualViewport?.addEventListener('resize', autoScale)
  autoScale()
})
onUnmounted(() => {
  removeEventListener('load', autoScale)
  removeEventListener('resize', autoScale)
  visualViewport?.removeEventListener('resize', autoScale)
})
</script>

<template>
  <div ref="container" class="autoscale" :class="useZoom ? 'autoscale-zoom' : 'autoscale-transform'" :style>
    <slot/>
  </div>
</template>

<style>
*:is(:has(.autoscale), .autoscale) {
  touch-action: pan-x pan-y;
  position: relative;
  height: 100%;
  margin: 0;
}

*:has(> .autoscale-zoom) {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.autoscale-zoom {
  zoom: var(--zoom, 1);
  z-index: 0;
}

.autoscale-transform {
  transform: scale(var(--zoom, 1));
  transform-origin: left top;
  transform-style: flat;
}

/*
 * Нужно только в transform-режиме: zoom сам «пробрасывается» в top layer
 * (<dialog>), а transform — нет, компенсацию приходится навешивать явно.
 * .modal-backdrop нарочно исключён: full-screen форма закрытия по клику вне
 * контента, transform уменьшил бы её кликабельную область до .modal-box.
 * Chromium снимает атрибут open только после анимации закрытия — там нужно
 * правило без [open], чтобы элемент не спрыгивал к исходному размеру во
 * время анимации. Safari/Firefox снимают open сразу — там нужен именно
 * [open]. -webkit-app-region поддерживается только в Chromium, используется
 * как CSS-детект движка.
 */
.autoscale-transform dialog[open] > *:not(.modal-backdrop) {
  transform: scale(var(--zoom, 1));
  transform-origin: center;
}

@supports (-webkit-app-region: inherit) {
  .autoscale-transform dialog > *:not(.modal-backdrop) {
    transform: scale(var(--zoom, 1));
    transform-origin: center;
  }
}
</style>