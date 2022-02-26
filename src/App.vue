<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup
import Main from './components/Main.vue'
</script>

<template>
  <img class="logo-img" alt="logo"  src="./assets/logo.svg">
  <Main msg="Online SRT Subtitle Tools" />
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
.logo-img{
  width: 80px;
  position: absolute;
  top: 30px;
  left: 30px;
}
</style>
