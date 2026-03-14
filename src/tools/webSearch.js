import axios from "axios";

export const webSearch = async (query) => {

  const result = await axios.post(
    "https://google.serper.dev/search",
    { q: query },
    {
      headers: {
        "X-API-KEY": process.env.SERPER_API_KEY,
        "Content-Type": "application/json",
      },
    }
  );

  const organic = result.data?.organic || [];

  return organic.slice(0,3);

};