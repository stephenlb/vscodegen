// 
// What task should the GPT Model complete?
// 
const MODEL="gpt-3.5-turbo";
const INSTRUCTIONS = (language, code) => `
    ${code}
    Write ${language} comments that will appear above the code line.
    Write multi-line comments about the function parameters if it matters.
    Add a ${language} comment syntax at the end: PubNub ❤️ 
`.trim();

//
// API Key For OpenAI
// **Add your API Key to MY SECRETS (Left Panel)**
//
let OPENAI_API_KEY = null;
function getOpenaiApiKey() {
    // Use cached key
    if (OPENAI_API_KEY) {
        return new Promise(resolve => resolve(OPENAI_API_KEY));
    }
    // Fetch key from vault
    return vault.get("OPENAI_API_KEY").then(apikey => {
        OPENAI_API_KEY = apikey;
        return new Promise(resolve => resolve(OPENAI_API_KEY));
    });
}

//
// Import Modules
//
const xhr = require('xhr');
const vault = require('vault');

// 
// Main
// 
export default (request, response) => {
    // Parse JSON POST Body
    return request.json().then((message) => {
        // Get OpenAI API Key
        return getOpenaiApiKey().then(apiKey => {
            // Ask LLM AI Model to make perform INSTRUCTION
            return openAI(message.text, message.language, apiKey).then(aiResponse => {
                const comments = getCommentLines(aiResponse);
                // Send Result to User
                console.log("OPENAI TASK RESULT:", comments);
                return response.send(comments + "\n");
            });
        });
    }).catch((err) => {
        console.error(err);
        response.code = 500;
        return response.send("Server error try again.");
    });
};

//
// API Call to OpenAI asking the AI to run functions if it thinks it needs to
//
function openAI(code, language, apiKey) {
    const url = 'https://api.openai.com/v1/chat/completions';
    const msgs = [{
            "role": "system", "content": "Software engineer task completion", 

            "role": "user", "content": INSTRUCTIONS('javascript', "const channels = ['devices.12345.*', 'broadcast.*'];"),
            "role": "assistant", "content": "// Initialize an array of message subscription channels. \n// PubNub ❤️ ", 

            "role": "user", "content": INSTRUCTIONS('javascript', "function multiplication(a, b) { \nreturn a * b; \n};"),
            "role": "assistant", "content": "/**\n * @example\n * // returns 6\n * multiplication(2, 3);\n * @example\n * // returns -6\n * @param {number} a - a number to multiply\n * @param {number} b - a number to multiply\n * multiplication(-2, 3);\n */\n// PubNub ❤️ ",

            "role": "user", "content": INSTRUCTIONS('python', "def capture_geo(file='ip.csv', maxpoints=5000): last = +time.time() points = 0 ips = geo.load(file).splitlines() geojson = { 'type': 'FeatureCollection', 'features': [] } for ip in ips: cords = geo.lookup(ip) if not('geo_latitude' in cords): continue if last + 1 < time.time(): print('%d of %d' % (points, maxpoints)) last = time.time() geojson['features'].append({ 'type': 'Feature', 'geometry': { 'type': 'Point', 'coordinates': [ cords['geo_longitude'], cords['geo_latitude'] ] } }) points += 1 if points > maxpoints: break return geojson"),
            "role": "assistant", "content": "# Function to capture geographic information from IP addresses\n# Parameters:\n# - file: name of the CSV file containing IP addresses (default: 'ip.csv')\n# - maxpoints: maximum number of points to capture (default: 5000)\ndef capture_geo(file='ip.csv', maxpoints=5000):\n last = +time.time() # keep track of the last time\n points = 0 # keep track of the number of captured points\n ips = geo.load(file).splitlines() # load IP addresses from file\n geojson = { 'type': 'FeatureCollection', 'features': [] } # initialize a GeoJSON object\n \n # iterate over each IP address\n for ip in ips:\n cords = geo.lookup(ip) # lookup geographic coordinates for IP address\n \n # check if coordinates are available\n if not('geo_latitude' in cords):\n continue\n \n # print progress if needed\n if last + 1 < time.time():\n print('%d of %d' % (points, maxpoints))\n \n # add a new feature to the GeoJSON object\n geojson['features'].append({\n 'type': 'Feature',\n 'geometry': {\n 'type': 'Point',\n 'coordinates': [ cords['geo_longitude'], cords['geo_latitude'] ]\n }\n })\n \n # increment the number of captured points\n points += 1\n \n # break the loop if maximum number of points is reached\n if points > maxpoints:\n break\n \n return geojson # return the resulting GeoJSON object\n```\nNote: This code assumes the `geo` module is imported and that the `load` and `lookup` functions are defined within that module.\n# PubNub ❤️ ", 
            
            "role": "user", "content": INSTRUCTIONS(language, code),
        }];
    const http_options = {
        timeout : 10000,
        method : 'POST',
        headers : {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
         },
        body : JSON.stringify({
            "model": MODEL,
            "messages": msgs,
        }),
    };

    // Send API Request to OpenAI GPT Model
    return xhr.fetch(url, http_options)
        .then((resp) => JSON.parse(resp.body).choices[0].message.content)
        .catch((err) => new Promise((_, reject) => reject(err)));  
}
// 
// Captures only the code comments
// 
function getCommentLines(code) {
    // Regex to match single line and multi-line comments.
    let commentPattern = /(\/\*([^*]|[\r\n]|(\*+([^*\/]|[\r\n])))*\*+\/)|(\/\/.*)|(#.*)|(\'\'\'[\s\S]*?\'\'\')|(\"\"\"[\s\S]*?\"\"\")|(<!--.*-->)/g;
    
    // Get all comments.
    let comments = code.match(commentPattern) || [];

    return comments.join("\n");
}