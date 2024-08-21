<script>
	import { X } from "lucide-svelte";

	let { onClose } = $props();
</script>

<button class="btn btn-xs btn-ghost btn-circle" aria-label="Close" title="close" onclick={() => onClose()} >
	<X />
</button>
