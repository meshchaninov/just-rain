<script>
	import { Pause, Play, X } from 'lucide-svelte';
	import { blur, fly } from 'svelte/transition';

	let {
		rainSrc,
		showMenu,
		currentAudioSrc = $bindable(),
		pause = $bindable(),
		volume = $bindable()
	} = $props();

	function setPause() {
		pause = !pause;
	}
</script>

<div>
	<div class="absolute z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
		<div class="hero">
			<div class="hero-content flex-col w-full">
				<div class="card max-w-sm shrink-0 bg-blur" transition:fly={{ y: -100 }}>
					<div class="card-body rounded-lg w-80 lg:w-96 backdrop-blur-3xl">
						<div class="flex justify-end">
							<button class="btn btn-xs btn-ghost btn-circle" onclick={() => showMenu()}>
								<X />
							</button>
						</div>
						<div>
							<div class="flex flex-col justify-items-center">
								<div class="form-control">
									<div class="label">
										<span class="label-text">Playing</span>
									</div>
									{#if pause}
										<button
											class="btn border-transparent bg-cyan-500 shadow-2xl shadow-cyan-500/50 hover:bg-cyan-500 text-black"
											onclick={() => setPause()}
										>
											<Play />
										</button>
									{:else}
										<button class="btn" onclick={() => setPause()}>
											<Pause />
										</button>
									{/if}
								</div>
								<div class="form-control">
									<label class="label">
										<span class="label-text">Volume</span>
									</label>
									<input
										type="range"
										min="0"
										max="1"
										step="0.01"
										class="range range-xs"
										bind:value={volume}
									/>
								</div>

								<div class="form-control">
									<label class="label">
										<span class="label-text">Select audio</span>
									</label>
									<div class="flex justify-center gap-2">
										{#each rainSrc as _, i}
											<button
												class="btn btn-sm"
												class:btn-active={currentAudioSrc === rainSrc[i]}
												onclick={() => (currentAudioSrc = rainSrc[i])}>{i + 1}</button
											>
										{/each}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
