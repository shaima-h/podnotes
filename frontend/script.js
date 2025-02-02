function redirectToSummary() {
    const url = document.getElementById("urlToSummarize").value;
    if (!url) {
        alert("Please enter a valid link.");
        return;
    }
    localStorage.setItem("urlToSummarize", url); // Save URL for next page
    window.location.href = "summary.html";
}

async function fetchSummary() {
    const url = localStorage.getItem("urlToSummarize");
    if (!url) {
        document.getElementById("summaryOutput").innerHTML = "No URL provided.";
        return;
    }

    try {
        const headers = {
            'Accept': 'application/json',
            'Content-Type':'application/json',
            'Access-Control-Allow-Origin':'*',
            'Access-Control-Allow-Methods':'POST,PATCH,OPTIONS'
        }

        const response = await fetch('http://127.0.0.1:8000/get_summary/', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ url: url })
        });

        const data = await response.json();

        document.getElementById("videoTitle").innerHTML = marked.parse(data.video_title  || "No title available.");

        // embed video player
        document.getElementById("videoPlayer").innerHTML = `
            <iframe width="560" height="315" 
                src="https://www.youtube.com/embed/${data.video_id}" 
                frameborder="0" allowfullscreen>
            </iframe>
        `;

        // display summary and download button
        document.getElementById("summaryOutput").innerHTML = marked.parse(data.summary  || "No summary available.");
        document.querySelector('.download_summary_btn').style.display = 'inline-block';

        localStorage.setItem("video_title", data.video_title);
        localStorage.setItem("summary", data.summary);

    } catch (error) {
        document.getElementById("summaryOutput").innerHTML = "Error generating summary. Please try again.";
        console.error(error);
    }
}

function downloadSummary() {
    const video_title = localStorage.getItem("video_title") || "Untitled Video";
    const summary = localStorage.getItem("summary");

    if (!summary) {
        alert("No summary available to download.");
        return;
    }

    // create a container for the content to be downloaded as PDF
    const content = document.createElement('div');
    content.style.fontFamily = 'Open Sans, sans-serif';  // TODO open sans, use the same font as the page

    // create the title and summary HTML structure
    const title = document.createElement('h1');
    title.textContent = video_title;
    content.appendChild(title);

    const summaryText = document.createElement('p');
    summaryText.innerHTML = marked.parse(summary);  // use innerHTML to preserve any HTML in the summary
    content.appendChild(summaryText);

    // set up options for html2pdf
    const options = {
        margin:       10,
        filename:     `${video_title}_intellinotes.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { dpi: 192, letterRendering: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // use html2pdf.js to convert the content to a PDF and download it
    html2pdf().from(content).set(options).save();
}


function goBack() {
    window.location.href = "index.html";
}
