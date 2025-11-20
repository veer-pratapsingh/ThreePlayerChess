@echo off
cd /d "%~dp0"
gradlew.bat :webapp:bootRun
pause