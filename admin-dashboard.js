document.addEventListener('DOMContentLoaded', async function() {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    if (!isLoggedIn) {
        window.location.href = 'admin.html';
        return;
    }

    // Handle logout
    document.getElementById('logout-btn').addEventListener('click', function(e) {
        e.preventDefault();
        localStorage.removeItem('adminLoggedIn');
        window.location.href = 'admin.html';
    });

    // Add these event listeners to your DOMContentLoaded handler in admin-dashboard.js

// Clear storage button
document.getElementById('clear-storage').addEventListener('click', function() {
    if (confirm('Are you sure you want to delete ALL menu items? This cannot be undone!')) {
        localStorage.removeItem('menuItems');
        loadMenuItems(); // Reload the empty list
        alert('All menu items have been deleted.');
    }
});

    // Migrate images button
    document.getElementById('migrate-images').addEventListener('click', async function() {
        this.disabled = true;
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Migrating...';
        
        await migrateImagesToGitHub();
        
        this.disabled = false;
        this.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Migrate Images to GitHub';
    });

    // Add this code to your admin-dashboard.js, inside the DOMContentLoaded event handler

// Handle refresh from GitHub button
document.getElementById('refresh-github-data').addEventListener('click', async function() {
    this.disabled = true;
    this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
    
    await loadFromGitHub();
    loadMenuItems();
    
    this.disabled = false;
    this.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh from GitHub';
});

    // Elements
    const addItemForm = document.getElementById('add-item-form');
    const menuItemsList = document.getElementById('menu-items-list');
    const imageInput = document.getElementById('item-image');
    const imagePreview = document.getElementById('image-preview');

    // Try to load menu items from GitHub first, then fall back to localStorage
    await loadFromGitHub();

    // Load menu items from localStorage
    loadMenuItems();

    // Handle image preview
    imageInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                imagePreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });

    // Handle form submission
    addItemForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const titleInput = document.getElementById('item-title');
        const descriptionInput = document.getElementById('item-description');
        const priceInput = document.getElementById('item-price');
        const priceSuffixInput = document.getElementById('item-price-suffix');
        
        const file = imageInput.files[0];
        if (!file) {
            alert('Please select an image');
            return;
        }

        const reader = new FileReader();
        // Find and replace the reader.onload function in the form submission event handler in admin-dashboard.js
reader.onload = async function(e) {
    let imageData = e.target.result;
    
    // Resize the image to reduce its size
    imageData = await resizeImage(imageData, 400, 400);
    
    try {
        // Check if GitHub is configured
        const repo = localStorage.getItem('githubRepo');
        const token = localStorage.getItem('githubToken');
        
        if (repo && token) {
            // Generate a unique filename for the image
            const fileName = `menu-item-${Date.now()}.jpg`;
            
            // Upload the image to GitHub
            const imageUrl = await uploadImageToGitHub(imageData, fileName);
            
            if (imageUrl) {
                // Create new menu item with the image URL
                const newItem = {
                    id: Date.now(),
                    title: titleInput.value,
                    description: descriptionInput.value,
                    price: priceInput.value,
                    priceSuffix: priceSuffixInput.value,
                    image: imageUrl  // Store the URL instead of base64 data
                };
                
                // Save menu item
                if (saveMenuItem(newItem)) {
                    // Reset form and show success
                    addItemForm.reset();
                    imagePreview.style.display = 'none';
                    alert('Menu item added successfully!');
                    loadMenuItems();
                }
                return;
            }
        }
        
        // If GitHub upload failed or not configured, fall back to storing in localStorage
        const newItem = {
            id: Date.now(),
            title: titleInput.value,
            description: descriptionInput.value,
            price: priceInput.value,
            priceSuffix: priceSuffixInput.value,
            image: imageData  // Store as base64 if GitHub upload failed
        };
        
        // Save menu item
        if (saveMenuItem(newItem)) {
            // Reset form
            addItemForm.reset();
            imagePreview.style.display = 'none';
            
            // Show success message
            alert('Menu item added successfully!');
            
            // Reload items list
            loadMenuItems();
        }
    } catch (error) {
        alert('Error: ' + error.message);
        console.error(error);
    }
};
        
        reader.readAsDataURL(file);
    });

   // Update this function in admin-dashboard.js
window.saveMenuItem = function(item) {
    try {
        // Get existing items
        let menuItems = JSON.parse(localStorage.getItem('menuItems')) || [];
        
        // Add new item
        menuItems.push(item);
        
        // Save back to localStorage
        localStorage.setItem('menuItems', JSON.stringify(menuItems));
        
        return true; // Success
    } catch (error) {
        console.error('Error saving menu item:', error);
        
        // Check specifically for quota exceeded errors
        if (error.name === 'QuotaExceededError' || 
            error.code === 22 || // Chrome's error code for quota exceeded
            error.code === 1014 || // Firefox's error code
            error.message && error.message.includes('quota')) {
                
            alert('Storage limit reached! Try using smaller images or removing some existing items.');
        } else {
            alert('Error saving menu item: ' + error.message);
        }
        
        return false; // Failure
    }
};

    // Function to load and display menu items
    function loadMenuItems() {
        const menuItems = JSON.parse(localStorage.getItem('menuItems')) || [];
        
        if (menuItems.length === 0) {
            menuItemsList.innerHTML = '<p>No menu items yet. Add your first item!</p>';
            return;
        }
        
        let html = '';
        menuItems.forEach(item => {
            html += `
                <div class="item-card" data-id="${item.id}">
                    <img src="${item.image}" alt="${item.title}" class="item-image">
                    <div class="item-details">
                        <h3 class="item-title">${item.title}</h3>
                        <p class="item-description">${item.description}</p>
                        <p class="item-price">₹ ${item.price}${item.priceSuffix ? ' ' + item.priceSuffix : ''}</p>
                    </div>
                    <button class="delete-btn" data-id="${item.id}">Delete</button>
                </div>
            `;
        });
        
        menuItemsList.innerHTML = html;
        
        // Add event listeners to delete buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const itemId = parseInt(this.getAttribute('data-id'));
                deleteMenuItem(itemId);
            });
        });
    }

    // Function to delete a menu item
    window.deleteMenuItem = function(itemId) {
        if (confirm('Are you sure you want to delete this item?')) {
            // Get existing items
            let menuItems = JSON.parse(localStorage.getItem('menuItems')) || [];
            
            // Filter out the item to delete
            menuItems = menuItems.filter(item => item.id !== itemId);
            
            // Save back to localStorage
            localStorage.setItem('menuItems', JSON.stringify(menuItems));
            
            // Reload items list
            loadMenuItems();
        }
    };

    // Function to load data from GitHub
    async function loadFromGitHub() {
        try {
            const repo = localStorage.getItem('githubRepo');
            
            if (!repo) {
                console.log('GitHub repo not configured, using localStorage data');
                return;
            }
            
            // Show loading message
            menuItemsList.innerHTML = '<div class="loading">Loading items from GitHub...</div>';
            
            // Fetch the menu data file from GitHub
            const response = await fetch(`https://raw.githubusercontent.com/${repo}/main/menu-data.json`);
            
            if (response.status === 200) {
                const menuData = await response.json();
                
                // Store in localStorage
                localStorage.setItem('menuItems', JSON.stringify(menuData));
                
                console.log('Successfully loaded menu data from GitHub');
            } else {
                console.log('Could not fetch menu data from GitHub, using localStorage data');
            }
        } catch (error) {
            console.error('Error loading from GitHub:', error);
        }
    }
    // Add resizeImage function to admin-dashboard.js
function resizeImage(base64Str, maxWidth = 400, maxHeight = 400) {
    return new Promise((resolve) => {
        let img = new Image();
        img.src = base64Str;
        img.onload = () => {
            let canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            
            // Calculate the new dimensions
            if (width > height) {
                if (width > maxWidth) {
                    height *= maxWidth / width;
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width *= maxHeight / height;
                    height = maxHeight;
                }
            }
            
            canvas.width = width;
            canvas.height = height;
            let ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            // Return the resized image as base64
            resolve(canvas.toDataURL('image/jpeg', 0.7)); // Use JPEG with 70% quality for better compression
        };
    });
}

// Add the migration function to admin-dashboard.js
async function migrateImagesToGitHub() {
    const menuItems = JSON.parse(localStorage.getItem('menuItems')) || [];
    let updated = false;
    
    for (let i = 0; i < menuItems.length; i++) {
        const item = menuItems[i];
        
        // Check if the image is a base64 string
        if (item.image && item.image.startsWith('data:image')) {
            try {
                // Generate a unique filename
                const fileName = `menu-item-${item.id}.jpg`;
                
                // Upload to GitHub
                const imageUrl = await uploadImageToGitHub(item.image, fileName);
                
                if (imageUrl) {
                    // Update the item to use the URL
                    menuItems[i].image = imageUrl;
                    updated = true;
                }
            } catch (error) {
                console.error('Error migrating image:', error);
            }
        }
    }
    
    // Save updated menu items if any images were migrated
    if (updated) {
        localStorage.setItem('menuItems', JSON.stringify(menuItems));
        alert('Successfully migrated images to GitHub!');
        loadMenuItems(); // Reload to show the updates
    }
    
    return updated;
}
});