import {
	getBlogPosts,
	showLoadingIndicator,
	hideLoadingIndicator,
	getPostById,
} from "./utils.js";

export function displayBlogList(posts) {
	const blogPostsContainer = document.querySelector(".blog-list-container");

	posts.forEach((post) => {
		const postTitle = post.acf["post-title"];
		const postTagline = post.acf["tagline"];
		const postDate = new Date(post.date);
		const formattedDate = `${postDate.getDate().toString().padStart(2, '0')}/${(postDate.getMonth() + 1).toString().padStart(2, '0')}/${postDate.getFullYear().toString().substr(-2)}`;
		const postExcerpt = post.acf["blog-text"].substring(0, 100) + "...";
		const postId = post.id;
		const postImage = post.acf["post-image"];

		const postHTML = `
            <a class="post-redirect" href="blogpost.html?id=${postId}">
                <div class="blog-post" style="background-image: url('${postImage}');">
                    <div class="blogpost-stylingwrapper">
                        <div class="blog-post-content content-font">
                            <h2 class="blogtitle-list">${postTitle}</h2>
                            <p class="tagline">${postTagline}</p>
                            <p class="date">${formattedDate}</p>
                        </div>
                    <div>
                </div>
            </a>
        `;

		blogPostsContainer.insertAdjacentHTML("beforeend", postHTML);
	});
}



export async function loadBlogPosts(startIndex = 0, perPage = 10) {
	try {
		showLoadingIndicator();
		const posts = getBlogPosts(startIndex, perPage);
		console.log("Blog posts to display:", posts);
		displayBlogList(posts);
	} catch (error) {
		console.error("Error loading blog posts:", error);
	} finally {
		hideLoadingIndicator();
	}
}

export function createPageHeaderElement(text) {
	const header = document.createElement("h1");
	header.classList.add("page-header");
	header.textContent = text;
	return header;
}

export function createBlogPostContainerElement() {
	const blogPostContainer = document.createElement("div");
	blogPostContainer.classList.add("blogpost-container");
	return blogPostContainer;
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

export async function displayBlogPost() {
	showLoadingIndicator();

	const contentContainer = document.querySelector(".content-container");
	const blogPostWrapper = document.querySelector(".blogpost-wrapper");

	const postId = parseInt(new URLSearchParams(window.location.search).get("id"));
	const post = await getPostById(postId);
	const modal = createModal();

	if (post) {
		const postData = post.acf;
		const postImage = postData["post-image"];
		const postTitle = postData["post-title"];
		const postTagline = postData["tagline"];

		const headerTaglineContainer = document.createElement('div');
		headerTaglineContainer.classList.add('header-tagline-container');
		headerTaglineContainer.innerHTML = `
            <h1 class="blogpost-title">${postTitle}</h1>
            <p class="blogpost-tagline">${postTagline}</p>
        `;
		contentContainer.insertBefore(headerTaglineContainer, blogPostWrapper);

		const blogPostContainer = createBlogPostContainerElement();
		const blogPostContent = createBlogPostContent(postData["blog-text"], postImage);
		blogPostContainer.innerHTML += blogPostContent;

		const blogpostImg = blogPostContainer.querySelector(".blogpost-img");

		const modalImage = modal.querySelector("#modal-image");

		// Open the modal when image is clicked
		blogpostImg.addEventListener("click", () => {
			modalImage.src = postImage;
			modal.classList.remove("hidden");
		});

		// Close the modal when clicking outside
		modal.addEventListener("click", (event) => {
			if (event.target !== modalImage) {
				modal.classList.add("hidden");
			}
		});

		blogPostWrapper.appendChild(blogPostContainer);
		moveImageContainer();
	} else {
		displayNotFoundMessage(blogPostWrapper);
	}

	hideLoadingIndicator();
}



export function moveImageContainer() {
	const blogPostContentWrapper = document.querySelector(".blogpost-content-wrapper");
	const textContainer = document.querySelector(".blogpost-text-container");
	const imgContainer = document.querySelector(".blogpost-img-container");
	const mediaContainer =
		document.querySelector(".blogpost-media-container") || document.createElement("div");

	if (window.innerWidth < 760) {
		if (!mediaContainer.classList.contains("blogpost-media-container")) {
			mediaContainer.classList.add("blogpost-media-container");
			blogPostContentWrapper.appendChild(mediaContainer);
		}
		mediaContainer.appendChild(textContainer);
		mediaContainer.appendChild(imgContainer);
	} else {
		if (mediaContainer.classList.contains("blogpost-media-container")) {
			mediaContainer.remove();
			blogPostContentWrapper.appendChild(textContainer);
			blogPostContentWrapper.appendChild(imgContainer);
		}
	}
}

function createBlogPostContent(blogText, postImage) {
	return `
        <div class="blogpost-content-wrapper">
            <div class="blogpost-text-container">
                <p class="blogpost-text">${blogText.replace(/\r\n/g, "</p><p>")}</p>
            </div>
            <div class="blogpost-img-container">
                <img class="blogpost-img" src="${postImage}" alt="Blog post image">
            </div>
        </div>
    `;
}


function displayNotFoundMessage(headerContent) {
	const titleElement = createPageHeaderElement("Post not found");
	headerContent.appendChild(titleElement);

	const blogPostWrapper = document.querySelector(".blogpost-wrapper");

	const blogPostContainer = createBlogPostContainerElement();
	blogPostContainer.innerHTML =
		"<p>We couldn't find the post you're looking for. Please go back and try again.</p>";
	blogPostWrapper.appendChild(blogPostContainer);
}
