document.addEventListener('DOMContentLoaded', function() {
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

    // Elements
    const addItemForm = document.getElementById('add-item-form');
    const menuItemsList = document.getElementById('menu-items-list');
    const imageInput = document.getElementById('item-image');
    const imagePreview = document.getElementById('image-preview');

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
        reader.onload = function(e) {
            const imageData = e.target.result;
            
            // Create new menu item
            const newItem = {
                id: Date.now(), // Simple unique ID
                title: titleInput.value,
                description: descriptionInput.value,
                price: priceInput.value,
                priceSuffix: priceSuffixInput.value,
                image: imageData
            };

            // Save menu item
            saveMenuItem(newItem);
            
            // Reset form
            addItemForm.reset();
            imagePreview.style.display = 'none';
            
            // Show success message
            alert('Menu item added successfully!');
            
            // Reload items list
            loadMenuItems();
        };
        
        reader.readAsDataURL(file);
    });

    // Function to save a menu item
    function saveMenuItem(item) {
        // Get existing items
        let menuItems = JSON.parse(localStorage.getItem('menuItems')) || [];
        
        // Add new item
        menuItems.push(item);
        
        // Save back to localStorage
        localStorage.setItem('menuItems', JSON.stringify(menuItems));
    }

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
    function deleteMenuItem(itemId) {
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
    }
});