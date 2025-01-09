// Global Variables
let currentUser = null;
const ADMIN_EMAIL = 'ghanashyambudhathoki55@gmail.com';
const ADMIN_PASSWORD = 'admin123';
let cart = [];

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on admin page
    if (window.location.href.includes('admin.html')) {
        initializeAdminPanel();
    } else {
        initializeUserPanel();
    }
});

// User Panel Functions
function initializeUserPanel() {
    // Login Modal
    const loginBtn = document.getElementById('loginBtn');
    const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
    
    loginBtn.addEventListener('click', () => loginModal.show());

    // Login Form
    const loginForm = document.getElementById('loginForm');
    loginForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
            window.location.href = 'admin.html';
        } else {
            // Regular user login logic
            alert('Login successful!');
            loginModal.hide();
            updateUIAfterLogin();
        }
    });

    // Search Functionality
    const searchInput = document.getElementById('searchInput');
    searchInput?.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        filterRestaurants(searchTerm);
    });

    // Load Initial Data
    loadRestaurants();
}

// Admin Panel Functions
function initializeAdminPanel() {
    // Check admin authentication
    if (!isAdminAuthenticated()) {
        window.location.href = 'index.html';
        return;
    }

    // Navigation
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            showSection(targetId);
            
            // Update active state
            navLinks.forEach(l => l.parentElement.classList.remove('active'));
            link.parentElement.classList.add('active');
        });
    });

    // Initialize Dashboard
    updateDashboardStats();

    // Add Food Form
    const addFoodForm = document.getElementById('addFoodForm');
    addFoodForm?.addEventListener('submit', handleAddFood);

    // Initialize all admin sections
    initializeRestaurantManagement();
    initializeMenuManagement();
    initializeOrderManagement();
    initializeUserManagement();
}

function isAdminAuthenticated() {
    // Check if admin is logged in
    const adminData = localStorage.getItem('adminData');
    if (!adminData) return false;
    
    const { email, password } = JSON.parse(adminData);
    return email === ADMIN_EMAIL && password === ADMIN_PASSWORD;
}

function updateDashboardStats() {
    // Simulated data - replace with actual API calls
    const stats = {
        totalOrders: localStorage.getItem('totalOrders') || 0,
        activeUsers: localStorage.getItem('activeUsers') || 0,
        totalRevenue: localStorage.getItem('totalRevenue') || 0,
        pendingDeliveries: localStorage.getItem('pendingDeliveries') || 0
    };

    document.getElementById('totalOrders').textContent = stats.totalOrders;
    document.getElementById('activeUsers').textContent = stats.activeUsers;
    document.getElementById('totalRevenue').textContent = `NPR ${stats.totalRevenue}`;
    document.getElementById('pendingDeliveries').textContent = stats.pendingDeliveries;
}

function initializeRestaurantManagement() {
    const restaurantList = document.querySelector('.restaurant-list');
    if (!restaurantList) return;

    // Load restaurants from localStorage
    const restaurants = JSON.parse(localStorage.getItem('restaurants')) || [];
    
    restaurantList.innerHTML = `
        <div class="table-responsive">
            <table class="table">
                <thead>
                    <tr>
                        <th>Restaurant Name</th>
                        <th>Cuisine</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${restaurants.map(restaurant => `
                        <tr>
                            <td>${restaurant.name}</td>
                            <td>${restaurant.cuisine}</td>
                            <td><span class="badge bg-success">Active</span></td>
                            <td>
                                <button class="btn btn-sm btn-primary" onclick="editRestaurant('${restaurant.id}')">Edit</button>
                                <button class="btn btn-sm btn-danger" onclick="deleteRestaurant('${restaurant.id}')">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;

    // Add Restaurant Button
    const addRestaurantBtn = document.getElementById('addRestaurantBtn');
    addRestaurantBtn?.addEventListener('click', showAddRestaurantModal);
}

function handleAddFood(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const newFood = {
        id: Date.now(),
        name: formData.get('foodName'),
        price: parseFloat(formData.get('foodPrice')),
        category: formData.get('foodCategory'),
        image: formData.get('foodImage'),
        type: formData.get('foodCategory') === 'beverage' ? 'beverage' : 'food'
    };

    // Save to localStorage
    const foods = JSON.parse(localStorage.getItem('foods')) || [];
    foods.push(newFood);
    localStorage.setItem('foods', JSON.stringify(foods));

    // Update UI
    alert('Food item added successfully!');
    e.target.reset();
    updateMenuList();
}

function processOrder() {
    const orderForm = document.getElementById('orderForm');
    if (!orderForm.checkValidity()) {
        orderForm.reportValidity();
        return;
    }

    const orderDetails = {
        id: Date.now(),
        items: cart,
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        customer: {
            fullName: document.getElementById('fullName').value,
            email: document.getElementById('orderEmail').value,
            phone: document.getElementById('phone').value,
            address: document.getElementById('address').value
        },
        paymentMethod: document.getElementById('paymentMethod').value,
        status: 'pending',
        orderDate: new Date().toISOString()
    };

    // Save order to localStorage
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(orderDetails);
    localStorage.setItem('orders', JSON.stringify(orders));

    // Update stats
    updateAdminStats(orderDetails);

    // Clear cart and close modal
    cart = [];
    updateCartUI();
    const cartModal = bootstrap.Modal.getInstance(document.getElementById('cartModal'));
    cartModal.hide();

    // Show success message
    showNotification('Order placed successfully! We will contact you shortly.');
}

function updateAdminStats(order) {
    const stats = {
        totalOrders: parseInt(localStorage.getItem('totalOrders') || 0) + 1,
        activeUsers: parseInt(localStorage.getItem('activeUsers') || 0),
        totalRevenue: parseInt(localStorage.getItem('totalRevenue') || 0) + order.total,
        pendingDeliveries: parseInt(localStorage.getItem('pendingDeliveries') || 0) + 1
    };

    Object.entries(stats).forEach(([key, value]) => {
        localStorage.setItem(key, value.toString());
    });
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Utility Functions
function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
}

function loadRestaurants() {
    // Simulated restaurant data - replace with actual API calls
    const restaurants = [
        {
            name: 'Pizza Paradise',
            cuisine: 'Italian',
            rating: 4.5,
            image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591',
            menu: [
                { id: 1, name: 'Margherita Pizza', price: 450, type: 'food', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591' },
                { id: 2, name: 'Pepperoni Pizza', price: 550, type: 'food', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591' },
                { id: 3, name: 'Coca Cola', price: 80, type: 'beverage', image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7' },
                { id: 4, name: 'Mineral Water', price: 40, type: 'beverage', image: 'https://images.unsplash.com/photo-1560023907-5f339617ea30' }
            ]
        },
        {
            name: 'Sushi Master',
            cuisine: 'Japanese',
            rating: 4.8,
            image: 'https://images.unsplash.com/photo-1553621042-f6e147245754',
            menu: [
                { id: 5, name: 'California Roll', price: 650, type: 'food', image: 'https://images.unsplash.com/photo-1553621042-f6e147245754' },
                { id: 6, name: 'Salmon Nigiri', price: 550, type: 'food', image: 'https://images.unsplash.com/photo-1553621042-f6e147245754' },
                { id: 7, name: 'Green Tea', price: 120, type: 'beverage', image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574' },
                { id: 8, name: 'Sake', price: 350, type: 'beverage', image: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809' }
            ]
        }
    ];

    const restaurantGrid = document.getElementById('restaurantGrid');
    if (!restaurantGrid) return;

    restaurantGrid.innerHTML = restaurants.map(restaurant => `
        <div class="restaurant-card">
            <div class="restaurant-image" style="background-image: url('${restaurant.image}')"></div>
            <div class="restaurant-info">
                <h3>${restaurant.name}</h3>
                <p>${restaurant.cuisine}</p>
                <div class="restaurant-rating">
                    ${'★'.repeat(Math.floor(restaurant.rating))}
                    ${restaurant.rating % 1 ? '½' : ''}
                    ${'☆'.repeat(5 - Math.ceil(restaurant.rating))}
                    ${restaurant.rating}
                </div>
                <div class="menu-section">
                    <h4>Food Menu</h4>
                    ${restaurant.menu.filter(item => item.type === 'food').map(item => `
                        <div class="menu-item">
                            <img src="${item.image}" alt="${item.name}" class="menu-item-image">
                            <div class="menu-item-details">
                                <span>${item.name}</span>
                                <span>NPR ${item.price}</span>
                            </div>
                            <button onclick="addToCart(${JSON.stringify(item).replace(/"/g, '&quot;')})">Add to Cart</button>
                        </div>
                    `).join('')}
                    
                    <h4>Beverages</h4>
                    ${restaurant.menu.filter(item => item.type === 'beverage').map(item => `
                        <div class="menu-item">
                            <img src="${item.image}" alt="${item.name}" class="menu-item-image">
                            <div class="menu-item-details">
                                <span>${item.name}</span>
                                <span>NPR ${item.price}</span>
                            </div>
                            <button onclick="addToCart(${JSON.stringify(item).replace(/"/g, '&quot;')})">Add to Cart</button>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `).join('');
}

function filterRestaurants(searchTerm) {
    const cards = document.querySelectorAll('.restaurant-card');
    cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

function updateUIAfterLogin() {
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.textContent = 'My Account';
    }
}

function loadAdminData() {
    // Load restaurants
    const restaurantList = document.querySelector('.restaurant-list');
    if (restaurantList) {
        restaurantList.innerHTML = `
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Restaurant Name</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Pizza Paradise</td>
                            <td><span class="badge bg-success">Active</span></td>
                            <td>
                                <button class="btn btn-sm btn-primary">Edit</button>
                                <button class="btn btn-sm btn-danger">Delete</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    }

    // Load orders
    const orderList = document.querySelector('.order-list');
    if (orderList) {
        orderList.innerHTML = `
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Status</th>
                            <th>Total</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>#12345</td>
                            <td>John Doe</td>
                            <td><span class="badge bg-warning">Preparing</span></td>
                            <td>$45.99</td>
                            <td>
                                <button class="btn btn-sm btn-primary">Update Status</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    }
}

// Cart Functions
function addToCart(item) {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 1) + 1;
    } else {
        cart.push({ ...item, quantity: 1 });
    }
    updateCartUI();
    showCartNotification();
}

function updateCartUI() {
    const cartCount = document.querySelector('.cart-count');
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    cartCount.textContent = totalItems;

    const cartItems = document.getElementById('cartItems');
    if (cartItems) {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-details">
                    <h6>${item.name}</h6>
                    <p>NPR ${item.price} x ${item.quantity}</p>
                </div>
                <div class="cart-item-actions">
                    <button onclick="updateQuantity(${item.id}, ${item.quantity - 1})" ${item.quantity <= 1 ? 'disabled' : ''}>-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                    <button onclick="removeFromCart(${item.id})" class="remove-btn">×</button>
                </div>
            </div>
        `).join('') || '<p>Your cart is empty</p>';

        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        document.getElementById('cartTotal').textContent = `NPR ${total}`;
    }
}

function updateQuantity(itemId, newQuantity) {
    if (newQuantity <= 0) {
        removeFromCart(itemId);
        return;
    }
    const item = cart.find(item => item.id === itemId);
    if (item) {
        item.quantity = newQuantity;
        updateCartUI();
    }
}

function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    updateCartUI();
}

function showCartNotification() {
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.textContent = 'Item added to cart!';
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 2000);
}
