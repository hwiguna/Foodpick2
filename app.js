// Restaurant data will be loaded from restaurants.json
let restaurants = [];
let cuisines = new Set();
let lastSelectedRestaurant = null;

// DOM elements
const cuisineDropdown = document.getElementById('cuisine-dropdown');
const randomCuisineBtn = document.getElementById('random-cuisine-btn');
const pickRestaurantBtn = document.getElementById('pick-restaurant-btn');
const resultDiv = document.getElementById('result');
const restaurantName = document.getElementById('restaurant-name');
const restaurantCuisine = document.getElementById('restaurant-cuisine');
const restaurantComment = document.getElementById('restaurant-comment');

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
    
    // If there's more than one restaurant, avoid picking the same one
    let selectedRestaurant;
    if (filteredRestaurants.length > 1 && lastSelectedRestaurant) {
        // Filter out the last selected restaurant
        const availableRestaurants = filteredRestaurants.filter(
            r => r.name !== lastSelectedRestaurant.name
        );
        selectedRestaurant = getRandomElement(availableRestaurants);
    } else {
        selectedRestaurant = getRandomElement(filteredRestaurants);
    }
    
    displayRestaurant(selectedRestaurant);
});

// Display selected restaurant
function displayRestaurant(restaurant) {
    restaurantName.textContent = restaurant.name;
    restaurantCuisine.textContent = restaurant.cuisine;
    restaurantComment.textContent = restaurant.comment || 'No additional notes';
    
    // Save this as the last selected restaurant
    lastSelectedRestaurant = restaurant;
    
    resultDiv.classList.remove('hidden');
    
    // Scroll to result
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Initialize app
loadRestaurants();
