from myapp import create_app, socketio

app = create_app()

def run_server():
    socketio.run(app, host='127.0.0.1', port=5000, debug=True, allow_unsafe_werkzeug=True)


if __name__ == "__main__":
    run_server()