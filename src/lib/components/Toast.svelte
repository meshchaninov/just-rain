<script>
	import { createEventDispatcher } from 'svelte';
	import { fade } from 'svelte/transition';
	import { CircleX, CircleCheck, Info, X } from 'lucide-svelte';

	const dispatch = createEventDispatcher();

	export let type = 'error';
	export let dismissible = true;
</script>

<article
	class="alert min-w-32 max-w-96"
	class:alert-success={type === 'success'}
  class:alert-info={type === 'info'}
  class:alert-error={type === 'error'}
	role="alert"
	transition:fade
>
	{#if type === 'success'}
		<CircleCheck width="1.1em" />
	{:else if type === 'error'}
		<CircleX width="1.1em" />
	{:else}
		<Info width="1.1em" />
	{/if}

	<span>
		<slot />
	</span>

	{#if dismissible}
		<button class="close" on:click={() => dispatch('dismiss')}>
			<X width="0.8em" />
		</button>
	{/if}
</article>
