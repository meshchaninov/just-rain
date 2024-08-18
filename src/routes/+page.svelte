<script>
	import { Pause, Play } from "lucide-svelte";
	import AudioPlayer from "./AudioPlayer.svelte";

	let musicVol = $state(40);
	let rainVol = $state(40);
	let pause = $state(false);

	$effect(() => {
		console.log(musicVol);
		console.log(rainVol);
	});

	const setPause = () => {
		console.log(pause);
		pause = !pause;
	};
</script>
<section>
	<video class="absolute w-full h-full object-cover" muted autoplay loop playsinline disablepictureinpicture>
		<source src="/rain.mp4" type="video/mp4">
	</video>

</section>

<div class="hero bg-base-200 min-h-screen">
  <div class="hero-content flex-col ">
    <div class="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
      <div class="card-body w-96" >
		<AudioPlayer src={["/rain1.mp3", "/rain2.mp3", "/rain3.mp3"]} header="Rain control" />
	</div>
    </div>
  </div>
</div>