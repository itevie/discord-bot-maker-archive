@echo off

REM Check if npm / node is installed
echo Checking if Node.JS is installed...
WHERE npm
IF %ERRORLEVEL% NEQ 0 ECHO Node.JS is not installed on this computer! Please download it at https://nodejs.org/en/download & exit /b 0
WHERE node
IF %ERRORLEVEL% NEQ 0 ECHO Node.JS is not installed on this computer! Please download it at https://nodejs.org/en/download & exit /b 0
echo Node.JS is installed

REM Install neccessary things
echo Executing npm install, this may take a while...
npm install^
 & echo Successfully set up Discord Bot Maker, compiling...^
  & run.bat