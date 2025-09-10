// Function to create the context menu
function createContextMenu() {
  chrome.contextMenus.create({
    id: "generate-test-cases",
    title: "Generate AI Test Cases for Selected Text",
    contexts: ["selection"]
  });
}

// Create the menu when the extension is installed
chrome.runtime.onInstalled.addListener(() => {
  createContextMenu();
});

// Listener for when the context menu item is clicked
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "generate-test-cases" && info.selectionText) {
    const requirementText = info.selectionText;

    // Define the API endpoint
    const apiUrl = 'http://localhost:5000/api/generate-from-text';

    // Make the API call to the backend
    fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        requirement_text: requirementText,
        domain: 'General' // Using a generic domain for the extension
      }),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      if (data.error) {
        throw new Error(data.error);
      }
      // Format the results into a simple HTML string
      const resultsHtml = formatResultsToHtml(data.test_cases);
      displayResultsInNewTab(resultsHtml);
    })
    .catch(error => {
      console.error('Error generating test cases:', error);
      const errorHtml = `<h1>Error</h1><p>${error.message}</p>`;
      displayResultsInNewTab(errorHtml);
    });
  }
});

// Helper function to format the JSON data into an HTML string
function formatResultsToHtml(testCases) {
  let html = `
    <style>
      body { font-family: sans-serif; line-height: 1.6; padding: 2em; background-color: #f4f6f8; }
      .card { background-color: white; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 1.5em; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
      .header { background-color: #eeeeee; padding: 1em; border-bottom: 1px solid #ddd; font-weight: bold; }
      .content { padding: 1em; }
      pre { background-color: #282c34; color: white; padding: 1em; border-radius: 4px; white-space: pre-wrap; word-wrap: break-word; }
      .tags { padding: 0 1em 1em 1em; }
      .chip { display: inline-block; background-color: #e0e0e0; padding: 0.4em 0.8em; border-radius: 16px; margin-right: 0.5em; font-size: 0.9em; }
    </style>
    <h1>Generated Test Cases</h1>
  `;

  if (!testCases || testCases.length === 0) {
    return html + '<p>No test cases were generated.</p>';
  }

  testCases.forEach(test => {
    html += `
      <div class="card">
        <div class="header">Test ID: ${test.test_id}</div>
        <div class="content">
          <p><strong>Source:</strong> ${test.requirement_source}</p>
          <pre><code>${escapeHtml(test.gherkin_feature)}</code></pre>
        </div>
        <div class="tags">
          <strong>Compliance Tags:</strong> 
          ${test.compliance_tags.length > 0 ? test.compliance_tags.map(tag => `<span class="chip">${tag}</span>`).join('') : 'None'}
        </div>
      </div>
    `;
  });

  return html;
}

// Helper function to open a new tab and inject the HTML content
function displayResultsInNewTab(htmlContent) {
  chrome.tabs.create({ url: "about:blank" }, (newTab) => {
    chrome.scripting.executeScript({
      target: { tabId: newTab.id },
      func: (content) => {
        document.body.innerHTML = content;
      },
      args: [htmlContent]
    });
  });
}

// Helper to escape HTML to prevent issues with special characters
function escapeHtml(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
 }
