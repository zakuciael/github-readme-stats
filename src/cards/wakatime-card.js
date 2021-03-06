const { getCardColors, FlexLayout, clampValue } = require("../common/utils");
const { getStyles } = require("../getStyles");
const Card = require("../common/Card");

const noCodingActivityNode = ({ color }) => {
  return `
    <text x="25" y="11" class="stat bold" fill="${color}">No coding activity this week</text>
  `;
};

const createProgressNode = ({
  width,
  color,
  progress,
  progressBarBackgroundColor,
}) => {
  const progressPercentage = clampValue(progress, 2, 100);

  return `
    <svg width="${width}" overflow="auto">
      <rect rx="5" ry="5" x="110" y="4" width="${width}" height="8" fill="${progressBarBackgroundColor}"></rect>
      <rect
        height="8"
        fill="${color}"
        rx="5" ry="5" x="110" y="4"
        data-testid="lang-progress"
        width="${progressPercentage}%"
      >
      </rect>
    </svg>
  `;
};

const createTextNode = ({
  id,
  label,
  value,
  index,
  percent,
  hideProgress,
  progressBarColor,
  progressBarBackgroundColor,
}) => {
  const staggerDelay = (index + 3) * 150;

  const cardProgress = hideProgress
    ? null
    : createProgressNode({
        progress: percent,
        color: progressBarColor,
        width: 220,
        name: label,
        progressBarBackgroundColor,
      });

  return `
    <g class="stagger" style="animation-delay: ${staggerDelay}ms" transform="translate(25, 0)">
      <text class="stat bold" y="12.5">${label}:</text>
      <text 
        class="stat" 
        x="${hideProgress ? 170 : 350}" 
        y="12.5" 
        data-testid="${id}"
      >${value}</text>
      ${cardProgress}
    </g>
  `;
};

const lowercaseTrim = (name) => name.toLowerCase().trim();

const renderWakatimeCard = (stats = {}, options = { hide: [] }) => {
  let {
    hide_title = false,
    hide_border = false,
    line_height = 25,
    title_color,
    icon_color,
    text_color,
    bg_color,
    theme = "default",
    hide_progress,
    type,
    hide,
    count = 5,
  } = options;

  const lheight = parseInt(line_height, 10);

  // returns theme based colors with proper overrides and defaults
  const { titleColor, textColor, iconColor, bgColor } = getCardColors({
    title_color,
    icon_color,
    text_color,
    bg_color,
    theme,
  });

  const itemCount = clampValue(parseInt(count), 1, 10);
  const items = (type === "langs" || type === "languages" ? stats.languages : stats.projects);
  let langsToHide = {};

  // populate langsToHide map for quick lookup
  // while filtering out
  if (hide) {
    hide.forEach((langName) => {
      langsToHide[lowercaseTrim(langName)] = true;
    });
  }

  const statItems = items ? items
      .filter((stat) => stat.hours || stat.minutes)
      .filter((stat) => stat.name !== "Unknown Project")
      .filter((stat) => !langsToHide[lowercaseTrim(stat.name)])
      .map((language) => {
        return createTextNode({
          id: language.name,
          label: language.name,
          value: language.text,
          percent: language.percent,
          progressBarColor: titleColor,
          progressBarBackgroundColor: textColor,
          hideProgress: hide_progress,
        });
      }).slice(0, itemCount) : [];

  // Calculate the card height depending on how many items there are
  // but if rank circle is visible clamp the minimum height to `150`
  let height = Math.max(45 + (statItems.length + 1) * lheight, 150);

  const cssStyles = getStyles({
    titleColor,
    textColor,
    iconColor,
  });

  const card = new Card({
    title: "WakaTime Week Stats",
    width: 495,
    height,
    colors: {
      titleColor,
      textColor,
      iconColor,
      bgColor,
    },
  });

  card.setHideBorder(hide_border);
  card.setHideTitle(hide_title);
  card.setCSS(
    `
    ${cssStyles}
    .lang-name { font: 400 11px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${textColor} }
    `
  );

  return card.render(`
    <svg x="0" y="0" width="100%">
      ${FlexLayout({
        items: statItems.length
          ? statItems
          : [noCodingActivityNode({ color: textColor })],
        gap: lheight,
        direction: "column",
      }).join("")}
    </svg> 
  `);
};

module.exports = renderWakatimeCard;
