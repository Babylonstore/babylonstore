document.addEventListener('DOMContentLoaded', async function() {
    // Get the container where menu items will be displayed
    const foodMenuContainer = document.querySelector('.food-menu-container');
    
    // Try to fetch menu data from GitHub first
    let menuItems = await loadMenuFromGitHub() || JSON.parse(localStorage.getItem('menuItems')) || [];
    
    // Clear any existing content in the container
    foodMenuContainer.innerHTML = '';
    
    // If there are menu items, add them to the container
    if (menuItems.length > 0) {
        menuItems.forEach(item => {
            const menuItemHTML = `
<div class="food-menu-item" data-aos="fade-up" data-aos-duration="400" data-aos-offset="100" data-aos-easing="ease-out-sine">
              <div class="food-img">
                <img src="${item.image}" alt="${item.title}" />
              </div>
              <div class="food-info">
                <h2 class="food-title">${item.title}</h2>
                <p class="food-description">${item.description}</p>
                <p class="food-price">₹ ${item.price}${item.priceSuffix ? ' ' + item.priceSuffix : ''}</p>
                ${item.popular ? `<span class="badge">Popular</span>` : ''}
              </div>
            </div>
          `;
                   
            
            // Append to the container
            foodMenuContainer.innerHTML += menuItemHTML;
        });
    } else {
        // Display a message if no menu items are available
        foodMenuContainer.innerHTML = `
            <div class="no-menu-items" style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
                <p>No menu items available yet. Please check back soon!</p>
            </div>
        `;
    }
});

// Function to load menu data from GitHub remains the same
async function loadMenuFromGitHub() {
    try {
        // Try to get the repository information from localStorage
        const repo = localStorage.getItem('githubRepo');
        
        if (!repo) {
            console.log('GitHub repo not configured, using localStorage data');
            return null;
        }
        
        // Fetch the menu data file from GitHub
        const response = await fetch(`https://raw.githubusercontent.com/${repo}/main/menu-data.json`);
        
        if (response.status === 200) {
            const menuData = await response.json();
            
            // Store in localStorage for offline access or when GitHub is unavailable
            localStorage.setItem('menuItems', JSON.stringify(menuData));
            
            return menuData;
        } else {
            console.log('Could not fetch menu data from GitHub, using localStorage data');
            return null;
        }
    } catch (error) {
        console.error('Error loading menu from GitHub:', error);
        return null;
    }
}