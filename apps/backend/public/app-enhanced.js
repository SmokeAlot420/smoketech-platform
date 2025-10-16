// Ultra-Realistic Video Generation - Enhanced Client-Side JavaScript

let currentOperationId = null;
let pollInterval = null;
let selectedStyle = 'professional';
let selectedPlatform = 'youtube';

// Character templates with enhanced data
const characterTemplates = {
    sophia: {
        name: 'Sophia',
        request: 'Share exclusive fashion finds and lifestyle tips that help you live your best life'
    },
    laura: {
        name: 'Laura',
        request: 'Review car insurance options and help people save hundreds on their coverage'
    },
    mike: {
        name: 'Mike',
        request: 'Teach high-energy workout routines and fitness transformation tips'
    },
    sarah: {
        name: 'Sarah',
        request: 'Share professional cooking techniques and restaurant-quality recipes'
    },
    alex: {
        name: 'Alex',
        request: 'Review the latest tech gadgets and provide buying recommendations'
    },
    emma: {
        name: 'Emma',
        request: 'Give professional fashion advice and wardrobe styling tips'
    }
};

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

// Character card interactions
document.querySelectorAll('.character-card').forEach(card => {
    card.addEventListener('click', () => {
        const characterKey = card.dataset.character;
        const template = characterTemplates[characterKey];

        if (template) {
            // Fill form with character data
            document.getElementById('characterName').value = template.name;
            document.getElementById('userRequest').value = template.request;

            // Add ripple effect
            createRippleEffect(card);

            // Scroll to form
            document.querySelector('.form-container').scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });

            // Highlight form briefly
            const formContainer = document.querySelector('.form-container');
            formContainer.style.boxShadow = '0 0 30px rgba(102, 126, 234, 0.6)';
            formContainer.style.transform = 'scale(1.02)';

            setTimeout(() => {
                formContainer.style.boxShadow = '0 20px 40px rgba(0,0,0,0.1)';
                formContainer.style.transform = 'scale(1)';
            }, 1500);
        }
    });

    // Add hover sound effect simulation
    card.addEventListener('mouseenter', () => {
        card.style.filter = 'brightness(1.05)';
    });

    card.addEventListener('mouseleave', () => {
        card.style.filter = 'brightness(1)';
    });
});

// Create ripple effect function
function createRippleEffect(element) {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);

    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = '50%';
    ripple.style.top = '50%';
    ripple.style.transform = 'translate(-50%, -50%)';
    ripple.style.position = 'absolute';
    ripple.style.borderRadius = '50%';
    ripple.style.background = 'rgba(102, 126, 234, 0.3)';
    ripple.style.pointerEvents = 'none';
    ripple.style.animation = 'ripple 0.6s ease-out';

    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);

    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Add ripple animation CSS
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    @keyframes ripple {
        0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 1;
        }
        100% {
            transform: translate(-50%, -50%) scale(2);
            opacity: 0;
        }
    }
`;
document.head.appendChild(rippleStyle);

// Toggle buttons - Style selection
document.querySelectorAll('[data-style]').forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active from all style buttons
        document.querySelectorAll('[data-style]').forEach(b => b.classList.remove('active'));
        // Add active to clicked button
        btn.classList.add('active');
        selectedStyle = btn.dataset.style;

        // Add click effect
        createButtonClickEffect(btn);
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

        // Add click effect
        createButtonClickEffect(btn);
    });
});

// Button click effect
function createButtonClickEffect(button) {
    button.style.transform = 'scale(0.95)';
    setTimeout(() => {
        button.style.transform = 'scale(1)';
    }, 100);
}

// Enhanced form submission
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

// Enhanced generation start
function startGeneration() {
    generateBtn.disabled = true;
    generateBtn.textContent = '🔄 Creating Magic...';
    generateBtn.style.background = 'linear-gradient(135deg, #ffa726 0%, #fb8c00 100%)';
    statusContainer.classList.add('show');
    videoContainer.classList.remove('show');

    // Add loading animation
    generateBtn.innerHTML = '<span style="display: inline-block; animation: spin 1s linear infinite;">🔄</span> Creating Magic...';
}

// Add spinning animation
const spinStyle = document.createElement('style');
spinStyle.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
`;
document.head.appendChild(spinStyle);

// Enhanced status polling
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

                // Enhanced progress updates
                if (progress < 30) {
                    statusText.innerHTML = `🧠 AI analyzing ${data.character}'s character...`;
                } else if (progress < 60) {
                    statusText.innerHTML = `🎭 Generating facial expressions and lip sync...`;
                } else if (progress < 90) {
                    statusText.innerHTML = `🎬 Rendering ultra-realistic video...`;
                } else {
                    statusText.innerHTML = `✨ Applying final polish...`;
                }

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

// Enhanced completion with celebration
function completeGeneration() {
    if (pollInterval) clearInterval(pollInterval);

    updateStatus('✅ Video generation completed!', 100);

    // Show celebration effect
    showCelebrationEffect();

    setTimeout(() => {
        statusContainer.classList.remove('show');
        videoContainer.classList.add('show');

        // In real implementation, this would load the actual generated video
        generatedVideo.src = 'https://www.w3schools.com/html/mov_bbb.mp4';

        resetForm();
    }, 1500);
}

// Celebration effect
function showCelebrationEffect() {
    const colors = ['#667eea', '#764ba2', '#ffa726', '#42a5f5', '#26c6da'];

    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            createConfetti(colors[Math.floor(Math.random() * colors.length)]);
        }, i * 50);
    }
}

function createConfetti(color) {
    const confetti = document.createElement('div');
    confetti.style.position = 'fixed';
    confetti.style.width = '10px';
    confetti.style.height = '10px';
    confetti.style.backgroundColor = color;
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.top = '-10px';
    confetti.style.zIndex = '9999';
    confetti.style.borderRadius = '50%';
    confetti.style.pointerEvents = 'none';
    confetti.style.animation = 'fall 3s linear forwards';

    document.body.appendChild(confetti);

    setTimeout(() => {
        confetti.remove();
    }, 3000);
}

// Falling animation for confetti
const confettiStyle = document.createElement('style');
confettiStyle.textContent = `
    @keyframes fall {
        0% {
            transform: translateY(-10px) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(confettiStyle);

function updateStatus(text, progress) {
    statusText.innerHTML = text;
    progressFill.style.width = `${progress}%`;

    // Add pulse effect to progress bar
    if (progress > 0) {
        progressFill.style.animation = 'pulse 2s ease-in-out infinite';
    }
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');

    // Auto-hide error after 5 seconds
    setTimeout(() => errorMessage.classList.remove('show'), 5000);
}

function hideError() {
    errorMessage.classList.remove('show');
}

function resetForm() {
    generateBtn.disabled = false;
    generateBtn.textContent = '🎬 Generate Ultra-Realistic Video';
    generateBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    currentOperationId = null;
    if (pollInterval) clearInterval(pollInterval);
}

// Video gallery interactions
document.querySelectorAll('.video-card').forEach(card => {
    card.addEventListener('click', () => {
        // Add click effect
        card.style.transform = 'translateY(-10px) scale(0.98)';
        setTimeout(() => {
            card.style.transform = 'translateY(-10px)';
        }, 150);

        // In real implementation, this would play the actual video
        alert('Video playback would be implemented here!');
    });
});

// Enhanced functions for download and generate another
function downloadVideo() {
    // Add download animation
    const btn = event.target;
    btn.style.background = '#20c997';
    btn.textContent = '⬇️ Downloading...';

    setTimeout(() => {
        btn.style.background = '#28a745';
        btn.textContent = '✅ Downloaded!';

        setTimeout(() => {
            btn.textContent = '📥 Download Video';
        }, 2000);
    }, 1000);

    // In real implementation, this would download the actual generated video
    console.log('Download initiated');
}

function generateAnother() {
    videoContainer.classList.remove('show');
    document.querySelector('.hero-section').scrollIntoView({
        behavior: 'smooth'
    });

    // Clear form
    document.getElementById('characterName').value = '';
    document.getElementById('userRequest').value = '';
}

// Smooth scrolling for character cards
function smoothScrollToForm() {
    document.querySelector('.form-container').scrollIntoView({
        behavior: 'smooth',
        block: 'center'
    });
}

// Initialize enhanced UI
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Ultra-Realistic Video Generation UI (Enhanced) loaded!');

    // Add entrance animations
    const elements = document.querySelectorAll('.character-card, .stat-item, .video-card');
    elements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';

        setTimeout(() => {
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, index * 100);
    });

    // Check API health with enhanced feedback
    fetch('/api/health')
        .then(response => response.json())
        .then(data => {
            console.log('✅ API Health:', data.message);

            // Show subtle success indicator
            const successIndicator = document.createElement('div');
            successIndicator.textContent = '🟢 System Ready';
            successIndicator.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(40, 167, 69, 0.9);
                color: white;
                padding: 10px 15px;
                border-radius: 20px;
                font-size: 0.9rem;
                z-index: 9999;
                backdrop-filter: blur(10px);
                animation: slideInRight 0.5s ease;
            `;

            document.body.appendChild(successIndicator);

            setTimeout(() => {
                successIndicator.style.opacity = '0';
                setTimeout(() => successIndicator.remove(), 500);
            }, 3000);
        })
        .catch(error => {
            console.error('❌ API Health Check Failed:', error);

            // Show error indicator
            const errorIndicator = document.createElement('div');
            errorIndicator.textContent = '🔴 System Error';
            errorIndicator.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(220, 53, 69, 0.9);
                color: white;
                padding: 10px 15px;
                border-radius: 20px;
                font-size: 0.9rem;
                z-index: 9999;
                backdrop-filter: blur(10px);
            `;

            document.body.appendChild(errorIndicator);
        });
});

// Enhanced input interactions
document.querySelectorAll('input, textarea').forEach(element => {
    element.addEventListener('focus', () => {
        element.style.transform = 'translateY(-2px)';
        element.style.boxShadow = '0 10px 25px rgba(102, 126, 234, 0.15)';
    });

    element.addEventListener('blur', () => {
        element.style.transform = 'translateY(0)';
        element.style.boxShadow = 'none';
    });

    // Add typing effect
    element.addEventListener('input', () => {
        element.style.animation = 'pulse 0.3s ease';
        setTimeout(() => {
            element.style.animation = '';
        }, 300);
    });
});

// Add slide-in animation
const slideInStyle = document.createElement('style');
slideInStyle.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(slideInStyle);