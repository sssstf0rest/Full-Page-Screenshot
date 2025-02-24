document.addEventListener("DOMContentLoaded", function () {
    // Get the base64 image from URL parameters
    const params = new URLSearchParams(window.location.search);
    let imgSrc = params.get("src");

    if (imgSrc) {
        imgSrc = decodeURIComponent(imgSrc); // Decode special characters
        document.getElementById("screenshot").src = imgSrc;
    } else {
        document.body.innerHTML = "<h2>Failed to load screenshot.</h2>";
    }
});
