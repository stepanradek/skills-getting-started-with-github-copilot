document.addEventListener('DOMContentLoaded', function() {
    const activitiesContainer = document.getElementById('activities-list');
    const activitySelect = document.getElementById('activity');
    const signupForm = document.getElementById('signup-form');
    const messageDiv = document.getElementById('message');

    // Load activities when page loads
    loadActivities();

    // Handle form submission
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const activityName = document.getElementById('activity').value;
        
        if (!email || !activityName) {
            showMessage('Please fill in all fields.', 'error');
            return;
        }
        
        signupForActivity(activityName, email);
    });

    async function loadActivities() {
        try {
            const response = await fetch('/activities');
            const activities = await response.json();
            
            displayActivities(activities);
            populateActivitySelect(activities);
        } catch (error) {
            activitiesContainer.innerHTML = '<p class="error">Failed to load activities. Please try again later.</p>';
            console.error('Error loading activities:', error);
        }
    }

    function displayActivities(activities) {
        let html = '';
        
        for (const [name, activity] of Object.entries(activities)) {
            const participantCount = activity.participants.length;
            const spotsLeft = activity.max_participants - participantCount;
            
            html += `
                <div class="activity-card">
                    <h4>${name}</h4>
                    <p><strong>Description:</strong> ${activity.description}</p>
                    <p><strong>Schedule:</strong> ${activity.schedule}</p>
                    <p><strong>Capacity:</strong> ${participantCount}/${activity.max_participants} (${spotsLeft} spots left)</p>
                    
                    <div class="participants-section">
                        <h5>Current Participants:</h5>
                        <div class="participants-count">${participantCount} student(s) enrolled</div>
                        ${activity.participants.length > 0 ? 
                            `<ul class="participants-list">
                                ${activity.participants.map(participant => 
                                    `<li>${participant}</li>`
                                ).join('')}
                            </ul>` : 
                            '<p style="font-style: italic; color: #666; font-size: 13px;">No participants yet</p>'
                        }
                    </div>
                </div>
            `;
        }
        
        activitiesContainer.innerHTML = html;
    }

    function populateActivitySelect(activities) {
        // Clear existing options except the first one
        activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';
        
        for (const name of Object.keys(activities)) {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            activitySelect.appendChild(option);
        }
    }

    async function signupForActivity(activityName, email) {
        try {
            const response = await fetch(`/activities/${encodeURIComponent(activityName)}/signup?email=${encodeURIComponent(email)}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();

            if (response.ok) {
                showMessage(result.message, 'success');
                // Reload activities to show updated participant list
                loadActivities();
                // Clear form
                document.getElementById('email').value = '';
                document.getElementById('activity').value = '';
            } else {
                showMessage(result.detail, 'error');
            }
        } catch (error) {
            showMessage('Failed to sign up. Please try again later.', 'error');
            console.error('Error signing up:', error);
        }
    }

    function showMessage(text, type) {
        messageDiv.textContent = text;
        messageDiv.className = `message ${type}`;
        messageDiv.classList.remove('hidden');
        
        // Hide message after 5 seconds
        setTimeout(() => {
            messageDiv.classList.add('hidden');
        }, 5000);
    }
});
