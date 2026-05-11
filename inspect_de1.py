import re

path = r'e:\LatexProjectManage\NextJsApp\public\assets\exams\TN THPT\DVD\De-OT-So-1.html'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

m = re.search(r'<div class="tf-inline">(.*?)</div>', content, re.DOTALL)
if m:
    with open('snippet_de1.txt', 'w', encoding='utf-8') as out:
        out.write(m.group(0))
    print("Match found.")
else:
    print("Not found.")
