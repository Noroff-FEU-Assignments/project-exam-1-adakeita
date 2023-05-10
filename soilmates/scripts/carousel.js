import { getLatestPosts, fetchAllPosts, allPosts } from './utils.js';


const carouselBg = document.querySelector(".carousel-bg");
let leftArrow;
let rightArrow;
let currentStartIndex = 0;
let firstLoad = true;

const createMainLatestPost = (post) => `
  <div class="main-latest-post">
    <div class="latest-index-text-container">
      <p class="index-post-header">${post.acf["post-title"]}</p>
      <p class="latest-index-text">
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
    ${posts
			.slice(1, 4)
			.map(
				(post) => `
      <div class="carousel-img-container">
        <img class="carousel-img" src="${post.acf["post-image"]}" alt="${post.acf["post-title"]}" data-id="${post.id}" data-tagline="${post.acf["tagline"]}" data-text="${post.acf["blog-text"]}">
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
      <h2 class="content-font carousel-header">New posts</h2>
      ${createMainLatestPost(posts[0])}
      ${createPreviousPostContainer(posts)}
    </div>
    <div class="arrow-container right-arrow-container">
      <img class="carousel-arrow right-arrow" src="images/right-arrow.png" alt="Right Arrow">
    </div>
  </div>
`;

function swapMainContainerAndCarouselImage(clickedImage) {
	const mainImage = document.querySelector(".latest-index-img");
	const titleElement = document.querySelector(".index-post-header");
	const taglineElement = document.querySelector(".tagline");
	const excerptElement = document.querySelector(".latest-index-text");
	const readMoreLink = document.querySelector(".read-more-link");

	// Store current main image
	const tempData = {
		id: mainImage.dataset.id,
		src: mainImage.src,
		tagline: titleElement.textContent,
		text: excerptElement.textContent,
	};

	// Update main container data with clicked image data
	mainImage.dataset.id = clickedImage.dataset.id;
	mainImage.src = clickedImage.src;
	titleElement.textContent = clickedImage.alt;
	taglineElement.textContent = clickedImage.dataset.tagline;
	excerptElement.textContent = clickedImage.dataset.text.substring(0, 100) + "...";
	readMoreLink.href = `blogpost.html?id=${clickedImage.dataset.id}`;

	// Update clicked image data with previous main container data
	clickedImage.dataset.id = tempData.id;
	clickedImage.src = tempData.src;
	clickedImage.alt = tempData.tagline;
	clickedImage.dataset.tagline = tempData.tagline;
	clickedImage.dataset.text = tempData.text;
}

async function fetchLatestPosts(startIndex = 0, updateCarousel = false) {
	try {
		const data = (await getLatestPosts(startIndex, 4)) || [];

		if (data.length === 0) {
			return [];
		}

		data.reverse(); // Reverse the data array here

		if (firstLoad) {
			carouselBg.innerHTML = createCarouselContentWrapper(data);
			firstLoad = false;
		} else if (updateCarousel) {
			document.querySelector(".carousel-content-wrapper").remove();
			carouselBg.innerHTML = createCarouselContentWrapper(data);
		}

		setupArrows(data);

		updateArrowVisibility();

		document.querySelectorAll(".carousel-img").forEach((img) => {
			img.addEventListener("click", () => swapMainContainerAndCarouselImage(img));
		});

		return data;
	} catch (error) {
		console.error("Error fetching the latest posts:", error);
		return [];
	}
}

async function handleArrowClick(increment) {
	const newIndex = currentStartIndex + increment;
	const newPosts = await fetchLatestPosts(newIndex, true);

	if (newPosts.length > 0) {
		currentStartIndex = newIndex;
	}

	updateArrowVisibility();
}

function setupArrows() {
	leftArrow = document.querySelector(".left-arrow");
	rightArrow = document.querySelector(".right-arrow");

	// Remove existing event listeners before adding new ones
	leftArrow.removeEventListener("click", handleLeftArrowClick);
	rightArrow.removeEventListener("click", handleRightArrowClick);

	leftArrow.addEventListener("click", handleLeftArrowClick);
	rightArrow.addEventListener("click", handleRightArrowClick);

	updateArrowVisibility();
}

async function handleLeftArrowClick() {
	currentStartIndex -= 4;
	if (currentStartIndex < 0) {
		currentStartIndex = 0;
	}
	await fetchLatestPosts(currentStartIndex, true);
}

async function handleRightArrowClick() {
	const tempStartIndex = currentStartIndex + 4;
	const nextData = await getLatestPosts(tempStartIndex, 1);
	if (nextData.length > 0) {
		currentStartIndex = tempStartIndex;
		await fetchLatestPosts(currentStartIndex, true);
	}
}

function updateArrowVisibility() {
	const totalPosts = allPosts.length;
	const maxStartIndex = Math.max(0, totalPosts - 4);

	// Hide left arrow
	leftArrow.style.display = currentStartIndex === 0 ? "none" : "block";

	// Hide right arrow
	rightArrow.style.display = currentStartIndex >= maxStartIndex ? "none" : "block";
}

export async function setupCarousel() {
	await fetchAllPosts();
	await fetchLatestPosts(0, true);
	setupArrows();
  }
