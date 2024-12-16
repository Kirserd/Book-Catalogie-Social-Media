function createGenreBubblesWithHeightLimit() {
    document.querySelectorAll(".desc-container .right.genre").forEach((genreElement) => {
        const genresText = genreElement.textContent.trim(); 
        const genresArray = genresText.split(","); 
        
        const uniqueGenres = new Set();

        genresArray.forEach((genre) => {
            const shortGenre = genre.split("/")[0].trim(); 
            uniqueGenres.add(shortGenre); 
        });

        genreElement.textContent = "";

        const wrapper = document.createElement("div");
        wrapper.classList.add("genre-wrapper");
        genreElement.appendChild(wrapper);

        const maxWrapperHeight = parseFloat(
            getComputedStyle(wrapper).getPropertyValue("max-height")
        );

        let totalHeight = 0;
        let isTruncated = false;

        Array.from(uniqueGenres).forEach((shortGenre) => {
            if (isTruncated) return; 

            const bubble = document.createElement("p");
            bubble.classList.add("genre-bubble");
            bubble.textContent = shortGenre;
            wrapper.appendChild(bubble); 

            const currentHeight = wrapper.scrollHeight;

            if (currentHeight > maxWrapperHeight) {
                wrapper.removeChild(bubble);
                const ellipsisBubble = document.createElement("p");
                ellipsisBubble.classList.add("genre-bubble", "ellipsis-bubble");
                ellipsisBubble.textContent = "...";
                wrapper.appendChild(ellipsisBubble);
                isTruncated = true;
            }
        });
    });
}

window.onload = createGenreBubblesWithHeightLimit;

function truncateEmail(email) {
    if (email) {
        return email.split('@')[0]; 
    }
    return '';
}

document.addEventListener('DOMContentLoaded', () => {
    const emailElement = document.querySelector('.accent-text');
    const fullEmail = emailElement?.textContent.trim(); 
    if (fullEmail) {
        emailElement.textContent = truncateEmail(fullEmail); 
    }
});