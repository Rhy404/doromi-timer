<script>
    import { timerSettings } from '$lib/stores'; 

    let currentProductivityMinutes;
    let currentBreakMinutes;

    //subbing to the store to initialize local state and react to external changes
    //secs to mins for display
    timerSettings.subscribe(settings => {
        currentProductivityMinutes = settings.productivity / 60;
        currentBreakMinutes = settings.break / 60;
    });

    //Ranges for the timers
    //5, 10, 15, ...,90
    const productivityRange = Array.from({ length: (90 - 5) / 5 + 1}, (_, i) => 5 + i * 5); 
    //5, 10, 15, ...,30
    const breakRange = Array.from({ length: (30 - 5) / 5 + 1}, (_, i) => 5 + i * 5); 

    function cycleProductivityTime() {
        const currentIndex = productivityRange.indexOf(currentProductivityMinutes);
        const nextIndex = (currentIndex + 1) % productivityRange.length;
        const newMinutes = productivityRange[nextIndex];
        
        //Updating the Svelte store (in seconds)
        timerSettings.update(settings => ({ ...settings, productivity: newMinutes * 60 }));
    }

    function cycleBreakTime() {
        const currentIndex = breakRange.indexOf(currentBreakMinutes);
        const nextIndex = (currentIndex + 1) % breakRange.length;
        const newMinutes = breakRange[nextIndex];

        //Updating the Svelte store (in seconds)
        timerSettings.update(settings => ({ ...settings, break: newMinutes * 60 }));
    }
</script>

<style>
    .set-timer-container{
        min-width: 250px;
        background: #764c85;
        padding: 20px;
        border-radius: 30px;
        box-shadow: 10px 10px 0 #572769;
    }

    .decor{
        background: #d7ade5;
        padding:30px;
        margin-top: -10px;
        margin-bottom: -10px;
        margin-left: -10px;
        margin-right: -10px;
        border-top-left-radius: 0;
        border-top-right-radius: 0;
        border-bottom-left-radius: 26px;
        border-bottom-right-radius: 26px;
    }

    h2{
        font-size: 35px;
        text-align: center;
        margin-top: -10px;
        margin-bottom: 25px;
        color: #ffffff;
        font-weight: 600;
    }

    .timer-setting{
        margin-bottom: 30px;
        margin-top: -15px;
    }

    .timer-setting p {
        font-size: 26px;
        font-family: "Kumbh Sans", monospace;
        margin-bottom: 10px;
        color: #764c85;
        text-align: center;
    }

    .time-button {
        background-color: #ede7f6;
        color: #3f1e4a;
        border: none;
        padding: 12px 25px;
        border-radius: 30px;
        font-size: 1.1em;
        font-weight: bold;
        cursor: pointer;
        transition: background-color 0.2s ease, transform 0.1s ease;
        min-width: 150px;
        display: block;
        margin: 0 auto;
    }

    .time-button:hover {
        background-color: #dcdcdc;
        transform: translateY(-2px);
    }

    .time-button:active {
        transform: translateY(0);
    }
</style>

<div class="set-timer-container"> 
	<h2>Set Timer</h2>
	<div class="decor">
		<div class="timer-setting">
			<p>Productivity Timer:</p>
			<button class="time-button" on:click={cycleProductivityTime}>
				{currentProductivityMinutes} minutes
			</button>
		</div>

		<div class="timer-setting">
			<p>Break Timer:</p>
			<button class="time-button" on:click={cycleBreakTime}>
				{currentBreakMinutes} minutes 
			</button>
		</div>
	</div>
</div>
