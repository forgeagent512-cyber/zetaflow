"""
Agent Wrapper Server
=====================
Yeh script tumhare CLI-based coding agent (opencode ya jo bhi) ko
ek HTTP API mein convert kar deta hai, taake n8n usse baat kar sake.

SETUP:
1. pip install flask
2. Neeche 'CLI_COMMAND' ko apne actual agent ke command se replace karo
3. Chalao: python agent-wrapper-server.py
4. Server http://localhost:5000 par chalega

n8n WORKFLOW MEIN:
Workflow 20 ke "Coding Agent: Generate New Workflow" node ka URL badal do:
- Agar n8n Docker mein hai: http://host.docker.internal:5000/generate
- Agar n8n bhi laptop par direct hai: http://localhost:5000/generate
"""

from flask import Flask, request, jsonify
import subprocess
import shlex

app = Flask(__name__)

# ============================================
# PRIMARY: Gemini CLI (free tier, no credit card, 1000 req/day)
# ============================================
CLI_COMMAND_TEMPLATE = 'gemini -p {prompt} --output-format json'

# ============================================
# ALTERNATIVE: OpenCode (agar future mein second coding agent chahiye)
# ============================================
# Agar OpenCode bhi (advanced refactoring ke liye) add karna ho, upar wali line
# comment karo aur yeh uncomment karo:
# CLI_COMMAND_TEMPLATE = 'opencode run {prompt}'


@app.route('/generate', methods=['POST'])
def generate():
    """
    n8n se yeh endpoint call hoga.
    Input (n8n se): { "requirement_text": "client ki requirement yahan" }
    Output (n8n ko wapas): { "output": "agent ka poora response text" }
    """
    data = request.get_json()
    requirement_text = data.get('requirement_text', '')

    if not requirement_text:
        return jsonify({"error": "requirement_text missing"}), 400

    # Safely quote the prompt so shell special characters don't break the command
    safe_prompt = shlex.quote(requirement_text)
    command = CLI_COMMAND_TEMPLATE.format(prompt=safe_prompt)

    try:
        result = subprocess.run(
            command,
            shell=True,
            capture_output=True,
            text=True,
            timeout=120  # 2 minute timeout — agent ko itna time do response dene ke liye
        )

        if result.returncode != 0:
            return jsonify({
                "error": "Agent command failed",
                "stderr": result.stderr,
                "returncode": result.returncode
            }), 500

        return jsonify({
            "output": result.stdout.strip()
        })

    except subprocess.TimeoutExpired:
        return jsonify({"error": "Agent took too long to respond (timeout)"}), 504
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/health', methods=['GET'])
def health():
    """Quick check: server chal raha hai ya nahi (browser mein khol kar dekh sakte ho)"""
    return jsonify({"status": "running", "message": "Agent wrapper server is up"})


if __name__ == '__main__':
    print("=" * 50)
    print("Agent Wrapper Server starting...")
    print("Test URL: http://localhost:5000/health")
    print("Generate endpoint: http://localhost:5000/generate")
    print("=" * 50)
    app.run(host='0.0.0.0', port=5000, debug=True)
