document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
  const avatar = document.getElementById("avatar");
  const dropdown = document.getElementById("dropdown");
  const detailImage = document.getElementById("detailImage");
  const detailResult = document.getElementById("detailResult");
  const detailDate = document.getElementById("detailDate");
  const detailId = document.getElementById("detailId");
  const audioBtn = document.getElementById("audioBtn");
  const logoutBtn = document.getElementById("logout");

  // Toggle dropdown menu
  if (avatar) {
    avatar.addEventListener("click", function () {
      dropdown.classList.toggle("active");
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", function (event) {
      if (!avatar.contains(event.target) && !dropdown.contains(event.target)) {
        dropdown.classList.remove("active");
      }
    });
  }

  // Get ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");

  if (!id) {
    detailResult.innerHTML = '<p class="placeholder-text">No ID provided</p>';
    detailDate.textContent = "Date: N/A";
    detailId.textContent = "ID: Not found";
    return;
  }

  // Fetch history detail from API
  async function fetchHistoryDetail() {
    try {
      const response = await fetch(`/histories/${id}/`);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === 'success') {
        displayHistoryDetail(data.data);
      } else {
        throw new Error(data.message || 'Error fetching history detail');
      }
    } catch (error) {
      console.error('Error:', error);
      detailResult.innerHTML = `<p class="placeholder-text">Error: ${error.message}</p>`;
      detailDate.textContent = "Date: N/A";
      detailId.textContent = "ID: Not found";
    }
  }

  // Display history detail
  function displayHistoryDetail(record) {
    // Xử lý URL ảnh với Cloudinary
    if (record.image) {
      // Kiểm tra xem URL đã có tiền tố Cloudinary chưa
      if (!record.image.startsWith('https://')) {
        detailImage.src = `https://res.cloudinary.com/dbqoymyi8/${record.image}`;
      } else {
        detailImage.src = record.image;
      }
    } else {
      detailImage.src = "/placeholder.svg?height=300&width=400";
    }

    detailResult.innerHTML = `<p class="recognized-text">${record.result}</p>`;

    // Format date
    const date = new Date(record.created_at);
    const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString(
      [],
      { hour: "2-digit", minute: "2-digit" }
    )}`;

    detailDate.textContent = `Date: ${formattedDate}`;
    detailId.textContent = `ID: #${record.id}`;

    // Set up text-to-speech
    if (audioBtn && "speechSynthesis" in window) {
      audioBtn.addEventListener("click", function () {
        const utterance = new SpeechSynthesisUtterance(record.result);
        window.speechSynthesis.speak(utterance);
      });
    }
  }

  // Fetch history detail
  fetchHistoryDetail();

  // Logout functionality (simulated)
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function (e) {
      e.preventDefault();
      // In a real app, this would redirect to login page or perform actual logout
      window.location.href = "/login/";
    });
  }
});
