// testAiRequest.js
const axios = require('axios');
const fs = require('fs');

(async () => {
  try {
    let base64Str = fs.readFileSync('base64test1.txt', 'utf8');
    base64Str = base64Str.replace(/\r?\n/g, '');
     if (!base64Str.startsWith("data:image/png;base64,")) {
      base64Str = "data:image/png;base64," + base64Str;
}
    const body = {
      prompt: "A futuristic portrait",
      photo: base64Str
    };

    const response = await axios.post('http://localhost:5002/generate', body);
    console.log(response.data);
  } catch (err) {
    console.error(err.message);
  }
})();
