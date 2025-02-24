import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import {
  getFirestore,
  getDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

const addBlogmodal = document.getElementById("addBlogModal");
const loginModal = document.getElementById("loginModal");
const closeBtn = document.querySelector(".close-btn");
const closeLoginForm = document.querySelector(".close-login-form-btn");
const blogContainer = document.querySelector(".blog-container");
const blogForm = document.getElementById("blogForm");
let userAvl = false;

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBUeLU7F54at4Swsu84ZaMWny1DoHE2wOE",
  authDomain: "i10ai-e6f8a.firebaseapp.com",
  projectId: "i10ai-e6f8a",
  storageBucket: "i10ai-e6f8a.appspot.com",
  messagingSenderId: "864838859163",
  appId: "1:864838859163:web:0f73aee1a24a616a92093e",
  measurementId: "G-MPMYWZS2SS",
};

const accessKey = "7_w_WAS9PvbJy9JyG2lfVHdEXTOqqupZvRxpNbbAMvE";
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();
let blogImg;

// Add LinkedIn share button styles to the head
const addLinkedInStyles = () => {
  const styleElement = document.createElement("style");
  styleElement.textContent = `
    .linkedin-share-container {
      margin-top: 15px;
      display: flex;
      align-items: center;
    }
    
    .linkedin-btn {
    width:100%;
    justify-content:center;
      background-color: #0077b5;
      color: white;
      border: none;
      padding: 8px 25px;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      font-weight: 600;
      transition: background-color 0.3s;
    }
    
    .linkedin-btn:hover {
      background-color: #005e93;
    }
    
    .linkedin-btn svg {
      margin-right: 8px;
    }
    
    .linkedin-btn:disabled {
      background-color: #cccccc;
      cursor: not-allowed;
    }

    .readmore-btn {
    width:96%;
    justify-content:center;
      background-color: #0077b5;
      color: white;
      border: none;
      padding: 8px 25px;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      font-weight: 600;
      transition: background-color 0.3s;
      margin-right:20px;
    }
    
    .readmore-btn:hover {
      background-color: #005e93;
    }
    
    .readmore-btn svg {
      margin-right: 8px;
    }
    
    .readmore-btn:disabled {
      background-color: #cccccc;
      cursor: not-allowed;
    }
    
    .share-status {
      margin-left: 10px;
      font-size: 14px;
    }
    
    .success {
      color: #2e7d32;
    }
    
    .error {
      color: #d32f2f;
    }

    .loader {
      border: 2px solid #f3f3f3;
      border-radius: 50%;
      border-top: 2px solid #0077b5;
      width: 16px;
      height: 16px;
      margin-right: 8px;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(styleElement);
};

// Add styles when the document loads
document.addEventListener("DOMContentLoaded", addLinkedInStyles);

//--------------------------------------- firebase onAuthStateChanged ---------------------------------//
onAuthStateChanged(auth, (user) => {
  const loggedInUserId = localStorage.getItem("loggedInUserId");
  if (loggedInUserId) {
    const docRef = doc(db, "users", loggedInUserId);
    getDoc(docRef)
      .then((docSnap) => {
        if (docSnap.exists()) {
          userAvl = true;
        } else {
          console.log("No document found matching ID");
        }
      })
      .catch(() => {
        console.log("Error getting document");
      });
  } else {
    console.log("User ID not found in Local Storage");
  }
});

// ----------------------------------- blog p0st from mongodb------------------------------//
async function loadBlogs() {
  try {
    const response = await fetch("http://localhost:5000/get-blogs");
    if (!response.ok) {
      throw new Error("Failed to fetch blogs");
    }

    const storedBlogs = await response.json();
    const addNewBlogCard = blogContainer.querySelector(".post-6");

    // Clear existing blog posts (except the "add new" card)
    const existingPosts = blogContainer.querySelectorAll(".blog-card");
    existingPosts.forEach((post) => {
      if (!post.classList.contains("post-6")) {
        post.remove();
      }
    });

    // Add blogs from the database
    for (let index = 0; index < storedBlogs.length; index++) {
      const blog = storedBlogs[index];
      const newBlogPost = await createBlogPost(
        blog.heading,
        blog.subheading,
        blog.passage,
        index,
        blog.image,
        blog._id // Pass the MongoDB ID
      );
      blogContainer.insertBefore(newBlogPost, addNewBlogCard);
    }
  } catch (error) {
    console.error("Error loading blogs:", error);
  }
}

// ---------------------------------Function to fetch blog image from Unsplash-----------------//
const fetchBlogImg = async (query) => {
  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
        query
      )}&client_id=${accessKey}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    if (data.results.length === 0) {
      throw new Error("No images found");
    }

    return data.results[0].urls.regular;
  } catch (error) {
    console.error("Error fetching image:", error.message);
    return "../img/factories.png"; // Fallback image if API call fails
  }
};

// Function to share a blog to LinkedIn
function shareToLinkedIn(button) {
  const blogId = button.getAttribute("data-blog-id");
  const statusElement = document.getElementById(`status-${blogId}`);

  // Disable button and show loading state
  button.disabled = true;

  // Replace text with loader
  const originalButtonContent = button.innerHTML;
  button.innerHTML = '<div class="loader"></div>Share on LinkedIn';

  // Clear previous status
  statusElement.textContent = "";
  statusElement.className = "share-status";

  // Make API call to your backend
  fetch("http://localhost:5000/post-to-linkedin", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ blogId }),
  })
    .then((response) => {
      if (!response.ok) {
        return response.json().then((data) => {
          throw new Error(data.error || `Error: ${response.status}`);
        });
      }
      return response.json();
    })
    .then((data) => {
      // Success
      statusElement.textContent = "✓ Posted successfully!";
      statusElement.classList.add("success");

      // Disable the button permanently for this blog
      button.disabled = true;
      button.innerHTML = "Posted to LinkedIn";
    })
    .catch((error) => {
      // Restore button
      button.disabled = false;
      button.innerHTML = originalButtonContent;

      // Show error message
      statusElement.textContent = `× ${error.message || "Sharing failed"}`;
      statusElement.classList.add("error");

      // Log detailed error
      console.error("LinkedIn sharing error:", error);
    });
}

/// ----------------------------------- Create Division With Html ----------------------------//
async function createBlogPost(
  heading,
  subheading,
  passage,
  index,
  image,
  blogId
) {
  const newBlogPost = document.createElement("div");
  newBlogPost.classList.add("blog-card");
  newBlogPost.setAttribute("data-index", index);
  newBlogPost.setAttribute("data-blog-id", blogId); // Add the MongoDB ID

  newBlogPost.innerHTML = `
    <img src="${image}" alt="${heading}" />
    <img src="../img/delete.png" alt="X" id="delete-${index}" class="delete" />
    
    <div class="blog-body">
      <h5 class="blog-title">${heading}</h5>
      <p class="blog-text">${subheading}</p>
      <p class="blog-text">${passage}</p>
      <a href="blogPlaceholder.html?title=${encodeURIComponent(
        heading
      )}&subheading=${encodeURIComponent(
    subheading
  )}&message=${encodeURIComponent(passage)}"
         class="readmore-btn" >
        Read More
      </a>
      
      <!-- LinkedIn Share Button -->
      <div class="linkedin-share-container">
        <button class="linkedin-btn" data-blog-id="${blogId}" onclick="shareToLinkedIn(this)">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white">
            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
          </svg>
          Share on LinkedIn
        </button>
        <span class="share-status" id="status-${blogId}"></span>
      </div>
    </div>
  `;

  const deleteButton = newBlogPost.querySelector(".delete");
  deleteButton.addEventListener("click", () => deleteBlog(index));

  return newBlogPost;
}

// ----------------------------------- Delete blog function from database -------------------//
function deleteBlog(index) {
  // if (!userAvl) {
  //   alert("You must be logged in to delete a blog post.");
  //   return;
  // }
  // let storedBlogs = JSON.parse(localStorage.getItem("blogs")) || [];
  // if (index >= 0 && index < storedBlogs.length) {
  //   storedBlogs.splice(index, 1);
  //   localStorage.setItem("blogs", JSON.stringify(storedBlogs));
  //   // Remove the blog post from the DOM
  //   document.querySelector(`[data-index="${index}"]`).remove();
  // }
}

//--------------------------------------- open  login page or add blog page ---------------//
document.getElementById("addBlogBtn").addEventListener("click", () => {
  if (userAvl) {
    addBlogmodal.style.display = "block";
  } else {
    loginModal.style.display = "block";
  }
});

//--------------------------------------- close login page or add blog page ---------------//
closeBtn.addEventListener("click", () => {
  addBlogmodal.style.display = "none";
});
closeLoginForm.addEventListener("click", () => {
  loginModal.style.display = "none";
});

// --------------------------------Close modal on outside click---------------------------//
window.addEventListener("click", (event) => {
  if (event.target === addBlogmodal) {
    addBlogmodal.style.display = "none";
  }
  if (event.target === loginModal) {
    loginModal.style.display = "none";
  }
});

//-------------------------------------------blog form---------------------------------------//
blogForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const heading = document.getElementById("blogHeading").value;
  const subheading = document.getElementById("blogSubheading").value;
  const message = document.getElementById("blogPassage").value;

  if (!heading || !subheading || !message) {
    alert("All fields are required!");
    return;
  }

  try {
    const response = await fetch("http://localhost:5000/save-blog", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ heading, subheading, message }),
    });

    const data = await response.json();

    if (response.ok) {
      alert("Blog saved successfully!");
      // Optionally, reload or update UI
    } else {
      alert(`Error: ${data.error}`);
    }
  } catch (error) {
    console.error(error);
    alert("Failed to save blog. Try again!");
  }

  // Reset form and clear the image input
  blogForm.reset();
  document.getElementById("blogImageUpload").value = ""; // Clear the file input
  localStorage.removeItem("blogImg"); // Clear temporary image
  blogImg = null; // Reset global variable
  addBlogmodal.style.display = "none"; // Close modal after submission
  loadBlogs();
});

//Add LinkedIn share buttons to any existing blogs that don't have them
function addLinkedInShareButtonsToExistingBlogs() {
  const blogCards = document.querySelectorAll(".blog-card");

  blogCards.forEach((card) => {
    // Skip the "add new blog" card if it exists
    if (card.classList.contains("post-6")) return;

    // Get blog ID from the card's data attribute
    const blogId = card.getAttribute("data-blog-id");

    // Skip if no blog ID or already has a share button
    if (!blogId || card.querySelector(".linkedin-share-container")) return;

    // Create LinkedIn share container
    const shareContainer = document.createElement("div");
    shareContainer.className = "linkedin-share-container";

    // Create share button
    const shareButton = document.createElement("button");
    shareButton.className = "linkedin-btn";
    shareButton.setAttribute("data-blog-id", blogId);
    shareButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="16" viewBox="0 0 24 24" fill="white">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
      </svg>
      Share on Linkedn
    `;
    shareButton.onclick = function () {
      shareToLinkedIn(this);
    };

    // Create status element
    const statusElement = document.createElement("span");
    statusElement.className = "share-status";
    statusElement.id = `status-${blogId}`;

    // Append elements
    shareContainer.appendChild(shareButton);
    shareContainer.appendChild(statusElement);

    // Add to blog card
    const blogBody = card.querySelector(".blog-body");
    blogBody.appendChild(shareContainer);
  });
}

// Initialize the page
loadBlogs().then(() => {
  // Add LinkedIn buttons to any blogs that might not have them
  addLinkedInShareButtonsToExistingBlogs();
});

// ----------------------------------------Logout function ----------------------------------//
const logoutButton = document.getElementById("logout");

logoutButton.addEventListener("click", () => {
  localStorage.removeItem("loggedInUserId");
  signOut(auth)
    .then(() => {
      window.location.href = "webservicesBlog.html";
    })
    .catch((error) => {
      console.error("Error Signing out:", error);
    });
});

//------------------------------------------taking image from drive and store(local storage) it for blog -----------//
document
  .getElementById("blogImageUpload")
  .addEventListener("change", function (event) {
    const file = event.target.files[0]; // Get the selected file

    if (file) {
      const reader = new FileReader();

      reader.onload = function (e) {
        blogImg = e.target.result; // Store the selected image
        // localStorage.setItem("blogImg", blogImg); // Temporarily store in localStorage
      };

      reader.readAsDataURL(file); // Read the file as a data URL
    } else {
      // If no file is selected, clear the image
      blogImg = null;
      localStorage.removeItem("blogImg");
    }
  });

// Make shareToLinkedIn function available globally
window.shareToLinkedIn = shareToLinkedIn;
