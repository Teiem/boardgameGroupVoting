import { json, type RequestHandler } from "@sveltejs/kit";

export type BoardGameItem = {
  objectid: string;
  subtype: string;
  primaryname: string;
  nameid: string;
  yearpublished: number;
  ordtitle: string;
  rep_imageid: number;
  objecttype: string;
  name: string;
  sortindex: string;
  type: string;
  id: string;
  href: string;
};

export type BGGSearchResponse = {
  items: BoardGameItem[];
};

type Params = {
  query: string;
};


export const POST: RequestHandler = async ({ fetch, request }) => {
  const { query } = await request.json<Params>();

  const res = await fetch(`https://boardgamegeek.com/search/boardgame?nosession=1&q=${encodeURIComponent(query)}&showcount=10`, {
    "headers": {
      "accept": "application/json, text/plain, */*",
      "accept-language": "en-US,en;q=0.9",
      "priority": "u=1, i",
      "sec-ch-ua": "\"Not(A:Brand\";v=\"99\", \"Google Chrome\";v=\"133\", \"Chromium\";v=\"133\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"Windows\"",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin"
    },
    "referrer": "https://boardgamegeek.com/xmlapi2",
    "referrerPolicy": "strict-origin-when-cross-origin",
    "body": null,
    "method": "GET",
    "mode": "cors",
    "credentials": "include"
  });

  const data = await res.json<BGGSearchResponse>();

  return json(data);
};