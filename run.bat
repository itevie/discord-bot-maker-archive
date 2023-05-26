@echo off

echo Deleting old build...^
 & rmdir build /s /q^
  & echo Compiling typescript...^
   & npx tsc^
    & echo Copying files to build folder...^
     & xcopy src\\view\\* build\\src\\view\\* /S /E /Y^
      & copy src\\icon.ico build\\src\\icon.ico^
       & echo Starting application...^
        & npx electron build\\src\\index.js^
         & echo Application quit!