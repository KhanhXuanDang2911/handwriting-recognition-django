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
  avatar.addEventListener("click", function () {
    dropdown.classList.toggle("active");
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", function (event) {
    if (!avatar.contains(event.target) && !dropdown.contains(event.target)) {
      dropdown.classList.remove("active");
    }
  });

  // Get ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");

  // Sample history data (in a real app, this would come from a database)
  const historyData = [
    {
      id: 1,
      imageUrl: "placeholder.svg?height=300&width=400",
      result: "The quick brown fox jumps over the lazy dog.",
      date: "2023-11-15T14:30:00",
      fullResult:
        "The quick brown fox jumps over the lazy dog. This pangram contains every letter of the English alphabet at least once.",
    },
    {
      id: 2,
      imageUrl: "placeholder.svg?height=300&width=400",
      result: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      date: "2023-11-14T10:15:00",
      fullResult:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    },
    {
      id: 3,
      imageUrl: "placeholder.svg?height=300&width=400",
      result:
        "Artificial intelligence (AI) is intelligence demonstrated by machines.",
      date: "2023-11-13T16:45:00",
      fullResult:
        "Artificial intelligence (AI) is intelligence demonstrated by machines, as opposed to natural intelligence displayed by animals including humans.",
    },
    {
      id: 4,
      imageUrl: "placeholder.svg?height=300&width=400",
      result:
        "Text recognition technology, also known as Optical Character Recognition (OCR).",
      date: "2023-11-12T09:20:00",
      fullResult:
        "Text recognition technology, also known as Optical Character Recognition (OCR), converts different types of documents, such as scanned paper documents, PDF files or images into editable and searchable data.",
    },
    {
      id: 5,
      imageUrl: "placeholder.svg?height=300&width=400",
      result:
        "The development of mobile applications involves creating software applications.",
      date: "2023-11-11T13:10:00",
      fullResult:
        "The development of mobile applications involves creating software applications that run on mobile devices. These applications can be pre-installed or downloaded and installed by the user later.",
    },
  ];

  // Find the record by ID
  const record = historyData.find((item) => item.id === parseInt(id));

  if (record) {
    // Update the UI with the record data
    detailImage.src = record.imageUrl;
    detailResult.innerHTML = `<p class="recognized-text">${record.fullResult}</p>`;

    // Format date
    const date = new Date(record.date);
    const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString(
      [],
      { hour: "2-digit", minute: "2-digit" }
    )}`;

    detailDate.textContent = `Date: ${formattedDate}`;
    detailId.textContent = `ID: #${record.id}`;
  } else {
    // Handle case where record is not found
    detailResult.innerHTML = '<p class="placeholder-text">Record not found</p>';
    detailDate.textContent = "Date: N/A";
    detailId.textContent = "ID: Not found";
  }

  // Text-to-speech functionality
  audioBtn.addEventListener("click", function () {
    if (record && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(record.fullResult);
      window.speechSynthesis.speak(utterance);
    }
  });

  // Logout functionality (simulated)
  logoutBtn.addEventListener("click", function (e) {
    e.preventDefault();
    alert("Logout successful");
    // In a real app, this would redirect to login page or perform actual logout
  });
});
