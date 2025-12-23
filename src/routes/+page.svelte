<script>
    import Header from '$lib/Header.svelte';
    import SetTimer from '$lib/SetTimer.svelte';
    import MainTimer from '$lib/MainTimer.svelte';
    import NoiseMixer from '$lib/NoiseMixer.svelte';
    import TipsPanel from '$lib/TipsPanel.svelte';
</script>

<style>
    :global(body){
        margin: 0;
        font-family:"Kumbh Sans", monospace;
        background-color: #26102e;
    }

    .app-container{
        display: flex;
        flex-direction: column; /*Vertical stack of items*/
        align-items: center;
        min-height: 100vh;
        padding: 20px;
        box-sizing: border-box;
    }

    .main-content-grid{
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 30px;
        width: 100%;
        max-width: 1200px;
        justify-content: center;
        align-items: start;
        margin-top: 20px;
        margin: 20px auto 0 auto;
    }

    /*NoiseMixer and TipsPanel*/
    .noise-section-container {
        display: flex;
        flex-direction: column; /* Stack children vertically */
        gap: 20px; /* Space between NoiseMixer and TipsPanel */
        width: 100%; /* Take full width of its grid column */
        align-items: center; /* Center content within this column */
    }
</style>

<div class="app-container">
    <Header />

    <div class="main-content-grid">
        <SetTimer />
        <MainTimer />
        <div class="noise-section-container">
            <NoiseMixer />
            <TipsPanel />
        </div>
    </div>
</div>


