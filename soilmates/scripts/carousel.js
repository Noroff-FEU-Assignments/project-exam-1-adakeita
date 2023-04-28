const titleElement = document.querySelector(".index-post-header");
const taglineElement = document.querySelector(".tagline");
const excerptElement = document.querySelector(".latest-index-text");
const imgElementMain = document.querySelector(".latest-index-img");
const leftArrow = document.querySelector(".left-arrow");
const rightArrow = document.querySelector(".right-arrow");
let currentStartIndex = 0;
let mainContainerData = {};
let firstLoad = true;

function updateArrowVisibility() {
	const totalPosts = allPosts.length;
	const maxStartIndex = totalPosts - 4;

	// Hide left arrow at start
	if (currentStartIndex === 0) {
		leftArrow.style.display = "none";
	} else {
		leftArrow.style.display = "block";
	}

	// Hide right arrow at end
	if (currentStartIndex >= maxStartIndex) {
		rightArrow.style.display = "none";
	} else {
		rightArrow.style.display = "block";
	}
}

function setupArrows(reversedData) {
	updateArrowVisibility(reversedData);

	leftArrow.addEventListener("click", async () => {
		currentStartIndex -= 4;
		const newData = await fetchLatestPosts(currentStartIndex, true);
		updateArrowVisibility(newData);
		if (newData.length === 0) {
			currentStartIndex += 4;
		}
	});

	rightArrow.addEventListener("click", async () => {
		currentStartIndex += 4;
		const newData = await fetchLatestPosts(currentStartIndex, true);
		updateArrowVisibility(newData);
		if (newData.length === 0) {
			currentStartIndex -= 4;
		}
	});
}

function updateCarouselImages(reversedData) {
	const carouselImages = document.querySelectorAll(".carousel-img-container");
	carouselImages.forEach((carouselImageContainer, index) => {
		if (reversedData[index + 1]) {
			const postData = reversedData[index + 1].acf;
			const imgElement = carouselImageContainer.querySelector(".carousel-img");

			imgElement.setAttribute("src", postData["post-image"]);
			imgElement.setAttribute("alt", postData["post-title"]);
			imgElement.setAttribute("data-tagline", postData["tagline"]);
			imgElement.setAttribute("data-text", postData["blog-text"]);

			imgElement.removeEventListener("click", swapMainContainerAndCarouselImage);
			imgElement.addEventListener("click", swapMainContainerAndCarouselImage);
		}
	});
}

//image swapping logic
function swapMainContainerAndCarouselImage() {
	const imgElement = this;

	const clickedData = {
		"post-title": imgElement.getAttribute("alt"),
		tagline: imgElement.getAttribute("data-tagline"),
		"blog-text": imgElement.getAttribute("data-text"),
		"post-image": imgElement.getAttribute("src"),
	};

	// Swap main container data and clicked image
	const tempData = { ...mainContainerData };
	mainContainerData = { ...clickedData };
	updateMainContainer(mainContainerData);

	imgElement.setAttribute("src", tempData["post-image"]);
	imgElement.setAttribute("alt", tempData["post-title"]);
	imgElement.setAttribute("data-tagline", tempData["tagline"]);
	imgElement.setAttribute("data-text", tempData["blog-text"]);

	updateArrowVisibility();
}

async function fetchLatestPosts(startIndex = 0, updateCarousel = false) {
	try {
		const data = getLatestPosts(startIndex, 5); // Fetch 5 posts instead of 4
		if (!data || data.length === 0) {
			return [];
		}

		const latestPost = data[data.length - 1].acf; // Set the latest post as the last post in the array
		mainContainerData = { ...latestPost };

		if (latestPost) {
			updateMainContainer(mainContainerData);
			if (updateCarousel || firstLoad) {
				data.pop(); // Remove the last post from the data array
				updateCarouselImages(data); // Pass only the first 4 posts to the carousel
				if (firstLoad) {
					firstLoad = false;
				}
			}

			currentStartIndex = startIndex;
			return data;
		} else {
			console.error("No latest post found.");
			return [];
		}
	} catch (error) {
		console.error("Error fetching the latest posts:", error);
		return [];
	}
}

function updateMainContainer(data) {
	titleElement.innerHTML = data["post-title"];
	taglineElement.innerHTML = data["tagline"];
	excerptElement.innerHTML = `${data["blog-text"]} <a class="seemore-link" href="${data["post-title"]}"><em>Read More</em></a>`;
	imgElementMain.setAttribute("src", data["post-image"]);
	imgElementMain.setAttribute("alt", data["post-title"]);
}

document.addEventListener("DOMContentLoaded", async () => {
	await fetchAllPosts();
	const data = await fetchLatestPosts(0, true);
	setupArrows(data);
});
