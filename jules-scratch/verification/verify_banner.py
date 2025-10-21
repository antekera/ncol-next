from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:3000/mas-leidos")
        page.wait_for_selector('h1:has-text("Lo más leído")')
        page.screenshot(path="jules-scratch/verification/verification.png")
        browser.close()

run()
