document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const scannerBtn = document.getElementById('scannerBtn');
    const scannerRing = document.getElementById('scannerRing');
    const scannerContainer = document.querySelector('.scanner-container');
    const instructionBox = document.getElementById('instructionBox');
    const statusMessage = document.getElementById('statusMessage');
    const progressSection = document.getElementById('progressSection');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const resultsContainer = document.getElementById('resultsContainer');
    const resetBtn = document.getElementById('resetBtn');

    // Result Elements
    const sysValue = document.getElementById('sysValue');
    const diaValue = document.getElementById('diaValue');
    const hrValue = document.getElementById('hrValue');
    const bpStatus = document.getElementById('bpStatus');

    // Variables
    let scanTimer;
    let progressTimer;
    let isScanning = false;
    let scanDuration = 3000; // 3 seconds scan
    let progress = 0;

    // Start Scanning
    const startScan = (e) => {
        // Prevent default behavior to avoid text selection or context menus on long press
        if (e.type === 'touchstart') {
            e.preventDefault();
        }

        if (isScanning) return;
        
        isScanning = true;
        progress = 0;
        
        // UI Updates
        scannerRing.classList.add('scanning-active');
        instructionBox.className = 'instruction-box scanning';
        statusMessage.textContent = 'Scanning vitals... keep holding';
        
        progressSection.classList.add('visible');
        progressFill.style.width = '0%';
        progressText.textContent = '0%';

        // Start progress animation
        const updateInterval = 30; // update every 30ms
        const progressStep = 100 / (scanDuration / updateInterval);

        progressTimer = setInterval(() => {
            progress += progressStep;
            if (progress >= 100) {
                progress = 100;
            }
            progressFill.style.width = `${progress}%`;
            progressText.textContent = `${Math.floor(progress)}%`;
        }, updateInterval);

        // Set scan completion timeout
        scanTimer = setTimeout(() => {
            completeScan();
        }, scanDuration);
    };

    // Stop/Cancel Scanning
    const cancelScan = () => {
        if (!isScanning || progress >= 100) return;
        
        isScanning = false;
        
        // Clear timers
        clearTimeout(scanTimer);
        clearInterval(progressTimer);
        
        // UI Updates
        scannerRing.classList.remove('scanning-active');
        instructionBox.className = 'instruction-box error';
        statusMessage.textContent = 'Scan interrupted. Keep holding your finger.';
        
        progressSection.classList.remove('visible');
        
        // Delay resetting progress bar visually until it's hidden
        setTimeout(() => {
            if (!isScanning) {
                progressFill.style.width = '0%';
                progressText.textContent = '0%';
            }
        }, 300);

        // Reset to normal state after a delay if not scanning again
        setTimeout(() => {
            if (!isScanning && instructionBox.classList.contains('error')) {
                instructionBox.className = 'instruction-box';
                statusMessage.textContent = 'Place and hold your finger to scan';
            }
        }, 2000);
    };

    // Complete Scanning
    const completeScan = () => {
        clearInterval(progressTimer);
        progressFill.style.width = '100%';
        progressText.textContent = '100%';
        
        // Add a slight delay before showing results for better UX
        setTimeout(() => {
            // Generate mock vitals
            generateVitals();
            
            // UI Updates
            scannerContainer.classList.add('hidden');
            progressSection.classList.remove('visible');
            
            instructionBox.className = 'instruction-box success';
            statusMessage.textContent = 'Scan complete. Results ready.';
            
            resultsContainer.classList.remove('hidden');
        }, 500);
    };

    // Generate Mock Vitals
    const generateVitals = () => {
        // Random Sys (110 - 145)
        const sys = Math.floor(Math.random() * (145 - 110 + 1)) + 110;
        // Random Dia (70 - 95)
        const dia = Math.floor(Math.random() * (95 - 70 + 1)) + 70;
        // Random HR (60 - 90)
        const hr = Math.floor(Math.random() * (90 - 60 + 1)) + 60;

        // Animate numbers
        animateValue(sysValue, 0, sys, 1000);
        animateValue(diaValue, 0, dia, 1000);
        animateValue(hrValue, 0, hr, 1000);

        // Determine Status based on AHA guidelines roughly
        setTimeout(() => {
            if (sys < 120 && dia < 80) {
                bpStatus.className = 'metric-status normal';
                bpStatus.querySelector('.status-text').textContent = 'Normal';
            } else if ((sys >= 120 && sys <= 129) && dia < 80) {
                bpStatus.className = 'metric-status elevated';
                bpStatus.querySelector('.status-text').textContent = 'Elevated';
            } else {
                bpStatus.className = 'metric-status high';
                bpStatus.querySelector('.status-text').textContent = 'High';
            }
        }, 1000);
    };

    // Number animation helper for counting up effect
    const animateValue = (obj, start, end, duration) => {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            // Ease out quad for smooth deceleration
            const easeOut = progress * (2 - progress);
            obj.innerHTML = Math.floor(easeOut * (end - start) + start);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                obj.innerHTML = end;
            }
        };
        window.requestAnimationFrame(step);
    };

    // Reset Application
    const resetApp = () => {
        isScanning = false;
        progress = 0;
        
        // Hide results, show scanner
        resultsContainer.classList.add('hidden');
        scannerContainer.classList.remove('hidden');
        scannerRing.classList.remove('scanning-active');
        
        // Reset UI text
        instructionBox.className = 'instruction-box';
        statusMessage.textContent = 'Place and hold your finger to scan';
        
        progressFill.style.width = '0%';
        progressText.textContent = '0%';
        
        // Reset Values visually
        sysValue.textContent = '--';
        diaValue.textContent = '--';
        hrValue.textContent = '--';
        
        bpStatus.className = 'metric-status';
        bpStatus.querySelector('.status-text').textContent = 'Analyzing...';
    };

    // Event Listeners
    // Mouse events
    scannerBtn.addEventListener('mousedown', startScan);
    window.addEventListener('mouseup', cancelScan);
    
    // Touch events for mobile devices
    scannerBtn.addEventListener('touchstart', startScan, { passive: false });
    window.addEventListener('touchend', cancelScan);
    window.addEventListener('touchcancel', cancelScan);

    // Reset button
    resetBtn.addEventListener('click', resetApp);
});
