import { LinearClient } from "@linear/sdk";

// Ez a kliens szerver oldalon fog futni, biztonságosan hozzáférve a környezeti változókhoz.
export const linearClient = new LinearClient({
  apiKey: process.env.LINEAR_API_KEY,
});
