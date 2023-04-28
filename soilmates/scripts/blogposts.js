function displayBlogPosts(posts) {
    const blogPostsContainer = document.querySelector(".blog-list-container");
  
    posts.forEach((post) => {
      const postTitle = post.acf["post-title"];
      const postExcerpt = post.acf["blog-text"].substring(0, 100) + "...";
      const postId = post.id;
      const postImage = post.acf["post-image"];
  
      const postHTML = `
        <div class="blog-post" style="background-image: url('${postImage}');">
          <div class="blog-post-content content-font">
            <h2 class="blogtitle-list">${postTitle}</h2>
            <p class="excerpt-list">${postExcerpt}</p>
            <a class="site-font" href="blog-post.html?id=${postId}">Read more</a>
          </div>
        </div>
      `;
  
      blogPostsContainer.insertAdjacentHTML("beforeend", postHTML);
    });
  }
  

let startIndex = 0;
const postsPerPage = 10;

async function loadBlogPosts() {
    showLoadingIndicator();
    console.log("Loading blog posts");
    const posts = getBlogPosts(startIndex, postsPerPage);
    console.log("Blog posts to display:", posts);
    displayBlogPosts(posts);
    startIndex += postsPerPage;
    hideLoadingIndicator();
  }

// Add this init function instead
async function init() {
    await fetchAllPosts();
    await loadBlogPosts();
    const viewMoreButton = document.getElementById("view-more-button");
    viewMoreButton.addEventListener("click", loadBlogPosts);
  }
  
  document.addEventListener("DOMContentLoaded", init);
  