<script>
	import { Music, Pause, Play, X } from 'lucide-svelte';
	import { fly } from 'svelte/transition';

	let {
		rainSrc,
		onMenuClose,
		currentAudioSrc = $bindable(),
		pause = $bindable(),
		volume = $bindable(),
		fullScreen = $bindable(),
		enableSC = $bindable()
	} = $props();

	function setPause() {
		pause = !pause;
	}

	function setCurrentAudioSrc(src) {
		currentAudioSrc = src;
	}
</script>

<div>
	<div class="absolute z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
		<div class="hero">
			<div class="hero-content flex-col ">
				<div class="card max-w-sm shrink-0 bg-blur" transition:fly={{ y: -100 }}>
					<div class="card-body rounded-lg w-96 lg:w-96 backdrop-blur-xl">
						<div class="flex justify-end">
							<button class="btn btn-xs btn-ghost btn-circle" onclick={() => onMenuClose()}>
								<X />
							</button>
						</div>
						<div>
							<div class="flex flex-col justify-items-center">
								<div class="form-control">
									<div class="label">
										<div class="flex justify-between w-full">
											<span class="label-text">Playing</span>
											<div class="">
												{#if pause}
													<button
														aria-label="Play"
														class="w-60 inline-flex items-center justify-center py-3 pyx-6 font-dm rounded-lg shadow-lg shadow-cyan-500/50 bg-cyan-500 hover:bg-cyan-500 text-black"
														onclick={() => setPause()}
													>
														<Play />
													</button>
												{:else}
													<button aria-label="Pause" class="btn w-60" onclick={() => setPause()}>
														<Pause />
													</button>
												{/if}
											</div>
										</div>
									</div>
								</div>

								<div class="form-control">
									<label class="label">
										<div class="flex justify-between w-full gap-10">
											<span class="label-text">Volume</span>
											<input
												type="range"
												min="0"
												max="1"
												step="0.01"
												class="range range-xs"
												bind:value={volume}
											/>
										</div>
									</label>
								</div>

								<div class="form-control">
									<label class="label">
										<span class="label-text">Select audio</span>
										<div class="flex justify-center gap-2">
											{#each rainSrc as _, i}
												<button
													class="btn btn-sm"
													class:btn-active={currentAudioSrc === rainSrc[i]}
													onclick={() => setCurrentAudioSrc(rainSrc[i])}>{i + 1}</button
												>
											{/each}
										</div>
									</label>
								</div>
								<div class="form-control">
									<label class="label">
										<span class="label-text">Full screen</span>
										<div class="flex justify-center">
											<input
												aria-labelledby="Full screen"
												type="checkbox"
												class="toggle"
												bind:checked={fullScreen}
											/>
										</div>
									</label>
								</div>
																<div class="form-control">
									<label class="label">
										<span class="label-text"><Music /></span>
										<div class="flex justify-center">
											<input
												aria-labelledby="Music"
												type="checkbox"
												class="toggle toggle-accent"
												bind:checked={enableSC}
											/>
										</div>
									</label>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
