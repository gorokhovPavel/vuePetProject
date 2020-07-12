<template>
  <div id="footer" class="footerSizingApp">
    <span class="left">
      <a href="#">KPMG</a>
      © {{ year }}
    </span>
    <span class="right">
      <a href="#">Forensic Technology Team</a>
    </span>
  </div>
</template>
<script>
export default {
  data: () => ({
    year: new Date().getFullYear()
  })
};
</script>
<style>
#footer {
  background-color: var(--kpmgBack);
  height: var(--headerFooterHeight);
}
#footer a {
  color: var(--kpmg);
  text-decoration: none;
}
</style>
