if [ "$LJN_PRETTIER_STRATEGY" != "check" ]; then
  npx prettier "*/**/*.{js,jsx,ts,tsx,json,rc}" --write && git add . && git status
else
  npx prettier "*/**/*.{js,jsx,ts,tsx,json,rc}" --check
fi