// Import the functions you need from the SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();

// Login event listener
document.getElementById("login").addEventListener("click", (event) => {
  event.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      localStorage.setItem("loggedInUserId", user.uid);
      alert("Login Successful");
      window.location.href = "webservicesBlog.html"; // Redirect after successful login
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error(errorCode, errorMessage);
      alert("Login failed: " + errorMessage);
    });
});

// Signup event listener
document.getElementById("signUp").addEventListener("click", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    console.log("Signup successful");
    window.location.href = "webservicesBlog.html"; // Redirect after successful signup
  } catch (error) {
    console.error("Signup error:", error.message);
    if (error.code === "auth/email-already-in-use") {
      alert("Email is already registered. Please try logging in instead.");
    } else {
      alert("Signup failed: " + error.message);
    }
  }
});
