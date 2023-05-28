// -----------------
// DOM Manipulations
// -----------------

export function showLoadingIndicator() {
	const loadingIndicator = document.querySelector(".loading-indicator");
	if (loadingIndicator) {
		loadingIndicator.style.display = "block";
	}
}

export function hideLoadingIndicator() {
	const loadingIndicator = document.querySelector(".loading-indicator");
	if (loadingIndicator) {
		loadingIndicator.style.display = "none";
	}
}

export function createModal() {
	const modal = document.createElement("div");
	modal.classList.add("modal", "hidden");

	const modalImage = document.createElement("img");
	modalImage.setAttribute("id", "modal-image");
	modalImage.setAttribute("alt", "Blog post image enlarged");

	modal.appendChild(modalImage);
	document.body.appendChild(modal);

	return modal;
}

export function createPageHeaderElement(text) {
	const header = document.createElement("h1");
	header.classList.add("page-header");
	header.textContent = text;
	return header;
}

// -----------------
// Navigation and UI Events
// -----------------

export function setupHamburgerMenu() {
	const navContainer = document.querySelector(".nav-container");
	const hamburger = document.querySelector(".hamburger");
	const navLinksWrapper = document.querySelector(".nav-links-wrapper");
	const closeButton = document.querySelector(".close-menu");
	const logoContainer = document.querySelector(".logo-container");

	const toggleMenu = () => {
		navContainer.classList.toggle("open");
		navLinksWrapper.classList.toggle("open");
		document.body.classList.toggle("open");
		logoContainer.classList.toggle("open");
	};

	hamburger.addEventListener("click", toggleMenu);
	closeButton.addEventListener("click", toggleMenu);
}

export const handleTouchEvents = (
	element,
	threshold,
	handleSwipeLeft,
	handleSwipeRight
) => {
	let touchStartX = 0;
	let touchStartY = 0;
	let touchEndX = 0;
	let touchEndY = 0;

	element.addEventListener("touchstart", (event) => {
		touchStartX = event.touches[0].clientX;
		touchStartY = event.touches[0].clientY;
	});

	element.addEventListener("touchmove", (event) => {
		touchEndX = event.changedTouches[0].clientX;
		touchEndY = event.changedTouches[0].clientY;

		// Calculate the absolute difference between X and Y
		const diffX = Math.abs(touchStartX - touchEndX);
		const diffY = Math.abs(touchStartY - touchEndY);

		// If swipe was horizontal prevent default
		if (diffX > diffY) {
			event.preventDefault();
		}
	});

	element.addEventListener("touchend", (event) => {
		touchEndX = event.changedTouches[0].clientX;
		touchEndY = event.changedTouches[0].clientY;
		handleGesture();
	});

	const handleGesture = async () => {
		if (touchStartX - touchEndX > threshold) {
			// Swiped left
			await handleSwipeLeft();
		}

		if (touchEndX - touchStartX > threshold) {
			// Swiped right
			await handleSwipeRight();
		}
	};
};

export function highlightActiveNavItem() {
	const path = window.location.pathname;
	const navItems = document.querySelectorAll(".nav-item a");

	navItems.forEach((item) => {
		const itemPath = "/" + item.getAttribute("href");

		if (itemPath === path) {
			item.classList.add("active");
		} else {
			item.classList.remove("active");
		}
	});
}

// -----------------
// Data Fetching and Handling
// -----------------

export async function fetchLatestPostsForCarousel() {
	console.log("Fetching latest posts for carousel...");
	showLoadingIndicator();
	try {
		const perPage = 12;
		const response = await fetch(
			`https://api.adakeita.dev/wp-json/wp/v2/blogpost?per_page=${perPage}`
		);

		if (!response.ok) {
			throw new Error("Failed to fetch posts for the carousel");
		}

		const data = await response.json();
		// Reverse the data to get the latest posts at the beginning
		const reversedData = data.reverse();

		// Add the posts to allPosts, but only if they're not already there
		for (const post of reversedData) {
			if (!allPosts.find((p) => p.id === post.id)) {
				allPosts.unshift(post);
			}
		}

		return reversedData;
	} catch (error) {
		console.error("Error fetching latest posts for carousel:", error);
	} finally {
		hideLoadingIndicator();
	}
}

export async function fetchAllPosts() {
	console.log("Fetching all posts...");
	showLoadingIndicator();
	try {
		const allFetchedPosts = [];
		const perPage = 100;
		let currentPage = 1;
		let reachedEnd = false;

		while (!reachedEnd) {
			const response = await fetch(
				`https://api.adakeita.dev/wp-json/wp/v2/blogpost?per_page=${perPage}&page=${currentPage}`
			);

			if (!response.ok) {
				reachedEnd = true;
				continue;
			}

			const data = await response.json();
			allFetchedPosts.push(...data);

			if (data.length < perPage) {
				reachedEnd = true;
			} else {
				currentPage++;
			}
		}

		allPosts = allFetchedPosts;
	} catch (error) {
		console.error("Error fetching all posts:", error);
	}
	console.log("Fetched all posts:", allPosts);
	hideLoadingIndicator();
}

export function getLatestPosts(startIndex = 0, perPage = 4) {
	return allPosts.slice(startIndex, startIndex + perPage).reverse();
}

export function getBlogPosts(startIndex = 0, perPage = 10) {
	console.log("Fetched all posts:", allPosts);
	return allPosts.slice(startIndex, startIndex + perPage);
}

export function getPostById(id) {
	console.log("Searching for post with ID:", id);
	return allPosts.find((post) => parseInt(post.id, 10) === id);
}

// -----------------
// Data Filtering
// -----------------

export function filterPostsByQuery(query) {
	return allPosts.filter((post) => {
		const titleMatch = post.title.rendered.toLowerCase().includes(query);
		let tagMatch = false;
		if (Array.isArray(post.acf.tag)) {
			tagMatch = post.acf.tag.some((tag) => tag.slug.toLowerCase() === query);
		}
		return titleMatch || tagMatch;
	});
}

// -----------------
// Form Validation
// -----------------

export function initContactForm() {
	const form = document.getElementById("contact-form");
	form.addEventListener("submit", function (event) {
		event.preventDefault();

		const name = document.getElementById("name").value;
		const email = document.getElementById("email").value;
		const subject = document.getElementById("subject").value;
		const message = document.getElementById("message").value;

		let nameError = "";
		let emailError = "";
		let subjectError = "";
		let messageError = "";

		if (name.length <= 5) {
			nameError = "Name should be longer than 5 characters.";
			document.getElementById("name").setAttribute("aria-describedby", "name-error");
			document.getElementById("name").setAttribute("aria-invalid", "true");
		} else {
			document.getElementById("name").removeAttribute("aria-describedby");
			document.getElementById("name").removeAttribute("aria-invalid");
		}

		if (!/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(email)) {
			emailError = "Must be a valid email address.";
			document.getElementById("email").setAttribute("aria-describedby", "email-error");
			document.getElementById("email").setAttribute("aria-invalid", "true");
		} else {
			document.getElementById("email").removeAttribute("aria-describedby");
			document.getElementById("email").removeAttribute("aria-invalid");
		}

		if (subject.length <= 15) {
			subjectError = "Subject needs to be at least 15 characters.";
			document.getElementById("subject").setAttribute("aria-describedby", "subject-error");
			document.getElementById("subject").setAttribute("aria-invalid", "true");
		} else {
			document.getElementById("subject").removeAttribute("aria-describedby");
			document.getElementById("subject").removeAttribute("aria-invalid");
		}

		if (message.length <= 25) {
			messageError = "Message has to be more than 25 characters.";
			document.getElementById("message").setAttribute("aria-describedby", "message-error");
			document.getElementById("message").setAttribute("aria-invalid", "true");
		} else {
			document.getElementById("message").removeAttribute("aria-describedby");
			document.getElementById("message").removeAttribute("aria-invalid");
		}

		document.getElementById("name-error").textContent = nameError;
		document.getElementById("email-error").textContent = emailError;
		document.getElementById("subject-error").textContent = subjectError;
		document.getElementById("message-error").textContent = messageError;

		if (!nameError && !emailError && !subjectError && !messageError) {
			alert("Form submitted successfully!");
			// Here you could add code to actually send the form data.
		}
	});
}

export function initSearchForm() {
	const searchForm = document.querySelector(".searchbox");
	searchForm.addEventListener("submit", function (event) {
		event.preventDefault();

		const searchInput = document.querySelector(".searchbox-input");
		const searchError = document.getElementById("search-error");

		if (searchInput.value.trim() === "") {
			searchError.classList.remove("hidden");
			searchError.textContent = "Please enter search";
			searchInput.setAttribute("aria-describedby", "search-error");
			searchInput.setAttribute("aria-invalid", "true");
		} else {
			searchError.textContent = "";
			searchInput.removeAttribute("aria-describedby");
			searchInput.removeAttribute("aria-invalid");
			window.location.href = `posts.html?search=${searchInput.value}`;
		}
	});
}

// -----------------
// Data Storage
// -----------------

export let allPosts = [];

//----
//COMMENTS
//-----------

export function displayComments(comments) {
	const commentsContainer = document.querySelector(".view-comments-box");

	// check comments is array
	if (!Array.isArray(comments)) {
		console.error("displayComments: comments is not an array");
		return;
	}

	// Reset comments container
	commentsContainer.innerHTML = "";

	if (comments.length === 0) {
		commentsContainer.innerHTML = "<p>No comments yet.</p>";
		commentsContainer.classList.add("no-comments");
		return;
	}

	comments.forEach((comment) => {
		const commentHTML = `
		<div class="comment">
		  <p><strong>${comment.author_name}:</strong> ${comment.content.rendered}</p>
		</div>
	  `;

		commentsContainer.insertAdjacentHTML("beforeend", commentHTML);
	});
}

export async function fetchCommentsForPost(postId) {
	const response = await fetch(
		`https://api.adakeita.dev/wp-json/wp/v2/comments?post=${postId}`
	);
	const data = await response.json();
	return data;
}

export function handleCommentsForPost(postId) {
	// Fetch and display comments on load
	fetchCommentsForPost(postId).then(displayComments);

	// Handle form submission
	const commentForm = document.getElementById("comment-form");

	commentForm.addEventListener("submit", async (event) => {
		event.preventDefault();

		const author_name = document.getElementById("author_name").value;
		const email = document.getElementById("email").value;
		const comment = document.getElementById("comment").value;

		// Check for empty values before sending
		if (author_name && email && comment) {
			await postComment(postId, author_name, email, comment);
			document.getElementById("author_name").value = "";
			document.getElementById("email").value = "";
			document.getElementById("comment").value = "";
			const comments = await fetchCommentsForPost(postId);
			displayComments(comments);
		}
	});
}

export async function postComment(postId, author_name, email, comment) {
	try {
		const response = await fetch(`https://api.adakeita.dev/wp-json/wp/v2/comments`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: "Basic " + btoa("adakeita:qtR6 rLjU hy1Q cmgx Kpb1 oS5y"),
			},
			body: JSON.stringify({
				post: postId,
				author_name,
				author_email: email,
				content: comment,
			}),
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();
		console.log(data);
	} catch (error) {
		console.log(error);
	}
}
