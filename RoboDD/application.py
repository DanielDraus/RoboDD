# -*- coding: utf-8 -*-
"""Flask Server module.

Used for robot framework online exercising.

:copyright: Nokia Networks
:author: Daniel Draus
:contact: daniel.draus@interia.pl
"""
import shutil
import robot
from flask import Flask, render_template, request, jsonify, session, send_file
from flask_socketio import SocketIO
import eventlet.wsgi
import tempfile, mmap, os, re
from datetime import datetime
from rflint.rflint import RfLint as rlint

error_list = []


def is_os_linux():
    if os.name == "nt":
        return False
    return True


# Configure Flask App
# Remember to change the SECRET_KEY!
application = Flask(__name__)
application.config['SECRET_KEY'] = 'RoboDD'
application.config['DEBUG'] = False
application.config['PORT'] = 80
application.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
socketio = SocketIO(application)


@application.route('/')
def index():
    """Display home page
        :return: index.html

        Initializes session variables for tracking time between running code.
    """
    session["count"] = 0
    session["time_now"] = datetime.now()
    return render_template("index.html")


@application.route('/check_code', methods=['POST'])
def check_code():
    """Run rflint on code and get output
        :return: JSON object of rflint errors
            {
                {
                    "code":...,
                    "error": ...,
                    "message": ...,
                    "line": ...,
                    "error_info": ...,
                }
                ...
            }

        For more customization, please look at library code:
        https://pypi.org/project/robotframework-lint/
    """
    # Session to handle multiple users at one time and to get textarea from AJAX call
    session["code"] = request.form['text']
    text = session["code"]
    output = evaluate_rflint(text)
    return jsonify(output)


@application.route('/clear')
def save_robot():
    return render_template("index.html")


@application.route('/logs/<log>')
def show_log(log):
    return application.send_file('/logs/{}'.format(log))


@application.route('/run_code', methods=['POST'])
def run_code():
    """Run robot code
        :return: JSON object
            {
                ...
            }
    """
    # Don't run too many times
    if slow():
        return jsonify(
            "Running code too much within a short time period."
            " Please wait a few seconds before clicking \"Run\" each time.")
    session["time_now"] = datetime.now()
    clean_logs()

    file_name = os.path.basename(session["file_name"])
    from robot.parsing.parser.parser import get_init_model
    try:
        # check if file is present
        fp = get_init_model(source=session["file_name"])
    except robot.errors.DataError:
        return jsonify(["Please add content.", ""])

    os.environ["MY_LIB1"] = session["file_name"]
    # run code
    with open("{}.log".format(session["file_name"]), 'w') as logFile:
        a = robot.run(session["file_name"],
                      log="./static/logs/{}.log.html".format(file_name),
                      report="./static/logs/{}.report.html".format(file_name),
                      output="./static/logs/{}.output.xml".format(file_name),
                      loglevel="TRACE:DEBUG",
                      stdout=logFile,
                      stderr=logFile,
                      logtitle="RoboDD",
                      console="verbose",
                      dryrun=True,
                      Variables=["MY_LIB", "rflint"])

    with open("{}.log".format(session["file_name"]), 'r') as logFile:
        content = logFile.readlines() #Output:
        to_out = []
        for x in range(len(content)):
            if content[x].startswith("Output:"):
                break
            else:
                to_out.append(content[x])

        return jsonify([to_out,
                        "<iframe id='logg' style='width=100%;height:100%;'"
                        " src='/static/logs/{}.log.html'</iframe>".format(file_name)])


def clean_logs():
    base = os.path.dirname(__file__)
    shutil.rmtree(os.path.join(base, "static", "logs"), ignore_errors=True)
    os.mkdir(os.path.join(base, "static", "logs"))


# Slow down if user clicks "Run" too many times
def slow():
    session["count"] += 1
    time = datetime.now() - session["time_now"]
    if float(session["count"]) / float(time.total_seconds()) > 5:
        return True
    return False


def evaluate_rflint(text):
    """Create temp file for robotframework-lint parsing on user code

    :param text: user code
    :return: dictionary of pylint errors:
        {
            {
                "code":...,
                "error": ...,
                "message": ...,
                "line": ...,
                "error_info": ...,
            }
            ...
        }
    """
    # Open temp file for specific session.
    # IF it doesn't exist (aka the key doesn't exist), create one

    try:
        session["file_name"]
        if os.path.exists(session["file_name"]):
            os.remove(session["file_name"])
        f = open(session["file_name"], "w")
        for t in text:
            f.write(t)
        f.flush()
    except KeyError as e:
        with tempfile.NamedTemporaryFile(delete=False) as temp:
            session["file_name"] = temp.name
            for t in text:
                temp.write(t.encode("utf-8"))
            temp.flush()

    try:
        error_list.clear()
        rlint_inst = rlint()
        rlint_inst.report = my_report
        rlint_inst.run((session["file_name"],))
        return error_list
    except Exception as e:
        raise Exception(e)


def my_report(linenumber, filename, severity, message, rulename, char):
    """override for rflint.report ."""
    error_list.append({
        "code": severity,
        "error": rulename,
        "message": message,
        "line": linenumber,
        "error_info": rulename,
    })


def remove_temp_code_file():
    try:
        os.remove(session["file_name"])
    except:
        pass


@socketio.on('disconnect', namespace='/check_disconnect')
def disconnect():
    """Remove temp file associated with current session"""
    remove_temp_code_file()


if __name__ == "__main__":
    """Initialize application"""
    socketio.run(application, port=80)


