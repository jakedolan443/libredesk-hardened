<template>
  <SidebarFooter class="border-t border-sidebar-border">
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarNavUser />
      </SidebarMenuItem>
    </SidebarMenu>
  </SidebarFooter>
</template>

<script setup>
import { SidebarFooter, SidebarMenu, SidebarMenuItem } from '@shared-ui/components/ui/sidebar'
import SidebarNavUser from './SidebarNavUser.vue'
</script>
