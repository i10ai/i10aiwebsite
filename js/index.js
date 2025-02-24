function onload() {
  let y = 0;

  const x = setInterval(() => {
    document.getElementById("electrification").innerHTML = y + "%";
    document.getElementById("electrification").style.width = y + "%";
    y = y + 1;
    if (y == 80) {
      clearInterval(x);
    }
  }, 80);

  let b = 0;

  const a = setInterval(() => {
    document.getElementById("employment").innerHTML = b + "%";
    document.getElementById("employment").style.width = b + "%";
    b = b + 1;
    if (b == 40) {
      clearInterval(a);
    }
  }, 40);

  let q = 0;

  const p = setInterval(() => {
    document.getElementById("educational").innerHTML = q + "%";
    document.getElementById("educational").style.width = q + "%";
    q = q + 1;
    if (q == 60) {
      clearInterval(p);
    }
  }, 60);

  let n = 0;
  const m = setInterval(() => {
    document.getElementById("empowerment").innerHTML = n + "%";
    document.getElementById("empowerment").style.width = n + "%";
    n = n + 1;
    if (n == 70) {
      clearInterval(m);
    }
  }, 70);
}

function setActive(clickedElement) {
  // Remove 'active' class from all <a> elements
  const allLinks = document.querySelectorAll(".dropdown-item");
  allLinks.forEach((link) => link.classList.remove("active"));

  // Add 'active' class to the clicked element
  clickedElement.classList.add("active");
}
