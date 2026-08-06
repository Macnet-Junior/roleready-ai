import ipaddress
import json
import socket
from urllib.parse import urljoin, urlsplit
import anyio
import httpx
from bs4 import BeautifulSoup

MAX_RESPONSE_BYTES=2*1024*1024
MAX_JOB_CHARS=50_000
MAX_REDIRECTS=3
ALLOWED_TYPES=("text/html","text/plain")
class JobFetchError(ValueError): pass

def _validate_url_shape(url):
 parts=urlsplit(url)
 if parts.scheme.lower()!="https":
  raise JobFetchError("Job URLs must use HTTPS.")
 if not parts.hostname or parts.username or parts.password:
  raise JobFetchError("Enter a valid public HTTPS job-posting URL.")
 if parts.port not in (None,443):
  raise JobFetchError("Only standard HTTPS job URLs are supported.")
 return parts

def _validate_public_host(hostname):
 try: records=socket.getaddrinfo(hostname,443,type=socket.SOCK_STREAM)
 except socket.gaierror as exc: raise JobFetchError("The job-posting host could not be resolved.") from exc
 addresses={item[4][0].split("%",1)[0] for item in records}
 if not addresses or any(not ipaddress.ip_address(address).is_global for address in addresses):
  raise JobFetchError("Private, local, or reserved job-posting hosts are blocked.")

def _jsonld_description(soup):
 for tag in soup.find_all("script",attrs={"type":"application/ld+json"}):
  try: payload=json.loads(tag.string or "")
  except (json.JSONDecodeError,TypeError): continue
  items=payload if isinstance(payload,list) else [payload]
  for item in items:
   if isinstance(item,dict) and item.get("@type")=="JobPosting" and item.get("description"):
    return BeautifulSoup(str(item["description"]),"html.parser").get_text("\n",strip=True)
 return ""

def _extract_html(html):
 soup=BeautifulSoup(html,"html.parser")
 structured=_jsonld_description(soup)
 if structured: text=structured
 else:
  for tag in soup(["script","style","noscript","svg","nav","footer","header","form"]): tag.decompose()
  target=soup.find("main") or soup.find("article") or soup.body or soup
  text=target.get_text("\n",strip=True)
 lines=[];seen=set()
 for line in text.splitlines():
  clean=" ".join(line.split())
  if clean and clean not in seen: lines.append(clean);seen.add(clean)
 return "\n".join(lines)

async def fetch_job_description(url):
 current=url.strip()
 async with httpx.AsyncClient(follow_redirects=False,timeout=httpx.Timeout(8,connect=4),
  headers={"User-Agent":"ResumeOptimizer/1.0 (job-description preview)"},trust_env=False) as client:
  for redirect_count in range(MAX_REDIRECTS+1):
   parts=_validate_url_shape(current)
   await anyio.to_thread.run_sync(_validate_public_host,parts.hostname)
   async with client.stream("GET",current) as response:
    if response.status_code in {301,302,303,307,308}:
     if redirect_count==MAX_REDIRECTS: raise JobFetchError("The job URL redirected too many times.")
     location=response.headers.get("location")
     if not location: raise JobFetchError("The job URL returned an invalid redirect.")
     current=urljoin(current,location)
     continue
    if response.status_code in {401,403}: raise JobFetchError("This posting requires login or blocks automated access. Paste the job description instead.")
    if response.status_code==404: raise JobFetchError("The job posting was not found.")
    if response.status_code>=400: raise JobFetchError(f"The job site returned HTTP {response.status_code}. Paste the description instead.")
    content_type=response.headers.get("content-type","").split(";",1)[0].lower()
    if content_type not in ALLOWED_TYPES: raise JobFetchError("The URL did not return an HTML or text job posting.")
    length=response.headers.get("content-length")
    if length and int(length)>MAX_RESPONSE_BYTES: raise JobFetchError("The job-posting page is too large to process.")
    chunks=[];size=0
    async for chunk in response.aiter_bytes():
     size+=len(chunk)
     if size>MAX_RESPONSE_BYTES: raise JobFetchError("The job-posting page is too large to process.")
     chunks.append(chunk)
    raw=b"".join(chunks).decode(response.encoding or "utf-8",errors="replace")
   text=raw.strip() if content_type=="text/plain" else _extract_html(raw)
   if len(text)<100: raise JobFetchError("Too little readable job text was found. The site may require login or JavaScript; paste the description instead.")
   lowered=text.lower()
   if len(text)<500 and any(p in lowered for p in ("enable javascript","sign in to continue","log in to continue")):
    raise JobFetchError("This site requires login or JavaScript. Paste the job description instead.")
   if len(text)>MAX_JOB_CHARS: text=text[:MAX_JOB_CHARS].rsplit("\n",1)[0]
   return current,text
 raise JobFetchError("The job posting could not be retrieved.")
