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
import { displayBlogPost, displayBlogList, setupViewMoreButton } from "./blogposts.js";

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
			document.getElementById("view-more-button").classList.add("hidden");
		} else {
			// If there is no search query, display all posts as usual
			posts = getBlogPosts();
			document.getElementById("view-more-button").classList.remove("hidden");
		}

		if (posts && posts.length === 0) {
			// Display "No results"
			const postsContainer = document.querySelector(".bloglist-wrapper");
			postsContainer.innerHTML = "<p class='no-results'>No results.</p>";
		} else {
			// Display the posts
			displayBlogList(posts);
			// Load more posts when the "View More" button is clicked
			setupViewMoreButton(posts);
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
