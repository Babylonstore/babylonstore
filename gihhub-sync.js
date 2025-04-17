// This function will be called after adding or deleting menu items
async function syncWithGitHub() {
    // This requires a GitHub personal access token stored in localStorage
    const token = localStorage.getItem('githubToken');
    const repo = localStorage.getItem('githubRepo'); // Format: 'username/repo-name'
    
    if (!token || !repo) {
        console.error('GitHub token or repo not configured');
        return;
    }
    
    // Get menu items data
    const menuItems = JSON.parse(localStorage.getItem('menuItems')) || [];
    const menuItemsJson = JSON.stringify(menuItems, null, 2);
    
    try {
        // Check if the file exists first
        let sha = null;
        try {
            const checkResponse = await fetch(`https://api.github.com/repos/${repo}/contents/menu-data.json`, {
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            if (checkResponse.status === 200) {
                const fileData = await checkResponse.json();
                sha = fileData.sha;
            }
        } catch (error) {
            console.log('File does not exist yet, will create it');
        }
        
        // Prepare the request
        const requestData = {
            message: 'Update menu items data',
            content: btoa(menuItemsJson), // Convert to base64
        };
        
        // If the file already exists, include the SHA
        if (sha) {
            requestData.sha = sha;
        }
        
        // Create or update the file
        const response = await fetch(`https://api.github.com/repos/${repo}/contents/menu-data.json`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });
        
        if (response.status === 200 || response.status === 201) {
            console.log('Successfully synced menu data with GitHub');
        } else {
            console.error('Failed to sync with GitHub:', await response.text());
        }
    } catch (error) {
        console.error('Error syncing with GitHub:', error);
    }
}

// Add GitHub configuration UI to the dashboard
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('admin-dashboard.html')) {
        // Create GitHub configuration section
        const configSection = document.createElement('div');
        configSection.className = 'github-config';
        configSection.innerHTML = `
            <h2>GitHub Sync Configuration</h2>
            <div class="form-group">
                <label for="github-token">GitHub Personal Access Token</label>
                <input type="password" id="github-token" placeholder="Enter your token">
            </div>
            <div class="form-group">
                <label for="github-repo">Repository (username/repo-name)</label>
                <input type="text" id="github-repo" placeholder="e.g., yourusername/my-restaurant-website">
            </div>
            <button id="save-github-config" class="btn btn-primary">Save Configuration</button>
        `;
        
        // Add the section to the page
        document.querySelector('.admin-container').appendChild(configSection);
        
        // Load existing config
        const token = localStorage.getItem('githubToken');
        const repo = localStorage.getItem('githubRepo');
        
        if (token) document.getElementById('github-token').value = token;
        if (repo) document.getElementById('github-repo').value = repo;
        
        // Handle config save
        document.getElementById('save-github-config').addEventListener('click', function() {
            const newToken = document.getElementById('github-token').value;
            const newRepo = document.getElementById('github-repo').value;
            
            localStorage.setItem('githubToken', newToken);
            localStorage.setItem('githubRepo', newRepo);
            
            alert('GitHub configuration saved successfully!');
            
            // Sync current data
            syncWithGitHub();
        });
        
        // Add syncing after menu changes
        const originalSaveMenuItem = window.saveMenuItem;
        window.saveMenuItem = function(item) {
            originalSaveMenuItem(item);
            syncWithGitHub();
        };
        
        const originalDeleteMenuItem = window.deleteMenuItem;
        window.deleteMenuItem = function(itemId) {
            originalDeleteMenuItem(itemId);
            syncWithGitHub();
        };
    }
});