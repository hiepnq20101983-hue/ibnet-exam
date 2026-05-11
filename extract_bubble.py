import re

with open(r'e:\LatexProjectManage\NextJsApp\public\assets\exams\testfile.html', 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r'<div class="tf-bubble-grid">.*?</div>.*?</div>'
m = re.search(pattern, content, re.DOTALL)

if m:
    with open('tf_bubble_extract.txt', 'w', encoding='utf-8') as out:
        out.write(m.group(0))
    print("Extracted bubble successful")
else:
    print("Bubble grid not found")
