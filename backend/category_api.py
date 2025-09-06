from flask import Flask, request, jsonify, Response
import io

app = Flask(__name__)

categories = [
    {"id": 1, "name": "Books"},
    {"id": 2, "name": "Electronics"}
]

@app.route('/api/categories', methods=['GET'])
def get_categories():
    filter_text = request.args.get('filter', '').lower()
    result = [c for c in categories if filter_text in c['name'].lower()] if filter_text else categories
    return jsonify(result)

@app.route('/api/categories', methods=['POST'])
def add_category():
    data = request.json
    new_id = max((c['id'] for c in categories), default=0) + 1
    categories.append({"id": new_id, "name": data['name']})
    return jsonify({"message": "Added", "id": new_id})

@app.route('/api/categories/<int:id>', methods=['PUT'])
def edit_category(id):
    data = request.json
    for c in categories:
        if c['id'] == id:
            c['name'] = data['name']
            return jsonify({"message": "Edited"})
    return jsonify({"error": "Not found"}), 404

@app.route('/api/categories/<int:id>', methods=['DELETE'])
def delete_category(id):
    global categories
    categories = [c for c in categories if c['id'] != id]
    return jsonify({"message": "Deleted"})

@app.route('/api/categories/import', methods=['POST'])
def import_categories():
    file = request.files['file']
    content = file.read().decode()
    for line in content.strip().split('\n')[1:]:
        id_str, name = line.split(',', 1)
        categories.append({"id": int(id_str), "name": name})
    return jsonify({"message": "Imported"})

@app.route('/api/categories/export', methods=['GET'])
def export_categories():
    output = io.StringIO()
    output.write("id,name\n")
    for c in categories:
        output.write(f"{c['id']},{c['name']}\n")
    return Response(output.getvalue(), mimetype='text/csv')
