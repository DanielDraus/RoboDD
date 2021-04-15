var ex_loops =
    ["*** Settings ***",
        "Library           String",
        "",
        "*** Test Cases ***",
        "For-Loop-In-Range",
        "    FOR    ${INDEX}    IN RANGE    1    3",
        "        Log    ${INDEX}",
        "        ${RANDOM_STRING}=    Generate Random String    ${INDEX}",
        "        Log    ${RANDOM_STRING}",
        "    END",
        "",
        "For-Loop-Elements",
        "    @{ITEMS}    Create List    Star Trek    Star Wars    Perry Rhodan",
        "    FOR    ${ELEMENT}    IN    @{ITEMS}",
        "        Log    ${ELEMENT}",
        "        ${ELEMENT}    Replace String    ${ELEMENT}    ${SPACE}    ${EMPTY}",
        "        Log    ${ELEMENT}",
        "    END",
        "",
        "For-Loop-Exiting",
        "    @{ITEMS}    Create List    Good Element 1    Break On Me    Good Element 2",
        "    FOR    ${ELEMENT}    IN    @{ITEMS}",
        "        Log    ${ELEMENT}",
        "        Run Keyword If    '${ELEMENT}' == 'Break On Me'    Exit For Loop",
        "        Log    Do more actions here ...",
        "    END",
        "",
        "Repeat-Action",
        "    Repeat Keyword    2    Log    Repeating this ...",
        ""].join('\n');

var ex_conditional = [
    "*** Test Cases ***",
    "Run-Keyword",
    "    ${MY_KEYWORD}=    Set Variable    Log",
    "    Run Keyword    ${MY_KEYWORD}    Test",
    "",
    "Run-Keyword-If",
    "    ${TYPE}=    Set Variable    V1",
    "    Run Keyword If    '${TYPE}' == 'V1'    Log     Testing Variant 1",
    "    Run Keyword If    '${TYPE}' == 'V2'    Log    Testing Variant 2",
    "    Run Keyword If    '${TYPE}' == 'V3'    Log    Testing Variant 3",
    "",
    "Run-Keyword-Ignore-Error",
    "    @{CAPTAINS}    Create List    Picard    Kirk    Archer",
    "    Run Keyword And Ignore Error    Should Be Empty    ${CAPTAINS}",
    "    Log    Reached this point despite of error",

].join('\n');

ex_string_lists = [
    "*** Settings ***",
    "Library           String",
    "Library           Collections",
    "",
    "*** Test Cases ***",
    "StringsAndLists",
    "    ${SOME_VALUE}=  Set Variable    Test Value",
    "    Log    ${SOME_VALUE}",
    "    @{WORDS}=    Split String    ${SOME_VALUE}    ${SPACE}",
    "    ${FIRST}=    Get From List    ${WORDS}    0",
    "    Log    ${FIRST}",

].join('\n')
ex_imports = [
    "*** Settings ***",
    "Library    OperatingSystem",
    "Library    robot.run",
    "Library    ${MY_LIB}",
    "Library    ${MY_LIB1}",
    "",
    "Library    PythonLibrary.py",
    "Library    /absolute/path/JavaLibrary.java",
    "Library    relative/path/PythonDirLib/    possible    arguments",
    "Library    ${RESOURCES}/Example.class",
    "",
    "Resource    example.resource",
    "Resource    ../data/resources.robot",
    "Resource    ${RESOURCES}/common.resource",
    "",
    "Variables    myvariables.py",
    "Variables    ../data/variables.py",
    "Variables    ${RESOURCES}/common.py",
    "Variables    taking_arguments.py    arg1    ${ARG2}",
    "",
    "",
    "*** Test Cases ***",
    "Example",
    "    Do Something",
    "    Import Library    MyLibrary    arg1    arg2",
    "    KW From MyLibrary",
    ""].join('\n')

ex_debug = [
    "*** Settings ***",
    "Library         DebugLibrary",
    "",
    "** test case **",
    "SOME TEST",
    "    # some keywords...",
    "    Debug",
    "    # some else...",
    "    ${count} =  Get Element Count  name:div_name",
    "    Debug If  ${count} < 1",
    ""].join('\n')

function show_examples() {
    var actual = document.getElementById("menu_ex").style.display
    if (actual == "block") {
        document.getElementById("menu_ex").style.display = "None";
    } else {
        document.getElementById("menu_ex").style.display = "block";
    }
}
