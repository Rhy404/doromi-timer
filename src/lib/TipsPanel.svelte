<script>
	//tips array
	const tipsList = [
		"Without the smooth toggle, you are listening to 'Raw' color noises.",
		'Use the smooth button for a softer audio, great for relaxation and focus.',
		'Color noises can be selected or deselected by a simple click.',
		'It is best to mix pink and brown, with or without white.',
		'Feel free to mix colors as per your choice, however not all combos are soothing to the ears.',
		'If experiencing any audio pop/tick sounds, then lower the volume slider accordingly(less than 80%).',
		'The no-noise button can be used for clearing all noises.',
		'All color noises are scientifically derived from white noise.',
		'White noise helps with focus by masking other sounds.',
		'Pink noise is essentially bass-boosted and a softer white noise.',
		'Brown noise is deeper and can aid relaxation.',
		'Pomodoro timers are great to pair up with color noises, hence why I made this<3'
	];
	let currentTipIndex = 0;

	// Reactive statement to get the current tip string
	$: currentTip = tipsList[currentTipIndex];

	function showPreviousTip() {
		currentTipIndex = (currentTipIndex - 1 + tipsList.length) % tipsList.length;
	}

	function showNextTip() {
		currentTipIndex = (currentTipIndex + 1) % tipsList.length;
	}
</script>

<style>
    .tips-panel {
        background-color: rgba(1,1,1, 0.7);
        border-radius: 15px;
        padding: 15px;
        width: 90%; 
        margin: 10px;
        display: flex;
        align-items: center;
        gap: 10px;
        color: #ffffff; 
        font-family: "Kumbh Sans", monospace;
        box-shadow: 5px 5px 0 rgb(165, 154, 171); 
        min-height: 80px; 
    }

    .tips-icon {
        font-size: 1.3em;
        opacity: 1; 
    }

    .tips-label {
        font-size: 1em;
        font-weight: bold;
        opacity: 0.8; 
        white-space: nowrap; 
    }

    .current-tip-content {
        flex-grow: 1; 
        font-size: 0.99em;
        text-align: left;
        line-height: 1.4;
        opacity: 1; 
        font-weight: 300;
    }

    .nav-arrow {
        background: none;
        border:none;
        color: #ffffff; 
        font-size: 1.2em;
        cursor: pointer;
        opacity: 0.6;
        padding: 10px;
        transition: opacity 0.2s ease;
    }

    .nav-arrow:hover {
        opacity: 1; 
    }

    .nav-arrow:active {
        opacity: 0.8; 
    }
</style>

<div class="tips-panel">
	<span class="tips-icon">💡</span>
	<span class="tips-label">Tips:</span>
	<button class="nav-arrow" on:click={showPreviousTip}>◀</button>
	<div class="current-tip-content">
		{currentTip}
	</div>
	<button class="nav-arrow" on:click={showNextTip}>▶</button>
</div>
