# Doromi: Custom Pomodoro Timer with Noise Mixer

## Overview

Doromi is a personalized web-based Pomodoro Timer designed to enhance your focus and relaxation. It allows you to set custom work and break durations, track your intervals, and create unique ambient soundscapes by mixing various "color noises" with adjustable volume and giving the user the freedom to use the smooth toggle for either listening to raw color frequencies or "soften" the frequencies.

## Features

-   **Customizable Pomodoro & Break Timers:**
    *   Set productivity sessions from 5 to 90 minutes (in 5-minute increments).
    *   Set break sessions from 5 to 30 minutes (in 5-minute increments).
    *   Easily cycle through predefined time ranges with a click.
-   **Continuous Timer Loop:**
    *   The timer cycles indefinitely between productivity and break phases.
    *   Tracks completed cycles with an "Interval count."
    *   Full control with Start, Pause, and Cancel buttons.
-   **Advanced Noise Mixer:**
    *   **8 Unique Noise Options:** White, Pink, Brown, Green, Deep Red, Deep Blue, Grey, and a "No Noise" option.
    *   **Mix & Match:** Select one or more noises simultaneously for a personalized ambient blend.
    *   **Global Volume Control:** Adjust the overall volume of all playing noises with a smooth slider.
    *   **Default Smooth Audio Transitions:** All noise starts, stops, and volume changes feature gentle fade-in/out effects for a pleasant listening experience, preventing harsh audio pops.
    *   **Tonal Smoothing Toggle:** Activate a special filter to soften the tonal quality of noises, making them less harsh and more conducive to relaxation and focus.
-   **Interactive Tips Guide:**
    *   Navigate through a list of helpful tips on how to effectively mix color noises and utilize the smooth filter for optimal productivity and relaxation.

## Tech Stack

*   **Frontend Framework:** [SvelteKit](https://kit.svelte.dev/)
*   **Core Technologies:** HTML, CSS, JavaScript
*   **Audio Processing:** Web Audio API (for real-time noise generation and manipulation)
*   **State Management:** Svelte Stores

## Getting Started

Follow these steps to get a local copy of the project up and running on your machine.

### Prerequisites

*   [Node.js](https://nodejs.org/) (LTS version recommended)
*   [npm](https://www.npmjs.com/) (Node Package Manager, comes with Node.js)
*   [Git](https://git-scm.com/)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Rhy404/doromi-timer.git
    ```
   

2.  **Navigate into the project directory:**
    ```bash
    cd doromi-new
    ```

3.  **Install dependencies:**
    ```bash
    npm install
    ```

4.  **Run the development server:**
    ```bash
    npm run dev -- --open
    ```
    This will start the application and open it in your default web browser. The app will automatically reload as you make changes to the code.

## Usage

### Setting Timers
*   In the "Set Timer" panel (left-most box), click on "Productivity Timer" or "Break Timer" buttons.
*   Each click will cycle through the predefined time ranges (5-90 min for productivity, 5-30 min for break, in 5-minute increments).

### Controlling the Main Timer
*   **▶ (Play):** Starts the Pomodoro sequence (Productivity -> Break -> Productivity...).
*   **⏸ (Pause):** Pauses the currently active timer. Click Play again to resume.
*   **✖ (Cancel):** Stops the timer, resets both productivity and break timers to their initial values, and resets the "Interval count" to 0. It also stops all playing noises.

### Using the Noise Mixer
*   **Select Noises:** In the "Add Noise" panel (right-most box), click on any colored block to start playing that specific color noise. Click again to stop it.
*   **Mix Noises:** You can select multiple color blocks to blend different ambient sounds.
*   **Global Volume Slider:** Use the slider below the noise blocks to adjust the overall volume of all active noises. Volume changes will fade smoothly.
*   **Smooth Toggle Button:** Click the "Smooth" button to toggle between "raw" and "tonally smoothed" versions of the noises. The smoothed version will have reduced harshness, ideal for relaxation.
*   **"No Noise" Option:** Click the block with the red diagonal line to instantly stop all playing noises.
*   **"Desktop Notifications:** If granted permission by the user for notifications, after each productivity timer or break timer is completed, there is a sound chime along with a notification informing that. If permission not granted, the user will still be able to hear the sound chime.

### Navigating Tips
*   In the "Tips" panel (below the Noise Mixer), use the `◀` and `▶` arrows to cycle through helpful tips on noise mixing and usage.

## Future Enhancements (Ideas)

*   **Custom Volume for Each Noise:** Individual volume sliders for each color noise.
*   **Sound Selection:** Allow users to choose different sound textures for each color noise.


## License

This project is open source and available under the [MIT License](LICENSE).

## Contact

Feel free to reach out if you have any questions or suggestions!

-   GitHub: [@your-username](https://github.com/Rhy404) (Replace with your actual GitHub profile link)

---
