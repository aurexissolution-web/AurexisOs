import assert from "node:assert/strict";
import test from "node:test";
import { shouldHideChatbot } from "../src/components/ui/chatbot-visibility.ts";

test("hides the chatbot throughout the Sanjay route namespace", () => {
  assert.equal(shouldHideChatbot("/sanjay"), true);
  assert.equal(shouldHideChatbot("/sanjay/contact"), true);
});

test("preserves existing protected-route exclusions", () => {
  assert.equal(shouldHideChatbot("/login"), true);
  assert.equal(shouldHideChatbot("/portal"), true);
  assert.equal(shouldHideChatbot("/portal/admin"), true);
});

test("keeps the chatbot visible on other public routes", () => {
  assert.equal(shouldHideChatbot("/"), false);
  assert.equal(shouldHideChatbot("/services"), false);
  assert.equal(shouldHideChatbot("/sanjay-profile"), false);
});

test("hides the floating chatbot on /solutions, which has its own chat", () => {
  assert.equal(shouldHideChatbot("/solutions"), true);
  assert.equal(shouldHideChatbot("/solutions/"), true);
  assert.equal(shouldHideChatbot("/solutions/presence"), false);
  assert.equal(shouldHideChatbot("/solutions/ai-readiness-audit"), false);
});
