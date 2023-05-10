export let allPosts = [];

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

export async function fetchAllPosts() {
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

export async function fetchCommentsForPost(postId) {
	const response = await fetch(
		`https://api.adakeita.dev/wp-json/wp/v2/comments?post=${postId}`
	);
	const data = await response.json();
	return data;
}

export function displayComments(comments) {
	const commentsContainer = document.querySelector(".comments-container");

	// check comments is array
	if (!Array.isArray(comments)) {
		console.error("displayComments: comments is not an array");
		return;
	}

	if (comments.length === 0) {
		commentsContainer.innerHTML = "<p>No comments yet.</p>";
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

// utils.js
function validateContactForm(event) {
    event.preventDefault();

    // Get input values
    let name = document.getElementById('name').value;
    let email = document.getElementById('email').value;
    let subject = document.getElementById('subject').value;
    let message = document.getElementById('message').value;

    // Clear previous error messages
    document.getElementById('nameError').innerHTML = "";
    document.getElementById('emailError').innerHTML = "";
    document.getElementById('subjectError').innerHTML = "";
    document.getElementById('messageError').innerHTML = "";

    // Validate input
    let isValid = true;

    if (name.length < 5) {
        isValid = false;
        document.getElementById('nameError').innerHTML = "Name must be more than 5 characters long.";
    }

    let emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
    if (!email.match(emailPattern)) {
        isValid = false;
        document.getElementById('emailError').innerHTML = "Must be a valid email address.";
    }

    if (subject.length < 15) {
        isValid = false;
        document.getElementById('subjectError').innerHTML = "Subject must be more than 15 characters long.";
    }

    if (message.length < 25) {
        isValid = false;
        document.getElementById('messageError').innerHTML = "Message must be more than 25 characters long.";
    }

    if (isValid) {
        // If input is valid
        console.log("Form is valid, sending data...");
    }
}

export { validateContactForm };
