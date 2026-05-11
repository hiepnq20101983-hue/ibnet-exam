import os
import re
import glob

BASE_DIR = r'e:\LatexProjectManage\NextJsApp\public\assets\exams'

def migrate_file(filepath):
    print(f"Processing: {filepath}")
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    modified = False
    
    # 1. Migrate HTML: Replace <div class="tf-inline"> checkboxes with radios
    # Structure: <div class="tf-inline"><label class="tf-inline-item"><input type="checkbox" name="tf_13_0"> <span class="tf-letter">a)</span> Đúng</label>...</div>
    # We can just find all .tf-inline instances and reconstruct them.
    
    def replace_tf_inline(match):
        inner_html = match.group(1)
        # Find all the single checkboxes labels
        # e.g., <label class="tf-inline-item"><input type="checkbox" name="tf_13_0"> <span class="tf-letter">a)</span> Đúng</label>
        pattern = r'<label class="tf-inline-item"><input type="checkbox" name="([^"]+)">\s*<span class="tf-letter">([a-d])\)</span> Đúng</label>'
        items = re.findall(pattern, inner_html)
        if not items:
            return match.group(0) # didn't match expected format, don't break it.
            
        new_inner = ""
        for name, letter in items:
            new_inner += (
                f'<div class="tf-item-row" style="display:grid;grid-template-columns:30px 1fr 1fr;gap:10px;margin-bottom:8px;align-items:center;">'
                f'<span class="tf-letter" style="font-weight:bold;">{letter})</span>'
                f'<label class="tf-inline-item" style="padding:10px;justify-content:center;"><input type="radio" name="{name}" value="T"> Đúng</label>'
                f'<label class="tf-inline-item" style="padding:10px;justify-content:center;"><input type="radio" name="{name}" value="F"> Sai</label>'
                f'</div>'
            )
        return f'<div class="tf-grid-container" style="display:flex;flex-direction:column;margin-top:15px;">{new_inner}</div>'

    new_content = re.sub(r'<div class="tf-inline">(.*?)</div>', replace_tf_inline, content, flags=re.DOTALL)
    if new_content != content:
        content = new_content
        modified = True
        print(" -> HTML Patched.")

    # 2. Migrate Script logic
    # a) Patch readTF
    old_read_tf = """function readTF(qid, n) {
    var result = [];
    for (var i = 0; i < n; i++) {
        var cb = document.querySelector('input[name="tf_' + qid + '_' + i + '"]');
        if (cb) { result.push(!!cb.checked); continue; }"""
        
    new_read_tf = """function readTF(qid, n) {
    var result = [];
    for (var i = 0; i < n; i++) {
        var grp = 'tf_' + qid + '_' + i;
        var r = document.querySelector('input[name="' + grp + '"]:checked');
        if (r) {
            result.push(r.type === 'checkbox' ? !!r.checked : (r.value === 'T'));
            continue; 
        }"""
        
    if old_read_tf in content:
        content = content.replace(old_read_tf, new_read_tf)
        modified = True
        print(" -> Script: readTF patched.")
        
    # b) Patch submitExam TF visual loop logic
    old_submit_tf_loop = """        } else if (q.type === 'tf') {
            var answers = readTF(qid, q.items.length), nc = 0;
            for (var i = 0; i < q.items.length; i++) {
                var item = q.items[i], ua = answers[i];
                var cb = document.querySelector('input[name="tf_' + qid + '_' + i + '"]');
                if (cb) {
                    var wrap = cb.closest('.tf-inline-item');
                    if (wrap) { wrap.classList.remove('correct-mark','wrong-mark');
                        wrap.classList.add(!!cb.checked === !!item.correct ? 'correct-mark' : 'wrong-mark'); }
                }"""
                
    new_submit_tf_loop = """        } else if (q.type === 'tf') {
            var answers = readTF(qid, q.items.length), nc = 0;
            for (var i = 0; i < q.items.length; i++) {
                var item = q.items[i], ua = answers[i];
                var grp = 'tf_' + qid + '_' + i;
                each('input[name="' + grp + '"]', function(inputEl) {
                    var wrap = inputEl.closest('.tf-inline-item');
                    if (!wrap) return;
                    wrap.classList.remove('correct-mark', 'wrong-mark');
                    if (inputEl.type === 'checkbox') {
                        wrap.classList.add(!!inputEl.checked === !!item.correct ? 'correct-mark' : 'wrong-mark');
                    } else {
                        if ((inputEl.value === 'T') === !!item.correct) {
                            wrap.classList.add('correct-mark');
                        } else if (inputEl.checked) {
                            wrap.classList.add('wrong-mark');
                        }
                    }
                });"""
                
    if old_submit_tf_loop in content:
        content = content.replace(old_submit_tf_loop, new_submit_tf_loop)
        modified = True
        print(" -> Script: submitExam loop patched.")
        
    # c) Add radio event listeners for TF in window.onload
    old_onload_r = """each('input[type="radio"][name^="mcq_"]', function(r) { r.addEventListener('change', updateSubmitState); });"""
    new_onload_r = """each('input[type="radio"][name^="mcq_"]', function(r) { r.addEventListener('change', updateSubmitState); });
    each('input[type="radio"][name^="tf_"]', function(r) { r.addEventListener('change', updateSubmitState); });"""
    
    if old_onload_r in content and new_onload_r not in content:
        content = content.replace(old_onload_r, new_onload_r)
        modified = True
        print(" -> Script: Onload events patched.")

    if modified:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Done saved.\n")
    else:
        print("No modifications required.\n")
        
# Iterate through all html files
html_files = glob.glob(os.path.join(BASE_DIR, '**', '*.html'), recursive=True)
for fpath in html_files:
    migrate_file(fpath)

print("FINISHED MIGRATING ALL FILES.")
