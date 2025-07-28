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
    
    // Load hat information
    setSelectValue('hat-general-preference', profile.hatGeneralPreference);
    setInputValue('head-circumference', profile.headCircumference);
    setSelectValue('hat-size', profile.hatSize);
    setSelectValue('hat-fit-preference', profile.hatFitPreference);
    loadCheckboxes('.hat-types input[type="checkbox"]', profile.hatTypes || []);
    loadCheckboxes('.hat-issues input[type="checkbox"]', profile.hatIssues || []);
    setInputValue('hat-extra-notes', profile.hatExtraNotes);
    
    // Load preferences
    setSelectValue('pants-preference', profile.pantsPreference);
    setSelectValue('toy-preference', profile.toyPreference);
    setSelectValue('subject-preference', profile.subjectPreference);
    
    // Load style preferences
    setSelectValue('style-preference', profile.stylePreference);
    setSelectValue('shoe-closure', profile.shoeClosure);
    setInputValue('shoe-extra-notes', profile.shoeExtraNotes);
    setInputValue('needs-explanation', profile.needsExplanation);
    
    // Load checkboxes for textures and preferences
    loadCheckboxes('.question-item:nth-of-type(2) input[type="checkbox"]', profile.dislikedTextures || []);
    loadCheckboxes('.question-item:nth-of-type(3) input[type="checkbox"]', profile.likedTextures || []);
    loadCheckboxes('.question-item:nth-of-type(5) input[type="checkbox"]', profile.clothingDetails || []);
    loadCheckboxes('.question-item:nth-of-type(6) input[type="checkbox"]', profile.favoriteColors || []);
    
    // Load shoe, undergarment, and needs checkboxes
    loadCheckboxes('.shoe-types input[type="checkbox"]', profile.shoeTypes || []);
    loadCheckboxes('.question-section:nth-of-type(6) .question-item:nth-of-type(1) input[type="checkbox"]', profile.underwearPrefs || []);
    loadCheckboxes('.question-section:nth-of-type(6) .question-item:nth-of-type(2) input[type="checkbox"]', profile.braPrefs || []);
    loadCheckboxes('.question-section:nth-of-type(6) .question-item:nth-of-type(3) input[type="checkbox"]', profile.sockPrefs || []);
    loadCheckboxes('.urgent-needs input[type="checkbox"]', profile.urgentNeeds || []);
    
    // Load interest preferences
    setSelectValue('reading-interest', profile.readingInterest);
    setInputValue('book-details', profile.bookDetails);
    setInputValue('sports-details', profile.sportsDetails);
    setInputValue('creative-details', profile.creativeDetails);
    setInputValue('tech-details', profile.techDetails);
    setInputValue('toy-details', profile.toyDetails);
    setInputValue('relationship-needs', profile.relationshipNeeds);
    
    // Load interest checkboxes
    loadCheckboxes('.interest-category:nth-of-type(1) .checkbox-group input[type="checkbox"]', profile.bookTypes || []);
    loadCheckboxes('.sports-activities input[type="checkbox"]', profile.sportsActivities || []);
    loadCheckboxes('.interest-category:nth-of-type(3) .checkbox-group input[type="checkbox"]', profile.creativeActivities || []);
    loadCheckboxes('.interest-category:nth-of-type(4) .checkbox-group input[type="checkbox"]', profile.techInterests || []);
    loadCheckboxes('.interest-category:nth-of-type(5) .checkbox-group input[type="checkbox"]', profile.toyGames || []);
    loadCheckboxes('.interest-category:nth-of-type(6) .question-item:nth-of-type(1) .checkbox-group input[type="checkbox"]', profile.oneOnOneWith || []);
    loadCheckboxes('.interest-category:nth-of-type(6) .question-item:nth-of-type(2) .checkbox-group input[type="checkbox"]', profile.oneOnOneActivities || []);
    
    // Load school support fields
    setSelectValue('learning-style', profile.learningStyle);
    setInputValue('school-private-notes', profile.schoolPrivateNotes);
    setInputValue('advocacy-help', profile.advocacyHelp);
    setInputValue('supplies-explanation', profile.suppliesExplanation);
    
    // Load school support checkboxes
    loadCheckboxes('.school-support .question-item:nth-of-type(1) .checkbox-group input[type="checkbox"]', profile.schoolHelpNeeds || []);
    loadCheckboxes('.school-support .question-item:nth-of-type(2) .checkbox-group input[type="checkbox"]', profile.schoolChallenges || []);
    loadCheckboxes('.school-support .question-item:nth-of-type(3) .checkbox-group input[type="checkbox"]', profile.upcomingEvents || []);
    loadCheckboxes('.urgent-supplies input[type="checkbox"]', profile.suppliesNeeds || []);
    loadCheckboxes('.advocacy-section .question-item:nth-of-type(1) .checkbox-group input[type="checkbox"]', profile.advocacyReadiness || []);
    
    // Load wardrobe inventory
    setInputValue('current-tshirts', profile.currentTshirts);
    setInputValue('current-longsleeve', profile.currentLongsleeve);
    setInputValue('current-tanks', profile.currentTanks);
    setInputValue('current-blouses', profile.currentBlouses);
    setInputValue('current-jeans', profile.currentJeans);
    setInputValue('current-leggings', profile.currentLeggings);
    setInputValue('current-sweatpants', profile.currentSweatpants);
    setInputValue('current-shorts', profile.currentShorts);
    setInputValue('current-skirts', profile.currentSkirts);
    setInputValue('current-casual-dresses', profile.currentCasualDresses);
    setInputValue('current-fancy-dresses', profile.currentFancyDresses);
    setInputValue('current-sweaters', profile.currentSweaters);
    setInputValue('current-hoodies', profile.currentHoodies);
    
    // Load laundry tracking
    loadCheckboxes('.dirty-category:nth-of-type(1) .dirty-items input[type="checkbox"]', profile.dirtyLights || []);
    loadCheckboxes('.dirty-category:nth-of-type(2) .dirty-items input[type="checkbox"]', profile.dirtyDarks || []);
    loadCheckboxes('.dirty-category:nth-of-type(3) .dirty-items input[type="checkbox"]', profile.dirtySpecial || []);
    loadCheckboxes('.urgent-laundry input[type="checkbox"]', profile.urgentLaundry || []);
    setInputValue('laundry-urgency-note', profile.laundryUrgencyNote);
    loadCheckboxes('.help-options input[type="checkbox"]', profile.laundryHelp || []);
    
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

function setInputValue(id, value) {
    const input = document.getElementById(id);
    if (input && value) {
        input.value = value;
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
    
    // Save hat information
    profile.hatGeneralPreference = document.getElementById('hat-general-preference').value;
    profile.headCircumference = document.getElementById('head-circumference').value;
    profile.hatSize = document.getElementById('hat-size').value;
    profile.hatFitPreference = document.getElementById('hat-fit-preference').value;
    profile.hatTypes = Array.from(document.querySelectorAll('.hat-types input[type="checkbox"]:checked'))
        .map(cb => cb.value);
    profile.hatIssues = Array.from(document.querySelectorAll('.hat-issues input[type="checkbox"]:checked'))
        .map(cb => cb.value);
    profile.hatExtraNotes = document.getElementById('hat-extra-notes').value;
    
    // Save clothing preferences
    profile.pantsPreference = document.getElementById('pants-preference').value;
    profile.stylePreference = document.getElementById('style-preference').value;
    profile.shoeClosure = document.getElementById('shoe-closure').value;
    profile.shoeExtraNotes = document.getElementById('shoe-extra-notes').value;
    profile.needsExplanation = document.getElementById('needs-explanation').value;
    
    // Save texture and style preferences
    profile.dislikedTextures = Array.from(document.querySelectorAll('.question-item:nth-of-type(2) input[type="checkbox"]:checked'))
        .map(cb => cb.value);
    profile.likedTextures = Array.from(document.querySelectorAll('.question-item:nth-of-type(3) input[type="checkbox"]:checked'))
        .map(cb => cb.value);
    profile.clothingDetails = Array.from(document.querySelectorAll('.question-item:nth-of-type(5) input[type="checkbox"]:checked'))
        .map(cb => cb.value);
    profile.favoriteColors = Array.from(document.querySelectorAll('.question-item:nth-of-type(6) input[type="checkbox"]:checked'))
        .map(cb => cb.value);
        
    // Save shoe preferences
    profile.shoeTypes = Array.from(document.querySelectorAll('.shoe-types input[type="checkbox"]:checked'))
        .map(cb => cb.value);
        
    // Save undergarment preferences
    profile.underwearPrefs = Array.from(document.querySelectorAll('.question-section:nth-of-type(6) .question-item:nth-of-type(1) input[type="checkbox"]:checked'))
        .map(cb => cb.value);
    profile.braPrefs = Array.from(document.querySelectorAll('.question-section:nth-of-type(6) .question-item:nth-of-type(2) input[type="checkbox"]:checked'))
        .map(cb => cb.value);
    profile.sockPrefs = Array.from(document.querySelectorAll('.question-section:nth-of-type(6) .question-item:nth-of-type(3) input[type="checkbox"]:checked'))
        .map(cb => cb.value);
        
    // Save urgent needs
    profile.urgentNeeds = Array.from(document.querySelectorAll('.urgent-needs input[type="checkbox"]:checked'))
        .map(cb => cb.value);
    
    // Save interest preferences
    profile.readingInterest = document.getElementById('reading-interest').value;
    profile.bookDetails = document.getElementById('book-details').value;
    profile.sportsDetails = document.getElementById('sports-details').value;
    profile.creativeDetails = document.getElementById('creative-details').value;
    profile.techDetails = document.getElementById('tech-details').value;
    profile.toyDetails = document.getElementById('toy-details').value;
    profile.relationshipNeeds = document.getElementById('relationship-needs').value;
    
    // Save interest checkboxes
    profile.bookTypes = Array.from(document.querySelectorAll('.interest-category:nth-of-type(1) .checkbox-group input[type="checkbox"]:checked'))
        .map(cb => cb.value);
    profile.sportsActivities = Array.from(document.querySelectorAll('.sports-activities input[type="checkbox"]:checked'))
        .map(cb => cb.value);
    profile.creativeActivities = Array.from(document.querySelectorAll('.interest-category:nth-of-type(3) .checkbox-group input[type="checkbox"]:checked'))
        .map(cb => cb.value);
    profile.techInterests = Array.from(document.querySelectorAll('.interest-category:nth-of-type(4) .checkbox-group input[type="checkbox"]:checked'))
        .map(cb => cb.value);
    profile.toyGames = Array.from(document.querySelectorAll('.interest-category:nth-of-type(5) .checkbox-group input[type="checkbox"]:checked'))
        .map(cb => cb.value);
    profile.oneOnOneWith = Array.from(document.querySelectorAll('.interest-category:nth-of-type(6) .question-item:nth-of-type(1) .checkbox-group input[type="checkbox"]:checked'))
        .map(cb => cb.value);
    profile.oneOnOneActivities = Array.from(document.querySelectorAll('.interest-category:nth-of-type(6) .question-item:nth-of-type(2) .checkbox-group input[type="checkbox"]:checked'))
        .map(cb => cb.value);
    
    // Save school support information
    profile.learningStyle = document.getElementById('learning-style').value;
    profile.schoolPrivateNotes = document.getElementById('school-private-notes').value;
    profile.advocacyHelp = document.getElementById('advocacy-help').value;
    profile.suppliesExplanation = document.getElementById('supplies-explanation').value;
    
    // Save school support checkboxes
    profile.schoolHelpNeeds = Array.from(document.querySelectorAll('.school-support .question-item:nth-of-type(1) .checkbox-group input[type="checkbox"]:checked'))
        .map(cb => cb.value);
    profile.schoolChallenges = Array.from(document.querySelectorAll('.school-support .question-item:nth-of-type(2) .checkbox-group input[type="checkbox"]:checked'))
        .map(cb => cb.value);
    profile.upcomingEvents = Array.from(document.querySelectorAll('.school-support .question-item:nth-of-type(3) .checkbox-group input[type="checkbox"]:checked'))
        .map(cb => cb.value);
    profile.suppliesNeeds = Array.from(document.querySelectorAll('.urgent-supplies input[type="checkbox"]:checked'))
        .map(cb => cb.value);
    profile.advocacyReadiness = Array.from(document.querySelectorAll('.advocacy-section .question-item:nth-of-type(1) .checkbox-group input[type="checkbox"]:checked'))
        .map(cb => cb.value);
    
    // Save wardrobe inventory
    profile.currentTshirts = document.getElementById('current-tshirts').value;
    profile.currentLongsleeve = document.getElementById('current-longsleeve').value;
    profile.currentTanks = document.getElementById('current-tanks').value;
    profile.currentBlouses = document.getElementById('current-blouses').value;
    profile.currentJeans = document.getElementById('current-jeans').value;
    profile.currentLeggings = document.getElementById('current-leggings').value;
    profile.currentSweatpants = document.getElementById('current-sweatpants').value;
    profile.currentShorts = document.getElementById('current-shorts').value;
    profile.currentSkirts = document.getElementById('current-skirts').value;
    profile.currentCasualDresses = document.getElementById('current-casual-dresses').value;
    profile.currentFancyDresses = document.getElementById('current-fancy-dresses').value;
    profile.currentSweaters = document.getElementById('current-sweaters').value;
    profile.currentHoodies = document.getElementById('current-hoodies').value;
    
    // Save laundry tracking
    profile.dirtyLights = Array.from(document.querySelectorAll('.dirty-category:nth-of-type(1) .dirty-items input[type="checkbox"]:checked'))
        .map(cb => cb.value);
    profile.dirtyDarks = Array.from(document.querySelectorAll('.dirty-category:nth-of-type(2) .dirty-items input[type="checkbox"]:checked'))
        .map(cb => cb.value);
    profile.dirtySpecial = Array.from(document.querySelectorAll('.dirty-category:nth-of-type(3) .dirty-items input[type="checkbox"]:checked'))
        .map(cb => cb.value);
    profile.urgentLaundry = Array.from(document.querySelectorAll('.urgent-laundry input[type="checkbox"]:checked'))
        .map(cb => cb.value);
    profile.laundryUrgencyNote = document.getElementById('laundry-urgency-note').value;
    profile.laundryHelp = Array.from(document.querySelectorAll('.help-options input[type="checkbox"]:checked'))
        .map(cb => cb.value);
    
    // Save extra info from textareas
    const textareas = document.querySelectorAll('.extra-info textarea');
    textareas.forEach((textarea, index) => {
        const key = `extraInfo${index}`;
        profile[key] = textarea.value;
    });
    
    // Save personal care data if it exists
    if (currentKid.profile.personalCare) {
        profile.personalCare = currentKid.profile.personalCare;
    }
    
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
                <h4>👒 Hat Information</h4>
                <p><strong>Likes hats:</strong> ${profile.hatGeneralPreference || 'Not set'}</p>
                ${profile.headCircumference ? `<p><strong>Head circumference:</strong> ${profile.headCircumference}"</p>` : ''}
                ${profile.hatSize ? `<p><strong>Hat size:</strong> ${profile.hatSize}</p>` : ''}
                ${profile.hatFitPreference ? `<p><strong>Fit preference:</strong> ${profile.hatFitPreference}</p>` : ''}
                ${(profile.hatTypes || []).length > 0 ? `<p><strong>Likes:</strong> ${profile.hatTypes.join(', ')}</p>` : ''}
                ${(profile.hatIssues || []).length > 0 ? `<p><strong>Hat issues:</strong> ${profile.hatIssues.join(', ')}</p>` : ''}
                ${profile.hatExtraNotes ? `<p><strong>Notes:</strong> "${profile.hatExtraNotes}"</p>` : ''}
            </div>
            
            <div class="kid-info">
                <h4>👕 Clothing Preferences</h4>
                <p><strong>Preferred pants:</strong> ${profile.pantsPreference || 'Not set'}</p>
                <p><strong>Style:</strong> ${profile.stylePreference || 'Not set'}</p>
                <p><strong>Dislikes:</strong> ${(profile.dislikedTextures || []).join(', ') || 'None specified'}</p>
                <p><strong>Loves:</strong> ${(profile.likedTextures || []).join(', ') || 'Not set'}</p>
                <p><strong>Special details:</strong> ${(profile.clothingDetails || []).join(', ') || 'Not set'}</p>
                <p><strong>Favorite colors:</strong> ${(profile.favoriteColors || []).join(', ') || 'Not set'}</p>
            </div>
            
            <div class="kid-info">
                <h4>👟 Shoe Preferences</h4>
                <p><strong>Shoe types:</strong> ${(profile.shoeTypes || []).join(', ') || 'Not set'}</p>
                <p><strong>Closure preference:</strong> ${profile.shoeClosure || 'Not set'}</p>
                ${profile.shoeExtraNotes ? `<p><strong>Notes:</strong> "${profile.shoeExtraNotes}"</p>` : ''}
            </div>
            
            <div class="kid-info">
                <h4>🩱 Undergarments</h4>
                ${(profile.underwearPrefs || []).length > 0 ? `<p><strong>Underwear:</strong> ${profile.underwearPrefs.join(', ')}</p>` : ''}
                ${(profile.braPrefs || []).length > 0 ? `<p><strong>Bras/Tops:</strong> ${profile.braPrefs.join(', ')}</p>` : ''}
                ${(profile.sockPrefs || []).length > 0 ? `<p><strong>Socks:</strong> ${profile.sockPrefs.join(', ')}</p>` : ''}
            </div>
            
            ${(profile.urgentNeeds || []).length > 0 ? `
            <div class="kid-info urgent-needs-display">
                <h4>🚨 URGENT NEEDS</h4>
                <p style="color: #dc2626; font-weight: bold;">Needs: ${profile.urgentNeeds.join(', ')}</p>
                ${profile.needsExplanation ? `<p><strong>Why:</strong> "${profile.needsExplanation}"</p>` : ''}
            </div>
            ` : ''}
            
            <div class="kid-info">
                <h4>📚 Reading & Books</h4>
                <p><strong>Reading level:</strong> ${profile.readingInterest || 'Not set'}</p>
                ${(profile.bookTypes || []).length > 0 ? `<p><strong>Book types:</strong> ${profile.bookTypes.join(', ')}</p>` : ''}
                ${profile.bookDetails ? `<p><strong>Details:</strong> "${profile.bookDetails}"</p>` : ''}
            </div>
            
            <div class="kid-info">
                <h4>🏃 Sports & Activities</h4>
                ${(profile.sportsActivities || []).length > 0 ? `<p><strong>Interested in:</strong> ${profile.sportsActivities.join(', ')}</p>` : '<p>Not specified</p>'}
                ${profile.sportsDetails ? `<p><strong>Details:</strong> "${profile.sportsDetails}"</p>` : ''}
            </div>
            
            <div class="kid-info">
                <h4>🎨 Creative & Artistic</h4>
                ${(profile.creativeActivities || []).length > 0 ? `<p><strong>Activities:</strong> ${profile.creativeActivities.join(', ')}</p>` : '<p>Not specified</p>'}
                ${profile.creativeDetails ? `<p><strong>Details:</strong> "${profile.creativeDetails}"</p>` : ''}
            </div>
            
            <div class="kid-info">
                <h4>💻 Technology & Gaming</h4>
                ${(profile.techInterests || []).length > 0 ? `<p><strong>Interests:</strong> ${profile.techInterests.join(', ')}</p>` : '<p>Not specified</p>'}
                ${profile.techDetails ? `<p><strong>Details:</strong> "${profile.techDetails}"</p>` : ''}
            </div>
            
            <div class="kid-info">
                <h4>🧸 Toys & Games</h4>
                ${(profile.toyGames || []).length > 0 ? `<p><strong>Still enjoys:</strong> ${profile.toyGames.join(', ')}</p>` : '<p>Not specified</p>'}
                ${profile.toyDetails ? `<p><strong>Details:</strong> "${profile.toyDetails}"</p>` : ''}
            </div>
            
            ${((profile.oneOnOneWith || []).length > 0 || (profile.oneOnOneActivities || []).length > 0 || profile.relationshipNeeds) ? `
            <div class="kid-info special-needs-display">
                <h4>💝 One-on-One Time & Relationship Needs</h4>
                ${(profile.oneOnOneWith || []).length > 0 ? `<p><strong>Wants time with:</strong> ${profile.oneOnOneWith.join(', ')}</p>` : ''}
                ${(profile.oneOnOneActivities || []).length > 0 ? `<p><strong>Activities:</strong> ${profile.oneOnOneActivities.join(', ')}</p>` : ''}
                ${profile.relationshipNeeds ? `<p><strong>What they're missing:</strong> "${profile.relationshipNeeds}"</p>` : ''}
            </div>
            ` : ''}
            
            ${((profile.schoolHelpNeeds || []).length > 0 || (profile.schoolChallenges || []).length > 0 || profile.schoolPrivateNotes || (profile.upcomingEvents || []).length > 0 || (profile.suppliesNeeds || []).length > 0) ? `
            <div class="kid-info school-support-display">
                <h4>📚 School Support Needs (PRIVATE - Parents Only)</h4>
                ${(profile.schoolHelpNeeds || []).length > 0 ? `<p><strong>Help needed with:</strong> ${profile.schoolHelpNeeds.join(', ')}</p>` : ''}
                ${(profile.schoolChallenges || []).length > 0 ? `<p><strong>Current challenges:</strong> ${profile.schoolChallenges.join(', ')}</p>` : ''}
                ${(profile.upcomingEvents || []).length > 0 ? `<p><strong>Upcoming events:</strong> ${profile.upcomingEvents.join(', ')}</p>` : ''}
                ${(profile.suppliesNeeds || []).length > 0 ? `<p><strong>🚨 SUPPLIES NEEDED:</strong> ${profile.suppliesNeeds.join(', ')}</p>` : ''}
                ${profile.suppliesExplanation ? `<p><strong>Why supplies needed:</strong> "${profile.suppliesExplanation}"</p>` : ''}
                ${profile.learningStyle ? `<p><strong>Learning style:</strong> ${profile.learningStyle}</p>` : ''}
                ${(profile.advocacyReadiness || []).length > 0 ? `<p><strong>Self-advocacy readiness:</strong> ${profile.advocacyReadiness.join(', ')}</p>` : ''}
                ${profile.schoolPrivateNotes ? `<p><strong>Private notes:</strong> "${profile.schoolPrivateNotes}"</p>` : ''}
                ${profile.advocacyHelp ? `<p><strong>How to help advocate:</strong> "${profile.advocacyHelp}"</p>` : ''}
            </div>
            ` : ''}
            
${profile.personalCare ? `
            <div class="kid-info personal-care-display">
                <h4>🎮 Personal Care Progress (PRIVATE - Parents Only)</h4>
                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 10px;">
                    <div class="level-badge-small" style="background: linear-gradient(135deg, ${personalCareSystem.levels[profile.personalCare.level].color} 0%, ${personalCareSystem.levels[profile.personalCare.level].color}88 100%);">
                        Level ${profile.personalCare.level}
                    </div>
                    <div>
                        <strong>${personalCareSystem.levels[profile.personalCare.level].name}</strong><br>
                        <small>${profile.personalCare.xp} XP | ${profile.personalCare.streak} day streak</small>
                    </div>
                </div>
                ${profile.personalCare.badges.length > 0 ? `
                <p><strong>🏆 Badges earned:</strong> ${profile.personalCare.badges.map(badgeId => personalCareSystem.badges[badgeId]?.name || badgeId).join(', ')}</p>
                ` : ''}
                ${profile.personalCare.supplies && profile.personalCare.supplies.length > 0 ? `
                <p style="color: #dc2626;"><strong>🧴 Supplies needed:</strong> ${profile.personalCare.supplies.join(', ')}</p>
                ` : ''}
                ${profile.personalCare.completedTasks && profile.personalCare.completedTasks.length > 0 ? `
                <p><strong>✅ Today's completed tasks:</strong> ${profile.personalCare.completedTasks.length}</p>
                ` : ''}
                ${profile.personalCare.smellChecks && profile.personalCare.smellChecks.length > 0 ? `
                <p><strong>👃 Recent self-awareness:</strong> ${profile.personalCare.smellChecks.slice(-1)[0].result === 'fresh' ? 'Good self-checking!' : 'Needs gentle reminders'}</p>
                ` : ''}
                ${kid.age >= 10 && kid.age <= 14 ? `
                <div style="margin-top: 15px; padding: 10px; background: #fef7ff; border-radius: 8px; border-left: 4px solid #d8b4fe;">
                    <strong>🌱 Puberty Readiness Notes:</strong><br>
                    <small style="color: #64748b;">Age ${kid.age} - Important transition period. Consider conversations about body changes and increased hygiene needs.</small>
                </div>
                ` : ''}
            </div>
            ` : ''}
            
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

// Wardrobe Management Functions
function analyzeWardrobe() {
    if (!currentKid) return;
    
    const profile = currentKid.profile || {};
    const age = currentKid.age;
    
    // Get current inventory
    const inventory = {
        tshirts: parseInt(profile.currentTshirts || 0),
        longsleeve: parseInt(profile.currentLongsleeve || 0),
        tanks: parseInt(profile.currentTanks || 0),
        blouses: parseInt(profile.currentBlouses || 0),
        jeans: parseInt(profile.currentJeans || 0),
        leggings: parseInt(profile.currentLeggings || 0),
        sweatpants: parseInt(profile.currentSweatpants || 0),
        shorts: parseInt(profile.currentShorts || 0),
        skirts: parseInt(profile.currentSkirts || 0),
        casualDresses: parseInt(profile.currentCasualDresses || 0),
        fancyDresses: parseInt(profile.currentFancyDresses || 0),
        sweaters: parseInt(profile.currentSweaters || 0),
        hoodies: parseInt(profile.currentHoodies || 0)
    };
    
    // Define recommendations based on age
    let recommendations;
    if (age <= 5) {
        recommendations = {
            tops: 8, bottoms: 6, dresses: 3, layers: 4,
            ageGroup: "👶 Toddler/Preschool"
        };
    } else if (age <= 10) {
        recommendations = {
            tops: 9, bottoms: 7, dresses: 4, layers: 5,
            ageGroup: "🧒 Elementary"
        };
    } else {
        recommendations = {
            tops: 12, bottoms: 8, dresses: 6, layers: 7,
            ageGroup: "👦👧 Middle/High School"
        };
    }
    
    // Calculate totals
    const totalTops = inventory.tshirts + inventory.longsleeve + inventory.tanks + inventory.blouses;
    const totalBottoms = inventory.jeans + inventory.leggings + inventory.sweatpants + inventory.shorts + inventory.skirts;
    const totalDresses = inventory.casualDresses + inventory.fancyDresses;
    const totalLayers = inventory.sweaters + inventory.hoodies;
    
    // Generate feedback
    let feedback = `<h6>📊 Analysis for ${recommendations.ageGroup}</h6>`;
    
    // Analyze each category
    const categories = [
        {
            name: "👕 Tops",
            current: totalTops,
            recommended: recommendations.tops,
            details: `You have ${inventory.tshirts} t-shirts, ${inventory.longsleeve} long-sleeve, ${inventory.tanks} tanks, ${inventory.blouses} nice shirts`
        },
        {
            name: "👖 Bottoms", 
            current: totalBottoms,
            recommended: recommendations.bottoms,
            details: `You have ${inventory.jeans} jeans, ${inventory.leggings} leggings, ${inventory.sweatpants} sweatpants, ${inventory.shorts} shorts, ${inventory.skirts} skirts`
        },
        {
            name: "👗 Dresses",
            current: totalDresses,
            recommended: recommendations.dresses,
            details: `You have ${inventory.casualDresses} casual + ${inventory.fancyDresses} fancy dresses`
        },
        {
            name: "🧥 Layers",
            current: totalLayers,
            recommended: recommendations.layers,
            details: `You have ${inventory.sweaters} sweaters + ${inventory.hoodies} hoodies`
        }
    ];
    
    categories.forEach(category => {
        const status = category.current >= category.recommended ? "✅" : "⚠️";
        const statusText = category.current >= category.recommended ? "Good!" : "Need more";
        const color = category.current >= category.recommended ? "#059669" : "#dc2626";
        
        feedback += `
        <div style="margin: 10px 0; padding: 10px; border-left: 4px solid ${color}; background: ${category.current >= category.recommended ? '#f0fdf4' : '#fef2f2'};">
            <strong>${status} ${category.name}</strong>: ${category.current}/${category.recommended} (${statusText})<br>
            <small style="color: #64748b;">${category.details}</small>
        </div>`;
    });
    
    // Add shopping suggestions
    const needsMore = categories.filter(c => c.current < c.recommended);
    if (needsMore.length > 0) {
        feedback += `<div style="margin-top: 15px; padding: 15px; background: #fef7ff; border-radius: 8px; border: 1px solid #d8b4fe;">
            <strong>🛍️ Shopping List:</strong><br>`;
        needsMore.forEach(category => {
            const needed = category.recommended - category.current;
            feedback += `• ${needed} more ${category.name.replace(/👕|👖|👗|🧥/g, '').trim()}<br>`;
        });
        feedback += `</div>`;
    } else {
        feedback += `<div style="margin-top: 15px; padding: 15px; background: #f0fdf4; border-radius: 8px; border: 1px solid #bbf7d0;">
            <strong>🎉 Great job!</strong> Your wardrobe looks well-balanced for your age group!
        </div>`;
    }
    
    document.getElementById('wardrobe-feedback').innerHTML = feedback;
}

function generateOutfitSuggestions() {
    if (!currentKid) return;
    
    const profile = currentKid.profile || {};
    
    // Get preferences
    const favoriteColors = profile.favoriteColors || [];
    const likedTextures = profile.likedTextures || [];
    const stylePreference = profile.stylePreference || '';
    const pantsPreference = profile.pantsPreference || '';
    
    if (favoriteColors.length === 0 || stylePreference === '') {
        document.getElementById('outfit-suggestions').innerHTML = 
            '<p>Complete your clothing preferences above to see personalized outfit suggestions!</p>';
        return;
    }
    
    // Generate outfit suggestions based on preferences
    let outfits = [];
    
    // Outfit 1: Based on favorite color + neutrals
    if (favoriteColors.length > 0) {
        const color = favoriteColors[0];
        outfits.push({
            name: `💎 ${color.charAt(0).toUpperCase() + color.slice(1)} & Neutrals`,
            description: `${color} top + denim ${pantsPreference || 'pants'} + white sneakers`,
            reason: `Uses your favorite color ${color} as the star with safe neutral denim`
        });
    }
    
    // Outfit 2: Based on style preference
    if (stylePreference.includes('comfortable')) {
        outfits.push({
            name: `😌 Ultimate Comfort`,
            description: `Soft ${likedTextures.includes('fleece') ? 'fleece' : 'cotton'} hoodie + ${pantsPreference === 'leggings' ? 'leggings' : 'sweatpants'} + cozy socks`,
            reason: `Perfect for your comfort-first style preference`
        });
    } else if (stylePreference.includes('bold')) {
        outfits.push({
            name: `✨ Bold Statement`,
            description: `Bright patterned top + ${favoriteColors[1] || favoriteColors[0]} cardigan + dark jeans`,
            reason: `Makes the bold statement you love while staying coordinated`
        });
    } else if (stylePreference.includes('simple')) {
        outfits.push({
            name: `🤍 Simple & Classic`,
            description: `White t-shirt + denim jacket + ${pantsPreference || 'jeans'} + white sneakers`,
            reason: `Clean, simple look that never goes out of style`
        });
    }
    
    // Outfit 3: Weather-appropriate layering
    outfits.push({
        name: `🌤️ Perfect Layers`,
        description: `Light ${favoriteColors[0] || 'neutral'} t-shirt + cardigan + ${pantsPreference || 'pants'}`,
        reason: `Smart layering lets you adjust as the day changes temperature`
    });
    
    // Outfit 4: Weekend fun
    if (favoriteColors.length >= 2) {
        outfits.push({
            name: `🎉 Weekend Fun`,
            description: `${favoriteColors[0]} top + ${favoriteColors[1]} accessories + comfortable ${pantsPreference || 'jeans'}`,
            reason: `Combines your top two favorite colors for a fun weekend look`
        });
    }
    
    let html = '<div style="display: grid; gap: 15px;">';
    outfits.forEach(outfit => {
        html += `
        <div style="background: white; padding: 15px; border-radius: 10px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
            <h6 style="color: #6b46c1; margin-bottom: 8px;">${outfit.name}</h6>
            <p style="margin-bottom: 8px; font-weight: 600;">${outfit.description}</p>
            <small style="color: #64748b; font-style: italic;">${outfit.reason}</small>
        </div>`;
    });
    html += '</div>';
    
    document.getElementById('outfit-suggestions').innerHTML = html;
}

// Add event listeners for inventory inputs to trigger analysis
document.addEventListener('input', function(e) {
    if (e.target.id && e.target.id.startsWith('current-')) {
        setTimeout(analyzeWardrobe, 500); // Debounce the analysis
    }
});

// Add event listeners for preference changes to trigger outfit suggestions
document.addEventListener('change', function(e) {
    if (e.target.id === 'style-preference' || e.target.id === 'pants-preference' || 
        (e.target.type === 'checkbox' && e.target.value && ['red', 'blue', 'green', 'pink', 'purple', 'yellow', 'black', 'white'].includes(e.target.value))) {
        setTimeout(generateOutfitSuggestions, 300);
    }
});

// Update adult view to include wardrobe management info
const originalDisplayAdultView = displayAdultView;
displayAdultView = function() {
    originalDisplayAdultView();
    
    // Add wardrobe information to adult cards
    const adultCards = document.querySelectorAll('.adult-kid-card');
    adultCards.forEach((card, index) => {
        const kid = kids[index];
        if (!kid) return;
        
        const profile = kid.profile || {};
        
        // Add wardrobe summary
        let wardrobeInfo = '';
        if (profile.urgentLaundry && profile.urgentLaundry.length > 0) {
            wardrobeInfo += `
            <div class="kid-info urgent-needs-display">
                <h4>🧺 URGENT LAUNDRY NEEDED</h4>
                <p><strong>Needs clean ASAP:</strong> ${profile.urgentLaundry.join(', ')}</p>
                ${profile.laundryUrgencyNote ? `<p><strong>Why urgent:</strong> "${profile.laundryUrgencyNote}"</p>` : ''}
            </div>`;
        }
        
        if (profile.laundryHelp && profile.laundryHelp.length > 0) {
            wardrobeInfo += `
            <div class="kid-info">
                <h4>🏠 Can Help With Laundry</h4>
                <p><strong>Willing to help:</strong> ${profile.laundryHelp.join(', ')}</p>
            </div>`;
        }
        
        // Add dirty clothes tracking
        const dirtyClothes = [];
        if (profile.dirtyLights && profile.dirtyLights.length > 0) {
            dirtyClothes.push(`Lights: ${profile.dirtyLights.join(', ')}`);
        }
        if (profile.dirtyDarks && profile.dirtyDarks.length > 0) {
            dirtyClothes.push(`Darks: ${profile.dirtyDarks.join(', ')}`);
        }
        if (profile.dirtySpecial && profile.dirtySpecial.length > 0) {
            dirtyClothes.push(`Special care: ${profile.dirtySpecial.join(', ')}`);
        }
        
        if (dirtyClothes.length > 0) {
            wardrobeInfo += `
            <div class="kid-info">
                <h4>🧺 Dirty Clothes Status</h4>
                <p>${dirtyClothes.join(' | ')}</p>
            </div>`;
        }
        
        if (wardrobeInfo) {
            card.insertAdjacentHTML('beforeend', wardrobeInfo);
        }
    });
};

// Admin Dashboard Functions
function showAdminDashboard() {
    console.log('showAdminDashboard called');
    showPage('admin-dashboard');
    showAdminSection('overview');
    updateAdminStats();
}

function showAdminSection(sectionName) {
    // Hide all admin sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all nav buttons
    document.querySelectorAll('.admin-nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(`admin-${sectionName}`);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Add active class to clicked button (if event exists)
    if (typeof event !== 'undefined' && event.target) {
        event.target.classList.add('active');
    } else {
        // If no event, activate the corresponding nav button
        const navBtn = document.querySelector(`[onclick="showAdminSection('${sectionName}')"]`);
        if (navBtn) {
            navBtn.classList.add('active');
        }
    }
    
    // Load section-specific data
    switch(sectionName) {
        case 'overview':
            updateAdminStats();
            loadRecentActivity();
            break;
        case 'wardrobe':
            loadWardrobeManagerData();
            break;
        case 'photos':
            loadPhotoGallery();
            break;
        case 'gifts':
            loadGiftManagement();
            break;
        case 'communication':
            loadFamilyMessages();
            break;
        case 'ai-assistant':
            loadAIPalSettings();
            break;
        case 'settings':
            loadFamilySettings();
            break;
    }
}

function updateAdminStats() {
    // Calculate stats from current data
    const totalKids = kids.length;
    let urgentLaundryCount = 0;
    let shoppingNeedsCount = 0;
    let giftIdeasCount = 0;
    
    kids.forEach(kid => {
        const profile = kid.profile || {};
        if (profile.urgentLaundry && profile.urgentLaundry.length > 0) {
            urgentLaundryCount += profile.urgentLaundry.length;
        }
        if (profile.urgentNeeds && profile.urgentNeeds.length > 0) {
            shoppingNeedsCount += profile.urgentNeeds.length;
        }
        if (profile.suppliesNeeds && profile.suppliesNeeds.length > 0) {
            shoppingNeedsCount += profile.suppliesNeeds.length;
        }
        // Estimate gift ideas based on interests
        const interests = (profile.bookTypes || []).length + 
                         (profile.sportsActivities || []).length + 
                         (profile.creativeActivities || []).length + 
                         (profile.techInterests || []).length + 
                         (profile.toyGames || []).length;
        giftIdeasCount += interests;
    });
    
    // Update the display
    document.getElementById('total-kids').textContent = totalKids;
    document.getElementById('urgent-laundry-count').textContent = urgentLaundryCount;
    document.getElementById('shopping-needs-count').textContent = shoppingNeedsCount;
    document.getElementById('gift-ideas-count').textContent = giftIdeasCount;
}

function loadRecentActivity() {
    const activityFeed = document.getElementById('activity-feed');
    
    // Generate recent activity based on profiles
    let activities = [];
    
    kids.forEach(kid => {
        const profile = kid.profile || {};
        
        // Add activities based on profile data
        if (profile.urgentNeeds && profile.urgentNeeds.length > 0) {
            activities.push({
                icon: '👕',
                content: `<strong>${kid.name}</strong> marked ${profile.urgentNeeds.length} clothing items as urgent`,
                time: '2 hours ago'
            });
        }
        
        if (profile.suppliesNeeds && profile.suppliesNeeds.length > 0) {
            activities.push({
                icon: '📚',
                content: `<strong>${kid.name}</strong> needs ${profile.suppliesNeeds.length} school supplies`,
                time: '4 hours ago'
            });
        }
        
        if (profile.favoriteColors && profile.favoriteColors.length > 0) {
            activities.push({
                icon: '🎨',
                content: `<strong>${kid.name}</strong> updated color preferences`,
                time: '1 day ago'
            });
        }
    });
    
    // Limit to most recent 5 activities
    activities = activities.slice(0, 5);
    
    if (activities.length === 0) {
        activities.push({
            icon: '👋',
            content: '<strong>Welcome!</strong> Start by having kids fill out their profiles',
            time: 'Just now'
        });
    }
    
    activityFeed.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <span class="activity-icon">${activity.icon}</span>
            <div class="activity-content">
                ${activity.content}
                <small>${activity.time}</small>
            </div>
        </div>
    `).join('');
}

function loadWardrobeManagerData() {
    const wardrobeSummary = document.getElementById('wardrobe-summary');
    const urgentShoppingList = document.getElementById('urgent-shopping-list');
    const recommendedShoppingList = document.getElementById('recommended-shopping-list');
    
    let wardrobeCards = '';
    let urgentItems = [];
    let recommendedItems = [];
    
    kids.forEach(kid => {
        const profile = kid.profile || {};
        
        // Generate wardrobe summary card
        const urgentCount = (profile.urgentNeeds || []).length;
        const wardrobeStatus = urgentCount > 0 ? 'Needs attention' : 'Looking good';
        const statusClass = urgentCount > 0 ? 'urgent' : 'success';
        
        wardrobeCards += `
        <div class="stat-card">
            <h4>${kid.name}</h4>
            <div class="stat-number ${statusClass}">${urgentCount}</div>
            <small>${wardrobeStatus}</small>
        </div>`;
        
        // Collect urgent items
        if (profile.urgentNeeds && profile.urgentNeeds.length > 0) {
            profile.urgentNeeds.forEach(item => {
                urgentItems.push(`${kid.name}: ${item.replace(/-/g, ' ')}`);
            });
        }
        
        // Collect supplies needs
        if (profile.suppliesNeeds && profile.suppliesNeeds.length > 0) {
            profile.suppliesNeeds.forEach(item => {
                urgentItems.push(`${kid.name}: ${item.replace(/-/g, ' ')}`);
            });
        }
        
        // Generate recommended items based on wardrobe analysis
        if (profile.currentTshirts && parseInt(profile.currentTshirts) < 5) {
            recommendedItems.push(`${kid.name}: More t-shirts (currently has ${profile.currentTshirts})`);
        }
        if (profile.currentJeans && parseInt(profile.currentJeans) < 3) {
            recommendedItems.push(`${kid.name}: More jeans (currently has ${profile.currentJeans})`);
        }
    });
    
    wardrobeSummary.innerHTML = wardrobeCards;
    
    urgentShoppingList.innerHTML = urgentItems.length > 0 ? 
        urgentItems.map(item => `<div class="shopping-item urgent">${item}</div>`).join('') :
        '<div class="shopping-item">No urgent needs right now! 🎉</div>';
    
    recommendedShoppingList.innerHTML = recommendedItems.length > 0 ?
        recommendedItems.map(item => `<div class="shopping-item">${item}</div>`).join('') :
        '<div class="shopping-item">All wardrobes look well-stocked! ✨</div>';
}

function loadPhotoGallery() {
    // Initialize photo gallery (placeholder - would integrate with real photo storage)
    const gallery = document.getElementById('photo-gallery-content');
    gallery.innerHTML = `
        <div style="text-align: center; padding: 40px; color: #64748b;">
            <h4>📸 Photo Gallery Coming Soon!</h4>
            <p>Upload photos of closets, gift ideas, and damaged items here.</p>
            <p>This feature will integrate with your device's camera and photo library.</p>
        </div>
    `;
}

function loadGiftManagement() {
    const giftTrackingTable = document.getElementById('gift-tracking-table');
    
    let giftRows = '';
    kids.forEach(kid => {
        const profile = kid.profile || {};
        
        // Generate gift ideas based on interests
        const interests = [];
        if (profile.bookTypes && profile.bookTypes.length > 0) {
            interests.push(`Books: ${profile.bookTypes.join(', ')}`);
        }
        if (profile.sportsActivities && profile.sportsActivities.length > 0) {
            interests.push(`Sports: ${profile.sportsActivities.join(', ')}`);
        }
        if (profile.creativeActivities && profile.creativeActivities.length > 0) {
            interests.push(`Creative: ${profile.creativeActivities.join(', ')}`);
        }
        
        const giftIdeas = interests.length > 0 ? interests.join('<br>') : 'Complete profile for suggestions';
        
        giftRows += `
        <tr>
            <td><strong>${kid.name}</strong> (${kid.age})</td>
            <td style="max-width: 200px; font-size: 0.9em;">${giftIdeas}</td>
            <td>AI Generated</td>
            <td><span class="confidence">Active</span></td>
            <td>
                <button class="btn btn-primary" style="padding: 5px 10px; font-size: 0.8em;">
                    View Details
                </button>
            </td>
        </tr>`;
    });
    
    giftTrackingTable.innerHTML = giftRows;
}

function loadFamilyMessages() {
    const messageDisplay = document.getElementById('message-thread-display');
    
    // Placeholder for family messages
    messageDisplay.innerHTML = `
        <div style="text-align: center; padding: 40px; color: #64748b;">
            <h4>💬 Family Messages</h4>
            <p>Direct messaging between family members about gifts, care requests, and shopping needs.</p>
            <p>Messages will appear here as family members start communicating through the system.</p>
        </div>
    `;
}

function loadAIPalSettings() {
    // AI Pal functionality is ready to be activated
    console.log('AI Pal settings loaded');
}

function loadFamilySettings() {
    const familyList = document.querySelector('.family-list');
    
    let familyMembers = '';
    kids.forEach(kid => {
        familyMembers += `
        <div class="setting-toggle">
            <span>${kid.name} (${kid.age} years old)</span>
            <button class="btn btn-secondary" style="padding: 5px 10px; font-size: 0.8em; margin-left: auto;">
                Edit
            </button>
        </div>`;
    });
    
    familyList.innerHTML = familyMembers;
}

// Quick Action Functions
function generateShoppingList() {
    alert('🛒 Generating consolidated shopping list for all family members...\n\nThis will compile all urgent needs and recommended purchases into a printable list!');
}

function checkLaundryStatus() {
    let laundryReport = '🧺 FAMILY LAUNDRY STATUS:\n\n';
    let hasUrgent = false;
    
    kids.forEach(kid => {
        const profile = kid.profile || {};
        if (profile.urgentLaundry && profile.urgentLaundry.length > 0) {
            laundryReport += `${kid.name}: ${profile.urgentLaundry.join(', ')}\n`;
            hasUrgent = true;
        }
    });
    
    if (!hasUrgent) {
        laundryReport += 'All caught up! No urgent laundry needs. 🎉';
    }
    
    alert(laundryReport);
}

function exportGiftIdeas() {
    let giftList = '🎁 FAMILY GIFT IDEAS:\n\n';
    
    kids.forEach(kid => {
        const profile = kid.profile || {};
        giftList += `${kid.name} (${kid.age}):\n`;
        
        if (profile.bookTypes && profile.bookTypes.length > 0) {
            giftList += `  📚 Books: ${profile.bookTypes.join(', ')}\n`;
        }
        if (profile.sportsActivities && profile.sportsActivities.length > 0) {
            giftList += `  ⚽ Sports: ${profile.sportsActivities.join(', ')}\n`;
        }
        if (profile.creativeActivities && profile.creativeActivities.length > 0) {
            giftList += `  🎨 Creative: ${profile.creativeActivities.join(', ')}\n`;
        }
        if (profile.favoriteColors && profile.favoriteColors.length > 0) {
            giftList += `  🌈 Favorite colors: ${profile.favoriteColors.join(', ')}\n`;
        }
        giftList += '\n';
    });
    
    // In a real implementation, this would download or email the list
    alert(giftList);
}

function sendFamilyUpdate() {
    alert('📱 Family update sent!\n\nAll family members will be notified of recent changes and urgent needs.');
}

// Photo and AI Functions (placeholders for future implementation)
function capturePhoto() {
    alert('📸 Camera feature coming soon!\n\nThis will allow you to take photos directly from your device.');
}

function selectPhoto() {
    alert('🖼️ Photo library access coming soon!\n\nThis will let you choose photos from your device.');
}

function uploadClosetPhoto() {
    alert('📷 Closet photo upload coming soon!\n\nThis will help family members see what clothes each child already has.');
}

function showPhotoCategory(category) {
    // Update active tab
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    if (typeof event !== 'undefined' && event.target) {
        event.target.classList.add('active');
    }
    
    // Show category content
    const content = document.getElementById('photo-gallery-content');
    content.innerHTML = `
        <div style="text-align: center; padding: 40px; color: #64748b;">
            <h4>📸 ${category.charAt(0).toUpperCase() + category.slice(1)} Photos</h4>
            <p>Photos in this category will appear here.</p>
        </div>
    `;
}

function setupDirectMessaging() {
    alert('🔗 Direct messaging setup!\n\nFamily members can now send gift ideas and photos directly to kids without going through mom.');
}

function generateAIGiftIdeas() {
    alert('✨ AI generating personalized gift suggestions based on each child\'s preferences, age, and interests!\n\nThis feature will provide smart, tailored recommendations.');
}

function selectPersonality(type) {
    // Update personality selection
    document.querySelectorAll('.personality-card').forEach(card => card.classList.remove('selected'));
    if (typeof event !== 'undefined' && event.target) {
        event.target.closest('.personality-card').classList.add('selected');
    }
    
    alert(`🤖 AI Personality set to: ${type}\n\nYour AI Bedroom Pal will now have a ${type} personality when chatting with the kids!`);
}

function activateAIPal() {
    alert('🚀 AI Bedroom Pal activated!\n\nThe AI assistant is now ready to help kids with outfit choices, gift preferences, and family communication.');
}

// Settings Functions
function addFamilyMember() {
    const name = prompt('Enter family member name:');
    if (name) {
        alert(`👥 ${name} will be added to the family system!`);
    }
}

function exportFamilyData() {
    alert('📥 Exporting all family data...\n\nThis will create a backup of all profiles, preferences, and photos.');
}

function backupPhotos() {
    alert('🖼️ Backing up all family photos...\n\nThis will save all uploaded photos to your preferred backup location.');
}

function resetAllData() {
    if (confirm('🔄 Are you sure you want to reset ALL family data?\n\nThis cannot be undone!')) {
        alert('Data reset cancelled for safety. In a real system, this would clear all profiles and start fresh.');
    }
}

// Personal Care Level-Up System Functions
let personalCareSystem = {
    levels: {
        1: { name: "Fresh Start", xpNeeded: 0, color: "#a855f7", emoji: "✨" },
        2: { name: "Clean Champion", xpNeeded: 100, color: "#06b6d4", emoji: "🏆" },
        3: { name: "Hygiene Hero", xpNeeded: 250, color: "#10b981", emoji: "🦸" },
        4: { name: "Sparkle Star", xpNeeded: 450, color: "#f59e0b", emoji: "⭐" },
        5: { name: "Glow Guru", xpNeeded: 700, color: "#ef4444", emoji: "✨" },
        6: { name: "Care Master", xpNeeded: 1000, color: "#8b5cf6", emoji: "👑" }
    },
    badges: {
        "streak-3": { name: "3-Day Streak", emoji: "🔥", description: "3 days of great hygiene!" },
        "streak-7": { name: "Week Warrior", emoji: "⚡", description: "7 days in a row!" },
        "shower-champion": { name: "Shower Champion", emoji: "🚿", description: "Loves staying clean!" },
        "teeth-master": { name: "Teeth Master", emoji: "🦷", description: "Perfect brushing habits!" },
        "smell-detective": { name: "Smell Detective", emoji: "👃", description: "Great at self-checking!" },
        "style-star": { name: "Style Star", emoji: "👕", description: "Always looks put-together!" },
        "helping-hand": { name: "Helping Hand", emoji: "🤝", description: "Helps with laundry!" }
    }
};

function initializePersonalCare() {
    if (!currentKid) return;
    
    // Initialize personal care data if it doesn't exist
    if (!currentKid.profile.personalCare) {
        currentKid.profile.personalCare = {
            level: 1,
            xp: 0,
            badges: [],
            completedTasks: [],
            streak: 0,
            lastActivity: null,
            supplies: [],
            smellChecks: []
        };
        saveKids();
    }
    
    updatePersonalCareDisplay();
}

function updatePersonalCareDisplay() {
    if (!currentKid || !currentKid.profile.personalCare) return;
    
    const personalCare = currentKid.profile.personalCare;
    const currentLevel = personalCareSystem.levels[personalCare.level];
    const nextLevel = personalCareSystem.levels[personalCare.level + 1];
    
    // Update level display
    document.getElementById('level-number').textContent = personalCare.level;
    document.getElementById('level-name').textContent = currentLevel.name;
    document.getElementById('current-level-badge').style.background = 
        `linear-gradient(135deg, ${currentLevel.color} 0%, ${currentLevel.color}88 100%)`;
    
    // Update XP progress
    const progressBar = document.getElementById('xp-progress');
    const xpText = document.getElementById('xp-text');
    
    if (nextLevel) {
        const xpProgress = ((personalCare.xp - currentLevel.xpNeeded) / (nextLevel.xpNeeded - currentLevel.xpNeeded)) * 100;
        progressBar.style.width = Math.max(0, Math.min(100, xpProgress)) + '%';
        xpText.textContent = `${personalCare.xp}/${nextLevel.xpNeeded} XP to ${nextLevel.name}`;
    } else {
        progressBar.style.width = '100%';
        xpText.textContent = `Max Level Achieved! 👑`;
    }
    
    // Update badges display
    updateBadgesDisplay();
    
    // Update streak display
    document.getElementById('current-streak').textContent = personalCare.streak;
    
    // Update age-appropriate tasks
    updateAgeAppropriateTasks();
}

function updateBadgesDisplay() {
    if (!currentKid) return;
    
    const personalCare = currentKid.profile.personalCare;
    const badgesContainer = document.getElementById('earned-badges');
    
    badgesContainer.innerHTML = '';
    
    personalCare.badges.forEach(badgeId => {
        const badge = personalCareSystem.badges[badgeId];
        if (badge) {
            const badgeElement = document.createElement('div');
            badgeElement.className = 'achievement-badge earned';
            badgeElement.innerHTML = `
                <div class="badge-emoji">${badge.emoji}</div>
                <div class="badge-name">${badge.name}</div>
            `;
            badgeElement.title = badge.description;
            badgesContainer.appendChild(badgeElement);
        }
    });
    
    // Show available badges
    const availableBadges = Object.keys(personalCareSystem.badges).filter(
        badgeId => !personalCare.badges.includes(badgeId)
    );
    
    availableBadges.slice(0, 3).forEach(badgeId => {
        const badge = personalCareSystem.badges[badgeId];
        const badgeElement = document.createElement('div');
        badgeElement.className = 'achievement-badge';
        badgeElement.innerHTML = `
            <div class="badge-emoji">${badge.emoji}</div>
            <div class="badge-name">${badge.name}</div>
        `;
        badgeElement.title = `${badge.description} (Not earned yet)`;
        badgesContainer.appendChild(badgeElement);
    });
}

function updateAgeAppropriateTasks() {
    if (!currentKid) return;
    
    const age = parseInt(currentKid.age);
    const personalCare = currentKid.profile.personalCare;
    const tasksContainer = document.getElementById('daily-tasks');
    
    let tasks = [];
    
    // Age 4-7 tasks
    if (age >= 4 && age <= 7) {
        tasks = [
            { id: 'brush-teeth', name: 'Brush teeth (with help)', xp: 10, icon: '🦷' },
            { id: 'wash-hands', name: 'Wash hands before meals', xp: 5, icon: '👐' },
            { id: 'clean-face', name: 'Wipe face clean', xp: 5, icon: '😊' },
            { id: 'brush-hair', name: 'Brush hair', xp: 5, icon: '💇' },
            { id: 'smell-check', name: 'Quick smell check', xp: 10, icon: '👃' }
        ];
    }
    // Age 8-11 tasks
    else if (age >= 8 && age <= 11) {
        tasks = [
            { id: 'brush-teeth', name: 'Brush teeth (morning & night)', xp: 15, icon: '🦷' },
            { id: 'shower-bath', name: 'Shower or bath', xp: 20, icon: '🛁' },
            { id: 'deodorant', name: 'Use deodorant', xp: 15, icon: '🧴' },
            { id: 'clean-clothes', name: 'Put on clean clothes', xp: 10, icon: '👕' },
            { id: 'smell-check', name: 'Self smell-check', xp: 15, icon: '👃' },
            { id: 'hair-care', name: 'Style hair nicely', xp: 10, icon: '💇' }
        ];
    }
    // Age 12+ tasks
    else if (age >= 12) {
        tasks = [
            { id: 'shower-daily', name: 'Daily shower', xp: 25, icon: '🚿' },
            { id: 'teeth-floss', name: 'Brush & floss teeth', xp: 20, icon: '🦷' },
            { id: 'deodorant-morning', name: 'Apply deodorant', xp: 15, icon: '🧴' },
            { id: 'face-care', name: 'Face washing routine', xp: 20, icon: '✨' },
            { id: 'hair-routine', name: 'Complete hair routine', xp: 15, icon: '💇' },
            { id: 'outfit-check', name: 'Check outfit appearance', xp: 10, icon: '👔' },
            { id: 'smell-awareness', name: 'Full smell & appearance check', xp: 25, icon: '👃' }
        ];
    }
    
    tasksContainer.innerHTML = '';
    
    tasks.forEach(task => {
        const isCompleted = personalCare.completedTasks.includes(task.id);
        const taskElement = document.createElement('div');
        taskElement.className = `daily-task ${isCompleted ? 'completed' : ''}`;
        taskElement.innerHTML = `
            <input type="checkbox" id="task-${task.id}" ${isCompleted ? 'checked' : ''} 
                   onchange="completeTask('${task.id}', ${task.xp})">
            <label for="task-${task.id}">
                <span class="task-icon">${task.icon}</span>
                <span class="task-name">${task.name}</span>
                <span class="task-xp">+${task.xp} XP</span>
            </label>
        `;
        tasksContainer.appendChild(taskElement);
    });
}

function completeTask(taskId, xpReward) {
    if (!currentKid || !currentKid.profile.personalCare) return;
    
    const personalCare = currentKid.profile.personalCare;
    const checkbox = document.getElementById(`task-${taskId}`);
    
    if (checkbox.checked && !personalCare.completedTasks.includes(taskId)) {
        // Add XP
        personalCare.xp += xpReward;
        personalCare.completedTasks.push(taskId);
        
        // Check for level up
        checkLevelUp();
        
        // Check for badges
        checkBadgeEarning();
        
        // Update streak
        updateStreak();
        
        // Show XP animation
        showXPGain(xpReward);
        
        // Save progress
        saveKids();
        
        // Update display
        updatePersonalCareDisplay();
    } else if (!checkbox.checked && personalCare.completedTasks.includes(taskId)) {
        // Remove task and XP if unchecked
        personalCare.xp = Math.max(0, personalCare.xp - xpReward);
        personalCare.completedTasks = personalCare.completedTasks.filter(id => id !== taskId);
        saveKids();
        updatePersonalCareDisplay();
    }
}

function checkLevelUp() {
    if (!currentKid) return;
    
    const personalCare = currentKid.profile.personalCare;
    const currentLevel = personalCareSystem.levels[personalCare.level];
    const nextLevel = personalCareSystem.levels[personalCare.level + 1];
    
    if (nextLevel && personalCare.xp >= nextLevel.xpNeeded) {
        personalCare.level++;
        showLevelUpCelebration(nextLevel);
    }
}

function showLevelUpCelebration(newLevel) {
    const celebration = document.getElementById('level-up-celebration');
    celebration.innerHTML = `
        <div class="celebration-content">
            <h3>🎉 LEVEL UP! 🎉</h3>
            <div class="new-level-badge" style="background: linear-gradient(135deg, ${newLevel.color} 0%, ${newLevel.color}88 100%);">
                <span class="level-number">${currentKid.profile.personalCare.level}</span>
                <span class="level-name">${newLevel.name}</span>
            </div>
            <p>Amazing job keeping up with your personal care!</p>
            <button onclick="closeCelebration()" class="btn btn-primary">Awesome! ✨</button>
        </div>
    `;
    celebration.classList.add('active');
}

function showXPGain(xp) {
    const indicator = document.createElement('div');
    indicator.className = 'xp-indicator';
    indicator.textContent = `+${xp} XP`;
    indicator.style.position = 'fixed';
    indicator.style.top = '50%';
    indicator.style.left = '50%';
    indicator.style.transform = 'translate(-50%, -50%)';
    indicator.style.color = '#10b981';
    indicator.style.fontSize = '24px';
    indicator.style.fontWeight = 'bold';
    indicator.style.zIndex = '1000';
    indicator.style.pointerEvents = 'none';
    
    document.body.appendChild(indicator);
    
    // Animate and remove
    setTimeout(() => {
        indicator.style.transform = 'translate(-50%, -150%)';
        indicator.style.opacity = '0';
        indicator.style.transition = 'all 1s ease-out';
    }, 100);
    
    setTimeout(() => {
        document.body.removeChild(indicator);
    }, 1100);
}

function checkBadgeEarning() {
    if (!currentKid) return;
    
    const personalCare = currentKid.profile.personalCare;
    const completedToday = personalCare.completedTasks.length;
    
    // Check for various badge conditions
    if (personalCare.streak >= 3 && !personalCare.badges.includes('streak-3')) {
        earnBadge('streak-3');
    }
    
    if (personalCare.streak >= 7 && !personalCare.badges.includes('streak-7')) {
        earnBadge('streak-7');
    }
    
    if (personalCare.completedTasks.includes('shower-daily') || personalCare.completedTasks.includes('shower-bath')) {
        if (!personalCare.badges.includes('shower-champion')) {
            earnBadge('shower-champion');
        }
    }
    
    if (personalCare.completedTasks.includes('brush-teeth') || personalCare.completedTasks.includes('teeth-floss')) {
        if (!personalCare.badges.includes('teeth-master')) {
            earnBadge('teeth-master');
        }
    }
    
    if (personalCare.completedTasks.includes('smell-check') || personalCare.completedTasks.includes('smell-awareness')) {
        if (!personalCare.badges.includes('smell-detective')) {
            earnBadge('smell-detective');
        }
    }
}

function earnBadge(badgeId) {
    if (!currentKid) return;
    
    const personalCare = currentKid.profile.personalCare;
    const badge = personalCareSystem.badges[badgeId];
    
    if (!personalCare.badges.includes(badgeId)) {
        personalCare.badges.push(badgeId);
        showBadgeEarned(badge);
        saveKids();
    }
}

function showBadgeEarned(badge) {
    const celebration = document.getElementById('badge-celebration');
    celebration.innerHTML = `
        <div class="celebration-content">
            <h3>🏆 BADGE EARNED! 🏆</h3>
            <div class="earned-badge-display">
                <div class="badge-emoji">${badge.emoji}</div>
                <div class="badge-name">${badge.name}</div>
            </div>
            <p>${badge.description}</p>
            <button onclick="closeBadgeCelebration()" class="btn btn-primary">Cool! 🎉</button>
        </div>
    `;
    celebration.classList.add('active');
}

function updateStreak() {
    if (!currentKid) return;
    
    const personalCare = currentKid.profile.personalCare;
    const today = new Date().toDateString();
    
    if (personalCare.lastActivity !== today) {
        // New day - update streak
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (personalCare.lastActivity === yesterday.toDateString()) {
            personalCare.streak++;
        } else {
            personalCare.streak = 1; // Reset streak if day was missed
        }
        
        personalCare.lastActivity = today;
        personalCare.completedTasks = []; // Reset daily tasks
    }
}

function recordSmellCheck(result) {
    if (!currentKid) return;
    
    const personalCare = currentKid.profile.personalCare;
    const smellCheck = {
        timestamp: new Date().toISOString(),
        result: result,
        improvement: result === 'fresh' ? 'Great job!' : 'Time for a refresh!'
    };
    
    personalCare.smellChecks.push(smellCheck);
    
    // Keep only last 10 smell checks
    if (personalCare.smellChecks.length > 10) {
        personalCare.smellChecks = personalCare.smellChecks.slice(-10);
    }
    
    updateSmellCheckDisplay();
    saveKids();
}

function updateSmellCheckDisplay() {
    if (!currentKid) return;
    
    const recentChecks = document.getElementById('recent-smell-checks');
    const personalCare = currentKid.profile.personalCare;
    
    if (!personalCare.smellChecks || personalCare.smellChecks.length === 0) {
        recentChecks.innerHTML = '<p>No smell checks yet. Try the helper above!</p>';
        return;
    }
    
    const recent = personalCare.smellChecks.slice(-3).reverse();
    recentChecks.innerHTML = recent.map(check => `
        <div class="smell-check-item ${check.result}">
            <span class="check-result">${check.result === 'fresh' ? '✅' : '🔄'}</span>
            <span class="check-time">${new Date(check.timestamp).toLocaleTimeString()}</span>
            <span class="check-feedback">${check.improvement}</span>
        </div>
    `).join('');
}

function addSupplyNeed(supply) {
    if (!currentKid) return;
    
    const personalCare = currentKid.profile.personalCare;
    if (!personalCare.supplies.includes(supply)) {
        personalCare.supplies.push(supply);
        updateSuppliesDisplay();
        saveKids();
    }
}

function removeSupplyNeed(supply) {
    if (!currentKid) return;
    
    const personalCare = currentKid.profile.personalCare;
    personalCare.supplies = personalCare.supplies.filter(s => s !== supply);
    updateSuppliesDisplay();
    saveKids();
}

function updateSuppliesDisplay() {
    if (!currentKid) return;
    
    const suppliesList = document.getElementById('needed-supplies-list');
    const personalCare = currentKid.profile.personalCare;
    
    if (!personalCare.supplies || personalCare.supplies.length === 0) {
        suppliesList.innerHTML = '<p>No supplies needed right now! ✨</p>';
        return;
    }
    
    suppliesList.innerHTML = personalCare.supplies.map(supply => `
        <div class="supply-item">
            <span class="supply-name">${supply}</span>
            <button onclick="removeSupplyNeed('${supply}')" class="btn btn-sm">Got it! ✅</button>
        </div>
    `).join('');
}

function closeCelebration() {
    document.getElementById('level-up-celebration').classList.remove('active');
}

function closeBadgeCelebration() {
    document.getElementById('badge-celebration').classList.remove('active');
}

// Initialize personal care when profile loads
const originalLoadProfile = loadProfile;
loadProfile = function() {
    originalLoadProfile();
    initializePersonalCare();
};

// Smell check helper functions
function checkSmellFresh() {
    recordSmellCheck('fresh');
    completeTask('smell-check', 15);
    showSmellCheckFeedback('fresh');
}

function checkSmellNeeds() {
    recordSmellCheck('needs-refresh');
    showSmellCheckFeedback('needs-refresh');
}

function showSmellCheckFeedback(result) {
    const feedback = document.getElementById('smell-check-feedback');
    
    if (result === 'fresh') {
        feedback.innerHTML = `
            <div style="color: #059669; font-weight: bold;">
                ✅ Great job! You're fresh and ready to go! 
                <div style="font-size: 0.9em; margin-top: 5px;">Keep up the good hygiene habits! 🌟</div>
            </div>
        `;
        feedback.style.background = '#f0fdf4';
        feedback.style.border = '1px solid #bbf7d0';
    } else {
        feedback.innerHTML = `
            <div style="color: #dc2626; font-weight: bold;">
                🔄 Time for a quick refresh! 
                <div style="font-size: 0.9em; margin-top: 5px;">A shower, deodorant, or clean clothes can help! 💪</div>
            </div>
        `;
        feedback.style.background = '#fef2f2';
        feedback.style.border = '1px solid #fecaca';
    }
    
    feedback.style.padding = '15px';
    feedback.style.borderRadius = '8px';
    feedback.style.marginTop = '10px';
    
    // Hide feedback after 5 seconds
    setTimeout(() => {
        feedback.innerHTML = '';
        feedback.style.background = '';
        feedback.style.border = '';
        feedback.style.padding = '';
    }, 5000);
}

// Supply tracking functions that connect to personal care system
function markSupplyAsNeeded(supply) {
    addSupplyNeed(supply);
}

// Parent dashboard hygiene monitoring
function getPersonalCareInsights() {
    let insights = [];
    
    kids.forEach(kid => {
        const personalCare = kid.profile.personalCare;
        if (personalCare) {
            const age = parseInt(kid.age);
            
            // Check for concerning patterns
            if (personalCare.streak === 0) {
                insights.push({
                    type: 'concern',
                    kid: kid.name,
                    message: 'No hygiene activities logged recently'
                });
            }
            
            if (personalCare.supplies && personalCare.supplies.length > 0) {
                insights.push({
                    type: 'supply',
                    kid: kid.name,
                    message: `Needs: ${personalCare.supplies.join(', ')}`
                });
            }
            
            if (personalCare.smellChecks && personalCare.smellChecks.length > 0) {
                const recent = personalCare.smellChecks.slice(-3);
                const needsRefresh = recent.filter(check => check.result === 'needs-refresh').length;
                if (needsRefresh >= 2) {
                    insights.push({
                        type: 'attention',
                        kid: kid.name,
                        message: 'May need extra hygiene support and gentle reminders'
                    });
                }
            }
            
            // Positive reinforcement
            if (personalCare.streak >= 7) {
                insights.push({
                    type: 'celebrate',
                    kid: kid.name,
                    message: `Amazing ${personalCare.streak}-day hygiene streak! 🎉`
                });
            }
            
            // Puberty transition support
            if (age >= 10 && age <= 14 && personalCare.level < 3) {
                insights.push({
                    type: 'puberty',
                    kid: kid.name,
                    message: 'Transitioning age - may benefit from hygiene routine discussions'
                });
            }
        }
    });
    
    return insights;
}

// CSS for the level badge small display and tabs
function addPersonalCareCSS() {
    const style = document.createElement('style');
    style.textContent = `
        .level-badge-small {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 60px;
            height: 30px;
            border-radius: 15px;
            color: white;
            font-weight: bold;
            font-size: 0.8em;
            text-shadow: 0 1px 2px rgba(0,0,0,0.3);
        }
        
        .personal-care-display {
            border-left: 4px solid #a855f7 !important;
            background: #faf5ff !important;
        }
        
        .smell-check-item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 8px;
            margin: 5px 0;
            border-radius: 6px;
            font-size: 0.9em;
        }
        
        .smell-check-item.fresh {
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
        }
        
        .smell-check-item.needs-refresh {
            background: #fef2f2;
            border: 1px solid #fecaca;
        }
        
        .supply-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 12px;
            margin: 5px 0;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
        }
        
        /* Profile Tabs */
        .profile-tabs {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin: 20px 0;
            padding: 0 10px;
            border-bottom: 2px solid #e2e8f0;
        }
        
        .tab-btn {
            background: #f8fafc;
            border: 2px solid #e2e8f0;
            border-bottom: none;
            border-radius: 12px 12px 0 0;
            padding: 12px 16px;
            font-size: 0.9em;
            font-weight: 600;
            color: #64748b;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            top: 2px;
        }
        
        .tab-btn:hover {
            background: #f1f5f9;
            color: #3b82f6;
            transform: translateY(-2px);
        }
        
        .tab-btn.active {
            background: white;
            color: #3b82f6;
            border-color: #3b82f6;
            box-shadow: 0 -2px 8px rgba(59, 130, 246, 0.1);
        }
        
        .profile-tab-content {
            display: none;
            animation: fadeIn 0.3s ease-in;
        }
        
        .profile-tab-content.active {
            display: block;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        /* Make tabs responsive */
        @media (max-width: 768px) {
            .profile-tabs {
                justify-content: center;
            }
            
            .tab-btn {
                flex: 1;
                min-width: 120px;
                text-align: center;
                font-size: 0.8em;
                padding: 10px 8px;
            }
        }
    `;
    document.head.appendChild(style);
}

// Initialize CSS when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    addPersonalCareCSS();
});

// Profile Tab Management
function showProfileTab(tabName) {
    console.log('showProfileTab called with:', tabName);
    // Hide all tab contents
    document.querySelectorAll('.profile-tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab content
    const targetTab = document.getElementById(`tab-${tabName}`);
    if (targetTab) {
        targetTab.classList.add('active');
    }
    
    // Add active class to clicked button (if event exists)
    if (typeof event !== 'undefined' && event.target) {
        event.target.classList.add('active');
    } else {
        // If no event, activate the corresponding tab button
        const tabBtn = document.querySelector(`[onclick="showProfileTab('${tabName}')"]`);
        if (tabBtn) {
            tabBtn.classList.add('active');
        }
    }
    
    // Auto-save current profile data when switching tabs
    if (currentKid) {
        setTimeout(() => {
            saveProfile();
        }, 100);
    }
    
    // Load specific tab functionality
    switch(tabName) {
        case 'wardrobe':
            setTimeout(() => {
                analyzeWardrobe();
                generateOutfitSuggestions();
            }, 200);
            break;
        case 'care':
            setTimeout(() => {
                initializePersonalCare();
            }, 200);
            break;
    }
}