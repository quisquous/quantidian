import os
import subprocess

def is_dirty():
    ret = subprocess.call(['git', 'diff-index', '--quiet', 'HEAD']);
    return ret != 0

def silent_call(cmd):
    with open(os.devnull, 'w') as fnull:
        subprocess.call(cmd, stdout=fnull, stderr=fnull)

def beautify_all_files():
    if (is_dirty()):
        print "Can't beautify with a dirty index."
        return

    path_to_script = os.path.dirname(os.path.realpath(__file__))
    beautify_js = os.path.join(path_to_script, 'beautify.js')

    child = subprocess.Popen(['git', 'ls-files'], stdout=subprocess.PIPE)
    for filename in child.stdout.readlines():
        filename = filename.strip()
        if filename.endswith('.js'):
            silent_call(['fixjsstyle', filename])
        silent_call(['node', beautify_js, filename])

    if (is_dirty()):
        print "Files have been beautified."

beautify_all_files()
