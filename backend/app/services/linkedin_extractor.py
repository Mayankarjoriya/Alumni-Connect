"""
LinkedIn profile data extraction service.
Supports extracting public profile metadata (OpenGraph, Schema.org JSON-LD Person data,
and Social Link Preview data), bypassing authwalls via social crawler emulation,
intelligent skill mining from posts/corpus, and parsing pasted LinkedIn profile snippets.
"""

import re
import json
import html
import logging
from typing import Dict, Any, List, Optional
import httpx
from bs4 import BeautifulSoup
from app.core.config import settings

logger = logging.getLogger("linkedin_extractor")

# Pattern-based skills dictionary for high-precision extraction
SKILL_PATTERNS = [
    # AI / ML / Data Science
    ("Artificial Intelligence", [r"\bAI\b", r"\bAI/ML\b", r"artificial\s*intelligence"]),
    ("Machine Learning", [r"\bML\b", r"\bAI/ML\b", r"machine\s*learning"]),
    ("Deep Learning", [r"deep\s*learning"]),
    ("Reinforcement Learning", [r"reinforcement\s*learning"]),
    ("Computer Vision", [r"computer\s*vision", r"\bOCR\b"]),
    ("NLP", [r"\bNLP\b", r"natural\s*language\s*processing"]),
    ("LLMs", [r"\bLLMs?\b", r"large\s*language\s*models?"]),
    ("Generative AI", [r"generative\s*ai", r"\bGenAI\b"]),
    ("Agentic AI", [r"agentic\s*ai", r"\bAI\s*Agents?\b"]),
    ("Data Science", [r"data\s*science", r"data\s*analytics"]),
    ("PyTorch", [r"\bPyTorch\b"]),
    ("TensorFlow", [r"\bTensorFlow\b"]),
    ("Keras", [r"\bKeras\b"]),
    ("Scikit-Learn", [r"scikit-learn|sklearn"]),
    ("OpenCV", [r"\bOpenCV\b"]),
    ("Transformers", [r"\bTransformers?\b", r"hugging\s*face"]),
    
    # Core CS & Web
    ("Computer Science", [r"computer\s*science", r"\bCSE\b"]),
    ("Python", [r"\bPython\b"]),
    ("JavaScript", [r"\bJavaScript\b", r"\bJS\b"]),
    ("TypeScript", [r"\bTypeScript\b", r"\bTS\b"]),
    ("Java", [r"\bJava\b"]),
    ("C++", [r"\bC\+\+\b"]),
    ("C#", [r"\bC#\b"]),
    ("C", [r"\bC\s*programming\b", r"\bC\s*language\b"]),
    ("Go", [r"\bGolang\b", r"\bGo\s*language\b"]),
    ("Rust", [r"\bRust\b"]),
    ("SQL", [r"\bSQL\b"]),
    ("PostgreSQL", [r"postgres(?:ql)?"]),
    ("MySQL", [r"mysql"]),
    ("MongoDB", [r"mongodb"]),
    ("Redis", [r"redis"]),
    ("React", [r"\bReact(?:\.js)?\b"]),
    ("Node.js", [r"\bNode(?:\.js)?\b"]),
    ("FastAPI", [r"\bFastAPI\b"]),
    ("Django", [r"\bDjango\b"]),
    ("Flask", [r"\bFlask\b"]),
    ("Next.js", [r"\bNext(?:\.js)?\b"]),
    ("Tailwind CSS", [r"tailwind(?:\s*css)?"]),
    ("HTML5", [r"\bHTML5?\b"]),
    ("CSS3", [r"\bCSS3?\b"]),
    ("REST APIs", [r"rest(?:ful)?\s*apis?"]),
    ("GraphQL", [r"\bGraphQL\b"]),
    
    # Cloud & DevOps
    ("AWS", [r"\bAWS\b", r"amazon\s*web\s*services"]),
    ("Azure", [r"\bAzure\b"]),
    ("GCP", [r"\bGCP\b", r"google\s*cloud"]),
    ("Docker", [r"docker"]),
    ("Kubernetes", [r"kubernetes|\bk8s\b"]),
    ("Git", [r"\bGit\b", r"github"]),
    ("Linux", [r"linux"]),
    ("CI/CD", [r"ci/cd"]),
    
    # Management & Professional
    ("Project Management", [r"project\s*management"]),
    ("Agile", [r"\bagile\b"]),
    ("Scrum", [r"\bscrum\b"]),
    ("Cybersecurity", [r"cybersecurity|cyber\s*security"]),
    ("Blockchain", [r"blockchain"]),
]


def clean_linkedin_url(url: str) -> Optional[str]:
    """Extract and canonicalize a LinkedIn profile URL."""
    if not url:
        return None
    url = url.strip()
    match = re.search(r"linkedin\.com/in/([a-zA-Z0-9_\-%]+)", url, re.IGNORECASE)
    if not match:
        return None
    slug = match.group(1).rstrip("/")
    return f"https://www.linkedin.com/in/{slug}"


def extract_skills_from_text(text: str) -> List[str]:
    """Scan text against pattern-based skill definitions."""
    if not text:
        return []
    found_skills = []
    for skill_name, patterns in SKILL_PATTERNS:
        for p in patterns:
            if re.search(p, text, re.IGNORECASE):
                if skill_name not in found_skills:
                    found_skills.append(skill_name)
                break
    return found_skills


def extract_from_public_html(html_content: str, url: str) -> Dict[str, Any]:
    """Parse LinkedIn HTML to extract Person schema, social preview metadata, and OpenGraph tags."""
    soup = BeautifulSoup(html_content, "html.parser")

    name = ""
    headline = ""
    designation = ""
    company = ""
    bio = ""
    location = ""
    profile_pic = ""
    graduation_year = ""
    education: List[str] = []

    # 1. Inspect Schema.org JSON-LD for Person entity
    for script in soup.find_all("script", type="application/ld+json"):
        try:
            data = json.loads(script.string or "{}")
            items = []
            if isinstance(data, dict):
                if data.get("@type") == "Person":
                    items.append(data)
                elif "@graph" in data and isinstance(data["@graph"], list):
                    items.extend([i for i in data["@graph"] if isinstance(i, dict) and i.get("@type") == "Person"])

            for person in items:
                if not name and person.get("name"):
                    name = person.get("name")
                
                # Bio / Description
                if not bio and person.get("description"):
                    bio = person.get("description")

                # Job titles / Designation
                job_titles = person.get("jobTitle")
                if job_titles:
                    if isinstance(job_titles, list) and len(job_titles) > 0:
                        designation = job_titles[0]
                        headline = ", ".join(job_titles[:2])
                    elif isinstance(job_titles, str):
                        designation = job_titles
                        headline = job_titles

                # WorksFor / Company
                works_for = person.get("worksFor")
                if works_for:
                    if isinstance(works_for, list) and len(works_for) > 0:
                        first_org = works_for[0]
                        if isinstance(first_org, dict) and first_org.get("name"):
                            company = first_org.get("name").strip()
                    elif isinstance(works_for, dict) and works_for.get("name"):
                        company = works_for.get("name").strip()

                # AlumniOf / College
                alumni_of = person.get("alumniOf")
                if alumni_of:
                    if isinstance(alumni_of, list):
                        for org in alumni_of:
                            if isinstance(org, dict) and org.get("name"):
                                education.append(org.get("name"))
                            elif isinstance(org, str):
                                education.append(org)
                    elif isinstance(alumni_of, dict) and alumni_of.get("name"):
                        education.append(alumni_of.get("name"))

                # Location / Address
                address = person.get("address")
                if address and isinstance(address, dict):
                    locality = address.get("addressLocality")
                    country = address.get("addressCountry")
                    if locality and country:
                        location = f"{locality}, {country}" if not locality.endswith(country) else locality
                    elif locality:
                        location = locality
                    elif country:
                        location = country

                # Image
                image_obj = person.get("image")
                if image_obj:
                    if isinstance(image_obj, dict) and image_obj.get("contentUrl"):
                        profile_pic = image_obj.get("contentUrl")
                    elif isinstance(image_obj, str):
                        profile_pic = image_obj

        except Exception as e:
            logger.debug(f"JSON-LD parsing error: {e}")

    # 2. OpenGraph / Twitter meta tags & preview metadata
    og_title_tag = soup.find("meta", property="og:title") or soup.find("meta", attrs={"name": "title"}) or soup.find("meta", attrs={"name": "twitter:title"})
    og_desc_tag = soup.find("meta", property="og:description") or soup.find("meta", attrs={"name": "description"}) or soup.find("meta", attrs={"name": "twitter:description"})
    og_img_tag = soup.find("meta", property="og:image") or soup.find("meta", attrs={"name": "twitter:image"})

    og_title = html.unescape(og_title_tag["content"].strip()) if og_title_tag and og_title_tag.has_attr("content") else ""
    og_desc = html.unescape(og_desc_tag["content"].strip()) if og_desc_tag and og_desc_tag.has_attr("content") else ""
    og_desc = re.sub(r"<br\s*/?>", "\n", og_desc, flags=re.IGNORECASE)
    og_img = og_img_tag["content"].strip() if og_img_tag and og_img_tag.has_attr("content") else ""

    if not profile_pic and og_img:
        profile_pic = og_img

    # Parse title like:
    # "Mayank Rajoriya - Sabudh Foundation | LinkedIn"
    # or "JAVVAJI BHUVI - Hyderabad, Telangana, India | Professional Profile | LinkedIn"
    if og_title:
        title_clean = re.sub(r"\s*\|\s*(?:Professional Profile\s*\|\s*)?LinkedIn\s*$", "", og_title, flags=re.IGNORECASE)
        title_clean = re.sub(r"\s*\|\s*Professional Profile\s*$", "", title_clean, flags=re.IGNORECASE).strip()
        
        if " - " in title_clean:
            parts = title_clean.split(" - ", 1)
            if not name:
                name = parts[0].strip()
            second_part = parts[1].strip()

            # Location detection heuristics:
            # If the subtitle contains known geography words or comma-separated regions, it is LOCATION, not company!
            loc_indicators = [
                'india', 'usa', 'united states', 'hyderabad', 'bangalore', 'mumbai',
                'delhi', 'chennai', 'pune', 'jaipur', 'area', 'region', 'city', 'state'
            ]
            is_location_subtitle = (
                any(ind in second_part.lower() for ind in loc_indicators) or
                ("," in second_part and len(second_part.split(",")) >= 2)
            )

            if is_location_subtitle:
                if not location:
                    location = second_part
            else:
                if not company:
                    company = second_part
        elif not name:
            name = title_clean

    # Parse description which LinkedIn structures for social crawlers:
    # "Headline\nSummary... · Experience: Company · Education: College · Location: City · Connections..."
    if og_desc:
        # Extract Experience
        exp_m = re.search(r"·\s*Experience:\s*([^·]+)", og_desc)
        if exp_m:
            company = exp_m.group(1).strip()

        # Extract Education
        edu_m = re.search(r"·\s*Education:\s*([^·]+)", og_desc)
        if edu_m:
            edu_school = edu_m.group(1).strip()
            if edu_school not in education:
                education.append(edu_school)

        # Extract Location
        loc_m = re.search(r"·\s*Location:\s*([^·]+)", og_desc)
        if loc_m and not location:
            location = loc_m.group(1).strip()

        # Extract Headline part (everything before the first '·' or before 'Experience:')
        headline_candidate = og_desc.split("·")[0].strip()
        if not headline:
            # First line of headline candidate
            first_line = headline_candidate.split("\n")[0].strip()
            headline = first_line

        if not bio:
            bio = headline_candidate

    # Clean up designation from headline if empty
    if headline and not designation:
        role_part = headline
        if "|" in role_part:
            role_part = role_part.split("|")[0].strip()
        elif "•" in role_part:
            role_part = role_part.split("•")[0].strip()
        
        # Remove leading emoji/symbols from designation
        clean_role = re.sub(r"^[^\w]+", "", role_part).strip()
        clean_role = re.sub(r"^I['’]m (?:a|an)\s+", "", clean_role, flags=re.IGNORECASE)
        clean_role = re.sub(r"\s+from the Class of \d{4}.*$", "", clean_role, flags=re.IGNORECASE)
        clean_role = re.sub(r",\s*passionate about.*$", "", clean_role, flags=re.IGNORECASE)
        clean_role = re.sub(r"[…\.]+$", "", clean_role).strip()
        match = re.search(r"^(.*?)\s+(?:at|@)\s+(.*?)$", clean_role, re.IGNORECASE)
        if match:
            designation = match.group(1).strip()
            if not company:
                company = match.group(2).strip()
        else:
            designation = clean_role

    # Detect graduation year (e.g. "Class of 2026", "Batch of 2024")
    grad_m = re.search(r"\b(?:Class of|Batch of|Graduating in|Graduation:?)\s*(20\d\d)\b", f"{headline} {bio}", re.IGNORECASE)
    if grad_m:
        graduation_year = grad_m.group(1)

    # Gather full visible page corpus to extract maximum skill signals (including public posts and hashtags)
    main_el = soup.find("main") or soup.find("body")
    page_text = main_el.get_text(separator=" ", strip=True) if main_el else ""
    combined_corpus = f"{name} {headline} {designation} {company} {bio} {' '.join(education)} {page_text}"
    skills = extract_skills_from_text(combined_corpus)

    return {
        "name": name.strip() if name else None,
        "headline": headline.strip() if headline else None,
        "designation": designation.strip() if designation else None,
        "company": company.strip() if company else None,
        "bio": re.sub(r"<br\s*/?>", "\n", bio).strip() if bio else None,
        "location": location.strip() if location else None,
        "graduation_year": graduation_year if graduation_year else None,
        "profile_picture_url": profile_pic if profile_pic else None,
        "education": education,
        "skills": skills,
        "skills_string": ", ".join(skills) if skills else "",
        "linkedin_url": url,
        "source": "public_metadata"
    }


async def fetch_linkedin_profile(url: str) -> Dict[str, Any]:
    """
    Fetch and extract profile information from a LinkedIn public profile URL.
    Uses multi-agent social preview emulation to bypass the 999 authwall on standard profiles.
    """
    canonical_url = clean_linkedin_url(url)
    if not canonical_url:
        raise ValueError("Please provide a valid LinkedIn profile URL (e.g., https://www.linkedin.com/in/username)")

    # User agents to try sequentially:
    USER_AGENTS = [
        "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
        "Twitterbot/1.0",
        "WhatsApp/2.21.12.21 A",
        "Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    ]

    for ua in USER_AGENTS:
        headers = {
            "User-Agent": ua,
            "Accept": "*/*",
            "Accept-Language": "en-US,en;q=0.9",
        }

        try:
            async with httpx.AsyncClient(follow_redirects=True, timeout=10.0) as client:
                response = await client.get(canonical_url, headers=headers)
                final_url = str(response.url)

                # Skip if authwall or blocked on this particular UA
                if (
                    response.status_code in [429, 999] or
                    "/authwall" in final_url or
                    "/checkpoint/" in final_url or
                    ("login" in final_url.lower() and "linkedin.com" in final_url)
                ):
                    continue

                if response.status_code == 200:
                    extracted = extract_from_public_html(response.text, canonical_url)
                    
                    # If an LLM API key (DeepSeek / Groq / OpenRouter) is configured, use it for deep AI extraction
                    if settings.LLM_API_KEY and settings.LLM_API_KEY.strip():
                        soup = BeautifulSoup(response.text, "html.parser")
                        main_el = soup.find("main") or soup.find("body")
                        page_text = main_el.get_text(separator=" ", strip=True) if main_el else ""
                        og_desc_el = soup.find("meta", property="og:description")
                        og_desc_txt = og_desc_el["content"] if og_desc_el and og_desc_el.has_attr("content") else ""
                        raw_corpus = f"{extracted.get('headline')} {og_desc_txt} {page_text}"

                        ai_data = await extract_with_llm(raw_corpus)
                        if ai_data and (ai_data.get("name") or ai_data.get("headline")):
                            # Preserve OpenGraph profile photo & canonical URL
                            ai_data["profile_picture_url"] = extracted.get("profile_picture_url")
                            ai_data["linkedin_url"] = canonical_url
                            ai_data["skills_string"] = ", ".join(ai_data.get("skills", []))
                            return {
                                "success": True,
                                "data": ai_data,
                                "message": f"Successfully extracted details for {ai_data.get('name') or 'user'} using {settings.LLM_MODEL} AI."
                            }

                    if extracted.get("name") or extracted.get("headline") or extracted.get("bio"):
                        return {
                            "success": True,
                            "data": extracted,
                            "message": f"Successfully extracted details for {extracted.get('name') or 'user'}."
                        }

        except Exception:
            continue

    # If all automated user-agents encountered authwalls
    return {
        "success": False,
        "is_authwall": True,
        "linkedin_url": canonical_url,
        "message": (
            "LinkedIn restricted anonymous access to this profile. "
            "You can paste your profile summary or experience text directly in the modal to autofill."
        )
    }


async def extract_with_llm(raw_text: str) -> Optional[Dict[str, Any]]:
    """
    Use an OpenAI-compatible LLM endpoint (DeepSeek, Groq, OpenRouter) to extract
    structured profile details from raw profile text, resume snippets, or HTML.
    """
    if not settings.LLM_API_KEY or not settings.LLM_API_KEY.strip():
        return None

    endpoint = f"{settings.LLM_BASE_URL.rstrip('/')}/chat/completions"
    headers = {
        "Authorization": f"Bearer {settings.LLM_API_KEY.strip()}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5173",
        "X-Title": "Alumni Connect"
    }

    prompt = f"""You are an expert resume and academic profile parser. Analyze the following profile text or web data and extract clean, structured information into JSON.

Profile Text:
\"\"\"
{raw_text[:4000]}
\"\"\"

Output a valid JSON object with the following fields:
- "name": Full name of the person (string or null)
- "headline": Professional headline (string or null)
- "designation": Clean job title or academic role (e.g. 'Software Engineer', 'AI/ML Researcher', 'BS Computer Science student') (string or null)
- "company": Current organization or company worked for. If the person is currently a student and has no active corporate job, set this to null. (string or null)
- "location": City, State, Country (string or null)
- "graduation_year": 4-digit graduation year if mentioned or inferable (string or null)
- "education": Array of university or college names (array of strings)
- "skills": Array of technical, engineering, and academic skills found or inferred from the text (array of strings)
- "bio": A concise, engaging 2-3 sentence biography based on their background (string)

Return ONLY valid JSON with no extra commentary or markdown formatting."""

    payload = {
        "model": settings.LLM_MODEL,
        "messages": [
            {"role": "system", "content": "You are a professional profile information extractor. Always return JSON."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.1,
    }

    try:
        async with httpx.AsyncClient(timeout=12.0) as client:
            # First attempt with json_object format if supported
            resp = await client.post(
                endpoint,
                headers=headers,
                json={**payload, "response_format": {"type": "json_object"}}
            )

            # If model doesn't support response_format (e.g. some HuggingFace/OpenRouter free models)
            if resp.status_code == 400 and ("response_format" in resp.text.lower() or "json" in resp.text.lower()):
                resp = await client.post(endpoint, headers=headers, json=payload)

            if resp.status_code == 200:
                data = resp.json()
                content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
                
                # Extract JSON substring from content
                json_match = re.search(r"\{[\s\S]*\}", content)
                if json_match:
                    parsed = json.loads(json_match.group(0))
                    parsed["source"] = f"{settings.LLM_MODEL}_ai"
                    return parsed
                else:
                    logger.warning(f"No JSON found in LLM response: {content[:200]}")
                    return None
            else:
                logger.warning(f"LLM API ({settings.LLM_MODEL}) returned status {resp.status_code}: {resp.text}")
                return None
    except Exception as e:
        logger.error(f"Error querying LLM API: {e}")
        return None


async def parse_pasted_linkedin_text(text: str) -> Dict[str, Any]:
    """
    Parse a pasted snippet of LinkedIn profile text or resume chunk.
    Uses DeepSeek/LLM if API key is configured, with regex line fallback.
    """
    # 1. Try LLM extraction first if configured
    if settings.LLM_API_KEY and settings.LLM_API_KEY.strip():
        ai_data = await extract_with_llm(text)
        if ai_data and (ai_data.get("name") or ai_data.get("skills")):
            ai_data["skills_string"] = ", ".join(ai_data.get("skills", []))
            return ai_data

    # 2. Heuristic fallback
    lines = [line.strip() for line in text.strip().split("\n") if line.strip()]
    if not lines:
        return {}

    name = lines[0] if len(lines) > 0 else ""
    headline = lines[1] if len(lines) > 1 else ""
    bio = "\n".join(lines[2:]) if len(lines) > 2 else headline
    skills = extract_skills_from_text(text)

    company = ""
    designation = headline
    match = re.search(r"^(.*?)\s+(?:at|@)\s+(.*?)$", headline, re.IGNORECASE)
    if match:
        designation = match.group(1).strip()
        company = match.group(2).strip()

    return {
        "name": name,
        "headline": headline,
        "designation": designation,
        "company": company,
        "bio": bio[:400],
        "skills": skills,
        "skills_string": ", ".join(skills),
        "source": "text_snippet"
    }
