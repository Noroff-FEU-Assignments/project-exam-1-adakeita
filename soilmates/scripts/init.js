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
		const postId = window.location.search.split("=")[1]; // Get the post ID from the URL
		const post = getPostById(postId); // Get the blog post using the ID
		displayBlogPost(post); // Display the blog post

		const comments = await fetchCommentsForPost(postId); // Fetch comments for the blog post
		displayComments(comments);
		const commentForm = document.getElementById("comment-form");

		commentForm.addEventListener("submit", async (event) => {
			event.preventDefault();

			if (!(await isAuthenticated())) {
				if (
					confirm("You need to be logged in to post a comment. Would you like to log in?")
				) {
					login(); // login from auth.js
				}
				return;
			}

			const userProfile = await getUserProfile(); // user's profile Auth0

			const authorNameInput = document.getElementById("author_name");
			const commentInput = document.getElementById("comment");

			const authorName = authorNameInput.value;
			const commentContent = commentInput.value;

			try {
				await submitComment(postId, commentContent, userProfile.sub, authorName);
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
