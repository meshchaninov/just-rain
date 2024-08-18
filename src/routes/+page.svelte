<script>
	import { CircleChevronDown, Pause, Play, X, Star } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';

	const rainSrc = ['/audio/rain1.mp3', '/audio/rain2.mp3', '/audio/rain3.mp3'];
	const backgroundSrc = ['/video/rain1.webm', '/video/rain2.webm', '/video/rain3.webm'];

	let player;

	let pause = $state(true);
	let volume = $state(80);
	let currentAudioSrcIndx = $state(0);
	let currentBgSrcIndx = $state(1);
	let menuHidden = $state(false);

	onMount(() => {
		player.pause();
	});


	function setPause() {
		pause = !pause;
		if (pause) {
			player.pause();
		} else {
			player.play();
		}
	}
	function setVolume() {
		player.volume = volume / 100;
	}

	function showMenu() {
		menuHidden = !menuHidden;
	}
</script>

<svelte:head>
	<title>Just Rain</title>
	<meta property="og:title" content="Just Rain" />
	<meta property="og:description"
		content="Welcome to Rain Sound Oasis, your ultimate destination for relaxation and tranquility. Immerse yourself in the soothing symphony of rain, designed to help you unwind, focus, or drift into a peaceful sleep." />
	<meta property="og:image" content="/previewImage.webp" />
</svelte:head>

<section>
	<video
		class="absolute w-full h-full object-cover -z-10"
		muted
		autoplay
		loop
		playsinline
		disablepictureinpicture
		src={backgroundSrc[currentBgSrcIndx]}
	/>
	<audio bind:this={player} loop autoplay src={rainSrc[currentAudioSrcIndx]} />
</section>

<div class="min-w-fit min-h-screen flex flex-col">
	{#if !menuHidden}
		<main class="h-full">
			<div class="hero min-h-screen">
				<div class="hero-content flex-col w-full min-h-full">
					<div
						class="card bg-base-100 max-w-sm shrink-0 shadow-2xl"
						transition:fly={{ y: -400 }}
					>
						<div class="card-body w-80 lg:w-96">
							<div class="flex justify-end">
								<button class="btn btn-sm btn-ghost btn-circle" onclick={() => showMenu()}>
									<X class="w-6 h-6" />
								</button>
							</div>
							<div>
								<h2 class="text-xl font-bold">Rain control</h2>
								<div class="flex flex-col justify-items-center">
									<div class="form-control">
										<label class="label">
											<span class="label-text">Volume</span>
										</label>
										<input
											type="range"
											min="0"
											max="100"
											class="range"
											bind:value={volume}
											onchange={setVolume}
										/>
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
											{#each rainSrc as _, i}
												<button
													class="btn btn-sm"
													class:btn-active={currentAudioSrcIndx === i}
													disabled={pause}
													onclick={() => (currentAudioSrcIndx = i)}>{i + 1}</button
												>
											{/each}
										</div>
									</div>
									<div class="form-control">
										<label class="label">
											<span class="label-text">Select background</span>
										</label>
										<div class="flex justify-center gap-2">
											{#each backgroundSrc as _, i}
												<button
													class="btn btn-sm"
													class:btn-active={currentBgSrcIndx === i}
													onclick={() => (currentBgSrcIndx = i)}>{i + 1}</button
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
		</main>
	{:else}
		<main class="flex-1">
			<div class="flex justify-center pt-3">
				<button
					class="btn btn-circle btn-ghost"
					onclick={() => showMenu()}
					in:fly={{ y: 20, delay: 500 }}
				>
					<CircleChevronDown />
				</button>
			</div>
		</main>
		<footer class="text-center text-xs text-gray-500 p-3">
			<span
				>Dev by ✨ <a href="mailto:meshchaninov.n@gmail.com" class="link">Nikita Meshchaninov</a
				></span
			>
		</footer>
	{/if}
</div>
