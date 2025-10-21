import re
from playwright.sync_api import sync_playwright, Page, expect

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Set mobile viewport for the first part of the test
        page.set_viewport_size({"width": 375, "height": 812})

        # Verify mobile links on the homepage
        page.goto("http://localhost:3001", timeout=60000)

        # Wait for the logo to be visible
        expect(page.locator('.link-logo').first).to_be_visible(timeout=60000)

        mobile_links_container = page.locator('div:has-text("Más leídos"):has-text("Más visto ahora")')
        expect(mobile_links_container).to_be_visible()

        mas_leidos_link = mobile_links_container.get_by_role("link", name=re.compile("Más leídos"))
        mas_visto_ahora_link = mobile_links_container.get_by_role("link", name=re.compile("Más visto ahora"))

        expect(mas_leidos_link).to_be_visible()
        expect(mas_visto_ahora_link).to_be_visible()
        page.screenshot(path="jules-scratch/verification/01_mobile_home.png")

        # Set desktop viewport for the rest of the tests
        page.set_viewport_size({"width": 1280, "height": 720})

        # Verify /mas-leidos page
        page.on("console", lambda msg: print(msg))
        page.goto("http://localhost:3001/mas-leidos")
        expect(page).to_have_title(re.compile("Más leídos"))
        expect(page.get_by_role("heading", name="Más leídos", level=1)).to_be_visible()
        # Wait for the articles to load
        expect(page.locator('article')).to_have_count(10, timeout=60000)
        page.screenshot(path="jules-scratch/verification/02_mas_leidos_desktop.png")

        # Verify /mas-visto-ahora page
        page.goto("http://localhost:3001/mas-visto-ahora")
        expect(page).to_have_title(re.compile("Más visto ahora"))
        expect(page.get_by_role("heading", name="Más visto ahora", level=1)).to_be_visible()
        # Wait for the articles to load
        expect(page.locator('article')).to_have_count(10, timeout=30000)
        page.screenshot(path="jules-scratch/verification/03_mas_visto_ahora_desktop.png")

        # Verify desktop menu link
        desktop_menu_link = page.get_by_role('navigation').get_by_role('link', name='Más visto ahora')
        expect(desktop_menu_link).to_be_visible()
        page.screenshot(path="jules-scratch/verification/04_desktop_menu.png")

        browser.close()

if __name__ == "__main__":
    main()