import {
	fetchAllPosts,
	allPosts,
	handleTouchEvents,
	fetchLatestPostsForCarousel,
} from "./utils.js";

const carouselContainer = document.querySelector(".carousel-container");
let leftArrow;
let rightArrow;
let currentStartIndex = 0;
let firstLoad = true;
const POSTS_PER_PAGE = 4;

const createMainLatestPost = (post) => `
  <div class="main-latest-post">
    <div class="latest-index-text-container">
      <p class="index-post-header content-font">${post.acf["post-title"]}</p>
      <p class="latest-index-text content-font">
        ${post.acf["blog-text"].substring(0, 100)}...
        <br>
        <p class="readmore-container">
          <a class="read-more-link" href="blogpost.html?id=${post.id}">Read More</a>
        </p>
      </p>
    </div>
    <div class="latest-index-image-container">
      <img class="latest-index-img" src="${post.acf["post-image"]}" alt="${
	post.acf["post-title"]
}">
    </div>
  </div>
`;

const createPreviousPostContainer = (posts) => `
  <div class="previous-post-container">
  <div class="previous-post-header small-header">
<h2>Next posts</h2>
</div>
    ${posts
			.slice(0, posts.length - 1)
			.reverse() // Reverse the order
			.map(
				(post) => `
      <div class="carousel-img-container">
        <img class="carousel-img" src="${post.acf["post-image"]}" alt="${post.acf["post-title"]}" data-id="${post.id}" data-text="${post.acf["blog-text"]}">
      </div>
    `
			)
			.join("")}
  </div>
`;

const createCarouselContentWrapper = (posts) => `
  <div class="carousel-content-wrapper">
    <div class="arrow-container left-arrow-container">
      <img class="carousel-arrow left-arrow" src="images/left-arrow.png" alt="Left Arrow">
    </div>
    <div class="carousel-content-loading-wrapper">
      <div class="loading-indicator"></div>
    </div>
    <div class="content-font carousel-content">
	<div class="carousel-pagination"></div>
      <h2 class="site-font carousel-header">Fresh posts</h2>
	  ${createMainLatestPost(posts[posts.length - 1])}
      ${createPreviousPostContainer(posts)}	
    </div>
    <div class="arrow-container right-arrow-container">
      <img class="carousel-arrow right-arrow" src="images/right-arrow.png" alt="Right Arrow">
    </div>

  </div>
`;

const swapMainContainerAndCarouselImage = (clickedImage) => {
	const mainImage = document.querySelector(".latest-index-img");
	const titleElement = document.querySelector(".index-post-header");
	const excerptElement = document.querySelector(".latest-index-text");
	const readMoreLink = document.querySelector(".read-more-link");

	// Store current main image
	const tempData = {
		id: mainImage.dataset.id,
		src: mainImage.src,
		text: excerptElement.textContent,
	};

	// Update main container data with clicked image data
	mainImage.dataset.id = clickedImage.dataset.id;
	mainImage.src = clickedImage.src;
	titleElement.textContent = clickedImage.alt;
	excerptElement.textContent = clickedImage.dataset.text.substring(0, 100) + "...";
	readMoreLink.href = `blogpost.html?id=${clickedImage.dataset.id}`;

	// Update clicked image data with previous main container data
	clickedImage.dataset.id = tempData.id;
	clickedImage.src = tempData.src;
	clickedImage.dataset.text = tempData.text;
};

const fetchLatestPosts = async (startIndex = 0, updateCarousel = false) => {
	try {
		const data = await fetchLatestPostsForCarousel();

		if (data.length === 0) {
			return [];
		}

		// Calculate start and end index for slicing data
		const endIndex = data.length - startIndex;
		const beginIndex = endIndex - POSTS_PER_PAGE;

		if (firstLoad) {
			carouselContainer.innerHTML = createCarouselContentWrapper(
				data.slice(beginIndex, endIndex)
			);
			firstLoad = false;
		} else if (updateCarousel) {
			document.querySelector(".carousel-content-wrapper").remove();
			carouselContainer.innerHTML = createCarouselContentWrapper(
				data.slice(beginIndex, endIndex)
			);
		}

		setupArrows();

		updateArrowVisibility();

		document.querySelectorAll(".carousel-img").forEach((img) => {
			img.addEventListener("click", () => swapMainContainerAndCarouselImage(img));
		});
		createCarouselPagination(Math.floor(startIndex / POSTS_PER_PAGE));

		return data;
	} catch (error) {
		console.error("Error fetching the latest posts:", error);
		return [];
	}
};

const handleArrowClick = async (increment) => {
	const newIndex = currentStartIndex + increment;
	if (newIndex >= 0 && newIndex < 9) {
		await fetchLatestPosts(newIndex, true);
		currentStartIndex = newIndex;
		updateArrowVisibility();
		createCarouselPagination(Math.floor(currentStartIndex / POSTS_PER_PAGE));
	}
};

const setupArrows = () => {
	leftArrow = document.querySelector(".left-arrow");
	rightArrow = document.querySelector(".right-arrow");

	// Remove existing event listeners before adding new ones
	leftArrow.removeEventListener("click", handleLeftArrowClick);
	rightArrow.removeEventListener("click", handleRightArrowClick);

	leftArrow.addEventListener("click", handleLeftArrowClick);
	rightArrow.addEventListener("click", handleRightArrowClick);

	updateArrowVisibility();
};

const handleLeftArrowClick = async () => {
	await handleArrowClick(-POSTS_PER_PAGE);
};

const handleRightArrowClick = async () => {
	await handleArrowClick(POSTS_PER_PAGE);
};

const updateArrowVisibility = () => {
	const maxStartIndex = 8;

	// Hide left arrow
	leftArrow.style.display = currentStartIndex === 0 ? "none" : "block";

	// Hide right arrow
	rightArrow.style.display = currentStartIndex >= maxStartIndex ? "none" : "block";
};

const setupTouchEvents = () => {
	if (window.innerWidth <= 545) {
		// Check the window width for small screens
		const threshold = 100;
		const maxStartIndex = 8;

		// swipe left
		const handleSwipeLeft = async () => {
			const newIndex = currentStartIndex + POSTS_PER_PAGE;
			if (newIndex <= maxStartIndex) {
				const newPosts = await fetchLatestPosts(newIndex, true);

				if (newPosts.length > 0) {
					currentStartIndex = newIndex;
				}

				updateArrowVisibility();
				createCarouselPagination(Math.floor(currentStartIndex / POSTS_PER_PAGE));
			}
		};

		// swipe right
		const handleSwipeRight = async () => {
			currentStartIndex -= POSTS_PER_PAGE;
			if (currentStartIndex < 0) {
				currentStartIndex = 0;
			}
			await fetchLatestPosts(currentStartIndex, true);
			updateArrowVisibility();
			createCarouselPagination(Math.floor(currentStartIndex / POSTS_PER_PAGE));
		};

		// Listen for touch
		const carouselContainer = document.querySelector(".carousel-container");

		// Use the handleTouchEvents function from utils.js
		handleTouchEvents(carouselContainer, threshold, handleSwipeLeft, handleSwipeRight);
	}
};

function createCarouselPagination(currentPage) {
	const totalPages = 3;
	let dots = "";
	for (let i = 0; i < totalPages; i++) {
		const activeClass = i === currentPage ? "active" : "";
		dots += `<div class="pagination-dot ${activeClass}" data-index="${i}"></div>`;
	}
	const carouselPagination = document.querySelector(".carousel-pagination");
	carouselPagination.innerHTML = dots;
	attachPaginationEventListeners();
}

function attachPaginationEventListeners() {
	document.querySelectorAll(".pagination-dot").forEach((dot) => {
		dot.addEventListener("click", async (event) => {
			const pageIndex = Number(event.target.dataset.index);
			currentStartIndex = pageIndex * 4;
			await fetchLatestPosts(currentStartIndex, true);
			createCarouselPagination(Math.floor(currentStartIndex / 4));
		});
	});
}

export async function setupCarousel() {
	await fetchAllPosts();
	await fetchLatestPosts(0, true);
	setupTouchEvents();
	createCarouselPagination(Math.floor(currentStartIndex / 4));
}
