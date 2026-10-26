# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The primary audience is still an open decision. The current workflows serve people who want to show a sign to the camera and read its text, or look up a Spanish word and watch its sign in LSB (Bolivian Sign Language).

## Product Purpose

SOCITEC's bilateral translation MVP demonstrates two directions between Spanish text and a limited LSB vocabulary. Success means that a person can quickly open the camera workflow and see a recognized word, or find a supported dictionary entry and play its sign video.

## Capabilities and Constraints

- The web client offers sign-to-text and text-to-sign workflows.
- The sign recognition model currently recognizes three actions: Hola, Gracias, and Te amo.
- The text-to-sign dictionary contains ten entries with video URLs; availability and correctness of each video must be maintained with the dictionary.
- Sign-to-text uses browser camera permission, MediaPipe processing in a worker, and a FastAPI prediction service.
- The project is an MVP. Do not present the current model as a general-purpose or continuous LSB translator.
- The primary audience and any formal accessibility conformance target are undecided.

## Brand Commitments

- The organization is SOCITEC, Sociedad Científica de Ingeniería de Sistemas y Tecnología at Universidad Autónoma Tomás Frías in Potosí, Bolivia.
- Product language is Spanish.
- LSB boliviana is the sign-language variety represented by the current dataset and videos, as confirmed by the product owner.

## Evidence on Hand

- The sign dictionary and word-to-sign video mapping are in `client/src/lib/sign-dictionary.ts`.
- The current sign-to-text experience and its supported actions are in `client/src/components/organisms/StreamVideo.tsx`.
- Existing video assets are stored in `client/public/videos/`.
- No user studies, measured accuracy reports, or verified accessibility conformance report were supplied.

## Product Principles

- Make the camera workflow the fastest path into translation.
- Keep both translation directions available from one workspace.
- State supported vocabulary and model limits plainly.
- Keep camera use under the user's explicit control.
- Make translated speech visible as readable text and preserve keyboard access.

## Accessibility & Inclusion

The interface must support keyboard operation, visible focus, readable contrast, clear camera permission and error recovery, and text announcements for changing recognition results. No formal WCAG conformance level has been confirmed.
