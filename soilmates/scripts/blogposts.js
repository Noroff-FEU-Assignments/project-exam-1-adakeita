function displayBlogPosts(posts) {
    const blogPostsContainer = document.querySelector(".blog-list-container");
  
    posts.forEach((post) => {
      const postTitle = post.acf["post-title"];
      const postExcerpt = post.acf["blog-text"].substring(0, 100) + "...";
      const postId = post.id;
      const postImage = post.acf["post-image"];
  
      const postHTML = `
        <a href="blogpost.html?id=${postId}">
          <div class="blog-post" style="background-image: url('${postImage}');">
            <div class="blog-post-content content-font">
              <h2 class="blogtitle-list">${postTitle}</h2>
            </div>
          </div>
        </a>
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


  async function displayBlogPost() {
    showLoadingIndicator();
  
    const titleElement = document.querySelector(".page-header");
    const contentElement = document.querySelector(".page-text-container");
    const blogPostWrapper = document.querySelector(".blogpost-wrapper");
  
    const postId = parseInt(new URLSearchParams(window.location.search).get("id"));
    const post = await getBlogPostById(postId);
  
    if (post) {
      const postData = post.acf;
      const postImage = postData["post-image"];
  
      titleElement.innerHTML = postData["post-title"];
      contentElement.innerHTML = `
        <div class="blogpost-img-wrapper">
          <img src="${postImage}" alt="Blog post image">
        </div>
        <div class="blogpost-container">
          <p>${postData["blog-text"].replace(/\r\n/g, "</p><p>")}</p>
        </div>
      `;
    } else {
      titleElement.innerHTML = "Post not found";
      contentElement.innerHTML = "<p>We couldn't find the post you're looking for. Please go back and try again.</p>";
    }
  
    hideLoadingIndicator();
  }
  
  
  

// Add this init function instead
document.addEventListener("DOMContentLoaded", async () => {
    await fetchAllPosts();
  
    if (window.location.pathname.includes("posts.html")) {
        const viewMoreButton = document.getElementById("view-more-button");
        viewMoreButton.addEventListener("click", loadBlogPosts);
        loadBlogPosts();
      } else if (window.location.pathname.includes("blogpost.html")) {
        displayBlogPost();
      }
      
  });
  
  