document.addEventListener('DOMContentLoaded', function() {
    // Get the container where menu items will be displayed
    const foodMenuContainer = document.querySelector('.food-menu-container');
    
    // Load menu items from localStorage
    const menuItems = JSON.parse(localStorage.getItem('menuItems')) || [];
    
    // If there are custom menu items, add them to the existing menu
    if (menuItems.length > 0) {
        menuItems.forEach(item => {
            const menuItemHTML = `
                <div class="food-menu-item">
                    <div class="food-img">
                        <img src="${item.image}" alt="${item.title}" />
                    </div>
                    <div class="food-description">
                        <h2 class="food-titile">${item.title}</h2>
                        <p>${item.description}</p>
                        <p class="food-price">Price: &#8377; ${item.price}${item.priceSuffix ? ' ' + item.priceSuffix : ''}</p>
                    </div>
                </div>
            `;
            
            // Append to the container
            foodMenuContainer.innerHTML += menuItemHTML;
        });
    }
});