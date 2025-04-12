import { createRest } from "$lib/rest";
import type { RequestEvent } from './$types';


const { GET, POST, PATCH, DELETE } = createRest<RequestEvent>("availableGame");

export {
  GET,
  POST,
  PATCH,
  DELETE
};