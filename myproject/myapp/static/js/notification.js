// Immediately attach the notification function to the window object
;(() => {
  // Hệ thống thông báo toàn cục
  window.showNotification = (message, type = "info") => {
    console.log("Showing notification:", message, type) // Debug log

    // Kiểm tra xem đã có notification container chưa
    let notificationContainer = document.querySelector(".notification-container")

    if (!notificationContainer) {
      notificationContainer = document.createElement("div")
      notificationContainer.className = "notification-container"
      document.body.appendChild(notificationContainer)
    }

    // Tạo notification
    const notification = document.createElement("div")
    notification.className = `notification ${type}`
    notification.innerHTML = `
          <div class="notification-content">
              <i class="fas ${type === "success" ? "fa-check-circle" : type === "error" ? "fa-exclamation-circle" : "fa-info-circle"}"></i>
              <span>${message}</span>
          </div>
          <button class="notification-close"><i class="fas fa-times"></i></button>
      `

    // Thêm vào container
    notificationContainer.appendChild(notification)

    // Xử lý nút đóng
    const closeBtn = notification.querySelector(".notification-close")
    closeBtn.addEventListener("click", () => {
      notification.classList.add("fade-out")
      setTimeout(() => {
        notification.remove()
      }, 300)
    })

    // Tự động đóng sau 5 giây
    setTimeout(() => {
      notification.classList.add("fade-out")
      setTimeout(() => {
        notification.remove()
      }, 300)
    }, 5000)

    // Return true to indicate the notification was shown
    return true
  }

  // Log to confirm the function is attached
  console.log("Notification system initialized")
})()
