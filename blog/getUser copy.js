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

// // ----------------------------------- database mongodb -----------------------------------//
// async function loadBlogs() {
//   const storedBlogs = JSON.parse(localStorage.getItem("blogs")) || [];
//   const addNewBlogCard = blogContainer.querySelector(".post-6");

//   for (let index = 0; index < storedBlogs.length; index++) {
//     const blog = storedBlogs[index];
//     const newBlogPost = await createBlogPost(
//       blog.heading,
//       blog.subheading,
//       blog.passage,
//       index,
//       blog.image // Load the saved image correctly
//     );
//     blogContainer.insertBefore(newBlogPost, addNewBlogCard);
//   }
// }
// function saveBlogToLocalStorage(heading, subheading, passage, image) {
//   const storedBlogs = JSON.parse(localStorage.getItem("blogs")) || [];

//   storedBlogs.unshift({ heading, subheading, passage, image }); // Store image along with the blog
//   localStorage.setItem("blogs", JSON.stringify(storedBlogs));

//   // Clear temp image after saving
// }

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

/// ----------------------------------- Create Division With Html ----------------------------//
async function createBlogPost(heading, subheading, passage, index, image) {
  const newBlogPost = document.createElement("div");
  newBlogPost.classList.add("blog-card");
  newBlogPost.setAttribute("data-index", index);

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
         class="btn btn-primary mt-auto">
        Read More
      </a>
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
  const passage = document.getElementById("blogPassage").value;

  // Check if an image is uploaded from the computer
  let storedImage = localStorage.getItem("blogImg");

  // If no image is uploaded, fetch an image from Unsplash
  if (!storedImage) {
    const query = heading || "technology"; // Use the blog heading as the query or a default query
    storedImage = await fetchBlogImg(query); // Fetch image from Unsplash
  }

  const index = localStorage.getItem("blogs")
    ? JSON.parse(localStorage.getItem("blogs")).length
    : 0;

  const newBlogPost = await createBlogPost(
    heading,
    subheading,
    passage,
    index,
    storedImage // Pass the correct image
  );
  const addNewBlogCard = blogContainer.querySelector(".post-6");
  blogContainer.insertBefore(newBlogPost, addNewBlogCard);

  saveBlogToLocalStorage(heading, subheading, passage, storedImage); // Save blog & image

  // Reset form and clear the image input
  blogForm.reset();
  document.getElementById("blogImageUpload").value = ""; // Clear the file input
  localStorage.removeItem("blogImg"); // Clear temporary image
  blogImg = null; // Reset global variable
  addBlogmodal.style.display = "none"; // Close modal after submission
});
// Load existing blogs on page load
loadBlogs();

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
        localStorage.setItem("blogImg", blogImg); // Temporarily store in localStorage
      };

      reader.readAsDataURL(file); // Read the file as a data URL
    } else {
      // If no file is selected, clear the image
      blogImg = null;
      localStorage.removeItem("blogImg");
    }
  });
