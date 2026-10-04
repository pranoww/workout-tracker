const fs = require('fs');
const path = require('path');

const poseJsPath = path.join(__dirname, 'node_modules', '@mediapipe', 'pose', 'pose.js');

if (fs.existsSync(poseJsPath)) {
  let content = fs.readFileSync(poseJsPath, 'utf8');
  if (!content.includes('export class Pose')) {
    content += '\nexport class Pose {}\n';
    fs.writeFileSync(poseJsPath, content, 'utf8');
    console.log('Patched @mediapipe/pose/pose.js to add dummy export');
  } else {
    console.log('Already patched');
  }
} else {
  console.log('@mediapipe/pose not found');
}
