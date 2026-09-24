# Hide Chatbot on Founder Card Routes

## Goal

Remove the global “Ask Aurexis” chatbot widget from the founder-card route namespace so it does not compete with the card’s focused contact actions.

## Scope

- Hide the chatbot when the pathname is exactly `/sanjay`.
- Hide the chatbot on every nested route under `/sanjay/`.
- Keep the chatbot unchanged on all other public routes.
- Preserve the existing exclusions for `/login` and `/portal/*`.

## Design

Keep route visibility centralized in `ChatbotWidget`. Extend its existing pathname guard with a `/sanjay` namespace check instead of adding a route-specific layout or configuration layer.

The widget renders nothing when any of these conditions is true:

- pathname is `/login`;
- pathname starts with `/portal`;
- pathname is `/sanjay`;
- pathname starts with `/sanjay/`.

No styling, founder-card layout, chatbot internals, or backend behavior changes.

## Verification

- Confirm “Ask Aurexis” is absent on `/sanjay`.
- Confirm the namespace predicate covers a representative nested path such as `/sanjay/example`.
- Confirm “Ask Aurexis” remains present on `/`.
- Run application lint and build checks.

