// Ultra-Realistic Video Generation - Client-Side JavaScript

let currentOperationId = null;
let pollInterval = null;
let selectedStyle = 'professional';
let selectedPlatform = 'youtube';

// DOM Elements
const form = document.getElementById('videoForm');
const generateBtn = document.getElementById('generateBtn');
const statusContainer = document.getElementById('statusContainer');
const statusText = document.getElementById('statusText');
const progressFill = document.getElementById('progressFill');
const timeInfo = document.getElementById('timeInfo');
const videoContainer = document.getElementById('videoContainer');
const generatedVideo = document.getElementById('generatedVideo');
const errorMessage = document.getElementById('errorMessage');

// Toggle buttons - Style selection
document.querySelectorAll('[data-style]').forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active from all style buttons
        document.querySelectorAll('[data-style]').forEach(b => b.classList.remove('active'));
        // Add active to clicked button
        btn.classList.add('active');
        selectedStyle = btn.dataset.style;
    });
});

// Toggle buttons - Platform selection
document.querySelectorAll('[data-platform]').forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active from all platform buttons
        document.querySelectorAll('[data-platform]').forEach(b => b.classList.remove('active'));
        // Add active to clicked button
        btn.classList.add('active');
        selectedPlatform = btn.dataset.platform;
    });
});

// AI-powered character and content generation
async function generateCharacterDetails(characterName, userRequest) {
    // This will be handled by the backend AI
    return {
        profession: 'Auto-generated based on request',
        company: `${characterName}Co`,
        industry: 'Auto-detected',
        description: 'AI-generated character profile',
        dialogue: `"Hi! I'm ${characterName}. ${userRequest}"`
    };
}

// Form submission
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const characterName = document.getElementById('characterName').value;
    const userRequest = document.getElementById('userRequest').value;

    if (!characterName || !userRequest) {
        showError('Please fill in both character name and what you want them to say');
        return;
    }

    hideError();
    startGeneration();

    // Create simple request - backend AI will generate all details
    const requestData = {
        characterName: characterName,
        userRequest: userRequest,
        style: selectedStyle,
        platform: selectedPlatform,
        simpleMode: true // Flag for backend to use AI generation
    };

    try {
        const response = await fetch('/api/generate-video', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData)
        });

        const result = await response.json();

        if (result.success) {
            currentOperationId = result.operationId;
            updateStatus(`🎬 AI is creating ${characterName}'s video...`, 5);
            startPolling();
        } else {
            throw new Error(result.error || 'Generation failed');
        }
    } catch (error) {
        console.error('Generation error:', error);
        showError(error.message);
        resetForm();
    }
});

function startGeneration() {
    generateBtn.disabled = true;
    generateBtn.textContent = '🔄 Generating Video...';
    statusContainer.classList.add('show');
    videoContainer.classList.remove('show');
}

function startPolling() {
    if (pollInterval) clearInterval(pollInterval);

    pollInterval = setInterval(async () => {
        if (!currentOperationId) return;

        try {
            const response = await fetch(`/api/status/${currentOperationId}`);
            const data = await response.json();

            if (data.success) {
                const progress = Math.min(data.progress, 95);
                updateStatus(
                    `🎬 Generating ${data.character} video... ${progress}% complete`,
                    progress
                );

                const elapsed = Math.floor(data.elapsedTime);
                const estimated = Math.floor(data.estimatedTime);
                timeInfo.textContent = `Elapsed: ${elapsed}s | Estimated: ${estimated}s`;

                // Check if video is ready (in real implementation, this would check actual completion)
                if (progress >= 95) {
                    setTimeout(() => {
                        // Simulate completion for demo
                        completeGeneration();
                    }, 2000);
                }
            }
        } catch (error) {
            console.error('Polling error:', error);
        }
    }, 3000);
}

function completeGeneration() {
    if (pollInterval) clearInterval(pollInterval);

    updateStatus('✅ Video generation completed!', 100);

    setTimeout(() => {
        statusContainer.classList.remove('show');
        videoContainer.classList.add('show');

        // In real implementation, this would load the actual generated video
        // For demo purposes, we'll show a placeholder
        generatedVideo.src = 'https://www.w3schools.com/html/mov_bbb.mp4';

        resetForm();
    }, 1500);
}

function updateStatus(text, progress) {
    statusText.textContent = text;
    progressFill.style.width = `${progress}%`;
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
    setTimeout(() => errorMessage.classList.remove('show'), 5000);
}

function hideError() {
    errorMessage.classList.remove('show');
}

function resetForm() {
    generateBtn.disabled = false;
    generateBtn.textContent = '🎬 Generate Ultra-Realistic Video';
    currentOperationId = null;
    if (pollInterval) clearInterval(pollInterval);
}

function downloadVideo() {
    // In real implementation, this would download the actual generated video
    alert('Download functionality would be implemented here!');
}

function generateAnother() {
    videoContainer.classList.remove('show');
    form.scrollIntoView({ behavior: 'smooth' });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Ultra-Realistic Video Generation UI loaded!');

    // Check API health
    fetch('/api/health')
        .then(response => response.json())
        .then(data => console.log('✅ API Health:', data.message))
        .catch(error => console.error('❌ API Health Check Failed:', error));
});

// Add some nice UX touches
document.querySelectorAll('input, textarea, select').forEach(element => {
    element.addEventListener('focus', () => {
        element.style.transform = 'translateY(-1px)';
    });

    element.addEventListener('blur', () => {
        element.style.transform = 'translateY(0)';
    });
});