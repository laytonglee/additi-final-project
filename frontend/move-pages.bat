@echo off
set APP=d:\ADDITI Academy\Personal Project\additi-final-project\frontend\app

REM Copy to public
robocopy "%APP%\projects" "%APP%\(public)\projects" /E /MOVE /R:0
robocopy "%APP%\profile" "%APP%\(public)\profile" /E /MOVE /R:0

REM Copy to dashboard
robocopy "%APP%\client" "%APP%\(dashboard)\client" /E /MOVE /R:0
robocopy "%APP%\freelancer" "%APP%\(dashboard)\freelancer" /E /MOVE /R:0
robocopy "%APP%\contracts" "%APP%\(dashboard)\contracts" /E /MOVE /R:0

REM Clean up empty source dirs
rd /s /q "%APP%\projects" 2>NUL
rd /s /q "%APP%\profile" 2>NUL
rd /s /q "%APP%\client" 2>NUL
rd /s /q "%APP%\freelancer" 2>NUL
rd /s /q "%APP%\contracts" 2>NUL

echo ROBOCOPY DONE
