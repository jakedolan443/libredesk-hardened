<template>
  <div class="flex flex-wrap gap-1 items-center">
    <Tooltip>
      <TooltipTrigger as-child>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          :aria-label="$t('globals.terms.bold')"
          @click.prevent="editor?.chain().focus().toggleBold().run()"
          :class="{ 'bg-secondary': editor?.isActive('bold') }"
        >
          <Bold size="14" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{{ $t('globals.terms.bold') }}</TooltipContent>
    </Tooltip>
    <Tooltip>
      <TooltipTrigger as-child>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          :aria-label="$t('globals.terms.italic')"
          @click.prevent="editor?.chain().focus().toggleItalic().run()"
          :class="{ 'bg-secondary': editor?.isActive('italic') }"
        >
          <Italic size="14" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{{ $t('globals.terms.italic') }}</TooltipContent>
    </Tooltip>
    <Tooltip>
      <TooltipTrigger as-child>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          :aria-label="$t('editor.tooltip.strikethrough')"
          @click.prevent="editor?.chain().focus().toggleStrike().run()"
          :class="{ 'bg-secondary': editor?.isActive('strike') }"
        >
          <Strikethrough size="14" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{{ $t('editor.tooltip.strikethrough') }}</TooltipContent>
    </Tooltip>
    <Tooltip>
      <TooltipTrigger as-child>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          :aria-label="$t('editor.tooltip.underline')"
          @click.prevent="editor?.chain().focus().toggleUnderline().run()"
          :class="{ 'bg-secondary': editor?.isActive('underline') }"
        >
          <UnderlineIcon size="14" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{{ $t('editor.tooltip.underline') }}</TooltipContent>
    </Tooltip>
    <Tooltip>
      <TooltipTrigger as-child>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          :aria-label="$t('editor.tooltip.bulletList')"
          @click.prevent="editor?.chain().focus().toggleBulletList().run()"
          :class="{ 'bg-secondary': editor?.isActive('bulletList') }"
        >
          <List size="14" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{{ $t('editor.tooltip.bulletList') }}</TooltipContent>
    </Tooltip>
    <Tooltip>
      <TooltipTrigger as-child>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          :aria-label="$t('editor.tooltip.orderedList')"
          @click.prevent="editor?.chain().focus().toggleOrderedList().run()"
          :class="{ 'bg-secondary': editor?.isActive('orderedList') }"
        >
          <ListOrdered size="14" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{{ $t('editor.tooltip.orderedList') }}</TooltipContent>
    </Tooltip>
    <Tooltip>
      <TooltipTrigger as-child>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          :aria-label="$t('globals.terms.link')"
          @click.prevent="emit('openLink')"
          :class="{ 'bg-secondary': editor?.isActive('link') }"
        >
          <LinkIcon size="14" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{{ $t('globals.terms.link') }}</TooltipContent>
    </Tooltip>
  </div>
</template>

<script setup>
import {
  Bold,
  Italic,
  Strikethrough,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Link as LinkIcon
} from 'lucide-vue-next'
import { Button } from '@shared-ui/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@shared-ui/components/ui/tooltip'

defineProps({
  editor: { type: Object, default: null }
})

const emit = defineEmits(['openLink'])
</script>
