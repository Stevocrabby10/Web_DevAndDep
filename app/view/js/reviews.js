// Reviews functionality for leagues page
(function() {
    let currentUser = null;
    let allReviews = [];
    let editingReviewId = null;

    // Check if user is logged in
    async function checkAuth() {
        try {
            const response = await fetch('/current-user', {
                credentials: 'include'
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.username) {
                    currentUser = data.username;
                    return true;
                }
            }
            currentUser = null;
            return false;
        } catch (error) {
            console.error('Error checking auth:', error);
            currentUser = null;
            return false;
        }
    }

    // Fetch all reviews
    async function fetchReviews() {
        try {
            const response = await fetch('/leagues/reviews', {
                credentials: 'include'
            });
            
            if (response.ok) {
                allReviews = await response.json();
                displayReviews();
            } else {
                console.error('Failed to fetch reviews');
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
        }
    }

    // Display reviews for each league
    function displayReviews() {
        const leagueCards = document.querySelectorAll('[data-league]');
        
        leagueCards.forEach(card => {
            const leagueName = card.getAttribute('data-league');
            const reviewsSection = card.querySelector('.reviews-section');
            const reviewsList = reviewsSection.querySelector('.reviews-list');
            
            // Filter reviews for this league
            const leagueReviews = allReviews.filter(review => 
                review.league_name === leagueName
            );
            
            // Clear existing reviews
            reviewsList.innerHTML = '';
            
            if (leagueReviews.length === 0) {
                reviewsList.innerHTML = '<p class="no-reviews">No reviews yet. Be the first to review!</p>';
            } else {
                leagueReviews.forEach(review => {
                    const reviewElement = createReviewElement(review);
                    reviewsList.appendChild(reviewElement);
                });
            }
        });
    }

    // Create a review element
    function createReviewElement(review) {
        const reviewDiv = document.createElement('div');
        reviewDiv.className = 'review-item';
        reviewDiv.dataset.reviewId = review.id;
        
        const isOwner = currentUser && review.reviewer === currentUser;
        const date = review.created_at ? new Date(review.created_at).toLocaleDateString() : 'Unknown date';
        
        reviewDiv.innerHTML = `
            <div class="review-header">
                <div class="review-meta">
                    <strong class="review-author">${escapeHtml(review.reviewer)}</strong>
                    <span class="review-date">${date}</span>
                </div>
                <div class="review-rating">
                    ${'⭐'.repeat(review.rating)} ${review.rating}/5
                </div>
            </div>
            <p class="review-comment">${escapeHtml(review.comment)}</p>
            ${isOwner ? `
                <div class="review-actions">
                    <button class="btn btn-small edit-review-btn" data-review-id="${review.id}">Edit</button>
                    <button class="btn btn-small delete-review-btn" data-review-id="${review.id}">Delete</button>
                </div>
            ` : ''}
        `;
        
        // Add event listeners for edit/delete if owner
        if (isOwner) {
            const editBtn = reviewDiv.querySelector('.edit-review-btn');
            const deleteBtn = reviewDiv.querySelector('.delete-review-btn');
            
            editBtn.addEventListener('click', () => editReview(review));
            deleteBtn.addEventListener('click', () => deleteReview(review.id));
        }
        
        return reviewDiv;
    }

    // Show/hide review form and add button based on auth
    function updateReviewUI() {
        const isLoggedIn = currentUser !== null;
        const addButtons = document.querySelectorAll('.add-review-btn');
        const formContainers = document.querySelectorAll('.review-form-container');
        
        addButtons.forEach(btn => {
            btn.style.display = isLoggedIn ? 'block' : 'none';
        });
        
        // Add event listeners to add review buttons
        addButtons.forEach(btn => {
            btn.onclick = function() {
                const reviewsSection = btn.closest('.reviews-section');
                const formContainer = reviewsSection.querySelector('.review-form-container');
                formContainer.style.display = 'block';
                btn.style.display = 'none';
                editingReviewId = null;
                
                // Reset form
                const form = formContainer.querySelector('.review-form');
                form.reset();
            };
        });
        
        // Add event listeners to cancel buttons
        document.querySelectorAll('.cancel-review').forEach(btn => {
            btn.onclick = function() {
                const reviewsSection = btn.closest('.reviews-section');
                const formContainer = reviewsSection.querySelector('.review-form-container');
                const addBtn = reviewsSection.querySelector('.add-review-btn');
                formContainer.style.display = 'none';
                if (isLoggedIn) {
                    addBtn.style.display = 'block';
                }
                editingReviewId = null;
            };
        });
        
        // Add event listeners to review forms
        document.querySelectorAll('.review-form').forEach(form => {
            form.onsubmit = function(e) {
                e.preventDefault();
                const reviewsSection = form.closest('.reviews-section');
                const leagueName = reviewsSection.getAttribute('data-league-reviews');
                const rating = form.querySelector('[name="rating"]').value;
                const comment = form.querySelector('[name="comment"]').value;
                
                if (editingReviewId) {
                    updateReview(editingReviewId, leagueName, rating, comment);
                } else {
                    createReview(leagueName, rating, comment);
                }
            };
        });
    }

    // Create a new review
    async function createReview(leagueName, rating, comment) {
        if (!currentUser) {
            alert('Please log in to create a review');
            return;
        }
        
        try {
            const response = await fetch('/leagues/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    league_name: leagueName,
                    rating: parseInt(rating),
                    comment: comment
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Refresh reviews
                await fetchReviews();
                
                // Hide form and show add button
                const formContainers = document.querySelectorAll('.review-form-container');
                formContainers.forEach(container => {
                    const reviewsSection = container.closest('.reviews-section');
                    if (reviewsSection.getAttribute('data-league-reviews') === leagueName) {
                        container.style.display = 'none';
                        const addBtn = reviewsSection.querySelector('.add-review-btn');
                        if (currentUser) {
                            addBtn.style.display = 'block';
                        }
                    }
                });
            } else {
                alert(data.msg || 'Failed to create review');
            }
        } catch (error) {
            console.error('Error creating review:', error);
            alert('Error creating review. Please try again.');
        }
    }

    // Edit a review
    function editReview(review) {
        if (!currentUser || review.reviewer !== currentUser) {
            alert('You can only edit your own reviews');
            return;
        }
        
        // Find the reviews section for this league
        const reviewsSection = document.querySelector(
            `[data-league-reviews="${review.league_name}"]`
        );
        
        if (!reviewsSection) return;
        
        const formContainer = reviewsSection.querySelector('.review-form-container');
        const form = formContainer.querySelector('.review-form');
        const addBtn = reviewsSection.querySelector('.add-review-btn');
        
        // Populate form with review data
        form.querySelector('[name="rating"]').value = review.rating;
        form.querySelector('[name="comment"]').value = review.comment;
        
        // Show form and hide add button
        formContainer.style.display = 'block';
        addBtn.style.display = 'none';
        editingReviewId = review.id;
        
        // Scroll to form
        formContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Update a review
    async function updateReview(reviewId, leagueName, rating, comment) {
        if (!currentUser) {
            alert('Please log in to update a review');
            return;
        }
        
        try {
            const response = await fetch(`/leagues/reviews/${reviewId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    league_name: leagueName,
                    rating: parseInt(rating),
                    comment: comment
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Refresh reviews
                await fetchReviews();
                
                // Hide form and show add button
                const reviewsSection = document.querySelector(
                    `[data-league-reviews="${leagueName}"]`
                );
                if (reviewsSection) {
                    const formContainer = reviewsSection.querySelector('.review-form-container');
                    const addBtn = reviewsSection.querySelector('.add-review-btn');
                    formContainer.style.display = 'none';
                    if (currentUser) {
                        addBtn.style.display = 'block';
                    }
                }
                editingReviewId = null;
            } else {
                alert(data.msg || 'Failed to update review');
            }
        } catch (error) {
            console.error('Error updating review:', error);
            alert('Error updating review. Please try again.');
        }
    }

    // Delete a review
    async function deleteReview(reviewId) {
        if (!currentUser) {
            alert('Please log in to delete a review');
            return;
        }
        
        if (!confirm('Are you sure you want to delete this review?')) {
            return;
        }
        
        try {
            const response = await fetch(`/leagues/reviews/${reviewId}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Refresh reviews
                await fetchReviews();
            } else {
                alert(data.msg || 'Failed to delete review');
            }
        } catch (error) {
            console.error('Error deleting review:', error);
            alert('Error deleting review. Please try again.');
        }
    }

    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Initialize on page load
    async function init() {
        await checkAuth();
        await fetchReviews();
        updateReviewUI();
        
        // Re-check auth periodically (in case user logs in/out in another tab)
        setInterval(async () => {
            const wasLoggedIn = currentUser !== null;
            await checkAuth();
            const isLoggedIn = currentUser !== null;
            
            // If auth status changed, update UI and refresh reviews
            if (wasLoggedIn !== isLoggedIn) {
                updateReviewUI();
                await fetchReviews();
            }
        }, 5000); // Check every 5 seconds
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

