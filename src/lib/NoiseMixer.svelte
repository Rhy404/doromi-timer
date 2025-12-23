<script>
	import { onDestroy } from 'svelte';
	import { globalCancel } from '$lib/stores';

	let activeNoises = []; //array to manage active noises

	const noiseBlocks = [
		{ id: 'no-noise', label: '', color: '#ede7f6', diagonal: true },
		{ id: 'white', label: 'white', color: '#ede7f6' },
		{ id: 'pink', label: 'pink', color: '#f7cadc' },
		{ id: 'brown', label: 'brown', color: '#a0522d' },
		{ id: 'green', label: 'green', color: '#66bb6a' },
		{ id: 'deep-red', label: 'deep red', color: '#ef5350' },
		{ id: 'deep-blue', label: 'deep blue', color: '#42a5f5' },
		{ id: 'grey', label: 'grey', color: '#9e9e9e' }
	];

    // State for global volume control
    let globalVolume = 0.5; // Default volume (0.0 to 1.0)
    
    // Variable for the *new* tonal smoothing toggle
    let isTonalSmoothEnabled = false; 

    // Function for the *new* tonal smoothing toggle
    function toggleTonalSmooth() {
        isTonalSmoothEnabled = !isTonalSmoothEnabled;
        console.log('Tonal Smoothing:', isTonalSmoothEnabled ? 'Enabled' : 'Disabled');
        // The reactive statement below will handle applying the filter changes
    }


	//--Web Audio API setup--
	let audioContext;
	let noiseSources = {}; // Object to hold active noise generators and their nodes

	function initAudioContext() {
		if (!audioContext) {
			audioContext = new (window.AudioContext || window.webkitAudioContext)();
			if (audioContext.state === 'suspended') {
				audioContext.resume();
			}
		}
	}

	function playNoise(noiseId) {
		initAudioContext();

		if (noiseSources[noiseId]) {
			return; // Noise is already playing
		}

		const bufferSize = 4096;
		const scriptNode = audioContext.createScriptProcessor(bufferSize, 1, 1);
		const gainNode = audioContext.createGain();

		// Create the tonal smoothing filter for this noise instance
		const tonalSmoothFilter = audioContext.createBiquadFilter();
		tonalSmoothFilter.type = 'lowpass';
		tonalSmoothFilter.Q.value = 1;
		tonalSmoothFilter.frequency.value = isTonalSmoothEnabled ? 800 : 22000; // 800Hz for smoothing, 22kHz to bypass

        // Declare colorFilter here, will be created only for specific noise types
        let colorFilter = null; 

		// Set initial gain to 0 for a smooth fade-in (always on)
		gainNode.gain.value = 0; 

        //--Establish the audio graph for this specific noise--
        // The chain will always be: scriptNode -> (optional colorFilter) -> tonalSmoothFilter -> gainNode -> audioContext.destination

        // 1. Connect scriptNode to the first filter (colorFilter if present, else tonalSmoothFilter)
        if (['green', 'deep-red', 'deep-blue', 'grey'].includes(noiseId)) {
            colorFilter = audioContext.createBiquadFilter();
            colorFilter.type = 'lowpass';
            colorFilter.Q.value = 1; // Default Q, will be adjusted below
            colorFilter.frequency.value = 1000; // Initial frequency for color filter
            
            scriptNode.connect(colorFilter); // scriptNode -> colorFilter
            colorFilter.connect(tonalSmoothFilter); // colorFilter -> tonalSmoothFilter
        } else {
            scriptNode.connect(tonalSmoothFilter); // scriptNode -> tonalSmoothFilter
        }
        
        // 2. Connect tonalSmoothFilter to gainNode
        tonalSmoothFilter.connect(gainNode);
        
        // 3. Connect gainNode to the audio destination
        gainNode.connect(audioContext.destination);
        // --- End audio graph establishment ---


		//--noise generation logic--
		let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0; // for pink noise
		let lastBrown = 0; // for brown noise

		scriptNode.onaudioprocess = function (e) {
			const output = e.outputBuffer.getChannelData(0);
			for (let i = 0; i < bufferSize; i++) {
				let white = Math.random() * 2 - 1; //base white noise

				if (noiseId === 'white') {
					output[i] = white * 0.5; //reducing volume
				} else if (noiseId === 'pink') {
					//simplified pink noise algo
					b0 = 0.99886 * b0 + white * 0.0555179;
					b1 = 0.99332 * b1 + white * 0.0750759;
					b2 = 0.969 * b2 + white * 0.153852;
					b3 = 0.8665 * b3 + white * 0.3104856;
					b4 = 0.55 * b4 + white * 0.5329522;
					b5 = 0.07616 * b5 + white * 0.016898;
					output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
					b6 = white * 0.115926;
				} else if (noiseId === 'brown') {
					//brown noise(integrated with white noise)
					output[i] = (lastBrown + 0.02 * white) / 1.02;
					lastBrown = output[i];
					output[i] *= 3.5;
				} else {
					// For 'green', 'deep-red', 'deep-blue', 'grey', adjust the colorFilter's frequency
                    // The colorFilter is guaranteed to exist and be connected for these noiseIds
					if (noiseId === 'green') {
						colorFilter.frequency.value = 800;
					}
					if (noiseId === 'deep-red') {
						colorFilter.frequency.value = 500;
					}
					if (noiseId === 'deep-blue') {
						colorFilter.frequency.value = 1000;
					}
					if (noiseId === 'grey') {
						colorFilter.frequency.value = 700;
					}

					output[i] = white * 2.0; // Increased multiplier for better perceived volume
				}
			}
		};
        
		// Store the generator nodes and filters
		noiseSources[noiseId] = { 
            scriptNode, 
            gainNode, 
            colorFilter: colorFilter, // Store color filter (will be null for white/pink/brown)
            tonalSmoothFilter // Store the new tonal smoothing filter
        };
		console.log(`Playing ${noiseId} noise.`);

        // Always fade in when noise starts
        const now = audioContext.currentTime;
        gainNode.gain.linearRampToValueAtTime(globalVolume, now + 0.5); // 0.5s fade-in
	}

	//function to stop a specific color noise
	function stopNoise(noiseId) {
		if (noiseSources[noiseId]) {
			const { scriptNode, gainNode, colorFilter, tonalSmoothFilter } = noiseSources[noiseId];
            const now = audioContext.currentTime;

            // Always fade out when noise stops
            gainNode.gain.linearRampToValueAtTime(0, now + 0.5); // 0.5s fade-out
            
            // Disconnect AFTER the fade, with a slight delay
            setTimeout(() => {
                scriptNode.disconnect(); // Disconnect scriptNode from its output
                if (colorFilter) { // Disconnect color filter if it exists
                    colorFilter.disconnect();
                }
                tonalSmoothFilter.disconnect(); // Disconnect the tonal smoothing filter
                gainNode.disconnect(); // Disconnect gainNode from audio destination
                
                scriptNode.onaudioprocess = null; // Explicitly set onaudioprocess to null to release resources
                delete noiseSources[noiseId];
                console.log(`Stopped ${noiseId} noise.`);
            }, 500); // Wait for the fade duration
		}
	}

	function stopAllNoises() {
		for (const noiseId in noiseSources) {
			stopNoise(noiseId);
		}
		activeNoises = []; //clears active noises array
	}

	function toggleNoise(noiseId) {
		initAudioContext(); // Ensure context is ready on click

		if (noiseId === 'no-noise') {
			stopAllNoises(); //Stopping all if "no noise" is selected
			activeNoises = ['no-noise']; //Visually activating "no-noise"
		} else {
			const index = activeNoises.indexOf(noiseId);
			if (index > -1) {
				//Deselecting an active noise
				activeNoises.splice(index, 1);
				stopNoise(noiseId);
			} else {
				// Selecting a new noise
				// If "no-noise" was active, deselect it first
				if (activeNoises.includes('no-noise')) {
					activeNoises = activeNoises.filter((id) => id !== 'no-noise');
				}
				activeNoises.push(noiseId);
				playNoise(noiseId);
			}
			
			if (activeNoises.length === 0) {
				activeNoises = ['no-noise'];
			} else if (activeNoises.includes('no-noise') && noiseId !== 'no-noise') {
				
				activeNoises = activeNoises.filter((id) => id !== 'no-noise');
			}
		}
		// Svelte reactivity: Reassigning the array forces an update if its contents changed
		activeNoises = activeNoises;
	}
	function isActive(noiseId) {
		return activeNoises.includes(noiseId);
	}

	//--Reactive element for global volume control (always smooth)--
	$: if (audioContext && globalVolume !== undefined) {
		const now = audioContext.currentTime;
		for(const noiseId in noiseSources){

			noiseSources[noiseId].gainNode.gain.linearRampToValueAtTime(globalVolume, now + 0.1); // 0.1s fade
		}
	}

    //Reactive statement for tonal smoothing toggle
    $: if (audioContext && isTonalSmoothEnabled !== undefined) {
        const now = audioContext.currentTime;
        for (const noiseId in noiseSources) {
            const { tonalSmoothFilter } = noiseSources[noiseId];
            if (tonalSmoothFilter) {
                const targetFrequency = isTonalSmoothEnabled ? 800 : 22000; // 800Hz for smoothing, 22kHz to bypass
                tonalSmoothFilter.frequency.linearRampToValueAtTime(targetFrequency, now + 0.3); // Smooth tonal change over 0.3s
            }
        }
    }
    
	//--Svelte lifecycle & store reactions--
	//react to globalCancel from MainTimer
	globalCancel.subscribe((value) => {
		if (value === true) {
			stopAllNoises();
			activeNoises = ['no-noise']; // Ensure "no-noise" is active visually after global cancel
			globalCancel.set(false); //resetting globalCancel flag
		}
	});

	//cleanup
	onDestroy(() => {
		stopAllNoises();
		if (audioContext) {
			audioContext.close();
			audioContext = null;
		}
	});
</script>

<style>
	.noise-mixer-container {
		background: #764c85;
		padding: 10px;
		border-radius: 30px;
		box-shadow: 10px 10px 0 #572769;
		min-height: 300px; 
		display: flex;
		flex-direction: column;
		align-items: center;
		min-width: 325px;
	}

	h2 {
		font-size: 35px;
		text-align: center;
		margin-top: 1px;
		margin-bottom: 20px;
		color: #ffffff;
		font-weight: 600;
	}

	.noise-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr); /*4 columns for noise blocks*/
		gap: 15px;
		padding: 20px;
		height: 300px; 
		width: 300px;
		margin-bottom: -8px;
		margin-top: -3px;
		background-color: #d7ade5;
		border-radius: 20px;
		border-top-left-radius: 0;
		border-top-right-radius: 0;
		border-bottom-left-radius: 26px;
		border-bottom-right-radius: 26px;
	}

	.noise-block {
		width: 60px;
		height: 100px;
		border-radius: 10px;
		background-color: lightgrey; 
		cursor: pointer;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-end; 
		padding-bottom: 8px;
		font-size: 11px;
		font-weight: 500;
		color: #00000059;
		font-family: "Kumbh Sans", monospace;
		text-transform: lowercase;
		position: relative;

		transition:
			transform 0.1s ease,
			box-shadow 0.1s ease,
			border-color 0.1s ease,
			margin 0.1s ease;
	
		box-shadow: 5px 5px 0 rgba(0, 0, 0, 0.2); 
		border: 2px solid transparent; 
		transform: translateY(0); 
		margin: 0; 
	}

	.noise-block.active {
		transform: translateY(3px); 
		margin-top: 3px; 
		box-shadow: inset 2px 2px 5px rgba(0, 0, 0, 0.4); 
		border-color: #3f1e4a; 
	}

	.noise-block:hover:not(.active) {
		transform: translateY(-2px); 
		margin-top: -2px; 
		box-shadow: 7px 7px 0 rgba(0, 0, 0, 0.25); 
	}

	.noise-block:active:not(.active) {
		transform: translateY(1px); 
		margin-top: 1px; 
		box-shadow: inset 1px 1px 3px rgba(0, 0, 0, 0.2); 
		border-color: rgba(0, 0, 0, 0.1); 
	}

	.diagonal-line {
		position: absolute;
		top: 50%;
		left: 0;
		width: 100%;
		height: 2px;
		background-color: red;
		transform: translateY(-50%) rotate(-75deg);
		transform-origin: center;
	}

    .audio-controls-panel {
        background-color: #ede7f6;
        border-radius: 20px;
        padding: 20px;
        margin-top: 20px;
        width: calc(100% - 40px);
        max-width: 360px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 15px;
		margin-bottom: 2px;
    }

    .volume-slider-container {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .volume-slider {
        -webkit-appearance: none;
        width: 100%;
        height: 8px;
        background: #925c9e;
        outline: none;
        border-radius: 4px;
        transition: opacity .2s;
        opacity: 0.8; 
    }

    .volume-slider:hover {
        opacity: 1;
    }

    .volume-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #3f1e4a;
        cursor: pointer;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    }

    .volume-slider::-moz-range-thumb {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #3f1e4a;
        cursor: pointer;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    }

    .smooth-toggle-button {
        background-color: #d7ade5; 
        color: #3f1e4a;
        border: none;
        padding: 10px 25px;
        border-radius: 20px;
        font-size: 1em;
        font-weight: bold;
        cursor: pointer;
        transition: background-color 0.2s ease, transform 0.1s ease, box-shadow 0.1s ease;
        box-shadow: 3px 3px 0 #7a2e96; 
    }

    .smooth-toggle-button.active {
        background-color: #764c85; 
        color: #ede7f6; 
        transform: translateY(2px); 
        box-shadow: inset 2px 2px 5px rgba(0,0,0,0.4); 
    }

    .smooth-toggle-button:hover:not(.active) {
        background-color: #c79ed8; 
        transform: translateY(-1px);
        box-shadow: 4px 4px 0 #a0522d;
    }

    .smooth-toggle-button:active:not(.active) {
        transform: translateY(1px);
        box-shadow: inset 1px 1px 3px rgba(0,0,0,0.2);
    }
</style>

<div class="noise-mixer-container">
	<h2>Add Noise</h2>
	<div class="noise-grid">
		{#each noiseBlocks as block (block.id)}
			<div
				class="noise-block"
				style="background-color: {block.color};"
				class:active={isActive(block.id)}
				on:click={() => toggleNoise(block.id)}
			>
				{#if block.diagonal}
					<div class="diagonal-line"></div>
				{/if}
				{block.label}
			</div>
		{/each}
	</div>

	<div class="audio-controls-panel">
		<div class="volume-slider-container">
			<input
				class="volume-slider"
				type="range"
				min="0"
				max="1"
				step="0.01"
				bind:value={globalVolume}
			/>
		</div>
		<button class="smooth-toggle-button" class:active={isTonalSmoothEnabled} on:click={toggleTonalSmooth}>
			Smooth
		</button>
	</div>
</div>
