document.addEventListener('DOMContentLoaded', () => {
    const apiKey = 'd128be32eb6d4018be0be2cc3eeef70c';  // Replace with your NewsAPI key
    const newsContainer = document.getElementById('news-container');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const paginationContainer = document.getElementById('pagination-container');
    let currentPage = 1;
    const pageSize = 10; // Number of articles per page

    // Function to fetch news articles with pagination
    function fetchNews(query = '', category = '', page = 1) {
        let apiUrl = '';

        if (query) {
            // If there's a search query, use the /everything endpoint
            apiUrl = `https://newsapi.org/v2/everything?q=${query}&page=${page}&pageSize=${pageSize}&apiKey=${apiKey}`;
        } else if (category) {
            // If there's a category, use the /top-headlines endpoint with category
            apiUrl = `https://newsapi.org/v2/top-headlines?country=us&category=${category}&page=${page}&pageSize=${pageSize}&apiKey=${apiKey}`;
        } else {
            // Default to top headlines if no search or category
            apiUrl = `https://newsapi.org/v2/top-headlines?country=us&page=${page}&pageSize=${pageSize}&apiKey=${apiKey}`;
        }

        // Clear the news container before loading new results
        newsContainer.innerHTML = '';

        // Fetch the news articles
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                if (data.articles && data.articles.length > 0) {
                    // Display the articles
                    console.log(data.articles)
                    data.articles.forEach(article => {
                        if (article.urlToImage && article.title != "[Removed]" && article.description != "[Removed]") {
                            const articleDiv = document.createElement('div');
                            articleDiv.classList.add('news-article');

                            const articleTitle = document.createElement('h2');
                            articleTitle.textContent = article.title;
                            articleDiv.appendChild(articleTitle);

                            const articleDescription = document.createElement('p');
                            articleDescription.textContent = article.description || 'No description available.';
                            articleDiv.appendChild(articleDescription);

                            const articleImage = document.createElement('img');
                            articleImage.setAttribute('src', article.urlToImage)
                            articleImage.setAttribute('alt', 'No Image found')
                            articleImage.setAttribute('width', '500px')
                            articleImage.setAttribute('height', '300px')
                            articleDiv.appendChild(articleImage);

                            const readMore = document.createElement('a');
                            readMore.textContent = 'Read More';
                            readMore.href = article.url;
                            readMore.target = '_blank';
                            articleDiv.appendChild(readMore);

                            newsContainer.appendChild(articleDiv);
                        }
                    });

                    // Update pagination buttons
                    const totalPages = Math.ceil(data.totalResults / pageSize);
                    updatePaginationButtons(totalPages, page);
                } else {
                    newsContainer.textContent = 'No news available for this category.';
                }
            })
            .catch(error => {
                console.error('Error fetching news:', error);
                newsContainer.textContent = 'Failed to load news.';
            });
    }

    // Function to update pagination buttons
    function updatePaginationButtons(totalPages, currentPage) {
        paginationContainer.innerHTML = ''; // Clear existing buttons

        // Create Previous button
        if (currentPage > 1) {
            const prevButton = document.createElement('button');
            prevButton.textContent = 'Previous';
            prevButton.addEventListener('click', () => {
                currentPage--;
                fetchNews(searchInput.value.trim(), getSelectedCategory(), currentPage);
            });
            paginationContainer.appendChild(prevButton);
        }

        // Create Next button
        if (currentPage < totalPages) {
            const nextButton = document.createElement('button');
            nextButton.textContent = 'Next';
            nextButton.addEventListener('click', () => {
                currentPage++;
                fetchNews(searchInput.value.trim(), getSelectedCategory(), currentPage);
            });
            paginationContainer.appendChild(nextButton);
        }

        // Display current page number
        const pageIndicator = document.createElement('span');
        pageIndicator.textContent = `Page ${currentPage} of ${totalPages}`;
        paginationContainer.appendChild(pageIndicator);
    }

    // Helper function to get the currently selected category
    function getSelectedCategory() {
        const activeButton = document.querySelector('nav ul li a.active');
        return activeButton ? activeButton.getAttribute('data-category') : '';
    }

    // Load top headlines (default to home/general) when the page loads
    fetchNews('', 'general', 1);

    // Handle search button click
    searchButton.addEventListener('click', () => {
        const query = searchInput.value.trim();
        currentPage = 1; // Reset to the first page on a new search
        if (query) {
            fetchNews(query, '', currentPage);
        }
    });

    // Optionally: allow pressing Enter to trigger search
    searchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            const query = searchInput.value.trim();
            currentPage = 1; // Reset to the first page on a new search
            if (query) {
                fetchNews(query, '', currentPage);
            }
        }
    });

    // Handle category click events
    document.querySelectorAll('nav ul li h4').forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            document.querySelectorAll('nav ul li h4').forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');

            const category = event.target.getAttribute('data-category');
            currentPage = 1; // Reset to the first page on category change
            fetchNews('', category, currentPage);
        });
    });
});
