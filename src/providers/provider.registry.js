import {
  openRouterComplete,
  openRouterStream
} from "./openrouter.adapter.js";

import {
  geminiComplete,
  geminiStream
} from "./gemini.adapter.js";

export const PROVIDERS = {

  openrouter: {
    complete: openRouterComplete,
    stream: openRouterStream
  },

  gemini: {
    complete: geminiComplete,
    stream: geminiStream
  }

};