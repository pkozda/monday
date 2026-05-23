<template>
  <component :is="tag" v-if="inline" class="translated-text">{{ display }}</component>
  <component :is="tag" v-else class="translated-text translated-text--block">{{
    display
  }}</component>
</template>

<script setup lang="ts">
import { toRef } from 'vue'
import { useUiTranslate } from '@/composables/useUiTranslate'

const props = withDefaults(
  defineProps<{
    text: string
    tag?: string
    inline?: boolean
  }>(),
  {
    tag: 'span',
    inline: true,
  }
)

const { display } = useUiTranslate(toRef(props, 'text'))
</script>

<style scoped>
.translated-text--block {
  display: block;
  white-space: pre-wrap;
}
</style>
