// Restaurant data will be loaded from restaurants.json
let restaurants = [];
let cuisines = new Set();

// Shuffle state for each cuisine (including "all")
// Map structure: cuisineName -> { shuffled: [], index: 0 }
let shuffleState = new Map();

// DOM elements
const cuisineDropdown = document.getElementById('cuisine-dropdown');
const randomCuisineBtn = document.getElementById('random-cuisine-btn');
const pickRestaurantBtn = document.getElementById('pick-restaurant-btn');
const listAllBtn = document.getElementById('list-all-btn');
const resultDiv = document.getElementById('result');
const restaurantName = document.getElementById('restaurant-name');
const restaurantCuisine = document.getElementById('restaurant-cuisine');
const restaurantComment = document.getElementById('restaurant-comment');
const allRestaurantsDiv = document.getElementById('all-restaurants');

// Load restaurant data
async function loadRestaurants() {
    try {
        const response = await fetch('restaurants.json');
        restaurants = await response.json();
        
        // Extract unique cuisines
        cuisines = new Set(restaurants.map(r => r.cuisine));
        
        // Populate dropdown
        populateDropdown();
    } catch (error) {
        console.error('Error loading restaurants:', error);
        alert('Error loading restaurant data. Please check restaurants.json file.');
    }
}

// Populate cuisine dropdown
function populateDropdown() {
    // Clear existing options except "All Cuisines"
    cuisineDropdown.innerHTML = '<option value="all">All Cuisines</option>';
    
    // Add cuisine options
    [...cuisines].sort().forEach(cuisine => {
        const option = document.createElement('option');
        option.value = cuisine;
        option.textContent = cuisine;
        cuisineDropdown.appendChild(option);
    });
}

// Get random element from array
function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// Random cuisine button handler
randomCuisineBtn.addEventListener('click', () => {
    const cuisineArray = [...cuisines];
    const randomCuisine = getRandomElement(cuisineArray);
    cuisineDropdown.value = randomCuisine;
});

// Shuffle an array using Fisher-Yates algorithm
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Get or create shuffle state for a cuisine
function getShuffleState(cuisineKey, restaurantList) {
    if (!shuffleState.has(cuisineKey) || 
        shuffleState.get(cuisineKey).index >= shuffleState.get(cuisineKey).shuffled.length) {
        // Need to create or refresh the shuffle
        shuffleState.set(cuisineKey, {
            shuffled: shuffleArray(restaurantList),
            index: 0
        });
    }
    return shuffleState.get(cuisineKey);
}

// Pick restaurant button handler
pickRestaurantBtn.addEventListener('click', () => {
    const selectedCuisine = cuisineDropdown.value;
    
    let filteredRestaurants;
    if (selectedCuisine === 'all') {
        filteredRestaurants = restaurants;
    } else {
        filteredRestaurants = restaurants.filter(r => r.cuisine === selectedCuisine);
    }
    
    if (filteredRestaurants.length === 0) {
        alert('No restaurants found for this cuisine!');
        return;
    }
    
    // Get the shuffle state for this cuisine
    const state = getShuffleState(selectedCuisine, filteredRestaurants);
    
    // Pick the next restaurant from the shuffled list
    const selectedRestaurant = state.shuffled[state.index];
    state.index++;
    
    displayRestaurant(selectedRestaurant);
});

// Display selected restaurant
function displayRestaurant(restaurant) {
    restaurantName.textContent = restaurant.name;
    restaurantCuisine.textContent = restaurant.cuisine;
    restaurantComment.textContent = restaurant.comment || 'No additional notes';
    
    resultDiv.classList.remove('hidden');
    
    // Scroll to result
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// List all restaurants button handler
listAllBtn.addEventListener('click', () => {
    // Check if list is currently visible
    const isVisible = !allRestaurantsDiv.classList.contains('hidden');
    
    if (isVisible) {
        // Hide the list
        allRestaurantsDiv.classList.add('hidden');
        listAllBtn.innerHTML = '📋 List All Restaurants';
    } else {
        // Show the list
        // Group restaurants by cuisine
        const restaurantsByCuisine = {};
        restaurants.forEach(restaurant => {
            if (!restaurantsByCuisine[restaurant.cuisine]) {
                restaurantsByCuisine[restaurant.cuisine] = [];
            }
            restaurantsByCuisine[restaurant.cuisine].push(restaurant);
        });
        
        // Sort cuisines alphabetically
        const sortedCuisines = Object.keys(restaurantsByCuisine).sort();
        
        // Build HTML
        let html = '';
        sortedCuisines.forEach(cuisine => {
            // Sort restaurants within cuisine alphabetically
            const sortedRestaurants = restaurantsByCuisine[cuisine].sort((a, b) => 
                a.name.localeCompare(b.name)
            );
            
            html += `<div class="cuisine-section">`;
            html += `<h2>${cuisine}</h2>`;
            html += `<ul class="restaurant-list">`;
            
            sortedRestaurants.forEach(restaurant => {
                html += `<li class="restaurant-item">`;
                html += `<div class="restaurant-item-name">${restaurant.name}</div>`;
                if (restaurant.comment) {
                    html += `<div class="restaurant-item-comment">${restaurant.comment}</div>`;
                }
                html += `</li>`;
            });
            
            html += `</ul>`;
            html += `</div>`;
        });
        
        allRestaurantsDiv.innerHTML = html;
        allRestaurantsDiv.classList.remove('hidden');
        listAllBtn.innerHTML = '❌ Hide List';
        
        // Scroll to the list
        setTimeout(() => {
            allRestaurantsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }
});

// Initialize app
loadRestaurants();
