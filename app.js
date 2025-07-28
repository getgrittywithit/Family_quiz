// Global app state
let currentKid = null;
let kids = JSON.parse(localStorage.getItem('familyKids')) || [];
let messages = JSON.parse(localStorage.getItem('familyMessages')) || {};

// Color migration for existing profiles
function migrateColors() {
    const colorMapping = {
        'blue': 'bright-blue',
        'pink': 'hot-pink',
        'green': 'emerald-green',
        'purple': 'royal-purple',
        'orange': 'sunset-orange'
    };
    
    kids.forEach(kid => {
        if (colorMapping[kid.color]) {
            kid.color = colorMapping[kid.color];
        }
    });
    
    saveKids();
}

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    loadKids();
    migrateColors();
    showLanding();
});

// Navigation functions
function showLanding() {
    showPage('landing-page');
}

function showKidLogin() {
    showPage('kid-login');
    displayKids();
}

function showAddKid() {
    showPage('add-kid');
    document.getElementById('new-kid-form').reset();
}

function showKidProfile(kidId) {
    currentKid = kids.find(kid => kid.id === kidId);
    if (currentKid) {
        showPage('kid-profile');
        loadProfile();
    }
}

function showAdultLogin() {
    showPage('adult-view');
    displayAdultView();
}

function showAdultView() {
    showPage('adult-view');
    displayAdultView();
}

function showMessages(kidId) {
    currentKid = kids.find(kid => kid.id === kidId);
    showPage('messages');
    loadMessages();
}

function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    document.getElementById(pageId).classList.add('active');
    
    // Add fade-in animation
    document.getElementById(pageId).classList.add('fade-in');
    setTimeout(() => {
        document.getElementById(pageId).classList.remove('fade-in');
    }, 500);
}

// Kid management
function createKid() {
    const form = document.getElementById('new-kid-form');
    const formData = new FormData(form);
    
    const newKid = {
        id: Date.now().toString(),
        name: formData.get('kid-name') || document.getElementById('kid-name').value,
        age: document.getElementById('kid-age').value,
        color: document.querySelector('input[name="profile-color"]:checked')?.value || 'bright-blue',
        profile: {},
        lastUpdated: new Date().toISOString()
    };
    
    if (!newKid.name || !newKid.age) {
        alert('Please fill in your name and age!');
        return;
    }
    
    kids.push(newKid);
    saveKids();
    
    // Show success message
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.textContent = '✅ Profile Created!';
    btn.classList.add('bounce');
    
    setTimeout(() => {
        btn.textContent = originalText;
        btn.classList.remove('bounce');
        showKidProfile(newKid.id);
    }, 1000);
}

function displayKids() {
    const container = document.getElementById('kid-profiles');
    container.innerHTML = '';
    
    kids.forEach(kid => {
        const kidElement = document.createElement('div');
        kidElement.className = `kid-card ${kid.color}`;
        kidElement.onclick = () => showKidProfile(kid.id);
        
        kidElement.innerHTML = `
            <div class="kid-avatar ${kid.color}">
                ${getKidEmoji(kid.age)}
            </div>
            <div class="kid-name">${kid.name}</div>
            <div class="kid-age">Age ${kid.age}</div>
        `;
        
        container.appendChild(kidElement);
    });
}

function getKidEmoji(age) {
    if (age <= 5) return '👶';
    if (age <= 10) return '🧒';
    if (age <= 15) return '👦';
    return '👨';
}

// Profile management
function loadProfile() {
    if (!currentKid) return;
    
    document.getElementById('current-kid-name').textContent = `Hello, ${currentKid.name}!`;
    
    // Load saved profile data
    const profile = currentKid.profile || {};
    
    // Load sizes
    setSelectValue('shirt-size', profile.shirtSize);
    setSelectValue('shirt-fit', profile.shirtFit);
    setSelectValue('pants-size', profile.pantsSize);
    setSelectValue('pants-fit', profile.pantsFit);
    setSelectValue('shoe-size', profile.shoeSize);
    setSelectValue('shoe-width', profile.shoeWidth);
    
    // Load preferences
    setSelectValue('pants-preference', profile.pantsPreference);
    setSelectValue('toy-preference', profile.toyPreference);
    setSelectValue('subject-preference', profile.subjectPreference);
    
    // Load checkboxes
    loadCheckboxes('input[type="checkbox"][value]', profile.dislikedTextures || []);
    loadCheckboxes('input[type="checkbox"][value]', profile.favoriteColors || []);
    
    // Load text areas
    const textareas = document.querySelectorAll('.extra-info textarea');
    textareas.forEach((textarea, index) => {
        const key = `extraInfo${index}`;
        textarea.value = profile[key] || '';
    });
}

function setSelectValue(id, value) {
    const select = document.getElementById(id);
    if (select && value) {
        select.value = value;
    }
}

function loadCheckboxes(selector, values) {
    const checkboxes = document.querySelectorAll(selector);
    checkboxes.forEach(checkbox => {
        checkbox.checked = values.includes(checkbox.value);
    });
}

function saveProfile() {
    if (!currentKid) return;
    
    const profile = {};
    
    // Save sizes
    profile.shirtSize = document.getElementById('shirt-size').value;
    profile.shirtFit = document.getElementById('shirt-fit').value;
    profile.pantsSize = document.getElementById('pants-size').value;
    profile.pantsFit = document.getElementById('pants-fit').value;
    profile.shoeSize = document.getElementById('shoe-size').value;
    profile.shoeWidth = document.getElementById('shoe-width').value;
    
    // Save preferences
    profile.pantsPreference = document.getElementById('pants-preference').value;
    profile.toyPreference = document.getElementById('toy-preference').value;
    profile.subjectPreference = document.getElementById('subject-preference').value;
    
    // Save disliked textures
    profile.dislikedTextures = Array.from(document.querySelectorAll('.question-item:nth-of-type(2) input[type="checkbox"]:checked'))
        .map(cb => cb.value);
    
    // Save favorite colors
    profile.favoriteColors = Array.from(document.querySelectorAll('.question-item:nth-of-type(3) input[type="checkbox"]:checked'))
        .map(cb => cb.value);
    
    // Save extra info from textareas
    const textareas = document.querySelectorAll('.extra-info textarea');
    textareas.forEach((textarea, index) => {
        const key = `extraInfo${index}`;
        profile[key] = textarea.value;
    });
    
    // Update kid's profile
    currentKid.profile = profile;
    currentKid.lastUpdated = new Date().toISOString();
    
    // Save to localStorage
    saveKids();
    
    // Show success message
    const btn = document.querySelector('.save-section .btn');
    const originalText = btn.textContent;
    btn.textContent = '✅ Saved Successfully!';
    btn.classList.add('bounce');
    
    setTimeout(() => {
        btn.textContent = originalText;
        btn.classList.remove('bounce');
    }, 2000);
}

// Adult view
function displayAdultView() {
    const container = document.getElementById('adult-profiles');
    container.innerHTML = '';
    
    if (kids.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; font-size: 1.2em;">No kids have created profiles yet!</p>';
        return;
    }
    
    kids.forEach(kid => {
        const kidCard = document.createElement('div');
        kidCard.className = 'adult-kid-card';
        
        const profile = kid.profile || {};
        const lastUpdated = new Date(kid.lastUpdated).toLocaleDateString();
        
        kidCard.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3>${kid.name} (Age ${kid.age})</h3>
                <button class="btn btn-primary" onclick="showMessages('${kid.id}')">💬 Ask Questions</button>
            </div>
            
            <div class="kid-info">
                <p><strong>Last Updated:</strong> ${lastUpdated}</p>
            </div>
            
            <div class="kid-info">
                <h4>🧥 Clothing Sizes</h4>
                <p><strong>Shirt:</strong> ${profile.shirtSize || 'Not set'}${profile.shirtFit ? ` (${profile.shirtFit} fit)` : ''}</p>
                <p><strong>Pants:</strong> ${profile.pantsSize || 'Not set'}${profile.pantsFit ? ` (${profile.pantsFit} fit)` : ''}</p>
                <p><strong>Shoes:</strong> ${profile.shoeSize || 'Not set'}${profile.shoeWidth ? ` (${profile.shoeWidth} width)` : ''}</p>
            </div>
            
            <div class="kid-info">
                <h4>👕 Clothing Preferences</h4>
                <p><strong>Preferred pants:</strong> ${profile.pantsPreference || 'Not set'}</p>
                <p><strong>Dislikes:</strong> ${(profile.dislikedTextures || []).join(', ') || 'None specified'}</p>
                <p><strong>Favorite colors:</strong> ${(profile.favoriteColors || []).join(', ') || 'Not set'}</p>
            </div>
            
            <div class="kid-info">
                <h4>🎯 Interests</h4>
                <p><strong>Favorite toys:</strong> ${profile.toyPreference || 'Not set'}</p>
                <p><strong>Favorite subject:</strong> ${profile.subjectPreference || 'Not set'}</p>
            </div>
            
            ${profile.extraInfo0 ? `<div class="kid-info"><h4>💡 Additional Info</h4><p style="font-style: italic;">"${profile.extraInfo0}"</p></div>` : ''}
        `;
        
        container.appendChild(kidCard);
    });
}

// Messaging system
function loadMessages() {
    if (!currentKid) return;
    
    const kidMessages = messages[currentKid.id] || [];
    const container = document.getElementById('message-thread');
    
    container.innerHTML = '';
    
    if (kidMessages.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666;">No messages yet. Start a conversation!</p>';
        return;
    }
    
    kidMessages.forEach(message => {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message';
        messageDiv.innerHTML = `
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <strong>${message.from}</strong>
                <small>${new Date(message.timestamp).toLocaleString()}</small>
            </div>
            <p>${message.text}</p>
        `;
        container.appendChild(messageDiv);
    });
    
    // Auto-scroll to bottom
    container.scrollTop = container.scrollHeight;
}

function sendMessage() {
    if (!currentKid) return;
    
    const textarea = document.getElementById('new-message');
    const text = textarea.value.trim();
    
    if (!text) return;
    
    // Initialize messages for this kid if needed
    if (!messages[currentKid.id]) {
        messages[currentKid.id] = [];
    }
    
    // Add message
    messages[currentKid.id].push({
        from: 'Family Member',
        text: text,
        timestamp: new Date().toISOString()
    });
    
    // Save and reload
    saveMessages();
    textarea.value = '';
    loadMessages();
}

// Local storage functions
function saveKids() {
    localStorage.setItem('familyKids', JSON.stringify(kids));
}

function loadKids() {
    const saved = localStorage.getItem('familyKids');
    if (saved) {
        kids = JSON.parse(saved);
    }
}

function saveMessages() {
    localStorage.setItem('familyMessages', JSON.stringify(messages));
}

// Form event handlers
document.getElementById('new-kid-form').addEventListener('submit', function(e) {
    e.preventDefault();
    createKid();
});

// Auto-save functionality for profile updates
document.addEventListener('input', function(e) {
    if (e.target.closest('#kid-profile') && currentKid) {
        // Auto-save after 2 seconds of no input
        clearTimeout(window.autoSaveTimeout);
        window.autoSaveTimeout = setTimeout(() => {
            saveProfile();
        }, 2000);
    }
});

// Trivia Game
let triviaState = {
    currentQuestion: 0,
    score: 0,
    questions: [],
    totalQuestions: 5
};

function generateTriviaQuestions() {
    if (kids.length === 0) {
        alert('No kids have profiles yet! Create some profiles first.');
        return [];
    }
    
    const questions = [];
    const questionTypes = [
        {
            type: 'clothing-size',
            question: (kid) => `What size shirt does ${kid.name} wear?`,
            answer: (kid) => kid.profile.shirtSize,
            wrongAnswers: ['XS', 'S', 'M', 'L', 'XL', '8', '10', '12']
        },
        {
            type: 'pants-preference',
            question: (kid) => `What type of pants does ${kid.name} prefer?`,
            answer: (kid) => kid.profile.pantsPreference,
            wrongAnswers: ['jeans', 'leggings', 'sweatpants', 'shorts']
        },
        {
            type: 'toy-preference',
            question: (kid) => `What kind of toys does ${kid.name} like best?`,
            answer: (kid) => kid.profile.toyPreference,
            wrongAnswers: ['building', 'dolls', 'art', 'sports', 'books', 'puzzles', 'video-games']
        },
        {
            type: 'favorite-color',
            question: (kid) => `Which is one of ${kid.name}'s favorite colors?`,
            answer: (kid) => kid.profile.favoriteColors?.[0],
            wrongAnswers: ['red', 'blue', 'green', 'pink', 'purple', 'yellow', 'black', 'white']
        },
        {
            type: 'age',
            question: (kid) => `How old is ${kid.name}?`,
            answer: (kid) => kid.age,
            wrongAnswers: ['5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15']
        }
    ];
    
    // Generate questions for each kid
    kids.forEach(kid => {
        questionTypes.forEach(type => {
            const answer = type.answer(kid);
            if (answer && answer !== '') {
                const wrongAnswers = type.wrongAnswers.filter(wa => wa !== answer);
                const shuffledWrong = wrongAnswers.sort(() => 0.5 - Math.random()).slice(0, 3);
                
                questions.push({
                    question: type.question(kid),
                    correctAnswer: answer,
                    answers: [answer, ...shuffledWrong].sort(() => 0.5 - Math.random()),
                    kid: kid.name
                });
            }
        });
    });
    
    return questions.sort(() => 0.5 - Math.random()).slice(0, triviaState.totalQuestions);
}

function startTrivia() {
    triviaState.questions = generateTriviaQuestions();
    
    if (triviaState.questions.length === 0) {
        alert('Not enough profile information to create trivia questions! Kids need to fill out their profiles first.');
        return;
    }
    
    triviaState.currentQuestion = 0;
    triviaState.score = 0;
    triviaState.totalQuestions = Math.min(5, triviaState.questions.length);
    
    showPage('trivia-game');
    displayTriviaQuestion();
}

function displayTriviaQuestion() {
    const question = triviaState.questions[triviaState.currentQuestion];
    
    document.getElementById('question-number').textContent = triviaState.currentQuestion + 1;
    document.getElementById('total-questions').textContent = triviaState.totalQuestions;
    document.getElementById('trivia-score').textContent = triviaState.score;
    document.getElementById('trivia-question').textContent = question.question;
    
    const answersContainer = document.getElementById('trivia-answers');
    answersContainer.innerHTML = '';
    
    question.answers.forEach(answer => {
        const button = document.createElement('button');
        button.className = 'trivia-answer';
        button.textContent = answer;
        button.onclick = () => selectTriviaAnswer(answer, question.correctAnswer);
        answersContainer.appendChild(button);
    });
    
    // Show question container, hide result
    document.getElementById('trivia-question-container').style.display = 'block';
    document.getElementById('trivia-result').style.display = 'none';
}

function selectTriviaAnswer(selectedAnswer, correctAnswer) {
    const buttons = document.querySelectorAll('.trivia-answer');
    buttons.forEach(button => {
        button.classList.add('disabled');
        if (button.textContent === correctAnswer) {
            button.classList.add('correct');
        } else if (button.textContent === selectedAnswer && selectedAnswer !== correctAnswer) {
            button.classList.add('incorrect');
        }
    });
    
    if (selectedAnswer === correctAnswer) {
        triviaState.score++;
    }
    
    setTimeout(() => {
        triviaState.currentQuestion++;
        if (triviaState.currentQuestion < triviaState.totalQuestions) {
            displayTriviaQuestion();
        } else {
            showTriviaResult();
        }
    }, 2000);
}

function showTriviaResult() {
    document.getElementById('trivia-question-container').style.display = 'none';
    document.getElementById('trivia-result').style.display = 'block';
    
    const percentage = Math.round((triviaState.score / triviaState.totalQuestions) * 100);
    let title, message;
    
    if (percentage >= 80) {
        title = '🏆 Amazing!';
        message = `You know your family so well! You scored ${triviaState.score} out of ${triviaState.totalQuestions} (${percentage}%)`;
    } else if (percentage >= 60) {
        title = '👍 Great Job!';
        message = `You did well! You scored ${triviaState.score} out of ${triviaState.totalQuestions} (${percentage}%)`;
    } else {
        title = '📚 Keep Learning!';
        message = `You scored ${triviaState.score} out of ${triviaState.totalQuestions} (${percentage}%). Check the profiles to learn more!`;
    }
    
    document.getElementById('result-title').textContent = title;
    document.getElementById('result-text').textContent = message;
}

// Add some fun interactions
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('btn')) {
        e.target.style.transform = 'scale(0.95)';
        setTimeout(() => {
            e.target.style.transform = '';
        }, 150);
    }
});