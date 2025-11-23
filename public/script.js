document.getElementById("shortenBtn").addEventListener("click", async () => {
  const urlInput = document.getElementById("urlInput").value;

  const res = await fetch("http://localhost:3000/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: urlInput }),
  });

  const data = await res.json();

  if (!data.code) {
    alert("Error creating short link");
    return;
  }

  // Set short URL
  const shortUrl = `http://localhost:3000/${data.code}`;
  const linkElement = document.getElementById("shortLink");

  linkElement.href = shortUrl;
  linkElement.textContent = shortUrl;

  document.getElementById("result").classList.remove("hidden");
});


// Copy to clipboard
document.getElementById("copyBtn").addEventListener("click", () => {
  const link = document.getElementById("shortLink").textContent;
  navigator.clipboard.writeText(link);
  alert("Copied to clipboard!");
});
