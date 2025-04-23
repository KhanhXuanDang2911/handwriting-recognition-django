document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
  const avatar = document.getElementById("avatar");
  const dropdown = document.getElementById("dropdown");
  const profileAvatar = document.getElementById("profileAvatar");
  const avatarUpload = document.getElementById("avatarUpload");
  const profileForm = document.getElementById("profileForm");
  const logoutBtn = document.getElementById("logout");

  // Toggle dropdown menu
  avatar.addEventListener("click", function () {
    dropdown.classList.toggle("active");
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", function (event) {
    if (!avatar.contains(event.target) && !dropdown.contains(event.target)) {
      dropdown.classList.remove("active");
    }
  });

  // Handle profile avatar upload
  profileAvatar.parentElement.addEventListener("click", function () {
    avatarUpload.click();
  });

  avatarUpload.addEventListener("change", function () {
    if (this.files.length) {
      const file = this.files[0];

      if (!file.type.match("image.*")) {
        alert("Please select an image file");
        return;
      }

      const reader = new FileReader();

      reader.onload = function (e) {
        profileAvatar.src = e.target.result;
        // Also update the header avatar
        avatar.querySelector("img").src = e.target.result;
      };

      reader.readAsDataURL(file);
    }
  });

  // Handle form submission
  profileForm.addEventListener("submit", function (e) {
    e.preventDefault();

    // Simulate saving profile data
    const formData = new FormData(profileForm);
    const profileData = {};

    for (const [key, value] of formData.entries()) {
      profileData[key] = value;
    }

    // In a real app, you would send this data to your server
    console.log("Profile data to save:", profileData);

    // Show success message
    alert("Profile updated successfully!");
  });

  // Logout functionality (simulated)
  logoutBtn.addEventListener("click", function (e) {
    e.preventDefault();
    alert("Logout successful");
    // In a real app, this would redirect to login page or perform actual logout
  });
});
