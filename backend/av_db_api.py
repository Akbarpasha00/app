from flask import Flask, request, jsonify, Response
import io

app = Flask(__name__)

# In-memory AV database (audio/video entries)
av_db = [
    {"id": 1, "name": "Sample Audio", "type": "audio", "path": "/media/audio1.mp3", "category": "music"},
    {"id": 2, "name": "Sample Video", "type": "video", "path": "/media/video1.mp4", "category": "movie"}
]

@app.route('/api/avdb', methods=['GET'])
def get_av_db():
    filter_text = request.args.get('filter', '').lower()
    result = [entry for entry in av_db if filter_text in entry['name'].lower()] if filter_text else av_db
    return jsonify(result)

@app.route('/api/avdb', methods=['POST'])
def add_av_entry():
    data = request.json
    new_id = max((entry['id'] for entry in av_db), default=0) + 1
    av_db.append({"id": new_id, **data})
    return jsonify({"message": "Added", "id": new_id})

@app.route('/api/avdb/<int:id>', methods=['PUT'])
def edit_av_entry(id):
    data = request.json
    for entry in av_db:
        if entry['id'] == id:
            entry.update(data)
            return jsonify({"message": "Edited"})
    return jsonify({"error": "Not found"}), 404

@app.route('/api/avdb/<int:id>', methods=['DELETE'])
def delete_av_entry(id):
    global av_db
    av_db = [entry for entry in av_db if entry['id'] != id]
    return jsonify({"message": "Deleted"})

@app.route('/api/avdb/import', methods=['POST'])
def import_av_db():
    file = request.files['file']
    content = file.read().decode()
    for line in content.strip().split('\n')[1:]:
        id_str, name, type_, path, category = line.split(',', 4)
        av_db.append({"id": int(id_str), "name": name, "type": type_, "path": path, "category": category})
    return jsonify({"message": "Imported"})

@app.route('/api/avdb/export', methods=['GET'])
def export_av_db():
    output = io.StringIO()
    output.write("id,name,type,path,category\n")
    for entry in av_db:
        output.write(f"{entry['id']},{entry['name']},{entry['type']},{entry['path']},{entry['category']}\n")
    return Response(output.getvalue(), mimetype='text/csv')

if __name__ == "__main__":
    app.run(port=5000, debug=True)