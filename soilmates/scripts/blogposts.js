import {
	getBlogPosts,
	showLoadingIndicator,
	hideLoadingIndicator,
	getPostById,
	createModal,
	createPageHeaderElement,
} from "./utils.js";

export function setupViewMoreButton() {
	const viewMoreButton = document.getElementById("view-more-button");
	let startIndex = 0;
	const postsPerPage = 10;

	viewMoreButton.addEventListener("click", async () => {
		startIndex += postsPerPage;
		const newPosts = await loadBlogPosts(startIndex, postsPerPage);
		console.log(newPosts);
		// Check if there are more posts to load after this batch
		if ((newPosts || []).length < postsPerPage) {
			viewMoreButton.classList.add("hidden");
		} else {
			viewMoreButton.classList.remove("hidden");
		}
		// Display the new posts
		if (newPosts && newPosts.length > 0) {
			displayBlogList(newPosts);
		}
	});
}

export async function loadBlogPosts(startIndex = 0, perPage = 10) {
	try {
		showLoadingIndicator();
		const posts = getBlogPosts(startIndex, perPage);
		console.log("Blog posts to display:", posts);
		displayBlogList(posts);

		// Setup the "View more" button
		setupViewMoreButton();

	} catch (error) {
		console.error("Error loading blog posts:", error);
	} finally {
		hideLoadingIndicator();
	}
}

export function displayBlogList(posts) {
	showLoadingIndicator();
	const postsContainer = document.querySelector(".bloglist-posts");

	posts.forEach((post) => {
		const postTitle = post.acf["post-title"];
		const postTagline = post.acf["tagline"];
		const postDate = new Date(post.date);
		const formattedDate = `${postDate.getDate().toString().padStart(2, "0")}/${(
			postDate.getMonth() + 1
		)
			.toString()
			.padStart(2, "0")}/${postDate.getFullYear().toString().substr(-2)}`;
		const postExcerpt = post.acf["blog-text"].substring(0, 100) + "...";
		const postId = post.id;
		const postImage = post.acf["post-image"];
		const postURL = "blogpost.html?id=" + postId;

		const postHTML = `
		<div class="blog-post" style="background-image: url('${postImage}');" onclick="location.href='${postURL}'" role="link" aria-label="Read blog post: ${postTitle}">
                <div class="blogpost-stylingwrapper">
                    <div class="blog-post-content ">
                        <div class="index-headers">
                            <h2 class="blogtitle-list ">${postTitle}</h2>
                            <p class="date">${formattedDate}</p>
                        </div>
                        <p class="tagline">${postTagline}</p>
                    </div>
                <div>
            </div>
        `;

		postsContainer.insertAdjacentHTML("beforeend", postHTML);
	});
	hideLoadingIndicator();
}

export function createBlogPostContainerElement() {
	const blogPostContainer = document.createElement("div");
	blogPostContainer.classList.add("blogpost-container");
	return blogPostContainer;
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
		const blogText = post.content.rendered;
		const postTitle = postData["post-title"];
		const postTagline = postData["tagline"];
		const postIntro = postData["intro"];

		const pageHeader = createPageHeaderElement(postTitle);
		contentContainer.insertBefore(pageHeader, blogPostWrapper);
		pageHeader.classList.add("blogpost-header");
		pageHeader.classList.add("header-styling");

		const blogPostContainer = createBlogPostContainerElement();
		const blogPostContent = createBlogPostContent(postData);
		blogPostContainer.innerHTML += blogPostContent;

		const blogpostImg = blogPostContainer.querySelector(".blogpost-img");
		blogpostImg.setAttribute("aria-label", "Open image in modal");

		const modalImage = modal.querySelector("#modal-image");

		// Open the modal when image is clicked
		blogpostImg.addEventListener("click", () => {
			modalImage.src = postData["post-image"];
			modal.classList.remove("hidden");
		});

		// Close the modal when clicking outside
		modal.addEventListener("click", (event) => {
			if (event.target !== modalImage) {
				modal.classList.add("hidden");
			}
		});

		const blogpostImgs = blogPostContainer.querySelectorAll(".blogpost-img");

		blogpostImgs.forEach((img) => {
			img.addEventListener("click", () => {
				modalImage.src = img.src;
				modal.classList.remove("hidden");
			});
		});

		blogPostWrapper.appendChild(blogPostContainer);
	} else {
		displayNotFoundMessage(blogPostWrapper);
	}

	hideLoadingIndicator();
}

function createBlogPostContent(postData) {
	const {
		"post-image": postImage,
		tagline: tagline,
		intro,
		"blog-text": blogText,
		summary,
		conclusion,
		"postimg-1": postImg1,
		"postimg-2": postImg2,
		"postimg-3": postImg3,
	} = postData;

	return `
        <div class="blogpost-summary-img-wrapper">
            <div class="blogpost-summary-container">
                <p class="blogpost-summary">${summary}</p>
            </div>
            <div class="blogpost-img-container">
                <img class="blogpost-img" src="${postImage}" alt="Blog post image">
            </div>
        </div>
        <div class="blogpost-tagline-intro-wrapper">
            <h2 class="blogpost-tagline small-header">${tagline}</h2>
            <p class="blogpost-intro ">${intro}</p>
        </div>
        <div class="blogpost-text-container ">
            <p class="blogpost-text">${blogText.replace(/\r\n/g, "</p><p class>")}</p>
        </div>
        <div class="blogpost-imgs-wrapper">
            <div class="blogpost-imgs-container">
                <img class="blogpost-img" src="${postImg1}" alt="Blog post image 1">
            </div>
            <div class="blogpost-imgs-container">
                <img class="blogpost-img" src="${postImg2}" alt="Blog post image 2">
            </div>
            <div class="blogpost-imgs-container">
                <img class="blogpost-img" src="${postImg3}" alt="Blog post image 3">
            </div>
        </div>
        <div class="blogpost-conclusion-container">
            <p class="blogpost-conclusion">${conclusion}</p>
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
