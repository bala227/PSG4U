import requests
from bs4 import BeautifulSoup
import json

# Function to calculate CGPA
def calculate_cgpa(rankings):
    total_credits = 0
    total_points = 0

    for entry in rankings:
        if entry["Grade/Remark"] != "Completed" and entry["Credit"] != "0":
            credits = int(entry["Credit"])
            grade = entry["Grade/Remark"]
            # Convert grades to points
            if "A+" in grade:
                points = 9
            elif "A" in grade:
                points = 8
            elif "B+" in grade:
                points = 7
            elif "B" in grade:
                points = 6
            elif "C" in grade:
                points = 5
            elif "O" in grade:
                points = 10  # Assuming O is equivalent to A+ for CGPA
            else:
                points = 0  # Assume 0 for any other grade
            
            total_credits += credits
            total_points += points * credits
    
    # Calculate CGPA
    if total_credits > 0:
        cgpa = total_points / total_credits
    else:
        cgpa = 0
    
    return round(cgpa, 2)  # Round to 2 decimal places

# URL of the page to scrape
url = "http://localhost:5050"

# Send a GET request to the page
response = requests.get(url)

# Parse the HTML content
soup = BeautifulSoup(response.content, 'html.parser')

# Find the table containing the rankings
table = soup.find('table', class_='gradetable')

# Initialize a list to store the rankings
rankings = []

# Extract table headers
headers = [header.text.strip() for header in table.find_all('th')]
# Extract table rows
for row in table.find_all('tr')[1:]:  # Skip the header row
    cols = row.find_all('td')
    if cols:  # If there are any columns in the row
        rankings.append({headers[i]: cols[i].text.strip() for i in range(len(cols))})

# Calculate CGPA
cgpa = calculate_cgpa(rankings)

# Append CGPA to the rankings
rankings.append({"CGPA": cgpa})

# Convert the rankings to JSON
rankings_json = json.dumps(rankings, indent=4)

# Print the JSON output
print(rankings_json)
