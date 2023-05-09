let auth0 = null;

async function initAuth0() {
	auth0 = await createAuth0Client({
		domain: "dev-2alcwci351nap0te.us.auth0.com",
		client_id: "vvCTbVE4dXvicqedJbOgFrdP2DsdDh8a",
		redirect_uri: window.location.origin,
	});
}

async function login(redirectUri, additionalRedirectParams = "", onLogin) {
	const appState = {
		onLogin,
	};

	await auth0.loginWithRedirect({
		redirect_uri: redirectUri + additionalRedirectParams,
		appState,
	});
}

async function handleRedirectCallback() {
	const isAuthenticated = await auth0.isAuthenticated();

	if (!isAuthenticated && window.location.search.includes("code=")) {
		const result = await auth0.handleRedirectCallback();
		if (result && result.appState && result.appState.onLogin) {
			result.appState.onLogin();
		}
	}
}

async function logout() {
	await auth0.logout({
		returnTo: window.location.origin,
	});
}

async function isAuthenticated() {
	return await auth0.isAuthenticated();
}

async function getUserProfile() {
	return await auth0.getUser();
}

async function getAccessToken() {
	const accessToken = await auth0.getTokenSilently();
	return accessToken;
}

export {
	initAuth0,
	login,
	handleRedirectCallback,
	logout,
	isAuthenticated,
	getUserProfile,
	getAccessToken,
};
