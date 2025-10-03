<!-- src/App.vue -->
<template>
  <div id="app">
    <AccountsForm />
  </div>
</template>

<script setup lang="ts">
import AccountsForm from './components/AccountsForm.vue'
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background-color: #f8f9fa;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
}

#app {
  min-height: 100vh;
}
</style>