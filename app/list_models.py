"""Print Gemini generate-content models available to the configured key."""
import os
import sys
from dotenv import load_dotenv
from google import genai
from google.genai import errors

def available_generate_models(client=None):
    key = os.getenv("GEMINI_API_KEY")
    if client is None:
        if not key:
            raise RuntimeError("GEMINI_API_KEY is not configured in .env")
        client = genai.Client(api_key=key)
    names = []
    for model in client.models.list():
        actions = [str(action).lower() for action in (model.supported_actions or [])]
        if any("generatecontent" in action.replace("_", "") for action in actions):
            name = (model.name or "")
            if name:
                names.append(name)
    return sorted(set(names))

def main():
    load_dotenv()
    try:
        names = available_generate_models()
    except errors.APIError as exc:
        code = int(getattr(exc, "code", 0) or 0)
        print(f"Gemini model discovery failed with HTTP {code}.", file=sys.stderr)
        if code in (401, 403):
            print("The key is invalid, restricted, or belongs to a project without Gemini API access.", file=sys.stderr)
        else:
            print("Check that this is a Google AI Studio Gemini API key, not a Vertex AI credential.", file=sys.stderr)
        return 1
    except RuntimeError as exc:
        print(str(exc), file=sys.stderr)
        return 1
    if not names:
        print("No models supporting generateContent were returned for this key.")
        print("Confirm this is a Google AI Studio Gemini API key. Vertex AI uses project/location credentials instead.")
        return 2
    print("Models available for generateContent:")
    for name in names:
        print(f"  {name}")
    print("\nSet GEMINI_MODEL in .env to one exact name from this list.")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
