import requests
import time
import os
from colorama import Fore, init

# Initialize colorama
init(autoreset=True)

# Clear terminal
os.system("cls" if os.name == "nt" else "clear")

# Header banner
print(Fore.YELLOW + "==============================================")
print(Fore.RED + "        FACEBOOK FAKE NEWS REPORT TOOL        ")
print(Fore.YELLOW + "==============================================\n")

print(Fore.GREEN + "Use this tool to ethically report war-related or fake news content.")
print("Do NOT use this to spam or harass individuals.\n")

# Get user input
fb_url = input(Fore.YELLOW + "[+] Enter Facebook post/profile URL to report: ").strip()
repeat_count = input(Fore.CYAN + "[+] How many times to report? (default 1): ").strip()
repeat_count = int(repeat_count) if repeat_count.isdigit() and int(repeat_count) > 0 else 1

delay = input(Fore.CYAN + "[+] Delay between reports in seconds (default 5s): ").strip()
delay = float(delay) if delay.replace(".", "").isdigit() else 5.0

# Facebook report endpoint (example, this URL may change over time)
url = 'https://m.facebook.com/help/contact/209046679279097'

# Data to submit (includes default fake news reason)
data = {
    'crt-url': fb_url,
    'cf_age': "less than 9 years",
    'submit': 'submit'
}

# Report loop
print(Fore.MAGENTA + f"\n[+] Starting report loop ({repeat_count}x every {delay}s)...\n")

success = 0
for i in range(repeat_count):
    try:
        response = requests.post(url, data=data)
        if response.status_code == 200:
            print(Fore.GREEN + f"[✓] Report {i+1} sent successfully.")
            success += 1
        else:
            print(Fore.RED + f"[✗] Report {i+1} failed. Status: {response.status_code}")
    except Exception as e:
        print(Fore.RED + f"[!] Error on report {i+1}: {e}")

    if i < repeat_count - 1:
        time.sleep(delay)

# Summary
print(Fore.BLUE + f"\n[✔] Reporting complete. {success}/{repeat_count} reports sent.")
print(Fore.GREEN + "Thanks for helping fight misinformation. 🌍")
