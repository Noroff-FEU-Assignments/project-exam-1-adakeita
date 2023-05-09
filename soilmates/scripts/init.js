import {
	displayComments,
	fetchAllPosts,
	getBlogPosts,
	fetchCommentsForPost,
	getPostById,
	submitComment,
} from "./utils.js";
import { setupCarousel } from "./carousel.js";
import {
	displayBlogPost,
	displayBlogList,
	loadBlogPosts,
	moveImageContainer,
} from "./blogposts.js";
import { initAuth0, isAuthenticated,} from "./auth.js";
import {
	setupLoginButton,
	setupLogoutButton,
	setupSubmitCommentButton,
} from "./buttonhandlers";

window.addEventListener("resize", moveImageContainer);

document.addEventListener("DOMContentLoaded", async () => {
	await fetchAllPosts();
	const currentUrl = window.location.href;
	initAuth0(currentUrl);

	console.log("User authenticated:", await isAuthenticated());

	setupLoginButton();
	setupLogoutButton();

	if (
		window.location.pathname.includes("index.html") ||
		window.location.pathname === "/"
	) {
		setupCarousel();
	} else if (window.location.pathname.includes("posts.html")) {
		const posts = getBlogPosts();
		displayBlogList(posts);
		const viewMoreButton = document.getElementById("view-more-button");
		let startIndex = 0;
		const postsPerPage = 10;

		viewMoreButton.addEventListener("click", async () => {
			startIndex += postsPerPage;
			await loadBlogPosts(startIndex, postsPerPage);
		});
	} else if (window.location.pathname.includes("blogpost.html")) {
		const postId = window.location.search.split("=")[1]; // Get the post ID from URL
		const post = getPostById(postId); // Get the blog post ID
		displayBlogPost(post); // Display blog post

		const comments = await fetchCommentsForPost(postId); // Fetch comments
		displayComments(comments);

		setupSubmitCommentButton(postId);
	}
});
