import fs from "fs";
const content = fs.readFileSync("frontend/src/pages/CollegeDashboard.tsx", "utf-8");
const lines = content.split("\n");
let depth = 0;
lines.forEach((line, i) => {
  // Count literal '<div' that are NOT '</div'
  const opens = (line.match(/<div(?!\/)/g) || []).length;
  const closes = (line.match(/<\/div/g) || []).length;
  if (opens > 0 || closes > 0) {
    depth += opens - closes;
    console.log(`${i+1}: Depth: ${depth} | ${line.trim()}`);
  }
});
console.log("FINAL DEPTH:", depth);
