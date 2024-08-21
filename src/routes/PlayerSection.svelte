<script>
	import { onMount } from "svelte";

    let { bgSrcVideo, bgSrcPreview, audioSrc, volume = $bindable(), pause = $bindable(), player = $bindable() } = $props();

	let autoPlayAudio = $state(false);

	onMount(() => {
		autoPlayAudio = true;
	});
	// let audioCtx = null;
	// let gainNode = null;

	// onMount(() => {
	// 	audioCtx = new window.AudioContext();
	// 	gainNode = audioCtx.createGain();
	// 	const source = audioCtx.createMediaElementSource(player);
	// 	source.connect(gainNode);
	// 	gainNode.connect(audioCtx.destination);
	// });

	// $effect(() => {
	// 	gainNode.gain.value = volume;
	// });




</script>
<section>
	<div class="absolute w-full h-full object-cover -z-10">
		<video
			class="absolute w-full h-full object-cover -z-10"
			muted
			autoplay
			loop
			playsinline
			disablepictureinpicture
			src={bgSrcVideo}
			poster={bgSrcPreview}
		></video>	
	</div>
	<audio bind:this={player} bind:paused={pause} bind:volume={volume} loop autoplay={autoPlayAudio} src={audioSrc} ></audio>
</section>