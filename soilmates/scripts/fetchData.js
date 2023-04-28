// fetchData.js
let allPosts = [];

async function fetchAllPosts() {
    showLoadingIndicator();
    try {
      const allFetchedPosts = [];
      const perPage = 100;
      let currentPage = 1;
      let reachedEnd = false;
  
      while (!reachedEnd) {
        const response = await fetch(
          `http://localhost/soilmates-api/wp-json/acf/v3/blogpost?per_page=${perPage}&page=${currentPage}`
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
  

function getLatestPosts(startIndex = 0, perPage = 4) {
    return allPosts.slice(startIndex, startIndex + perPage).reverse();
  }  

  function getBlogPosts(startIndex = 0, perPage = 10) {
    console.log("Fetched all posts:", allPosts);
    return allPosts.slice(startIndex, startIndex + perPage);
  }
  

function getBlogPostById(id) {
  return allPosts.find((post) => post.id === id);
}

document.addEventListener("DOMContentLoaded", async () => {
  await fetchAllPosts();
});