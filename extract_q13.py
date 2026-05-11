import re

with open(r'e:\LatexProjectManage\NextJsApp\public\assets\exams\testfile.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract HTML block for q_13, making sure not to catch millions of characters in the capture
# by searching specifically for the start div and scanning forward until interactive part
pattern = r'(<div class="question" id="q_13">.*?)(<div class="q-interact.*?>.*?</div>)'
m = re.search(pattern, content, re.DOTALL)

if m:
    with open('q13_extract.txt', 'w', encoding='utf-8') as out:
        # Omit the image tag inner src to keep file small
        header = m.group(1)
        interact = m.group(2)
        clean_header = re.sub(r'src="data:image/[^"]+"', 'src="BASE64_TRUNCATED"', header)
        out.write(clean_header + "\n" + interact)
    print("Extracted successfully to q13_extract.txt")
else:
    print("Question 13 not found")
