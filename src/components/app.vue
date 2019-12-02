<template>
  <ul class="noBullets">
    <li v-for="loading in loaders" :key="loading">
      <content-placeholders>
        <content-placeholders-heading :img="true" />
        <content-placeholders-text :lines="3" />
      </content-placeholders>
   </li>
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
      items: [],
      loaders: []
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
      const fileName = `item-${new Date().getTime()}`;
      if (newState === true) {
        this.loaders.push(fileName);
        const path = await window.ProcessItem(fileName, 'C:/Users/K4rli/Documents/git/path-of-trade/images/output/');
        setTimeout(() => { 
          this.items.push(path);
          this.loaders.shift();
        }, 100);
      }
    }
  }
});
</script>

<style lang="scss" scoped>
.noBullets {
  list-style-type: none;
}
</style>