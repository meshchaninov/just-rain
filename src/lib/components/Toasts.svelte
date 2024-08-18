<script>
  import Toast from "./Toast.svelte";

  import { dismissToast, toasts } from "$lib/toastStore";
</script>

{#if $toasts}
  <section class="fixed top-0 left-0 right-0 flex flex-col items-center z-50 w-full mt-3 gap-2">
    {#each $toasts as toast (toast.id)}
      <Toast
        type={toast.type}
        dismissible={toast.dismissible}
        on:dismiss={() => dismissToast(toast.id)}>{toast.message}</Toast
      >
    {/each}
  </section>
{/if}
