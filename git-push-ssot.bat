@echo off
cd /d "%USERPROFILE%\Desktop\Well-being Survey"
git add js/project-ssot.js ORG_SURVEY_LINKS.md
git status --short
git commit -m "fix: canonicalize org_codes in SSOT (dhss, dop, opdc) + update survey links"
git push patchara main
echo === DONE ===
