// script.js - Security Guard Entry System Frontend

const API_BASE = "http://localhost:5501"; // Backend URL

// ─────────────────────────────────────────────
// Submit Entry → POST /add
// ─────────────────────────────────────────────
async function submitEntry() {
  // 1. Read form values
  const vehicleNumber = document.getElementById("vehicleNumber").value.trim();
  const visitorName   = document.getElementById("visitorName").value.trim();
  const flatNumber    = document.getElementById("flatNumber").value.trim();
  const purpose       = document.getElementById("purpose").value.trim();

  // 2. Basic frontend validation
  if (!vehicleNumber || !visitorName || !flatNumber || !purpose) {
    showMessage("⚠️ Please fill in all fields before submitting.", "error");
    return;
  }

  // 3. Disable button to prevent double-clicks
  const btn = document.getElementById("submitBtn");
  const btnText = document.getElementById("btnText");
  btn.disabled = true;
  btnText.textContent = "⏳ Submitting...";

  try {
    // 4. Send data to backend using fetch API
    const response = await fetch(`${API_BASE}/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vehicleNumber, visitorName, flatNumber, purpose }),
    });

    const result = await response.json();

    if (response.ok) {
      // 5. Success: clear form, show message, reload entries
      showMessage("✅ Entry submitted successfully!", "success");
      clearForm();
      loadEntries(); // Refresh the table
    } else {
      showMessage("❌ Error: " + result.message, "error");
    }
  } catch (error) {
    // Network error (e.g., server not running)
    showMessage("❌ Could not connect to server. Is it running on port 5501?", "error");
    console.error("Fetch error:", error);
  }

  // 6. Re-enable button
  btn.disabled = false;
  btnText.textContent = "✅ Submit Entry";
}

// ─────────────────────────────────────────────
// Load All Entries → GET /all
// ─────────────────────────────────────────────
async function loadEntries() {
  try {
    const response = await fetch(`${API_BASE}/all`);
    const entries  = await response.json();

    renderTable(entries);
  } catch (error) {
    console.error("Could not load entries:", error);
  }
}

// ─────────────────────────────────────────────
// Render Entries in the Table
// ─────────────────────────────────────────────
function renderTable(entries) {
  const tbody       = document.getElementById("entriesBody");
  const emptyState  = document.getElementById("emptyState");
  const tableWrapper = document.getElementById("tableWrapper");
  const badge       = document.getElementById("entryCount");

  // Update entry count badge
  badge.textContent = `${entries.length} ${entries.length === 1 ? "entry" : "entries"}`;

  // Show/hide empty state
  if (entries.length === 0) {
    emptyState.classList.remove("hidden");
    tableWrapper.classList.add("hidden");
    return;
  }

  emptyState.classList.add("hidden");
  tableWrapper.classList.remove("hidden");

  // Build table rows
  tbody.innerHTML = ""; // Clear old rows

  entries.forEach((entry, index) => {
    const row = document.createElement("tr");

    // Highlight the very first row (latest entry)
    if (index === 0) row.classList.add("new-entry");

    row.innerHTML = `
      <td>${entry.id}</td>
      <td><span class="vehicle-badge">${escapeHtml(entry.vehicleNumber)}</span></td>
      <td>${escapeHtml(entry.visitorName)}</td>
      <td>${escapeHtml(entry.flatNumber)}</td>
      <td>${escapeHtml(entry.purpose)}</td>
      <td class="time-cell">🕐 ${escapeHtml(entry.time)}</td>
    `;

    tbody.appendChild(row);
  });
}

// ─────────────────────────────────────────────
// Helper: Show Success or Error Message
// ─────────────────────────────────────────────
function showMessage(text, type) {
  const messageBox = document.getElementById("message");
  messageBox.textContent = text;
  messageBox.className = `message ${type}`; // "success" or "error"

  // Auto-hide after 4 seconds
  setTimeout(() => {
    messageBox.classList.add("hidden");
  }, 4000);
}

// ─────────────────────────────────────────────
// Helper: Clear the Form Fields
// ─────────────────────────────────────────────
function clearForm() {
  document.getElementById("vehicleNumber").value = "";
  document.getElementById("visitorName").value   = "";
  document.getElementById("flatNumber").value    = "";
  document.getElementById("purpose").value       = "";
}

// ─────────────────────────────────────────────
// Helper: Escape HTML to prevent XSS
// ─────────────────────────────────────────────
function escapeHtml(text) {
  const div = document.createElement("div");
  div.appendChild(document.createTextNode(text));
  return div.innerHTML;
}

// ─────────────────────────────────────────────
// Member Vehicle Button Handler
// ─────────────────────────────────────────────
function handleMemberVehicle() {
  // Show the modal
  const modal = document.getElementById("memberVehicleModal");
  modal.style.display = "block";

  // Clear previous results
  document.getElementById("checkVehicleNumber").value = "";
  document.getElementById("vehicleResult").className = "vehicle-result hidden";

  // Focus on input
  setTimeout(() => {
    document.getElementById("checkVehicleNumber").focus();
  }, 100);
}

// ─────────────────────────────────────────────
// Check Vehicle Function
// ─────────────────────────────────────────────
async function checkVehicle() {
  const vehicleNumber = document.getElementById("checkVehicleNumber").value.trim().toUpperCase();

  if (!vehicleNumber) {
    showVehicleResult("⚠️ Please enter a vehicle number", "error");
    return;
  }

  // Disable button
  const btn = document.getElementById("checkVehicleBtn");
  const originalText = btn.textContent;
  btn.disabled = true;
  btn.textContent = "🔍 Checking...";

  try {
    const response = await fetch(`${API_BASE}/check-vehicle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vehicleNumber }),
    });

    const result = await response.json();

    if (response.ok) {
      if (result.status === 'member') {
        showVehicleResult(result.message, 'member');
      } else if (result.status === 'visitor') {
        showVehicleResult(result.message, 'visitor');
        // Refresh the entries table to show the new visitor entry
        loadEntries();
      }
    } else {
      showVehicleResult("❌ Error: " + result.error, "error");
    }
  } catch (error) {
    showVehicleResult("❌ Could not connect to server. Is it running?", "error");
    console.error("Check vehicle error:", error);
  }

  // Re-enable button
  btn.disabled = false;
  btn.textContent = originalText;
}

// ─────────────────────────────────────────────
// Show Vehicle Result
// ─────────────────────────────────────────────
function showVehicleResult(message, type) {
  const resultDiv = document.getElementById("vehicleResult");
  resultDiv.textContent = message;
  resultDiv.className = `vehicle-result ${type}`;
  resultDiv.classList.remove("hidden");
}

// ─────────────────────────────────────────────
// Modal Close Handlers
// ─────────────────────────────────────────────
function closeModal() {
  const modal = document.getElementById("memberVehicleModal");
  modal.style.display = "none";
}

// Click outside modal to close
window.onclick = function(event) {
  const modal = document.getElementById("memberVehicleModal");
  if (event.target === modal) {
    closeModal();
  }
}

// ─────────────────────────────────────────────
// Allow pressing Enter key in vehicle check modal
// ─────────────────────────────────────────────
document.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    const modal = document.getElementById("memberVehicleModal");
    if (modal.style.display === "block") {
      checkVehicle();
    } else {
      submitEntry();
    }
  }

  // ESC key to close modal
  if (e.key === "Escape") {
    const modal = document.getElementById("memberVehicleModal");
    if (modal.style.display === "block") {
      closeModal();
    }
  }
});

// ─────────────────────────────────────────────
// Allow pressing Enter key to submit
// ─────────────────────────────────────────────
document.addEventListener("keydown", function (e) {
  if (e.key === "Enter") submitEntry();
});

// ─────────────────────────────────────────────
// Add event listener for member vehicle button
// ─────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", function() {
  const memberVehicleBtn = document.getElementById("memberVehicleBtn");
  if (memberVehicleBtn) {
    memberVehicleBtn.addEventListener("click", handleMemberVehicle);
  }

  // Modal event listeners
  const modalCloseBtn = document.querySelector(".modal-close");
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener("click", closeModal);
  }

  const checkVehicleBtn = document.getElementById("checkVehicleBtn");
  if (checkVehicleBtn) {
    checkVehicleBtn.addEventListener("click", checkVehicle);
  }
});
