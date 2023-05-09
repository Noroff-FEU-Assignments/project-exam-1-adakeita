let auth0Client;

// Initialize Auth0 client
export async function initAuth0() {
	auth0Client = await createAuth0Client({
		domain: "dev-2alcwci351nap0te.us.auth0.com",
		client_id: "vvCTbVE4dXvicqedJbOgFrdP2DsdDh8a",
		redirect_uri: window.location.origin,
	});

	// Handle redirect
	if (window.location.search.includes("code=")) {
		try {
			await auth0Client.handleRedirectCallback();
			window.history.replaceState({}, document.title, "/");
		} catch (error) {
			console.error("Error handling redirect callback:", error);
		}
	}
}

// Function to log in
export const login = async () => {
  try {
    const currentUrl = window.location.href;
    await auth0Client.loginWithRedirect({
      redirect_uri: currentUrl,
    });
  } catch (error) {
    console.error("Error during login:", error);
  }
};

// Function to log out
export async function logout() {
	await auth0Client.logout({
		returnTo: window.location.origin,
	});
}

//check if user is authenticated
export async function isAuthenticated() {
	return await auth0Client.isAuthenticated();
}

// get user profile
export async function getUserProfile() {
	return await auth0Client.getUser();
}

//get access token
export async function getAccessToken() {
	return await auth0Client.getTokenSilently();
}

export async function submitComment(postId, commentContent, userToken, authorName) {
	const response = await fetch(`https://api.adakeita.dev/wp-json/wp/v2/comments`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${userToken}`,
		},
		body: JSON.stringify({
			content: commentContent,
			post: postId,
			author_name: authorName,
		}),
	});
}
