const path = require('path');
const fs = require("fs");
const fsp = fs.promises;
const JSON5 = require('json5');

async function createExamplesPage(){

	const content = await fsp.readFile("./examples/page.json", 'utf8');
	const settings = JSON5.parse(content);

	const files = await fsp.readdir("./examples");

	let unhandledCode = ``;
	let exampleCode = ``;

	// Build list of unhandled files (HTML files in examples folder not listed in settings.examples)
	{
		let urls = settings.examples.map(e => e.url);
		let unhandled = [];
		for(let file of files){
			let isHandled = false;
			for(let url of urls){
				if(file.indexOf(url) !== -1){
					isHandled = true;
					break;
				}
			}

			if(!isHandled){
				unhandled.push(file);
			}
		}
		unhandled = unhandled
			.filter(file => file.indexOf(".html") > 0)
			.filter(file => file !== "page.html");

		for(let file of unhandled){
			unhandledCode += `
				<a href="${file}" class="unhandled">${file}</a>
			`;
		}
	}

	// Build HTML for examples
	for(let example of settings.examples){
		exampleCode += `
		<a href="${example.url}" target="_blank" style="display: inline-block">
			<div class="thumb" style="background-image: url('${example.thumb}'); ">
				<div class="thumb-label">${example.label}</div>
			</div>
		</a>
		`;
	}

	// Build final HTML page with ONLY the examples section and unhandled files
	let page = `
		<html>
			<head>
			<style>

			body{
				background: #ECE9E9;
				padding: 30px;
			}

			.thumb{
				background-size: 140px 140px;
				width: 140px;
				height: 140px;
				border-radius: 5px;
				border: 1px solid black;
				box-shadow: 3px 3px 3px 0px #555;
				margin: 0px;
				float: left;
			}

			.thumb-label{
				font-size: large;
				text-align: center;
				font-weight: bold;
				color: #FFF;
				text-shadow:black 0 0 5px, black 0 0 5px, black 0 0 5px, black 0 0 5px, black 0 0 5px, black 0 0 5px;
				height: 100%;
			}

			.unhandled_container{
				max-width: 1200px;
				margin: auto;
				margin-top: 50px;
			}

			.unhandled{
				width: 30%;
				padding-top:8px;
				padding-bottom:8px;
				padding-left: 10px;
				float:left;
				font-family: "Helvetica Neue", "Lucida Grande", Arial;
				font-size: 13px;
				border: 1px solid rgba(0, 0, 0, 0);
			}

			.unhandled:hover{
				border: 1px solid rgba(200, 200, 200, 1);
				border-radius: 4px;
				background: white;
			}

			a{
				color: #555555;
			}

			h1{
				font-weight: 500;
				color: rgb(51, 51, 51);
				font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
			}

			#samples_container{
				max-width: 1300px;
				margin: auto;
				margin-top: 20px;
			}

			#thumb_container{
				max-width: 1200px;
				margin: auto;
			}

			</style>
			</head>
			<body>

				<div id="samples_container">

					<div id="thumb_container">
						<h1>Examples</h1>
						${exampleCode}
					</div>

				</div>

				<div class="unhandled_container">
					<h1>Other</h1>
					${unhandledCode}
				</div>

			</body>
		</html>
	`;

	fs.writeFile(`examples/page.html`, page, (err) => {
		if(err){
			console.log(err);
		}else{
			console.log(`created examples/page.html`);
		}
	});
}

exports.createExamplesPage = createExamplesPage;
