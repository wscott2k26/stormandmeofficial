import { conversationHref } from "./IamConversationsPage";

describe("I AM conversation navigation", () => {
  test("builds the exact encoded resume route", () => {
    expect(conversationHref("2b0aa6ab-d92e-40df-a33a-ea1ec6c535e8"))
      .toBe("/iam/app/talk?conversation=2b0aa6ab-d92e-40df-a33a-ea1ec6c535e8");
  });

  test("requires a conversation id", () => {
    expect(() => conversationHref("")).toThrow("Conversation id is required.");
  });
});
