// DOM Elements
const loginContainer = document.getElementById('loginContainer');
const mainContent = document.getElementById('mainContent');
const userDisplay = document.getElementById('userDisplay');
const postRantBtn = document.getElementById('postRantBtn');
const rantGUI = document.getElementById('rantGUI');
const submitRantBtn = document.getElementById('submitRantBtn');
const categoryInput = document.getElementById('category');
const dateInput = document.getElementById('date');
const ratingInput = document.getElementById('rating');
const rantContent = document.getElementById('rantContent');
const categoriesList = document.getElementById('categoriesList');

const categoryRantsContainer = document.getElementById('categoryRantsContainer'); 

const loginBtn = document.getElementById('loginBtn');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');

// Server URLs
const usersServer = " https://0e3ae916562ae3.lhr.life/users"; 
const rantsServer = "https://0e3ae916562ae3.lhr.life/rants";

// Current User
let currentUser = { username: "" };

// Log In function
loginBtn.addEventListener('click', function () {
    const username = usernameInput.value;
    const password = passwordInput.value;

    if (username.trim() === "" || password.trim() === "") {
        alert("Please fill in both username and password.");
        return;
    }

    let details = {
        username: username,
        password: password
    }

    // Send a PATCH request to update user credentials (or simulate login)
    fetch(`${usersServer}/1`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(details)
    }).then(response => {
        // Simulate successful login
        currentUser.username = username;

        // Hide login container and display main content
        loginContainer.style.display = 'none';
        mainContent.style.display = 'block';

        // Display logged-in user's name
        userDisplay.textContent = `${username}`;

        // Load and display all rants
        loadRants();
    });
});

// Function to load rants from the database

function loadRants() {
    fetch(rantsServer)
        .then(response => response.json())
        .then(data => {
            // Clear current rant categories
            categoriesList.innerHTML = "";

            // Display the rants based on categories
            data.forEach(category => {  // Iterate over each category
                const categorySection = document.createElement('section');
                categorySection.classList.add('category');
                const categoryTitle = document.createElement('h3');
                categoryTitle.textContent = category.id;
                categorySection.appendChild(categoryTitle);

                // Add event listener to the category section
                categorySection.addEventListener('click', function () {
                    displayRantsForCategory(category);  // Pass the specific category to display its rants
                });

                // Append the category section to the categories list
                categoriesList.appendChild(categorySection);
            });
        });
}

// Function to display rants for a specific category
function displayRantsForCategory(category) {
    // Clear the current category's rant display section
    categoryRantsContainer.innerHTML = `<button id="backToCategories">⬅ Back to Categories</button>`;

    // Display the category's rants
    const categoryTitle = document.createElement('h2');
    categoryTitle.textContent = `${category.id} Rants`;
    categoryRantsContainer.appendChild(categoryTitle);

    // Display each rant for the selected category
    category.things.forEach(rant => {
        const rantItem = document.createElement('div');
        rantItem.classList.add('rant-item');
        rantItem.innerHTML = `
            <h4>${rant.username} - Rating: ${rant.rating}/10</h4>
            <p><strong>Date:</strong> ${rant.date}</p>
            <p>${rant.content}</p>
        `;
        categoryRantsContainer.appendChild(rantItem);
    });

    // Show the rant container and hide the main content
    categoryRantsContainer.style.display = 'block';
    mainContent.style.display = 'none';

    const backToCategories= document.getElementById('backToCategories');
    backToCategories.addEventListener("click", function(){
        console.log("done")
        categoryRantsContainer.style.display = 'none';
        mainContent.style.display = 'block';
        // Load and display all rants
        loadRants();        
    })
}

// Show the rant posting GUI when the button is clicked
postRantBtn.addEventListener('click', function () {
    rantGUI.style.display = 'block';
});

// Submit the rant to the appropriate category
submitRantBtn.addEventListener('click', function () {
    const category = categoryInput.value;
    const date = dateInput.value;
    const rating = ratingInput.value;
    const content = rantContent.value;

    if (!category || !date || !rating || !content) {
        alert("Please fill in all the fields.");
        return;
    }

    // Prepare the new rant data
    const newRant = {
        username: currentUser.username,
        date: date,
        rating: rating,
        content: content
    };

    // Fetch the current rants from the server
    fetch(rantsServer)
        .then(response => response.json())
        .then(data => {
            // Find the category where the rant should be added
            const categoryToUpdate = data.find(cat => cat.id === category);

            if (!categoryToUpdate) {
                alert('Category not found!');
                return;
            }

            // Add the new rant to the correct category's "things" array
            categoryToUpdate.things.push(newRant);

            // Update the rants on the server by PATCHing the specific category
            fetch(`${rantsServer}/${category}`, {
                method: "PATCH",  // PATCH the specific category
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(categoryToUpdate)
            }).then(response => response.json())
              .then(() => {
                  // Hide the rant GUI and reset the form
                  rantGUI.style.display = 'none';
                  categoryInput.value = "";
                  dateInput.value = "";
                  ratingInput.value = "";
                  rantContent.value = "";

                  // Reload rants
                  loadRants();
              });
        });
});

