import { login, logout, isAuthenticated, getAccessToken, submitComment } from "./auth";

export async function setupLoginButton() {
	const loginButton = document.getElementById("login");
	loginButton.addEventListener("click", async () => {
		const currentUrl = window.location.href;
		login(currentUrl);
	});
}

export async function setupLogoutButton() {
	const logoutButton = document.getElementById("logout");
	logoutButton.addEventListener("click", async () => {
		logout();
	});
}

export async function setupSubmitCommentButton(postId) {
	const commentForm = document.getElementById("comment-form");

	commentForm.addEventListener("submit", async (event) => {
		event.preventDefault();

		const isLoggedIn = await isAuthenticated();
		if (!isLoggedIn) {
			const currentUrl = window.location.href;
			login(currentUrl);
			return;
		}

		const userProfile = await getUserProfile();

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
