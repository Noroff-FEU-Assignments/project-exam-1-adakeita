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

window.addEventListener("resize", moveImageContainer);

document.addEventListener("DOMContentLoaded", async () => {
	await fetchAllPosts();

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

	}
});
