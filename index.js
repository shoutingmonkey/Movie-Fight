const autoCompleteConfig = {
  renderOption(movie) {
    return `
      <img src="${movie.Poster === "N/A" ? "" : movie.Poster}" />
      ${movie.Title}
    `;
  },
  inputValue(movie) {
    return movie.Title;
  },
  async fetchData(searchTerm) {
    const response = await axios.get("http://www.omdbapi.com/", {
      params: {
        apikey: "2536ceee",
        s: searchTerm,
      },
    });

    if (response.data.Error) return [];

    return response.data.Search;
  },
};

createAutoComplete({
  root: document.querySelector("#left-autocomplete"),
  onOptionSelect(movie) {
    document.querySelector(".tutorial").classList.add("is-hidden");
    onMovieSelect(movie, document.querySelector("#left-summary"), "left");
  },
  ...autoCompleteConfig,
});

createAutoComplete({
  root: document.querySelector("#right-autocomplete"),
  onOptionSelect(movie) {
    document.querySelector(".tutorial").classList.add("is-hidden");
    onMovieSelect(movie, document.querySelector("#right-summary"), "right");
  },
  ...autoCompleteConfig,
});

let leftMovie, rightMovie;
const onMovieSelect = async (movie, summaryElement, side) => {
  const response = await axios.get("http://www.omdbapi.com/", {
    params: {
      apikey: "2536ceee",
      i: movie.imdbID,
    },
  });

  if (side === "left") leftMovie = response.data;
  else rightMovie = response.data;

  summaryElement.innerHTML = movieTemplate(response.data);

  if (leftMovie && rightMovie) runComparison();
};

const runComparison = () => {
  const leftSideStats = document.querySelectorAll(
    "#left-summary .notification"
  );
  const rightSideStats = document.querySelectorAll(
    "#right-summary .notification"
  );

  leftSideStats.forEach((leftStat, index) => {
    const rightStat = rightSideStats[index];

    const leftSideVal = parseInt(leftStat.dataset.value);
    const rightSideVal = parseInt(rightStat.dataset.value);

    if (rightSideVal > leftSideVal) {
      leftStat.classList.remove("is-primary");
      leftStat.classList.add("is-warning");
    } else {
      rightStat.classList.remove("is-primary");
      rightStat.classList.add("is-warning");
    }
  });
};

const movieTemplate = (movieDetail) => {
  const dollars = parseInt(
    movieDetail.BoxOffice.replace(/\$/g, "").replace(/,/g, "")
  );
  const metascore = parseInt(movieDetail.Metascore);
  const imdbRating = parseFloat(movieDetail.imdbRating);
  const imdbVotes = parseInt(movieDetail.imdbVotes.replace(/,/g, ""));
  const awards = movieDetail.Awards.split(" ").reduce((prev, word) => {
    const value = parseInt(word);

    if (isNaN(value)) return prev;
    else return prev + value;
  }, 0);

  return `
    <article class="media">
      <figure class="media-left">
        <p class="image">
          <img src="${movieDetail.Poster}" />
        </p>
      </figure>
      <div class="media-content">
        <div class="content">
          <h1>${movieDetail.Title}</h1>
          <h4>${movieDetail.Genre}</h4>
          <p>${movieDetail.Plot}</p>
        </div>
      </div>
    </article>
    <article data-value=${awards} class="notification is-primary">
      <p class="title">${movieDetail.Awards}</p>
      <p class=subtitle">Awards</P>
    </article>
    <article data-value=${dollars} class="notification is-primary">
      <p class="title">${movieDetail.BoxOffice}</p>
      <p class=subtitle">Box Office</P>
    </article>
    <article data-value=${metascore} class="notification is-primary">
      <p class="title">${movieDetail.Metascore}</p>
      <p class=subtitle">Metascore</P>
    </article>
    <article data-value=${imdbRating} class="notification is-primary">
      <p class="title">${movieDetail.imdbRating}</p>
      <p class=subtitle">IMDB Rating</P>
    </article>
    <article data-value=${imdbVotes} class="notification is-primary">
      <p class="title">${movieDetail.imdbVotes}</p>
      <p class=subtitle">IMDB Votes</P>
    </article>
  `;
};
