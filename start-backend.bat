@echo off
echo ========================================================
echo Starting Pune Walk-In Platform Backend...
echo ========================================================

set "JAVA_HOME=C:\Users\sahil\.antigravity-ide\extensions\redhat.java-1.56.0-win32-x64\jre\21.0.12.1-win32-x86_64"
set "PATH=%~dp0tools\apache-maven-3.9.9\bin;%JAVA_HOME%\bin;%PATH%"

cd /d "%~dp0backend"
call mvn spring-boot:run
