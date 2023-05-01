function showLoadingIndicator() {
	const loadingIndicator = document.querySelector(".loading-indicator");
	if (loadingIndicator) {
		loadingIndicator.style.display = "block";
	}
}

function hideLoadingIndicator() {
	const loadingIndicator = document.querySelector(".loading-indicator");
	if (loadingIndicator) {
		loadingIndicator.style.display = "none";
	}
}

async function displayBlogPost() {
	showLoadingIndicator();

	const titleElement = document.querySelector(".page-header");
	const contentElement = document.querySelector(".page-text-container");
	const blogPostWrapper = document.querySelector(".blogpost-wrapper");

	const postId = parseInt(new URLSearchParams(window.location.search).get("id"));
	const post = await getBlogPostById(postId);

	if (post) {
		const postData = post.acf;
		const postImage = postData["post-image"];

		titleElement.innerHTML = postData["post-title"];
		contentElement.innerHTML = `
      <div class="blogpost-img-wrapper">
        <img src="${postImage}" alt="Blog post image">
      </div>
      <div class="blogpost-container">
        <p>${postData["blog-text"].replace(/\r\n/g, "</p><p>")}</p>
      </div>
    `;
	} else {
		titleElement.innerHTML = "Post not found";
		contentElement.innerHTML =
			"<p>We couldn't find the post you're looking for. Please go back and try again.</p>";
	}

	hideLoadingIndicator();
}
