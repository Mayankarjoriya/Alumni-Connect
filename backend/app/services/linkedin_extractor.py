"""
LinkedIn profile data extraction service.
Supports extracting public profile metadata (OpenGraph, Schema.org JSON-LD Person data,
and Social Link Preview data), bypassing authwalls via social crawler emulation,
and parsing pasted LinkedIn profile snippets.
"""

import re
import json
import html
import logging
from typing import Dict, Any, List, Optional
import httpx
from bs4 import BeautifulSoup

logger = logging.getLogger("linkedin_extractor")

# Common technical, AI/ML, and academic skills to identify from profile text
COMMON_SKILLS_DICTIONARY = [
    # Programming Languages
    "Python", "JavaScript", "TypeScript", "Java", "C++", "C#", "C", "Go", "Rust", "Swift", "Kotlin", "SQL",
    # AI / ML / Data Science
    "Machine Learning", "Deep Learning", "Reinforcement Learning", "NLP", "Natural Language Processing",
    "Computer Vision", "Artificial Intelligence", "Generative AI", "LLMs", "Large Language Models",
    "Data Science", "Neural Networks", "PyTorch", "TensorFlow", "Keras", "Scikit-Learn", "OpenCV",
    "Transformers", "Hugging Face", "Pandas", "NumPy",
    # Web & Backend
    "React", "Node.js", "FastAPI", "Django", "Flask", "Express", "Next.js", "Vue.js", "Tailwind CSS",
    "HTML5", "CSS3", "REST APIs", "GraphQL", "WebSockets",
    # Databases & Cloud / DevOps
    "PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite", "Docker", "Kubernetes", "AWS", "Azure", "GCP",
    "Git", "GitHub", "Linux", "CI/CD", "DevOps",
    # Management & Soft Skills
    "Project Management", "Agile", "Scrum", "Product Management", "Leadership", "Cybersecurity", "Blockchain"
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
    """Scan text against a curated skills dictionary."""
    if not text:
        return []
    found_skills = []
    text_lower = f" {text.lower()} "
    for skill in COMMON_SKILLS_DICTIONARY:
        pattern = r"\b" + re.escape(skill.lower()) + r"\b"
        if re.search(pattern, text_lower):
            if skill not in found_skills:
                found_skills.append(skill)
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

    # Parse title like: "Mayank Rajoriya - Sabudh Foundation | LinkedIn"
    if og_title:
        title_clean = re.sub(r"\s*\|\s*LinkedIn\s*$", "", og_title, flags=re.IGNORECASE).strip()
        if " - " in title_clean:
            parts = title_clean.split(" - ", 1)
            if not name:
                name = parts[0].strip()
            if not company:
                company = parts[1].strip()
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
            clean_bio = re.sub(r"<br\s*/?>", "\n", headline_candidate, flags=re.IGNORECASE)
            bio = clean_bio

    # Clean up designation from headline if empty
    if headline and not designation:
        # Check patterns like "Role at Company" or "Role | Details"
        role_part = headline
        if "|" in role_part:
            role_part = role_part.split("|")[0].strip()
        elif "•" in role_part:
            role_part = role_part.split("•")[0].strip()
        
        # Remove leading emoji/symbols from designation
        clean_role = re.sub(r"^[^\w]+", "", role_part).strip()
        match = re.search(r"^(.*?)\s+(?:at|@)\s+(.*?)$", clean_role, re.IGNORECASE)
        if match:
            designation = match.group(1).strip()
            if not company:
                company = match.group(2).strip()
        else:
            designation = clean_role

    # Extract detected skills from all text corpus
    combined_corpus = f"{name} {headline} {designation} {company} {bio} {' '.join(education)}"
    skills = extract_skills_from_text(combined_corpus)

    return {
        "name": name.strip() if name else None,
        "headline": headline.strip() if headline else None,
        "designation": designation.strip() if designation else None,
        "company": company.strip() if company else None,
        "bio": re.sub(r"<br\s*/?>", "\n", bio).strip() if bio else None,
        "location": location.strip() if location else None,
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
    # Social preview agents bypass Cloudflare / HTTP 999 authwalls because LinkedIn allows rich link unfurling.
    USER_AGENTS = [
        "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
        "Twitterbot/1.0",
        "WhatsApp/2.21.12.21 A",
        "Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    ]

    last_error_message = None

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
                    if extracted.get("name") or extracted.get("headline") or extracted.get("bio"):
                        return {
                            "success": True,
                            "data": extracted,
                            "message": f"Successfully extracted details for {extracted.get('name') or 'user'}."
                        }

        except Exception as e:
            last_error_message = str(e)
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


def parse_pasted_linkedin_text(text: str) -> Dict[str, Any]:
    """
    Parse a pasted snippet of LinkedIn profile text (e.g. copied from LinkedIn or resume).
    """
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
