require("dotenv").config();
const {
  renderError,
  parseBoolean,
  clampValue,
  parseArray,
  CONSTANTS,
} = require("../src/common/utils");
const { fetchLast7Days } = require("../src/fetchers/wakatime-fetcher");
const wakatimeCard = require("../src/cards/wakatime-card");

module.exports = async (req, res) => {
  const {
    username,
    type,
    hide,
    count,
    title_color,
    icon_color,
    hide_border,
    line_height,
    text_color,
    bg_color,
    theme,
    cache_seconds,
    hide_title,
    hide_progress,
  } = req.query;

  res.setHeader("Content-Type", "image/svg+xml");

  try {
    const last7Days = await fetchLast7Days({ username, apiKey: process.env.WAKA_API_KEY });

    let cacheSeconds = clampValue(
      parseInt(cache_seconds || CONSTANTS.TWO_HOURS, 10),
      CONSTANTS.TWO_HOURS,
      CONSTANTS.ONE_DAY
    );

    if (!cache_seconds) {
      cacheSeconds = CONSTANTS.FOUR_HOURS;
    }

    res.setHeader("Cache-Control", `public, max-age=${cacheSeconds}`);

    if (type !== "projects" && type !== "langs" && type !== "languages") {
        // noinspection ExceptionCaughtLocallyJS
        throw new Error("Invalid or missing \"type\" parameter. Valid values: projects, langs (or languages)");
    }

    return res.send(
      wakatimeCard(last7Days, {
        hide_title: parseBoolean(hide_title),
        hide_border: parseBoolean(hide_border),
        line_height,
        title_color,
        icon_color,
        text_color,
        bg_color,
        theme,
        hide_progress,
        type,
        hide: parseArray(hide),
        count,
      })
    );
  } catch (err) {
    return res.send(renderError(err.message, err.secondaryMessage));
  }
};
