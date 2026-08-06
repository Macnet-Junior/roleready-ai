"""Explicit, user-run Gemini text-generation compatibility probe."""
import os
import sys
from dotenv import load_dotenv
from google import genai
from google.genai import errors, types

MAX_CANDIDATES = 6
VERSIONS = ("v1beta", "v1")
EXCLUDED = ("embedding", "image", "imagen", "tts", "audio", "live", "vision", "robotics")

def is_text_candidate(model):
    name = (model.name or "").lower()
    actions = [str(a).lower().replace("_", "") for a in (model.supported_actions or [])]
    return any("generatecontent" in a for a in actions) and not any(x in name for x in EXCLUDED)

def rank(name):
    value = name.lower()
    preferred = ("flash" in value, "lite" not in value, "preview" not in value, "2.5" in value)
    return tuple(not item for item in preferred) + (value,)

def probe_version(key, api_version):
    client = genai.Client(api_key=key, http_options=types.HttpOptions(api_version=api_version))
    try:
        candidates = sorted((m for m in client.models.list() if is_text_candidate(m)), key=lambda m: rank(m.name or ""))[:MAX_CANDIDATES]
        results = []
        for model in candidates:
            name = model.name or ""
            try:
                response = client.models.generate_content(
                    model=name,
                    contents="Reply with exactly OK.",
                    config=types.GenerateContentConfig(max_output_tokens=8, temperature=0),
                )
                results.append((name, 200 if response.candidates else "EMPTY"))
            except errors.APIError as exc:
                results.append((name, int(getattr(exc, "code", 0) or 0)))
            except Exception as exc:
                results.append((name, type(exc).__name__))
        return results
    finally:
        client.close()

def main():
    load_dotenv()
    key = os.getenv("GEMINI_API_KEY")
    if not key:
        print("GEMINI_API_KEY is not configured in .env", file=sys.stderr)
        return 1
    working = []
    for version in VERSIONS:
        print(f"API version: {version}")
        try:
            results = probe_version(key, version)
        except errors.APIError as exc:
            print(f"  catalog status: {int(getattr(exc, 'code', 0) or 0)}")
            continue
        except Exception as exc:
            print(f"  catalog error: {type(exc).__name__}")
            continue
        if not results:
            print("  no sensible text generateContent candidates returned")
        for name, status in results:
            print(f"  {status!s:>5}  {name}")
            if status == 200:
                working.append((version, name))
    if working:
        version, name = working[0]
        print("\nRecommended confirmed configuration:")
        print(f"GEMINI_API_VERSION={version}")
        print(f"GEMINI_MODEL={name}")
        return 0
    print("\nNo tested catalog model successfully generated text.")
    print("This indicates a Gemini Developer API key/project entitlement or endpoint restriction, not an app schema issue.")
    print("Confirm the key was created in Google AI Studio and that the Generative Language API is enabled for its project.")
    return 2

if __name__ == "__main__":
    raise SystemExit(main())
