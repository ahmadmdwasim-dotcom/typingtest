// Application State
const state = {
    user: {
        name: '',
        phone: '',
        email: ''
    },
    testConfig: {
        duration: 0,
        lessonText: '',
        lessonName: '',
        extendedText: '',
        paragraphs: [],
        currentParagraphIndex: 0,
        currentCharInParagraph: 0
    },
    testState: {
        startTime: 0,
        elapsed: 0,
        typedChars: 0,
        correctChars: 0,
        errors: 0,
        wpmHistory: [],
        accuracyHistory: [],
        isPaused: false,
        isRunning: false,
        timerInterval: null,
        wpmInterval: null
    },
    results: {
        finalWPM: 0,
        accuracy: 0,
        totalChars: 0,
        errors: 0,
        timeElapsed: 0,
        testDate: ''
    }
};

// DOM Elements
const screens = {
    screen1: document.getElementById('screen1'),
    screen2: document.getElementById('screen2'),
    screen3: document.getElementById('screen3')
};

const userDetailsForm = document.getElementById('userDetailsForm');
const nameInput = document.getElementById('name');
const phoneInput = document.getElementById('phone');
const emailInput = document.getElementById('email');
const instructionsButton = document.getElementById('instructionsButton');
const instructionsModal = document.getElementById('instructionsModal');
const closeInstructions = document.getElementById('closeInstructions');
const durationButtons = document.querySelectorAll('.duration-button');
const customTimeInput = document.getElementById('customTimeInput');
const customTime = document.getElementById('customTime');
const lessonSelect = document.getElementById('lessonSelect');
const fileUpload = document.getElementById('fileUpload');
const lessonFile = document.getElementById('lessonFile');
const uploadedFileInfo = document.getElementById('uploadedFileInfo');
const beginTest = document.getElementById('beginTest');
const backToUserDetails = document.getElementById('backToUserDetails');

const wpmValue = document.getElementById('wpmValue');
const accuracyValue = document.getElementById('accuracyValue');
const timerValue = document.getElementById('timerValue');
const testProgress = document.getElementById('testProgress');
const passageContainer = document.getElementById('passageContainer');
const passageText = document.getElementById('passageText');
const typingInput = document.getElementById('typingInput');
const pauseResume = document.getElementById('pauseResume');
const endTest = document.getElementById('endTest');

const resultsModal = document.getElementById('resultsModal');
const finalWPM = document.getElementById('finalWPM');
const finalAccuracy = document.getElementById('finalAccuracy');
const totalChars = document.getElementById('totalChars');
const totalErrors = document.getElementById('totalErrors');
const homeButton = document.getElementById('homeButton');
const newTestButton = document.getElementById('newTest');
const downloadReport = document.getElementById('downloadReport');
const sendEmail = document.getElementById('sendEmail');

// Sample Lessons
const lessons = [
    { 
        id: 1, 
        name: 'Technology', 
        text: 'Technology has transformed the way we live, work, and communicate. From smartphones to artificial intelligence, technological advancements continue to shape our world. The internet connects billions of people globally, enabling instant communication and access to information. As technology evolves, it brings both opportunities and challenges that society must navigate carefully.' 
    },
    { 
        id: 2, 
        name: 'Nature', 
        text: 'Nature provides us with breathtaking landscapes, diverse ecosystems, and essential resources. Forests, oceans, and mountains host millions of species, each playing a vital role in maintaining ecological balance. Protecting our natural environment is crucial for future generations, as biodiversity loss and climate change threaten the delicate systems that sustain life on Earth.' 
    },
    { 
        id: 3, 
        name: 'Health', 
        text: 'Maintaining good health requires a balanced approach to physical, mental, and emotional well-being. Regular exercise, proper nutrition, and adequate sleep form the foundation of a healthy lifestyle. Preventive care and regular check-ups can help detect potential health issues early, while stress management techniques contribute to overall wellness and longevity.' 
    }
];

// Initialize the application
function init() {
    setupEventListeners();
    generateLessonOptions();
    
    // Add click event to focus typing input when clicking anywhere on screen3
    screens.screen3.addEventListener('click', () => {
        if (state.testState.isRunning && !state.testState.isPaused) {
            typingInput.focus();
        }
    });
}

// Set up event listeners
function setupEventListeners() {
    userDetailsForm.addEventListener('submit', handleUserDetailsSubmit);
    instructionsButton.addEventListener('click', showInstructions);
    closeInstructions.addEventListener('click', closeInstructionsModal);

    // Duration button event listeners
    durationButtons.forEach(button => {
        button.addEventListener('click', handleDurationButtonClick);
    });
    
    customTime.addEventListener('input', handleCustomTimeInput);
    lessonSelect.addEventListener('change', handleLessonSelect);
    fileUpload.addEventListener('click', () => lessonFile.click());
    lessonFile.addEventListener('change', handleFileUpload);
    beginTest.addEventListener('click', handleBeginTest);
    backToUserDetails.addEventListener('click', () => switchScreen('screen1'));

    // Typing input event listeners
    typingInput.addEventListener('input', handleTypingInput);
    typingInput.addEventListener('keydown', handleTypingKeydown);
    
    pauseResume.addEventListener('click', togglePause);
    endTest.addEventListener('click', endTestEarly);

    // Results modal event listeners
    homeButton.addEventListener('click', goToHome);
    newTestButton.addEventListener('click', resetTest);
    downloadReport.addEventListener('click', downloadTestReport);
    sendEmail.addEventListener('click', sendTestReport);

    // Close modal when clicking outside
    instructionsModal.addEventListener('click', function(e) {
        if (e.target === instructionsModal) {
            closeInstructionsModal();
        }
    });
}

// Instructions Modal Functions
function showInstructions() {
    instructionsModal.classList.add('active');
}

function closeInstructionsModal() {
    instructionsModal.classList.remove('active');
}

// Handle duration button click
function handleDurationButtonClick(e) {
    // Remove selected class from all buttons
    durationButtons.forEach(button => {
        button.classList.remove('selected');
    });
    
    // Add selected class to clicked button
    e.currentTarget.classList.add('selected');
    
    const duration = e.currentTarget.dataset.duration;
    
    if (duration === 'custom') {
        customTimeInput.classList.add('show');
        state.testConfig.duration = 0;
    } else {
        customTimeInput.classList.remove('show');
        state.testConfig.duration = parseInt(duration) * 60;
    }
    
    updateBeginTestButton();
}

// Handle typing input
function handleTypingInput(e) {
    if (!state.testState.isRunning || state.testState.isPaused) return;
    
    const input = typingInput.value;
    if (input.length === 0) return;
    
    const currentChar = input[input.length - 1];
    handleCharacterTyped(currentChar);
    
    // Clear the input to prevent accumulation
    typingInput.value = '';
}

// Handle special keys in typing input
function handleTypingKeydown(e) {
    if (!state.testState.isRunning || state.testState.isPaused) return;
    
    if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
    }
    
    // Prevent default for tab and other special keys that might cause issues
    if (e.key === 'Tab' || e.key === 'Escape') {
        e.preventDefault();
    }
}

// Generate lesson options in dropdown
function generateLessonOptions() {
    lessons.forEach(lesson => {
        const option = document.createElement('option');
        option.value = lesson.id;
        option.textContent = lesson.name;
        lessonSelect.appendChild(option);
    });
}

// Handle lesson selection from dropdown
function handleLessonSelect(e) {
    const lessonId = parseInt(e.target.value);
    if (!lessonId) {
        state.testConfig.lessonText = '';
        state.testConfig.lessonName = '';
        updateBeginTestButton();
        return;
    }
    
    const selectedLesson = lessons.find(lesson => lesson.id === lessonId);
    if (selectedLesson) {
        state.testConfig.lessonText = selectedLesson.text;
        state.testConfig.lessonName = selectedLesson.name;
        uploadedFileInfo.style.display = 'none';
        updateBeginTestButton();
    }
}

// Handle file upload
function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file type and size
    if (file.type !== 'text/plain' && !file.name.endsWith('.txt')) {
        alert('Please upload a .txt file');
        return;
    }
    
    if (file.size > 1024 * 1024) { // 1MB limit
        alert('File size must be less than 1MB');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result;
        state.testConfig.lessonText = content;
        state.testConfig.lessonName = file.name;
        
        // Update UI
        uploadedFileInfo.innerHTML = `<strong>Uploaded:</strong> ${file.name} (${Math.round(file.size/1024)} KB)`;
        uploadedFileInfo.style.display = 'block';
        lessonSelect.value = '';
        
        updateBeginTestButton();
    };
    reader.readAsText(file);
}

// Handle custom time input
function handleCustomTimeInput(e) {
    const time = parseInt(e.target.value);
    if (time >= 1 && time <= 180) {
        state.testConfig.duration = time * 60;
        updateBeginTestButton();
    } else {
        state.testConfig.duration = 0;
        updateBeginTestButton();
    }
}

// Update begin test button state
function updateBeginTestButton() {
    beginTest.disabled = !(state.testConfig.duration > 0 && state.testConfig.lessonText);
}

// Handle user details form submission
function handleUserDetailsSubmit(e) {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) return;
    
    // Save user details
    state.user.name = nameInput.value.trim();
    state.user.phone = phoneInput.value.trim();
    state.user.email = emailInput.value.trim();
    
    // Switch to test setup screen
    switchScreen('screen2');
}

// Validate user details form
function validateForm() {
    let isValid = true;
    
    // Validate name
    if (nameInput.value.trim().length < 2) {
        document.getElementById('nameError').classList.add('show');
        isValid = false;
    } else {
        document.getElementById('nameError').classList.remove('show');
    }
    
    // Validate phone
    const phoneRegex = /^\d{7,}$/;
    if (!phoneRegex.test(phoneInput.value.trim())) {
        document.getElementById('phoneError').classList.add('show');
        isValid = false;
    } else {
        document.getElementById('phoneError').classList.remove('show');
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput.value.trim())) {
        document.getElementById('emailError').classList.add('show');
        isValid = false;
    } else {
        document.getElementById('emailError').classList.remove('show');
    }
    
    return isValid;
}

// Handle begin test
function handleBeginTest() {
    if (!state.testConfig.duration || !state.testConfig.lessonText) return;
    
    // Prepare the test
    prepareTest();
    
    // Switch to typing test screen
    switchScreen('screen3');
    
    // Start the test
    startTest();
}

// Prepare the test
function prepareTest() {
    // Generate extended text for the test duration
    state.testConfig.extendedText = generateExtendedText(state.testConfig.lessonText);
    
    // Split into paragraphs
    state.testConfig.paragraphs = state.testConfig.extendedText.split('\n\n');
    state.testConfig.currentParagraphIndex = 0;
    state.testConfig.currentCharInParagraph = 0;
    
    // Reset test state
    state.testState = {
        startTime: 0,
        elapsed: 0,
        typedChars: 0,
        correctChars: 0,
        errors: 0,
        wpmHistory: [],
        accuracyHistory: [],
        isPaused: false,
        isRunning: false,
        timerInterval: null,
        wpmInterval: null
    };
    
    // Display the passage
    displayPassage();
    
    // Set initial timer value
    timerValue.textContent = formatTime(state.testConfig.duration);
    
    // Set initial progress
    testProgress.style.width = '0%';
}

// Generate extended text based on original text
function generateExtendedText(originalText) {
    // For simplicity, we'll repeat the original text to create enough content
    let extendedText = '';
    const repetitions = Math.ceil(1000 / originalText.length); // Aim for ~1000 chars
    
    for (let i = 0; i < repetitions; i++) {
        extendedText += originalText + '\n\n';
    }
    
    return extendedText.trim();
}

// Display the passage in the UI
function displayPassage() {
    passageText.innerHTML = '';
    
    state.testConfig.paragraphs.forEach((paragraph, index) => {
        const paragraphElement = document.createElement('div');
        paragraphElement.className = 'paragraph';
        paragraphElement.id = `paragraph-${index}`;
        
        if (index === state.testConfig.currentParagraphIndex) {
            paragraphElement.classList.add('current-paragraph');
        }
        
        const chars = paragraph.split('');
        chars.forEach((char, charIndex) => {
            const charSpan = document.createElement('span');
            charSpan.className = 'char';
            charSpan.id = `char-${index}-${charIndex}`;
            charSpan.textContent = char;
            
            // Mark current character
            if (index === state.testConfig.currentParagraphIndex && 
                charIndex === state.testConfig.currentCharInParagraph) {
                charSpan.classList.add('current');
            }
            
            paragraphElement.appendChild(charSpan);
        });
        
        passageText.appendChild(paragraphElement);
    });
}

// Start the test
function startTest() {
    state.testState.startTime = Date.now();
    state.testState.isRunning = true;
    
    // Start timer
    state.testState.timerInterval = setInterval(updateTimer, 1000);
    
    // Start WPM calculation
    state.testState.wpmInterval = setInterval(updateWPM, 100);
    
    // Focus the typing input
    typingInput.focus();
}

// Update the timer
function updateTimer() {
    if (state.testState.isPaused) return;
    
    state.testState.elapsed = Math.floor((Date.now() - state.testState.startTime) / 1000);
    const timeRemaining = Math.max(0, state.testConfig.duration - state.testState.elapsed);
    
    timerValue.textContent = formatTime(timeRemaining);
    
    // Update progress bar
    const progressPercent = (state.testState.elapsed / state.testConfig.duration) * 100;
    testProgress.style.width = `${Math.min(progressPercent, 100)}%`;
    
    // End test if time is up
    if (timeRemaining <= 0) {
        endTestAndShowResults();
    }
}

// Update WPM and accuracy
function updateWPM() {
    if (state.testState.isPaused) return;
    
    const minutes = state.testState.elapsed / 60;
    const wpm = minutes > 0 ? Math.round(state.testState.correctChars / 5 / minutes) : 0;
    const accuracy = state.testState.typedChars > 0 ? 
        Math.round((state.testState.correctChars / state.testState.typedChars) * 100) : 100;
    
    wpmValue.textContent = wpm;
    accuracyValue.textContent = `${accuracy}%`;
    
    // Store history for chart
    state.testState.wpmHistory.push(wpm);
    state.testState.accuracyHistory.push(accuracy);
}

// Handle character typed
function handleCharacterTyped(char) {
    if (!state.testState.isRunning || state.testState.isPaused) return;
    
    const currentParagraph = state.testConfig.paragraphs[state.testConfig.currentParagraphIndex];
    const expectedChar = currentParagraph[state.testConfig.currentCharInParagraph];
    
    // Update character display
    const charElement = document.getElementById(`char-${state.testConfig.currentParagraphIndex}-${state.testConfig.currentCharInParagraph}`);
    
    if (char === expectedChar) {
        // Correct character
        charElement.classList.remove('current');
        charElement.classList.add('correct');
        state.testState.correctChars++;
    } else {
        // Incorrect character
        charElement.classList.remove('current');
        charElement.classList.add('incorrect');
        state.testState.errors++;
    }
    
    state.testState.typedChars++;
    
    // Move to next character
    state.testConfig.currentCharInParagraph++;
    
    // Check if we've reached the end of the current paragraph
    if (state.testConfig.currentCharInParagraph >= currentParagraph.length) {
        // Move to next paragraph
        state.testConfig.currentParagraphIndex++;
        state.testConfig.currentCharInParagraph = 0;
        
        // Check if we've reached the end of all paragraphs
        if (state.testConfig.currentParagraphIndex >= state.testConfig.paragraphs.length) {
            // Generate more text
            state.testConfig.extendedText += '\n\n' + generateExtendedText(state.testConfig.lessonText);
            state.testConfig.paragraphs = state.testConfig.extendedText.split('\n\n');
        }
        
        // Update display
        displayPassage();
        
        // Scroll to current paragraph
        const currentParagraphElement = document.getElementById(`paragraph-${state.testConfig.currentParagraphIndex}`);
        currentParagraphElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
        // Update current character highlight
        const nextCharElement = document.getElementById(`char-${state.testConfig.currentParagraphIndex}-${state.testConfig.currentCharInParagraph}`);
        nextCharElement.classList.add('current');
    }
}

// Handle backspace
function handleBackspace() {
    if (state.testConfig.currentCharInParagraph === 0) {
        // Can't go back beyond the first character of the paragraph
        if (state.testConfig.currentParagraphIndex === 0) return;
        
        // Move to previous paragraph
        state.testConfig.currentParagraphIndex--;
        const prevParagraph = state.testConfig.paragraphs[state.testConfig.currentParagraphIndex];
        state.testConfig.currentCharInParagraph = prevParagraph.length - 1;
        
        // Update display
        displayPassage();
        
        // Scroll to current paragraph
        const currentParagraphElement = document.getElementById(`paragraph-${state.testConfig.currentParagraphIndex}`);
        currentParagraphElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
        // Move back one character in current paragraph
        state.testConfig.currentCharInParagraph--;
        
        // Update character display
        const charElement = document.getElementById(`char-${state.testConfig.currentParagraphIndex}-${state.testConfig.currentCharInParagraph}`);
        charElement.classList.remove('correct', 'incorrect');
        charElement.classList.add('current');
        
        // Update stats
        if (charElement.classList.contains('correct')) {
            state.testState.correctChars--;
        } else if (charElement.classList.contains('incorrect')) {
            state.testState.errors--;
        }
        
        state.testState.typedChars--;
    }
}

// Toggle pause/resume
function togglePause() {
    if (!state.testState.isRunning) return;
    
    state.testState.isPaused = !state.testState.isPaused;
    
    if (state.testState.isPaused) {
        pauseResume.textContent = 'Resume';
        pauseResume.classList.remove('btn-secondary');
        pauseResume.classList.add('btn-primary');
    } else {
        pauseResume.textContent = 'Pause';
        pauseResume.classList.remove('btn-primary');
        pauseResume.classList.add('btn-secondary');
        typingInput.focus();
    }
}

// End test early
function endTestEarly() {
    if (confirm('Are you sure you want to end the test early?')) {
        endTestAndShowResults();
    }
}

// End test and show results
function endTestAndShowResults() {
    // Clear intervals
    clearInterval(state.testState.timerInterval);
    clearInterval(state.testState.wpmInterval);
    
    // Calculate final results
    const minutes = state.testState.elapsed / 60;
    state.results.finalWPM = minutes > 0 ? 
        Math.round(state.testState.correctChars / 5 / minutes) : 0;
    state.results.accuracy = state.testState.typedChars > 0 ? 
        Math.round((state.testState.correctChars / state.testState.typedChars) * 100) : 100;
    state.results.totalChars = state.testState.typedChars;
    state.results.errors = state.testState.errors;
    state.results.timeElapsed = state.testState.elapsed;
    state.results.testDate = new Date().toLocaleString();
    
    // Update results modal
    finalWPM.textContent = state.results.finalWPM;
    finalAccuracy.textContent = `${state.results.accuracy}%`;
    totalChars.textContent = state.results.totalChars;
    totalErrors.textContent = state.results.errors;
    
    // Show results modal
    resultsModal.classList.add('active');
}

// Go to home screen
function goToHome() {
    resultsModal.classList.remove('active');
    switchScreen('screen1');
}

// Reset test for a new one
function resetTest() {
    resultsModal.classList.remove('active');
    switchScreen('screen2');
}

// Download test report
function downloadTestReport() {
    const report = generateReportContent();
    
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `typing-test-report-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Show clean success message
    showNotification('Report downloaded successfully!', 'success');
}

// Send test report via email using PHP
async function sendTestReport() {
    const sendButton = sendEmail;
    const originalText = sendButton.textContent;
    
    try {
        // Show loading state
        sendButton.textContent = 'Sending...';
        sendButton.disabled = true;
        
        // Prepare data for PHP
        const emailData = {
            user_name: state.user.name,
            user_email: state.user.email,
            user_phone: state.user.phone,
            test_date: state.results.testDate,
            final_wpm: state.results.finalWPM,
            accuracy: state.results.accuracy + '%',
            total_chars: state.results.totalChars,
            total_errors: state.results.errors,
            time_elapsed: `${Math.floor(state.results.timeElapsed / 60)}m ${state.results.timeElapsed % 60}s`,
            lesson_name: state.testConfig.lessonName,
            test_duration: `${Math.floor(state.testConfig.duration / 60)} minutes`
        };

        // Send request to PHP
        const response = await fetch('send_report.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(emailData)
        });

        const result = await response.json();

        if (result.success) {
            showNotification('Report sent successfully!', 'success');
        } else {
            throw new Error(result.message || 'Failed to send report');
        }
        
    } catch (error) {
        console.error('Email sending failed:', error);
        showNotification('Failed to send report: ' + error.message, 'error');
        
        // Fallback to mailto
        showEmailClientFallback();
        
    } finally {
        // Restore button state
        sendButton.textContent = originalText;
        sendButton.disabled = false;
    }
}

// Fallback method: Open default email client
function showEmailClientFallback() {
    const subject = `Typing Test Report - ${state.results.testDate}`;
    const body = generateReportContent();
    
    const mailtoLink = `mailto:${state.user.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // Show option to user
    if (confirm('Would you like to open your email client to send the report?')) {
        window.location.href = mailtoLink;
    } else {
        // Copy to clipboard as alternative
        copyToClipboard(body);
        showNotification('Report copied to clipboard! You can paste it into your email.', 'info');
    }
}

// Generate report content
function generateReportContent() {
    return `
ACUBENS TYPING TEST REPORT
==========================

Test Date: ${state.results.testDate}
User: ${state.user.name}
Email: ${state.user.email}
Phone: ${state.user.phone}

RESULTS:
--------
Average WPM: ${state.results.finalWPM}
Accuracy: ${state.results.accuracy}%
Total Characters: ${state.results.totalChars}
Errors: ${state.results.errors}
Time Elapsed: ${Math.floor(state.results.timeElapsed / 60)}m ${state.results.timeElapsed % 60}s

Lesson: ${state.testConfig.lessonName}
Test Duration: ${Math.floor(state.testConfig.duration / 60)} minutes

PERFORMANCE ANALYSIS:
---------------------
${getPerformanceAnalysis()}

IMPROVEMENT TIPS:
-----------------
${getImprovementTips()}

Thank you for using Acubens Typing Test!
Keep practicing to improve your skills!
    `;
}

// Get performance analysis
function getPerformanceAnalysis() {
    let analysis = '';
    
    if (state.results.finalWPM >= 60) {
        analysis += '• Excellent typing speed! Professional level achieved.\n';
    } else if (state.results.finalWPM >= 45) {
        analysis += '• Good typing speed! Above average performance.\n';
    } else if (state.results.finalWPM >= 30) {
        analysis += '• Average typing speed. Room for improvement.\n';
    } else {
        analysis += '• Beginner level. Regular practice recommended.\n';
    }
    
    if (state.results.accuracy >= 95) {
        analysis += '• Outstanding accuracy! Very few errors.\n';
    } else if (state.results.accuracy >= 90) {
        analysis += '• Good accuracy. Minor improvements possible.\n';
    } else {
        analysis += '• Focus on accuracy. Try to reduce errors.\n';
    }
    
    const errorRate = (state.results.errors / state.results.totalChars * 100).toFixed(1);
    analysis += `• Error rate: ${errorRate}% (${state.results.errors} errors out of ${state.results.totalChars} characters)\n`;
    
    return analysis;
}

// Get improvement tips
function getImprovementTips() {
    let tips = '';
    
    if (state.results.finalWPM < 40) {
        tips += '• Practice daily for 15-20 minutes\n';
        tips += '• Focus on proper finger placement\n';
        tips += '• Use online typing tutors for guided practice\n';
    }
    
    if (state.results.accuracy < 95) {
        tips += '• Slow down to improve accuracy\n';
        tips += '• Practice error-prone keys repeatedly\n';
        tips += '• Use the backspace key less and focus on getting it right first time\n';
    }
    
    tips += '• Take regular breaks during practice sessions\n';
    tips += '• Maintain good posture and ergonomics\n';
    tips += '• Practice with different types of text content\n';
    
    return tips;
}

// Show notification - UPDATED to remove symbols/icons
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Clean message from any symbols/icons
    const cleanMessage = message.replace(/[♦�❌✅📋🚀]/g, '').trim();
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = cleanMessage;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#38a169' : type === 'error' ? '#e53e3e' : '#667eea'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        font-weight: 500;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Copy to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        console.log('Report copied to clipboard');
    }).catch(() => {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    });
}

// Switch between screens
function switchScreen(screenId) {
    Object.values(screens).forEach(screen => {
        screen.classList.remove('active');
    });
    screens[screenId].classList.add('active');
}

// Format time as MM:SS
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);