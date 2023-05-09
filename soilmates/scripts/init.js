import {
	displayComments,
	fetchAllPosts,
	getBlogPosts,
	fetchCommentsForPost,
	getPostById,
} from "./utils.js";
import { setupCarousel } from "./carousel.js";
import {
	displayBlogPost,
	displayBlogList,
	loadBlogPosts,
	moveImageContainer,
} from "./blogposts.js";
import {
	initAuth0,
	submitComment,
	isAuthenticated,
	getUserProfile,
	login,
} from "./auth.js";

window.addEventListener("resize", moveImageContainer);

document.addEventListener("DOMContentLoaded", async () => {
	await fetchAllPosts();
	await initAuth0();

	const loginButton = document.getElementById("login");
	const logoutButton = document.getElementById("logout");

	loginButton.addEventListener("click", async () => {
		const currentUrl = window.location.href;
		await login(currentUrl);
	});

	logoutButton.addEventListener("click", async () => {
		await logout();
	});

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
		const commentForm = document.getElementById("comment-form");

		commentForm.addEventListener("submit", async (event) => {
			event.preventDefault();

			const isLoggedIn = await isAuthenticated();
			if (!isLoggedIn) {
				const currentUrl = window.location.href;
				login(currentUrl);
				return;
			}

			const userProfile = await getUserProfile(); // user's profile Auth0

			const authorNameInput = document.getElementById("author_name");
			const commentInput = document.getElementById("comment");

			const authorName = authorNameInput.value;
			const commentContent = commentInput.value;

			try {
				const userToken = await getAccessToken();
				await submitComment(postId, commentContent, userToken, authorName);
				alert("Comment submitted successfully!");

				authorNameInput.value = "";
				commentInput.value = "";
			} catch (error) {
				console.error("Error submitting comment:", error);
				alert("Failed to submit the comment. Please try again.");
			}
		});
	}
});
