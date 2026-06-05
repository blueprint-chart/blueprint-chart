import { defineComponent, h } from 'vue'

// Stub for unplugin-icons virtual modules (e.g. `~icons/ph/github-logo`),
// which are not resolvable outside the VitePress/Vite build. Renders an inert
// <span> so theme SFCs that embed icons can still mount under vitest.
export default defineComponent({
  name: 'IconStub',
  render: () => h('span', { class: 'icon-stub' }),
})
