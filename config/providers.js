const PREFERRED_SERVER = "venus";

const MOVIE_PROVIDERS = [
  {
    name: "MultiEmbed",
    build: (imdb) =>
      `https://multiembed.mov/?video_id=${imdb}&server=${PREFERRED_SERVER}`,
  },

  {
    name: "VsEmbed",
    build: (imdb) =>
      `https://vsembed.ru/embed/movie/${imdb}`,
  },

  {
    name: "VidSrc",
    build: (imdb) =>
      `https://vidsrc.xyz/embed/movie/${imdb}`,
  },
];

const TV_PROVIDERS = [
  {
    name: "MultiEmbed",
    build: (imdb, season, episode) =>
      `https://multiembed.mov/?video_id=${imdb}&s=${season}&e=${episode}&server=${PREFERRED_SERVER}`,
  },

  {
    name: "VsEmbed",
    build: (imdb, season, episode) =>
      `https://vsembed.ru/embed/tv/${imdb}/${season}/${episode}`,
  },

  {
    name: "VidSrc",
    build: (imdb, season, episode) =>
      `https://vidsrc.xyz/embed/tv/${imdb}/${season}/${episode}`,
  },
];

module.exports = {
  MOVIE_PROVIDERS,
  TV_PROVIDERS,
};