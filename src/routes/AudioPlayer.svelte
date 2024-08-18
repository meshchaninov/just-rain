<script>
	import { onMount } from 'svelte';
	import { Play, Pause } from 'lucide-svelte';

	let { src, header } = $props();

	let player;
	let pause = $state(false);
	let volume = $state(80);
	let currentSrcIndx = $state(0);

	$effect(() => {
		player.volume = volume / 100;
	});

	function setPause() {
		pause = !pause;
		if (pause) {
			player.pause();
		} else {
			player.play();
		}
	}
</script>

<div>
	<audio bind:this={player} loop autoplay src={src[currentSrcIndx]}>
		<track kind="captions" />
	</audio>
	<h2 class="text-xl font-bold">{header}</h2>
	<div class="flex flex-col justify-items-center">
		<div class="form-control">
			<label class="label">
				<span class="label-text">Volume</span>
			</label>
			<input type="range" min="0" max="100" class="range" bind:value={volume} />
		</div>

		<div class="form-control">
			<div class="label">
				<span class="label-text">Playing</span>
			</div>

			{#if pause}
				<button class="btn btn-sm" onclick={() => setPause()}>
					<Play />
				</button>
			{:else}
				<button class="btn btn-sm" onclick={() => setPause()}>
					<Pause />
				</button>
			{/if}
		</div>
		<div class="form-control">
			<label class="label">
				<span class="label-text">Select audio</span>
			</label>
			<div class="flex justify-center gap-2">
				{#each src as _, i}
					<button
						class="btn btn-sm"
						class:btn-active={currentSrcIndx === i}
                        disabled={pause}
						onclick={() => (currentSrcIndx = i)}>{i + 1}</button
					>
				{/each}
			</div>
		</div>
	</div>
</div>
