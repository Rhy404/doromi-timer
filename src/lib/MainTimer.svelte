<script>
    import { timerSettings, globalCancel } from '$lib/stores'; 
    import { onMount, onDestroy } from 'svelte';

  
    let productivityDisplay = '00:00';
    let breakDisplay = '00:00';
    let intervalCount = 0;

    // Internal timer state
    let totalSecondsRemaining = 0;
    let isRunning = false;
    let isPaused = true;
    let currentPhase = 'productivity'; // 'productivity' or 'break'
    let timerInterval; // To hold the setInterval ID

    //Stores values (in seconds)
    let productivityDuration = 25 * 60;
    let breakDuration = 5 * 60;

    let audioContextDing;
    let productivityDingBuffer;
    let breakDingBuffer;


    let notificationPermission = 'default'; // 'default', 'granted', 'denied'


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


    async function initAudioContextDing() {
        if (!audioContextDing) {
            audioContextDing = new (window.AudioContext || window.webkitAudioContext)();
            if (audioContextDing.state === 'suspended') {
                await audioContextDing.resume();
            }
        }
    }

    async function loadSound(url) {
        await initAudioContextDing(); // Ensure context is ready
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        return await audioContextDing.decodeAudioData(arrayBuffer);
    }

    function playSound(buffer) {
        if (!audioContextDing || !buffer) return;

        const source = audioContextDing.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContextDing.destination);
        source.start(0);
    }

    async function requestNotificationPermission() {
        if (!('Notification' in window)) {
            console.warn("This browser does not support desktop notification");
            return;
        }

        if (notificationPermission === 'granted') return; // Already granted

        try {
            const permission = await Notification.requestPermission();
            notificationPermission = permission;
            console.log("Notification permission:", permission);
        } catch (error) {
            console.error("Error requesting notification permission:", error);
            notificationPermission = 'denied';
        }
    }

    function showTimerNotification(title, body, icon = '/favicon.png') {
        if (notificationPermission === 'granted') {
            new Notification(title, { body, icon });
        } else if (notificationPermission === 'default') {
            // If permission is default, try to request it on first notification attempt
            requestNotificationPermission().then(() => {
                if (notificationPermission === 'granted') {
                    new Notification(title, { body, icon });
                }
            });
        }
    }



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
                    playSound(productivityDingBuffer);
                    showTimerNotification('Productivity Time Up!', 'Time to take a break. Interval completed!');
                    intervalCount++; // Increment count after a full productivity cycle
                    currentPhase = 'break';
                    totalSecondsRemaining = breakDuration;
                } else { // currentPhase === 'break'
                    playSound(breakDingBuffer);
                    showTimerNotification('Break Time Up!', 'Time to get back to work!');
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
        }, 1000); //Updates every second
    }

    function handleStart() {
        // NEW: Request notification permission on first start click
        if (notificationPermission === 'default') {
            requestNotificationPermission();
        }

        // If starting for the very first time or after a full reset
        if (totalSecondsRemaining === 0 && !isRunning && !isPaused) {
            totalSecondsRemaining = productivityDuration;
            currentPhase = 'productivity';
            intervalCount = 0; // Resets count on fresh start
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
        currentPhase = 'productivity'; // Resetss to productivity phase
        intervalCount = 0;
        resetDisplayToDefaults(); //Resets display to 00:00
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
    onMount(async () => {
        // Initialize display with default productivity and break times when component mounts
        productivityDisplay = formatTime(productivityDuration);
        breakDisplay = formatTime(breakDuration);


        try {
            productivityDingBuffer = await loadSound('/sounds/productivityTimerDone.mp3');
            breakDingBuffer = await loadSound('/sounds/breakTimerDone.mp3');
            console.log('Ding sounds loaded.');
        } catch (error) {
            console.error('Failed to load ding sounds:', error);
        }

        // Check initial notification permission status
        if ('Notification' in window) {
            notificationPermission = Notification.permission;
        }
    });

    onDestroy(() => {
        // Clean up interval when component is destroyed to prevent memory leaks
        clearInterval(timerInterval);
       
        if (audioContextDing) {
            audioContextDing.close();
            audioContextDing = null;
        }
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
        box-shadow: 10px 10px 0 #1a0a20; 
    }

    .interval-display {
        background-color: #d7ade5;
        border-radius: 8px;
        padding: 10px;
        font-size: 18px;
        color: #764c85;
        font-family: 'Kumbh Sans', monospace; 
        margin-bottom: 5px;
        box-shadow: 5px 5px 0 #572769; 
    }

    .timer-display-container {
        background: #572769;
        border-radius: 15px;
        padding: 20px;
    }

    .timer-display {
        text-align: center;
        color: #ffffff;
    }

    .timer-display span {
        font-size: 45px;
        font-family: 'Kumbh Sans', monospace;
        display: block;
        line-height: 1.1;
    }

    .separator {
        font-size: 30px;
        color: #ffffff;
        font-family: 'Kumbh Sans', monospace; 
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
        box-shadow: 3px 4px 0 #9e9e9e; 
        font-family: 'Kumbh Sans', sans-serif; 
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
        bottom: 2px; 
        left: 1px;
    }

    .icon-nudge-pause {
        position: relative;
        bottom: 2px;
        font-size: 28px;
    }

    .icon-nudge-cancel {
        position: relative;
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
