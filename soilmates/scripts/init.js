import {
	displayComments,
	fetchAllPosts,
	getBlogPosts,
	fetchCommentsForPost,
	getPostById,
	filterPostsByQuery,
	setupHamburgerMenu,
	handleCommentsForPost,
	initContactForm,
	initSearchForm,
	highlightActiveNavItem,
} from "./utils.js";
import { setupCarousel } from "./carousel.js";
import { displayBlogPost, displayBlogList, loadBlogPosts } from "./blogposts.js";

document.addEventListener("DOMContentLoaded", async () => {
	setupHamburgerMenu();
	highlightActiveNavItem();
	await fetchAllPosts();

	if (
		window.location.pathname.includes("index.html") ||
		window.location.pathname === "/"
	) {
		setupCarousel();
		initSearchForm();
	} else if (window.location.pathname.includes("posts.html")) {
		// Parse the search query
		const urlParams = new URLSearchParams(window.location.search);
		const searchQuery = urlParams.get("search");

		let posts;

		// If there is a search query, filter the posts
		if (searchQuery) {
			posts = filterPostsByQuery(searchQuery);
		} else {
			// If there is no search query, display all posts as usual
			posts = await loadBlogPosts();
		}

		if (posts && posts.length === 0) {
			// Display "No results"
			const postsContainer = document.querySelector(".blog-list-container");
			postsContainer.innerHTML = "<p>No results.</p>";
		}

	} else if (window.location.pathname.includes("blogpost.html")) {
		const postId = window.location.search.split("=")[1]; // Get the post ID from the URL
		const post = getPostById(postId); // Get the blog post using the ID
		displayBlogPost(post); // Display blog post

		const comments = await fetchCommentsForPost(postId); // Fetch comments
		displayComments(comments);

		handleCommentsForPost(postId); //comment form event listener
	} else if (window.location.pathname.includes("contact.html")) {
		initContactForm();
	}
});
