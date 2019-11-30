<template>
  <ul>
    <li v-for="item in items.slice().reverse()" :key="item">
      <img :src="`${item}`" alt="">
   </li>
  </ul>
</template>

<script lang="ts">
import Vue from "vue";

let currTime = new Date();

export default Vue.extend({
  data() {
    return {
      isPressed: false,
      items: []
    };
  },
  mounted() {
    setInterval(() => {
      const isPressed = window.GetMiddleMouseState();
      const now = new Date().getTime();
      if (isPressed && now > currTime.getTime() + 300) {
        this.isPressed = isPressed;
        currTime = new Date();
      } else {
        this.isPressed = false;
      }
    }, 16);
  },
  watch: {
    isPressed: async function (newState) { 
      if (newState === true) {
        const fileName = `item-${new Date().getTime()}`
        const path = await window.ProcessItem(fileName, 'C:/Users/K4rli/Documents/git/path-of-trade/images/output/');
        console.log('New item', path);
        this.items.push(path);
      }
    }
  }
});
</script>

<style lang="scss" scoped>
.container {
  color: green;
}
</style>