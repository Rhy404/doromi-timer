<script>
    import { timerSettings, globalCancel } from '$lib/stores'; // Import stores
    import { onMount, onDestroy } from 'svelte'; // Svelte lifecycle functions

    // Reactive variables for timer display
    let productivityDisplay = '00:00';
    let breakDisplay = '00:00';
    let intervalCount = 0;

    // Internal timer state
    let totalSecondsRemaining = 0;
    let isRunning = false;
    let isPaused = false;
    let currentPhase = 'productivity'; // 'productivity' or 'break'
    let timerInterval; // To hold the setInterval ID

    // Store values (in seconds)
    let productivityDuration = 25 * 60;
    let breakDuration = 5 * 60;

    // --- Svelte Store Subscriptions ---
    // Subscribe to timerSettings to get updated durations
    timerSettings.subscribe(settings => {
        productivityDuration = settings.productivity;
        breakDuration = settings.break;
        // If timer is not running, update display immediately when settings change
        if (!isRunning && !isPaused) {
            resetTimer(); // Reset to new settings
        }
    });

    // Subscribe to globalCancel to react to global reset
    globalCancel.subscribe(value => {
        if (value === true) {
            handleCancel();
            globalCancel.set(false); // Reset the globalCancel flag
        }
    });

    // --- Helper Functions ---
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    }

    function updateDisplay() {
        if (currentPhase === 'productivity') {
            productivityDisplay = formatTime(totalSecondsRemaining);
            breakDisplay = formatTime(breakDuration); // Show break default when productivity is active
        } else { // currentPhase === 'break'
            breakDisplay = formatTime(totalSecondsRemaining);
            productivityDisplay = formatTime(productivityDuration); // Show productivity default when break is active
        }
    }

    function startCountdown() {
        if (isRunning) return; // Prevent multiple intervals

        isRunning = true;
        isPaused = false;

        timerInterval = setInterval(() => {
            if (totalSecondsRemaining > 0) {
                totalSecondsRemaining--;
            } else {
                // Time for current phase is up
                clearInterval(timerInterval);
                isRunning = false;
                
                if (currentPhase === 'productivity') {
                    intervalCount++; // Increment count after a full productivity cycle
                    currentPhase = 'break';
                    totalSecondsRemaining = breakDuration;
                } else { // currentPhase === 'break'
                    currentPhase = 'productivity';
                    totalSecondsRemaining = productivityDuration;
                }
                
                // Automatically start the next phase
                if (totalSecondsRemaining > 0) {
                    startCountdown();
                } else {
                    // This case should ideally not happen if durations are > 0
                    resetTimer();
                }
            }
            updateDisplay();
        }, 1000); // Update every second
    }

    function handleStart() {
        // If starting for the very first time or after a full reset
        if (totalSecondsRemaining === 0 && !isRunning && !isPaused) {
            totalSecondsRemaining = productivityDuration;
            currentPhase = 'productivity';
            intervalCount = 0; // Reset count on fresh start
        }
        startCountdown();
    }

    function handlePause() {
        if (isRunning) {
            clearInterval(timerInterval);
            isRunning = false;
            isPaused = true;
        }
    }

    function handleCancel() {
        clearInterval(timerInterval);
        isRunning = false;
        isPaused = false;
        totalSecondsRemaining = 0;
        currentPhase = 'productivity'; // Reset to productivity phase
        intervalCount = 0;
        resetDisplayToDefaults(); // Reset display to 00:00
        console.log('Timer cancelled and reset.');
    }

    function resetTimer() {
        clearInterval(timerInterval);
        isRunning = false;
        isPaused = false;
        totalSecondsRemaining = productivityDuration; // Default to productivity time
        currentPhase = 'productivity';
        intervalCount = 0;
        updateDisplay(); // Update display with new default
    }

    function resetDisplayToDefaults() {
        productivityDisplay = '00:00';
        breakDisplay = '00:00';
    }

    // --- Lifecycle Hooks ---
    onMount(() => {
        // Initialize display with default productivity and break times when component mounts
        productivityDisplay = formatTime(productivityDuration);
        breakDisplay = formatTime(breakDuration);
    });

    onDestroy(() => {
        // Clean up interval when component is destroyed to prevent memory leaks
        clearInterval(timerInterval);
    });
</script>

<style>
    .main-timer-container {
        background: #26102e;
        padding: 20px;
        border-radius: 30px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        min-height: 340px;
        box-shadow: 10px 10px 0 #1a0a20; /* Re-added shadow */
    }

    .interval-display {
        background-color: #d7ade5;
        border-radius: 8px;
        padding: 10px;
        font-size: 18px;
        color: #764c85;
        font-family: "Kumbh Sans", monospace;
        font-weight: 600;
        margin-bottom: 5px;
        box-shadow: 5px 5px 0 #572769; /* Re-added shadow */
    }

    .timer-display-container {
        background: #572769;
        border-radius: 15px;
        padding: 20px;
    }

    .timer-display {
        text-align: center;
        color: #ffffff;
        font-weight: 200;
    }

    .timer-display span {
        font-size: 45px;
        font-family: "Kumbh Sans", monospace;
        display: block;
        line-height: 1.1;
    }

    .separator {
        font-size: 30px;
        color: #ffffff;
        margin: 10px 0;
    }

    .controls {
        display: flex;
        gap: 15px;
        margin-top: 5px;
    }

    .control-button {
        background-color: #e8e5ea;
        color: #000000;
        border: none;
        border-radius: 50%;
        width: 55px;
        height: 55px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        cursor: pointer;
        transition:
            background-color 0.2s ease,
            transform 0.1s ease;
        box-shadow: 3px 4px 0 #9e9e9e; /* Re-added shadow */
    }

    .control-button:hover {
        background-color: #dcdcdc;
        transform: translateY(-2px);
    }

    .control-button:active {
        transform: translateY(0);
    }

    .icon-nudge-play {
        position: relative;
        left: 1px;
        bottom: 2px;
        top:0.07px;
        font-size: 26px;
    }

    .icon-nudge-pause {
        position: relative;
        left: 1px;
        bottom: 2.7px;
        font-size: 30px;
    }

    .icon-nudge-cancel {
        position: relative;
        left: 1px; 
        font-size: 25px;
    }
</style>

<div class="main-timer-container">
	<div class="interval-display">
		Interval count: {intervalCount}
	</div>

	<div class="timer-display-container">
		<div class="timer-display">
			<span>{productivityDisplay}</span>
			<span class="separator">X</span>
			<span>{breakDisplay}</span>
		</div>
	</div>

	<div class="controls">
		<button class="control-button" on:click={handleStart}>
            <span class="icon-nudge-play">▶</span>
        </button> 

		<button class="control-button" on:click={handlePause}>
            <span class="icon-nudge-pause">⏸</span>
        </button>

		<button class="control-button" on:click={handleCancel}>
            <span class="icon-nudge-cancel">✖</span>
        </button>
	</div>
</div>
