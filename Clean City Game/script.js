// script.js

document.addEventListener('DOMContentLoaded', () => {
    // --- Game State Variables ---
    let score = 0;
    let level = 1;
    let dollars = 50; // Starting dollars
    let passiveIncome = 1; // Dollars earned per interval (base)
    let pollutionFactor = 0.1; // How much score decreases passively per interval
    const FACTORY_CLICK_REWARD = 1; // Dollars earned per factory click

    // --- DOM References ---
    const scoreDisplay = document.getElementById('score-value');
    const levelDisplay = document.getElementById('level-value');
    const dollarsDisplay = document.getElementById('dollars-value');
    const levelDescription = document.getElementById('level-description');
    const gameContainer = document.getElementById('game-container');
    const cityVisualContainer = document.querySelector('.city-visual'); // Container for positioning feedback
    const upgradesList = document.getElementById('upgrades-list');
    const messageLog = document.getElementById('message-log');

    // --- Upgrade Definitions (Expanded List) ---
    const upgrades = [
        // --- Existing Upgrades ---
        { id: 'scrubber1', name: 'Basic Filters', cost: 30, scoreIncrease: 5, purchased: false, description: "+5 Score" },
        { id: 'recycling1', name: 'Basic Recycling Depot', cost: 50, scoreIncrease: 8, purchased: false, description: "+8 Score" },
        { id: 'greenRoofs', name: 'Green Roof Initiative', cost: 80, scoreIncrease: 12, purchased: false, description: "+12 Score" },
        { id: 'smartGrid', name: 'Implement Smart Grid', cost: 150, scoreIncrease: 15, purchased: false, description: "+15 Score" },
        { id: 'advFiltration', name: 'Adv. Water Filtration', cost: 120, scoreIncrease: 10, purchased: false, description: "+10 Score"},
        { id: 'urbanForestry', name: 'Urban Forestry Project', cost: 70, scoreIncrease: 7, purchased: false, description: "+7 Score"},
        { id: 'solarSubsidies', name: 'Solar Panel Subsidies', cost: 200, scoreIncrease: 18, purchased: false, description: "+18 Score"},
        { id: 'carbonCapture', name: 'Carbon Capture Tech (Beta)', cost: 350, scoreIncrease: 25, purchased: false, description: "+25 Score"},
        { id: 'incomeBoost1', name: 'Efficiency Training', cost: 100, scoreIncrease: 0, incomeBoost: 1, purchased: false, description: "+$1/sec"},

        // --- New Upgrades ---
        { id: 'windTurbines', name: 'Install Wind Turbines', cost: 250, scoreIncrease: 14, purchased: false, description: "+14 Score" },
        { id: 'evCharging', name: 'EV Charging Network', cost: 180, scoreIncrease: 9, purchased: false, description: "+9 Score" },
        { id: 'advComposting', name: 'Advanced Composting', cost: 130, scoreIncrease: 7, purchased: false, description: "+7 Score" },
        { id: 'greenCodes', name: 'Green Building Codes', cost: 220, scoreIncrease: 11, purchased: false, description: "+11 Score" },
        { id: 'riverCleanup', name: 'River Cleanup Project', cost: 90, scoreIncrease: 6, purchased: false, description: "+6 Score" },
        { id: 'energyStorage', name: 'Grid Battery Storage', cost: 300, scoreIncrease: 13, incomeBoost: 1, purchased: false, description: "+13 Score, +$1/sec" }, // Added income boost here
        { id: 'highTechRecycling', name: 'High-Tech Sorting Plant', cost: 280, scoreIncrease: 16, purchased: false, description: "+16 Score" },
        { id: 'expandBikeLanes', name: 'Expand Bike Lanes', cost: 60, scoreIncrease: 4, purchased: false, description: "+4 Score" },
        { id: 'geoExploration', name: 'Geothermal Exploration', cost: 400, scoreIncrease: 10, purchased: false, description: "+10 Score (Unlocks Future Tech?)" }, // Hinting at potential future expansion
        { id: 'industrialSymbiosis', name: 'Industrial Symbiosis Plan', cost: 500, scoreIncrease: 30, purchased: false, description: "+30 Score (Major Impact)" }, // High cost, high reward
    ];


    // --- Core Functions ---

    function updateDisplay() {
        scoreDisplay.textContent = Math.round(score);
        levelDisplay.textContent = level;
        dollarsDisplay.textContent = Math.round(dollars);

        // Update level class on container for CSS styling
        const targetClass = `level-${level}`;
        if (gameContainer.className !== targetClass) { // Ensure class is exactly the level
            gameContainer.className = targetClass;
        }

        // Update Level Description
        setLevelDescription();

        // Update Upgrade Buttons (enable/disable based on cost and purchased status)
        renderUpgrades();
    }

    function calculateLevel() {
        let newLevel = 1;
        if (score >= 80) newLevel = 5;
        else if (score >= 60) newLevel = 4;
        else if (score >= 40) newLevel = 3;
        else if (score >= 20) newLevel = 2;

        if (newLevel !== level) {
            level = newLevel;
            logMessage(`Level Up! Reached Level ${level}! City visuals updated.`);
            // Adjust passive factors based on level
            adjustPassiveFactors();
            // Note: If level changes rebuilt factory elements, listeners would need re-attaching
            // setupFactoryClickListeners();
        }
    }

    function setLevelDescription() {
        const descriptions = [
            "Level 1: The Grimy Start. High pollution, basic industry.",
            "Level 2: Early Efforts. Basic improvements are appearing.",
            "Level 3: Transitional Technologies. Cleaner options emerge.",
            "Level 4: Green Integration. Sustainability is taking hold.",
            "Level 5: Sustainable Future. A clean, thriving metropolis!"
        ];
        // Ensure level index is within bounds
        levelDescription.textContent = descriptions[Math.max(0, Math.min(level - 1, descriptions.length - 1))];
    }

    function adjustPassiveFactors() {
         // Higher level means less passive pollution
        pollutionFactor = Math.max(0, 0.12 - (level * 0.025)); // Example formula
        // Optional: Increase base passive income slightly with level
        // passiveIncome = 1 + Math.floor(level / 2); // Base income increase example
    }

    function gameTick() {
        // Earn passive income
        dollars += passiveIncome;

        // Apply passive pollution (score decrease) - less impact at higher levels
        score -= pollutionFactor;
        score = Math.max(0, score); // Prevent score going below 0

        // Check for level changes potentially caused by passive pollution decrease
        calculateLevel();

        // Update display every tick
        updateDisplay();
    }

    function buyUpgrade(upgradeId) {
        const upgrade = upgrades.find(u => u.id === upgradeId);
        if (!upgrade || upgrade.purchased) return; // Already bought or doesn't exist

        if (dollars >= upgrade.cost) {
            dollars -= upgrade.cost;
            score += upgrade.scoreIncrease;
            upgrade.purchased = true;

            // Apply income boost if applicable
            let logMsg = `Upgrade Purchased: ${upgrade.name}! (+${upgrade.scoreIncrease} Score)`;
            if (upgrade.incomeBoost) {
                passiveIncome += upgrade.incomeBoost;
                logMsg += `, +$${upgrade.incomeBoost}/sec`;
            }
            logMessage(logMsg + ")"); // Close the message correctly

            // Clamp score to 100 max
            score = Math.min(100, score);

            calculateLevel(); // Check if the score increase caused a level up
            updateDisplay();  // Update UI immediately after purchase
        } else {
            logMessage("Not enough Dollars!");
        }
    }

    function renderUpgrades() {
        upgradesList.innerHTML = ''; // Clear existing buttons
        upgrades.forEach(upgrade => {
            const button = document.createElement('button');
            button.id = upgrade.id;
            button.className = 'upgrade-button';
            button.disabled = upgrade.purchased || dollars < upgrade.cost;

            const nameSpan = document.createElement('span');
            nameSpan.textContent = upgrade.name;

            const infoSpan = document.createElement('span');
            infoSpan.className = 'upgrade-info';
            // Display cost and effect
            infoSpan.textContent = `Cost: $${upgrade.cost} | ${upgrade.description}`;

            button.appendChild(nameSpan);
            button.appendChild(infoSpan);


            if (upgrade.purchased) {
                 infoSpan.textContent = "Purchased"; // Overwrite info if purchased
                 button.style.backgroundColor = '#a5d6a7'; // Visually indicate purchased (optional)
                 button.style.color = '#333';
                 button.style.cursor = 'default';
            }

            button.addEventListener('click', () => buyUpgrade(upgrade.id));
            upgradesList.appendChild(button);
        });
    }

    function logMessage(message) {
        messageLog.textContent = message;
        // Optional: Clear message after a few seconds
        // Clear existing timeout if a new message comes quickly
        if (logMessage.timeoutId) {
            clearTimeout(logMessage.timeoutId);
        }
        logMessage.timeoutId = setTimeout(() => {
            // Check if the message is still the same one we set the timer for
            if (messageLog.textContent === message) {
                 messageLog.textContent = '';
            }
        }, 4000); // Clear after 4 seconds
    }

    // --- Factory Click Handling ---
    function handleFactoryClick(event) {
        // Increase dollars
        dollars += FACTORY_CLICK_REWARD;

        // --- Create Visual Feedback ---
        const feedback = document.createElement('span');
        feedback.className = 'click-feedback';
        feedback.textContent = `+$${FACTORY_CLICK_REWARD}`;

        // Get coordinates relative to the viewport
        const clickX = event.clientX;
        const clickY = event.clientY;

        // Get container position to calculate relative coordinates
        const containerRect = cityVisualContainer.getBoundingClientRect();

        // Calculate position relative to the container's top-left corner
        // Position near the click, slightly above
        const topPos = clickY - containerRect.top - 20; // Adjust vertical offset as needed
        const leftPos = clickX - containerRect.left - 10; // Adjust horizontal offset as needed

        feedback.style.position = 'absolute'; // Ensure absolute positioning within container
        feedback.style.top = `${topPos}px`;
        feedback.style.left = `${leftPos}px`;

        cityVisualContainer.appendChild(feedback); // Add to the visual area

        // Trigger the fade-out animation smoothly
        requestAnimationFrame(() => {
             requestAnimationFrame(() => { // Double request ensures rendering before transition starts
                feedback.classList.add('fade-out');
             });
        });

        // Remove the feedback element after the animation ends (1s)
        setTimeout(() => {
            if (feedback.parentNode) {
                 feedback.remove();
            }
        }, 1000); // Match the transition duration in CSS

        // Update the main dollars display immediately
        dollarsDisplay.textContent = Math.round(dollars);
        // Re-check upgrade affordability
        renderUpgrades();
    }

    // --- Setup Click Listeners ---
    function setupFactoryClickListeners() {
        // Use event delegation on the container for potentially dynamic elements
        // Or re-run this if factories are ever explicitly added/removed
        const factoryElements = document.querySelectorAll('.factory');
        factoryElements.forEach(factory => {
            // Make sure only one listener is attached
            factory.removeEventListener('click', handleFactoryClick);
            factory.addEventListener('click', handleFactoryClick);
        });
        console.log(`Attached click listeners to ${factoryElements.length} factories.`); // Debug log
    }


    // --- Game Initialization ---
    function initializeGame() {
        console.log("Initializing EcoCity..."); // Debug log
        renderUpgrades();
        setupFactoryClickListeners(); // Add listeners to initial factories
        adjustPassiveFactors(); // Set initial passive factors based on level 1
        updateDisplay(); // Set initial display values
        setInterval(gameTick, 1000); // Start the main game loop (1 tick per second)
        logMessage("Welcome to EcoCity! Click factories for extra cash and buy upgrades to improve your score.");
        console.log("Game Initialized."); // Debug log
    }

    // Start the game when the DOM is fully loaded
    initializeGame();
});