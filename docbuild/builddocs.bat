@ECHO OFF
rd /S /Q docs
java -jar ..\..\jsdoc-toolkit\jsrun.jar ..\..\jsdoc-toolkit\app\run.js -n -t=template -d=..\docs ..\woosh.js
PAUSE