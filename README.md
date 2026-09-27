A small red-teaming prototype for replicating vishing attacks on TTS agents. Created a mock-voice agent with something to protect, and ran attacks against it to see what would happen. Attack list and frontend React frontend built with Claude.
Attacks are separated into:
Direct prompt injection - outright trying to override commands given to the chatbot agent
Authority impersonation - pretending to be IT support, worker, etc to gain access
Multi-turn social engineering - trying to build rapport and trust with the chatbot, to persuade it to leak information
ASR-exploits - setences and words designed to be mis-heard during speech-to-text, to get the agent to slip up

Each attack is scored with a SUCCESS/FAILURE with both a heuristic (do certain forbidden words appear in the agent response), and also an analysis of the conversation with anthropic api, claude-sonnet-4-6.
Created an API with FastAPI and Pydantic to run the attacks against, and logged them in results.json
Created a React/TS frontend to represent each attack, flagging any attacks that got through.

For ASR-exploit attacjs specifically, I also used google's web speech API to test whether reading out the ASR attacks would lead to it being picked up differently.

What happened:

Every attack was defended against by the agent; it never leaked the code or gave any information that it wasn't meant to give. It correctly demanded verification on each turn of the multi-turn attacks, and didn't give into pressure or other common tactics.

I planned one more validation step that I didn't get into - slowly weakening the AI agent's prompt, to allow slipups to happen, and running the attacks against each version, to confirm that the suite I created doesn't unconditionally give out passes.

<img width="751" height="246" alt="image" src="https://github.com/user-attachments/assets/4674bfe6-4f74-4433-a145-ccd0d6482d6d" />
<img width="781" height="365" alt="image" src="https://github.com/user-attachments/assets/469ca4d1-443c-47cd-bf58-6c388a53a21d" />
<img width="1682" height="885" alt="image" src="https://github.com/user-attachments/assets/3bd0f970-3023-4246-8cb9-697ee295b594" />

<img width="655" height="297" alt="image" src="https://github.com/user-attachments/assets/e5d9a7d5-942f-4926-aa38-47afce665a78" />
