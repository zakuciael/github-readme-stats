const axios = require("axios");

const fetchLast7Days = async ({ username, apiKey }) => {
  apiKey = username === process.env.API_USERNAME ? apiKey : "";
  const { data } = await axios.get(
    `https://wakatime.com/api/v1/users/${username}/stats/last_7_days?is_including_today=true&api_key=${apiKey}`
  );

  return data.data;
};

module.exports = {
  fetchLast7Days,
};
