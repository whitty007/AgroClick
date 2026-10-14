import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const source = await readFile(new URL("../js/chatbot.js", import.meta.url), "utf8");
const context = { window: {} };
vm.runInNewContext(source, context);

function createRecognitionHarness() {
  const timers = new Map();
  const recognitions = [];
  const messages = [];
  let nextTimerId = 1;
  const input = { value: "" };
  const mic = {
    classList: { add() {}, remove() {} },
    setAttribute() {},
  };
  const status = {
    textContent: "",
    className: "",
    classList: { contains: name => status.className.split(" ").includes(name) },
  };
  class SpeechRecognition {
    constructor() {
      recognitions.push(this);
    }
    start() {
      this.onstart();
    }
    stop() {
      this.onend();
    }
  }
  const testContext = {
    window: { SpeechRecognition },
    document: { getElementById: id => ({
      chatbotInput: input,
      chatbotMic: mic,
      chatbotStatus: status,
    })[id] },
    getLang: () => "en",
    t: key => key,
    setTimeout: callback => {
      const id = nextTimerId++;
      timers.set(id, callback);
      return id;
    },
    clearTimeout: id => timers.delete(id),
    console,
  };
  vm.runInNewContext(source, testContext);
  testContext.handleUserChatMessage = text => messages.push(text);

  return {
    context: testContext,
    input,
    messages,
    recognitions,
    runPendingTimer() {
      const [id, callback] = timers.entries().next().value || [];
      assert.notEqual(id, undefined, "expected a pending silence timer");
      timers.delete(id);
      callback();
    },
  };
}

test("speech transcript keeps earlier words when later results arrive", () => {
  const results = [
    [{ transcript: "I want " }],
    [{ transcript: "fresh tomatoes" }],
  ];

  assert.equal(context.getChatRecognitionTranscript(results), "I want fresh tomatoes");
});

test("speech transcript ignores malformed results and trims surrounding whitespace", () => {
  const results = [
    null,
    [],
    [{ transcript: "  fresh produce  " }],
  ];

  assert.equal(context.getChatRecognitionTranscript(results), "fresh produce");
});

test("recognizes speech until three seconds of silence, submits it, and can start again", () => {
  const harness = createRecognitionHarness();
  const { context, input, messages, recognitions } = harness;

  context.toggleChatRecognition();
  assert.equal(recognitions.length, 1);
  assert.equal(recognitions[0].continuous, true);
  recognitions[0].onresult({
    results: [[{ transcript: "find " }]],
  });
  assert.equal(input.value, "find");
  assert.deepEqual(messages, []);
  recognitions[0].onresult({
    results: [[{ transcript: "find " }], [{ transcript: "fresh tomatoes" }]],
  });
  assert.equal(input.value, "find fresh tomatoes");

  harness.runPendingTimer();
  assert.deepEqual(messages, ["find fresh tomatoes"]);
  assert.equal(input.value, "");

  context.toggleChatRecognition();
  assert.equal(recognitions.length, 2);
});

test("restarts recognition when the browser ends a listening segment", () => {
  const harness = createRecognitionHarness();
  const { context, recognitions } = harness;

  context.toggleChatRecognition();
  recognitions[0].onend();

  assert.equal(recognitions.length, 2);
});

function createVoiceAssistantHarness(fetchImpl = undefined) {
  const transcript = { textContent: "", hidden: true };
  const buttonClasses = new Set();
  const button = {
    classList: {
      add: name => buttonClasses.add(name),
      remove: name => buttonClasses.delete(name),
      toggle: (name, enabled) => enabled ? buttonClasses.add(name) : buttonClasses.delete(name),
    },
    setAttribute() {},
    title: "",
  };
  const recognitions = [];
  const utterances = [];
  const cartChanges = [];
  const sessionValues = new Map();
  const sessionStorage = {
    getItem: key => sessionValues.get(key) || null,
    setItem: (key, value) => sessionValues.set(key, String(value)),
    removeItem: key => sessionValues.delete(key),
  };
  const products = [{
    name: "Tomato",
    shopId: "shop-1",
    id: "item-1",
    shopName: "Green Farm",
    location: "Chennai",
    price: 40,
    available: true,
    quantity: 10,
  }];
  class SpeechRecognition {
    constructor() {
      recognitions.push(this);
    }
    start() {
      this.started = true;
    }
    stop() {}
  }
  class SpeechRecognitionPhrase {
    constructor(phrase, boost) {
      this.phrase = phrase;
      this.boost = boost;
    }
  }
  class SpeechSynthesisUtterance {
    constructor(text) {
      this.text = text;
      utterances.push(this);
    }
  }
  const context = {
    window: {
      SpeechRecognition,
      SpeechRecognitionPhrase,
      location: { pathname: "/index.html", href: "" },
      speechSynthesis: {
        cancel() {},
        getVoices: () => [{ lang: "en-IN" }],
        speak() {},
      },
    },
    document: {
      getElementById: id => ({
        "voice-assistant-transcript": transcript,
        "voice-assistant-fab": button,
      })[id] || null,
    },
    SpeechSynthesisUtterance,
    getLang: () => "en",
    getMarketplaceProducts: () => products,
    searchMarketplaceProducts: list => list,
    sessionStorage,
    DB: {
      getCurrentUser: () => ({ mobile: "1234567890" }),
      setCartQty: (...args) => cartChanges.push(args),
    },
    AbortController,
    setTimeout,
    clearTimeout,
    fetch: fetchImpl,
    console,
  };
  vm.runInNewContext(source, context);
  return { context, transcript, buttonClasses, recognitions, utterances, cartChanges, sessionStorage, products };
}

test("voice assistant waits for its prompt, shows the transcript, and handles it", async () => {
  const harness = createVoiceAssistantHarness();
  const { context, transcript, recognitions, utterances, sessionStorage } = harness;

  context.startVoiceAssistantPrompt("What would you like to do?", "command");

  assert.equal(recognitions[0].started, undefined);
  utterances[0].onend();
  assert.equal(recognitions[0].started, true);
  recognitions[0].onresult({
    results: [Object.assign([{ transcript: "open shops" }], { isFinal: true })],
  });
  await new Promise(resolve => setTimeout(resolve, 0));

  assert.equal(context.window.location.href, "shops.html");
  const navigation = JSON.parse(sessionStorage.getItem("agroclick_voice_navigation"));
  assert.equal(navigation.transcript, "You said: open shops");
  assert.equal(navigation.response, "Opening shops.");
});

test("retries speech recognition without phrase hints when the browser rejects them", () => {
  const { context, recognitions } = createVoiceAssistantHarness();

  context.startVoiceAssistantPrompt("", "command");
  assert.equal(recognitions.length, 1);
  assert.ok(recognitions[0].phrases.length > 0);

  recognitions[0].onerror({ error: "phrases-not-supported" });

  assert.equal(recognitions.length, 2);
  assert.equal(recognitions[1].phrases, undefined);
  assert.equal(recognitions[1].started, true);
});

test("voice assistant listens for one spoken request without wake-word mode", () => {
  const { context, recognitions } = createVoiceAssistantHarness();

  context.startVoiceAssistantPrompt("", "command");

  assert.equal(recognitions.length, 1);
  assert.equal(recognitions[0].continuous, false);
  assert.equal(context.extractVoiceWakeCommand, undefined);
});

test("a spoken product name starts a quantity prompt without requiring an order keyword", async () => {
  const { context, recognitions, utterances } = createVoiceAssistantHarness();

  await context.handleVoiceAssistantText("tomato");

  assert.equal(recognitions.length, 1);
  assert.match(utterances.at(-1).text, /How many kilograms of Tomato/);
});

test("general voice questions get an AI answer, then automatically listen for the next request", async () => {
  const fetchImpl = async url => url === "/api/voice-command"
    ? { ok: true, json: async () => ({ action: "unknown" }) }
    : { ok: true, json: async () => ({ reply: "You can pay using UPI or cards." }) };
  const { context, utterances, recognitions } = createVoiceAssistantHarness(fetchImpl);

  assert.equal(context.parseVoiceIntentLocally("what payment methods do you accept").action, "unknown");
  await context.handleVoiceAssistantText("what payment methods do you accept");

  assert.equal(utterances.at(-1).text, "You can pay using UPI or cards");
  assert.equal(recognitions.length, 0);
  utterances.at(-1).onend();
  assert.equal(recognitions.length, 1);
  assert.equal(recognitions[0].started, true);
  assert.equal(recognitions[0].continuous, false);
});

test("AI intent lets a natural-language voice order add a product and quantity", async () => {
  const fetchImpl = async () => ({
    ok: true,
    json: async () => ({ action: "add_to_cart", product: "Tomato", quantity: 3 }),
  });
  const { context, cartChanges } = createVoiceAssistantHarness(fetchImpl);

  await context.handleVoiceAssistantText("please get me three kilos of tomato");

  assert.deepEqual(cartChanges, [["shop-1", "item-1", 3]]);
  assert.equal(context.window.location.href, "cart.html?voice=checkout");
});

test("asks which shop to order from when a product has multiple listings", () => {
  const { context, utterances, cartChanges, products } = createVoiceAssistantHarness();
  products.push({
    name: "Tomato",
    shopId: "shop-2",
    id: "item-2",
    shopName: "River Farm",
    location: "Madurai",
    price: 35,
    available: true,
    quantity: 8,
  });

  context.startVoiceOrder("Tomato", 2);

  assert.match(utterances.at(-1).text, /more than one shop/);
  context.handleVoiceShopSelection("second", {
    productName: "Tomato",
    quantity: 2,
    candidates: products.map(({ id, shopId, name, shopName, location }) => ({
      id, shopId, name, shopName, location,
    })),
  });

  assert.deepEqual(cartChanges, [["shop-2", "item-2", 2]]);
});

test("quantity parser accepts spoken English and Tamil number words", () => {
  const { context } = createVoiceAssistantHarness();

  assert.equal(context.parseVoiceQuantity("three"), 3);
  assert.equal(context.parseVoiceQuantity("மூன்று"), 3);
  assert.equal(context.sanitizeSpeechInput("வணக்கம் தமிழ்"), "வணக்கம் தமிழ்");
});
