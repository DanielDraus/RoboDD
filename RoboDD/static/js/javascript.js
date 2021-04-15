
$(document).ready(function() {
  //Pulls info from AJAX call and sends it off to codemirror's update linting
  //Has callback result_cb
  var socket = io.connect('http://' + document.domain + ':' + location.port + '/check_disconnect');
  var click_count = 0;
  function check_syntax(code, result_cb) {
    //Example error for guideline
    var error_list = [{
      line_no: null,
      column_no_start: null,
      column_no_stop: null,
      fragment: null,
      message: null,
      severity: null
    }];

    //Push and replace errors
    function check(data) {
      //Clear array.
      error_list = [{
        line_no: null,
        column_no_start: null,
        column_no_stop: null,
        fragment: null,
        message: null,
        severity: null
      }];
      document.getElementById('errorslist').innerHTML = '';
      //Check if pylint output is empty.
      if (data == null) {
        result_cb(error_list);
      } else {
        $('#errorslist').append("<tr>" + "<th>Line</th>" + "<th>Severity</th>" +
          "<th>Error</th>" + "<th>Tips</th>" +
          "<th>Error Code</th>" +
          "<th>Error Info</th>" + "</tr>");
        var data_length = 0;
        if (data != null) {
          data_length = Object.keys(data).length;
        }
        for (var x = 0; x < data_length; x += 1) {
          if (data[x] == null) {
            continue
          }
          number = data[x].line
          code = data[x].code
          codeinfo = data[x].error_info
          severity = code[0]
          moreinfo = data[x].message
          message = data[x].error

          //Set severity to necessary parameters
          if (severity == "E" || severity == "e") {
            severity = "error";
            severity_color = "red";
          } else if (severity == "W" || severity == "w") {
            severity = "warning";
            severity_color = "yellow";
          }
          //Push to error list
          error_list.push({
            line_no: number,
            column_no_start: null,
            column_no_stop: null,
            fragment: null,
            message: message,
            severity: severity
          });

          //Get help message for each id
          // var moreinfo = getHelp(id);
          //Append all data to table
          $('#errorslist').append("<tr>" + "<td>" + number + "</td>" +
            "<td style=\"background-color:" + severity_color + ";\"" +
            ">" + severity + "</td>" +
            "<td>" + message + "</td>" +
            "<td>" + moreinfo + "</td>" +
            "<td>" + code + "</td>" +
            "<td>" + codeinfo + "</td>" +
            "</tr>");
        }
        result_cb(error_list);
      }

    }
    //AJAX call to pylint
    $.post('/check_code', {
      text: code
    }, function(data) {
      current_text = data;
      check(current_text);
      return false;
    }, 'json');
  }

  var editor = CodeMirror.fromTextArea(document.getElementById("txt"), {
    mode: {
      name: "python",
      version: 3,
      singleLineStringErrors: false
    },
    lineNumbers: true,
    indentUnit: 4,
    extraKeys: {
            "Ctrl-Space": "autocomplete"
        },
    matchBrackets: true,
    lint: true,
    hint: true,
    styleActiveLine: true,
    theme: "dracula",
    gutters: ["CodeMirror-lint-markers"],
    lintWith: {
      "getAnnotations": CodeMirror.remoteValidator,
      "async": true,
      "check_cb": check_syntax
    },
  });

  // CodeMirror.commands.autocomplete = function (cm) {
  //       CodeMirror.simpleHint(cm, CodeMirror.pythonHint);
  //   }
  //Actually Run
  $("#run").click(function() {
    $.post('/run_code', {
      text: editor.getValue()
    }, function(data) {
      alert(data[0]);
      print_result(data);
      return false;
    }, 'json');

    function print_result(data) {
      document.getElementById('output').innerHTML = '';
      document.getElementById('output_log').innerHTML = '';

      $("#output_log").append("<pre id='output_log_pre'>" + data[1] + "</pre>");
      $("#output").append("<pre id='output_pre'>" + data[0].join() + "</pre>");
      if (data[0].join().includes("FAIL")){
        document.getElementById("run").style.backgroundColor = "red"
      } else {
        document.getElementById("run").style.backgroundColor = "green"
      }

    }
  });
  var exampleCode = function(id, text) {
    $(id).click(function(e) {
      editor.setValue(text);
      editor.focus(); // so that F5 works, hmm
    });
  };
  //exampleCode('#codeexample1', "*** Settings ***\nDocumentation    An example test suite documentation with *some* _formatting_.\n...              See test documentation for more documentation examples.\nLibrary           String\n\n\nTest Setup     Log  Test Setup  console=${TRUE}\nTest Teardown  Log  Test Teardown  console=${TRUE}\nForce Tags     OWNER-daniel.draus@nokia.com\n\n\n*** Variables ***\n${SCALAR}  hello world!\n${INT}  2\n\n*** Test Cases ***\nGeneral Structure Case\n    [Documentation]\n    ...  Some Docutemtation\n    ...  More documentation\n    Say hello\n    Passing values to keyword arguments  first_value  second_value\n    Passing values to keyword via name first_value second_value\n    ${returned_fraze_1}  Getting value from keyword\n    Log  Getting value from keyword:${returned_fraze_1}  console=${TRUE}\n    ${returned_fraze_2}  Adding to argument and returning it  some_value\n    Log  Adding to argument and returning it:${returned_fraze_2}  console=${TRUE}\n\n*** Keywords ***\nSay hello\n\t[Documentation]\n    ...  Some Docutemtation\n    ...  More documentation\n    Log  Hello World  console=${TRUE}\n\nPassing values to keyword arguments\n\t[Documentation]\n    ...  Some Docutemtation\n    ...  More documentation\n    [Arguments]  ${argument_1}  ${argument_2}=default_value\n    Log  Passing values to keyword arguments  console=${True}\n    Log  ${argument_1} ${argument_2}  console=${True}\n\nPassing values to keyword via name ${argument_1} ${argument_2}\n\t[Documentation]\n    ...  Some Docutemtation\n    ...  More documentation\n    Log  Passing values to keyword via name  console=${True}\n    Log  ${argument_1} ${argument_2}  console=${True}\n\nGetting value from keyword\n\t[Documentation]\n    ...  Some Docutemtation\n    ...  More documentation\n    Log    Getting\n    Log    some print\n    [Return]  This fraze will be returned and passed as value to variable\n\nAdding to argument and returning it\n\t[Documentation]\n    ...  Some Docutemtation\n    ...  More documentation\n    [Arguments]  ${argument}\n    Log    Adding\n    Log    some print\n    [Return]  This is value:${argument} and some stuff i added\n");
  //exampleCode('#codeexample2', "*** Settings ***\n\nTest Setup\nTest Teardown\nForce Tags        OWNER-daniel.draus.com\n\n*** Variables ***\n${SCALAR}  This is always seen as string\n@{LIST_1}    This  is  group  of  items  stack  on  each  other\n@{LIST_2}    Some  other  list\n@{LIST_OF_LIST}  ${LIST_1}  ${LIST_2}\n&{DICT_1}    this_key=that_value  lotnicza_12=West_Gate  kazimierza_43=Kino_NH\n&{DICT_2}    diff_key=good_job\n@{LIST_DICT}  &{DICT_1}  &{DICT_2}\n\n\n*** Test Cases ***\nChecking if hello world\n    [Documentation]\n    ...  Some Documentation\n    Scalars\n    Lists\n    Dictionaries\n\n*** Keywords ***\nScalars\n    Log  SCALAR:${SCALAR}  console=${True}\n\nLists\n    Log  LIST_1:${LIST_1}  console=${True}\n\nDictionaries\n    Log  DICT_1:${DICT_1}  console=${True}\n\nLogging building with location\n    [Documentation]\n    ...  Print out name of building located on kazimierza_43 from resources/data.robot ${LIST_DICT} variable\n    Log  ${\n}On kazimierza_43 is located: [PUT YOUR ANSWER HERE]  console=${TRUE}\n");
  exampleCode('#codeexample1', ex_loops)
  exampleCode('#codeexample2', ex_conditional)
  exampleCode('#codeexample3', ex_string_lists)
  exampleCode('#codeexample4', ex_imports)
  exampleCode('#codeexample5', ex_debug)
});
