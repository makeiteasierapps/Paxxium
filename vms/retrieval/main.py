from flask import Flask, request, jsonify
import logging
from ragatouille import RAGPretrainedModel
app = Flask(__name__)

@app.route('/create_index', methods=['POST'])
def create_index():
    try:
        data = request.get_json()
        project_id = data.get('projectId')
        name = data.get('name')
        # Extract parameters from request
        index_prefix = f'{project_id}/ragatouille/'
        RAG = RAGPretrainedModel.from_pretrained(pretrained_model_name_or_path="colbert-ir/colbertv2.0", index_root=index_prefix)
        RAG.index(
            collection=['sample collection', 'sample collection', 'sample collection','sample collection', 'sample collection'],
            index_name=name,
            split_documents=False,
        )
        return jsonify({"message": "Index created successfully"})
    except KeyError as e:
        logging.error("Missing key in the request: %s", str(e))
        return jsonify({"error": f"Missing key in the request: {str(e)}"}), 400
    except Exception as e:
        logging.error("An error occurred: %s", str(e))
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

@app.route('/update_index', methods=['POST'])
def update_index():
    # Logic to update the index
    return jsonify({"message": "Index updated successfully"})

@app.route('/query_index', methods=['GET'])
def query_index():
    # Logic to query the index
    return jsonify({"results": []})

if __name__ == '__main__':
    app.run(debug=True)