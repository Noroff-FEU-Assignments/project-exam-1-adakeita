import {
	displayComments,
	fetchAllPosts,
	getBlogPosts,
	fetchCommentsForPost,
	getPostById,
	filterPostsByQuery,
} from "./utils.js";
import { setupCarousel } from "./carousel.js";
import {
	displayBlogPost,
	displayBlogList,
	loadBlogPosts,
} from "./blogposts.js";
import {
	setupLoginButton,
	setupLogoutButton,
	setupSubmitCommentButton,
} from "./buttonhandlers.js";
import { handleRedirectCallback, initAuth0 } from "./auth.js";


document.addEventListener("DOMContentLoaded", async () => {
	await initAuth0();
	await fetchAllPosts();
	await handleRedirectCallback();

	if (
		window.location.pathname.includes("index.html") ||
		window.location.pathname === "/"
	) {
		setupCarousel();
		setupLoginButton();
		setupLogoutButton();
	}
	else if (window.location.pathname.includes("posts.html")) {
		// Parse the search query
		const urlParams = new URLSearchParams(window.location.search);
		const searchQuery = urlParams.get('search');

		let posts;

		// If there is a search query, filter the posts
		if (searchQuery) {
			posts = filterPostsByQuery(searchQuery);
		} else {
			// If there is no search query, display all posts as usual
			posts = getBlogPosts();
		}

		if (posts.length === 0) {
			// Display "No results"
			const postsContainer = document.querySelector(".blog-list-container");
			postsContainer.innerHTML = "<p>No results.</p>";
		} else {
			// Display the posts
			displayBlogList(posts);
		}

		const viewMoreButton = document.getElementById("view-more-button");
		let startIndex = 0;
		const postsPerPage = 10;

		// Show or hide "View More" button based on the number of posts
		if (posts.length < postsPerPage) {
			viewMoreButton.classList.add("hidden");
		} else {
			viewMoreButton.classList.remove("hidden");
		}

		viewMoreButton.addEventListener("click", async () => {
			startIndex += postsPerPage;
			const newPosts = await loadBlogPosts(startIndex, postsPerPage);
			// Check if there are more posts to load after this batch
			if (newPosts.length < postsPerPage) {
				viewMoreButton.classList.add("hidden");
			}
		});
	}
	else if (window.location.pathname.includes("blogpost.html")) {
		const postId = window.location.search.split("=")[1]; // Get the post ID from the URL
		const post = getPostById(postId); // Get the blog post using the ID
		displayBlogPost(post); // Display the blog post

		const comments = await fetchCommentsForPost(postId); // Fetch comments for the blog post
		displayComments(comments);

		setupSubmitCommentButton(postId);
	}
});
