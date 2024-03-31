import requests
from bs4 import BeautifulSoup
import fitz

class ContentScraper:
    @staticmethod
    def scrape_site(url):
        try:
            response = requests.get(url)
            response.raise_for_status()
            return BeautifulSoup(response.content, 'lxml')
        except Exception as e:
            print(f"Error scraping site: {e}")
            return None

    @staticmethod
    def extract_content(soup):
        if soup is None:
            return ""
        # Try to detect and use the main content area to reduce nav/footer content.
        main_content_selectors = ['main', 'article', 'div#content', 'div.content']
        main_content = None
        for selector in main_content_selectors:
            main_content = soup.select_one(selector)
            if main_content:
                break  # Stop if we find a main content area
        
        if not main_content:
            main_content = soup  # Fallback to entire soup if no main content detected

        content_list = []  # Store all sections
        current_section = None
        all_content_str = ""  # For final single string output
        encountered_content = set()  # Track encountered content to avoid duplicates

        # Focus on tags that are less likely to be nested or contain duplicates
        for tag in main_content.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'li', 'span']):
            # Skip likely nav/footer tags based on their class or id
            if any(keyword in ' '.join(tag.get('class', [])) + tag.get('id', '') for keyword in ['nav', 'footer']):
                continue

            # Create a hash of the tag's text and name to check for duplicates
            tag_content_hash = hash((tag.name, tag.get_text(separator=' ', strip=True)))
            if tag_content_hash in encountered_content:
                continue
            encountered_content.add(tag_content_hash)

            # Process text and links if any
            text = tag.get_text(separator=' ', strip=True)
            href = tag.get('href', '')
            full_text = f'{text} {href}'.strip() if href else text

            if full_text:
                if tag.name.startswith('h') and tag.name[1:].isdigit():
                    current_section = {'title': full_text, 'content': []}
                    content_list.append(current_section)
                    all_content_str += "\n\n" + full_text + "\n"  # New section in final string
                else:
                    if current_section is None:
                        current_section = {'title': 'General', 'content': []}
                        content_list.append(current_section)
                    current_section['content'].append(full_text)
                    all_content_str += full_text + " "  # Continue current section content   
        return all_content_str

    @staticmethod
    def extract_text_from_pdf(file):
        doc = fitz.open(stream=file.read(), filetype="pdf")
        text = ""
        for page in doc:
            text += page.get_text()
        doc.close()
        return text
